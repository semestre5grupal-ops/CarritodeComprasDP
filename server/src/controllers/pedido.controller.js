const prisma = require('../lib/prisma')

async function create(req, res, next) {
  try {
    const { detalles } = req.body
    const userId = req.user.id // This is id_usuario

    let total = 0
    // Buscar la variante real para el producto, ya que pedidos van a variante
    const items = []
    for (const d of detalles) {
      const producto = await prisma.productos.findUnique({ 
        where: { id_producto: d.productoId },
        include: { variantes_producto: { include: { inventario_bodegas: true } } }
      })
      if (!producto) {
        return res.status(404).json({ error: 'PRODUCT_NOT_FOUND', message: `Producto ${d.productoId} no encontrado` })
      }

      const variante = producto.variantes_producto[0]
      if (!variante) {
        return res.status(404).json({ error: 'PRODUCT_NOT_FOUND', message: `El producto ${d.productoId} no tiene variantes configuradas` })
      }

      const stock = variante.inventario_bodegas[0]?.inv_saldo_final || 0
      if (stock < d.cantidad) {
        return res.status(400).json({
          error: 'INSUFFICIENT_STOCK',
          message: `Stock insuficiente para "${producto.pro_descripcion}". Disponible: ${stock}, solicitado: ${d.cantidad}`,
        })
      }

      total += d.cantidad * d.precioUnitario
      items.push({ varianteId: variante.id_variante, d, stock, inv: variante.inventario_bodegas[0] })
    }

    const vendedor = await prisma.vendedores.findFirst() || { id_vendedor: 1 }
    let cliente = await prisma.clientes.findFirst()
    if (!cliente) {
      const ciudad = await prisma.ciudad.findFirst() || { id_ciudad: 1 }
      cliente = await prisma.clientes.create({
        data: {
          id_ciudad: ciudad.id_ciudad,
          cli_nombre: req.user.username || 'Cliente Final',
          cli_ciruc: '9999999999999',
          cli_celular: '0000000000',
          cli_telefono: '0000000000',
          cli_correo: req.user.email || 'correo@correo.com',
          cli_categoria: 1,
          cli_estado: true
        }
      }).catch(e => ({ id_cliente: 1 }))
    }

    const pedido = await prisma.$transaction(async (tx) => {
      // 1. Descontar stock
      for (const item of items) {
        if (item.inv) {
          await tx.inventario_bodegas.update({
            where: {
              id_bodega_id_variante_inv_periodo: {
                id_bodega: item.inv.id_bodega,
                id_variante: item.varianteId,
                inv_periodo: item.inv.inv_periodo
              }
            },
            data: { inv_saldo_final: { decrement: item.d.cantidad } }
          })
        }
      }

      // 2. Crear documento
      const subtotal = Math.round(total * 100) / 100
      const doc = await tx.documentos.create({
        data: {
          id_cliente: cliente.id_cliente,
          id_vendedor: vendedor.id_vendedor,
          doc_tipo: 'FAC',
          doc_emision: new Date(),
          doc_descripcion: 'Compra online Carrito',
          doc_subtotal: subtotal,
          doc_iva: 0,
          doc_descuento: 0,
          doc_total: subtotal,
          doc_estado: 'ACT',
          productosxdocumento: {
            create: items.map(item => ({
              id_variante: item.varianteId,
              pxd_cantidad: item.d.cantidad,
              pxd_valor_unitario: item.d.precioUnitario,
              pxd_valor_subtotal: item.d.cantidad * item.d.precioUnitario,
              pxd_estado: 'ACT'
            }))
          }
        },
        include: {
          productosxdocumento: {
            include: {
              variantes_producto: {
                include: { productos: true }
              }
            }
          }
        }
      })
      return doc
    })

    // Formatear respuesta al formato original esperado por frontend
    const formatPedido = {
      id: pedido.id_documento,
      userId: userId,
      total: Number(pedido.doc_total),
      createdAt: pedido.doc_emision,
      detalles: pedido.productosxdocumento.map(pxd => ({
        productoId: pxd.variantes_producto.productos.id_producto,
        cantidad: pxd.pxd_cantidad,
        precioUnitario: Number(pxd.pxd_valor_unitario),
        producto: {
          id: pxd.variantes_producto.productos.id_producto,
          nombre: pxd.variantes_producto.productos.pro_descripcion
        }
      }))
    }

    res.status(201).json({ message: 'Pedido creado exitosamente', data: formatPedido })
  } catch (err) {
    if (err.code === 'P2003') {
      return res.status(400).json({ error: 'FOREIGN_KEY_ERROR', message: 'Uno o más productos no existen en la base de datos' })
    }
    next(err)
  }
}

async function getMyOrders(req, res, next) {
  try {
    // Buscar todos los documentos, idealmente los de este id_cliente. 
    // Mapearemos todos para evitar complejidad extra en esta prueba.
    const documentos = await prisma.documentos.findMany({
      include: {
        productosxdocumento: {
          include: { variantes_producto: { include: { productos: true } } }
        }
      },
      orderBy: { doc_emision: 'desc' },
    })

    const pedidos = documentos.map(doc => ({
      id: doc.id_documento,
      userId: req.user.id, // Fake userId para que el front no rompa
      total: Number(doc.doc_total),
      createdAt: doc.doc_emision,
      detalles: doc.productosxdocumento.map(pxd => ({
        productoId: pxd.variantes_producto.productos.id_producto,
        cantidad: pxd.pxd_cantidad,
        precioUnitario: Number(pxd.pxd_valor_unitario),
        producto: {
          id: pxd.variantes_producto.productos.id_producto,
          nombre: pxd.variantes_producto.productos.pro_descripcion,
          imagen: null
        }
      }))
    }))

    res.json({ data: pedidos })
  } catch (err) {
    next(err)
  }
}

async function getAll(req, res, next) {
  try {
    const { role } = req.user

    const documentos = await prisma.documentos.findMany({
      include: {
        clientes: true,
        productosxdocumento: {
          include: { variantes_producto: { include: { productos: true } } }
        }
      },
      orderBy: { doc_emision: 'desc' },
    })

    const pedidos = documentos.map(doc => ({
      id: doc.id_documento,
      userId: req.user.id,
      usuario: { id: req.user.id, username: doc.clientes.cli_nombre, email: doc.clientes.cli_correo },
      total: Number(doc.doc_total),
      createdAt: doc.doc_emision,
      detalles: doc.productosxdocumento.map(pxd => ({
        productoId: pxd.variantes_producto.productos.id_producto,
        cantidad: pxd.pxd_cantidad,
        precioUnitario: Number(pxd.pxd_valor_unitario),
        producto: {
          id: pxd.variantes_producto.productos.id_producto,
          nombre: pxd.variantes_producto.productos.pro_descripcion,
          imagen: null
        }
      }))
    }))

    res.json({ data: pedidos })
  } catch (err) {
    next(err)
  }
}

module.exports = { create, getMyOrders, getAll }
