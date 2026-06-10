# Available Agents — Plantilla

> **¿Para qué sirve esta carpeta?**
> Define los roles especializados de agentes IA disponibles en el proyecto.
> Cada archivo describe un agente con su personalidad, enfoque, y formato de salida.
> Los agentes se cargan bajo demanda según la tarea (no todos al inicio).
>
> **Instrucciones:**
> 1. Lista aquí todos los agentes definidos en esta carpeta.
> 2. Para crear un nuevo agente, copia la plantilla de abajo y crea un archivo `<nombre>.md`.
> 3. Sigue la estructura consistente: descripción, focus areas, approach, output.

---

## Índice de Agentes

| Nombre | Descripción | Archivo |
|--------|-------------|---------|
| <!-- Ej: frontend-architect --> | <!-- Ej: Diseña arquitectura frontend --> | `docs/ai_development/agents/architect.md` |

---

## Cómo Crear un Nuevo Agente

1. Crea un archivo `<nombre-del-agente>.md` en esta carpeta.
2. Usa esta estructura:

```markdown
# [nombre-del-agente]

## Descripción

<!-- 2-3 líneas sobre qué hace este agente y cuándo usarlo -->

## Focus Areas

<!-- Lista de áreas de especialización -->

## Approach

<!-- Cómo aborda los problemas este agente (lista numerada) -->

## Output

<!-- Formato de salida esperado del agente -->
```
