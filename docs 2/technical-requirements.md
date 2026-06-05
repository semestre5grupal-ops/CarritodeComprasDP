# Technical Requirements — Shop Sport Full Stack (Reto 2)

## Stack Tecnológico

| Capa | Tecnología | Versión | Notas |
|------|-----------|---------|-------|
| Frontend | Vue.js 3 (Composition API) | 3.x | SPA, reemplaza Vanilla JS |
| Backend | Node.js + Express | 18+ / 4.x | API REST, MVC |
| Base de Datos | SQL Server | 2019+ | Gestión con Prisma ORM |
| ORM | Prisma | 5.x | Migraciones, seed, type-safe |
| Autenticación | JWT + bcrypt | — | Tokens stateless, hash con 10 rounds |
| Validación | express-validator | 7.x | Sanitización y validación de entrada |
| Infraestructura | Local / Render | — | Despliegue opcional |

## Principios Arquitectónicos

### Principio 1: Separación de Responsabilidades (MVC)
- Backend: `routes → controllers → models (Prisma) → middleware`
- Frontend: `controllers → models → views` (componentes Vue)
- No mezclar lógica HTTP con lógica de negocio ni acceso a datos.

### Principio 2: Seguridad por Capas (OWASP)
- Validación y sanitización de toda entrada de usuario
- JWT para autenticación stateless
- CORS restrictivo (nunca `*`)
- Contraseñas hasheadas con bcrypt
- Error handler centralizado que no expone stacktrace
- Roles admin/user estrictos

### Principio 3: Documentación como Memoria Compartida
- Todo cambio arquitectónico se registra como ADR en `docs 2/architecture/`
- El diseño activo se documenta en `docs 2/design_sessions/`
- Los agentes IA leen y escriben en `docs 2/` obligatoriamente

## Estructura de Directorios

```
CarritodeComprasDP/
├── index.html                    # (legado) Entrada original Vanilla JS
├── server/                       # Backend API (Reto 2)
│   ├── package.json
│   ├── .env / .env.example
│   ├── prisma/
│   │   ├── schema.prisma         # 4 tablas: Producto, Usuario, Pedido, PedidoDetalle
│   │   └── seed.js               # Seed con admin + productos desde JSON
│   └── src/
│       ├── index.js              # Entry point, middlewares globales
│       ├── config/env.js         # Variables de entorno
│       ├── lib/prisma.js         # Singleton PrismaClient
│       ├── middleware/
│       │   ├── auth.js           # JWT verification
│       │   ├── role.js           # Role authorization
│       │   ├── validate.js       # express-validator runner
│       │   └── errorHandler.js   # Error centralizado + 404
│       ├── validators/
│       │   ├── auth.validator.js
│       │   ├── producto.validator.js
│       │   └── pedido.validator.js
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── producto.routes.js
│       │   └── pedido.routes.js
│       └── controllers/
│           ├── auth.controller.js
│           ├── producto.controller.js
│           └── pedido.controller.js
├── app/                          # Frontend legado Vanilla JS (Reto 1)
│   ├── controller/js/
│   ├── view/
│   └── data/productos.json
├── docs/                         # Documentación original (Reto 1)
├── docs 2/                       # Documentación compartida para IA (Reto 2)
│   ├── architecture/
│   ├── design_sessions/
│   └── ...
└── README.md
```

## Flujo de Datos

```
Vue.js SPA (frontend)
    │
    ├── GET /api/productos (público)        → Catálogo
    ├── POST /api/auth/login                → Obtener JWT
    ├── POST /api/auth/register             → Registrar usuario
    ├── POST /api/pedidos (JWT)             → Confirmar pedido
    ├── GET /api/pedidos/mis-pedidos (JWT)  → Historial propio
    ├── GET /api/pedidos (JWT + admin)      → Todos los pedidos
    ├── POST /api/productos (JWT + admin)   → Crear producto
    ├── PUT /api/productos/:id (JWT+admin)  → Actualizar producto
    └── DELETE /api/productos/:id (JWT+admin) → Eliminar producto
```

## Quality Gates

- [ ] El servidor inicia sin errores con `npm run dev`
- [ ] Prisma genera cliente sin errores
- [ ] Las migraciones se aplican correctamente
- [ ] El seed inserta datos sin duplicados
- [ ] Los endpoints responden con los códigos HTTP correctos
- [ ] Las rutas protegidas rechazan peticiones sin token
- [ ] Las rutas admin rechazan usuarios con rol `user`
- [ ] Las contraseñas no se almacenan en texto plano
- [ ] Los errores de validación devuelven 400 con detalles
- [ ] Las rutas inexistentes devuelven 404
- [ ] Los errores internos devuelven 500 sin stacktrace (en producción)
