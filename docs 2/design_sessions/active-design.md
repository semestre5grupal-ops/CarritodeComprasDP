# Active Design Specification — Fase 2: Controladores y Rutas de la API REST

## Feature Name
Fase 2 — Controladores, Rutas, Validadores y Manejo de Errores Prisma

---

## Problem Statement
Completar y refinar la lógica de negocio de los controladores, rutas y validadores del backend, asegurando que todos los endpoints funcionen correctamente con middlewares de seguridad, manejo de errores de Prisma, y documentación de API.

---

## Scope

### Incluido
- Refactor de `pedido.controller.js`: `GET /api/pedidos` unificado — admin ve todos, user ve solo los suyos
- Captura de errores específicos de Prisma (`P2002`, `P2003`, `P2025`) en todos los controladores
- Route `pedido.routes.js`: eliminada dependencia innecesaria de `authorize`, `GET /` usa solo `authenticate`
- Validadores completos con `express-validator` (sanitización `trim`, `escape`, `normalizeEmail`)
- Documentación completa de API en `docs 2/api/ENDPOINTS.md`
- Actualización de `docs 2/design_sessions/active-design.md`
- Documentación de seguridad y manejo de errores Prisma en `docs 2/api/ENDPOINTS.md`

### Excluido
- Frontend Vue.js (Fase 3)
- Panel de administración (Fase 5)
- Pruebas automatizadas (Fase 5)

---

## Implementation Details (Fase 2)

### Archivos modificados/mejorados

| Archivo | Cambio en Fase 2 |
|---------|------------------|
| `server/src/controllers/pedido.controller.js` | `getAll` ahora es role-aware: admin → todos, user → solo propios. Captura error Prisma `P2003` en `create` |
| `server/src/controllers/producto.controller.js` | Captura error Prisma `P2003` en `remove` (producto con pedidos asociados) |
| `server/src/controllers/auth.controller.js` | Captura error Prisma `P2002` en `register` (unique constraint en race condition) |
| `server/src/routes/pedido.routes.js` | Eliminado `authorize('admin')` de `GET /` (la lógica de rol está en el controller). Eliminado import innecesario |
| `docs 2/api/ENDPOINTS.md` | **NUEVO**: Documentación completa de todos los endpoints, ejemplos request/response y tabla de roles |

### Mejoras de lógica implementadas

#### `pedido.controller.js` — `getAll` unificado
```javascript
const where = role === 'admin' ? {} : { userId }
```
Un solo endpoint `GET /api/pedidos` que:
- Si `req.user.role === 'admin'`: retorna **todos** los pedidos con datos del usuario
- Si `req.user.role === 'user'`: filtra solo los pedidos del usuario autenticado

#### Captura de errores Prisma
Se agregaron bloques `catch (err)` específicos en todos los controladores:

| Controlador | Código Prisma | Condición | Respuesta HTTP |
|-------------|---------------|-----------|----------------|
| `auth.controller.js` | `P2002` | Unique constraint (username/email duplicado en race condition) | 409 |
| `pedido.controller.js` | `P2003` | Foreign key falla (productoId no existe) | 400 |
| `producto.controller.js` | `P2003` | Foreign key (producto con pedidos asociados al eliminar) | 409 |

#### Validadores — express-validator completo
- `auth.validator.js`: username (3-30 chars, alfanumérico + `_`), email (formato + normalize), password (6-50, must have upper+lower+number)
- `producto.validator.js`: nombre (2-100, escape), precio (float positivo), stock (int ≥0), categoria (max 50), imagen (max 255)
- `pedido.validator.js`: detalles array min 1, productoId int ≥1, cantidad int ≥1, precioUnitario float positivo

### Documentación de API

Se creó `docs 2/api/ENDPOINTS.md` con:
- Convenciones generales (base URL, headers, formatos de respuesta)
- Documentación de cada endpoint: método, ruta, headers, body, respuesta esperada, errores
- Tabla resumen de roles y protección por endpoint
- Ejemplos JSON completos para request y response

---

## Test Plan
- `POST /api/auth/register` con body válido → 201 + JWT
- `POST /api/auth/register` con username duplicado → 409
- `POST /api/auth/login` con credenciales correctas → 200 + JWT
- `POST /api/auth/login` con credenciales incorrectas → 401
- `GET /api/auth/profile` con JWT válido → 200
- `GET /api/auth/profile` sin token → 401
- `GET /api/productos` → 200 + array
- `GET /api/productos/:id` existente → 200
- `GET /api/productos/:id` inexistente → 404
- `POST /api/productos` con token admin → 201
- `POST /api/productos` con token user → 403
- `POST /api/productos` sin token → 401
- `PUT /api/productos/:id` con token admin → 200
- `DELETE /api/productos/:id` con token admin → 200
- `DELETE /api/productos/:id` con pedidos asociados → 409
- `POST /api/pedidos` con token user → 201 + descuenta stock
- `POST /api/pedidos` con stock insuficiente → 400
- `GET /api/pedidos` con token admin → todos los pedidos
- `GET /api/pedidos` con token user → solo sus pedidos
- `GET /api/pedidos/mis-pedidos` → pedidos del usuario
- Ruta inexistente → 404

---

## Risks / Edge Cases
- **Race condition en register**: Captura `P2002` de Prisma como fallback si dos usuarios registran el mismo username simultáneamente
- **Producto con pedidos asociados**: Captura `P2003` al eliminar, devuelve 409 con mensaje claro
- **Stock insuficiente**: Validación previa a la transacción, mensaje con nombre del producto y stock disponible
- **Transacción atómica**: `$transaction` asegura que el pedido y descuento de stock sean atómicos
- **Token expirado**: Middleware `auth.js` detecta `TokenExpiredError` y responde 401
- **Rol inconsistente**: El controller `getAll` lee `req.user.role` directamente del token JWT

---

## Open Questions
- Ninguna. Fase 2 completada y verificada.

---

# Active Design Specification — Fase 3: Frontend Architecture

## Feature Name
Fase 3 — Frontend Architecture (Vue 3 + Vite)

---

## Problem Statement
Implementar un cliente frontend moderno con Vue 3 Composition API y Vite que consuma la API REST existente, proporcionando una experiencia de usuario completa con autenticación, catálogo de productos y carrito de compras.

---

## Scope

### Incluido
- Cliente Vue 3 + Vite bajo `client/` con `<script setup>` y Composition API
- Servicios HTTP con Fetch API, inyección de JWT e intercepción de 401
- Composable `useAuth` para estado reactivo de autenticación y persistencia en localStorage
- Composable `useCart` para carrito reactivo con persistencia en localStorage y envío de pedidos
- Componente `App.vue` como shell del sitio con header sticky, nav, estado auth y footer
- Componente `ProductCard.vue` accesible (ARIA) con imagen, badge, precio, stock, selector de talla y botón
- Vista `CatalogView.vue` con estados loading/error/empty, filtros por categoría y grid responsive
- Hoja de estilos global con variables CSS, resets, layout sticky y breakpoints mobile-first
- Ruta `/` → CatalogView via `vue-router`

### Excluido
- Panel de administración (Fase 5)
- Pruebas automatizadas (Fase 5)
- PWA / Service Workers
- i18n / localización

---

## Implementation Details (Fase 3)

### Estructura de archivos

| Archivo | Propósito |
|---------|-----------|
| `client/src/services/api.js` | Cliente HTTP con Fetch API, inyección de JWT desde localStorage e intercepción de 401 |
| `client/src/composables/useAuth.js` | Estado reactivo de autenticación: user, isAuthenticated, isAdmin; login, register, logout, fetchProfile |
| `client/src/composables/useCart.js` | Carrito reactivo con persistencia en localStorage; add, remove, update, submitOrder; computed itemCount, subtotal, total |
| `client/src/App.vue` | Shell del sitio: header sticky con nav y estado de auth, cart icon, `<router-view>`, footer. Listener de evento `auth:expired` |
| `client/src/components/ProductCard.vue` | Card de producto ARIA-compliant con imagen (aspect-ratio), category badge, precio, indicador de stock, selector de talla y botón add-to-cart |
| `client/src/views/CatalogView.vue` | Catálogo con spinner de carga, estado de error con botón reintentar, empty state, chips de filtro por categoría y grid responsive con ProductCard |
| `client/src/assets/styles.css` | Variables CSS, resets base, layout sticky (header, nav-bar, footer), utilidades, breakpoints mobile-first |
| `client/public/images/` | Imágenes de productos copiadas y referenciadas desde ProductCard mediante `imageSrc` computado |

### Decisiones técnicas clave

| Decisión | Alternativa descartada | Razón |
|----------|------------------------|-------|
| Vanilla Fetch | Axios | Mínimas dependencias; la intercepción 401 se implementa con evento personalizado `auth:expired` |
| Composables | Pinia | Estado simple que no justifica el peso de una librería de store; los composables son suficientes para auth y cart |
| `GET /api/pedidos` unificado por rol | Endpoints separados (`/admin`, `/mis-pedidos`) | El backend ya implementa la diferenciación por `req.user.role` |

#### `api.js` — Cliente HTTP
```javascript
// Ejemplo de patrón de llamada con intercepción 401
const res = await fetch(url, { headers: { ...getAuthHeaders() } })
if (res.status === 401) {
  window.dispatchEvent(new CustomEvent('auth:expired'))
  throw new Error('Sesión expirada')
}
```

#### `useAuth.js` — Manejo de sesión
- `login` y `register` almacenan el token en localStorage y llaman a `fetchProfile`
- `logout` limpia localStorage y resetea el estado reactivo
- `fetchProfile` se invoca al montar la app si hay token guardado
- `isAdmin` es una propiedad computada basada en `user.value?.role`

#### `useCart.js` — Carrito persistente
- El estado se inicializa desde `localStorage.getItem('cart')`
- Cada mutación persiste automáticamente a localStorage
- `submitOrder` envía `POST /api/pedidos` con el detalle del carrito y lo vacía en éxito
- Propiedades computadas: `itemCount` (suma de cantidades), `subtotal` (suma precio * cantidad), `total` (subtotal sin impuesto)

#### `App.vue` — Shell del sitio
- Header sticky con `position: sticky; top: 0; z-index: 1000`
- Barra de navegación con enlaces, indicador de auth (login/register o username + logout) e icono de carrito con badge de conteo
- Escucha `window.addEventListener('auth:expired', ...)` para cerrar sesión automáticamente
- Footer con información del proyecto

#### `ProductCard.vue` — Card accesible
- Atributos ARIA: `role="article"`, `aria-label` con nombre del producto
- Imagen con `aspect-ratio: 4/3` y `object-fit: cover`
- Category badge con `position: absolute` sobre la imagen
- Indicador de stock: texto verde si hay, rojo "Agotado" si stock = 0
- Selector de talla (`<select>` con `v-model`) si el producto tiene el campo `talla`
- Botón "Agregar al carrito" deshabilitado si stock = 0
- Transiciones CSS en hover y `:focus-visible` para imagen y botón

#### `CatalogView.vue` — Vista de catálogo
- Estados visuales:
  - **Loading**: spinner CSS centrado
  - **Error**: mensaje + botón "Reintentar" que re-ejecuta `fetchProductos`
  - **Empty**: mensaje "No hay productos disponibles" cuando la lista está vacía
  - **Data**: grid responsive con `display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`
- Filtros por categoría: chips horizontales que al seleccionarse filtran la lista localmente
- Scroll suave al cambiar de página

### Ruteo
- `vue-router` con modo `createWebHistory`
- Ruta única: `{ path: '/', name: 'catalog', component: CatalogView }`

---

## Test Plan
- Login con credenciales válidas → token en localStorage, perfil cargado
- Login con credenciales inválidas → error mostrado, sin token
- Registro → token en localStorage, sesión iniciada
- Logout → localStorage limpio, estado reactivo reseteado
- Recargar página con token válido → sesión restaurada vía fetchProfile
- Token expirado → evento `auth:expired` → logout automático
- Agregar producto al carrito → itemCount actualizado, persistencia en localStorage
- Recargar página con carrito → items restaurados desde localStorage
- Eliminar producto del carrito → itemCount y subtotal recalculados
- Enviar pedido → POST exitoso, carrito vaciado, localStorage limpio
- Catálogo loading → spinner visible
- Catálogo error → botón reintentar funcional
- Catálogo empty → mensaje sin productos
- Filtro por categoría → solo productos de esa categoría visibles
- ProductCard sin stock → botón deshabilitado, indicador rojo
- Navegación responsive en mobile → menú legible, grid adaptativo

---

## Risks / Edge Cases
- **Token expirado durante navegación**: Cualquier 401 dispara `auth:expired`, forzando logout amigable
- **localStorage corrupto o lleno**: `JSON.parse` de carrito/envuelto en try/catch, fallback a array vacío
- **Carrusel de reintentos**: El botón reintentar en CatalogView solo ejecuta una nueva petición, sin bucle automático
- **Stock cero después de agregar al carrito**: El backend rechaza el pedido con 400; el frontend muestra el error y sugiere revisar el carrito
- **Doble clic en envío de pedido**: `submitOrder` usa un flag local `submitting` para deshabilitar el botón mientras la petición esté en curso
- **Imagen faltante**: `imageSrc` computado verifica si la ruta existe; fallback a placeholder CSS

---

## Open Questions
- Ninguna. Fase 3 definida para implementación.

---

## Fase 4 — Estado del Carrito, Auth y Checkout Progresivo

### Objetivo
Integrar la lógica del carrito con persistencia dual (localStorage + sessionStorage), vistas de autenticación accesibles (ARIA + regex), carrito lateral con focus trap y selectores múltiples, y checkout progresivo con soporte offline (IndexedDB).

### Archivos Creados/Modificados

| Archivo | Rol |
|---|---|
| `client/src/views/LoginView.vue` | Formulario de inicio de sesión con regex (username 3-30 chars, password mayúscula/minúscula/número 6-50 chars), validación HTML5 + client-side, `aria-invalid`, server error handling. Al login exitoso, guarda JWT y redirige a `/` |
| `client/src/views/RegisterView.vue` | Formulario de registro con validación de email regex, mismas reglas de password, detección de 409 (usuario duplicado) con mensaje amigable |
| `client/src/services/db.js` | Utilidad IndexedDB: `addToQueue`, `getPendingOrders`, `removeFromQueue`, `processQueue`. Store: `colaTareas` con auto-increment ID y índice por fecha |
| `client/src/composables/useCart.js` | **Actualizado.** Añade: `sessionStorage.setItem(CART_TS_KEY, Date.now())` en cada mutación; selección múltiple (`selectedIds`, `toggleSelected`, `removeSelected`); `drawerOpen` reactivo; `submitOrder` con detección de autenticación y online/offline |
| `client/src/components/CartDrawer.vue` | Drawer lateral con `role="dialog"`, `aria-modal`, `aria-labelledby`. Focus trap con Tab/Shift+Tab. Cierre con Escape. Checkboxes por item + "Seleccionar todos". Bulk delete. Controles de cantidad (+/-). Checkout: si no autenticado → redirige a `/login`; si autenticado + online → `POST /api/pedidos`; si autenticado + offline → guarda en IndexedDB `colaTareas`, muestra `<dialog>` nativo con `showModal()`. Transiciones CSS de slide/overlay. |
| `client/src/App.vue` | **Actualizado.** Importa `CartDrawer.vue`. Login button ahora es `<router-link to="/login">`. Cart button ahora llama `openDrawer()`. Logout navega a `/`. Brand linkeable a inicio. |
| `client/src/main.js` | **Actualizado.** Registra rutas `/login` y `/register` con sus respectivas vistas y meta títulos. |

### Estrategia de Persistencia (Rúbrica Reto 1)

- **localStorage:** Items del carrito guardados bajo `shopsport_cart`
- **sessionStorage:** Timestamp de última actualización bajo `shopsport_cart_ts` (se actualiza en cada `saveCart`)
- **IndexedDB:** Pedidos offline guardados en `colaTareas` con auto-increment y timestamp ISO

### Flujo de Checkout

1. Usuario presiona "Completar pedido"
2. Si no autenticado → redirigir a `/login` (carrito preservado en localStorage)
3. Si autenticado + online → `POST /api/pedidos` con array de `detalles`
4. Si autenticado + offline → guardar pedido en IndexedDB `colaTareas`, vaciar carrito, mostrar `<dialog>` accesible con mensaje de procesamiento diferido

### Reglas Técnicas Cumplidas

- Composition API (`<script setup>`) en todos los componentes
- Cero placeholders: IndexedDB CRUD completo, focus trap funcional, regex de validación completos
- WCAG 2.2 AA: `aria-invalid`, `aria-describedby`, `aria-live`, `role="alert"`, `aria-modal`, focus trap, `aria-label` descriptivos, skip-link preservado
- Mobile-first responsive: drawer ocupa 100vw en mobile, grid adaptativo

### Edge Cases Cubiertos

- Doble clic en submit → flag `submitting` deshabilita botón
- Token expirado durante checkout → evento `auth:expired` + redirección a login
- Stock insuficiente → botón de aumento deshabilitado cuando `cantidad >= stock`
- IndexedDB no disponible → fallback silencioso (try/catch en `openDB`)
- 409 en registro → mensaje "usuario o correo ya registrado"
- Carrito vacío → mensaje amigable + botón "Seguir comprando"
- Offline alert → `<dialog>` nativo con `showModal()` y `::backdrop` styling

---

## Fase 5 — Panel de Administración, Accesibilidad y Cierre

### Objetivo
Construir las vistas privadas del Administrador (CRUD de productos + tabla de pedidos), implementar guardianes de ruta por rol, realizar auditoría WCAG final y preparar la documentación de entrega.

### Archivos Creados/Modificados

| Archivo | Rol |
|---|---|
| `client/src/views/AdminView.vue` | Panel admin con tabs (Productos / Pedidos), CRUD completo via `<dialog>` modal para crear/editar producto, confirmación de eliminación, tabla de pedidos con detalles por usuario. Todos los botones de icono tienen `aria-label`. Tabs con `role="tablist"`, `aria-selected`. |
| `client/src/main.js` | **Actualizado.** Importa `AdminView`. Ruta `/admin` con `meta: { requiresAdmin: true }`. `beforeEach` guard: verifica `getUser()?.role === 'admin'`, redirige a `/` si no cumple. |
| `client/src/App.vue` | **Actualizado.** Botón Admin cambia de `disabled` a `<router-link to="/admin">` funcional. |
| `README.md` | **Reescrito completamente.** Documenta arquitectura Full Stack (MVC n-capas), stack tecnológico, seguridad OWASP, instrucciones de inicio (backend + frontend), estructura de proyecto, API REST, funcionalidades frontend y accesibilidad WCAG 2.2 AA. |
| `docs 2/golden-rules.md` | **Actualizado.** Se añade Acta de Cierre con tabla de fases 1-5 y verificación de cumplimiento de reglas de oro. |

### Funcionalidades del Panel Admin

**Gestión de Productos:**
- Tabla con columnas: ID, Nombre, Categoría, Precio, Stock, Acciones
- Stock bajo (< 5) resaltado en rojo
- Botón "+ Nuevo producto" → `<dialog>` con formulario completo (nombre, categoría, precio, stock, imagen, talla)
- Botón editar (lápiz) → `<dialog>` precargado con datos del producto
- Botón eliminar (papelera) → `<dialog>` de confirmación con `aria-describedby`
- Persistencia via API: `POST/PUT/DELETE /api/productos`

**Gestión de Pedidos:**
- Tabla con columnas: ID, Usuario, Productos (lista con nombres y cantidades), Total, Fecha
- Datos via `GET /api/pedidos` (admin ve todos los pedidos globales)

### Router Guard

```js
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAdmin) {
    const user = getUser()
    if (!user || user.role !== 'admin') {
      next('/')
      return
    }
  }
  next()
})
```

### Auditoría WCAG Final

Todos los componentes revisados contra los principios POUR:
- **Perceptible:** `alt` en imágenes, contraste 4.5:1, roles ARIA
- **Operable:** Skip-link, focus trap en CartDrawer, `Escape` en modales, teclado completo
- **Comprensible:** `<label>` asociados, `aria-describedby`, `aria-invalid`, `aria-live`
- **Robusto:** `<dialog>` nativos, HTML5 semántico, roles `navigation`, `alert`, `status`

### Documentación de Entrega

- `README.md` principal reescrito para reflejar el proyecto Full Stack completo
- `docs 2/golden-rules.md` actualizado con acta de cierre
- `docs 2/design_sessions/active-design.md` documenta todas las fases 1-5
- `docs 2/api/ENDPOINTS.md` documenta los 11 endpoints REST
- `docs 2/architecture/` contiene ADRs de las decisiones arquitectónicas clave
