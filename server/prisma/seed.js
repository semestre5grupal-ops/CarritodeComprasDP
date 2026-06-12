const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  console.log('[SEED] Iniciando seed de la base de datos (Legacy Schema)...')

  // ── Dependencias requeridas ──────────────────────────────────────────
  let marca = await prisma.marcas.findFirst() || await prisma.marcas.create({ data: { mar_nombre: 'Default Marca', mar_estado: 'ACT' } })
  let temporada = await prisma.temporadas.findFirst() || await prisma.temporadas.create({ data: { tem_nombre: 'Default Temporada', tem_fecha_inicio: new Date(), tem_fecha_fin: new Date(), tem_estado: 'ACT' } })
  let unidad = await prisma.unidad_medida.findFirst() || await prisma.unidad_medida.create({ data: { umd_abreviado: 'U', umd_descripcion: 'Unidad', um_estado: 'ACT' } })
  let material = await prisma.materiales.findFirst() || await prisma.materiales.create({ data: { mat_nombre: 'Default Material', mat_cuidados: 'Ninguno', mat_estado: 'ACT' } })
  let bodega = await prisma.bodega.findFirst() || await prisma.bodega.create({ data: { bod_nombre_: 'Principal', bod_ubicacion: 'Centro', estado_bod: 'ACT' } })
  let color = await prisma.colores.findFirst() || await prisma.colores.create({ data: { col_nombre: 'Azul', col_familia: 'Primario', col_estado: 'ACT' } })
  let talla = await prisma.tallas.findFirst() || await prisma.tallas.create({ data: { tal_codigo: 'M', tal_descripcion: 'Mediana', tal_sistema: 'INT', tal_orden: 1, tal_estado: 'ACT' } })

  // Categorias base
  let catMujer = await prisma.categoria.findFirst({ where: { cat_nombre: 'Mujer' } }) || await prisma.categoria.create({ data: { cat_nombre: 'Mujer', cat_estado: 'ACT' } })
  let catHombre = await prisma.categoria.findFirst({ where: { cat_nombre: 'Hombre' } }) || await prisma.categoria.create({ data: { cat_nombre: 'Hombre', cat_estado: 'ACT' } })
  let catUnisex = await prisma.categoria.findFirst({ where: { cat_nombre: 'Unisex' } }) || await prisma.categoria.create({ data: { cat_nombre: 'Unisex', cat_estado: 'ACT' } })

  // ── Productos de prueba ──────────────────────────────────────────
  const productosData = [
    { nombre: "Legging Seamless Fit", precio: 28.00, stock: 45, imagen: "/images/sport-leggins-azul-deslavado-mujer.jpg", cat: catMujer },
    { nombre: "Top Training Core", precio: 22.00, stock: 12, imagen: "/images/sport-top-azul-mujer.jpg", cat: catMujer },
    { nombre: "Pro Fit Tank", precio: 25.00, stock: 42, imagen: "/images/2011c388_401_gm_ft_glb.jpg", cat: catHombre },
    { nombre: "Athletic Performance Shirt", precio: 27.00, stock: 38, imagen: "/images/gp08h-g61_p1.jpg", cat: catUnisex }
  ]

  const existingCount = await prisma.productos.count()
  if (existingCount === 0) {
    for (const p of productosData) {
      const nuevoPro = await prisma.productos.create({
        data: {
          pro_descripcion: p.nombre,
          pro_valor_compra: p.precio,
          id_marca: marca.id_marca,
          id_temporada: temporada.id_temporada,
          id_unidadmedida: unidad.id_unidadmedida,
          uni_id_unidadmedida: unidad.id_unidadmedida,
          id_categoria: p.cat.id_categoria,
          id_material: material.id_material,
          pro_factor_conversion_: 1,
          pro_genero_: 'U',
          pro_estado: 'ACT',
          pro_imagen: p.imagen
        }
      })

      const variante = await prisma.variantes_producto.create({
        data: {
          id_producto: nuevoPro.id_producto,
          id_color: color.id_color,
          id_talla: talla.id_talla,
          var_cod_barras: `00${nuevoPro.id_producto}`,
          var_precio_venta: p.precio,
          var_estado: 'ACT'
        }
      })

      await prisma.inventario_bodegas.create({
        data: {
          id_bodega: bodega.id_bodega,
          id_variante: variante.id_variante,
          inv_periodo: '2026-06',
          inv_saldo_inicial: p.stock,
          inv_qty_ingresos: p.stock,
          inv_qty_egresos: 0,
          inv_qty_ajustes: 0,
          inv_saldo_final: p.stock
        }
      })
    }
    console.log(`[SEED] ${productosData.length} productos insertados`)
  } else {
    console.log(`[SEED] Saltando inserción de productos: ya existen ${existingCount} registros`)
  }

  // ── Usuarios por defecto ──────────────────────────────────────────
  const adminExists = await prisma.usuarios.findFirst({ where: { usu_nombre: 'admin' } })
  if (!adminExists) {
    const hash = await bcrypt.hash('Admin123!', 10)
    await prisma.usuarios.create({
      data: {
        usu_nombre: 'admin',
        usu_nombrereal: 'admin@shopsport.com',
        usu_clave: hash,
        usu_rol: 'admin',
        usu_estado_: 'Activo'
      },
    })
    console.log('[SEED] Usuario admin creado (admin / Admin123!)')
  } else {
    console.log('[SEED] Usuario admin ya existe')
  }

  const userExists = await prisma.usuarios.findFirst({ where: { usu_nombre: 'usuario' } })
  if (!userExists) {
    const hash = await bcrypt.hash('User123!', 10)
    await prisma.usuarios.create({
      data: {
        usu_nombre: 'usuario',
        usu_nombrereal: 'usuario@shopsport.com',
        usu_clave: hash,
        usu_rol: 'user',
        usu_estado_: 'Activo'
      },
    })
    console.log('[SEED] Usuario user creado (usuario / User123!)')
  } else {
    console.log('[SEED] Usuario user ya existe')
  }

  console.log('[SEED] Seed completado exitosamente')
}

main()
  .catch((e) => {
    console.error('[SEED] Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
