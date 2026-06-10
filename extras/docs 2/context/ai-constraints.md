# AI Context Constraints — Plantilla

> **¿Para qué sirve este archivo?**
> Define las restricciones específicas que los agentes de IA deben seguir al interactuar con este proyecto.
> Esto incluye reglas de comportamiento, preferencias de implementación, y límites explícitos.
>
> **Instrucciones:**
> 1. Reemplaza los ejemplos con las restricciones reales de TU proyecto.
> 2. Sé explícito: un "no" claro evita que la IA improvise.

---

## Reglas de Interacción

<!--
Ejemplos:
- Los agentes deben leer `docs/golden-rules.md` antes de cualquier implementación.
- Los agentes no deben modificar archivos de configuración sin autorización explícita.
- Las decisiones técnicas deben referenciar el ADR correspondiente.
-->

## Preferencias de Implementación

<!--
Ejemplos:
- Preferir funciones puras sobre funciones con efectos secundarios.
- Usar imports explícitos, nunca imports globulares.
- Mantener los handlers HTTP delgados; la lógica de negocio va en servicios.
-->

## Límites de la IA

<!--
Ejemplos:
- No generar código que no se haya solicitado explícitamente (YAGNI).
- No asumir dependencias externas sin verificar que ya existen en el proyecto.
- No crear archivos nuevos sin preguntar primero.
- No modificar tests existentes sin validar que siguen pasando.
-->
