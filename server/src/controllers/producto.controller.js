const prisma = require('../lib/prisma')

// Función auxiliar para formatear producto a lo que espera el frontend
function formatProducto(p) {
  return {
    id: p.id_producto,
    nombre: p.pro_descripcion,
    precio: p.pro_valor_compra,
    stock: p.variantes_producto?.[0]?.inventario_bodegas?.[0]?.inv_saldo_final || 0,
    categoria: p.categoria ? p.categoria.cat_nombre : 'General',
    imagen: null // Imagen ya no existe en el esquema
  }
}

async function getAll(req, res, next) {
  try {
    const { categoria } = req.query
    // Nota: El filtro de categoría por nombre requiere un join, lo simplificamos por ahora
    const productos = await prisma.productos.findMany({
      include: {
        categoria: true,
        variantes_producto: {
          include: { inventario_bodegas: true }
        }
      }
    })

    const data = productos.map(formatProducto)
    if (categoria) {
      return res.json({ data: data.filter(p => p.categoria === categoria) })
    }
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

async function getById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10)
    const producto = await prisma.productos.findUnique({ 
      where: { id_producto: id },
      include: {
        categoria: true,
        variantes_producto: {
          include: { inventario_bodegas: true }
        }
      }
    })

    if (!producto) {
      return res.status(404).json({ error: 'PRODUCT_NOT_FOUND', message: 'Producto no encontrado' })
    }

    res.json({ data: formatProducto(producto) })
  } catch (err) {
    next(err)
  }
}

async function create(req, res, next) {
  try {
    const { nombre, precio, stock, categoria, imagen } = req.body

    // Buscar dependencias por defecto creadas por el seed
    const marca = await prisma.marcas.findFirst() || { id_marca: 1 }
    const temporada = await prisma.temporadas.findFirst() || { id_temporada: 1 }
    const unidad = await prisma.unidad_medida.findFirst() || { id_unidadmedida: 1 }
    let cat = await prisma.categoria.findFirst()
    const material = await prisma.materiales.findFirst() || { id_material: 1 }

    const producto = await prisma.productos.create({
      data: {
        pro_descripcion: nombre,
        pro_valor_compra: precio,
        id_marca: marca.id_marca,
        id_temporada: temporada.id_temporada,
        id_unidadmedida: unidad.id_unidadmedida,
        uni_id_unidadmedida: unidad.id_unidadmedida,
        id_categoria: cat ? cat.id_categoria : 1,
        id_material: material.id_material,
        pro_factor_conversion_: 1,
        pro_genero_: 'U',
        pro_estado: 'ACT'
      },
    })

    // Crear variante e inventario si tenemos dependencias
    const color = await prisma.colores.findFirst()
    const talla = await prisma.tallas.findFirst()
    const bodega = await prisma.bodega.findFirst()

    if (color && talla && bodega) {
      const variante = await prisma.variantes_producto.create({
        data: {
          id_producto: producto.id_producto,
          id_color: color.id_color,
          id_talla: talla.id_talla,
          var_cod_barras: '0000',
          var_precio_venta: precio,
          var_estado: 'ACT'
        }
      })
      
      await prisma.inventario_bodegas.create({
        data: {
          id_bodega: bodega.id_bodega,
          id_variante: variante.id_variante,
          inv_periodo: '2026-06',
          inv_saldo_inicial: stock ?? 0,
          inv_qty_ingresos: stock ?? 0,
          inv_qty_egresos: 0,
          inv_qty_ajustes: 0,
          inv_saldo_final: stock ?? 0
        }
      })
    }

    res.status(201).json({ message: 'Producto creado exitosamente', data: formatProducto({ ...producto, categoria: cat }) })
  } catch (err) {
    next(err)
  }
}

async function update(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10)
    const existing = await prisma.productos.findUnique({ where: { id_producto: id } })

    if (!existing) {
      return res.status(404).json({ error: 'PRODUCT_NOT_FOUND', message: 'Producto no encontrado' })
    }

    const { nombre, precio } = req.body

    const producto = await prisma.productos.update({
      where: { id_producto: id },
      data: {
        ...(nombre !== undefined && { pro_descripcion: nombre }),
        ...(precio !== undefined && { pro_valor_compra: precio }),
      },
      include: {
        categoria: true,
        variantes_producto: {
          include: { inventario_bodegas: true }
        }
      }
    })

    res.json({ message: 'Producto actualizado exitosamente', data: formatProducto(producto) })
  } catch (err) {
    next(err)
  }
}

async function remove(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10)
    const existing = await prisma.productos.findUnique({ where: { id_producto: id } })

    if (!existing) {
      return res.status(404).json({ error: 'PRODUCT_NOT_FOUND', message: 'Producto no encontrado' })
    }

    // El esquema tiene multiples Foreign Keys, primero limpiar variantes
    await prisma.inventario_bodegas.deleteMany({ where: { variantes_producto: { id_producto: id } } })
    await prisma.variantes_producto.deleteMany({ where: { id_producto: id } })
    await prisma.productos.delete({ where: { id_producto: id } })

    res.json({ message: 'Producto eliminado exitosamente' })
  } catch (err) {
    if (err.code === 'P2003') {
      return res.status(409).json({ error: 'FOREIGN_KEY_CONSTRAINT', message: 'No se puede eliminar el producto porque tiene asociaciones' })
    }
    next(err)
  }
}

module.exports = { getAll, getById, create, update, remove }
