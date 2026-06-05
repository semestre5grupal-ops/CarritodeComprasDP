# Design Contracts — Plantilla

> **¿Para qué sirve este archivo?**
> Define los contratos entre las capas del sistema: qué puede llamar a qué, qué está prohibido, y cómo se garantiza el determinismo.
> Los agentes usan esto para no violar la arquitectura al implementar nuevas funcionalidades.
>
> **Instrucciones:**
> 1. Define las capas de tu sistema.
> 2. Especifica las reglas de dependencia entre capas.
> 3. Documenta los contratos de API y las reglas de determinismo.

---

## Capas del Sistema

<!--
Lista las capas de tu arquitectura.
Ejemplo:
- Capa de Presentación (Frontend)
- Capa de API (REST endpoints)
- Capa de Servicios (Lógica de negocio)
- Capa de Datos (Persistencia)
-->

## Reglas de Dependencia

<!--
Define qué capa puede llamar a qué.

Ejemplo:
- `rutas` → puede llamar a `servicios` y helpers de serialización.
- `servicios` → puede llamar a `modelos` y extensiones.
- `modelos` → NO debe importar rutas ni servicios.
- La dirección de las dependencias debe ser siempre hacia adentro (capa externa → capa interna).
-->

## Reglas de Determinismo

<!--
Ejemplos:
- La composición de la aplicación debe estar centralizada (ej: factory/builder).
- Los handlers deben producir códigos de estado y formatos de respuesta explícitos.
- Las funciones de servicio deben ser puras en intención y declarar efectos secundarios explícitamente.
- El estado global oculto está prohibido fuera de la inicialización de extensiones.
-->

## Contratos de API

<!--
Documenta los contratos esperados.

Ejemplo por endpoint:
### POST /api/recurso
- **Request:** `{ "campo": "string", "valor": number }`
- **Response 200:** `{ "id": "uuid", "status": "ok" }`
- **Response 400:** `{ "error": "descripción" }`
-->
