# Contexto y línea base — Optimización bestpack.com.mx
**Auditoría: 29-ago-2026 · Complemento obligatorio del CLAUDE.md raíz**

## 1. Qué es BestPack (para escribir copy correcto)

Empresa mexicana fundada en 2019, sede en San Luis Potosí (Privada Aguilar #10, La Pila). Evolucionó de fabricante de tarimas a **integrador de 5 divisiones**: empaque de madera, cartón corrugado, empaque retornable, logística/3PL y consumibles industriales. Diferenciador central autorizado:

> "Un solo socio para diseñar, fabricar, almacenar, administrar, recuperar y reparar el empaque que mueve tu operación."

Audiencia: compradores industriales, gerentes de compras, logística, almacén, empaque, calidad, ingeniería y supply chain. Foco geográfico: SLP y corredores realmente atendidos — Zona Industrial, Eje 132, Carretera 57, La Pila, Logistik, WTC, Millennium, Villa de Reyes **[OJO: el sitio hoy tiene páginas de Eje 140 y Tres Naciones; Jorge debe confirmar la lista real antes de crear/quitar páginas de zona]**. Tarimas, cartón y 3PL son las prioridades comerciales; retornables y consumibles visibles en nav y enlazado. "Exportación HT" NO es la oferta principal: se mantiene como contenido técnico complementario.

## 2. Estado técnico verificado (29-ago-2026)

- **Hosting**: Vercel (server: Vercel, Brotli activo, caché assets 30d, HTML max-age=0). Serverless `/api` disponible → backend de formulario viable sin cambiar hosting.
- **41 URLs** en sitemap, todas 200, indexables, canonical autorreferente, sin redirects internos. No-www → www OK. 404 devuelve 404 real pero sin página personalizada. `/gracias-cotizacion` NO existe.
- **Analítica**: gtag GA4 básico (un ID G-RR…), dataLayer=4, sin GTM, sin Google Ads tag, cero eventos de negocio.
- **Schema**: un @graph válido en home: Organization (sin address, sin foundingDate, sameAs×3), LocalBusiness (con address y tel), WebSite, WebPage, FAQPage. Sin aggregateRating (correcto — no agregar).
- **Rendimiento home**: PSI móvil **72** (FCP 3.0s, LCP 5.0s, TBT 110ms, CLS 0, SI 4.9s); escritorio 97; A11y 95; BP 100; SEO 100. TTFB 381ms. Causas dominantes: video hero **12.5 MB** MP4 único (autoplay, preload=none, con póster jpg), **105/105 secciones `opacity:0`** esperando IntersectionObserver, **15/15 imágenes lazy** (incluidas above-the-fold), 8/15 sin width/height, PNG/JPG sin AVIF/WebP, Google Fonts externo. DOM ligero (762 nodos) — el sitio es rápido de fondo, lo frenan el video y el patrón de animación.
- **Formulario** (solo en home): campos nombre/empresa/email/telefono/producto/mensaje, sin action → JS abre WhatsApp con el texto. Sin backend, sin honeypot, sin UTM/GCLID, sin adjuntos, sin preselección por división, éxito declarado al abrir WhatsApp.

## 3. Backlog completo

### P0 — Conversión (Fase 2 del brief)
Función serverless `/api/lead` (Vercel) que **guarde/envíe** el lead a correo o CRM [DESTINO POR CONFIRMAR con Jorge] y confirme éxito SOLO tras respuesta del servidor. WhatsApp queda como alternativa secundaria; si falla, NO borrar datos. Validación cliente+servidor; honeypot + rate limiting ligero; errores claros y accesibles; consentimiento + link a /aviso-de-privacidad; sin credenciales en frontend (usar env vars de Vercel).

Campos: nombre, empresa, puesto, correo, teléfono, ciudad/planta destino, división o servicio, producto, volumen, frecuencia, fecha requerida, descripción, archivo adjunto (plano/foto/especificación).
Captura automática: URL origen, servicio origen, utm_source/medium/campaign/term/content, GCLID, referrer, landing page.
Formularios por división PRESELECCIONADOS según la página (visitante de 3PL no ve "Tarimas nuevas" por defecto).
Crear `/gracias-cotizacion` con noindex, medible.
Si el plan de Vercel no permitiera algo (p.ej. adjuntos grandes), detenerse SOLO en ese punto y presentar 2 alternativas con costo/seguridad/esfuerzo.

### P0 — Precisión de datos
Aplicar tabla del CLAUDE.md: Saltillo bodega; 150K producción / 350K capacidad instalada (reemplaza 170K y +2M en las ~19 páginas listadas en el CSV); 2 tintas; europalet 800×1,200mm; unificar capacidades de carga en una tabla técnica única referenciada por todas las páginas; eliminar "Mayor crecimiento"/"Nueva línea"/"ingreso recurrente"; suavizar promesas absolutas ("Líderes en…", FAQ "¿la mejor empresa?") a claims verificables; revisar "32 estados" y menciones de marcas (Nissan/VW/GM/BMW/Cesantoni) → [POR CONFIRMAR].

### P0 — Medición (Fase 3)
Eventos GA4: `generate_lead` (solo éxito servidor, con división como parámetro), `quote_started`, `drawing_uploaded`, `whatsapp_click`, `call_click`, `email_click`, `technical_visit_requested`, `catalog_download`, `certification_download`. Sin duplicar el tag existente. Preservar UTMs/GCLID hasta el envío. Estructura lista para importar: lead calificado → oportunidad → cotización → venta. Si falta ID/label de Google Ads: solicitarlo, no inventarlo.

### P1 — Rendimiento (Fase 13)
Video ≤3–5 MB en WebM/AV1 + MP4 fallback; en móvil póster estático (no reproducir video salvo razón fuerte). AVIF/WebP + srcset/sizes + width/height explícitos. Eager arriba del fold, lazy debajo. Contenido **visible por defecto**, animación solo con JS (clase `.js` en <html> o similar) + `prefers-reduced-motion`. CSS crítico, JS diferido, fuentes optimizadas (self-host o display=swap con preconnect). Metas: LCP móvil ≤2.5s, INP ≤200ms, CLS ≤0.1, Lighthouse móvil ≥90, y ≥95 en SEO/A11y/BP.

### P1 — SEO on-page (Fases 4–6)
- Reescribir 37 metas (140–155c) y 11 titles (50–60c) — lista exacta en `crawl_bestpack_2026-08-29.csv` columna notas.
- Matriz una-intención-por-URL. Canibalizaciones a resolver CON datos de Search Console (mientras no haya acceso: documentar recomendación, no redirigir): home↔/tarimas-san-luis-potosi (keyword "tarimas en San Luis Potosí" en ambos titles), home↔/fabricantes-de-tarimas (H1 casi idéntico), /tarimas-parque-logistik↔/tarimas-villa-de-reyes (mismo parque), triple Eje140/WTC/Tres Naciones.
- Ciudades (Ags, Zac, León, Mty, Gdl, Puebla): 6 titles plantilla idénticos y ~60% contenido compartido. Corregir "fabricante EN X" → "entregas en X desde SLP"; añadir info única real (tiempos, flete, industrias, casos) o proponer consolidación. NO crear páginas nuevas de ciudad.
- Plantilla por división (Fase 6): title/meta únicos, un H1, respuesta directa en primeros párrafos (qué/para quién/dónde/diferenciador), aplicaciones, capacidades verificadas, materiales/especificaciones, proceso de cotización, evidencia/fotos reales, caso de éxito [estructura lista, datos POR CONFIRMAR], FAQs visibles, CTA contextual, formulario preseleccionado, enlaces a divisiones complementarias.
- Contenido por división SOLO con datos confirmados (ver §5).

### P1 — Contenido técnico (Fase 7)
Responder en HTML visible (no solo PDF/imagen): qué información necesita BestPack para cotizar una tarima; cómo se calcula la resistencia; producción vs capacidad instalada; qué pruebas se hacen al corrugado; qué debe incluir una cotización 3PL; costo por ciclo de retornable; cómo se valida ESD; cuándo conviene VMI; qué necesita un proveedor para desarrollar dunnage. Fechas de publicación/actualización reales (dateModified solo con cambios reales), autor + revisor técnico con perfil, índice en textos largos, fuentes primarias (SEMARNAT, IPPC/ISPM-15, EPAL, ISO). Sin artículos masivos con IA.

### P2 — (Fases 9–12, 14)
Schema: completar Organization (address, foundingDate 2019, sameAs oficiales — FB e IG existen en footer; LinkedIn [POR CONFIRMAR dominio correcto]); BreadcrumbList; Service en divisiones; Article/BlogPosting con autor; validar en Rich Results Test + Schema.org Validator. 404 personalizada. Blog: mostrar TODOS los artículos (verificar), categorías, autor, fechas, fuentes, og:image en los 5 posts que no tienen, breadcrumbs. Sitemap: solo canónicas 200 con lastmod real. Matriz de enlazado servicios↔industrias↔casos↔blog↔formulario. Expediente de proveedor descargable (certificados con número/alcance/organismo/vigencia [DOCUMENTOS POR RECIBIR]). Calendario editorial de 12 contenidos (proponer, no publicar en masa).

## 4. Criterios de aceptación (antes de dar por terminado)

Build compila · lint/pruebas pasan · sin errores críticos de consola · sin enlaces internos rotos · sin regresiones visuales en rutas clave · todas las indexables 200 · canonicals coherentes · sitemap/robots coherentes · titles/metas/H1 únicos · schema sin errores y coincidente con lo visible · formularios guardan leads reales · selección de servicio conserva contexto · eventos GA4 sin duplicados en DebugView · WhatsApp/tel/correo/adjuntos/formularios funcionan · navegable por teclado · cero datos comerciales inventados · métricas antes/después documentadas.

## 5. Datos pendientes de Jorge (NO publicar sin confirmar)

1. Destino de leads (correo/CRM) para /api/lead. 2. Logos autorizados (Daikin, Magna, Bimbo, L'Oréal, ContiTech, Daltile, Jugos del Valle, Tecnopiso). 3. Marcas mencionadas en texto (Nissan, VW, GM, BMW, Cesantoni). 4. Corredores/zonas reales (¿Eje 132 o 140? ¿Tres Naciones? ¿Millennium?). 5. "32 estados". 6. Cifra pública 150K/350K → forma exacta de publicarla. 7. Cartón: 6,000 m², 70,000 cajas/día, MOQ, flautas, ECT/BCT, dimensiones máx., tolerancias, tiempos de muestra. 8. 3PL: m² utilizables, posiciones, andenes, WMS, exactitud inventario, seguro, SLA, 15,000 m²/30 cámaras/24-7. 9. Retornables: ESD verificado y método, ciclos, lavado/inspección/reparación reales. 10. Consumibles: marcas, calibres, MOQ, certificaciones, VCI/ESD reales. 11. 3 casos de éxito con números y autorización. 12. Correo @bestpack.com.mx. 13. Google Ads (¿existe cuenta? ID/label). 14. Bots de entrenamiento (mantener abiertos o cerrar). 15. Certificados PDF para expediente de proveedor.

## 6. Accesos pendientes

Search Console (canibalización/redirecciones dependen de esto) · GA4 (auditar propiedad, marcar conversiones) · Google Business Profile · Google Ads si existe. Sin GSC: implementar todo lo demás y dejar las decisiones de consolidación de URLs documentadas como propuesta.

## 7. Plan de medición 30/60/90

30d: eventos activos sin duplicados, línea base RFQs/semana, CWV verdes en lab, indexación de páginas corregidas. 60d: CTR de las 5 divisiones en GSC vs base, conversiones por división, decisión páginas de ciudad con datos. 90d: RFQs calificados/mes por división, keywords núcleo SLP, CrUX real LCP ≤2.5s, tasa formulario→cotización. KPI norte: **RFQs calificados por semana por división**.

## 8. Benchmark (solo para detectar brechas, NUNCA copiar)

Tarimas: UFP Empaques, Tariplus, Recipak, Prommont, Industrial Pallets & Packing. Cartón: EYESA, Cajas Mil Usos, Cartón Sólido, Barca de México, PCM. Retornables: AP&RD, Hiperpack, Packaging Now, ORBIS, Nefab. 3PL: Chronos, CEVA, Crane Worldwide, REIS, FASTEC, Schnellecke, Ryder. Buscar qué demuestran (infraestructura, laboratorio, WMS, SLA, carga de planos, casos con números) que BestPack aún no demuestra.
