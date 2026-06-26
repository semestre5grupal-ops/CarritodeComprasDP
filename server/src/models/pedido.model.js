const prisma = require('../lib/prisma')

class PedidoModel {
  async findProductoWithStock(id_producto) {
    return prisma.productos.findUnique({
      where: { id_producto },
      include: { variantes_producto: { include: { inventario_bodegas: true } } }
    })
  }

  async getFirstVendedor() { return prisma.vendedores.findFirst() }
  async getFirstCliente() { return prisma.clientes.findFirst() }
  async getFirstCiudad() { return prisma.ciudad.findFirst() }
  async findAllBodegas() {
    return prisma.bodega.findMany({
      where: { estado_bod: 'ACT' }
    })
  }
  async findClienteByEmail(email) {
    return prisma.clientes.findFirst({
      where: { cli_correo: email }
    })
  }

  async createCliente(data) {
    return prisma.clientes.create({ data })
  }

  async updateCliente(id, data) {
    return prisma.clientes.update({
      where: { id_cliente: parseInt(id) },
      data
    })
  }

  async createTransaction(items, clienteId, vendedorId, total, descuento = 0, descripcion = 'Compra online Carrito') {
    return prisma.$transaction(async (tx) => {
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
      const descVal = Math.round(descuento * 100) / 100
      const totalVal = Math.round((subtotal - descVal) * 100) / 100
      const doc = await tx.documentos.create({
        data: {
          id_cliente: clienteId,
          id_vendedor: vendedorId,
          doc_tipo: 'FAC',
          doc_emision: new Date(),
          doc_descripcion: descripcion,
          doc_subtotal: subtotal,
          doc_iva: 0,
          doc_descuento: descVal,
          doc_total: totalVal,
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
  }

  async findAllMyOrders(clienteId) {
    return prisma.documentos.findMany({
      where: { id_cliente: clienteId },
      include: {
        productosxdocumento: {
          include: { variantes_producto: { include: { productos: true } } }
        }
      },
      orderBy: { doc_emision: 'desc' },
    })
  }

  async findAllOrders() {
    return prisma.documentos.findMany({
      include: {
        clientes: true,
        productosxdocumento: {
          include: { variantes_producto: { include: { productos: true } } }
        }
      },
      orderBy: { doc_emision: 'desc' },
    })
  }

  async updateStatus(id, status) {
    const doc = await prisma.documentos.findUnique({ where: { id_documento: parseInt(id) } })
    if (!doc) throw new Error('Pedido no encontrado')

    let descObj = { metodo: 'delivery' }
    try {
      if (doc.doc_descripcion) descObj = JSON.parse(doc.doc_descripcion)
    } catch {
      descObj.text = doc.doc_descripcion
    }
    
    descObj.status = status
    
    return prisma.documentos.update({
      where: { id_documento: parseInt(id) },
      data: { doc_descripcion: JSON.stringify(descObj) }
    })
  }
  async deleteTransaction(id) {
    return prisma.$transaction(async (tx) => {
      const doc = await tx.documentos.findUnique({
        where: { id_documento: parseInt(id) },
        include: { productosxdocumento: true }
      })

      if (!doc) { throw new Error('Pedido no encontrado') }

      await tx.productosxdocumento.deleteMany({
        where: { id_documento: parseInt(id) }
      })

      await tx.documentos.delete({
        where: { id_documento: parseInt(id) }
      })

      return true
    })
  }

  /**
   * Actualiza el estado del pedido guardándolo dentro del JSON
   * que se almacena en doc_descripcion.
   */
  async updateOrderStatus(id, status) {
    const doc = await prisma.documentos.findUnique({
      where: { id_documento: parseInt(id) }
    })
    if (!doc) throw new Error('Pedido no encontrado')

    let descripcion
    try {
      descripcion = doc.doc_descripcion ? JSON.parse(doc.doc_descripcion) : {}
    } catch {
      descripcion = { raw: doc.doc_descripcion }
    }

    descripcion.status = status

    const newDesc = JSON.stringify(descripcion)

    return prisma.documentos.update({
      where: { id_documento: parseInt(id) },
      data: { doc_descripcion: newDesc }
    })
  }
}

module.exports = new PedidoModel()
