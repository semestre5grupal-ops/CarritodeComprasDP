# 🛍️ Shop Sport - Carrito de Compras

**Tienda de ropa deportiva minimalista desarrollada con HTML5 semántico, CSS3 responsive y JavaScript vanilla ES6+**

---

## 📋 Descripción del Proyecto

Shop Sport es una aplicación frontend de comercio electrónico educativa que demuestra el dominio de tecnologías web modernas sin dependencias externas. El proyecto implementa un catálogo dinámico de productos, carrito de compras funcional y múltiples estrategias de persistencia de datos.

### Características Principales

✅ **Catálogo dinámico** - Carga productos desde JSON local  
✅ **Carrito de compras** - Añadir, eliminar, actualizar cantidad, selección múltiple  
✅ **Persistencia integral** - localStorage, sessionStorage, IndexedDB, cookies  
✅ **Accesibilidad WCAG** - ARIA labels, navegación por teclado, contraste adecuado  
✅ **Responsive Design** - Mobile-first, 3 breakpoints óptimos (mobile, tablet, desktop)  
✅ **Validación avanzada** - Regex para nombre, email, teléfono con feedback accesible  
✅ **Componentes reutilizables** - Cards, modales, forms, botones con estilos coherentes  

---

## 🚀 Inicio Rápido

### Requisitos
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Servidor local o VS Code Live Server (no requiere backend)

### Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd CarritodeComprasDP
```

2. **Abrir con Live Server** (VS Code)
   - Click derecho en `index.html`
   - Seleccionar "Open with Live Server"
   - Se abrirá en `http://localhost:5500`

3. **O abrir directamente**
   - Hacer doble click en `index.html`
   - El sitio se ejecutará localmente

### Estructura de Carpetas

```
CarritodeComprasDP/
├── index.html                 # Página de inicio (semántica HTML5)
├── README.md                  # Este archivo
│
├── app/
│   ├── view/
│   │   ├── catalog.html       # Página de catálogo con filtros
│   │   └── assets/
│   │       └── css/
│   │           ├── styles.css           # Estilos globales, variables CSS
│   │           └── components/
│   │               ├── products.css     # Estilo de tarjetas de producto
│   │               └── cart.css         # Estilo del drawer del carrito
│   │
│   ├── controller/
│   │   └── js/
│   │       ├── app.js         # Orquestador principal, gestión de eventos
│   │       ├── catalog.js     # Lógica de catálogo y filtros
│   │       └── contacto.js    # Validación de formulario (MVC)
│   │
│   └── data/
│       └── productos.json     # Catálogo de productos (datos estáticos)
│
└── docs/
    └── Documentación técnica

```

---

## 🛠️ Tecnologías Utilizadas

| Capa | Tecnología | Versión |
|------|------------|---------|
| **Estructura** | HTML5 Semántico | 5 |
| **Presentación** | CSS3 + Grid/Flexbox | 3 |
| **Comportamiento** | JavaScript ES6+ | Modules, Arrow Functions, Async/Await |
| **Persistencia** | localStorage, sessionStorage, IndexedDB, Cookies | Nativas del navegador |

### ⚠️ Restricciones Intencionales
- ❌ **No** React, Vue, Angular
- ❌ **No** Tailwind, Bootstrap
- ❌ **No** jQuery
- ❌ **No** Backend externo

---

## 📱 Responsive Design

El diseño sigue **Mobile-First** con tres breakpoints óptimos:

| Dispositivo | Ancho | Características |
|-------------|-------|-----------------|
| **Mobile** | 320px - 767px | Stack vertical, sidebar como overlay, touch-friendly |
| **Tablet** | 768px - 1023px | Sidebar sticky, grid 2 columnas, navegación accesible |
| **Desktop** | 1024px+ | Layout grid completo, hover effects, max-width 1200px |

Tested en: iPhone 12, iPad Pro, Laptop 1920x1080

---

## 🛒 Funcionalidad del Carrito

### Operaciones Disponibles

```javascript
// Añadir producto
- Seleccionar talla (si aplica)
- Especificar cantidad
- Click en "Añadir al carrito"

// Modificar cantidad
- Usar controles +/- en el drawer
- Actualiza total dinámicamente

// Eliminar
- Click en ícono de papelera
- Diálogo de confirmación

// Bulk delete
- Checkbox "Seleccionar todos"
- Eliminar múltiples productos
```

### Cálculo de Totales
- Subtotal = Σ(precio × cantidad) por producto
- Total = Σ subtotales
- Se actualiza en tiempo real
- Visible en drawer y checkout

---

## 💾 Estrategias de Persistencia

El proyecto implementa **4 mecanismos** de almacenamiento:

### 1️⃣ **localStorage** (Principal)
```javascript
// Carrito completo (indefinido)
localStorage.setItem('sportstore_shopping_cart', JSON.stringify(carrito))
// Recuperación entre sesiones
```

### 2️⃣ **sessionStorage** (Sesión)
```javascript
// Timestamp de última actualización
sessionStorage.setItem('lastUpdate', new Date().toISOString())
// Limpieza automática al cerrar pestaña
```

### 3️⃣ **IndexedDB** (Catálogo)
```javascript
// Cachea producto para acceso rápido
// Persiste entre sesiones
// Recuperable incluso offline
```

### 4️⃣ **Cookies** (Preferencias)
```javascript
// Términos y políticas aceptadas
document.cookie = 'terminosAceptados=true; path=/; max-age=31536000'
// Expira en 1 año
```

**Arquitectura de sincronización:**
```
User Action
    ↓
Memory (carrito[])
    ├→ localStorage (primario)
    ├→ sessionStorage (temporal)
    ├→ IndexedDB (cache)
    └→ Cookies (preferences)
```

---

## ♿ Accesibilidad (POUR)

### Perceptible 👁️
- Imágenes con `alt` text descriptivo
- Contraste WCAG AA: ratio 4.5:1 (texto), 3:1 (elementos)
- Paleta de colores: Dark text on light background

### Operable ⌨️
- Navegación completa por teclado
- Focus visible (outline 3px turquesa)
- Skip-link funcional al contenido
- Botones con tamaño mínimo 44x44px

### Comprensible 📖
- Etiquetas claramente asociadas a inputs
- Mensajes de error accesibles (`aria-describedby`)
- Jeraquía de encabezados coherente (h1→h2→h3)
- Lenguaje simple y consistente

### Robusto 🔧
- HTML5 válido
- Roles ARIA correctos (`navigation`, `main`, `dialog`, `alert`)
- Atributos `aria-live` para actualizaciones dinámicas
- Compatible con lectores de pantalla (NVDA, JAWS, VoiceOver)

---

## 🎨 Componentes Reutilizables

### Product Card
```html
<article class="product-card" role="listitem">
  <div class="product-visual">
    <img class="product-image" src="..." alt="...">
    <span class="product-badge">Nuevo</span>
  </div>
  <div class="product-info">
    <h3>Nombre</h3>
    <p>Precio: $XX.XX</p>
  </div>
</article>
```

### Cart Drawer (Modal)
```html
<aside id="cart-drawer" role="dialog" aria-modal="true">
  <!-- Header -->
  <!-- Bulk actions -->
  <!-- Items container (dinámico) -->
  <!-- Footer con totales -->
</aside>
```

### Form Field (Validado)
```html
<div class="form-group">
  <label for="email">Email:</label>
  <input type="email" id="email" aria-describedby="err-email" required>
  <span id="err-email" role="alert" aria-live="polite" hidden>
    Formato inválido
  </span>
</div>
```

---

## ✅ Validación Avanzada

### Expresiones Regulares Implementadas

| Campo | Regex | Ejemplo Válido |
|-------|-------|---|
| **Nombre** | `/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/` | "María José García" |
| **Email** | `/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/` | "usuario@dominio.com" |
| **Teléfono** | `/^09\d{8}$/` | "0987654321" (Ecuador) |

### Sanitización
- Prevención de **SQL Injection**: Elimina `;`, `'`, `"`, `--`, `/*`, `*/`
- Prevención de **XSS**: Escapa `<`, `>`
- Mensajes de error accesibles con `aria-invalid`

---

## 🗂️ Arquitectura MVC (Parcial)

### Model Layer
```javascript
// contacto.js - ContactoModel
- Regex validation
- Sanitización de entrada
- Lógica de negocio
```

### View Layer
```javascript
// contacto.js - ContactoView
- Manipulación del DOM
- Atributos ARIA
- Mostrar/ocultar errores
```

### Controller Layer
```javascript
// contacto.js - ContactoController
- Eventos de formulario
- Orquestación Model-View
- Persistencia
```

---

## 📊 Métricas de Calidad

### Performance
- **Load time**: < 2 segundos
- **Images**: Optimizadas (WebP + fallback)
- **CSS**: Crítico en `<head>`, deferido cuando aplica
- **JS**: Modular (tree-shaking compatible)

### Code Quality
- **Lines of Code**: ~2000 (sin comentarios)
- **Funciones modularizadas**: 30+
- **Cobertura de casos**: Add, Update, Delete, Bulk Delete
- **Error handling**: Try-catch en async operations

### SEO
- Meta description: ✅
- Open Graph tags: ✅
- Semantic HTML: ✅
- Sitemap: Considerado para futuro

---

## 🐛 Troubleshooting

### "Productos no se cargan"
```
✓ Verificar que productos.json existe en app/data/
✓ Revisar console (F12 → Console)
✓ Comprobar que Live Server está activado
```

### "Carrito no persiste"
```
✓ Abrir DevTools → Application → localStorage
✓ Buscar clave 'sportstore_shopping_cart'
✓ Verificar que el navegador permite storage
✓ Limpiar cache y cookies si es necesario
```

### "Formulario no valida"
```
✓ Revisar console para errores de regex
✓ Verificar que los campos tienen los IDs correctos
✓ Asegurar que el HTML no está roto
```

---

## 🚀 Mejoras Futuras

- [ ] Integración con API backend para órdenes reales
- [ ] Sistema de autenticación de usuarios
- [ ] Implementar Service Workers para offline support
- [ ] Añadir más opciones de pago (PayPal, Stripe)
- [ ] Analytics e integraciones Google
- [ ] Multiidioma (ES, EN, PT)

---

## 📄 Licencia

Proyecto educativo. Libre para uso personal y académico.

---

## 👤 Autor

Desarrollado como parte del **Reto 1 - Desarrollo de Plataformas**  
Semestre 5 - Programa de Ingeniería

---

## 📞 Soporte

Para reportar bugs o sugerencias:
1. Abrir issue en el repositorio
2. Detallar el paso a paso para reproducir
3. Incluir screenshot/console output

---

**Última actualización**: Abril 2026  
**Versión**: 1.0.0
