Reto 2 – Plataforma Full Stack MVC (Frontend + Backend + BD + Seguridad)
🧠 Descripción del reto
Durante las semanas 1 a la 12 has desarrollado competencias para construir plataformas web completas, pasando desde el frontend moderno (HTML5, CSS3, JavaScript, accesibilidad, consumo de datos) hasta la arquitectura cliente-servidor, construcción de APIs con Node.js/Express, persistencia con bases de datos y ORM (Prisma) y seguridad básica (OWASP Top 10, JWT, CORS/HTTPS, roles, validación y sanitización).

En este reto, transformarás tu proyecto del carrito (Reto 1) en una plataforma full stack con persistencia real en SQL Server u otro motor de base de datos relacional, una API REST segura y un frontend MVC que consuma esa API. El objetivo es que el sistema funcione como una plataforma real: catálogo, carrito, pedidos, autenticación, roles y administración básica.

🎯 Objetivo del reto
Desarrollar una plataforma web completa tipo e-commerce, aplicando todos los aprendizajes de las semanas 1 a 12, demostrando capacidad para:

Diseñar un frontend accesible, adaptable y modular (MVC en el cliente).

Implementar una API REST robusta con Node.js/Express (MVC en el servidor).

Persistir datos en SQL Server u otro motor de base de datos relacional usando Prisma ORM.

Aplicar seguridad básica alineada con OWASP:

JWT (autenticación/ autorización),

CORS seguro y (opcional) HTTPS,

hashing de contraseñas,

roles (admin/user),

validación + sanitización de entradas.

Consumir la API desde el frontend con Fetch/async-await, controlando errores y estados.

✅ Requerimientos funcionales (obligatorios)
1) Arquitectura obligatoria: MVC en Frontend y Backend
1.1 Frontend MVC (cliente)
Tu frontend debe estar estructurado en MVC, mínimo:

/frontend/models/ → lógica de datos del lado del cliente (consumo API, estado carrito, etc.)

/frontend/views/ → renderizado UI (tarjetas, tabla carrito, formularios, modales, etc.)

/frontend/controllers/ → control de eventos, navegación, flujos

/frontend/assets/ → CSS, imágenes, íconos

index.html (semántico y accesible)

✅ Se permite usar JavaScript puro o jQuery en el frontend, pero debe respetar MVC y componentes reutilizables.

1.2 Backend MVC (servidor)
Tu backend debe respetar capas MVC claras:

/server/routes/ → rutas

/server/controllers/ → controladores (HTTP)

/server/models/ → capa de acceso a datos (Prisma)

/server/middleware/ → auth JWT, roles, cors, validaciones, error handler

/server/prisma/ → schema, migraciones, seed

✅ Se acepta una estructura similar a la que ya tienes, siempre que exista separación real de responsabilidades.

2) Persistencia real con SQL Server u otro motor de base de datos relacional + Prisma (obligatorio)
Tu sistema debe usar SQL Server y Prisma. Debe existir al menos estas entidades en BD:

2.1 Tablas mínimas
Producto

id, nombre, precio, stock (mínimo), createdAt

Usuario

id, username/email, passwordHash, role (admin/user)

Pedido

id, userId, total, createdAt

PedidoDetalle

id, pedidoId, productoId, cantidad, precioUnitario

✅ El carrito puede persistirse en frontend (localStorage/sessionStorage) pero el pedido final debe guardarse en BD.

3) API REST (CRUD + pedidos) con buenas prácticas
3.1 Endpoints mínimos
Auth

POST /api/auth/login → devuelve JWT

POST /api/auth/register

Productos

GET /api/productos → público

GET /api/productos/:id → público

POST /api/productos → requiere JWT (rol admin)

PUT /api/productos/:id → requiere JWT (rol admin)

DELETE /api/productos/:id → requiere JWT (rol admin)

Pedidos

POST /api/pedidos → requiere JWT (user/admin)

Registra pedido con detalles usando el carrito enviado por el frontend

GET /api/pedidos/mis-pedidos → requiere JWT (user/admin)

GET /api/pedidos → requiere JWT + rol admin (ver todos)

4) Seguridad básica (obligatoria)
Debes aplicar al menos:

4.1 OWASP Top 10 (principios)
Identificar en tu README 3 riesgos OWASP y cómo los mitigaste en tu sistema.

4.2 JWT (obligatorio)
JWT en Authorization: Bearer <token>

Rutas protegidas según rol

4.3 CORS seguro (obligatorio)
Permitir solo el origen real del frontend (CORS_ORIGIN)

No usar * en producción

4.4 Contraseñas seguras (obligatorio)
Hash de contraseña con bcrypt

Nunca guardar contraseña en texto plano

4.5 Validación y sanitización (obligatorio)
Validar body y params (ej. express-validator)

Sanitizar campos como nombre, username, etc.

Manejar errores con respuestas consistentes (no exponer stacktrace)

4.6 HTTPS (opcional, extra puntos)
Activar HTTPS dev con certificado self-signed o reverse proxy.

5) Frontend: funcionalidades mínimas del sistema
5.1 Catálogo de productos (API)
Renderiza productos consumidos desde GET /api/productos

Tarjetas reutilizables (componente)

Botón “Agregar al carrito”

5.2 Carrito persistente
Permite agregar, quitar, aumentar/disminuir cantidad

Calcula subtotal/total

Persistencia: localStorage (mínimo)

(extra) sessionStorage o cookies

5.3 Login obligatorio para comprar
Si el usuario no está logueado, no puede confirmar pedido

Debe mostrar mensaje accesible y redirigir al login

5.4 Checkout / Confirmación de pedido
Envía el carrito al backend: POST /api/pedidos

Al confirmar, se vacía el carrito y muestra confirmación

5.5 Panel Admin (mínimo)
Vista de administración para productos:

listar, crear, editar, eliminar (consumiendo API)

Vista administrador para todas las tablas

Solo visible si rol admin

♿ Requerimientos de accesibilidad (obligatorio)
Tu frontend debe cumplir mínimo:

HTML5 semántico (header, nav, main, section, footer)

Navegación por teclado

Foco visible

Labels correctos en formularios

ARIA en componentes dinámicos (mensajes, modales, alerts)

Contraste adecuado

🧱 Requerimientos técnicos adicionales
Buenas prácticas backend
Middleware de errores centralizado

Logger básico (puede ser tu logger.js)

Estructura clara (routes → controllers → models)

Uso de async/await y try/catch

Buenas prácticas frontend
No duplicar lógica de render en varios lugares

Separar “vista” y “controlador”

Manejo de errores al consumir la API (red, 401, 403, 500)

📦 Entregables
Proyecto completo comprimido:
Reto2_Apellido_Nombre.zip

Debe incluir:

Carpeta frontend MVC

Carpeta backend MVC

Prisma schema y migraciones

.env.example (NO subir .env con password real)

README.md obligatorio con:

Descripción del sistema

Arquitectura MVC (frontend y backend)

Capturas o ejemplos de endpoints probados

Cómo ejecutar backend y frontend

Medidas de seguridad aplicadas (OWASP)

Endpoints disponibles y roles requeridos

🧪 Pruebas mínimas (las que el estudiante debe evidenciar)
Login admin → obtiene token

Crear producto (admin)

Login user → NO puede crear producto (403)

Catálogo se ve en frontend

Carrito funciona y persiste

Confirmar pedido (user) → pedido en BD

Admin ve todos los pedidos