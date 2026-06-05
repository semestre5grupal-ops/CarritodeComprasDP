# Design Session ($design-session) — Plantilla

**Shortcut**: `$design-session <feature-name>`

**Description**: Inicia un workflow de diseño enfocado para una funcionalidad específica.

**Arguments:**
- `[feature-name]`: (Opcional) Nombre de la funcionalidad. Por defecto: `active-design`.

**Context Dependencies:**
- `docs/golden-rules.md`
- `docs/technical-requirements.md`
- `docs/context/design-contracts.md`

## Command

`$design-session <feature-name>`

## Instrucciones

1. **Adoptar Persona:** Carga las instrucciones del agente apropiado para diseño (ej: `docs/ai_development/agents/architect.md`).

2. **Setup:**
   - Determina el filename: `docs/design_sessions/[design-name].md`.
   - Verifica si el archivo existe. Si sí, léelo. Si no, créalo usando `docs/design_sessions/TEMPLATE.md`.

3. **Context Interview (Interactivo):**
   - Pregunta al usuario: *"¿Cuáles son los requisitos para [design-name]?"*
   - Espera la respuesta del usuario.
   - Refina iterativamente el diseño en el archivo markdown basado en las respuestas.

4. **Review:**
   - Valida el borrador contra `docs/golden-rules.md`.
   - Asegúrate de que no se proponga lógica hardcodeada.

5. **Finalizar:**
   - Pregunta: *"¿Está listo este diseño para implementación?"*
   - **STOP.** No escribas código aún.

## Notas

Este workflow debe alinearse con la misma disciplina de carga de contexto que usa `$prepare`.

---

> **✏️ Personalización:**
> - Asegúrate de que las rutas de `Context Dependencies` apunten a archivos reales de tu proyecto.
> - Cambia el agente por defecto si tu proyecto usa un rol diferente para diseño.
