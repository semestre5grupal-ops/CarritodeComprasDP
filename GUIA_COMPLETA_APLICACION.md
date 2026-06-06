# Guía Completa de la Aplicación Frontend - Carrito de Compras

## Introducción

Esta aplicación es un **carrito de compras frontend** para una tienda de ropa deportiva minimalista llamada "Shop Sport". Está construida con **HTML, CSS y JavaScript vanilla** (sin frameworks), siguiendo una arquitectura modular y offline-first. La aplicación permite ver productos, filtrarlos, añadirlos al carrito, gestionar cantidades y completar pedidos. Incluye persistencia local (localStorage, sessionStorage, IndexedDB) para funcionar sin conexión.

El enfoque es **frontend puro**: no hay backend; los datos se cargan desde un archivo JSON local y se cachean. La lógica se divide en módulos JS para separación de responsabilidades (similar a MVC: Modelo, Vista, Controlador).

### Tecnologías y Conceptos Clave
- **HTML**: Estructura de páginas (index.html para home, catalog.html para catálogo).
- **CSS**: Estilos responsivos con variables CSS, accesibilidad (ARIA).
- **JavaScript ES6+**: Módulos, async/await, eventos delegados.
- **Persistencia**: 4 estrategias (localStorage para carrito, sessionStorage para filtros, IndexedDB para cache, cookies para preferencias).
- **PWA**: Soporte offline básico con service worker implícito (cache en IndexedDB).
- **Accesibilidad**: Labels ARIA, navegación por teclado, focus traps.

## Estructura de Archivos

La aplicación sigue una estructura modular organizada en carpetas:

```
CarritodeComprasDP/
├── index.html                    # Página principal (home) con productos destacados
├── app/
│   ├── controller/js/            # Lógica JS (controladores y modelos)
│   │   ├── app.js                # Orquestador principal (eventos globales, inicialización)
│   │   ├── cart.js               # Modelo del carrito (CRUD de items)
│   │   ├── catalog.js            # Controlador del catálogo (filtros, renderizado)
│   │   ├── contacto.js           # Validación de formulario de contacto
│   │   ├── repo.js               # Repositorio de datos (productos, rutas)
│   │   ├── storage.js            # Persistencia (localStorage, sessionStorage, IndexedDB)
│   │   └── view.js               # Capa de presentación (renderizado del carrito)
│   ├── data/
│   │   └── productos.json        # Datos de productos (JSON estático)
│   └── view/
│       ├── catalog.html          # Página del catálogo completo
│       └── assets/css/           # Estilos
│           ├── styles.css        # Estilos globales (layout, header, footer)
│           ├── components/
│           │   ├── cart.css      # Estilos del drawer del carrito
│           │   ├── catalog.css   # Estilos del catálogo y filtros
│           │   └── products.css  # Estilos de tarjetas de producto
└── docs/                         # Documentación (requisitos, arquitectura)
```

### Descripción de Archivos Clave
- **index.html**: Página de inicio. Muestra 4 productos destacados, header con carrito, footer. Incluye scripts JS y estilos.
- **catalog.html**: Página del catálogo. Similar a index.html pero con grid completo de productos y filtros laterales.
- **productos.json**: Array de objetos producto (id, nombre, precio, stock, etc.). Fuente de datos principal.
- **JS Módulos**: Cada archivo tiene una responsabilidad específica (ver secciones abajo).
- **CSS**: Separado por componentes para mantenibilidad.

## Arquitectura y Flujo General

La aplicación usa una **arquitectura modular** inspirada en MVC:
- **Modelo**: `cart.js` (estado del carrito), `repo.js` (datos productos), `storage.js` (persistencia).
- **Vista**: `view.js` (renderizado DOM), archivos HTML (estructura), CSS (estilos).
- **Controlador**: `app.js` (orquestador), `catalog.js` (lógica catálogo).

### Flujo de Datos General
1. **Inicialización**: `app.js` carga carrito desde localStorage, inicializa eventos globales.
2. **Carga de Productos**: `repo.js` fetch `productos.json`, aplica stock persistido, cachea en IndexedDB.
3. **Renderizado**: `view.js` y `catalog.js` generan HTML dinámico en el DOM.
4. **Interacciones**: Eventos (clics) llaman funciones en `app.js` → `cart.js` → `view.js` → actualiza DOM.
5. **Persistencia**: Cambios se guardan automáticamente en storage.
6. **Offline**: Si fetch falla, usa cache IndexedDB.

Datos fluyen de JSON → repo → módulos JS → DOM. Eventos van DOM → app.js → cart/repo → storage.

## Componentes Principales y Flujo de Datos

### 1. HTML: Estructuras de Página
- **index.html**: Home page. Contiene header (con botón carrito), grid de 4 productos, footer. Scripts: `app.js` (principal).
- **catalog.html**: Catálogo page. Header, sidebar filtros, grid productos completo. Scripts: `app.js` + `catalog.js`.

Ambos usan templates HTML estáticos con JS para inyectar contenido dinámico (productos, carrito).

### 2. JavaScript: Lógica y Flujos

#### app.js (Orquestador Principal)
- **Responsabilidades**: Inicialización global, eventos carrito, checkout, PWA offline.
- **Flujo Inicial**:
  1. DOMContentLoaded → `cart.loadCart()` (carga desde localStorage).
  2. `inicializarSistema()` → `repo.obtenerProductos()` → renderiza productos destacados.
  3. Inicializa drawer carrito, menú mobile, chips colección.
- **Eventos Globales**:
  - `window.agregarAlCarrito(id)`: Llama `cart.addToCart(id)` → valida stock → guarda → `view.renderCart()` → actualiza UI.
  - Botones +/- en carrito: `cart.modifyQuantity()` → valida stock → renderiza.
  - Checkout: `repo.actualizarStockPorCompra()` → descuenta stock → guarda persistencia → vacía carrito.
- **Flujo de Datos**: Eventos → app.js → cart.js/repo.js → storage.js → view.js → DOM.

#### cart.js (Modelo del Carrito)
- **Estado**: Array `carrito` en memoria.
- **Funciones CRUD**:
  - `addToCart(id)`: Busca producto en repo, valida stock disponible (stock - cantidad en carrito), añade si OK, guarda en localStorage.
  - `modifyQuantity(id, delta)`: Aumenta/disminuye cantidad, valida stock máximo, guarda.
  - `deleteItem(id)`: Remueve item, guarda.
  - `getCartItems()`: Retorna array carrito.
- **Flujo**: Cambios → guarda automáticamente → notifica UI para re-render.

#### repo.js (Repositorio de Datos)
- **Datos**: Array `productosDisponibles` (desde JSON + stock persistido).
- **Funciones**:
  - `obtenerProductos()`: Fetch JSON → `aplicarStockPersistido()` (aplica stock guardado) → cachea en IndexedDB.
  - `getProductoById(id)`: Busca en array.
  - `actualizarStockPorCompra(cartItems)`: Descuenta stock de productos, guarda en localStorage.
- **Flujo**: JSON → repo (con persistencia) → usado por cart.js/catalog.js.

#### catalog.js (Controlador del Catálogo)
- **Estado**: Array `catalogProductos` (productos cargados).
- **Funciones**:
  - `cargarCatalogos()`: `repo.obtenerProductos()` → `renderizarProductosFiltrados()`.
  - `renderizarProductosFiltrados()`: Aplica filtros (género, talla, color, precio) → genera HTML tarjetas → inyecta en DOM.
  - Filtros: Eventos en checkboxes → `renderizarProductosFiltrados()` → guarda filtros en sessionStorage.
- **Flujo**: Productos → filtros aplicados → HTML generado → DOM. Cada tarjeta muestra stock disponible (calculado en tiempo real).

#### view.js (Capa de Presentación)
- **Funciones**:
  - `renderCart(cartItems)`: Genera HTML del drawer carrito → inyecta en DOM → actualiza badge header.
  - `showAlert()`: Modal de alertas.
- **Flujo**: Datos carrito → HTML string → DOM.

#### storage.js (Persistencia)
- **Estrategias**:
  - localStorage: Carrito y stock productos.
  - sessionStorage: Filtros catálogo, timestamp sesión.
  - IndexedDB: Cache productos, cola tareas offline.
- **Flujo**: Datos → JSON.stringify → storage → recupera con JSON.parse.

### 3. CSS: Estilos
- **styles.css**: Layout global, header/footer, responsive.
- **products.css**: Tarjetas producto, badges stock.
- **cart.css**: Drawer carrito, controles cantidad.
- **catalog.css**: Grid catálogo, sidebar filtros.

Estilos usan variables CSS (--tone, --accent) para temas por producto.

### 4. JSON: Datos
- **productos.json**: Array de 20 productos con campos: id, nombre, precio, descripcion, categoria, talla, stock, etc.
- Flujo: Carga inicial → repo aplica stock persistido → usado en renderizado.

## Flujos Específicos de Funcionalidades

### Ver Productos
1. `repo.obtenerProductos()` fetch JSON.
2. `aplicarStockPersistido()` ajusta stock con datos guardados.
3. `catalog.js` o `app.js` renderiza tarjetas (home: 4 destacados, catálogo: todos filtrados).
4. Cada tarjeta muestra stock: "Disponibles: X", "Última unidad", "Agotado", "Pocas unidades" (si <5).

### Añadir al Carrito
1. Clic "Añadir" → `window.agregarAlCarrito(id)` en app.js.
2. `cart.addToCart(id)`: Valida stock disponible (producto.stock - cantidad ya en carrito).
3. Si OK: Añade item, guarda localStorage.
4. `view.renderCart()` actualiza drawer y badge.
5. `window.actualizarStockCatalogo()` / `actualizarStockInicio()` re-renderiza productos con stock actualizado.

### Gestionar Cantidades en Carrito
1. Botones +/- en drawer → `cart.modifyQuantity(id, delta)`.
2. Valida: No bajar de 1, no superar stock.
3. Guarda → `view.renderCart()` → actualiza stock en UI.
4. Re-renderiza catálogo/home para reflejar stock restante.

### Filtrar Productos (Catálogo)
1. Checkboxes en sidebar → evento change → `catalog.js.renderizarProductosFiltrados()`.
2. Aplica filtros: Género, talla (rangos), color, precio.
3. Actualiza contador "Mostrando X de Y productos".
4. Guarda filtros en sessionStorage.

### Completar Pedido (Checkout)
1. Clic "Completar pedido" → valida carrito no vacío.
2. Online: `repo.actualizarStockPorCompra(cartItems)` descuenta stock, guarda localStorage.
3. Offline: Guarda tarea en IndexedDB.
4. Vacía carrito, muestra alerta, cierra drawer.
5. Re-renderiza productos con stock actualizado.

### Persistencia y Offline
- Carrito: Siempre en localStorage.
- Stock: Persistido en localStorage tras compra.
- Filtros: sessionStorage (pierde al cerrar pestaña).
- Cache: IndexedDB para productos offline.
- Offline: Muestra banner, usa cache, guarda acciones para sincronizar.

## Conclusión

La aplicación es un **frontend modular** donde datos fluyen desde JSON → repo (con persistencia) → controladores (app.js, catalog.js) → vista (view.js, DOM). Eventos inician en DOM → controladores → modelo (cart.js, repo.js) → storage. Todo se actualiza en tiempo real, con validaciones de stock y soporte offline.

Para entender una función específica, busca su definición en el archivo correspondiente. El flujo es reactivo: cambios → guarda → re-renderiza. Esto permite una experiencia fluida sin backend.