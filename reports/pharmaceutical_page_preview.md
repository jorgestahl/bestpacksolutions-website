# Preview — /industria-farmaceutica (en rama, sin desplegar)
- **URL:** /industria-farmaceutica · **Title (47c):** Empaque para Industria Farmacéutica | BestPack México · **Meta (141c):** "Tarimas, cartón corrugado, empaque retornable, consumibles e integración logística para operaciones farmacéuticas. Atención industrial desde SLP."
- **H1:** Soluciones de empaque para la industria farmacéutica · **Subtítulo:** empaque secundario y terciario… desde San Luis Potosí.
- **Estructura:** Hero → Experiencia → Primario/secundario/terciario → Retos (6) → Soluciones por división (5) → Declaración de alcance (callout) → Proceso (8 pasos) → Cobertura regional → FAQ (7) → Formulario especializado.
- **FAQ:** las 7 preguntas/respuestas EXACTAS del §21, visibles y en FAQPage schema (espejo verificado).
- **Schema:** BreadcrumbList + WebPage + Service (areaServed 6 estados) + FAQPage. SIN tipos médicos (no Pharmacy/MedicalBusiness/etc.).
- **Enlaces:** recibe de home/5 divisiones/GDL/QRO; emite a divisiones y cobertura.
- **CTA/Formulario:** industria=Farmacéutica preseleccionada (hidden), campos del §17 (nivel de empaque, contacto directo/indirecto, condición de almacenamiento, requisito/certificación, dimensiones, volúmenes, fecha, adjunto), consentimiento, honeypot; división interna "Otro / proyecto especial" para pasar validación estándar. Opciones de riesgo marcadas "(requiere validación)". Servidor calcula **REQUIERE_VALIDACION_REGULATORIA** y lo antepone al asunto del correo. No rompe el RFQ actual (mismo main.js + /api/lead extendido retrocompatible).
- **Claims publicados:** solo los aprobados (§13-14). **Claims bloqueados:** todo el §15 (verificado 0 en contenido afirmativo).
