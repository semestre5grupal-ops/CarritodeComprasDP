# Active Design Specification — Template

> **¿Para qué sirve este archivo?**
> Es la plantilla para crear nuevas sesiones de diseño. Cada vez que se diseña una funcionalidad,
> se copia este template a un archivo nuevo y se completa.
>
> **¿Cómo se usa?**
> 1. Los agentes ejecutan el workflow `$design-session <feature-name>`.
> 2. El workflow crea `docs/design_sessions/<feature-name>.md` basado en este template.
> 3. Se completa interactivamente con el usuario.
> 4. Una vez aprobado, el workflow `$implementation-session <feature-name>` lo usa para implementar.

---

## Feature Name

<!-- Describe la funcionalidad claramente -->

---

## Problem Statement

<!-- ¿Qué problema estamos resolviendo? ¿Por qué es necesario? -->

---

## Scope

### Incluido
<!-- ¿Qué está dentro del alcance de este diseño? -->

### Excluido
<!-- ¿Qué está explícitamente fuera del alcance? -->

---

## Implementation Details

<!--
Describe los detalles técnicos de la implementación:
- Algoritmos, estructuras de datos
- Archivos a modificar/crear
- APIs a usar
- Flujo de ejecución
-->

---

## Test Plan

<!--
¿Cómo se va a validar que la implementación es correcta?
- Tests unitarios
- Tests de integración
- Verificación manual
-->

---

## Risks / Edge Cases

<!--
¿Qué podría salir mal? Casos límite a considerar:
- Riesgos arquitectónicos o técnicos
- Dependencias externas frágiles
- Casos de borde en la lógica
-->

---

## Open Questions

<!--
Preguntas que deben resolverse ANTES de comenzar la implementación.
El workflow de diseño se detiene aquí hasta que el usuario responda.
-->
