# Getting Started ($prepare) — Plantilla

**Shortcut**: `$prepare`

**Description**: Lee todos los archivos necesarios para obtener contexto de desarrollo.

## Command

`$prepare`

## Instrucciones

Ejecuta los siguientes pasos para prepararte para el desarrollo:

1. Lee los archivos en la carpeta `docs/` para entender el estado del proyecto.

2. **NO** leas código fuente. El código debe leerse bajo demanda según las necesidades del desarrollo.

3. **DEBES** leer la carpeta `docs/architecture/`. Esto es crítico y no puede omitirse.

4. **DEBES** leer `docs/golden-rules.md`. Esto es crítico y no puede omitirse.

5. **NO** leas todo `docs/ai_development/languages/`. Los lenguajes deben cargarse durante el desarrollo. Solo necesitas saber qué lenguajes están disponibles (lee el README de esa carpeta).

6. Lee `docs/ai_development/agents/README.md` — contiene la lista de agentes disponibles. NO cargues los agentes individuales aún.

7. Si encuentras información faltante, pregúntale al usuario.

## Notas

Este workflow está optimizado para cargar solo lo necesario:
- Los archivos de agentes solo se cargan bajo demanda.
- Las convenciones específicas de lenguaje solo se cargan cuando se necesitan.
- El código fuente se lee bajo demanda durante el desarrollo.

---

> **✏️ Personalización:**
> Ajusta las rutas de los pasos 1-6 si tu proyecto tiene una estructura diferente.
> Por ejemplo, algunos proyectos tienen sus reglas en `docs/rules.md` en lugar de `docs/golden-rules.md`.
