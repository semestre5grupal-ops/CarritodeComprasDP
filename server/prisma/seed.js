const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')
const path = require('path')
const fs = require('fs')

const prisma = new PrismaClient()

async function main() {
  console.log('[SEED] Iniciando seed de la base de datos...')

  const productosData = [
    {
        nombre: "Legging Seamless Fit", precio: 28.00, stock: 45,
        imagen: "/images/sport-leggins-azul-deslavado-mujer.jpg",
        categoria: "Mujer", talla: "XS - XL", color: "Azul"
    },
    {
        nombre: "Top Training Core", precio: 22.00, stock: 12,
        imagen: "/images/sport-top-azul-mujer.jpg",
        categoria: "Mujer", talla: "S - L", color: "Azul"
    },
    {
        nombre: "Pro Fit Tank", precio: 25.00, stock: 42,
        imagen: "/images/2011c388_401_gm_ft_glb.jpg",
        categoria: "Hombre", talla: "M - XL", color: "Azul"
    },
    {
        nombre: "Athletic Performance Shirt", precio: 27.00, stock: 38,
        imagen: "/images/gp08h-g61_p1.jpg",
        categoria: "Unisex", talla: "XS - XXL", color: "Gris"
    }
  ]

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
          talla: p.talla ?? null,
          color: p.color ?? null,
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
        role: 'admin',
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
        role: 'user',
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
