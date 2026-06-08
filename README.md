# Shop Sport — Carrito de Compras Full Stack

> Tienda de ropa deportiva minimalista. Aplicación Full Stack con **Vue 3 (Vite)** en el frontend y **Node.js + Express + Prisma + SQL Server** en el backend.

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
│  │  Views/   │  │  Components/ │  │  Composables/ + Services│ │
│  │ (Vistas)  │◄─┤ (Componentes)│◄─┤ (Estado + API + DB)    │ │
│  │   MVC-V   │  │    MVC-V     │  │     MVC-M               │ │
│  └─────┬─────┘  └──────────────┘  └───────────┬─────────────┘ │
│        └──────────────────┬───────────────────┘               │
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
│  │       Middlewares (Seguridad + Validación)                │ │
│  │  auth (JWT)  role (RBAC)  validate (express-validator)   │ │
│  │  errorHandler  cors  helmet  morgan  rate-limit           │ │
│  └────────────────────────┬─────────────────────────────────┘ │
│                           ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │          Prisma ORM (Modelo de datos)                     │ │
│  │  Producto  Usuario  Pedido  PedidoDetalle  Role (enum)   │ │
│  └────────────────────────┬─────────────────────────────────┘ │
│                           ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              SQL Server (Persistencia)                    │ │
│  └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## Stack Tecnológico

| Capa | Tecnología | Características |
|------|-----------|-----------------|
| **Frontend** | Vue 3 (Composition API) + Vite | `<script setup>`, SFC, Router, Fetch API, IndexedDB |
| **Backend** | Node.js + Express | MVC, middlewares, JWT, RBAC, express-validator |
| **ORM** | Prisma | Migraciones, seed, esquema declarativo |
| **Base de datos** | SQL Server | Modelo relacional con 4 tablas + enum Role |
| **Seguridad** | OWASP | bcrypt, helmet, CORS, rate-limit, validación, JWT |

---

## Inicio Rápido (Guía Paso a Paso para Evaluadores)

Para ejecutar este proyecto en su máquina local, siga estrictamente estos pasos:

### 1. Requisitos Previos
- **Node.js** v18 o superior.
- **SQL Server** instalado localmente.
- **SQL Server Management Studio (SSMS)** u otro gestor de bases de datos.

### 2. Configuración de la Base de Datos
1. Abra SQL Server Management Studio y conéctese a su servidor usando **Autenticación de Windows** (Integrated Security).
2. Haga clic derecho en la carpeta "Bases de datos" -> **Nueva base de datos...**
3. Nómbrela exactamente **`ShopSportDB`** y presione OK.
   *(Nota: No es necesario crear tablas, el ORM Prisma se encargará de construirlas).*

### 3. Levantar el Backend (API)
Abra una terminal en la carpeta principal del proyecto (`CarritodeComprasDP`) y ejecute:

```bash
# 1. Entrar a la carpeta del servidor
cd server

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
# Copie el archivo .env.example y renómbrelo a .env
# (El archivo viene preconfigurado para Autenticación de Windows local)
cp .env.example .env

# 4. Construir las tablas en SQL Server
npx prisma migrate dev --name init

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
│   │   ├── schema.prisma           # Modelo de datos
│   │   └── seed.js                 # Datos iniciales
│   └── src/
│       ├── index.js                # Entry point
│       ├── lib/
│       │   └── prisma.js           # Singleton PrismaClient
│       ├── middlewares/
│       │   ├── auth.js             # JWT verification
│       │   ├── role.js             # Role-based access
│       │   ├── validate.js         # express-validator
│       │   └── errorHandler.js     # Error centralizado
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── productoController.js
│       │   └── pedidoController.js
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
│       ├── composables/
│       │   ├── useAuth.js          # Auth state (singleton)
│       │   └── useCart.js          # Cart state + localStorage/sessionStorage
│       ├── components/
│       │   ├── ProductCard.vue     # ARIA product card
│       │   └── CartDrawer.vue      # Side drawer + focus trap + offline
│       └── views/
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
