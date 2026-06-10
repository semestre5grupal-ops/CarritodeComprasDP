# Implementation Session ($implementation-session) — Plantilla

**Shortcut**: `$implementation-session <feature-name>`

**Description**: Ejecuta un workflow de implementación para una funcionalidad específica.

**Arguments:**
- `[feature-name]`: Nombre de la funcionalidad según el documento de diseño en `docs/design_sessions/`.

**Preconditions:**
- El `[feature-name]` debe existir como un documento de diseño equivalente.
- El usuario debe haber aprobado el diseño en el paso anterior (design session).

**Context Dependencies:**
- El documento de diseño en `docs/design_sessions/[feature-name].md`
- `docs/golden-rules.md`
- `docs/technical-requirements.md`
- `docs/context/design-contracts.md`
- Las convenciones de lenguaje apropiadas en `docs/ai_development/languages/`

## Command

`$implementation-session <feature-name>`

## Instrucciones

1. Activa los agentes de desarrollo apropiados según el trabajo involucrado.

2. Encuentra y lee la sesión de diseño en `docs/design_sessions/`.

3. Inicializa el entorno de desarrollo:
   - Instala dependencias si es necesario.
   - Configura servicios requeridos según los requisitos técnicos.

4. Implementa el diseño:
   - Si hay una sección `Implementation Details`, síguela para implementar.
   - Si falta algo en el plan de implementación, pregúntale al usuario.
   - Si no hay plan de implementación, implementa según el documento de diseño.
   - Sigue todas las reglas en `docs/golden-rules.md`.
   - Sigue la arquitectura en `docs/architecture/` y `docs/technical-requirements.md`.
   - Usa las convenciones de lenguaje apropiadas de `docs/ai_development/languages/`.

5. Maneja ambigüedad:
   - Si hay ambigüedad en el diseño, NO te pongas creativo.
   - En su lugar, pregúntale al usuario para aclarar.

## Notas

Este workflow debe alinearse con la misma disciplina de carga de contexto que usa `$prepare`.

---

> **✏️ Personalización:**
> - Ajusta los agentes por defecto según los roles de tu proyecto (ej: `engineer`, `python-pro`, etc.).
> - Verifica que las rutas de `Context Dependencies` existan en tu proyecto.
