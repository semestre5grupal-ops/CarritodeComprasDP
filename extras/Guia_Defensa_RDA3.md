# 🛡️ Guía de Defensa del Proyecto: Validación y Comprobación de Requisitos

Este documento está diseñado para servir como tu **guion de defensa** durante la presentación del proyecto. Te explica exactamente **qué hace cada comando**, **por qué es importante** a nivel de ingeniería de software, y **cómo interpretar los resultados** frente a tu profesor o evaluador para demostrar la calidad técnica de tu trabajo.

---

## 1. Comprobación de Pruebas del Backend (Jest)

**Comando a ejecutar:**
```bash
cd server
npm test
```

### 🧠 Qué significa y por qué lo usamos:
El comando `npm test` en el servidor invoca **Jest**, un framework de pruebas en JavaScript. Al ejecutarlo, Jest busca automáticamente archivos de prueba (aquellos que terminan en `.test.js`) y evalúa el comportamiento de tu API, middlewares y validadores sin necesidad de levantar el servidor entero. 

**En una defensa técnica, esto demuestra que:**
- **Tienes un enfoque profesional:** No pruebas tu código "a mano" usando Postman cada vez que cambias algo, sino que tienes procesos automatizados.
- **Tu seguridad es robusta:** Estás probando matemáticamente que tus validadores bloquean contraseñas débiles o intentos de acceso sin token.

### 👁️ Qué debes mostrar:
Debes apuntar a la consola donde verás una lista verde con **36 pruebas pasadas**. Puedes decirle al evaluador: 
> *"Aquí podemos observar cómo nuestras suites automatizadas verifican instantáneamente 36 escenarios críticos del backend, asegurando que la autenticación, la protección por roles (RBAC) y la validación de los datos (evitando inyecciones y malos formatos) funcionan perfectamente, cumpliendo con los estándares de seguridad OWASP."*

---

## 2. Comprobación de Pruebas del Frontend (Vitest)

**Comando a ejecutar:**
```bash
cd client
npm test
```

### 🧠 Qué significa y por qué lo usamos:
Este comando invoca **Vitest**, el motor de pruebas ultrarrápido diseñado específicamente para el ecosistema Vite/Vue. Se está usando para probar la lógica de negocio de tu frontend, aislada de la interfaz gráfica.

**En una defensa técnica, esto demuestra que:**
- **Separas la lógica de la vista:** Estás probando tu "Modelo" (el estado del carrito en `useCart.js`) independientemente de si el botón es rojo o azul.
- **Garantizas la integridad financiera:** Estás validando que los cálculos de precios, subtotales, descuentos y control de inventario máximo son precisos.

### 👁️ Qué debes mostrar:
Mostrarás el reporte verde de Vitest con **24 pruebas pasadas**. Puedes explicar:
> *"Del lado del cliente, utilizamos Vitest para asegurar que toda la lógica de estado reactivo del carrito de compras es infalible. Las 24 pruebas garantizan que el cálculo de totales, la aplicación de cupones de descuento y la persistencia de los datos funcionen de manera predecible, evitando errores matemáticos en el proceso de checkout."*

---

## 3. Análisis Estático y Calidad del Código (ESLint)

**Comandos a ejecutar (en terminales separadas):**
```bash
cd server
npm run lint

cd client
npm run lint
```

### 🧠 Qué significa y por qué lo usamos:
**ESLint** es una herramienta de análisis estático. Literalmente "lee" tu código sin ejecutarlo para buscar errores lógicos, variables huérfanas, malas prácticas y violaciones de formato.

**En una defensa técnica, esto demuestra que:**
- **Tu código es limpio y optimizado:** No tienes "basura" en tu código (variables que declaraste y nunca usaste).
- **Mantienes un estándar de industria:** Demuestras que podrías integrarte a un equipo de desarrollo grande donde las reglas estrictas de código (linter) son obligatorias.

### 👁️ Qué debes mostrar:
Ejecuta el comando. La consola procesará por uno o dos segundos y regresará silenciosamente a la línea de comandos sin imprimir errores ni advertencias (texto rojo o amarillo). Explica:
> *"Como parte del control de calidad de software, implementamos reglas estrictas de ESLint tanto en backend como frontend. El hecho de que este comando finalice en silencio indica que tenemos cero advertencias (0 warnings, 0 errors). Todo nuestro código respeta buenas prácticas, sin variables muertas ni código inalcanzable."*

---

## 4. Diseño Híbrido e Integración de Tailwind CSS

**Comandos a ejecutar:**
```bash
# Terminal 1
cd server && npm run dev
# Terminal 2
cd client && npm run dev
```

### 🧠 Qué significa y por qué lo usamos:
Abrirás tu aplicación en el navegador (`http://localhost:5173`). Has integrado **Tailwind CSS** (un framework utilitario de diseño) conviviendo en perfecta armonía con tu CSS puro (`styles.css`).

**En una defensa técnica, esto demuestra que:**
- **Dominas el empaquetado moderno:** Sabes cómo integrar herramientas post-procesadoras (PostCSS y Tailwind) dentro del flujo de construcción de Vite.
- **Puedes escalar el diseño:** Tienes la base pura (CSS) y la herramienta utilitaria moderna (Tailwind) lista para usarse.

### 👁️ Qué debes mostrar:
1. Muestra la aplicación funcionando y viéndose atractiva.
2. Haz clic derecho en cualquier elemento (ej. el título o un botón) y dale a **Inspeccionar**.
3. En las herramientas de desarrollador, añádele una clase de Tailwind al elemento, por ejemplo: `class="text-red-500 bg-yellow-200 p-4 rounded-xl"`.
4. El cambio se aplicará de inmediato. Puedes decir:
> *"Para garantizar la escalabilidad del diseño y cumplir con los requisitos estéticos, configuramos Vite con PostCSS para procesar Tailwind CSS en segundo plano. Esto respeta nuestro diseño CSS original de 'mobile-first', pero como pueden ver al inyectar clases en vivo desde el navegador, la utilidad de Tailwind está 100% operativa para facilitar componentes futuros."*

---

## 5. Optimización del Rendimiento (Lazy Loading)

**Cómo probarlo en vivo:**
1. Abre tu aplicación en `http://localhost:5173`.
2. Presiona `F12` o haz clic derecho > **Inspeccionar**.
3. Ve a la pestaña **Red (Network)**.
4. Navega a partes de la aplicación donde no habías entrado en esa sesión (ej. haz clic en "Login", luego "Registrarse", luego vuelve al "Catálogo").

### 🧠 Qué significa y por qué lo usamos:
Normalmente, las aplicaciones de una sola página (SPA - Single Page Applications) descargan *todo* el código fuente al inicio, lo que puede volver la carga muy lenta si la app crece. **Lazy Loading** (carga diferida) soluciona esto descargando el código solo cuando el usuario lo necesita.

**En una defensa técnica, esto demuestra que:**
- **Te preocupas por el rendimiento (Performance):** Has pensado en usuarios con conexiones lentas o dispositivos móviles de gama baja.
- **Dominas el router de Vue:** Sabes configurar `import()` dinámico en el enrutador.

### 👁️ Qué debes mostrar:
Mientras tienes la pestaña **Red (Network)** abierta, haz clic en un enlace de tu navegación. Verás que aparece un pequeño archivo `.js` nuevo en la lista descargándose en tiempo real.
> *"Finalmente, para la optimización y rendimiento (Performance) de la plataforma, implementamos Code Splitting y Lazy Loading. Como pueden observar en la pestaña Network, la aplicación no carga un paquete gigante al principio. En su lugar, cuando navegamos a una nueva vista como el Login, el sistema descarga el paquete Javascript específico de esa vista dinámicamente bajo demanda, reduciendo radicalmente el tiempo de carga inicial de nuestra aplicación."*
