const PedidoModel = require('../models/pedido.model')
const nodemailer = require('nodemailer')
const dns = require('dns')
dns.setDefaultResultOrder('ipv4first')
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env

async function create(req, res, next) {
  try {
    const { detalles, clienteDatos, cupon, metodoEntrega, localRetiro } = req.body
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
        }).catch(() => ({ id_cliente: req.user.id }))
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
      }).catch(() => ({ id_cliente: req.user.id }))
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

    const descripcionPayload = JSON.stringify({ metodo: metodoEntrega || 'delivery', local: localRetiro || null })
    const pedido = await PedidoModel.createTransaction(items, cliente.id_cliente, vendedor.id_vendedor, total, descuento, descripcionPayload)

    // Formatear respuesta al formato original esperado por frontend
    const formatPedido = {
      id: pedido.id_documento,
      userId: userId,
      descripcion: pedido.doc_descripcion ? JSON.parse(pedido.doc_descripcion) : { metodo: 'delivery' },
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
    const cliente = await PedidoModel.findClienteByEmail(req.user.email)
    if (!cliente) {
      return res.json({ data: [] }) // No ha hecho compras aún, por tanto no es cliente
    }

    const documentos = await PedidoModel.findAllMyOrders(cliente.id_cliente)
    const pedidos = documentos.map(doc => {
      let descripcion
      try {
        descripcion = doc.doc_descripcion ? JSON.parse(doc.doc_descripcion) : { metodo: 'delivery' }
      } catch {
        descripcion = { metodo: 'delivery', doc_descripcion: doc.doc_descripcion }
      }
      return {
        id: doc.id_documento,
        userId: req.user.id,
        status: descripcion.status || 'Pendiente',
        clienteDatos: {
          nombre: cliente.cli_nombre,
          cedula: cliente.cli_ciruc,
          celular: cliente.cli_celular,
          telefono: cliente.cli_telefono
        },
        total: Number(doc.doc_total),
        createdAt: doc.doc_emision,
        descripcion,
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
      }
    })

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
      descripcion: (() => {
        try {
          return doc.doc_descripcion ? JSON.parse(doc.doc_descripcion) : { metodo: 'delivery' }
        } catch {
          return { metodo: 'delivery', doc_descripcion: doc.doc_descripcion }
        }
      })(),
      status: (() => {
        try {
          if (doc.doc_descripcion) {
            const d = JSON.parse(doc.doc_descripcion)
            return d.status || 'Pendiente'
          }
          return 'Pendiente'
        } catch { return 'Pendiente' }
      })(),
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
    const { id } = req.params
    const { status } = req.body

    const validStatuses = ['Pendiente', 'Procesando', 'Enviado', 'Entregado', 'Cancelado']
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'INVALID_STATUS',
        message: `Estado inválido. Los valores permitidos son: ${validStatuses.join(', ')}`
      })
    }

    await PedidoModel.updateOrderStatus(id, status)

    res.json({ message: 'Estado del pedido actualizado correctamente', status })
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

async function getLocales(req, res, next) {
  try {
    const bodegas = await PedidoModel.findAllBodegas()
    res.json({ data: bodegas })
  } catch (err) {
    next(err)
  }
}

async function enviarFacturaCorreo(req, res, next) {
  try {
    const { id } = req.params
    const { pdfBase64 } = req.body

    if (!pdfBase64) {
      return res.status(400).json({ error: 'MISSING_PDF', message: 'No se envió el PDF adjunto' })
    }

    const documento = (await PedidoModel.findAllOrders()).find(o => String(o.id_documento) === String(id))
    if (!documento) {
      return res.status(404).json({ error: 'ORDER_NOT_FOUND', message: 'Pedido no encontrado' })
    }

    const emailDestino = documento.clientes?.cli_correo
    if (!emailDestino) {
      return res.status(400).json({ error: 'NO_EMAIL', message: 'El cliente no tiene un correo registrado' })
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST || 'smtp.mailtrap.io',
      port: Number(SMTP_PORT) || 2525,
      secure: Number(SMTP_PORT) === 465, // true para 465, false para otros
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    })

    const base64Data = pdfBase64.replace(/^data:application\/pdf;filename=generated\.pdf;base64,/, '')
      .replace(/^data:application\/pdf;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    const mailOptions = {
      from: '"ShopSport" <no-reply@shopsport.com>',
      to: emailDestino,
      subject: `Tu Factura de ShopSport - Pedido #${id}`,
      text: `Hola ${documento.clientes?.cli_nombre || 'Cliente'},\n\nAdjuntamos la factura de tu pedido #${id}.\n\nGracias por tu compra en ShopSport.`,
      attachments: [
        {
          filename: `Factura_ShopSport_Pedido_${id}.pdf`,
          content: buffer,
          contentType: 'application/pdf'
        }
      ]
    }

    try {
      await transporter.sendMail(mailOptions)
      console.log(`Factura enviada a ${emailDestino} para pedido #${id}`)
    } catch (err) {
      console.error('Error al enviar correo (credenciales SMTP faltantes o inválidas):', err.message)
      // No lanzamos el error para no romper la experiencia del frontend con un 500
    }

    res.json({ message: 'Factura procesada exitosamente (correo intentado)' })
  } catch (err) {
    next(err)
  }
}

module.exports = { create, getMyOrders, getAll, updateStatus, remove, getLocales, enviarFacturaCorreo }
