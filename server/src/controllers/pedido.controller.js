const prisma = require('../lib/prisma')

async function create(req, res, next) {
  try {
    const { detalles } = req.body
    const userId = req.user.id

    let total = 0
    for (const d of detalles) {
      const producto = await prisma.producto.findUnique({ where: { id: d.productoId } })
      if (!producto) {
        return res.status(404).json({
          error: 'PRODUCT_NOT_FOUND',
          message: `Producto con ID ${d.productoId} no encontrado`,
        })
      }

      if (producto.stock < d.cantidad) {
        return res.status(400).json({
          error: 'INSUFFICIENT_STOCK',
          message: `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}, solicitado: ${d.cantidad}`,
        })
      }

      total += d.cantidad * d.precioUnitario
    }

    const pedido = await prisma.$transaction(async (tx) => {
      for (const d of detalles) {
        const updated = await tx.producto.updateMany({
          where: { id: d.productoId, stock: { gte: d.cantidad } },
          data: { stock: { decrement: d.cantidad } },
        })
        if (updated.count === 0) {
          const p = await tx.producto.findUnique({ where: { id: d.productoId } })
          const msg = p
            ? `Stock insuficiente para "${p.nombre}". Disponible: ${p.stock}, solicitado: ${d.cantidad}`
            : `Producto con ID ${d.productoId} no encontrado`
          throw Object.assign(new Error(msg), { statusCode: 400, error: 'INSUFFICIENT_STOCK' })
        }
      }

      return tx.pedido.create({
        data: {
          userId,
          total: Math.round(total * 100) / 100,
          detalles: {
            create: detalles.map((d) => ({
              productoId: d.productoId,
              cantidad: d.cantidad,
              precioUnitario: d.precioUnitario,
            })),
          },
        },
        include: {
          detalles: {
            include: { producto: { select: { id: true, nombre: true } } },
          },
        },
      })
    })

    res.status(201).json({ message: 'Pedido creado exitosamente', data: pedido })
  } catch (err) {
    if (err.code === 'P2003') {
      return res.status(400).json({ error: 'FOREIGN_KEY_ERROR', message: 'Uno o más productos no existen en la base de datos' })
    }
    next(err)
  }
}

async function getMyOrders(req, res, next) {
  try {
    const pedidos = await prisma.pedido.findMany({
      where: { userId: req.user.id },
      include: {
        detalles: {
          include: { producto: { select: { id: true, nombre: true, imagen: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json({ data: pedidos })
  } catch (err) {
    next(err)
  }
}

async function getAll(req, res, next) {
  try {
    const { role, id: userId } = req.user

    const where = role === 'admin' ? {} : { userId }

    const pedidos = await prisma.pedido.findMany({
      where,
      include: {
        usuario: { select: { id: true, username: true, email: true } },
        detalles: {
          include: { producto: { select: { id: true, nombre: true, imagen: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json({ data: pedidos })
  } catch (err) {
    next(err)
  }
}

module.exports = { create, getMyOrders, getAll }
