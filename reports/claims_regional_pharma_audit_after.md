# Auditoría AFTER — claims / regional / pharma
**Fecha:** 2026-08-30 · Rama: seo-claims-regional-pharma-2026-08-30 · SIN desplegar

## Validaciones (25 puntos del §28)
| # | Validación | Resultado |
|---|---|---|
| 1-2 | "2 tintas"/"dos tintas" restantes | **0** · "4 tintas" presentes: 28 (contextos correctos, incluye landings nuevas) |
| 3 | 170,000 / 2 millones | **0** |
| 4-6 | Saltillo como planta / dos plantas | **0** · Saltillo solo como bodega de distribución |
| 5,8 | 3PL como operación en SLP | ✅ (meta, FAQ visible+schema, stat "Sedes"→VMI) |
| 7 | Ubicaciones inventadas | **0** (fórmulas §3/§9 en 7 páginas regionales) |
| 9 | JSON-LD | **49 bloques válidos / 0 errores** |
| 10 | FAQ visible = FAQ schema (pharma 7/7) | ✅ espejo exacto |
| 11 | URLs indexables | 46 en sitemap (44 previas + /cobertura + /industria-farmaceutica) — el "41" del prompt era dato desactualizado |
| 12 | noindex accidental | ninguno (solo gracias/gracias-cotizacion/herramienta-ads/404, correctos) |
| 13-14 | Canonicals/sitemap | ✅ 50 canonicals, sitemap válido |
| 15-16 | Crawler + enlaces internos | ✅ 0 rotos (incl. páginas nuevas) |
| 17 | Titles/metas | únicos, en rango; nuevos: pharma 47c/141c · cobertura 55c/139c |
| 18 | Ortografía/acentos | revisado en contenido nuevo |
| 19-20 | Formulario + /api/lead | harness 7/7 previo + extensión extras validada (node --check OK); prueba de humo tras deploy |
| 21-22 | GA4 / generate_lead | intactos (main.js conserva flujo; solo se añadió recolección de extras) |
| 23 | Diff completo | disponible en la rama (1 commit atómico) |
| 24 | Claims farmacéuticos regulados publicados | **0** — las 2 apariciones de "cadena fría" son la negación defensiva del FAQ aprobado §21 |
| 25 | Landing farmacéutica sin desplegar | ✅ (rama sin merge) |

## Clasificación de menciones farmacéuticas preexistentes (13)
Todas **correctas**: listas de industrias (casos-de-exito ×5, home, puebla) y contexto técnico de higiene (blog ×2). Ninguna requería corrección.
