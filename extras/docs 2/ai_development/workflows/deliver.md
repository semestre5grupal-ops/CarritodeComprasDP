# Deliver ($deliver) — Plantilla

**Shortcut**: `$deliver`

**Description**: Ejecuta el workflow final de entrega para validar y resumir el trabajo completado.

## Command

`$deliver`

## Instrucciones

Ejecuta los siguientes pasos para preparar una funcionalidad para entrega:

### 1. Inicia un sub-agente de revisión independiente

Lanza un sub-agente para realizar la revisión. El sub-agente elimina el sesgo de confirmación al revisar los cambios con contexto fresco — no tiene memoria de las decisiones de implementación.

El sub-agente debe:

1. Ejecutar el workflow `$prepare` para cargar todos los docs del proyecto, ADRs, golden rules, etc.
2. Hacer diff de la rama actual contra la rama base usando `git diff $(git merge-base HEAD <rama-base>)..HEAD`
3. Leer todos los archivos modificados completos (no solo el diff) para tener contexto completo
4. Revisar cada cambio contra:
   - `docs/golden-rules.md` (reglas no negociables)
   - `docs/architecture/` (decisiones arquitectónicas)
   - El documento de diseño en `docs/design_sessions/`
5. Auditar el diseño contra la implementación real:
   - Cruzar cada sección del diseño contra el diff
   - Señalar secciones que describen comportamiento no presente
   - Señalar comportamiento implementado no documentado en el diseño
   - Señalar detalles obsoletos: rutas incorrectas, nombres desactualizados
   - Señalar problemas de formato
6. Devolver un reporte estructurado:
   - **Definition of Done**: pass/fail para cada criterio
   - **Golden Rule Violations**: violaciones encontradas
   - **Design Audit**: discrepancias entre diseño e implementación
   - **Issues**: lista de problemas con rutas de archivo
   - **Summary**: evaluación general

### 2. Presentar hallazgos al usuario

El sub-agente es un revisor, no un editor. Reporta lo que encontró — el usuario decide qué hacer.

### 3. Preguntar al usuario si la revisión manual se realizó

**STOP** aquí y espera a que el usuario confirme que la revisión manual está completa y aprobada.

### 4. Push de la rama feature al repositorio remoto

## Quality Gates

Este workflow aplica los quality gates de:
- `docs/golden-rules.md`

---

> **✏️ Personalización:**
> - Cambia `<rama-base>` por el nombre real de tu rama base (main, master, develop).
> - Ajusta los archivos de referencia si tu proyecto usa rutas diferentes.
