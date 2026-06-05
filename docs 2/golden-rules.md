# Golden Rules — Shop Sport Full Stack (Reto 2)

## Calidad y Estándares

**Mandatorio:**
- Todo el código backend debe seguir MVC estricto: `routes → controllers → models (Prisma) → middleware`
- Los controladores NO deben contener lógica de acceso a datos directa; usan Prisma.
- Los middlewares deben ser funciones puras de request/response/next.
- Los mensajes de error deben seguir el formato `{ error: string, message: string }` + opcional `details`.
- Las contraseñas NUNCA deben almacenarse en texto plano.

**Prohibido:**
- Código muerto o comentado en archivos de producción.
- Dependencias sin revisar (aprobación explícita requerida).
- Archivos de más de 400 líneas (dividir en módulos más pequeños).

## Arquitectura

**Mandatorio:**
- Separación estricta de responsabilidades entre capas (ver `docs 2/architecture/`).
- Toda nueva API debe definirse con validación express-validator.
- Las decisiones arquitectónicas deben registrarse como ADR en `docs 2/architecture/`.
- Todo endpoint que modifique datos debe estar protegido con JWT + verificación de rol.
- Las transacciones que afectan múltiples tablas (ej: pedido + stock) deben usar `prisma.$transaction`.

**Prohibido:**
- Endpoints públicos que permitan modificar datos.
- Dependencias circulares entre módulos.
- Hardcodear secrets en el código (usar `.env`).

## Seguridad (OWASP)

**Mandatorio:**
- Validar y sanitizar TODA entrada del usuario (`express-validator` con `trim()`, `escape()`, `normalizeEmail()`).
- Usar `bcrypt` con mínimo 10 rondas de sal para hashing de contraseñas.
- JWT en formato `Authorization: Bearer <token>` con expiry máximo de 24h.
- CORS restrictivo: especificar orígenes en `CORS_ORIGIN`, nunca usar `*`.
- Middleware de error centralizado que NO exponga stacktrace en producción.
- Rol `admin` para operaciones CRUD sobre productos; rol `user` solo para compras.

**Prohibido:**
- Almacenar tokens JWT en `localStorage` sin considerar riesgos XSS (el frontend debe mitigarlo).
- Exponer el stacktrace de errores en producción.
- Usar `eval()` o `new Function()` en el backend.

## Documentación

**Mandatorio:**
- Cada cambio en la arquitectura debe registrarse en un ADR dentro de `docs 2/architecture/`.
- El diseño activo debe documentarse en `docs 2/design_sessions/active-design.md`.
- Los agentes IA DEBEN leer `docs 2/golden-rules.md` antes de cualquier implementación.
- Los agentes IA DEBEN leer `docs 2/architecture/README.md` antes de cualquier implementación.

**Prohibido:**
- Improvisar decisiones técnicas sin consultar la documentación existente.
- Crear archivos de documentación sin seguir las plantillas existentes.

## Principio Final

**Preferir:** Claridad sobre atajos, simplicidad sobre complejidad, procesos deterministas sobre improvisación.

**Violar cualquiera de estas reglas requiere:** `STOP` — detener la implementación, revisar con el equipo y justificar la excepción por escrito.

---

## Acta de Cierre — Proyecto Full Stack Reto 2-5

**Fecha:** Junio 2026

### Arquitectura N-Capas Final

```
┌──────────────────────────────────────────────────────────────┐
│  CLIENTE (Vue 3 Composition API + Vite)                     │
│  ├── Views/ (CatalogView, LoginView, RegisterView, AdminView)│
│  ├── Components/ (ProductCard, CartDrawer)                  │
│  ├── Composables/ (useAuth, useCart)                        │
│  └── Services/ (api.js HTTP client, db.js IndexedDB)        │
├──────────────────────────────────────────────────────────────┤
│  SERVER (Node.js + Express + MVC)                           │
│  ├── Routes → Controllers → Middlewares                      │
│  └── Prisma ORM → SQL Server                                │
└──────────────────────────────────────────────────────────────┘
```

### Funcionalidades Implementadas (Fases 1-5)

| Fase | Descripción | Estado |
|------|------------|--------|
| 1 | Backend Express + Prisma + SQL Server + JWT | ✅ Completado |
| 2 | Validación express-validator, unified pedidos, error handling | ✅ Completado |
| 3 | Frontend Vue 3 + Vite, CatalogView, ProductCard, servicios | ✅ Completado |
| 4 | Auth views, CartDrawer, IndexedDB offline, checkout progresivo | ✅ Completado |
| 5 | AdminView CRUD, router guard, documentación final, README | ✅ Completado |

### Cumplimiento de Reglas de Oro

- ✅ MVC estricto en backend (routes → controllers → Prisma)
- ✅ Separación de capas cliente (Views/Components/Composables/Services)
- ✅ Validación express-validator en todos los endpoints
- ✅ JWT + bcrypt + CORS + Helmet + rate-limit (OWASP)
- ✅ Arquitectura documentada en ADRs y active-design.md
- ✅ Zero placeholders, cero código comentado
- ✅ WCAG 2.2 AA en todos los componentes frontend
- ✅ Mobile-First responsive design

---

## Auditoría Final QA — Parches Aplicados

### Hallazgo 1: Helmet y rate-limit faltaban
**Archivo:** `server/src/index.js`  
**Problema:** Helmet (HTTP security headers) y express-rate-limit no estaban instalados ni implementados, aunque el README los listaba como medidas OWASP.  
**Solución:** Se instalaron `helmet` y `express-rate-limit`. Se agregaron al pipeline de middlewares:
```js
app.use(helmet())
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }))
```

### Hallazgo 2: Race condition en stock decrement
**Archivo:** `server/src/controllers/pedido.controller.js`  
**Problema:** La verificación de stock se realizaba antes del `$transaction`, creando una ventana de race condition entre la lectura y el decremento dentro de la transacción.  
**Solución:** Se reemplazó `prisma.producto.update` por `prisma.producto.updateMany` con condición `stock: { gte: d.cantidad }` dentro de la transacción. Si `updated.count === 0`, se lanza un error `INSUFFICIENT_STOCK` que fuerza el rollback automático de la transacción.

### Hallazgo 3: errorHandler sin fuga de stacktrace (CONFIRMADO)
**Archivo:** `server/src/middleware/errorHandler.js`  
**Resultado:** ✅ CORRECTO — El stacktrace solo se expone en desarrollo (`NODE_ENV === 'development'`). En producción, el cuerpo de error es `{ error, message }` sin trazas.

### Hallazgo 4: CORS sin wildcard (CONFIRMADO)
**Archivo:** `server/src/index.js` + `server/src/config/env.js`  
**Resultado:** ✅ CORRECTO — `CORS_ORIGIN` se lee de `.env` como array de orígenes. Nunca se usa `*`.

### Hallazgo 5: JWT injectado correctamente (CONFIRMADO)
**Archivo:** `client/src/services/api.js`  
**Resultado:** ✅ CORRECTO — `Authorization: Bearer <token>` desde localStorage.

### Hallazgo 6: Claves de persistencia consistentes (CONFIRMADO)
**Archivo:** `client/src/composables/useCart.js`  
**Resultado:** ✅ CORRECTO — `localStorage` → `shopsport_cart`, `sessionStorage` → `shopsport_cart_ts`.
