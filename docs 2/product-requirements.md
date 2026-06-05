# Product Requirements — Shop Sport Full Stack (Reto 2)

## Descripción del Proyecto

Shop Sport es una tienda de ropa deportiva minimalista que ofrece leggings, tops, shorts, conjuntos y accesorios para mujer, hombre y kids. El proyecto se transforma de un frontend Vanilla JS (Reto 1) a una plataforma Full Stack (Reto 2) con backend Node.js/Express, persistencia SQL Server via Prisma, autenticación JWT, roles admin/user y frontend migrado a Vue.js.

## Funcionalidades Principales

### Catálogo de Productos
- Visualización de productos con nombre, precio, stock, imagen y categoría.
- Filtrado por categoría (query param `categoria`).
- Endpoints públicos: `GET /api/productos`, `GET /api/productos/:id`.

### Autenticación y Usuarios
- Registro público con username, email y password (validación fuerte).
- Login que devuelve JWT para autenticación stateless.
- Perfil de usuario autenticado (protegido).
- Roles: `admin` (gestión de productos, ver todos los pedidos) y `user` (comprar, ver historial propio).

### Carrito de Compras
- Persistencia local en el frontend (localStorage).
- Agregar, quitar, actualizar cantidad de productos.
- Cálculo de subtotal y total.
- El carrito es gestionado completamente por el frontend Vue.js.

### Checkout y Pedidos
- Confirmación de pedido: `POST /api/pedidos` (requiere JWT).
- Validación de stock antes de crear el pedido.
- Transacción atómica: se descuenta stock y se crea pedido+detalles.
- Historial de pedidos del usuario: `GET /api/pedidos/mis-pedidos`.
- Admin puede ver todos los pedidos: `GET /api/pedidos`.

### Panel de Administración
- CRUD completo de productos (solo admin).
- Vista de todos los pedidos del sistema.

## Usuarios del Sistema

### Usuario Final (role: user)
- Navega el catálogo sin autenticarse.
- Agrega productos al carrito.
- Debe iniciar sesión para confirmar un pedido.
- Ve su historial de pedidos.

### Administrador (role: admin)
- Todo lo que puede hacer un usuario.
- CRUD de productos (crear, editar, eliminar).
- Visualiza todos los pedidos del sistema.
- Accede al panel de administración.

### Desarrolladores / Agentes IA
- Mantienen la documentación en `docs 2/` sincronizada.
- Siguen los ADRs y golden rules.
- Documentan cada decisión y cambio para trazabilidad.

## Capacidades Clave
- API REST segura con autenticación JWT y roles
- Persistencia relacional con SQL Server + Prisma
- Frontend Vue.js 3 con Composition API
- Catálogo dinámico desde BD
- Carrito persistente en el cliente
- Checkout con transacción atómica
- Panel admin para gestión de productos
- Accesibilidad WCAG (ARIA, teclado, foco visible)

## Restricciones de Negocio
- Stack tecnológico: Node.js/Express, Prisma, SQL Server, Vue.js 3
- Seguridad OWASP obligatoria: JWT, bcrypt, CORS, validación, roles
- Frontend debe ser accesible (ARIA, teclado, HTML semántico)
- Documentación debe mantenerse sincronizada con el código

## Límites del Alcance

### Incluido (In Scope)
- Backend API REST completo con MVC
- Base de datos SQL Server con Prisma (migraciones + seed)
- Autenticación JWT con roles admin/user
- Frontend Vue.js 3 SPA
- Panel de administración para productos y pedidos
- Accesibilidad WCAG 2.2 AA
- README.md completo con documentación

### Excluido (Out of Scope)
- Pasarela de pago real (PayPal/Stripe)
- Envío de correos electrónicos transaccionales
- Notificaciones push
- Soporte multiidioma
- Tests automatizados (se harán manualmente)
- Despliegue en producción (opcional)

## Métricas de Éxito
- El backend inicia y responde a todas las rutas correctamente.
- El frontend Vue.js consume la API y muestra el catálogo.
- El flujo completo (catálogo → carrito → login → pedido) funciona sin errores.
- Admin puede crear/editar/eliminar productos.
- Usuario user no puede acceder a rutas admin (403).
- Las contraseñas están hasheadas en BD.
- La documentación en `docs 2/` refleja fielmente la implementación.
