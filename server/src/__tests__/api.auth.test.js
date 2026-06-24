/**
 * api.auth.test.js
 * ════════════════════════════════════════════════════════════════
 * Pruebas de INTEGRACIÓN para los endpoints de Autenticación.
 *
 * Tipo: Integración (usa Supertest sobre la app Express)
 * Herramienta: Jest + Supertest
 *
 * Los modelos de Prisma son MOCKEADOS para aislar la lógica
 * del controlador sin necesidad de una base de datos real.
 *
 * Cobertura:
 *   GET  /api/health        — Health check del servidor
 *   POST /api/auth/register — Registro de usuario
 *   POST /api/auth/login    — Inicio de sesión
 *   GET  /api/auth/profile  — Perfil protegido (requiere JWT)
 * ════════════════════════════════════════════════════════════════
 */
const request = require('supertest')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const TEST_JWT_SECRET = 'test_jwt_secret_key_para_pruebas_unitarias_2024'

// ─── Mocks de módulos ────────────────────────────────────────────────────────

// 1. Mock de config/env (antes de cargar cualquier otro módulo)
jest.mock('../config/env', () => ({
  PORT: 4001,
  NODE_ENV: 'test',
  DATABASE_URL: 'mock_database_url',
  JWT_SECRET: 'test_jwt_secret_key_para_pruebas_unitarias_2024',
  JWT_EXPIRES_IN: '1h',
  CORS_ORIGIN: ['http://localhost:5173'],
  LOG_LEVEL: 'silent',
}))

// 2. Mock de lib/prisma — el singleton compartido por todos los modelos
const mockPrisma = {
  usuarios: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  clientes: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  ciudad: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  $disconnect: jest.fn(),
}
jest.mock('../lib/prisma', () => mockPrisma)

// 3. Importar app DESPUÉS de los mocks
const { app, server } = require('../index')

// ─── Setup y Teardown ────────────────────────────────────────────────────────
afterAll((done) => {
  server.close(done)
})

beforeEach(() => {
  jest.clearAllMocks()
  // Defaults seguros para evitar null pointers en modelos relacionados
  mockPrisma.clientes.findFirst.mockResolvedValue(null)
  mockPrisma.clientes.create.mockResolvedValue({ id_cliente: 1 })
  mockPrisma.ciudad.findFirst.mockResolvedValue({ id_ciudad: 1, ciu_nombre: 'Default' })
})

// ════════════════════════════════════════════════════════════════
// BLOQUE 1: Health Check
// ════════════════════════════════════════════════════════════════
describe('GET /api/health', () => {
  it('✓ Debe retornar status ok con código 200', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body).toHaveProperty('timestamp')
    expect(res.body).toHaveProperty('environment')
  })
})

// ════════════════════════════════════════════════════════════════
// BLOQUE 2: POST /api/auth/register
// ════════════════════════════════════════════════════════════════
describe('POST /api/auth/register', () => {

  it('✓ Debe retornar 400 si username está vacío', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: '', email: 'test@test.com', password: 'Password1' })

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('details')
  })

  it('✓ Debe retornar 400 si email es inválido', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', email: 'email_invalido', password: 'Password1' })

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('details')
  })

  it('✓ Debe retornar 400 si password no cumple los requisitos de seguridad', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', email: 'test@test.com', password: 'abc' })

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('details')
  })

  it('✓ Debe retornar 409 si el usuario ya existe', async () => {
    mockPrisma.usuarios.findFirst.mockResolvedValue({
      id_usuario: 1,
      usu_nombre: 'testuser',
      usu_nombrereal: 'test@test.com',
      usu_clave: 'hashed_password',
      usu_rol: 'user',
    })

    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', email: 'test@test.com', password: 'Password1' })

    expect(res.status).toBe(409)
    expect(res.body.error).toBe('DUPLICATE_ENTRY')
  })

  it('✓ Debe retornar 201 con token JWT al registrar un usuario nuevo', async () => {
    mockPrisma.usuarios.findFirst.mockResolvedValue(null) // No existe usuario previo
    mockPrisma.usuarios.create.mockResolvedValue({
      id_usuario: 99,
      usu_nombre: 'nuevo_usuario',
      usu_nombrereal: 'nuevo@test.com',
      usu_rol: 'user',
    })

    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'nuevo_usuario', email: 'nuevo@test.com', password: 'Password1' })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('token')
    expect(res.body).toHaveProperty('user')
    expect(res.body.user.username).toBe('nuevo_usuario')
    // Verificar que el token sea un JWT válido
    const decoded = jwt.verify(res.body.token, TEST_JWT_SECRET)
    expect(decoded.username).toBe('nuevo_usuario')
  })
})

// ════════════════════════════════════════════════════════════════
// BLOQUE 3: POST /api/auth/login
// ════════════════════════════════════════════════════════════════
describe('POST /api/auth/login', () => {

  it('✓ Debe retornar 400 si username está vacío', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: '', password: 'cualquier' })

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('details')
  })

  it('✓ Debe retornar 400 si password está vacío', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: '' })

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('details')
  })

  it('✓ Debe retornar 401 si el usuario no existe', async () => {
    mockPrisma.usuarios.findFirst.mockResolvedValue(null)

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'no_existe', password: 'Password1' })

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('INVALID_CREDENTIALS')
  })

  it('✓ Debe retornar 401 si la contraseña es incorrecta', async () => {
    const hashedPassword = await bcrypt.hash('CorrectPassword1', 10)
    mockPrisma.usuarios.findFirst.mockResolvedValue({
      id_usuario: 1,
      usu_nombre: 'testuser',
      usu_nombrereal: 'test@test.com',
      usu_clave: hashedPassword,
      usu_rol: 'user',
    })

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'WrongPassword1' })

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('INVALID_CREDENTIALS')
  })

  it('✓ Debe retornar 200 con token JWT al hacer login exitoso', async () => {
    const hashedPassword = await bcrypt.hash('Password1', 10)
    mockPrisma.usuarios.findFirst.mockResolvedValue({
      id_usuario: 1,
      usu_nombre: 'testuser',
      usu_nombrereal: 'test@test.com',
      usu_clave: hashedPassword,
      usu_rol: 'user',
    })

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'Password1' })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('token')
    expect(res.body).toHaveProperty('user')
    expect(res.body.user.username).toBe('testuser')
    expect(res.body.user.role).toBe('user')
    // La contraseña nunca debe aparecer en la respuesta
    expect(res.body.user).not.toHaveProperty('password')
    expect(res.body.user).not.toHaveProperty('usu_clave')
    // El token debe ser un JWT válido y decodificable
    const decoded = jwt.verify(res.body.token, TEST_JWT_SECRET)
    expect(decoded.id).toBe(1)
    expect(decoded.role).toBe('user')
  })
})

// ════════════════════════════════════════════════════════════════
// BLOQUE 4: GET /api/auth/profile (ruta protegida)
// ════════════════════════════════════════════════════════════════
describe('GET /api/auth/profile (ruta protegida)', () => {

  it('✓ Debe retornar 401 si no se envía token', async () => {
    const res = await request(app).get('/api/auth/profile')

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('AUTH_REQUIRED')
  })

  it('✓ Debe retornar 401 con token malformado', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer token_invalido_no_es_jwt')

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('INVALID_TOKEN')
  })
})
