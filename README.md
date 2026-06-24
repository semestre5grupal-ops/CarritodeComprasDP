# 🛍️ Shop Sport — Carrito de Compras Full Stack

> **Reto de Desempeño Académico 3 (RDA 3)** — Desarrollo de Plataformas, Semestre 5  
> Aplicación web Full Stack con arquitectura **MVC en N-capas**, autenticación **JWT**, **pruebas unitarias**, **análisis estático** y **despliegue en la nube**.

[![Frontend](https://img.shields.io/badge/Frontend-Vue%203%20%2B%20Vite-42b883?logo=vue.js)](https://vuejs.org/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=node.js)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%2B%20Prisma-336791?logo=postgresql)](https://www.postgresql.org/)
[![CSS](https://img.shields.io/badge/Estilos-Tailwind%20CSS-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![ESLint](https://img.shields.io/badge/Linting-ESLint-4B32C3?logo=eslint)](https://eslint.org/)
[![Testing](https://img.shields.io/badge/Testing-Jest%20%2B%20Vitest-C21325?logo=jest)](https://jestjs.io/)
[![Deploy](https://img.shields.io/badge/Deploy-Render%20%2B%20Vercel-0f172a)](https://render.com/)

---

## 📑 Tabla de Contenidos

1. [Descripción General del Sistema](#descripción-general-del-sistema)
2. [Arquitectura MVC](#arquitectura-mvc)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Inicio Rápido (Instalación Local)](#inicio-rápido-instalación-local)
6. [Credenciales de Prueba](#credenciales-de-prueba)
7. [API REST — Endpoints](#api-rest--endpoints)
8. [Seguridad Aplicada (OWASP Top 10)](#seguridad-aplicada-owasp-top-10)
9. [Autenticación y Autorización con JWT](#autenticación-y-autorización-con-jwt)
10. [Persistencia con Base de Datos (ORM + PostgreSQL)](#persistencia-con-base-de-datos-orm--postgresql)
11. [Pruebas Unitarias](#pruebas-unitarias)
12. [Análisis Estático del Código (ESLint)](#análisis-estático-del-código-eslint)
13. [Optimización del Rendimiento](#optimización-del-rendimiento)
14. [Funcionalidades del Frontend](#funcionalidades-del-frontend)
15. [Despliegue en la Nube](#despliegue-en-la-nube)
16. [Variables de Entorno](#variables-de-entorno)
17. [Lecciones Aprendidas y Reflexión Final](#lecciones-aprendidas-y-reflexión-final)

---

## Descripción General del Sistema

**Shop Sport** es una plataforma de comercio electrónico completa de ropa deportiva, desarrollada de principio a fin como ejercicio de ingeniería de software profesional. El sistema cubre el ciclo completo de una aplicación web moderna: desde la interfaz visual hasta la persistencia en base de datos, pasando por seguridad, autenticación, pruebas y despliegue.

### Características Principales

| Característica | Detalle |
|---|---|
| **Catálogo dinámico** | 20+ productos con imágenes, filtros por categoría y paginación |
| **Carrito de compras** | Persistencia dual con localStorage e IndexedDB (soporte offline) |
| **Autenticación JWT** | Login / Registro con tokens seguros y expiración automática |
| **Roles y permisos** | Roles `admin` y `user` con control granular de acceso |
| **Panel Admin** | CRUD completo de productos, gestión de pedidos y usuarios |
| **Checkout** | Formulario de facturación, cupón de descuento, flujo online y offline |
| **Seguridad OWASP** | Validación, sanitización, hashing, CORS, Helmet, rate-limiting |
| **Pruebas** | 60 pruebas unitarias (36 backend + 24 frontend) con 100% de éxito |
| **Despliegue** | Backend en Render, Frontend en Vercel |

---

## Arquitectura MVC

El proyecto implementa el patrón **Modelo-Vista-Controlador (MVC)** en ambas capas, con responsabilidades claramente separadas.

### Diagrama General

```
┌──────────────────────────────────────────────────────────────────┐
│                      CLIENTE (Vue 3 + Vite)                       │
│                                                                    │
│   VISTA (Views + Components)                                       │
│   ┌─────────────────┐   ┌──────────────────────────────────────┐  │
│   │ HomeView.vue    │   │ CartDrawer.vue  ProductCard.vue      │  │
│   │ CatalogView.vue │   │ (Componentes reutilizables)          │  │
│   │ LoginView.vue   │   └──────────────────────────────────────┘  │
│   │ AdminView.vue   │                                             │
│   └────────┬────────┘                                             │
│            │ usa                                                   │
│   CONTROLADOR (Controllers/)                                       │
│   ┌──────────────────────┐   ┌──────────────────┐                │
│   │ ProductController.js  │   │ OrderController.js│                │
│   └──────────┬────────────┘   └────────┬─────────┘                │
│              │ llama a                  │                          │
│   MODELO (Models/)                                                │
│   ┌──────────────────────┐   ┌──────────────────┐                │
│   │ useCart.js (Estado)   │   │ useAuth.js       │                │
│   └──────────────────────┘   └──────────────────┘                │
│                          │ HTTP + JWT (Fetch API)                  │
└──────────────────────────┼─────────────────────────────────────────┘
                           │
┌──────────────────────────┼─────────────────────────────────────────┐
│                     SERVIDOR (Node.js + Express)                    │
│                                                                     │
│   MIDDLEWARE (Seguridad + Validación)                              │
│   auth.js → role.js → validate.js → errorHandler.js               │
│                           │                                         │
│   RUTAS (Routes/)                                                  │
│   /api/auth   /api/productos   /api/pedidos   /api/health          │
│                           │                                         │
│   CONTROLADOR (Controllers/)                                       │
│   ┌──────────────────┐ ┌──────────────────┐ ┌────────────────┐    │
│   │auth.controller.js│ │prod.controller.js│ │ped.controller.js│   │
│   └────────┬─────────┘ └────────┬─────────┘ └───────┬────────┘    │
│            │                    │                    │              │
│   MODELO (Models/) — Data Access Layer               │              │
│   ┌──────────────┐ ┌───────────────┐ ┌──────────────┐│            │
│   │auth.model.js │ │prod.model.js  │ │ped.model.js  ││            │
│   └──────────────┘ └───────────────┘ └──────────────┘│            │
│                           │                                         │
│   PRISMA ORM (lib/prisma.js — Singleton)                           │
│                           │                                         │
│   PostgreSQL en la nube (Render)                                   │
└─────────────────────────────────────────────────────────────────── ┘
```

### Separación de Responsabilidades

| Capa | Frontend | Backend |
|------|----------|---------|
| **Modelo** | `useCart.js`, `useAuth.js` — Estado reactivo global (Vue refs/computed) | `auth.model.js`, `producto.model.js`, `pedido.model.js` — DAO con Prisma |
| **Vista** | `Views/*.vue`, `Components/*.vue` — Plantillas HTML reactivas | Respuestas JSON (`res.json()`) |
| **Controlador** | `controllers/*.js` — Lógica de negocio, consume la API REST | `controllers/*.js` — Procesa req, llama al Modelo, envía la Vista |

---

## Stack Tecnológico

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| **Vue 3** (Composition API) | ^3.5 | Framework principal con `<script setup>` |
| **Vite** | ^6.x | Bundler, servidor de dev y build de producción |
| **Vue Router** | ^4.x | Navegación SPA con rutas protegidas (guards) |
| **Tailwind CSS** | ^3.x | Framework utilitario de estilos integrado |
| **Fetch API** | nativa | Comunicación HTTP con el backend |
| **IndexedDB** | nativa | Cola de pedidos offline |
| **Vitest** | ^3.x | Motor de pruebas unitarias para el cliente |

### Backend
| Tecnología | Versión | Uso |
|---|---|---|
| **Node.js** | v18+ | Entorno de ejecución |
| **Express** | ^4.x | Framework HTTP |
| **Prisma ORM** | ^6.x | Abstracción de base de datos y migraciones |
| **PostgreSQL** | 15 | Motor de base de datos relacional (en Render) |
| **jsonwebtoken** | ^9.x | Generación y verificación de JWT |
| **bcrypt** | ^5.x | Hash seguro de contraseñas |
| **express-validator** | ^7.x | Validación y sanitización de inputs |
| **helmet** | ^8.x | HTTP Security Headers |
| **cors** | ^2.x | Control de origen cruzado |
| **express-rate-limit** | ^7.x | Protección contra fuerza bruta |
| **morgan** | ^1.x | Logging de requests HTTP |
| **Jest + Supertest** | ^29.x / ^7.x | Pruebas unitarias e integración del backend |
| **ESLint** | ^9.x | Análisis estático del código |

---

## Estructura del Proyecto

```
CarritodeComprasDP/
│
├── README.md                        # Este documento
├── render.yaml                      # Configuración de despliegue en Render
├── .gitignore
│
├── server/                          # 🔧 Backend Node.js + Express
│   ├── package.json
│   ├── .env                         # Variables de entorno (no subir a Git)
│   ├── .env.example                 # Plantilla de variables de entorno
│   ├── eslint.config.cjs            # Configuración ESLint backend
│   ├── jest.config.js               # Configuración Jest
│   ├── prisma/
│   │   ├── schema.prisma            # Esquema de base de datos
│   │   └── seed.js                  # Script de población inicial de datos
│   └── src/
│       ├── index.js                 # Entry point, configuración Express
│       ├── lib/
│       │   └── prisma.js            # Singleton PrismaClient (conexión BD)
│       ├── config/
│       │   └── env.js               # Validación de variables de entorno
│       ├── middleware/
│       │   ├── auth.js              # Verificación JWT (authenticate)
│       │   ├── role.js              # Control de roles (requireAdmin)
│       │   └── validate.js          # Middleware de validación schemas
│       ├── validators/
│       │   ├── auth.validator.js    # Reglas para /auth (register, login)
│       │   └── producto.validator.js# Reglas para /productos (create)
│       ├── models/
│       │   ├── auth.model.js        # DAO usuarios (findByUsername, create)
│       │   ├── producto.model.js    # DAO productos (findAll, create, etc.)
│       │   └── pedido.model.js      # DAO pedidos y transacciones
│       ├── controllers/
│       │   ├── auth.controller.js   # Lógica login/register/profile
│       │   ├── producto.controller.js # Lógica CRUD productos
│       │   └── pedido.controller.js # Lógica creación y listado de pedidos
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── producto.routes.js
│       │   └── pedido.routes.js
│       └── __tests__/               # 🧪 Pruebas del backend
│           ├── setup.js             # Configuración del entorno de pruebas
│           ├── auth.middleware.test.js # 9 pruebas de middlewares JWT
│           ├── validators.test.js   # 14 pruebas de validadores
│           └── api.auth.test.js     # 13 pruebas de la API de autenticación
│
└── client/                          # 🎨 Frontend Vue 3 + Vite
    ├── package.json
    ├── vite.config.js               # Config Vite + Vitest + code splitting
    ├── tailwind.config.js           # Config Tailwind CSS
    ├── postcss.config.js
    ├── eslint.config.js             # Configuración ESLint frontend
    ├── index.html
    └── src/
        ├── main.js                  # Entry point + Router + Lazy Loading
        ├── App.vue                  # Shell principal
        ├── assets/
        │   └── styles.css           # Variables CSS, layout, Tailwind @base
        ├── services/
        │   ├── api.js               # Cliente Fetch + interceptor JWT 401
        │   └── db.js                # Cola offline con IndexedDB
        ├── models/                  # Estado global reactivo (MVC — Modelo)
        │   ├── useAuth.js           # Composable de autenticación
        │   └── useCart.js           # Composable del carrito (singleton)
        ├── controllers/             # Lógica de negocio (MVC — Controlador)
        │   ├── ProductController.js
        │   ├── OrderController.js
        │   └── UserController.js
        ├── components/
        │   ├── ProductCard.vue      # Tarjeta de producto accesible
        │   └── CartDrawer.vue       # Cajón lateral del carrito
        ├── views/                   # Páginas (MVC — Vista)
        │   ├── HomeView.vue
        │   ├── CatalogView.vue
        │   ├── LoginView.vue
        │   ├── RegisterView.vue
        │   ├── MyOrdersView.vue
        │   └── AdminView.vue
        └── __tests__/               # 🧪 Pruebas del frontend
            ├── setup.js             # Mock de localStorage/sessionStorage
            └── useCart.test.js      # 24 pruebas del composable useCart
```

---

## Inicio Rápido (Instalación Local)

### Requisitos Previos
- **Node.js** v18 o superior ([descargar](https://nodejs.org/))
- Una terminal de comandos (PowerShell, CMD, bash, etc.)

> **Nota:** El proyecto ya está conectado a una base de datos PostgreSQL alojada en la nube (Render). No es necesario instalar PostgreSQL localmente.

### Paso 1 — Clonar el repositorio
```bash
git clone https://github.com/TU_USUARIO/CarritodeComprasDP.git
cd CarritodeComprasDP
```

### Paso 2 — Configurar y levantar el Backend

Abre una terminal en la carpeta `server/`:

```bash
cd server

# Instalar dependencias
npm install

# El archivo .env ya viene con la conexión a la BD de producción.
# Regenerar el cliente Prisma:
npx prisma generate

# (Opcional) Poblar la BD con datos iniciales:
npm run seed

# Iniciar el servidor de desarrollo
npm run dev
```

✅ El backend quedará corriendo en **`http://localhost:4000`**

### Paso 3 — Levantar el Frontend

Abre **otra terminal nueva** en la carpeta `client/`:

```bash
cd client

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

✅ El frontend quedará corriendo en **`http://localhost:5173`**

### Paso 4 — Ejecutar las Pruebas

```bash
# Pruebas del backend (Jest) — desde la carpeta server/
npm test

# Pruebas del frontend (Vitest) — desde la carpeta client/
npm test

# Análisis estático del código — desde cada carpeta
npm run lint
```

---

## Credenciales de Prueba

Una vez en la aplicación (`http://localhost:5173`), puede iniciar sesión con:

| Rol | Usuario | Contraseña | Acceso |
|-----|---------|------------|--------|
| **Administrador** | `admin` | `Admin123!` | Panel de admin (CRUD completo) |
| **Usuario normal** | `usuario` | `User123!` | Catálogo, carrito y mis pedidos |

---

## API REST — Endpoints

El backend expone una API REST completa en `http://localhost:4000/api`:

### Autenticación (`/api/auth`)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Registrar nuevo usuario |
| `POST` | `/api/auth/login` | ❌ | Iniciar sesión, retorna JWT |
| `GET` | `/api/auth/profile` | ✅ JWT | Obtener perfil del usuario actual |

**Ejemplo de registro:**
```json
POST /api/auth/register
{
  "username": "nuevoUsuario",
  "email": "usuario@correo.com",
  "password": "Password1"
}
```
**Respuesta exitosa (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": 1, "username": "nuevoUsuario", "role": "user" }
}
```

### Productos (`/api/productos`)

| Método | Endpoint | Auth | Rol | Descripción |
|--------|----------|------|-----|-------------|
| `GET` | `/api/productos` | ❌ | — | Listar todos los productos |
| `GET` | `/api/productos/:id` | ❌ | — | Obtener producto por ID |
| `POST` | `/api/productos` | ✅ JWT | `admin` | Crear nuevo producto |
| `PUT` | `/api/productos/:id` | ✅ JWT | `admin` | Actualizar producto |
| `DELETE` | `/api/productos/:id` | ✅ JWT | `admin` | Eliminar producto |

### Pedidos (`/api/pedidos`)

| Método | Endpoint | Auth | Rol | Descripción |
|--------|----------|------|-----|-------------|
| `POST` | `/api/pedidos` | ✅ JWT | `user`/`admin` | Crear pedido (checkout) |
| `GET` | `/api/pedidos` | ✅ JWT | `admin` | Listar todos los pedidos |
| `GET` | `/api/pedidos/mis-pedidos` | ✅ JWT | `user`/`admin` | Listar pedidos del usuario actual |
| `DELETE` | `/api/pedidos/:id` | ✅ JWT | `admin` | Eliminar pedido |

### Sistema

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check — verifica que el servidor está activo |

---

## Seguridad Aplicada (OWASP Top 10)

Como parte de los requisitos de la **Clase 12**, se identificaron y mitigaron los siguientes riesgos críticos del OWASP Top 10:

### A01:2021 — Broken Access Control (Pérdida de Control de Acceso)
**Riesgo:** Un usuario sin privilegios podría acceder a endpoints administrativos como crear productos o ver pedidos de otros usuarios.

**Implementación:**
- Middleware `auth.js` verifica y decodifica el JWT en cada request protegido.
- Middleware `role.js` implementa **RBAC** (Role-Based Access Control): la función `requireAdmin` comprueba el campo `role` del token y retorna `403 Forbidden` si no es `admin`.
- En el frontend, el router guard `beforeEach` bloquea la navegación a rutas protegidas si no hay token válido, redirigiendo automáticamente a `/login`.

```javascript
// server/src/middleware/role.js
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'FORBIDDEN', message: 'Acceso denegado' })
  }
  next()
}
```

### A03:2021 — Injection (Inyección SQL / XSS)
**Riesgo:** Attackers podrían inyectar código malicioso en los formularios para manipular la base de datos (SQL Injection) o robar datos de usuarios (XSS).

**Implementación:**
- **SQL Injection:** Completamente mitigada usando **Prisma ORM**, que parametriza automáticamente todas las consultas. Nunca se construyen strings SQL directamente.
- **XSS (Cross-Site Scripting):** `express-validator` sanitiza todas las entradas del usuario (`trim()`, `escape()`). En el frontend, **Vue 3** escapa automáticamente todo el contenido interpolado (`{{ }}`) antes de insertarlo en el DOM.
- Validación de tipos estricta en todos los endpoints POST/PUT.

```javascript
// server/src/validators/auth.validator.js
body('username')
  .trim()
  .notEmpty()
  .matches(/^[a-zA-Z0-9_.-]+$/)  // Solo caracteres seguros
  .withMessage('Username inválido')
```

### A07:2021 — Identification and Authentication Failures (Fallos de Autenticación)
**Riesgo:** Exposición de contraseñas en texto plano, ataques de fuerza bruta o robo de sesiones.

**Implementación:**
- **Hashing seguro:** Las contraseñas **nunca** se almacenan en texto plano. Se usa `bcrypt` con factor de coste 12 (`bcrypt.hash(password, 12)`), lo que genera un hash unidireccional imposible de revertir.
- **JWT sin estado:** La autenticación usa **JSON Web Tokens** firmados con `HS256` y con expiración de 8 horas. El token viaja únicamente en el header `Authorization: Bearer <token>`.
- **Rate Limiting:** `express-rate-limit` limita a 100 requests por IP en una ventana de 15 minutos, bloqueando ataques de fuerza bruta.

### Otras Medidas de Seguridad

| Medida | Implementación | Archivo |
|--------|---------------|---------|
| **HTTP Security Headers** | Helmet activa headers como `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security` | `server/src/index.js` |
| **CORS Restringido** | Sólo se permiten requests desde el dominio del frontend (Vercel) | `server/src/index.js` |
| **Error Handling Seguro** | Middleware centralizado que nunca expone `stack traces` al cliente | `server/src/middleware/validate.js` |
| **Validación de passwords** | Mínimo 6 chars, al menos 1 mayúscula y 1 número (regex en frontend y backend) | `auth.validator.js` |
| **HTTPS** | Encriptación SSL/TLS nativa provista por los proxies de Render (backend) y Vercel (frontend) | Infraestructura |
| **Variables de entorno** | El `JWT_SECRET` y credenciales de BD nunca están hardcodeadas en el código | `.env` |

---

## Autenticación y Autorización con JWT

El flujo completo de autenticación es el siguiente:

```
Usuario                Frontend (Vue)              Backend (Express)
   │                        │                            │
   │──── POST /login ───────►│                            │
   │                        │─── POST /api/auth/login ──►│
   │                        │                            │─── bcrypt.compare()
   │                        │                            │─── jwt.sign({id, role})
   │                        │◄── { token, user } ────────│
   │                        │─── localStorage.setItem() ─►│ (guarda token)
   │◄── Redirige al Home ───│                            │
   │                        │                            │
   │──── GET /catalogo ─────►│                            │
   │                        │─── GET /api/productos ─────►│
   │                        │    Header: Bearer <token>  │─── jwt.verify()
   │                        │◄── { data: [...] } ─────────│
   │◄── Muestra catálogo ───│                            │
```

### Estructura del Token JWT

```json
{
  "header": { "alg": "HS256", "typ": "JWT" },
  "payload": {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "iat": 1750800000,
    "exp": 1750828800
  }
}
```

---

## Persistencia con Base de Datos (ORM + PostgreSQL)

### Prisma ORM

Se utiliza **Prisma** como capa de abstracción entre la lógica de negocio y PostgreSQL. Prisma provee:
- **Type-safety:** Errores de tipo detectados en tiempo de desarrollo.
- **Migraciones:** Control de versiones del esquema de base de datos.
- **Queries parametrizadas:** Protección automática contra SQL Injection.

### Modelo de Datos (Tablas Principales)

```
usuarios          productos           documentos (pedidos)
─────────         ─────────────       ────────────────────
id (PK)           id_producto (PK)    id_documento (PK)
username          pro_descripcion     id_cliente (FK)
email             pro_valor_compra    id_vendedor (FK)
password_hash     pro_imagen          doc_total
role              id_categoria (FK)   doc_emision
created_at        pro_estado          doc_estado

          variantes_producto          productosxdocumento
          ──────────────────          ───────────────────
          id_variante (PK)            id_documento (FK)
          id_producto (FK)            id_variante (FK)
          id_color (FK)               pxd_cantidad
          id_talla (FK)               pxd_valor_unitario
          var_precio_venta
```

### Patrón Singleton para Prisma

Para evitar múltiples conexiones en desarrollo (hot-reload), se implementó un singleton:

```javascript
// server/src/lib/prisma.js
const { PrismaClient } = require('@prisma/client')

const prisma = globalThis.__prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}
module.exports = prisma
```

---

## Pruebas Unitarias

Se implementó una suite completa de **60 pruebas unitarias** que cubren los componentes críticos del sistema.

### Backend — Jest + Supertest (36 pruebas)

```bash
cd server
npm test
```

| Suite | Pruebas | Descripción |
|-------|---------|-------------|
| `auth.middleware.test.js` | 9 | Verifica JWT válido, expirado, malformado; RBAC admin/user |
| `validators.test.js` | 14 | Valida/invalida campos de registro, login y creación de productos |
| `api.auth.test.js` | 13 | Pruebas E2E de la API: register, login, rutas protegidas |

**Resultado esperado:**
```
Test Suites: 3 passed, 3 total
Tests:       36 passed, 36 total
```

### Frontend — Vitest (24 pruebas)

```bash
cd client
npm test
```

| Suite | Pruebas | Descripción |
|-------|---------|-------------|
| `useCart.test.js` | 24 | Cubre todas las operaciones del carrito |

**Operaciones probadas:**
- `addProduct()` — Agregar y acumular productos
- `updateQuantity()` — Actualizar cantidad y auto-eliminar si llega a 0
- `removeProduct()` — Eliminar un producto específico
- `clearCart()` — Vaciar completamente el carrito
- `itemCount` (computed) — Total de ítems
- `subtotal`, `discount`, `total` (computed) — Cálculos financieros con cupón

**Resultado esperado:**
```
Test Files:  1 passed, 1 total
Tests:       24 passed, 24 total
```

---

## Análisis Estático del Código (ESLint)

Se configuró **ESLint** con reglas específicas para cada capa del proyecto, garantizando calidad y consistencia del código.

```bash
# Analizar el backend
cd server && npm run lint

# Analizar el frontend
cd client && npm run lint

# Corregir automáticamente lo que sea posible
npm run lint:fix
```

**Resultado esperado (0 errores, 0 warnings):**
```
> eslint src --ext .js
(sin salida — código completamente limpio)
```

### Reglas Destacadas Configuradas

| Regla | Propósito |
|-------|-----------|
| `no-eval` / `no-implied-eval` | Seguridad: previene ejecución de código dinámico |
| `curly: all` | Obliga el uso de `{}` en todos los bloques if/else |
| `eqeqeq: always` | Obliga comparaciones estrictas (`===`) |
| `no-unused-vars` | Detecta variables declaradas y no utilizadas |
| `prefer-const` | Promueve inmutabilidad con `const` |
| `vue/component-api-style` | Obliga el uso de `<script setup>` en Vue |

---

## Optimización del Rendimiento

### Lazy Loading de Rutas

Las vistas se cargan de forma diferida al momento de la navegación, reduciendo el tiempo de carga inicial de la aplicación:

```javascript
// client/src/main.js
const routes = [
  { path: '/', component: () => import('./views/HomeView.vue') },
  { path: '/catalogo', component: () => import('./views/CatalogView.vue') },
  { path: '/login', component: () => import('./views/LoginView.vue') },
  // ...
]
```

**Cómo verificarlo:** Abre las DevTools del navegador (`F12`) → pestaña **Red (Network)** → al navegar entre páginas, verás cómo se descarga un archivo `.js` independiente por cada vista visitada por primera vez.

### Code Splitting (División de código)

Configurado en Vite para separar las dependencias pesadas en bundles independientes con caché de larga duración:

```javascript
// client/vite.config.js
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['vue', 'vue-router'],
      }
    }
  }
}
```

### Otras Optimizaciones

| Optimización | Implementación |
|---|---|
| **Imágenes lazy** | Atributo `loading="lazy"` en todas las imágenes del catálogo |
| **Singleton BD** | Prisma con singleton global evita reconexiones en dev |
| **Fetch API nativa** | Sin dependencias pesadas como Axios para el cliente HTTP |
| **CSS Variables** | Sistema de diseño con custom properties reutilizables |

---

## Funcionalidades del Frontend

### Catálogo de Productos
- Carga dinámica desde `/api/productos` al montar la vista
- Filtros por categoría (Mujer, Hombre, Unisex)
- Estados de UI: cargando (spinner), error (con botón reintentar), vacío
- Añadir al carrito con un clic

### Carrito de Compras (CartDrawer)
- Panel lateral deslizante con animaciones CSS
- **Persistencia:** Items en `localStorage`, timestamp en `sessionStorage`
- Selección múltiple y eliminación en lote (bulk delete)
- Ajuste de cantidad por ítem con límite de stock
- Cupón de descuento (`DEPORTE20` → 20% off)
- Formulario de datos de facturación con validación en tiempo real
- **Modo offline:** Si no hay conexión, el pedido se guarda en `IndexedDB` y se procesa automáticamente cuando regresa la red

### Autenticación
- Formularios de Login y Registro con validación regex en el cliente
- Mensajes de error accesibles con `aria-live` y `role="alert"`
- Interceptor automático: si el servidor retorna `401`, se limpia el token y se redirige al login

### Panel de Administración (`/admin`)
- Ruta protegida: sólo accesible con rol `admin`
- **Pestaña Productos:** Crear, editar y eliminar con modales `<dialog>` nativos
- **Pestaña Pedidos:** Ver todos los pedidos con sus detalles
- **Pestaña Usuarios:** Gestión de cuentas de usuario
- Feedback visual inmediato (spinners, mensajes de éxito/error)

### Vista Mis Pedidos
- Lista todos los pedidos del usuario autenticado
- Detalle de productos comprados, cantidades y precios

---

## Despliegue en la Nube

La aplicación está desplegada en dos servicios de nube especializados:

| Capa | Servicio | URL |
|------|----------|-----|
| **Backend (API)** | [Render](https://render.com) | `https://shopsport-api.onrender.com` |
| **Frontend** | [Vercel](https://vercel.com) | `https://carrito-de-compras-dp.vercel.app` |
| **Base de datos** | Render PostgreSQL | Gestionada internamente en Render |

### Configuración del Despliegue

El archivo `render.yaml` en la raíz del proyecto define la infraestructura como código:

```yaml
services:
  - type: web
    name: shopsport-api
    env: node
    buildCommand: cd server && npm install && npx prisma generate
    startCommand: cd server && node src/index.js
```

### Variables de Entorno en Producción (Render)

Las siguientes variables deben configurarse en el dashboard de Render:
- `DATABASE_URL` — URL completa de conexión a PostgreSQL
- `JWT_SECRET` — Clave secreta para firmar los tokens (mínimo 32 chars)
- `CORS_ORIGIN` — URL de Vercel del frontend
- `NODE_ENV=production`

---

## Variables de Entorno

### Backend (`server/.env`)

```env
# Puerto del servidor
PORT=4000
NODE_ENV=development

# Conexión a PostgreSQL (Render)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public"

# Seguridad JWT
JWT_SECRET="tu-clave-secreta-muy-larga-y-aleatoria-aqui"
JWT_EXPIRES_IN="8h"

# CORS
CORS_ORIGIN="http://localhost:5173,https://tu-app.vercel.app"

# Logging
LOG_LEVEL=dev
```

> ⚠️ **Nunca subas el archivo `.env` a Git.** El repositorio incluye `.env.example` con la plantilla.

### Frontend (`client/.env.local`)

```env
# URL del backend (local o de producción)
VITE_API_BASE_URL=http://localhost:4000/api
```

---

## Lecciones Aprendidas y Reflexión Final

### Decisiones Técnicas Clave

**1. Arquitectura en capas MVC aplicada a ambos lados**  
Separar la lógica de negocio de la presentación demostró ser fundamental para la mantenibilidad del código. En el frontend, tener `controllers/` independientes de las `views/` permitió reutilizar la misma lógica de fetching en múltiples componentes sin duplicar código.

**2. JWT como mecanismo de autenticación sin estado**  
La elección de JWT sobre cookies de sesión simplificó enormemente el despliegue en servicios stateless como Render, donde no hay garantía de afinidad de sesión. El intercept automático del 401 en el frontend mejoró significativamente la experiencia de usuario.

**3. Prisma ORM como protección inherente contra SQL Injection**  
En lugar de implementar sanitización manual de queries, delegar todo a Prisma garantizó protección automática y consistente. Fue una decisión de seguridad por diseño (Security by Design) en lugar de reaccionar a vulnerabilidades.

**4. Pruebas unitarias independientes del entorno**  
Diseñar las pruebas del frontend usando mocks de `localStorage` (con `globalThis`) y las del backend con una base de datos de prueba separada (`.env.test`) demostró que las pruebas robustas no deben depender de infraestructura externa.

**5. Lazy Loading como optimización automática**  
Implementar carga diferida de rutas con `() => import()` redujo el tamaño del bundle inicial sin cambiar la experiencia del usuario. Es una práctica que debería aplicarse desde el inicio de cualquier SPA.

### Retos Superados

- **CORS en producción:** El primer despliegue falló por no incluir la URL de Vercel en la whitelist de CORS. La solución fue configurar `CORS_ORIGIN` como variable de entorno y no hardcodear dominios.
- **Singleton de Prisma en dev:** El hot-reload de Nodemon creaba múltiples instancias de PrismaClient agotando el pool de conexiones. El patrón `globalThis.__prisma` resolvió esto elegantemente.
- **Estado reactivo del carrito:** La naturaleza singleton del composable `useCart.js` requirió mocks cuidadosos en las pruebas para resetear el estado entre cada test.

---

**Versión:** 6.0.0 · **Última actualización:** Junio 2026  
**Autor:** Estudiante RDA3 · Semestre 5 · Interacción Humano-Computador  
**Tecnologías:** Vue 3 · Node.js · Express · Prisma · PostgreSQL · Tailwind CSS · Jest · Vitest · ESLint
