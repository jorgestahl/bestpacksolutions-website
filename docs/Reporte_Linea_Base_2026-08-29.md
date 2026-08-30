# Línea base SEO/CRO — bestpack.com.mx
**Fecha:** 29 de agosto de 2026 · **Auditor:** Claude (Director Estratégico Integral) · **Alcance:** 41 URLs públicas + DOM en vivo + infraestructura

---

## 1. Resumen ejecutivo

El sitio está técnicamente sano en lo básico (41/41 URLs responden 200, canonicals correctos, HTTPS + redirección www OK, Brotli, TTFB 381 ms, hosting **Vercel**), pero tiene **tres fallas de fondo**: (1) el formulario **no captura leads** — solo arma un mensaje y abre WhatsApp, sin backend, sin página de gracias y sin medición; (2) publica **datos operativos incorrectos o no aprobados** (Saltillo como "planta productiva", 170K/mes vs los 150K reales y 350K de capacidad instalada, "4 tintas" en cartón cuando la capacidad actual es 2, europalet mal dimensionado); y (3) el rendimiento móvil está lastrado por un **video de 12.5 MB solo MP4**, 105 bloques de contenido que inician ocultos (opacity:0) y 15/15 imágenes lazy incluidas las del primer pantallazo.

**No tengo acceso al repositorio.** El sitio corre en Vercel (lo que hace 100% viable el backend serverless del formulario), pero el código fuente no está en la carpeta del proyecto. Sin repo no puedo crear rama, implementar ni desplegar. Ver sección 6.

## 2. Verificación de la auditoría previa

| Dato previo | Verificado hoy |
|---|---|
| ~41 URLs indexables | ✅ 41 exactas en sitemap, todas 200 e indexables |
| Video ~13 MB | ✅ 12.5 MB (corporativo-bestpack-2026.mp4, solo MP4, autoplay, preload=none, caché 30 días) |
| Móvil ~73, FCP ~3s, LCP ~5s | ✅ **Móvil 72** (FCP 3.0s, LCP 5.0s, TBT 110ms, CLS 0, SI 4.9s) · Escritorio 97 (LCP 1.2s) · Accesibilidad 95 · Buenas prácticas 100 · SEO 100 — pagespeed.web.dev, 29-ago-2026 |

## 3. Hallazgos principales (detalle en Excel adjunto)

**Precisión de datos (P0):** "2 plantas productivas SLP · Saltillo" (home) y "planta propia Saltillo" (/tarimas-saltillo, /tarimas-monterrey) — Saltillo es bodega. Cifras 170,000/mes y +2M/año repartidas en 19+ páginas — lo aprobado es producción ~150K/mes y capacidad instalada hasta 350K/mes, expresadas con esa distinción. "4 tintas" en cartón (meta + 5 menciones) — capacidad actual: 2 tintas. Europalet "1.0 × 1.2 m" en /tarimas-para-exportacion (EPAL = 800×1,200 mm; los blogs lo dicen bien → contradicción interna). Capacidades de carga contradictorias entre páginas. "32 estados atendidos" y "2 millones de tarimas anuales" — por confirmar cómo se expresan.

**Mensajes internos expuestos (P0):** badge "Mayor crecimiento" (División 03, home), "Nueva línea" e "ingreso recurrente" (/logistica-3pl).

**Conversión (P0):** un solo formulario (home) con 6 campos, sin action/backend, éxito declarado al abrir WhatsApp, sin honeypot, sin UTM/GCLID, sin adjuntos, sin preselección por división, sin /gracias-cotizacion (404), sin página 404 personalizada.

**Medición (P0):** solo gtag GA4 básico (un ID G-RR***), dataLayer de 4 entradas, cero eventos de negocio, sin etiqueta de Google Ads.

**SEO (P1):** 37/41 metas >165c; 11 titles >70c; canibalización home↔tarimas-slp (keyword), home↔fabricantes-de-tarimas (H1), Logistik↔Villa de Reyes, Eje140/WTC/Tres Naciones; 6 ciudades con title plantilla y ~60% de contenido compartido; "fabricante en Querétaro/Guadalajara…" cuando se entrega desde SLP; 3 páginas sin acentos; blog sin fechas/autor; 5 posts sin og:image; promesas absolutas ("líderes", "¿la mejor?") y marcas mencionadas sin relación declarada (Nissan, VW, GM, Cesantoni).

**Rendimiento (P1):** video 12.5 MB; 105/105 secciones animadas inician invisibles (anti-patrón: contenido oculto sin JS); 15/15 imágenes lazy (LCP retrasado); 8/15 sin width/height (CLS); PNG/JPG sin AVIF/WebP; Google Fonts externo. Positivo: DOM ligero (762 nodos), Brotli, TTFB bueno, caché de assets.

**Schema (P2):** @graph válido: Organization / LocalBusiness / WebSite / WebPage / FAQPage. Sin aggregateRating falso (bien). Faltan en Organization: address y foundingDate (2019). sameAs con 3 perfiles (verificar cuáles).

**Robots (decisión pendiente):** los bots de **entrenamiento** (GPTBot, ClaudeBot, CCBot, Google-Extended, Applebot-Extended) están **abiertos hoy**. Los de búsqueda IA (OAI-SearchBot, Claude-SearchBot/User, PerplexityBot) también — eso está bien. No toco los de entrenamiento hasta tu decisión.

## 4. Datos que requieren tu confirmación ([DATO POR CONFIRMAR])

1. Autorización de logotipos publicados: Daikin, Magna, Bimbo, L'Oréal, ContiTech, Daltile, Jugos del Valle, Tecnopiso.
2. Menciones en texto de Nissan, VW, GM, Cesantoni, BMW (páginas de zonas) — ¿clientes reales / se pueden nombrar?
3. Corredores industriales reales: el sitio tiene Eje 140 y Tres Naciones; tu brief dice Eje 132, Carretera 57, La Pila, Millennium. ¿Cuáles se atienden de verdad?
4. "32 estados atendidos" — ¿se sostiene o se ajusta a cobertura real?
5. Cifra pública oficial: ¿publicamos "producción actual ~150,000/mes + capacidad instalada 350,000/mes"? (El sitio hoy dice 170K/2M.)
6. División cartón: ¿publicamos 6,000 m² y 70,000 cajas/día? ¿MOQ, flautas, dimensiones máximas, tolerancias, pruebas ECT/BCT disponibles?
7. 3PL: m² utilizables, posiciones, andenes, WMS usado, exactitud de inventario, seguro, SLA reales (brief dice ~15,000 m², 30+ cámaras, 24/7 — ¿público?).
8. Retornables: propiedades ESD verificadas y método, ciclos esperados, servicios de lavado/inspección/reparación reales.
9. Consumibles: marcas, calibres, MOQ, certificaciones reales; ¿VCI y ESD se ofrecen ya?
10. Casos de éxito: los 3 de la home son anónimos y sin cifras. ¿Hay 3 casos autorizados con números para versión cuantificada?
11. Correo público: contacto@bpsmx.com vs migrar a @bestpack.com.mx.
12. Google Ads: ¿hay cuenta activa? ID de conversión.
13. Bots de entrenamiento abiertos, ¿mantener o cerrar?
14. Software técnico a publicar: Pallet Design System, ArtiosCAD, PPAP — confirmar que se usen tal cual.
15. Fecha de fundación 2019 para schema.

## 5. Accesos que necesito para implementar

| # | Acceso | Para qué | Cómo dármelo |
|---|---|---|---|
| 1 | **Repositorio del sitio** (GitHub/GitLab conectado a Vercel) | Rama segura + implementar TODOS los cambios | Copia la carpeta del proyecto a esta carpeta de Bestpack, o dame acceso al repo |
| 2 | **Vercel** (proyecto) | Backend del formulario (/api), variables de entorno, previews sin tocar producción | Invitación al proyecto o sesión en Chrome |
| 3 | **Google Search Console** | Datos reales de queries antes de tocar canibalización/redirecciones | Abrir sesión en tu Chrome y me dices, o agregarme como usuario |
| 4 | **GA4** | Auditar propiedad, crear eventos y conversiones | Ídem |
| 5 | **Google Business Profile** | Consistencia NAP local | Ídem |
| 6 | Destino de leads | ¿A qué correo/CRM llegan los RFQs? (correo, Sheets, HubSpot…) | Dímelo y lo conecto al backend |
| 7 | Google Ads (si existe) | Etiqueta e importación de conversiones | ID de cuenta/conversión |

**Nota Vercel:** las funciones serverless están soportadas de forma nativa — la Fase 2 (captura real de leads) es implementable sin cambiar de hosting, con envío a correo (Resend/SMTP) o CRM + protección honeypot/rate-limit. No requiere plugins pesados.

## 6. Qué sigue (en cuanto haya repo)

1. **P0 conversión:** /api/lead + formulario completo por división (preselección por URL, UTM/GCLID, adjuntos, honeypot, validación doble) + /gracias-cotizacion noindex + eventos GA4.
2. **P0 precisión:** correcciones Saltillo/cifras/tintas/europalet/cargas + eliminación de mensajes internos.
3. **P1 rendimiento:** video ≤4 MB WebM+MP4 + póster en móvil, imágenes AVIF/WebP con dimensiones, eager above-fold, contenido visible por defecto (animación solo si JS), fuentes optimizadas.
4. **P1 SEO:** titles/metas únicos en rango, desambiguación de canibalización (con datos de GSC), plantilla técnica por división con los datos que confirmes.
5. **P2:** schema completo, 404, blog con autor/fechas/fuentes, matriz de enlazado, expediente de proveedor descargable.

## 7. Plan de medición 30/60/90 (una vez implementado)

- **30 días:** eventos GA4 activos y sin duplicados (DebugView), línea base de RFQs/semana, CWV en verde en laboratorio, indexación de páginas corregidas.
- **60 días:** CTR de las 5 páginas de división en GSC vs línea base, primeras conversiones atribuidas por división, decisión sobre páginas de ciudad con datos.
- **90 días:** RFQs calificados/mes por división, posiciones de las 5 keywords núcleo en SLP, CrUX real (LCP móvil ≤2.5s), tasa formulario→cotización enviada.

*KPI norte: RFQs calificados por semana por división — no tráfico genérico.*
