# docs/ — Memoria Compartida para Agentes IA

Este directorio es el **sistema de memoria compartida** del proyecto. Está diseñado para que tanto desarrolladores humanos como agentes de IA lean y escriban contexto de forma consistente entre sesiones.

## Principio

> Los agentes de IA no tienen memoria persistente entre sesiones.
> Este directorio es SU memoria externa: todo lo que un agente necesita saber está aquí.
> Todo lo que un agente decide, se registra aquí.

## Estructura

```
docs/
├── README.md                          ← Este archivo (índice y explicación)
├── golden-rules.md                    ← Reglas NO NEGOCIABLES del proyecto
├── product-requirements.md            ← Requisitos del producto (qué)
├── technical-requirements.md          ← Requisitos técnicos (cómo)
├── architecture/                      ← Decisiones arquitectónicas (ADRs)
│   ├── README.md                      ←   Visión general de la arquitectura
│   └── ADR-*.md                       ←   Decisiones Arquitectónicas individuales
├── context/                           ← Restricciones de desarrollo
│   ├── ai-constraints.md              ←   Límites para agentes IA
│   └── design-contracts.md            ←   Contratos entre capas del sistema
├── design_sessions/                   ← Diseños activos de funcionalidades
│   ├── TEMPLATE.md                    ←   Plantilla para nuevas sesiones
│   └── <feature-name>.md              ←   Diseño de la funcionalidad actual
└── ai_development/                    ← Guías para agentes IA
    ├── agents/                        ←   Definiciones de roles de agentes
    ├── languages/                     ←   Convenciones por lenguaje
    └── workflows/                     ←   Flujos de trabajo ($comandos)
```

## Cómo Usarlo

### Para Humanos
1. **Mantén los archivos actualizados** — la memoria compartida solo es útil si refleja la realidad.
2. **Documenta las decisiones** — cada ADR, cada regla, cada diseño debe escribirse aquí.
3. **Úsalo como onboarding** — un nuevo desarrollador lee esta carpeta y entiende el proyecto.

### Para Agentes IA
1. **Siempre empieza con `$prepare`** — carga todo el contexto necesario.
2. **Lee antes de actuar** — `golden-rules.md`, `architecture/` y `technical-requirements.md` son lectura obligatoria.
3. **Escribe tus decisiones** — al diseñar, escribe en `design_sessions/`. Al decidir una arquitectura, crea un ADR.
4. **No improvises** — si algo no está en estos archivos, PREGUNTA antes de asumir.

## Flujo de Trabajo Típico

```
1. $prepare                          ← Cargar contexto
2. $design-session <feature>         ← Diseñar funcionalidad
3. $implementation-session <feature> ← Implementar
4. $deliver                          ← Validar y entregar
```

## Personalización para tu Proyecto

Cada archivo en este directorio es una **plantilla**. Para adaptarlo a tu proyecto:

1. Lee cada archivo — entiende su propósito (explicado al inicio de cada uno).
2. Reemplaza los contenidos de ejemplo con la información real de tu proyecto.
3. Agrega o elimina secciones según sea necesario.
4. Mantén los comentarios (``<!-- -->``) como guías para futuras ediciones.
