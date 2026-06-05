const prisma = require('../lib/prisma')

async function getAll(req, res, next) {
  try {
    const { categoria } = req.query
    const where = categoria ? { categoria } : {}

    const productos = await prisma.producto.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    res.json({ data: productos })
  } catch (err) {
    next(err)
  }
}

async function getById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10)
    const producto = await prisma.producto.findUnique({ where: { id } })

    if (!producto) {
      return res.status(404).json({ error: 'PRODUCT_NOT_FOUND', message: 'Producto no encontrado' })
    }

    res.json({ data: producto })
  } catch (err) {
    next(err)
  }
}

async function create(req, res, next) {
  try {
    const { nombre, precio, stock, categoria, imagen } = req.body

    const producto = await prisma.producto.create({
      data: {
        nombre,
        precio,
        stock: stock ?? 0,
        categoria: categoria ?? null,
        imagen: imagen ?? null,
      },
    })

    res.status(201).json({ message: 'Producto creado exitosamente', data: producto })
  } catch (err) {
    next(err)
  }
}

async function update(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10)
    const existing = await prisma.producto.findUnique({ where: { id } })

    if (!existing) {
      return res.status(404).json({ error: 'PRODUCT_NOT_FOUND', message: 'Producto no encontrado' })
    }

    const { nombre, precio, stock, categoria, imagen } = req.body

    const producto = await prisma.producto.update({
      where: { id },
      data: {
        ...(nombre !== undefined && { nombre }),
        ...(precio !== undefined && { precio }),
        ...(stock !== undefined && { stock }),
        ...(categoria !== undefined && { categoria }),
        ...(imagen !== undefined && { imagen }),
      },
    })

    res.json({ message: 'Producto actualizado exitosamente', data: producto })
  } catch (err) {
    next(err)
  }
}

async function remove(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10)
    const existing = await prisma.producto.findUnique({ where: { id } })

    if (!existing) {
      return res.status(404).json({ error: 'PRODUCT_NOT_FOUND', message: 'Producto no encontrado' })
    }

    await prisma.producto.delete({ where: { id } })

    res.json({ message: 'Producto eliminado exitosamente' })
  } catch (err) {
    if (err.code === 'P2003') {
      return res.status(409).json({ error: 'FOREIGN_KEY_CONSTRAINT', message: 'No se puede eliminar el producto porque tiene pedidos asociados' })
    }
    next(err)
  }
}

module.exports = { getAll, getById, create, update, remove }
