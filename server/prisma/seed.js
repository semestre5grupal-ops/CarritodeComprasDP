const { PrismaClient, Role } = require('@prisma/client')
const bcrypt = require('bcrypt')
const path = require('path')
const fs = require('fs')

const prisma = new PrismaClient()

async function main() {
  console.log('[SEED] Iniciando seed de la base de datos...')

  // ── Productos desde JSON ──────────────────────────────────────────
  const productosPath = path.resolve(__dirname, '../../app/data/productos.json')
  if (!fs.existsSync(productosPath)) {
    console.warn('[SEED] No se encontró productos.json, se usarán datos por defecto')
  }

  const productosData = fs.existsSync(productosPath)
    ? JSON.parse(fs.readFileSync(productosPath, 'utf-8'))
    : []

  const existingCount = await prisma.producto.count()
  if (existingCount === 0) {
    for (const p of productosData) {
      await prisma.producto.create({
        data: {
          nombre: p.nombre,
          precio: p.precio,
          stock: p.stock ?? 0,
          imagen: p.imagen ?? null,
          categoria: p.categoria ?? null,
        },
      })
    }
    console.log(`[SEED] ${productosData.length} productos insertados`)
  } else {
    console.log(`[SEED] Saltando inserción de productos: ya existen ${existingCount} registros`)
  }

  // ── Usuarios por defecto ──────────────────────────────────────────
  const adminExists = await prisma.usuario.findUnique({ where: { username: 'admin' } })
  if (!adminExists) {
    const hash = await bcrypt.hash('Admin123!', 10)
    await prisma.usuario.create({
      data: {
        username: 'admin',
        email: 'admin@shopsport.com',
        passwordHash: hash,
        role: Role.admin,
      },
    })
    console.log('[SEED] Usuario admin creado (admin / Admin123!)')
  } else {
    console.log('[SEED] Usuario admin ya existe')
  }

  const userExists = await prisma.usuario.findUnique({ where: { username: 'usuario' } })
  if (!userExists) {
    const hash = await bcrypt.hash('User123!', 10)
    await prisma.usuario.create({
      data: {
        username: 'usuario',
        email: 'usuario@shopsport.com',
        passwordHash: hash,
        role: Role.user,
      },
    })
    console.log('[SEED] Usuario user creado (usuario / User123!)')
  } else {
    console.log('[SEED] Usuario user ya existe')
  }

  console.log('[SEED] Seed completado exitosamente')
}

main()
  .catch((e) => {
    console.error('[SEED] Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
