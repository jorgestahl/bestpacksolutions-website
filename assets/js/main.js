/* ============================================================
   BestPack Solutions — Interacciones
   v2: captura real de leads (/api/lead), atribución UTM/GCLID
   y eventos GA4 por división. WhatsApp queda como secundario.
   ============================================================ */
(function () {
  "use strict";

  var WA_NUMBER = "524448290377";

  /* ---------- División por página ---------- */
  var DIV_EXACT = {
    "/cajas-de-carton-corrugado": "Cajas de cartón corrugado",
    "/logistica-3pl": "Almacenaje y logística 3PL",
    "/empaque-retornable": "Empaque retornable",
    "/consumibles-industriales": "Consumibles industriales"
  };
  var DIV_SLUG = {
    madera: "Tarimas de madera",
    carton: "Cajas de cartón corrugado",
    "3pl": "Almacenaje y logística 3PL",
    retornable: "Empaque retornable",
    consumibles: "Consumibles industriales",
    otro: "Otro / proyecto especial"
  };
  function pageDivision(path) {
    path = path || location.pathname.replace(/\/$/, "") || "/";
    if (DIV_EXACT[path]) return DIV_EXACT[path];
    if (/^\/(tarimas|fabricantes-de-tarimas|huacales|embalajes|industria-automotriz)/.test(path)) return "Tarimas de madera";
    return "";
  }
  function track(name, params) {
    if (typeof window.gtag === "function") {
      var p = params || {};
      p.page_path = location.pathname;
      window.gtag("event", name, p);
    }
  }

  /* ---------- Atribución (first-touch + actual) ---------- */
  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid"];
  function readParams(qs) {
    var out = {}, sp = new URLSearchParams(qs || location.search);
    UTM_KEYS.forEach(function (k) { var v = sp.get(k); if (v) out[k] = v; });
    return out;
  }
  (function storeAttribution() {
    try {
      var cur = readParams();
      if (Object.keys(cur).length) {
        cur.landing = location.pathname + location.search;
        cur.ts = Date.now();
        if (!localStorage.getItem("bp_attrib")) localStorage.setItem("bp_attrib", JSON.stringify(cur));
        localStorage.setItem("bp_attrib_last", JSON.stringify(cur));
      }
      var d = pageDivision();
      if (d) sessionStorage.setItem("bp_div", d);
    } catch (e) { /* storage no disponible */ }
  })();
  function getAttribution() {
    var first = {};
    try { first = JSON.parse(localStorage.getItem("bp_attrib") || "{}"); } catch (e) {}
    var cur = readParams();
    var meta = {
      url: location.href,
      referrer: document.referrer || "",
      landing: first.landing || (location.pathname + location.search)
    };
    UTM_KEYS.forEach(function (k) { meta[k] = cur[k] || first[k] || ""; });
    return meta;
  }

  /* ---------- Header sticky ---------- */
  var header = document.getElementById("header");
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 24) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Menú móvil ---------- */
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll(".nav-links a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Dropdown "Soluciones" ---------- */
  document.querySelectorAll(".nav-dd-toggle").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var dd = btn.parentElement;
      var open = dd.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });
  document.addEventListener("click", function (e) {
    document.querySelectorAll(".nav-dd.open").forEach(function (dd) {
      if (!dd.contains(e.target)) {
        dd.classList.remove("open");
        var b = dd.querySelector(".nav-dd-toggle");
        if (b) b.setAttribute("aria-expanded", "false");
      }
    });
  });

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Contadores animados ---------- */
  function formatNumber(n, withComma) {
    return withComma ? n.toLocaleString("es-MX") : String(n);
  }
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var withComma = el.getAttribute("data-format") === "comma";
    var dur = 1600, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatNumber(Math.floor(eased * target), withComma);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = formatNumber(target, withComma);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); co.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { co.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = el.getAttribute("data-count"); });
  }

  /* ---------- FAQ: cerrar las demás al abrir una ---------- */
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (item.open) {
        faqItems.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  /* ---------- Eventos GA4 globales (clics de contacto) ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a[href]") : null;
    if (!a) return;
    var h = a.getAttribute("href") || "";
    var div = pageDivision() || (sessionStorage.getItem("bp_div") || "");
    if (h.indexOf("wa.me") > -1) track("whatsapp_click", { division: div, link_url: h });
    else if (h.indexOf("tel:") === 0) track("call_click", { division: div });
    else if (h.indexOf("mailto:") === 0) track("email_click", { division: div });
    if (/visita técnica/i.test(a.textContent || "")) track("technical_visit_requested", { division: div });
  }, true);

  /* ---------- Formulario → /api/lead (captura real) ---------- */
  var form = document.getElementById("cotizaForm");
  if (form) {
    var msgOk = document.getElementById("formMsg");
    var msgErr = document.getElementById("formErr");
    var waFallback = document.getElementById("waFallback");
    var btnSubmit = form.querySelector('button[type="submit"]');
    var tsField = document.getElementById("ts_render");
    if (tsField) tsField.value = String(Date.now());

    // Preselección de división: ?division=slug o navegación interna
    try {
      var slug = new URLSearchParams(location.search).get("division");
      var divName = (slug && DIV_SLUG[slug]) || sessionStorage.getItem("bp_div") || "";
      var selDiv = document.getElementById("division");
      if (divName && selDiv) {
        for (var i = 0; i < selDiv.options.length; i++) {
          if (selDiv.options[i].value === divName) { selDiv.selectedIndex = i; break; }
        }
      }
    } catch (e) {}

    // quote_started: primera interacción
    var started = false;
    form.addEventListener("input", function () {
      if (!started) { started = true; track("quote_started", { division: currentDivision() }); }
    });

    function currentDivision() {
      var s = document.getElementById("division");
      return s ? s.value : "";
    }

    // drawing_uploaded
    var fileInput = document.getElementById("adjunto");
    if (fileInput) {
      fileInput.addEventListener("change", function () {
        var f = fileInput.files && fileInput.files[0];
        if (!f) return;
        if (f.size > 3 * 1024 * 1024) {
          showError("El archivo supera 3 MB. Comprímelo o envíalo después por correo/WhatsApp; tu solicitud puede enviarse sin adjunto.");
          fileInput.value = "";
          return;
        }
        hideMessages();
        track("drawing_uploaded", { division: currentDivision(), file_ext: (f.name.split(".").pop() || "").toLowerCase() });
      });
    }

    function showError(text) {
      if (msgErr) { msgErr.textContent = text; msgErr.style.display = "block"; msgErr.scrollIntoView({ behavior: "smooth", block: "center" }); }
    }
    function hideMessages() {
      if (msgErr) msgErr.style.display = "none";
      if (msgOk) msgOk.style.display = "none";
      if (waFallback) waFallback.style.display = "none";
    }
    function v(id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; }

    function buildWaText() {
      return encodeURIComponent(
        "Solicitud de cotización BestPack\n" +
        "Nombre: " + v("nombre") + "\n" +
        "Empresa: " + (v("empresa") || "—") + "\n" +
        "División: " + currentDivision() + "\n" +
        "Producto: " + (v("producto") || "—") + "\n" +
        "Volumen: " + (v("volumen") || "—") + "\n" +
        "Ciudad/planta: " + (v("ciudad") || "—") + "\n" +
        "Detalle: " + v("mensaje")
      );
    }

    function readFileB64(file) {
      return new Promise(function (resolve, reject) {
        if (!file) { resolve(null); return; }
        var r = new FileReader();
        r.onload = function () {
          var s = String(r.result || "");
          resolve({ nombre: file.name, tipo: file.type, base64: s.indexOf(",") > -1 ? s.split(",")[1] : s });
        };
        r.onerror = reject;
        r.readAsDataURL(file);
      });
    }

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      hideMessages();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var consent = document.getElementById("consent");
      if (consent && !consent.checked) {
        showError("Para enviarte la cotización necesitamos tu consentimiento sobre el aviso de privacidad.");
        return;
      }
      if (btnSubmit) { btnSubmit.disabled = true; btnSubmit.textContent = "Enviando…"; }

      var file = fileInput && fileInput.files ? fileInput.files[0] : null;
      readFileB64(file).then(function (adjunto) {
        var payload = {
          nombre: v("nombre"), empresa: v("empresa"), puesto: v("puesto"),
          email: v("email"), telefono: v("telefono"), ciudad: v("ciudad"),
          division: currentDivision(), producto: v("producto"),
          volumen: v("volumen"), frecuencia: v("frecuencia"),
          fecha_requerida: v("fecha_requerida"), mensaje: v("mensaje"),
          consent: !!(consent && consent.checked),
          sitio: v("sitio"),
          ts_render: tsField ? tsField.value : "",
          meta: getAttribution()
        };
        var extras = {};
        document.querySelectorAll('[data-lead-extra]').forEach(function (el) {
          if (el.id && el.value && String(el.value).trim()) extras[el.id] = String(el.value).trim().slice(0, 200);
        });
        if (Object.keys(extras).length) payload.extras = extras;
        if (adjunto) payload.adjunto = adjunto;
        return fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }).then(function (r) {
        return r.json().then(function (j) { return { status: r.status, body: j }; });
      }).then(function (res) {
        if (res.body && res.body.ok) {
          track("generate_lead", { division: currentDivision(), method: "form" });
          try { sessionStorage.setItem("bp_lead_ok", "1"); } catch (e) {}
          setTimeout(function () { location.href = "/gracias-cotizacion"; }, 250);
          return;
        }
        var code = res.body && res.body.code;
        if (code === "not_configured" || code === "send_failed" || code === "server_error") {
          showError("No pudimos registrar tu solicitud en este momento. Tus datos siguen aquí: envíanosla por WhatsApp con un clic, o llámanos al 444 829 0377.");
          if (waFallback) {
            waFallback.href = "https://wa.me/" + WA_NUMBER + "?text=" + buildWaText();
            waFallback.style.display = "inline-flex";
          }
        } else if (code === "validation") {
          showError("Revisa los campos marcados: nombre, correo, división y descripción del proyecto son necesarios.");
        } else if (code === "file_too_large") {
          showError("El archivo supera el límite de 3 MB. Quítalo o comprímelo e intenta de nuevo.");
        } else if (code === "rate_limited" || code === "too_fast") {
          showError("Detectamos demasiados envíos seguidos. Espera un momento e intenta otra vez, o escríbenos por WhatsApp.");
          if (waFallback) {
            waFallback.href = "https://wa.me/" + WA_NUMBER + "?text=" + buildWaText();
            waFallback.style.display = "inline-flex";
          }
        } else {
          showError("Ocurrió un error inesperado. Intenta de nuevo o contáctanos por WhatsApp o al 444 829 0377.");
        }
      }).catch(function () {
        showError("Sin conexión con el servidor. Tus datos siguen aquí: intenta de nuevo o envíanos la solicitud por WhatsApp.");
        if (waFallback) {
          waFallback.href = "https://wa.me/" + WA_NUMBER + "?text=" + buildWaText();
          waFallback.style.display = "inline-flex";
        }
      }).finally(function () {
        if (btnSubmit) { btnSubmit.disabled = false; btnSubmit.textContent = "Enviar cotización"; }
      });
    });
  }

  /* ---------- Video hero: cargar solo en escritorio con buena conexión ---------- */
  var heroVideo = document.querySelector(".hero-media video");
  if (heroVideo) {
    var vSources = heroVideo.querySelectorAll("source[data-src]");
    var conn = navigator.connection || {};
    var goodConn = !conn.saveData && conn.effectiveType !== "slow-2g" && conn.effectiveType !== "2g" && conn.effectiveType !== "3g";
    if (vSources.length && window.innerWidth >= 1024 && goodConn) {
      vSources.forEach(function (sEl) { sEl.src = sEl.getAttribute("data-src"); });
      heroVideo.load();
      var pp = heroVideo.play();
      if (pp && pp.catch) pp.catch(function () {});
    }
  }

  /* ---------- Año en footer ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
