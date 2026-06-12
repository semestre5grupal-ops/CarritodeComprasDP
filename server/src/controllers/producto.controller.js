const ProductoModel = require('../models/producto.model')

// Función auxiliar para formatear producto a lo que espera el frontend
function formatProducto(p) {
  const variante = p.variantes_producto?.[0];
  return {
    id: p.id_producto,
    nombre: p.pro_descripcion,
    precio: p.pro_valor_compra,
    stock: variante?.inventario_bodegas?.[0]?.inv_saldo_final || 0,
    categoria: p.categoria ? p.categoria.cat_nombre : 'General',
    talla: variante?.tallas ? variante.tallas.tal_descripcion : null,
    color: variante?.colores ? variante.colores.col_nombre : null,
    imagen: p.pro_imagen
  }
}

async function getAll(req, res, next) {
  try {
    const { categoria } = req.query
    const productos = await ProductoModel.findAll()

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
    const producto = await ProductoModel.findById(id)

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
    const marca = await ProductoModel.getFirstMarca() || { id_marca: 1 }
    const temporada = await ProductoModel.getFirstTemporada() || { id_temporada: 1 }
    const unidad = await ProductoModel.getFirstUnidad() || { id_unidadmedida: 1 }
    let cat = await ProductoModel.getFirstCategoria()
    const material = await ProductoModel.getFirstMaterial() || { id_material: 1 }

    const producto = await ProductoModel.create({
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
      pro_estado: 'ACT',
      pro_imagen: imagen || null
    })

    // Crear variante e inventario si tenemos dependencias
    const color = await ProductoModel.getFirstColor()
    const talla = await ProductoModel.getFirstTalla()
    const bodega = await ProductoModel.getFirstBodega()

    if (color && talla && bodega) {
      const variante = await ProductoModel.createVariante({
        id_producto: producto.id_producto,
        id_color: color.id_color,
        id_talla: talla.id_talla,
        var_cod_barras: '0000',
        var_precio_venta: precio,
        var_estado: 'ACT'
      })
      
      await ProductoModel.createInventario({
        id_bodega: bodega.id_bodega,
        id_variante: variante.id_variante,
        inv_periodo: '2026-06',
        inv_saldo_inicial: stock ?? 0,
        inv_qty_ingresos: stock ?? 0,
        inv_qty_egresos: 0,
        inv_qty_ajustes: 0,
        inv_saldo_final: stock ?? 0
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
    const existing = await ProductoModel.findById(id)

    if (!existing) {
      return res.status(404).json({ error: 'PRODUCT_NOT_FOUND', message: 'Producto no encontrado' })
    }

    const { nombre, precio, imagen } = req.body

    const producto = await ProductoModel.update(id, {
      ...(nombre !== undefined && { pro_descripcion: nombre }),
      ...(precio !== undefined && { pro_valor_compra: precio }),
      ...(imagen !== undefined && { pro_imagen: imagen }),
    })

    res.json({ message: 'Producto actualizado exitosamente', data: formatProducto(producto) })
  } catch (err) {
    next(err)
  }
}

async function remove(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10)
    const existing = await ProductoModel.findById(id)

    if (!existing) {
      return res.status(404).json({ error: 'PRODUCT_NOT_FOUND', message: 'Producto no encontrado' })
    }

    await ProductoModel.remove(id)

    res.json({ message: 'Producto eliminado exitosamente' })
  } catch (err) {
    if (err.code === 'P2003') {
      return res.status(409).json({ error: 'FOREIGN_KEY_CONSTRAINT', message: 'No se puede eliminar el producto porque tiene asociaciones' })
    }
    next(err)
  }
}

module.exports = { getAll, getById, create, update, remove }

