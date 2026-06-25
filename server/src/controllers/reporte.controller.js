const ReporteModel = require('../models/reporte.model')

const DAY_MS = 24 * 60 * 60 * 1000

// Formatea una fecha a 'YYYY-MM-DD' (clave de día) usando UTC para evitar
// desfases por zona horaria.
function dayKey(date) {
  return date.toISOString().slice(0, 10)
}

// Formatea una fecha a 'YYYY-MM' (clave de mes).
function monthKey(date) {
  return date.toISOString().slice(0, 7)
}

// Construye la lista ordenada de "buckets" (etiquetas) que cubre todo el rango,
// agrupando por día o por mes según la amplitud del periodo.
function buildBuckets(from, to, groupBy) {
  const buckets = []
  if (groupBy === 'month') {
    const cursor = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), 1))
    const end = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), 1))
    while (cursor <= end) {
      buckets.push(monthKey(cursor))
      cursor.setUTCMonth(cursor.getUTCMonth() + 1)
    }
  } else {
    const cursor = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()))
    const end = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate()))
    while (cursor <= end) {
      buckets.push(dayKey(cursor))
      cursor.setUTCDate(cursor.getUTCDate() + 1)
    }
  }
  return buckets
}

async function getVentas(req, res, next) {
  try {
    // ── Rango de fechas ─────────────────────────────────────────────────────
    // Por defecto: últimos 30 días. El cliente envía 'from'/'to' en ISO (yyyy-mm-dd).
    const now = new Date()
    let from = req.query.from ? new Date(req.query.from) : new Date(now.getTime() - 30 * DAY_MS)
    let to = req.query.to ? new Date(req.query.to) : now

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      return res.status(400).json({ error: 'INVALID_RANGE', message: 'Las fechas proporcionadas no son válidas' })
    }
    if (from > to) {
      return res.status(400).json({ error: 'INVALID_RANGE', message: 'La fecha inicial no puede ser mayor que la final' })
    }

    // Normalizamos: 'from' al inicio del día, 'to' al final del día.
    from = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate(), 0, 0, 0))
    to = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate(), 23, 59, 59))

    const docs = await ReporteModel.findVentasBetween(from, to)

    // ── Agrupación temporal: por día si el rango es corto, por mes si es largo ──
    const rangeDays = Math.round((to - from) / DAY_MS)
    const groupBy = rangeDays > 62 ? 'month' : 'day'

    const buckets = buildBuckets(from, to, groupBy)
    const seriesMap = new Map(buckets.map((label) => [label, { label, total: 0, pedidos: 0 }]))

    // ── Acumuladores ────────────────────────────────────────────────────────
    let totalVentas = 0
    let totalProductos = 0
    const productosMap = new Map() // id_producto -> { nombre, cantidad, ingresos }

    for (const doc of docs) {
      const total = Number(doc.doc_total)
      totalVentas += total

      const emision = new Date(doc.doc_emision)
      const key = groupBy === 'month' ? monthKey(emision) : dayKey(emision)
      const bucket = seriesMap.get(key)
      if (bucket) {
        bucket.total += total
        bucket.pedidos += 1
      }

      for (const pxd of doc.productosxdocumento) {
        const producto = pxd.variantes_producto?.productos
        if (!producto) continue
        const id = producto.id_producto
        const cantidad = pxd.pxd_cantidad
        const ingresos = Number(pxd.pxd_valor_subtotal)
        totalProductos += cantidad

        const acc = productosMap.get(id) || { id, nombre: producto.pro_descripcion, cantidad: 0, ingresos: 0 }
        acc.cantidad += cantidad
        acc.ingresos += ingresos
        productosMap.set(id, acc)
      }
    }

    const numPedidos = docs.length
    const series = buckets.map((label) => {
      const b = seriesMap.get(label)
      return { label, total: Math.round(b.total * 100) / 100, pedidos: b.pedidos }
    })

    const topProductos = [...productosMap.values()]
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10)
      .map((p) => ({ ...p, ingresos: Math.round(p.ingresos * 100) / 100 }))

    res.json({
      data: {
        rango: { from: from.toISOString(), to: to.toISOString(), groupBy },
        resumen: {
          totalVentas: Math.round(totalVentas * 100) / 100,
          numPedidos,
          totalProductos,
          ticketPromedio: numPedidos > 0 ? Math.round((totalVentas / numPedidos) * 100) / 100 : 0,
        },
        series,
        topProductos,
      },
    })
  } catch (err) {
    next(err)
  }
}

module.exports = { getVentas }
