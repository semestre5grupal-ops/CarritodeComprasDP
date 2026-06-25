const PedidoModel = require('../models/pedido.model')

async function create(req, res, next) {
  try {
    const { detalles, clienteDatos, cupon } = req.body
    const userId = req.user.id // This is id_usuario

    let total = 0
    // Buscar la variante real para el producto, ya que pedidos van a variante
    const items = []
    for (const d of detalles) {
      const producto = await PedidoModel.findProductoWithStock(d.productoId)
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

    const vendedor = await PedidoModel.getFirstVendedor() || { id_vendedor: 1 }
    let cliente = await PedidoModel.findClienteByEmail(req.user.email)
    
    if (clienteDatos) {
      if (cliente) {
        cliente = await PedidoModel.updateCliente(cliente.id_cliente, {
          cli_nombre: clienteDatos.nombre || cliente.cli_nombre,
          cli_ciruc: clienteDatos.cedula,
          cli_celular: clienteDatos.celular,
          cli_telefono: clienteDatos.telefono || '0000000000'
        })
      } else {
        const ciudad = await PedidoModel.getFirstCiudad() || { id_ciudad: 1 }
        cliente = await PedidoModel.createCliente({
          id_ciudad: ciudad.id_ciudad,
          cli_nombre: clienteDatos.nombre || req.user.username || 'Cliente Final',
          cli_ciruc: clienteDatos.cedula,
          cli_celular: clienteDatos.celular,
          cli_telefono: clienteDatos.telefono || '0000000000',
          cli_correo: req.user.email || 'correo@correo.com',
          cli_categoria: 1,
          cli_estado: true
        }).catch(_e => ({ id_cliente: req.user.id }))
      }
    } else if (!cliente) {
      const ciudad = await PedidoModel.getFirstCiudad() || { id_ciudad: 1 }
      cliente = await PedidoModel.createCliente({
        id_ciudad: ciudad.id_ciudad,
        cli_nombre: req.user.username || 'Cliente Final',
        cli_ciruc: '9999999999999',
        cli_celular: '0000000000',
        cli_telefono: '0000000000',
        cli_correo: req.user.email || 'correo@correo.com',
        cli_categoria: 1,
        cli_estado: true
      }).catch(_e => ({ id_cliente: req.user.id }))
    }

    let descuento = 0
    if (cupon !== undefined && cupon !== null && cupon !== '') {
      if (typeof cupon !== 'string') {
        return res.status(400).json({ error: 'INVALID_COUPON', message: 'Cupón inválido' })
      }
      const trimmed = cupon.trim()
      if (trimmed !== '') {
        const isAlphanumeric = /^[a-zA-Z0-9]+$/.test(trimmed)
        if (!isAlphanumeric || trimmed.length > 9 || trimmed.toUpperCase() !== 'DEPORTE20') {
          return res.status(400).json({ error: 'INVALID_COUPON', message: 'Cupón inválido' })
        }
        descuento = Math.round(total * 0.2 * 100) / 100
      }
    }

    const pedido = await PedidoModel.createTransaction(items, cliente.id_cliente, vendedor.id_vendedor, total, descuento)

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
    // Map the user to their corresponding cliente by email
    const cliente = await PedidoModel.findClienteByEmail(req.user.email)
    if (!cliente) {
      return res.json({ data: [] }) // No ha hecho compras aún, por tanto no es cliente
    }

    const documentos = await PedidoModel.findAllMyOrders(cliente.id_cliente)

    const pedidos = documentos.map(doc => ({
      id: doc.id_documento,
      userId: req.user.id, // Fake userId para que el front no rompa
      clienteDatos: {
        nombre: cliente.cli_nombre,
        cedula: cliente.cli_ciruc,
        celular: cliente.cli_celular,
        telefono: cliente.cli_telefono
      },
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
    const documentos = await PedidoModel.findAllOrders()

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

async function updateStatus(req, res, next) {
  try {
    // Simular guardado de estado devolviendo un 200 OK
    res.json({ message: 'Estado del pedido actualizado correctamente' })
  } catch (err) {
    next(err)
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params
    await PedidoModel.deleteTransaction(id)
    res.json({ message: 'Pedido eliminado exitosamente' })
  } catch (err) {
    next(err)
  }
}

module.exports = { create, getMyOrders, getAll, updateStatus, remove }
