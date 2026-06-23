# Guía de Presentación - Defensa del Reto 2

Esta guía está diseñada para que la leas, la practiques y la uses como "acordeón" durante tu presentación. Cada punto corresponde directamente a lo que exige la rúbrica, con el argumento técnico que debes decir y la acción que debes realizar en pantalla para demostrarlo.

---

## 1. Arquitectura MVC (Frontend y Backend)

**Lo que debes decir:**
> "Para este reto, implementamos una arquitectura MVC en N-capas con una separación total de responsabilidades. El **Frontend** está en Vue 3 y funciona como el Cliente, mientras que el **Backend** está en Node.js y actúa como el Servidor."

**Cómo demostrarlo en código:**
1. Abre tu editor de código (VS Code).
2. Muestra la carpeta `client/src/`:
   - *"Aquí tenemos los **Models** (`useCart.js`, `useAuth.js`) que manejan el estado reactivo, los **Controllers** (`ProductController.js`) que se comunican con el backend, y las **Views** (`CatalogView.vue`) que renderizan la interfaz."*
3. Muestra la carpeta `server/src/`:
   - *"En el backend seguimos el mismo patrón: **Routes** para definir los endpoints, **Controllers** para la lógica HTTP, y **Models** para conectarnos a la base de datos."*

---

## 2. Persistencia Real con SQL Server + Prisma

**Lo que debes decir:**
> "Dejamos atrás los datos falsos. Ahora toda la información se guarda en una base de datos relacional PostgreSQL alojada en Render, y nos comunicamos con ella usando el ORM **Prisma**. Tenemos las entidades principales exigidas: Productos, Usuarios, Documentos (Pedidos) y Detalles."

**Cómo demostrarlo:**
1. Abre el archivo `server/prisma/schema.prisma`.
2. Muestra rápidamente los bloques `model productos`, `model usuarios` y `model documentos`.
3. *Opcional:* Si el profesor pregunta cómo guardas, abre `pedido.model.js` y muéstrale la función `createTransaction`. 
   - *"Usamos transacciones de Prisma (Prisma.$transaction) para asegurar que si falla la creación del detalle del pedido, tampoco se cobre ni se descuente el inventario. Es todo o nada."*

---

## 3. Consumo de API REST (El CRUD y Pedidos)

**Lo que debes decir:**
> "Creamos nuestra propia API RESTful. El frontend la consume de manera asíncrona usando `fetch` mediante un cliente centralizado. Tenemos endpoints públicos y protegidos."

**Cómo demostrarlo en vivo:**
1. Ve a la página web en tu navegador.
2. Abre la consola de desarrollador (F12) en la pestaña **Network (Red)** y filtra por `Fetch/XHR`.
3. Recarga la página del Catálogo. Muestra cómo se hace la petición `GET /api/productos` con un status `200 OK`.
4. Añade un producto al carrito y dale a "Completar Pedido" (estando logueado). Muestra en la pestaña Network cómo sale un `POST /api/pedidos` con código `201 Created`.

---

## 4. Seguridad (OWASP, JWT, CORS, Bcrypt) - ¡Punto Clave!

**Lo que debes decir:**
> "La seguridad fue prioridad. Nos basamos en el OWASP Top 10 para mitigar los riesgos más críticos."

**Cómo demostrar cada punto:**

1. **Contraseñas Seguras (Bcrypt):**
   - *"Nunca guardamos contraseñas en texto plano."*
   - Abre `server/src/controllers/auth.controller.js` y señala la línea donde dice `bcrypt.hash(password, 10)`.
2. **Control de Acceso y JWT (Broken Access Control):**
   - *"Solo los administradores pueden crear o borrar productos."*
   - **En vivo:** Inicia sesión con el usuario normal (`usuario` / `User123!`). Intenta entrar al panel de administración (no aparece el botón). Si tratas de forzar la URL, el backend te rechazará con un `403 Forbidden` porque el token JWT no tiene el rol 'admin'.
   - **En código:** Muestra `server/src/middleware/role.js` y cómo lo usas en las rutas (`authorize('admin')`).
3. **Validación y Sanitización (XSS e Inyección SQL):**
   - *"Prevenimos ataques de inyección usando Prisma que parametriza las consultas, y validamos todo lo que entra al servidor con `express-validator`."*
   - Abre la carpeta `server/src/validators/` para mostrar que tienes reglas estrictas para cada campo.
4. **Puntos Extra (HTTPS):**
   - *"Además, como bonus, desplegamos la aplicación en Render y Vercel, lo que nos otorga encriptación HTTPS end-to-end (SSL/TLS) de manera nativa mediante sus reverse proxies."*

---

## 5. Accesibilidad (WCAG 2.2 AA)

**Lo que debes decir:**
> "El frontend no solo es bonito, es accesible para lectores de pantalla y navegación por teclado."

**Cómo demostrarlo en vivo:**
1. Ponte en la página de inicio.
2. **Sin tocar el mouse**, presiona la tecla `Tab` repetidamente.
3. Demuestra cómo el "foco" (el cuadro que resalta los elementos) es claramente visible y te permite navegar por los botones, los links y abrir el carrito.
4. Menciona: *"Usamos modales nativos de HTML5 `<dialog>` y roles ARIA para que los lectores de pantalla sepan exactamente qué está pasando cuando sale un error o se completa un pedido."*

---

## Resumen de la Demostración Práctica (El flujo perfecto)

Pídele al ingeniero que observe tu pantalla y haz este flujo exacto sin interrupciones:

1. **Abre el catálogo público:** Muestra los productos y filtra por una categoría (prueba de `GET` y lógica de vista).
2. **Intenta comprar sin cuenta:** Añade al carrito y dale a comprar. Muestra cómo te redirige al Login.
3. **Loguéate como Admin:** Usa `admin` / `Admin123!`. 
4. **Ve al Panel Admin:** Crea un producto nuevo ("Camiseta de Prueba", 15.99, Stock 10). Muestra que se agregó exitosamente.
5. **Compra el producto:** Ve al catálogo, añade la "Camiseta de Prueba" al carrito y haz el Checkout. (Muestra el modal de éxito).
6. **Verifica la base de datos:** Regresa al panel Admin y muestra que en la pestaña "Pedidos" ya aparece tu nueva compra. Además, muestra que el stock del producto disminuyó automáticamente a 9.

> **Tip final:** Mantén la calma, habla pausado y si algo tarda en cargar un poco (recuerda que el servidor gratuito de Render se duerme si no se usa), dile: *"Como está desplegado en un servidor gratuito serverless, el primer cold start tarda unos segunditos, pero las siguientes peticiones van a milisegundos."*
