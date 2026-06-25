const prisma = require('../lib/prisma')

class ReporteModel {
  // Devuelve los documentos de venta activos emitidos dentro del rango [from, to]
  async findVentasBetween(from, to) {
    return prisma.documentos.findMany({
      where: {
        doc_estado: 'ACT',
        doc_emision: { gte: from, lte: to },
      },
      include: {
        productosxdocumento: {
          include: { variantes_producto: { include: { productos: true } } },
        },
      },
      orderBy: { doc_emision: 'asc' },
    })
  }
}

module.exports = new ReporteModel()
