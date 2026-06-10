# Workflows — Plantilla

> **¿Para qué sirve esta carpeta?**
> Define comandos de flujo de trabajo (workflows) que los agentes pueden ejecutar.
> Cada workflow es un procedimiento estandarizado que garantiza consistencia entre sesiones.
> Los workflows se invocan con atajos tipo `$comando`.
>
> **Instrucciones:**
> 1. Revisa cada workflow y ajústalo a las rutas reales de TU proyecto.
> 2. Los workflows referencian archivos dentro de `docs/` — verifica que las rutas existan.
> 3. Para agregar un nuevo workflow, crea un archivo `<nombre>.md` y documéntalo en la tabla de abajo.

---

## Workflows Disponibles

| Atajo | Descripción | Archivo |
|-------|-------------|---------|
| `$prepare` | Carga todo el contexto de desarrollo | [prepare.md](./prepare.md) |
| `$design-session <feature>` | Ejecuta workflow de diseño para una feature | [design-session.md](./design-session.md) |
| `$implementation-session <feature>` | Ejecuta workflow de implementación | [implementation-session.md](./implementation-session.md) |
| `$deliver` | Valida y prepara entrega final | [deliver.md](./deliver.md) |
| `$?` | Muestra ayuda con atajos disponibles | [help.md](./help.md) |
