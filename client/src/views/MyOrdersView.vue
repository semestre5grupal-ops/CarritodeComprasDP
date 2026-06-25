<script setup>
import { ref, onMounted } from 'vue'
import OrderController from '../controllers/OrderController'
import { useCart } from '../models/useCart'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import QrcodeVue from 'qrcode.vue'

const { addProduct, openDrawer } = useCart()
const expandedOrderId = ref(null)

const orders = ref([])
const loading = ref(true)
const error = ref(null)

async function loadOrders() {
  loading.value = true
  error.value = ''
  try {
    const data = await OrderController.getMyOrders()
    orders.value = data || []
  } catch (err) {
    error.value = err.message || 'Error al cargar mis pedidos'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOrders()
})

function downloadInvoice(order) {
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
  doc.text(`Estado: Pagado`, 14, 55)

  // Datos del Cliente
  const cli = order.clienteDatos || {}
  const isFinal = !cli.cedula || cli.cedula === '9999999999999'
  doc.text(`Cliente: ${isFinal ? 'Consumidor Final' : (cli.nombre || 'Consumidor Final')}`, 120, 45)
  doc.text(`Cédula/RUC: ${isFinal ? '9999999999999' : (cli.cedula || '')}`, 120, 50)
  if (!isFinal && cli.celular) {
    doc.text(`Celular: ${cli.celular}`, 120, 55)
  }

  // Tabla
  const tableColumn = ["Producto", "Cantidad", "Precio Unit.", "Subtotal"]
  const tableRows = []

  let subtotalFactura = 0;

  order.detalles?.forEach(d => {
    const nombre = d.producto?.nombre || `Producto #${d.productoId}`
    const cant = d.cantidad
    const precioUnit = Number(d.precio_unitario || d.precio_historico || (order.total / cant) || 0)
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
  doc.text(`IVA (0%): $0.00`, 140, finalY + 18)
  doc.setFontSize(14)
  doc.text(`Total: $${Number(order.total || 0).toFixed(2)}`, 140, finalY + 28)

  doc.save(`Factura_ShopSport_Pedido_${order.id}.pdf`)
}

function toggleRow(id) {
  expandedOrderId.value = expandedOrderId.value === id ? null : id
}

function getOrderStatus(createdAt) {
  const diffTime = Math.abs(new Date() - new Date(createdAt))
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  if (diffDays <= 1) return 1 // Preparando
  if (diffDays <= 3) return 2 // En camino
  return 3 // Entregado
}

function reorder(order) {
  if (!order.detalles) return
  order.detalles.forEach(d => {
    if (d.productoId) {
      addProduct({
        id: d.productoId,
        nombre: d.producto?.nombre || `Producto #${d.productoId}`,
        precio: Number(d.precio_unitario || d.precio_historico || 0),
        imagen: '',
        stock: 99
      }, d.cantidad)
    }
  })
  openDrawer()
}

const qrDialog = ref(null)
const selectedOrderForQr = ref(null)

function openQrModal(order) {
  selectedOrderForQr.value = order
  qrDialog.value?.showModal()
}

function closeQrModal() {
  qrDialog.value?.close()
  selectedOrderForQr.value = null
}
</script>

<template>
  <section class="wrap-wide" aria-labelledby="orders-title" style="margin-top: 2rem;">
    <div class="section-heading">
      <h2 id="orders-title">Mis Pedidos</h2>
    </div>

    <div
      v-if="error"
      class="form-alert form-alert--error"
      role="alert"
      aria-live="assertive"
    >
      {{ error }}
    </div>

    <div v-if="loading" class="loading" role="status" aria-live="polite">
      <div class="spinner" aria-hidden="true"></div>
      <p>Cargando tus pedidos...</p>
    </div>

    <div v-else-if="orders.length === 0" class="empty-message" role="status">
      No has realizado ningún pedido aún. ¡Explora nuestro catálogo!
    </div>

    <div v-else class="table-wrap">
      <table class="data-table" aria-label="Historial de mis pedidos">
        <thead>
          <tr>
            <th scope="col">ID Pedido</th>
            <th scope="col">Fecha</th>
            <th scope="col">Productos</th>
            <th scope="col">Total</th>
            <th scope="col">Factura</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="o in orders" :key="o.id">
            <tr class="order-row" @click="toggleRow(o.id)">
              <td>#{{ o.id }}</td>
              <td>{{ new Date(o.createdAt).toLocaleDateString('es-EC') }}</td>
              <td>
                <ul class="order-detail-list" v-if="o.detalles?.length">
                  <li v-for="(d, index) in o.detalles" :key="'det-' + index">
                    {{ d.producto?.nombre || `Producto #${d.productoId}` }} x{{ d.cantidad }}
                  </li>
                </ul>
                <span v-else class="muted">—</span>
              </td>
              <td style="font-weight: 600;">${{ Number(o.total || 0).toFixed(2) }}</td>
              <td class="actions-col">
                <button class="btn-invoice" @click.stop="downloadInvoice(o)" title="Descargar Factura PDF">
                  ⬇️ PDF
                </button>
                <button v-if="o.descripcion?.metodo === 'pickup'" class="btn-pickup" @click.stop="openQrModal(o)" title="Mostrar QR para Retiro en Tienda">
                  🏪 Retirar en Local
                </button>
                <button class="btn-reorder" @click.stop="reorder(o)" title="Volver a Pedir">
                  🔄 Reordenar
                </button>
              </td>
            </tr>
            <tr v-if="expandedOrderId === o.id" class="expanded-row">
              <td colspan="5">
                <div v-if="o.descripcion?.metodo !== 'pickup'" class="stepper-container">
                  <h4 style="margin-top: 0;">Seguimiento del Paquete</h4>
                  <div class="stepper">
                    <div class="step" :class="{ active: getOrderStatus(o.createdAt) >= 1 }">
                      <div class="step-icon">📦</div>
                      <p>Preparando</p>
                    </div>
                    <div class="step-line" :class="{ active: getOrderStatus(o.createdAt) >= 2 }"></div>
                    <div class="step" :class="{ active: getOrderStatus(o.createdAt) >= 2 }">
                      <div class="step-icon">🚚</div>
                      <p>En camino</p>
                    </div>
                    <div class="step-line" :class="{ active: getOrderStatus(o.createdAt) >= 3 }"></div>
                    <div class="step" :class="{ active: getOrderStatus(o.createdAt) >= 3 }">
                      <div class="step-icon">✅</div>
                      <p>Entregado</p>
                    </div>
                  </div>
                </div>
                <div v-else class="stepper-container" style="text-align: center;">
                  <h4 style="margin-top: 0;">Retiro en Local</h4>
                  <p>Has seleccionado retirar este pedido en: <strong>{{ o.descripcion?.local || 'Tienda Principal' }}</strong></p>
                  <p class="muted">Toca el botón de "Retirar en Local" para generar tu código QR.</p>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </section>

  <dialog
    ref="qrDialog"
    class="qr-modal"
    aria-labelledby="qr-dialog-title"
  >
    <div class="qr-modal-content" v-if="selectedOrderForQr">
      <h2 id="qr-dialog-title">Retiro en Tienda</h2>
      <p class="qr-instruction">
        Muestra este código al cajero en la sucursal para verificar y entregar tu paquete.
      </p>
      
      <div class="qr-wrapper">
        <qrcode-vue 
          :value="JSON.stringify({ action: 'pickup', orderId: selectedOrderForQr.id, total: selectedOrderForQr.total, local: selectedOrderForQr.descripcion?.local })"
          :size="200"
          level="M"
          render-as="svg"
        />
      </div>
      
      <p class="qr-order-id">Pedido #{{ selectedOrderForQr.id }}</p>
      <p v-if="selectedOrderForQr.descripcion?.local" style="margin-top: -10px; margin-bottom: 15px; color: var(--muted); font-size: 0.9rem;">
        Local: {{ selectedOrderForQr.descripcion.local }}
      </p>
      
      <button type="button" class="btn btn-primary btn--full" @click="closeQrModal">
        Cerrar
      </button>
    </div>
  </dialog>
</template>

<style scoped>
.section-heading {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--line);
}

.table-wrap {
  overflow-x: auto;
  border: 1px solid var(--line);
  border-radius: 1rem;
  margin-bottom: 3rem;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.data-table th {
  background: var(--surface-soft);
  text-align: left;
  padding: 1rem;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--muted);
  border-bottom: 1px solid var(--line);
  white-space: nowrap;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--line);
  vertical-align: top;
  color: var(--ink);
}

.data-table tr:last-child td {
  border-bottom: none;
}

.data-table tr:hover td {
  background: var(--surface-soft);
}

.order-detail-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.3rem;
}

.order-detail-list li {
  font-size: 0.9rem;
  color: var(--ink);
}

.muted {
  color: var(--muted);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  color: var(--muted);
}

.spinner {
  width: 36px;
  height: 36px;
  border: 4px solid var(--line);
  border-top: 4px solid var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-message {
  text-align: center;
  padding: 3rem;
  color: var(--muted);
  font-size: 1.1rem;
}

.form-alert {
  padding: 1rem;
  border-radius: 0.7rem;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
}

.form-alert--error {
  background: rgba(185, 28, 28, 0.1);
  color: #b91c1c;
  border: 1px solid rgba(185, 28, 28, 0.25);
}

.btn-invoice, .btn-reorder, .btn-pickup {
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.4rem 0.6rem;
}

.btn-invoice {
  color: var(--accent);
  border: 1px solid var(--accent);
}
.btn-invoice:hover {
  background: var(--accent);
  color: white;
}

.btn-reorder {
  color: #10b981;
  border: 1px solid #10b981;
}
.btn-reorder:hover {
  background: #10b981;
  color: white;
}

.btn-pickup {
  color: #8b5cf6;
  border: 1px solid #8b5cf6;
}
.btn-pickup:hover {
  background: #8b5cf6;
  color: white;
}

.actions-col {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.order-row {
  cursor: pointer;
  transition: background 0.2s;
}

.expanded-row td {
  background: #fdfdfd;
  padding: 1.5rem;
  border-bottom: 2px solid var(--accent);
}

.stepper-container {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1.5rem;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.4;
  transition: opacity 0.4s ease;
}

.step.active {
  opacity: 1;
}

.step-icon {
  font-size: 1.8rem;
  background: var(--surface-soft);
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 2px solid transparent;
}

.step.active .step-icon {
  background: #e6f7f2;
  border-color: #10b981;
}

.step p {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--ink);
}

.step-line {
  flex: 1;
  height: 4px;
  background: var(--surface-soft);
  margin: 0 1rem;
  border-radius: 2px;
  position: relative;
  top: -15px;
  transition: background 0.4s ease;
}

.step-line.active {
  background: #10b981;
}

/* Modal QR */
.qr-modal {
  border: none;
  border-radius: 1.5rem;
  padding: 0;
  max-width: 380px;
  width: calc(100% - 2rem);
  background: var(--surface);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  margin: auto;
}

.qr-modal::backdrop {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
}

.qr-modal-content {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.qr-modal-content h2 {
  font-size: 1.4rem;
  margin-bottom: 0.5rem;
  color: var(--ink);
}

.qr-instruction {
  color: var(--muted);
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.qr-wrapper {
  background: white;
  padding: 1rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-order-id {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 1.5rem;
  letter-spacing: 0.05em;
}

/* Responsividad para móviles */
@media (max-width: 768px) {
  .actions-col {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-invoice, .btn-reorder, .btn-pickup {
    justify-content: center;
    width: 100%;
  }

  .stepper {
    flex-direction: column;
    align-items: flex-start;
    gap: 0;
  }

  .step {
    flex-direction: row;
    gap: 1rem;
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .step-line {
    width: 4px;
    height: 25px;
    margin: 0 0 0 23px; /* Centrado con el ícono de 50px */
    top: 0;
  }
}
</style>
