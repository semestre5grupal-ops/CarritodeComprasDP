import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export function generateInvoiceDoc(order) {
  const doc = new jsPDF()

  // Título
  doc.setFontSize(22)
  doc.setTextColor(33, 33, 33)
  doc.text('Factura de Compra', 14, 22)

  // Subtítulo / Empresa
  doc.setFontSize(14)
  doc.setTextColor(100, 100, 100)
  doc.text('Shop Sport', 14, 30)

  // Datos de la factura
  doc.setFontSize(11)
  doc.setTextColor(50, 50, 50)
  doc.text(`ID Pedido: #${order.id}`, 14, 45)
  doc.text(`Fecha: ${new Date(order.createdAt).toLocaleDateString('es-EC')}`, 14, 50)
  doc.text('Estado: Pagado', 14, 55)

  // Datos del Cliente
  const cli = order.clienteDatos || { nombre: order.usuario?.username }
  const isFinal = !cli.cedula || cli.cedula === '9999999999999'
  doc.text(`Cliente: ${isFinal ? 'Consumidor Final' : (cli.nombre || 'Consumidor Final')}`, 120, 45)
  doc.text(`Cédula/RUC: ${isFinal ? '9999999999999' : (cli.cedula || '')}`, 120, 50)
  if (!isFinal && cli.celular) {
    doc.text(`Celular: ${cli.celular}`, 120, 55)
  }

  // Tabla de productos
  const tableColumn = ['Producto', 'Cantidad', 'Precio Unit.', 'Subtotal']
  const tableRows = []

  let subtotalFactura = 0

  order.detalles?.forEach(d => {
    const nombre = d.producto?.nombre || `Producto #${d.productoId}`
    const cant = d.cantidad
    const precioUnit = Number(d.precio_unitario || d.precio_historico || d.precioUnitario || 0)
    const sub = cant * precioUnit
    subtotalFactura += sub
    tableRows.push([nombre, cant, `$${precioUnit.toFixed(2)}`, `$${sub.toFixed(2)}`])
  })

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 65,
    theme: 'striped',
    headStyles: { fillColor: [44, 62, 80] }
  })

  const finalY = doc.lastAutoTable?.finalY || 65

  // ── Cálculo de IVA y Envío ──────────────────────────────────────────────────
  // Usamos los valores almacenados en el pedido si existen,
  // o los calculamos a partir del subtotal (para pedidos históricos sin IVA).
  const storedSubtotal = order.subtotal != null ? Number(order.subtotal) : subtotalFactura
  const storedDescuento = order.descuento != null ? Number(order.descuento) : 0
  const base = storedSubtotal - storedDescuento

  let storedIva, storedEnvio, totalFinal
  if (order.iva != null && Number(order.iva) > 0) {
    // Pedido nuevo con IVA guardado correctamente
    storedIva = Number(order.iva)
    storedEnvio = order.envio != null ? Number(order.envio) : (order.descripcion?.metodo === 'delivery' ? 2.50 : 0)
    totalFinal = Number(order.total)
  } else {
    // Pedido histórico: calculamos el IVA del 15% sobre la base
    storedIva = Math.round(base * 0.15 * 100) / 100
    storedEnvio = order.descripcion?.metodo === 'pickup' ? 0 : 2.50
    totalFinal = Math.round((base + storedIva + storedEnvio) * 100) / 100
  }

  // ── Totales en el PDF ───────────────────────────────────────────────────────
  doc.setFontSize(11)
  doc.setTextColor(80, 80, 80)
  doc.text('Subtotal:', 130, finalY + 12)
  doc.text(`$${storedSubtotal.toFixed(2)}`, 195, finalY + 12, { align: 'right' })

  let nextY = finalY + 20

  if (storedDescuento > 0) {
    doc.setTextColor(16, 185, 129) // verde para descuento
    doc.text('Descuento (20%):', 130, nextY)
    doc.text(`-$${storedDescuento.toFixed(2)}`, 195, nextY, { align: 'right' })
    doc.setTextColor(80, 80, 80)
    nextY += 8
  }

  doc.setTextColor(80, 80, 80)
  doc.text('IVA (15%):', 130, nextY)
  doc.text(`+$${storedIva.toFixed(2)}`, 195, nextY, { align: 'right' })
  nextY += 8

  doc.text('Envío:', 130, nextY)
  doc.text(storedEnvio > 0 ? `+$${storedEnvio.toFixed(2)}` : 'Gratis', 195, nextY, { align: 'right' })
  nextY += 10

  // Línea separadora
  doc.setDrawColor(180, 180, 180)
  doc.line(130, nextY - 3, 195, nextY - 3)

  doc.setFontSize(13)
  doc.setTextColor(0, 0, 0)
  doc.setFont(undefined, 'bold')
  doc.text('TOTAL:', 130, nextY + 4)
  doc.text(`$${totalFinal.toFixed(2)}`, 195, nextY + 4, { align: 'right' })
  doc.setFont(undefined, 'normal')

  return doc
}

export function downloadInvoice(order) {
  const doc = generateInvoiceDoc(order)
  doc.save(`Factura_ShopSport_Pedido_${order.id}.pdf`)
}

export function getInvoiceBase64(order) {
  const doc = generateInvoiceDoc(order)
  return doc.output('datauristring')
}
