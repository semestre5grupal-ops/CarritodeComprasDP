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

  // Tabla
  const tableColumn = ['Producto', 'Cantidad', 'Precio Unit.', 'Subtotal']
  const tableRows = []

  let subtotalFactura = 0

  order.detalles?.forEach(d => {
    const nombre = d.producto?.nombre || `Producto #${d.productoId}`
    const cant = d.cantidad
    const precioUnit = Number(d.precio_unitario || d.precio_historico || d.precioUnitario || (order.total / cant) || 0)
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

  // Totales
  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text(`Subtotal: $${subtotalFactura.toFixed(2)}`, 140, finalY + 10)
  doc.text('IVA (0%): $0.00', 140, finalY + 18)
  doc.setFontSize(14)
  doc.text(`Total: $${Number(order.total || 0).toFixed(2)}`, 140, finalY + 28)

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
