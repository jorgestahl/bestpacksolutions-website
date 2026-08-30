# Plan de rollback
La rama seo-claims-regional-pharma-2026-08-30 contiene 1 commit atómico sobre main (producción). Nada desplegado.
- **Descartar todo:** no hacer merge; borrar rama (`git branch -D seo-claims-regional-pharma-2026-08-30`). Producción intacta.
- **Revertir tras merge (si se llegara a desplegar):** `git revert <hash_del_commit>` en main + push (el flujo .bat de Jorge sirve igual). Revert limpio garantizado por ser 1 commit.
- **Revertir SOLO tintas (si Jorge confirma que son 2):** editar en la rama con `replace '4 tintas'->'2 tintas'` (12 posiciones originales + nuevas menciones en landings/módulos/schema/docs listadas por grep) — script disponible; NO requiere revert del resto.
- Bundle de producción actual NO fue tocado; los .bat de Jorge siguen apuntando al flujo normal.
