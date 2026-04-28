# TechStore | Carrito de Compras DP

Plataforma de venta académica con diseño responsivo, altos estándares de accesibilidad (WCAG) y carga dinámica de productos desde fuentes JSON locales, desarrollada para el **Curso de Desarrollo de Plataformas**.

## Descripción del Proyecto

Este proyecto consiste en la creación de un carrito de compras funcional y semánticamente correcto, diseñado sin depender de frameworks de UI externos (como Bootstrap o Tailwind). El desarrollo se ha planificado en diferentes Sprints, centrándose actualmente en cimentar una estructura HTML5 blindada, un diseño responsivo puro (Flexbox/Grid), y bases preparadas para conectarse con lógicas complejas de JavaScript, validación cruzada y persistencia.

## Estructura de Carpetas

La arquitectura base del repositorio respeta el principio de modularidad y separación de responsabilidades:

```text
├── assets/
│   └── css/
│       └── styles.css        # Vanilla CSS, Media Queries, variables (No Frameworks)
├── data/
│   └── productos.json        # Base de datos estática
├── js/
│   ├── app.js               # Punto de entrada / carga Fetch API
│   └── ...                  # Futuros módulos de carrito, UI, e instancias
├── index.html                # Plantilla principal HTML5
└── README.md                 # Documentación del Repositorio
```

## Explicación Técnica

Toda la aplicación se soporta bajo HTML5 y Vanilla CSS/JS:

- **Estructura y Maquetación:** No se emplean componentes forzados mediante etiquetas de bloque indiscriminadas (`<div>` soup). En su lugar se aplican `header`, `nav`, `main`, `section`, `aside` y `fieldset` nativos. Para el diseño adaptativo se emplearon `CSS Grid` (para el catálogo) y `Flexbox` (para la navegación de cabecera).
- **Consumo de Datos Dinámico:** Muestra inicial preparada para consumir productos nativamente utilizando `Fetch API` en ECMAScript 6+ (`js/app.js`), parseando el archivo interno `productos.json` empleando async/await.
- **Validaciones UX/UI:** Implementación de un doble escudo de seguridad en formularios de contacto, usando atributos HTML combinados (`type="email"`, expresiones regulares nativas `pattern`, `minlength`, y limitación de input) que delegan lógicas secundarias al subsistema de JavaScript (`onblur` / `oninput` con debouncer) preparando un terreno robusto y escalable.

## Observaciones sobre Accesibilidad (A11Y) y Persistencia

Se aplicaron principios estrictos de accesibilidad AAA:
- **Jerarquía:** Un único título principal `<h1>` gobierna el contorno de toda la página para lectores de pantalla.
- **Navegación Visual:** Construcción del salto rápido a contenido principal `.skip-link` enfocado para navegación mediante tabulación de teclado.
- **Formularios Dinámicos Nativos:** Se asignó interactividad descriptiva vinculando validaciones a áreas ocultas empleando `aria-describedby` y estados semánticos `role="alert"` para ayudar auditivamente a notificar errores sin interrumpir el flujo. Además, cada `<label for>` identifica estrictamente su `<input>`.
- **Avisos Asíncronos:** El `<aside>` encargado de reflejar la inserción de artículos cuenta con el identificador `aria-live="polite"` para notificar de manera cómoda a tecnologías asistivas sobre cambios en el DOM generados por JS.
- **Persistencia de Datos (Roadmap):** La arquitectura actual está lista para en siguientes fases poder integrar Web Storage API (Local y Session Storage) que capture el evento de envío, o manipule los estados parciales del Carrito y la Preferencia de Pago, vinculando una marca temporal en el Storage para rastreo simulando caducidad de sesión.