# Architecture Overview — Shop Sport Full Stack

## Vista General del Sistema

```
[Browser (Vue.js SPA)] ──HTTPS──▶ [Express API (Node.js)] ──Prisma──▶ [SQL Server]
                                        │
                                   [JWT Auth Middleware]
                                        │
                                   [Controllers → Models]
```

El frontend Vue.js consume la API REST protegida por JWT. El backend sigue MVC estricto. La base de datos SQL Server es gestionada mediante Prisma ORM con migraciones.

## Decisiones de Diseño Clave

### Decisión 1: Migración a Node.js/Express + Prisma
- **Contexto:** El Reto 2 exige persistencia real con BD relacional y API REST.
- **Decisión:** Node.js/Express con Prisma ORM sobre SQL Server.
- **Justificación:** Stack moderno, tipado seguro con Prisma, migraciones versionadas.
- **Consecuencias:** Ver ADR-0002.

### Decisión 2: JWT para autenticación stateless
- **Contexto:** Necesidad de autenticar usuarios sin sesiones en servidor.
- **Decisión:** JWT con payload mínimo (id, username, email, role) y expiry de 8h.
- **Justificación:** Stateless, escalable, estándar OWASP.
- **Consecuencias:** El frontend debe gestionar el token (almacenamiento y renovación).

### Decisión 3: Roles admin/user como enum en BD
- **Contexto:** Se requiere diferenciar permisos de administración.
- **Decisión:** Campo `role` de tipo enum (`admin`, `user`) en la tabla `Usuario`.
- **Justificación:** Control a nivel de base de datos + middleware de autorización.
- **Consecuencias:** Middleware `authorize()` protege rutas administrativas.

## Flujo de Datos

```
1. Usuario visita frontend Vue.js
2. Frontend obtiene catálogo: GET /api/productos (público)
3. Usuario se registra/loguea: POST /api/auth/login → recibe JWT
4. Frontend almacena JWT en localStorage, lo envía en cada request
5. Usuario agrega productos al carrito (persistencia local)
6. Usuario confirma pedido: POST /api/pedidos (con JWT)
7. Backend valida stock, crea pedido + detalles en transacción
8. Admin gestiona productos via CRUD protegido
```

## Patrones Usados

### Patrón MVC Backend
- **Propósito:** Separar responsabilidades en capas.
- **Ubicación:** `server/src/{routes, controllers, lib/prisma.js, middleware}`
- **Implementación:** Routes definen endpoints y aplican middleware; controllers contienen la lógica HTTP; Prisma client es el modelo; middleware maneja auth, roles, validación y errores.

### Patrón Middleware Chain
- **Propósito:** Composición de funcionalidades transversales.
- **Ubicación:** `server/src/middleware/`
- **Implementación:** Cada middleware se encadena en la ruta: `authenticate → authorize → validate → controller`.

## Entorno de Desarrollo

### Prerrequisitos
- Node.js 18+
- SQL Server (local o Docker)
- npm

### Setup
```bash
cd server
npm install
cp .env.example .env   # Editar DATABASE_URL
npx prisma migrate dev --name init
npm run seed
npm run dev
```

### Comandos Útiles
| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor con nodemon (puerto 4000) |
| `npm start` | Inicia servidor en producción |
| `npx prisma studio` | Abre editor visual de BD |
| `npx prisma migrate dev` | Crea nueva migración |
| `npm run seed` | Ejecuta seed de datos |

## Referencias
- ADR-0001: Arquitectura Vanilla JS original (deprecada)
- ADR-0002: Nueva arquitectura Full Stack (activa)
- `docs 2/golden-rules.md`
- `docs 2/technical-requirements.md`
