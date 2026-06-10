# Shop Sport — Carrito de Compras Full Stack

> Tienda de ropa deportiva minimalista. Aplicación Full Stack con **Vue 3 (Vite)** en el frontend y **Node.js + Express + Prisma + PostgreSQL** en el backend.

---

## Descripción del Proyecto

**Shop Sport** es una plataforma de comercio electrónico completa desarrollada con arquitectura **MVC en N-capas**. Implementa catálogo dinámico con 20+ productos, carrito de compras con persistencia dual, autenticación JWT con roles (user/admin), panel de administración con CRUD de productos y gestión de pedidos, y check-out progresivo con soporte offline mediante IndexedDB.

Desarrollado como parte del **Reto 2-5 — Desarrollo de Plataformas** (Semestre 5) bajo principios de **OWASP**, **WCAG 2.2 AA** y **Mobile-First**.

---

## Arquitectura

```
┌──────────────────────────────────────────────────────────────┐
│                     CLIENTE (Vue 3 + Vite)                    │
│  ┌──────────┐  ┌──────────────┐  ┌─────────────────────────┐ │
│  │  Views/   │  │  Components/ │  │        Models/          │ │
│  │ (Vistas)  │◄─┤ (Componentes)│◄─┤   (Estado Reactivo)     │ │
│  │   MVC-V   │  │    MVC-V     │  │        MVC-M            │ │
│  └─────┬─────┘  └──────────────┘  └───────────┬─────────────┘ │
│        │                                      │               │
│        └────────►  Controllers/   ◄───────────┘               │
│                    (Controladores MVC-C)                      │
│                           │ HTTP (Fetch + JWT)                │
└───────────────────────────┼───────────────────────────────────┘
                            │
┌───────────────────────────┼───────────────────────────────────┐
│                     SERVIDOR (Node.js + Express)               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                    Routes (Ruteo)                        │ │
│  │  /api/auth  /api/productos  /api/pedidos  /api/health    │ │
│  └────────────────────────┬─────────────────────────────────┘ │
│                           ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │               Controllers (Controladores)                │ │
│  │  authController  productoController  pedidoController    │ │
│  └────────────────────────┬─────────────────────────────────┘ │
│                           ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                     Models (Modelos)                     │ │
│  │     authModel      productoModel       pedidoModel       │ │
│  └────────────────────────┬─────────────────────────────────┘ │
│                           ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │       Middlewares (Seguridad + Validación)                │ │
│  │  auth (JWT)  role (RBAC)  validate (express-validator)   │ │
│  │  errorHandler  cors  helmet  morgan  rate-limit           │ │
│  └────────────────────────┬─────────────────────────────────┘ │
│                           ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │          Prisma ORM (Data Access Layer)                   │ │
│  │  productos, variantes, usuarios, documentos, bodega, etc. │ │
│  └────────────────────────┬─────────────────────────────────┘ │
│                           ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              PostgreSQL (Persistencia en Render)          │ │
│  └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## Stack Tecnológico

| Capa | Tecnología | Características |
|------|-----------|-----------------|
| **Frontend** | Vue 3 (Composition API) + Vite | Modelos (`models/`), Vistas (`views/`) y Controladores (`controllers/`) |
| **Backend** | Node.js + Express | MVC Completo (Modelos, Vistas JSON, Controladores), JWT, RBAC |
| **ORM** | Prisma | Migraciones, seed, abstracción de datos |
| **Base de datos** | PostgreSQL | Modelo relacional avanzado (productos, variantes, bodega, documentos, clientes) |
| **Seguridad** | OWASP | bcrypt, helmet, CORS, rate-limit, validación de schemas |

---

## Inicio Rápido (Guía Paso a Paso para Evaluadores)

Para ejecutar este proyecto en su máquina local, siga estrictamente estos pasos:

### 1. Requisitos Previos
- **Node.js** v18 o superior.
- Este proyecto ya está conectado a una base de datos **PostgreSQL alojada en la nube (Render)**. No es necesario instalar ninguna base de datos local ni configurar SSMS. El archivo `.env` ya incluye la URL de conexión de producción.

### 3. Levantar el Backend (API)
Abra una terminal en la carpeta principal del proyecto (`CarritodeComprasDP`) y ejecute:

```bash
# 1. Entrar a la carpeta del servidor
cd server

# 2. Instalar dependencias
npm install

# 3. La conexión a la BD remota de PostgreSQL ya está en el .env incluido.
# Si deseas aplicar cambios al esquema de Prisma en el futuro:
npx prisma generate


# 5. Llenar la base de datos con los 20 productos iniciales y 2 usuarios
npm run seed

# 6. Iniciar el servidor
npm run dev
```
*El servidor backend quedará corriendo en `http://localhost:4000`.*

### 4. Levantar el Frontend (Cliente)
Abra **otra terminal nueva** en la carpeta principal del proyecto (sin cerrar la del backend) y ejecute:

```bash
# 1. Entrar a la carpeta del cliente
cd client

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo de Vite
npm run dev
```
*El cliente frontend quedará corriendo en `http://localhost:5173`. Haga Ctrl+Clic en el enlace de la terminal para abrir la aplicación en su navegador.*

### 5. Usuarios por defecto (Credenciales de Prueba)
Una vez en la aplicación, puede probar las rutas protegidas y el carrito iniciando sesión con:

| Usuario   | Contraseña  | Rol   |
|-----------|-------------|-------|
| `admin`   | `Admin123!` | admin |
| `usuario` | `User123!`  | user  |

---

## Estructura del Proyecto

```
CarritodeComprasDP/
│
├── README.md
├── server/                         # Backend Node.js + Express
│   ├── package.json
│   ├── .env
│   ├── prisma/
│   │   ├── schema.prisma           # Schema de BD PostgreSQL
│   │   └── data.sql                # Seed script
│   └── src/
│       ├── index.js                # Entry point
│       ├── lib/
│       │   └── prisma.js           # Singleton PrismaClient
│       ├── middlewares/
│       │   ├── auth.js             # JWT verification
│       │   ├── role.js             # Role-based access
│       │   └── validate.js         # Validaciones
│       ├── models/
│       │   ├── auth.model.js       # Data Access Object para Usuarios
│       │   ├── pedido.model.js     # DAO para Documentos e Inventario
│       │   └── producto.model.js   # DAO para Productos
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── producto.controller.js
│       │   └── pedido.controller.js
│       └── routes/
│           ├── auth.routes.js
│           ├── producto.routes.js
│           └── pedido.routes.js
│
├── client/                         # Frontend Vue 3 + Vite
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── public/
│   │   └── images/                 # Imágenes de productos
│   └── src/
│       ├── main.js                 # Entry point + Router
│       ├── App.vue                 # Shell (header/footer/CartDrawer)
│       ├── assets/
│       │   └── styles.css          # Variables, layout, mobile-first
│       ├── services/
│       │   ├── api.js              # Fetch client + JWT interceptor
│       │   └── db.js               # IndexedDB offline queue
│       ├── models/                 # Modelos del Cliente (Estado Reactivo MVC)
│       │   ├── useAuth.js          # Auth state (singleton)
│       │   └── useCart.js          # Cart state + localStorage/sessionStorage
│       ├── controllers/            # Controladores MVC
│       │   ├── ProductController.js
│       │   └── OrderController.js
│       ├── components/
│       │   ├── ProductCard.vue     # ARIA product card
│       │   └── CartDrawer.vue      # Side drawer + focus trap + offline
│       └── views/                  # Vistas MVC
│           ├── CatalogView.vue     # Catálogo con filtros
│           ├── LoginView.vue       # Login con regex + ARIA
│           ├── RegisterView.vue    # Register con regex + ARIA
│           └── AdminView.vue       # Admin panel (CRUD + pedidos)
│
├── app/                            # Frontend legacy (Reto 1)
│   └── view/assets/images/         # Imágenes originales
│
└── docs 2/                         # Documentación continua
    ├── architecture/               # ADRs y visión arquitectónica
    ├── design_sessions/            # Sesiones de diseño activas
    ├── api/                        # Documentación de endpoints
    ├── context/                    # Restricciones de diseño
    ├── product-requirements.md
    ├── technical-requirements.md
    └── golden-rules.md
```

---

## Seguridad OWASP Implementada

| Práctica | Implementación |
|----------|---------------|
| **Autenticación segura** | JWT con 8h de expiración, bcrypt con 12 rounds de sal |
| **Control de acceso (RBAC)** | Middleware `role.js`: admin vs user por endpoint |
| **Validación de entrada** | `express-validator` en todos los endpoints + regex client-side |
| **Protección CSRF** | SameSite cookies + JWT en header (no cookies) |
| **Rate Limiting** | express-rate-limit configurado globalmente |
| **HTTP Security Headers** | Helmet middleware activado |
| **CORS restringido** | Solo orígenes permitidos en desarrollo |
| **Error handling seguro** | ErrorHandler centralizado sin leak de stack traces |
| **Prevención XSS** | Helmet, escape de input en frontend, Content-Type validado |
| **Sanitización SQL** | Prisma ORM previene inyección (queries parametrizadas) |

---

## API REST

Documentación completa de endpoints en [`docs 2/api/ENDPOINTS.md`](docs%202/api/ENDPOINTS.md).

| Endpoint | Método | Auth | Rol | Descripción |
|----------|--------|------|-----|-------------|
| `/api/health` | GET | — | — | Health check |
| `/api/auth/register` | POST | — | — | Registro de usuario |
| `/api/auth/login` | POST | — | — | Inicio de sesión |
| `/api/auth/profile` | GET | JWT | cualquiera | Perfil del usuario |
| `/api/productos` | GET | — | — | Listar productos |
| `/api/productos/:id` | GET | — | — | Producto por ID |
| `/api/productos` | POST | JWT | admin | Crear producto |
| `/api/productos/:id` | PUT | JWT | admin | Actualizar producto |
| `/api/productos/:id` | DELETE | JWT | admin | Eliminar producto |
| `/api/pedidos` | POST | JWT | cualquiera | Crear pedido |
| `/api/pedidos` | GET | JWT | admin/user* | Listar pedidos |

---

## Funcionalidades del Frontend

### Catálogo
- Listado dinámico con imágenes lazy-loading
- Filtro por categoría (Mujer, Hombre, Unisex)
- Estados: loading (spinner), error (retry), empty
- ARIA: roles, labels, live regions

### Carrito (CartDrawer)
- Drawer lateral con foco atrapado (focus trap)
- Persistencia dual: localStorage (items) + sessionStorage (timestamp)
- Selección múltiple y bulk delete
- Ajuste de cantidad (+/-) con límite de stock
- Cierre con Escape y backdrop click
- Checkout progresivo:
  - No autenticado → redirige a `/login`
  - Autenticado + online → `POST /api/pedidos`
  - Autenticado + offline → IndexedDB + `<dialog>` nativo

### Autenticación
- Login y Register con validación regex client-side
- `aria-invalid`, `aria-describedby`, `role="alert"`
- JWT in localStorage con interceptor 401
- Router guard para rutas protegidas

### Panel Admin
- CRUD completo de productos con `<dialog>` modal
- Tabla de pedidos con detalles por usuario
- Tabs: Productos / Pedidos
- Errores accesibles con `role="alert"`

---

## Accesibilidad (WCAG 2.2 AA)

| Principio | Implementación |
|-----------|---------------|
| **Perceptible** | `alt` en imágenes, contraste 4.5:1, roles ARIA, `aria-label` |
| **Operable** | Skip-link, foco visible, focus trap, teclado completo, `Escape` en modales |
| **Comprensible** | `<label>` asociados, `aria-describedby`, `aria-live`, `aria-invalid` |
| **Robusto** | `<dialog>` nativo, HTML5 semántico, roles `navigation`, `alert`, `status` |

---

## Estrategias de Persistencia

| Mecanismo | Clave / Store | Propósito |
|-----------|--------------|-----------|
| **localStorage** | `shopsport_cart` | Items del carrito |
| **sessionStorage** | `shopsport_cart_ts` | Timestamp última actualización |
| **IndexedDB** | `ShopsportOffline` → `colaTareas` | Pedidos offline en cola |
| **JWT** | `shopsport_token` | Token de autenticación |

---

## Versión

**Versión:** 5.0.0 · **Última actualización:** Junio 2026 · **Accesibilidad:** WCAG 2.2 AA
