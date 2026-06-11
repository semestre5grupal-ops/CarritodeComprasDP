const prisma = require('../lib/prisma')

class ProductoModel {
  async findAll() {
    return prisma.productos.findMany({
      include: {
        categoria: true,
        variantes_producto: {
          include: { 
            inventario_bodegas: true,
            colores: true,
            tallas: true
          }
        }
      }
    })
  }

  async findById(id) {
    return prisma.productos.findUnique({ 
      where: { id_producto: id },
      include: {
        categoria: true,
        variantes_producto: {
          include: { 
            inventario_bodegas: true,
            colores: true,
            tallas: true
          }
        }
      }
    })
  }

  async create(data) {
    return prisma.productos.create({ data })
  }

  async update(id, data) {
    return prisma.productos.update({
      where: { id_producto: id },
      data,
      include: {
        categoria: true,
        variantes_producto: {
          include: { 
            inventario_bodegas: true,
            colores: true,
            tallas: true
          }
        }
      }
    })
  }

  async remove(id) {
    await prisma.inventario_bodegas.deleteMany({ where: { variantes_producto: { id_producto: id } } })
    await prisma.variantes_producto.deleteMany({ where: { id_producto: id } })
    return prisma.productos.delete({ where: { id_producto: id } })
  }

  // Helper getters
  async getFirstMarca() { return prisma.marcas.findFirst() }
  async getFirstTemporada() { return prisma.temporadas.findFirst() }
  async getFirstUnidad() { return prisma.unidad_medida.findFirst() }
  async getFirstCategoria() { return prisma.categoria.findFirst() }
  async getFirstMaterial() { return prisma.materiales.findFirst() }
  async getFirstColor() { return prisma.colores.findFirst() }
  async getFirstTalla() { return prisma.tallas.findFirst() }
  async getFirstBodega() { return prisma.bodega.findFirst() }

  async createVariante(data) { return prisma.variantes_producto.create({ data }) }
  async createInventario(data) { return prisma.inventario_bodegas.create({ data }) }
}

module.exports = new ProductoModel()
