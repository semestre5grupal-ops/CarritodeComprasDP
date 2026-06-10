# Language Guidelines — Plantilla

> **¿Para qué sirve esta carpeta?**
> Contiene guías de convenciones específicas por lenguaje de programación.
> Los agentes cargan SOLO el lenguaje relevante durante la implementación, no al inicio.
>
> **Instrucciones:**
> 1. Por cada lenguaje/framework usado en el proyecto, crea una subcarpeta con su guía.
> 2. Cada guía debe cubrir: convenciones de estilo, patrones recomendados, anti-patrones.
> 3. Mantén las guías prácticas y orientadas a implementación, no teóricas.

---

## Lenguajes Disponibles

| Lenguaje | Framework | Archivo de Convenciones |
|----------|-----------|------------------------|
| <!-- JavaScript (ES6+) --> | <!-- -- --> | `docs/ai_development/languages/javascript/README.md` |

## Cómo Agregar un Nuevo Lenguaje

1. Crea una subcarpeta con el nombre del lenguaje: `docs/ai_development/languages/<lenguaje>/`.
2. Crea al menos un `README.md` con las convenciones generales.
3. Opcional: agrega guías específicas de frameworks (ej: `effective-flask.md`, `effective-react.md`).
4. Actualiza este README para listar el nuevo lenguaje.

### Estructura Recomendada

```
languages/<lenguaje>/
├── README.md              # Convenciones generales del lenguaje
├── effective-<framework>.md  # Guía específica de framework (opcional)
```

### Contenido Sugerido para Cada Guía

- **Convenciones de Estilo**: nombres, formato, estructura de archivos.
- **Patrones Recomendados**: cómo organizar el código en este lenguaje.
- **Anti-patrones**: lo que NO debe hacerse.
- **Ejemplos**: fragmentos de código que ilustren las convenciones.

## Notas para Agentes

1. Lee este archivo primero para descubrir los lenguajes disponibles.
2. Carga solo la carpeta del lenguaje necesario para la tarea actual.
3. Si no hay guía para el lenguaje solicitado, pide dirección antes de inventar estándares.
