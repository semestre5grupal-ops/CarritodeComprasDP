# Especificaciones del Proyecto: Carrito de Compras Moderno (Semanas 1-6)

## 📝 Descripción del Reto
Desarrollo de una plataforma frontend que integre:
* HTML5 Semántico
* CSS3 Adaptable
* JavaScript ES6+
* Validaciones con Regex
* Accesibilidad (ARIA)
* Persistencia de datos

## 🎯 Objetivos Principales
1. **Estructura:** Uso de HTML5 semántico y accesible.
2. **Diseño:** Implementación de Responsive Design (Flexbox/Grid).
3. **Lógica:** Programación funcional del carrito en JS ES6+.
4. **Datos:** Carga de productos mediante archivos JSON o XML locales.
5. **Persistencia:** Gestión de datos vía `localStorage`, `sessionStorage`, `IndexedDB` y `cookies`.
6. **Accesibilidad:** Cumplimiento de estándares ARIA y navegación por teclado.

## 🧱 Requerimientos Funcionales

### 1. Arquitectura de Archivos
- `index.html`: Archivo principal con estructura semántica.
- `/assets/`: Estilos CSS y recursos multimedia.
- `/data/`: Fuente de datos (`productos.json` o `productos.xml`).
- `/js/`: Scripts modulares (`app.js`, `repo.js`, `view.js`, `cart.js`).

### 2. Interfaz y Accesibilidad (UX/UI)
- Diseño responsivo para móvil, tablet y escritorio.
- Foco visible, contraste de colores adecuado y textos alternativos.
- Atributos ARIA para lectores de pantalla.

### 3. Catálogo y Carrito
- **Catálogo:** Carga dinámica desde archivo local en tarjetas reutilizables.
- **Carrito:** Funciones de añadir, eliminar y actualizar cantidades.
- **Cálculos:** Subtotal y total dinámicos.
- **Persistencia:** El carrito no debe borrarse al recargar la página.

### 4. Gestión de Almacenamiento
Se deben implementar al menos **tres** mecanismos:
*   `localStorage`
*   `sessionStorage`
*   `IndexedDB`
*   `Cookies`
*   *Nota: Registrar marca de tiempo de la última actualización.*

### 5. Validaciones y Formularios
- Uso obligatorio de **Expresiones Regulares (Regex)**.
- Mensajes de error accesibles mediante `aria-invalid` y `aria-describedby`.

## 📦 Entregables
1. **Archivo Comprimido:** `.zip` con la estructura completa.
2. **Despliegue:** Debe funcionar localmente y estar publicado en (Neocities.org).
3. **Documentación:** `README.md` detallando tecnologías y estructura técnica.
