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

  // Métodos dinámicos para buscar o crear
  async getOrCreateCategoria(nombre) {
    if (!nombre) { return await this.getFirstCategoria() || { id_categoria: 1 } }
    let cat = await prisma.categoria.findFirst({ where: { cat_nombre: nombre } })
    if (!cat) { cat = await prisma.categoria.create({ data: { cat_nombre: nombre, cat_estado: 'ACT' } }) }
    return cat
  }

  async getOrCreateColor(nombre) {
    if (!nombre) { return await this.getFirstColor() || { id_color: 1 } }
    let col = await prisma.colores.findFirst({ where: { col_nombre: nombre } })
    if (!col) { col = await prisma.colores.create({ data: { col_nombre: nombre, col_familia: 'General', col_estado: 'ACT' } }) }
    return col
  }

  async getOrCreateTalla(nombre) {
    if (!nombre) { return await this.getFirstTalla() || { id_talla: 1 } }
    let tal = await prisma.tallas.findFirst({ where: { tal_descripcion: nombre } })
    if (!tal) { tal = await prisma.tallas.create({ data: { tal_codigo: nombre.substring(0,3).toUpperCase(), tal_descripcion: nombre, tal_sistema: 'US', tal_orden: 1, tal_estado: 'ACT' } }) }
    return tal
  }

  async createVariante(data) { return prisma.variantes_producto.create({ data }) }
  async updateVariante(id, data) { return prisma.variantes_producto.update({ where: { id_variante: id }, data }) }
  async createInventario(data) { return prisma.inventario_bodegas.create({ data }) }
  async updateInventario(id_bodega, id_variante, inv_periodo, data) { 
    return prisma.inventario_bodegas.update({ 
      where: { 
        id_bodega_id_variante_inv_periodo: {
          id_bodega,
          id_variante,
          inv_periodo
        }
      }, 
      data 
    }) 
  }
}

module.exports = new ProductoModel()
