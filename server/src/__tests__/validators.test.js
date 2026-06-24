/**
 * validators.test.js
 * ════════════════════════════════════════════════════════════════
 * Pruebas UNITARIAS de los validadores de entrada (express-validator).
 *
 * Tipo: Unitarias (no requieren base de datos)
 * Herramienta: Jest
 *
 * Cobertura:
 *   ✓ registerRules — valida campos de registro de usuario
 *   ✓ loginRules    — valida campos de inicio de sesión
 *   ✓ productoRules — valida campos de creación de producto
 * ════════════════════════════════════════════════════════════════
 */

const { validationResult } = require('express-validator')
const { registerRules, loginRules } = require('../validators/auth.validator')
const { createRules } = require('../validators/producto.validator')

// ─── Helper ─────────────────────────────────────────────────────────────────
/**
 * Ejecuta las reglas de validación de express-validator sobre un body dado
 * y retorna los errores encontrados.
 */
async function runValidation(rules, body) {
  const req = { body, headers: {} }

  // Ejecutar cada regla secuencialmente
  for (const rule of rules) {
    await rule.run(req)
  }

  return validationResult(req)
}

// ════════════════════════════════════════════════════════════════
// BLOQUE 1: registerRules (Auth Validator)
// ════════════════════════════════════════════════════════════════
describe('Validador registerRules()', () => {

  it('✓ Debe pasar sin errores con datos válidos', async () => {
    const result = await runValidation(registerRules, {
      username: 'usuario_test',
      email: 'test@example.com',
      password: 'Password1',
    })
    expect(result.isEmpty()).toBe(true)
  })

  it('✓ Debe fallar si username está vacío', async () => {
    const result = await runValidation(registerRules, {
      username: '',
      email: 'test@example.com',
      password: 'Password1',
    })
    expect(result.isEmpty()).toBe(false)
    const errors = result.array()
    expect(errors.some(e => e.path === 'username')).toBe(true)
  })

  it('✓ Debe fallar si username tiene caracteres especiales no permitidos', async () => {
    const result = await runValidation(registerRules, {
      username: 'user@name!',
      email: 'test@example.com',
      password: 'Password1',
    })
    expect(result.isEmpty()).toBe(false)
    const errors = result.array()
    expect(errors.some(e => e.path === 'username')).toBe(true)
  })

  it('✓ Debe fallar si email tiene formato inválido', async () => {
    const result = await runValidation(registerRules, {
      username: 'usuario',
      email: 'no_es_un_email',
      password: 'Password1',
    })
    expect(result.isEmpty()).toBe(false)
    const errors = result.array()
    expect(errors.some(e => e.path === 'email')).toBe(true)
  })

  it('✓ Debe fallar si contraseña es menor a 6 caracteres', async () => {
    const result = await runValidation(registerRules, {
      username: 'usuario',
      email: 'test@example.com',
      password: 'A1b',
    })
    expect(result.isEmpty()).toBe(false)
    const errors = result.array()
    expect(errors.some(e => e.path === 'password')).toBe(true)
  })

  it('✓ Debe fallar si contraseña no tiene mayúsculas', async () => {
    const result = await runValidation(registerRules, {
      username: 'usuario',
      email: 'test@example.com',
      password: 'password1',   // Sin mayúsculas
    })
    expect(result.isEmpty()).toBe(false)
    const errors = result.array()
    expect(errors.some(e => e.path === 'password')).toBe(true)
  })

  it('✓ Debe fallar si contraseña no tiene números', async () => {
    const result = await runValidation(registerRules, {
      username: 'usuario',
      email: 'test@example.com',
      password: 'PasswordSinNumero', // Sin números
    })
    expect(result.isEmpty()).toBe(false)
    const errors = result.array()
    expect(errors.some(e => e.path === 'password')).toBe(true)
  })
})

// ════════════════════════════════════════════════════════════════
// BLOQUE 2: loginRules (Auth Validator)
// ════════════════════════════════════════════════════════════════
describe('Validador loginRules()', () => {

  it('✓ Debe pasar sin errores con datos válidos', async () => {
    const result = await runValidation(loginRules, {
      username: 'usuario_test',
      password: 'cualquier_password',
    })
    expect(result.isEmpty()).toBe(true)
  })

  it('✓ Debe fallar si username está vacío', async () => {
    const result = await runValidation(loginRules, {
      username: '',
      password: 'cualquier_password',
    })
    expect(result.isEmpty()).toBe(false)
    const errors = result.array()
    expect(errors.some(e => e.path === 'username')).toBe(true)
  })

  it('✓ Debe fallar si password está vacío', async () => {
    const result = await runValidation(loginRules, {
      username: 'usuario_test',
      password: '',
    })
    expect(result.isEmpty()).toBe(false)
    const errors = result.array()
    expect(errors.some(e => e.path === 'password')).toBe(true)
  })
})

// ════════════════════════════════════════════════════════════════
// BLOQUE 3: createRules (Producto Validator)
// ════════════════════════════════════════════════════════════════
describe('Validador createRules() para Productos', () => {

  it('✓ Debe pasar sin errores con datos de producto válidos', async () => {
    const result = await runValidation(createRules, {
      nombre: 'Camiseta Deportiva',
      descripcion: 'Camiseta de alto rendimiento',
      precio: 29.99,
      stock: 100,
      imagen: 'https://example.com/imagen.jpg',
    })
    expect(result.isEmpty()).toBe(true)
  })

  it('✓ Debe fallar si nombre está vacío', async () => {
    const result = await runValidation(createRules, {
      nombre: '',
      precio: 29.99,
      stock: 100,
    })
    expect(result.isEmpty()).toBe(false)
    const errors = result.array()
    expect(errors.some(e => e.path === 'nombre')).toBe(true)
  })

  it('✓ Debe fallar si precio es negativo', async () => {
    const result = await runValidation(createRules, {
      nombre: 'Producto válido',
      precio: -10,
      stock: 100,
    })
    expect(result.isEmpty()).toBe(false)
    const errors = result.array()
    expect(errors.some(e => e.path === 'precio')).toBe(true)
  })

  it('✓ Debe fallar si stock no es un entero', async () => {
    const result = await runValidation(createRules, {
      nombre: 'Producto válido',
      precio: 29.99,
      stock: 10.5,   // Decimal, debe fallar
    })
    expect(result.isEmpty()).toBe(false)
    const errors = result.array()
    expect(errors.some(e => e.path === 'stock')).toBe(true)
  })
})
