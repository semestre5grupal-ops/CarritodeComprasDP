# ADR-0002: Migración a Full Stack — Node.js/Express + Prisma + Vue.js

## Estado
Aceptada

## Contexto
El proyecto original "Shop Sport" era una aplicación frontend-only con JavaScript Vanilla (Reto 1). Para el Reto 2 se requiere transformarlo en una plataforma Full Stack real con:

- Backend MVC con Node.js/Express
- Persistencia relacional con SQL Server vía Prisma ORM
- Frontend migrado a Vue.js (reemplazando Vanilla JS)
- Seguridad OWASP: JWT, bcrypt, CORS, validación, roles

Además, se debe mantener un sistema de documentación compartida en `docs/` para que múltiples agentes IA puedan colaborar de forma determinista.

## Decisión
Se adopta la siguiente arquitectura full-stack:

### Backend (server/)
- **Runtime:** Node.js con Express 4.x
- **ORM:** Prisma 5.x sobre SQL Server
- **Patrón:** MVC con rutas, controladores, modelos (Prisma client) y middlewares
- **Seguridad:**
  - JWT en header `Authorization: Bearer <token>` con expiry
  - bcrypt con 10 rondas de sal para hash de contraseñas
  - CORS restrictivo (solo orígenes explicitados en `CORS_ORIGIN`)
  - Validación y sanitización con `express-validator`
  - Middleware centralizado de errores (sin stacktrace en producción)
  - Roles: `admin` y `user` (enum en Prisma)
- **Endpoints:**
  - `POST /api/auth/register` — registro público
  - `POST /api/auth/login` — login público, devuelve JWT
  - `GET /api/auth/profile` — perfil del usuario autenticado
  - `GET /api/productos` — catálogo público
  - `GET /api/productos/:id` — detalle público
  - `POST /api/productos` — crear (admin)
  - `PUT /api/productos/:id` — actualizar (admin)
  - `DELETE /api/productos/:id` — eliminar (admin)
  - `POST /api/pedidos` — crear pedido (user/admin)
  - `GET /api/pedidos/mis-pedidos` — pedidos del usuario autenticado
  - `GET /api/pedidos` — todos los pedidos (admin)

### Frontend (futuro — Fase 3+)
Se migrará a Vue.js 3 con Composition API manteniendo la estructura MVC pero usando el framework.

## Consecuencias
- **Positivas:** Backend con separación real de capas, seguridad OWASP, documentación sincronizada para IA.
- **Positivas:** Prisma permite migraciones, seed y type safety en la capa de datos.
- **Negativas:** Requiere SQL Server instalado o accesible (no es embedded).
- **Negativas:** El frontend Vanilla JS existente debe reescribirse completamente a Vue.js.
- **Neutras:** El directorio `docs/` duplicado (`docs/` original + `docs 2/` para Reto 2) debe mantenerse sincronizado.
