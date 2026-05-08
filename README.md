# 🛍️ Shop Sport — Carrito de Compras

> **Tienda de ropa deportiva minimalista** desarrollada con HTML5 semántico, CSS3 responsive (Mobile-First) y JavaScript Vanilla ES6+ modular. Sin frameworks. Sin dependencias externas.
---

## 📋 Descripción del Proyecto

**Shop Sport** es una aplicación frontend de comercio electrónico educativa que demuestra el dominio de tecnologías web modernas sin dependencias externas. Implementa un catálogo dinámico de 20 productos de ropa deportiva (Mujer, Hombre, Unisex), un carrito de compras completamente funcional y cuatro estrategias de persistencia de datos del lado del cliente.

El proyecto fue desarrollado como parte del **Reto 1 — Desarrollo de Plataformas** (Semestre 5) y sigue principios estrictos de separación de responsabilidades (MVC), accesibilidad WCAG 2.2 AA y diseño Mobile-First.

---

## ✨ Características Principales

| Característica | Detalle |
|---|---|
| 🗂️ **Catálogo dinámico** | 20 productos en 3 categorías cargados desde JSON local con filtros y búsqueda |
| 🛒 **Carrito completo** | Añadir, eliminar, actualizar cantidad y selección múltiple (bulk delete) |
| 💾 **Persistencia integral** | 4 mecanismos: localStorage, sessionStorage, IndexedDB y Cookies |
| ♿ **Accesibilidad WCAG 2.2 AA** | ARIA labels, navegación por teclado, contraste 4.5:1, focus visible y focus trap |
| 📱 **Responsive Mobile-First** | 3 breakpoints: mobile (320px), tablet (768px) y desktop (1024px+) |
| ✅ **Validación avanzada** | Regex para nombre, email y teléfono con feedback accesible en tiempo real |
| 🔒 **Sanitización** | Prevención de XSS e inyección SQL en inputs del formulario |
| 🏗️ **Arquitectura modular** | ES6 Modules con patrón MVC estricto y separación total de capas |
| 📡 **PWA Offline-First** | Listeners de red y notificaciones de conectividad |
| 📬 **Contacto integrado** | Formulario con redirección a WhatsApp y correo (gabrielaguinaga30@gmail.com) |

---

## 🚀 Inicio Rápido

### Requisitos

- Navegador moderno: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Servidor local (requerido para ES6 Modules con `import`/`export`)

### Instalación

**1. Clonar el repositorio**
```bash
git clone https://github.com/semestre5grupal-ops/CarritodeComprasDP.git
cd CarritodeComprasDP
```

**2. Levantar servidor local**

Opción A — VS Code Live Server (recomendado):
```
Click derecho en index.html → "Open with Live Server"
Acceso: http://localhost:5500
```

Opción B — Python (sin instalación adicional):
```bash
python -m http.server 8080
# Acceso: http://localhost:8080
```

Opción C — Node.js (npx):
```bash
npx serve .
```

> ⚠️ **No abrir `index.html` directamente** desde el explorador de archivos. Los módulos ES6 requieren un servidor HTTP para evitar errores CORS.

---

## 📁 Estructura del Proyecto

```
CarritodeComprasDP/
│
├── index.html                          # Entrada principal (HTML5 semántico + Open Graph + PWA meta)
├── README.md                           # Este archivo
│
├── app/
│   ├── view/
│   │   ├── catalog.html                # Página de catálogo con filtros y fieldsets accesibles
│   │   └── assets/
│   │       └── css/
│   │           ├── styles.css          # Estilos globales, variables CSS custom, breakpoints
│   │           └── components/
│   │               ├── products.css    # Tarjetas de producto + formulario de contacto
│   │               ├── cart.css        # Drawer del carrito + modales de confirmación
│   │               └── catalog.css     # Sidebar de filtros + layout de catálogo
│   │
│   ├── controller/
│   │   └── js/
│   │       ├── app.js                  # Orquestador: carrito, focus trap, PWA, menú mobile
│   │       ├── cart.js                 # Modelo del carrito (CRUD + persistencia localStorage)
│   │       ├── view.js                 # Renderizado DOM, alertas y modales
│   │       ├── catalog.js              # Lógica de catálogo, filtros y caché IndexedDB
│   │       ├── contacto.js             # Validación MVC + sanitización XSS/SQL
│   │       ├── repo.js                 # Repositorio de datos (fetch async + caché IndexedDB)
│   │       └── storage.js              # Fachada: 4 estrategias de persistencia
│   │
│   └── data/
│       └── productos.json              # 20 productos con nombre, precio, talla, color, stock e imagen
│
└── docs/
    ├── architecture/                   # ADRs y visión arquitectónica
    ├── design_sessions/                # Sesiones de diseño activas
    ├── ai_development/                 # Agentes y workflows de desarrollo asistido por IA
    ├── context/                        # Restricciones y contratos de diseño
    ├── product-requirements.md         # Requisitos de producto
    ├── technical-requirements.md       # Requisitos técnicos
    └── golden-rules.md                 # Reglas de oro del proyecto
```

---

## 🛠️ Tecnologías Utilizadas

| Capa | Tecnología | Características clave |
|------|------------|----------------------|
| **Estructura** | HTML5 Semántico | `<article>`, `<aside>`, `<nav>`, `<dialog>`, Open Graph, ARIA roles |
| **Presentación** | CSS3 + Grid/Flexbox | Variables CSS custom, Media queries, Animaciones, Mobile-First |
| **Comportamiento** | JavaScript ES6+ | Módulos, Arrow Functions, Async/Await, Destructuring, Optional Chaining |
| **Persistencia** | Web Storage APIs | localStorage, sessionStorage, IndexedDB (ShopSportDB v2), Cookies |
| **Datos** | JSON local | 20 productos: Mujer, Hombre, Unisex |

### ⚠️ Restricciones Intencionales (Stack Cerrado)

```
❌ React / Vue / Angular          ❌ Tailwind / Bootstrap / Foundation
❌ jQuery / Lodash / Axios        ❌ Backend externo / APIs de terceros
❌ Bundlers (Webpack / Vite)      ❌ Preprocesadores CSS (Sass / Less)
```

---

## 📱 Responsive Design (Mobile-First)

| Dispositivo | Breakpoint | Características |
|-------------|-----------|-----------------|
| **Mobile** | `< 768px` | Layout vertical, sidebar como overlay deslizante, botones touch-friendly (44×44px) |
| **Tablet** | `768px – 1023px` | Sidebar sticky lateral, grid de 2 columnas, navegación accesible |
| **Desktop** | `≥ 1024px` | Layout completo en grid, hover effects, max-width 1200px centrado |

---

## 🛒 Funcionalidad del Carrito

### Operaciones disponibles

```
➕  Añadir producto     → Seleccionar talla (si aplica) + cantidad + "Añadir al carrito"
✏️  Actualizar cantidad → Controles +/− en el drawer (recalcula total en tiempo real)
🗑️  Eliminar producto   → Ícono de papelera + diálogo de confirmación accesible
☑️  Bulk delete         → Checkbox "Seleccionar todos" + eliminar múltiple
```

### Cálculo de totales

```
Subtotal por línea = precio × cantidad
Total = Σ subtotales de todos los productos
```

El total se recalcula automáticamente ante cualquier cambio y se muestra en el drawer y en el checkout.

---

## 💾 Estrategias de Persistencia

El proyecto implementa **4 mecanismos de almacenamiento** del lado del cliente, gestionados por `storage.js`:

```
Acción del Usuario
       │
       ▼
 Estado en Memoria (carrito[])
       │
       ├──▶ localStorage    → Carrito completo (persiste indefinidamente)
       ├──▶ sessionStorage  → Timestamp de última actualización (se limpia al cerrar tab)
       ├──▶ IndexedDB       → Caché del catálogo en ShopSportDB v2
       └──▶ Cookies         → Preferencias del usuario (expira en 1 año)
```

| Mecanismo | Clave / Store | Duración |
|-----------|--------------|----------|
| **localStorage** | `sportstore_shopping_cart` | Indefinida |
| **sessionStorage** | `lastUpdate` ISO timestamp | Hasta cerrar pestaña |
| **IndexedDB** | `ShopSportDB` → stores: `productos`, `colaTareas` | Indefinida |
| **Cookies** | `terminosAceptados=true; max-age=31536000` | 1 año |

---

## ♿ Accesibilidad (POUR — WCAG 2.2 AA)

### Perceptible 👁️
- Todas las imágenes tienen atributo `alt` descriptivo
- Contraste mínimo de 4.5:1 para texto y 3:1 para elementos gráficos
- Paleta de colores compatible con daltonismo

### Operable ⌨️
- Navegación completa por teclado (Tab, Shift+Tab, Enter, Escape)
- Focus visible con outline de 3px
- Skip-link funcional al contenido principal
- Botones con tamaño mínimo de 44×44px (touch-friendly)
- Focus trap en modales y en el drawer del carrito

### Comprensible 📖
- Etiquetas `<label>` asociadas a todos los inputs
- Mensajes de error con `aria-describedby` y `role="alert"`
- Jerarquía de encabezados coherente: `h1 → h2 → h3`
- Idioma declarado en `<html lang="es">`

### Robusto 🔧
- HTML5 válido (W3C)
- Roles ARIA: `navigation`, `main`, `dialog`, `alert`, `listitem`
- `aria-live="polite"` para actualizaciones dinámicas del carrito
- Compatible con NVDA, JAWS y VoiceOver

---

## 🏗️ Arquitectura de Módulos JavaScript

```
┌─────────────────────────────────────────────────────────┐
│                        app.js                           │
│              (Orquestador / Entry Point)                 │
│   Init, eventos globales, menú mobile, PWA, cookies     │
└────────────┬───────────────────┬────────────────────────┘
             │                   │
     ┌───────▼──────┐    ┌───────▼──────┐
     │   cart.js    │    │   view.js    │
     │  (Modelo)    │    │   (Vista)    │
     │  CRUD lógica │    │  Renderizado │
     │  Persistencia│    │  DOM + ARIA  │
     └───────┬──────┘    └──────────────┘
             │
     ┌───────▼──────┐    ┌──────────────┐    ┌──────────────┐
     │   repo.js    │    │  catalog.js  │    │ contacto.js  │
     │ (Repositorio)│    │  (Catálogo)  │    │ (Formulario) │
     │ fetch + IDB  │    │ Filtros + UI │    │ MVC + Regex  │
     └───────┬──────┘    └──────────────┘    └──────────────┘
             │
     ┌───────▼──────┐
     │  storage.js  │
     │  (Fachada)   │
     │ 4 mecanismos │
     └──────────────┘
```

---

## ✅ Validación y Seguridad del Formulario

### Expresiones regulares implementadas

| Campo | Regex | Ejemplo válido |
|-------|-------|----------------|
| **Nombre** | `/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/` | `María José García` |
| **Email** | `/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/` | `usuario@dominio.com` |
| **Teléfono** | `/^09\d{8}$/` | `0987654321` (formato Ecuador) |

### Sanitización de entradas (XSS + SQL Injection)

- Elimina: `;` `'` `"` `--` `/*` `*/`
- Escapa: `<` → `&lt;` y `>` → `&gt;`
- Errores mostrados con `aria-invalid="true"` y `role="alert"`

---

## 📬 Medios de Contacto

El footer incluye dos canales de contacto directos:

| Canal | Enlace |
|-------|--------|
| **WhatsApp** | [+593 998 353 446](https://wa.me/593998353446) — abre chat directo |
| **Correo** | [gabrielaguinaga30@gmail.com](https://mail.google.com/mail/?view=cm&to=gabrielaguinaga30@gmail.com) — abre Gmail con destinatario pre-completado |

---

## 🐛 Troubleshooting

**Los productos no se cargan**
```
✓ Abre el proyecto desde un servidor local (no doble click en .html)
✓ Verifica que app/data/productos.json existe
✓ Revisa la consola (F12 → Console) para errores de fetch o CORS
```

**El carrito no persiste entre recargas**
```
✓ DevTools → Application → localStorage → busca 'sportstore_shopping_cart'
✓ Verifica que el navegador permite localStorage (no modo incógnito)
```

**Los íconos de contacto se ven sin color**
```
✓ Verifica que styles.css contiene .footer-contact-link--wa y .footer-contact-link--mail
✓ Revisa que el HTML tiene las clases footer-contact-link--wa / --mail en los <a>
```

**Error de CORS con módulos JS**
```
✓ No abrir index.html directamente desde el sistema de archivos
✓ Usar Live Server, Python HTTP Server o npx serve
```

---

## 🔮 Mejoras Futuras

- [ ] Service Worker para soporte offline completo (PWA)
- [ ] Integración con API backend para gestión de órdenes
- [ ] Sistema de autenticación de usuarios
- [ ] Pasarelas de pago (PayPal, Stripe)
- [ ] Soporte multiidioma (ES / EN / PT)
- [ ] Tests unitarios con Vitest (sin bundler)

---

## 🌿 Ramas del Repositorio

| Rama | Propósito |
|------|-----------|
| `main` | Producción estable |
| `develop` | Integración de features |
| `btn-eliminar-actualizar` | Feature: botones del carrito |
| `Catálogo-de-productos` | Feature: catálogo con filtros |
| `Modular-js` | Refactor: modularización JS |
| `progresividad-carrito` | Feature: mejoras progresivas |
| `carrito-localstorage` | Feature: persistencia del carrito |
| `Unificar-lógica-de-carrito` | Refactor: unificación de lógica |
| `Guardar-preferencias-con-Cookies-#26` | Feature: cookies de preferencias |
| `Conexión-de-errores-con-Accesibilidad-#29` | Feature: mensajes de error ARIA |
| `38-mobile-first` | Feature: diseño responsive |
| `46-mobile-first-header` | Feature: header responsivo con ARIA |
| `integracion-imagenes` | Feature: imágenes del catálogo |
| `Interfaz-Inicio` | Feature: página de inicio |

---

## 📄 Licencia

Proyecto educativo de libre uso personal y académico.
Desarrollado como parte del **Reto 1 — Desarrollo de Plataformas**, Semestre 5.

---

## 👥 Autores

Desarrollado por el equipo **semestre5grupal-ops**
🔗 [github.com/semestre5grupal-ops/CarritodeComprasDP](https://github.com/semestre5grupal-ops/CarritodeComprasDP)

---

## 📞 Soporte

Para reportar bugs o sugerencias, abre un [Issue](https://github.com/semestre5grupal-ops/CarritodeComprasDP/issues) describiendo el problema paso a paso e incluyendo screenshot y output de consola (F12).

---

**Versión:** 3.0.0 · **Última actualización:** Mayo 2026 · **Accesibilidad:** WCAG 2.2 AA