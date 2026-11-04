/**
 * BestPack Solutions — Captura real de leads (RFQ)
 * Vercel Serverless Function: POST /api/lead
 *
 * Flujo: validar → GUARDAR en Supabase (respaldo) → enviar correo por Resend.
 * Éxito (200 {ok:true}) cuando el lead quedó guardado en Supabase O el correo
 * fue aceptado por Resend. Solo responde error (502/503) si fallan los dos:
 * el prospecto nunca debe perder su lead porque falló el correo.
 *
 * Variables de entorno (Vercel → Settings → Environment Variables):
 *   RESEND_API_KEY      — API key de resend.com
 *   LEAD_TO             — correo(s) destino, separados por coma
 *                         (default: contacto@bpsmx.com). Si está definido, se usa tal cual.
 *   LEAD_FROM           — remitente verificado (default: BestPack Web <onboarding@resend.dev>)
 *   SUPABASE_URL        — https://<ref>.supabase.co
 *   SUPABASE_KEY        — clave publishable/anon (solo puede INSERTAR en public.leads
 *                         y llamar web_lead_email_result; no puede leer ni borrar)
 *
 * email_status en Supabase: pending → sent | failed | not_configured
 */

const DIVISIONES = [
  "Tarimas de madera",
  "Cajas de cartón corrugado",
  "Almacenaje y logística 3PL",
  "Empaque retornable",
  "Consumibles industriales",
  "Otro / proyecto especial",
];

const MAX_ADJUNTO_B64 = 4 * 1024 * 1024; // ~3 MB reales
const DEFAULT_LEAD_TO = ["contacto@bpsmx.com"];
const rateBucket = globalThis.__bpRate || (globalThis.__bpRate = new Map());

function recipientsFrom(raw) {
  if (typeof raw !== "string") return [];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

function clean(v, max) {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max || 300);
}
function esc(v) {
  return String(v).replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]));
}
function row(k, v) {
  return v ? `<tr><td style="padding:6px 10px;color:#666;white-space:nowrap"><b>${k}</b></td><td style="padding:6px 10px">${esc(v)}</td></tr>` : "";
}
function orNull(v) {
  return v ? v : null;
}

/* ---------- Respaldo en Supabase ---------- */
function supabaseConfig() {
  const url = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
  const key = process.env.SUPABASE_KEY || "";
  return url && key ? { url, key } : null;
}

async function supabaseInsertLead(cfg, lead) {
  const r = await fetch(`${cfg.url}/rest/v1/leads`, {
    method: "POST",
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(lead),
  });
  if (!r.ok) {
    const detail = await r.text().catch(() => "");
    throw new Error(`supabase insert ${r.status} ${detail.slice(0, 300)}`);
  }
}

async function supabaseEmailResult(cfg, id, status, error, resendId) {
  try {
    const r = await fetch(`${cfg.url}/rest/v1/rpc/web_lead_email_result`, {
      method: "POST",
      headers: {
        apikey: cfg.key,
        Authorization: `Bearer ${cfg.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_id: id, p_status: status, p_error: error || null, p_resend_id: resendId || null }),
    });
    if (!r.ok) console.error("supabase rpc error", r.status, (await r.text().catch(() => "")).slice(0, 300));
  } catch (e) {
    console.error("supabase rpc error", e && e.message);
  }
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, code: "method_not_allowed" });
    return;
  }

  try {
    const b = req.body || {};

    // ---- Anti-spam ----
    if (clean(b.sitio, 50) !== "") { // honeypot
      res.status(200).json({ ok: true }); // no revelar al bot
      return;
    }
    const tsRender = parseInt(b.ts_render, 10) || 0;
    const tsDelta = Date.now() - tsRender; // negativo = reloj del cliente adelantado: no es un bot
    if (tsRender && tsDelta >= 0 && tsDelta < 3000) {
      res.status(429).json({ ok: false, code: "too_fast" });
      return;
    }
    const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "?";
    const now = Date.now();
    const hits = (rateBucket.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
    if (hits.length >= 5) {
      res.status(429).json({ ok: false, code: "rate_limited" });
      return;
    }
    hits.push(now);
    rateBucket.set(ip, hits);

    // ---- Validación servidor ----
    const nombre = clean(b.nombre, 120);
    const email = clean(b.email, 160);
    const division = clean(b.division, 60);
    const mensaje = clean(b.mensaje, 4000);
    const errores = [];
    if (nombre.length < 2) errores.push("nombre");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errores.push("email"); // opcional
    if (division && !DIVISIONES.includes(division)) errores.push("division"); // opcional
    if (mensaje.length < 10) errores.push("mensaje");
    if (b.consent !== true) errores.push("consent");
    if (errores.length) {
      res.status(422).json({ ok: false, code: "validation", fields: errores });
      return;
    }

    const datos = {
      empresa: clean(b.empresa, 160),
      puesto: clean(b.puesto, 120),
      telefono: clean(b.telefono, 40),
      ciudad: clean(b.ciudad, 160),
      producto: clean(b.producto, 200),
      volumen: clean(b.volumen, 120),
      frecuencia: clean(b.frecuencia, 120),
      fecha_requerida: clean(b.fecha_requerida, 40),
    };
    // Campos adicionales (p.ej. formulario farmacéutico)
    const extras = {};
    if (b.extras && typeof b.extras === "object") {
      Object.keys(b.extras).slice(0, 20).forEach((k) => {
        const v = clean(String(b.extras[k]), 200);
        if (v) extras[clean(k, 40)] = v;
      });
    }
    const REG_RX = /primario|contacto directo|fr[ií]a|temperatura controlada|controlad[oa]s?|GMP|GDP|COFEPRIS|est[eé]ril|medicamento/i;
    const requiereValidacion = Object.values(extras).some((v) => REG_RX.test(v));

    const meta = b.meta || {};
    const metaClean = {
      url_origen: clean(meta.url, 300),
      landing: clean(meta.landing, 300),
      referrer: clean(meta.referrer, 300),
      utm_source: clean(meta.utm_source, 120),
      utm_medium: clean(meta.utm_medium, 120),
      utm_campaign: clean(meta.utm_campaign, 160),
      utm_term: clean(meta.utm_term, 160),
      utm_content: clean(meta.utm_content, 160),
      gclid: clean(meta.gclid, 200),
    };

    // ---- Adjunto opcional ----
    let attachments;
    if (b.adjunto && typeof b.adjunto.base64 === "string" && b.adjunto.base64.length > 0) {
      if (b.adjunto.base64.length > MAX_ADJUNTO_B64) {
        res.status(413).json({ ok: false, code: "file_too_large" });
        return;
      }
      attachments = [{
        filename: clean(b.adjunto.nombre, 140) || "adjunto",
        content: b.adjunto.base64,
      }];
    }

    // ---- 1) Respaldo: guardar el lead ANTES de intentar el correo ----
    const leadId = (globalThis.crypto && globalThis.crypto.randomUUID)
      ? globalThis.crypto.randomUUID()
      : require("crypto").randomUUID();
    const sb = supabaseConfig();
    let saved = false;
    if (sb) {
      try {
        await supabaseInsertLead(sb, {
          id: leadId,
          nombre,
          email: orNull(email),
          telefono: orNull(datos.telefono),
          empresa: orNull(datos.empresa),
          puesto: orNull(datos.puesto),
          ciudad: orNull(datos.ciudad),
          division: orNull(division),
          producto: orNull(datos.producto),
          volumen: orNull(datos.volumen),
          frecuencia: orNull(datos.frecuencia),
          fecha_requerida: orNull(datos.fecha_requerida),
          mensaje,
          extras: Object.keys(extras).length ? extras : null,
          requiere_validacion: requiereValidacion,
          origen: Object.values(metaClean).some(Boolean) ? metaClean : null,
          adjunto_nombre: attachments ? attachments[0].filename : null,
          ip,
          email_status: "pending",
        });
        saved = true;
      } catch (e) {
        console.error("supabase insert error", e && e.message);
      }
    } else {
      console.error("supabase not configured (SUPABASE_URL / SUPABASE_KEY)");
    }

    // ---- 2) Correo ----
    const KEY = process.env.RESEND_API_KEY;
    if (!KEY) {
      console.error("resend not configured (RESEND_API_KEY)");
      if (saved) {
        await supabaseEmailResult(sb, leadId, "not_configured", "RESEND_API_KEY ausente");
        res.status(200).json({ ok: true, lead_id: leadId, email: "not_configured" });
      } else {
        res.status(503).json({ ok: false, code: "not_configured" });
      }
      return;
    }
    const configuredTo = recipientsFrom(process.env.LEAD_TO);
    const TO = configuredTo.length ? configuredTo : DEFAULT_LEAD_TO.slice();
    const FROM = process.env.LEAD_FROM || "BestPack Web <onboarding@resend.dev>";

    const html = `
      <h2 style="font-family:Arial,sans-serif">Nueva solicitud de cotización (RFQ) — sitio web</h2>
      <table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse;background:#fafafa;border:1px solid #eee">
        ${row("División", division)}
        ${row("Nombre", nombre)}
        ${row("Empresa", datos.empresa)}
        ${row("Puesto", datos.puesto)}
        ${row("Correo", email)}
        ${row("Teléfono", datos.telefono)}
        ${row("Ciudad / planta destino", datos.ciudad)}
        ${row("Producto", datos.producto)}
        ${row("Volumen", datos.volumen)}
        ${row("Frecuencia", datos.frecuencia)}
        ${row("Fecha requerida", datos.fecha_requerida)}
      </table>
      <h3 style="font-family:Arial,sans-serif">Proyecto</h3>
      <p style="font-family:Arial,sans-serif;font-size:14px;white-space:pre-wrap">${esc(mensaje)}</p>
      ${Object.keys(extras).length ? `<h3 style="font-family:Arial,sans-serif">Datos del requerimiento (formulario especializado)</h3>${requiereValidacion ? '<p style="font-family:Arial,sans-serif;color:#b00020"><b>⚠ Este requerimiento incluye condiciones regulatorias o de contacto directo: evaluar individualmente antes de cotizar.</b></p>' : ""}<table style="font-family:Arial,sans-serif;font-size:13px;border-collapse:collapse">${Object.entries(extras).map(([k,v])=>row(k,v)).join("")}</table>` : ""}
      <h3 style="font-family:Arial,sans-serif">Origen</h3>
      <table style="font-family:Arial,sans-serif;font-size:12px;color:#555;border-collapse:collapse">
        ${row("Página", metaClean.url_origen)}
        ${row("Landing", metaClean.landing)}
        ${row("Referrer", metaClean.referrer)}
        ${row("utm_source", metaClean.utm_source)}
        ${row("utm_medium", metaClean.utm_medium)}
        ${row("utm_campaign", metaClean.utm_campaign)}
        ${row("utm_term", metaClean.utm_term)}
        ${row("utm_content", metaClean.utm_content)}
        ${row("gclid", metaClean.gclid)}
        ${row("ID respaldo", saved ? leadId : "")}
      </table>`;

    const payload = {
      from: FROM,
      to: TO,
      subject: `${requiereValidacion ? "[REQUIERE VALIDACIÓN REGULATORIA] " : ""}[RFQ web]${extras.industria ? " " + extras.industria + " —" : ""} ${division || "Sin división"} — ${datos.empresa || nombre}`,
      html,
    };
    if (email) payload.reply_to = email;
    if (attachments) payload.attachments = attachments;

    let sent = false;
    let sendError = "";
    let resendId = "";
    try {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await r.text().catch(() => "");
      if (r.ok) {
        sent = true;
        try { resendId = JSON.parse(text).id || ""; } catch (e) {}
      } else {
        // Log completo: status + cuerpo del error de Resend (403 dominio, 401 clave, 429 cuota, 422 payload…)
        sendError = `Resend ${r.status} ${text.slice(0, 600)}`;
        console.error("Resend error", r.status, "from=", FROM, "to=", TO.join(","), text.slice(0, 600));
      }
    } catch (e) {
      sendError = `Resend fetch: ${e && e.message}`;
      console.error("Resend fetch error", e && e.message);
    }

    if (saved) {
      await supabaseEmailResult(sb, leadId, sent ? "sent" : "failed", sent ? null : sendError, resendId);
    }

    if (sent || saved) {
      res.status(200).json({ ok: true, lead_id: saved ? leadId : undefined, email: sent ? "sent" : "failed" });
      return;
    }
    res.status(502).json({ ok: false, code: "send_failed" });
  } catch (e) {
    console.error("lead error", e && e.message);
    res.status(500).json({ ok: false, code: "server_error" });
  }
};
