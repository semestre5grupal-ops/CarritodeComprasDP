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

Como parte de los requerimientos de seguridad, se han identificado y mitigado los siguientes **3 riesgos del OWASP Top 10**:

### 1. A01:2021-Broken Access Control (Pérdida de Control de Acceso)
- **Riesgo:** Un usuario común podría intentar acceder a endpoints administrativos (como crear o eliminar productos, o ver los pedidos de otros).
- **Mitigación:** Implementación del middleware `role.js` en el backend. Todas las rutas de administración están protegidas con la función `requireAdmin`, que verifica el campo de rol dentro del JWT. Si un usuario sin el rol adecuado intenta acceder, el servidor responde con un código `403 Forbidden`. En el frontend, las vistas y botones de administración no se renderizan para usuarios sin privilegios.

### 2. A03:2021-Injection (Inyección)
- **Riesgo:** Atacantes podrían enviar caracteres maliciosos o comandos SQL a través de los formularios de login, registro o creación de productos para manipular la base de datos o ejecutar scripts cruzados (XSS).
- **Mitigación:** 
  - **Inyección SQL:** Se mitigó completamente delegando el acceso a datos al **ORM Prisma**, el cual parametriza automáticamente todas las consultas a PostgreSQL.
  - **Cross-Site Scripting (XSS):** Se implementó la librería `express-validator` en todas las rutas POST/PUT para validar tipos de datos y escapar (sanitize) los inputs, evitando que etiquetas HTML peligrosas lleguen a la BD. En el frontend, Vue 3 neutraliza automáticamente el contenido interpolado.

### 3. A07:2021-Identification and Authentication Failures (Fallos de Identificación y Autenticación)
- **Riesgo:** Robo de credenciales mediante ataques de fuerza bruta, interceptación o exposición de contraseñas en texto plano en la base de datos.
- **Mitigación:** 
  - **Hashing:** Las contraseñas NUNCA se guardan en texto plano. Se utiliza `bcrypt` para crear un hash con su respectiva sal al momento de registro.
  - **Autenticación sin estado:** Se utiliza **JSON Web Tokens (JWT)** firmados en lugar de cookies de sesión, los cuales tienen un tiempo de expiración y viajan en el header `Authorization`.
  - **Rate Limiting:** El middleware `express-rate-limit` bloquea intentos repetitivos y masivos de login (fuerza bruta).

| Prácticas Adicionales | Implementación |
|-----------------------|---------------|
| **HTTP Security Headers** | Helmet middleware activado para mitigar Clickjacking y MIME sniffing |
| **CORS restringido** | Middleware CORS para permitir solicitudes únicamente desde el dominio del frontend confiable |
| **Error handling seguro** | Middleware de error centralizado que evita exponer los `stack traces` internos al usuario final |
| **HTTPS (Puntos Extra)** | El tráfico se encripta end-to-end (SSL/TLS) de manera nativa utilizando los reverse proxies de Vercel (Frontend) y Render (Backend) |

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
