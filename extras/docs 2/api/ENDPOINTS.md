# API REST — Shop Sport

Documentación de endpoints de la API REST del backend.

---

## Convenciones

- **Base URL:** `http://localhost:4000/api`
- **Autenticación:** `Authorization: Bearer <token>`
- **Respuesta exitosa:** `{ message?, data?, token?, user? }`
- **Respuesta error:** `{ error: string, message: string, details? }`
- **Códigos HTTP:** 200 (ok), 201 (creado), 400 (validación), 401 (no auth), 403 (prohibido), 404 (no encontrado), 409 (conflicto), 500 (error interno)

---

## Health Check

### `GET /api/health`

Verifica que el servidor está operativo.

**Respuesta 200:**
```json
{
  "status": "ok",
  "timestamp": "2026-06-05T00:00:00.000Z",
  "environment": "development"
}
```

---

## Autenticación

### `POST /api/auth/register`

Registra un nuevo usuario con rol `user`. Devuelve JWT.

**Body:**
```json
{
  "username": "nuevousuario",
  "email": "user@example.com",
  "password": "MiPassword1"
}
```

**Respuesta 201:**
```json
{
  "message": "Usuario registrado exitosamente",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "nuevousuario",
    "email": "user@example.com",
    "role": "user"
  }
}
```

**Errores:**
| Código | Condición |
|--------|-----------|
| 400 | Validación fallida (password débil, email inválido, etc.) |
| 409 | Username o email ya registrado |

**Validaciones:**
- `username`: 3-30 caracteres, solo letras/números/guion bajo
- `email`: formato email válido, máximo 100 caracteres
- `password`: 6-50 caracteres, debe contener mayúscula, minúscula y número

---

### `POST /api/auth/login`

Inicia sesión con username y password. Devuelve JWT.

**Body:**
```json
{
  "username": "admin",
  "password": "Admin123!"
}
```

**Respuesta 200:**
```json
{
  "message": "Inicio de sesión exitoso",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@shopsport.com",
    "role": "admin"
  }
}
```

**Errores:**
| Código | Condición |
|--------|-----------|
| 401 | Credenciales inválidas |

---

### `GET /api/auth/profile`

Obtiene el perfil del usuario autenticado.

**Headers:** `Authorization: Bearer <token>`

**Respuesta 200:**
```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@shopsport.com",
    "role": "admin",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

---

## Productos

### `GET /api/productos`

Lista todos los productos. **Público.**

**Query params opcionales:** `?categoria=Mujer`

**Respuesta 200:**
```json
{
  "data": [
    {
      "id": 1,
      "nombre": "Legging Seamless Fit",
      "precio": 28.0,
      "stock": 45,
      "imagen": "../view/assets/images/sport-leggins-azul-deslavado-mujer.jpg",
      "categoria": "Mujer",
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### `GET /api/productos/:id`

Obtiene un producto por su ID. **Público.**

**Respuesta 200:**
```json
{
  "data": {
    "id": 1,
    "nombre": "Legging Seamless Fit",
    "precio": 28.0,
    "stock": 45,
    "imagen": "../view/assets/images/sport-leggins-azul-deslavado-mujer.jpg",
    "categoria": "Mujer",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

**Errores:** 404 si el producto no existe.

---

### `POST /api/productos`

Crea un nuevo producto. **Requiere JWT + rol admin.**

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "nombre": "Nuevo Producto",
  "precio": 29.99,
  "stock": 100,
  "categoria": "Mujer",
  "imagen": "../view/assets/images/nuevo-producto.jpg"
}
```

**Respuesta 201:**
```json
{
  "message": "Producto creado exitosamente",
  "data": { ... }
}
```

---

### `PUT /api/productos/:id`

Actualiza un producto existente. **Requiere JWT + rol admin.**

**Headers:** `Authorization: Bearer <token>`

**Body (todos los campos son opcionales):**
```json
{
  "nombre": "Nombre Actualizado",
  "precio": 35.0,
  "stock": 50
}
```

**Respuesta 200:**
```json
{
  "message": "Producto actualizado exitosamente",
  "data": { ... }
}
```

---

### `DELETE /api/productos/:id`

Elimina un producto. **Requiere JWT + rol admin.**

**Headers:** `Authorization: Bearer <token>`

**Respuesta 200:**
```json
{
  "message": "Producto eliminado exitosamente"
}
```

**Errores:**
| Código | Condición |
|--------|-----------|
| 409 | El producto tiene pedidos asociados (foreign key constraint) |

---

## Pedidos

### `POST /api/pedidos`

Crea un nuevo pedido. Descuenta stock en una transacción atómica. **Requiere JWT.**

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "detalles": [
    {
      "productoId": 1,
      "cantidad": 2,
      "precioUnitario": 28.0
    },
    {
      "productoId": 3,
      "cantidad": 1,
      "precioUnitario": 24.0
    }
  ]
}
```

**Respuesta 201:**
```json
{
  "message": "Pedido creado exitosamente",
  "data": {
    "id": 1,
    "userId": 1,
    "total": 80.0,
    "createdAt": "2026-06-05T00:00:00.000Z",
    "detalles": [
      {
        "id": 1,
        "pedidoId": 1,
        "productoId": 1,
        "cantidad": 2,
        "precioUnitario": 28.0,
        "producto": { "id": 1, "nombre": "Legging Seamless Fit" }
      }
    ]
  }
}
```

**Errores:**
| Código | Condición |
|--------|-----------|
| 400 | Stock insuficiente para algún producto |
| 404 | Producto no encontrado |

---

### `GET /api/pedidos/mis-pedidos`

Obtiene los pedidos del usuario autenticado. **Requiere JWT.**

**Headers:** `Authorization: Bearer <token>`

**Respuesta 200:**
```json
{
  "data": [
    {
      "id": 1,
      "userId": 1,
      "total": 80.0,
      "createdAt": "2026-06-05T00:00:00.000Z",
      "detalles": [...]
    }
  ]
}
```

---

### `GET /api/pedidos`

Obtiene pedidos. **Requiere JWT.** El comportamiento depende del rol:
- **admin:** retorna todos los pedidos del sistema (con datos del usuario)
- **user:** retorna solo sus propios pedidos

**Headers:** `Authorization: Bearer <token>`

**Respuesta 200 (admin):**
```json
{
  "data": [
    {
      "id": 1,
      "userId": 1,
      "total": 80.0,
      "createdAt": "2026-06-05T00:00:00.000Z",
      "usuario": { "id": 1, "username": "admin", "email": "admin@shopsport.com" },
      "detalles": [...]
    }
  ]
}
```

**Respuesta 200 (user):**
```json
{
  "data": [
    {
      "id": 2,
      "userId": 2,
      "total": 45.0,
      "createdAt": "2026-06-05T00:00:00.000Z",
      "usuario": { "id": 2, "username": "usuario", "email": "usuario@shopsport.com" },
      "detalles": [...]
    }
  ]
}
```

---

## Resumen de Roles y Protección

| Endpoint | Método | Auth | Rol | Público |
|----------|--------|------|-----|---------|
| `/api/health` | GET | — | — | ✅ |
| `/api/auth/register` | POST | — | — | ✅ |
| `/api/auth/login` | POST | — | — | ✅ |
| `/api/auth/profile` | GET | JWT | cualquiera | ❌ |
| `/api/productos` | GET | — | — | ✅ |
| `/api/productos/:id` | GET | — | — | ✅ |
| `/api/productos` | POST | JWT | admin | ❌ |
| `/api/productos/:id` | PUT | JWT | admin | ❌ |
| `/api/productos/:id` | DELETE | JWT | admin | ❌ |
| `/api/pedidos` | POST | JWT | cualquiera | ❌ |
| `/api/pedidos/mis-pedidos` | GET | JWT | cualquiera | ❌ |
| `/api/pedidos` | GET | JWT | admin/user* | ❌ |

*`GET /api/pedidos`: admin ve todos, user ve solo los suyos.
