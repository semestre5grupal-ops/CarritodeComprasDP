<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import OrderController from '../controllers/OrderController'
import { useCart } from '../models/useCart'
import QrcodeVue from 'qrcode.vue'
import { useRouter } from 'vue-router'
import { downloadInvoice } from '../utils/pdfGenerator'

const { addProduct } = useCart()
const router = useRouter()

const flowSteps = [
  { step: 1, icon: '🕐', label: 'Pendiente' },
  { step: 2, icon: '⚙️', label: 'Procesando' },
  { step: 3, icon: '🚚', label: 'Enviado' },
  { step: 4, icon: '✅', label: 'Entregado' },
]

function getFlowSteps(order) {
  const isPickup = order?.descripcion?.metodo === 'pickup'
  return [
    { step: 1, icon: '🕐', label: 'Pendiente' },
    { step: 2, icon: '⚙️', label: 'Procesando' },
    { step: 3, icon: isPickup ? '🏪' : '🚚', label: isPickup ? 'Listo para retirar' : 'Enviado' },
    { step: 4, icon: '✅', label: 'Entregado' },
  ]
}

const statusMessages = {
  'Pendiente':  'Tu pedido fue recibido y está en espera de ser procesado.',
  'Procesando': 'Estamos preparando tu pedido con cuidado.',
  'Enviado':    '¡Tu paquete ya está en camino! Pronto lo recibirás.',
  'Listo para retirar': '¡Tu pedido está listo! Puedes pasar a retirarlo en el local.',
  'Entregado':  '¡Pedido entregado exitosamente! Gracias por tu compra.',
}

const orders = ref([])
const loading = ref(true)
const error = ref(null)
const silentRefreshing = ref(false)
const lastUpdated = ref(null)
let pollingInterval = null

// Modal de detalle
const detailDialog = ref(null)
const selectedOrder = ref(null)

// Modal QR (conservado)
const qrDialog = ref(null)
const selectedOrderForQr = ref(null)

async function loadOrders() {
  loading.value = true
  error.value = ''
  try {
    const data = await OrderController.getMyOrders()
    orders.value = data || []
    lastUpdated.value = new Date()
  } catch (err) {
    error.value = err.message || 'Error al cargar mis pedidos'
  } finally {
    loading.value = false
  }
}

/**
 * Refresco silencioso: obtiene los datos frescos del servidor sin mostrar
 * el spinner principal. Si el modal de detalle está abierto, sincroniza
 * también el pedido seleccionado para que el flujo se actualice en vivo.
 */
async function silentRefresh() {
  if (silentRefreshing.value) return
  silentRefreshing.value = true
  try {
    const data = await OrderController.getMyOrders()
    if (data) {
      orders.value = data
      lastUpdated.value = new Date()
      // Si el modal de detalle está abierto, sincroniza el pedido mostrado
      if (selectedOrder.value) {
        const fresh = data.find(o => o.id === selectedOrder.value.id)
        if (fresh) selectedOrder.value = fresh
      }
    }
  } catch (_) {
    // Fallo silencioso en el polling (no interrumpimos la UI)
  } finally {
    silentRefreshing.value = false
  }
}

function formatLastUpdated(date) {
  if (!date) return ''
  return date.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

onMounted(async () => {
  await loadOrders()
  // Polling cada 30 segundos para reflejar cambios del admin automáticamente
  pollingInterval = setInterval(silentRefresh, 30_000)
})

onUnmounted(() => {
  clearInterval(pollingInterval)
})

function openDetail(order) {
  selectedOrder.value = order
  detailDialog.value?.showModal()
}

function closeDetail() {
  detailDialog.value?.close()
  selectedOrder.value = null
}

function reorder(order) {
  if (!order.detalles) return
  order.detalles.forEach(d => {
    if (d.productoId) {
      addProduct({
        id: d.productoId,
        nombre: d.producto?.nombre || `Producto #${d.productoId}`,
        precio: Number(d.precioUnitario || 0),
        imagen: '',
        stock: 99
      }, d.cantidad)
    }
  })
  router.push('/checkout')
}

function openQrModal(order) {
  selectedOrderForQr.value = order
  qrDialog.value?.showModal()
}

function closeQrModal() {
  qrDialog.value?.close()
  selectedOrderForQr.value = null
}

function getOrderTotals(order) {
  if (!order) return { subtotal: 0, descuento: 0, iva: 0, envio: 0, total: 0 }
  const subtotal = Number(order.subtotal != null ? order.subtotal : (order.total || 0))
  const descuento = Number(order.descuento || 0)
  const base = subtotal - descuento
  
  let iva = Number(order.iva || 0)
  if (iva === 0) {
    iva = Math.round(base * 0.15 * 100) / 100
  }
  
  let envio = Number(order.envio || 0)
  if (envio === 0 && order.descripcion?.metodo === 'delivery') {
    envio = 2.50
  }
  
  const total = Math.round((base + iva + envio) * 100) / 100
  
  return { subtotal, descuento, base, iva, envio, total }
}

/**
 * Convierte el status a un número de paso:
 * 1 = Pendiente, 2 = Procesando, 3 = Enviado, 4 = Entregado, -1 = Cancelado
 */
function statusToStep(status) {
  const map = {
    'Pendiente':   1,
    'Procesando':  2,
    'Enviado':     3,
    'Listo para retirar': 3,
    'Entregado':   4,
    'Cancelado':  -1,
  }
  return map[status] ?? 1
}

function getStatusColor(status) {
  const map = {
    'Pendiente':  '#f59e0b',
    'Procesando': '#3b82f6',
    'Enviado':    '#8b5cf6',
    'Listo para retirar': '#8b5cf6',
    'Entregado':  '#10b981',
    'Cancelado':  '#ef4444',
  }
  return map[status] ?? '#94a3b8'
}

function getStatusEmoji(status) {
  const map = {
    'Pendiente':  '🕐',
    'Procesando': '⚙️',
    'Enviado':    '🚚',
    'Listo para retirar': '🏪',
    'Entregado':  '✅',
    'Cancelado':  '❌',
  }
  return map[status] ?? '📦'
}
</script>

<template>
  <section
    class="wrap-wide"
    aria-labelledby="orders-title"
    style="margin-top: 2rem;"
  >
    <div class="section-heading">
      <div class="heading-row">
        <div>
          <h2 id="orders-title">
            Mis Pedidos
          </h2>
          <p class="section-subtitle">
            Haz clic en un pedido para ver su estado detallado
          </p>
        </div>
        <div class="heading-actions">
          <span
            v-if="lastUpdated"
            class="last-updated"
          >
            🕐 Actualizado: {{ formatLastUpdated(lastUpdated) }}
          </span>
          <button
            class="btn-refresh"
            :class="{ 'btn-refresh--spinning': silentRefreshing }"
            :disabled="silentRefreshing"
            title="Actualizar pedidos"
            aria-label="Actualizar mis pedidos"
            @click="silentRefresh"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              aria-hidden="true"
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            {{ silentRefreshing ? 'Actualizando...' : 'Actualizar' }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="error"
      class="form-alert form-alert--error"
      role="alert"
      aria-live="assertive"
    >
      {{ error }}
    </div>

    <div
      v-if="loading"
      class="loading"
      role="status"
      aria-live="polite"
    >
      <div
        class="spinner"
        aria-hidden="true"
      />
      <p>Cargando tus pedidos...</p>
    </div>

    <div
      v-else-if="orders.length === 0"
      class="empty-message"
      role="status"
    >
      <div class="empty-icon">
        🛍️
      </div>
      No has realizado ningún pedido aún. ¡Explora nuestro catálogo!
    </div>

    <!-- Grid de tarjetas -->
    <div
      v-else
      class="orders-grid"
    >
      <article
        v-for="o in orders"
        :key="o.id"
        class="order-card"
        :aria-label="`Pedido #${o.id}, estado ${o.status || 'Pendiente'}`"
        tabindex="0"
        @click="openDetail(o)"
        @keydown.enter="openDetail(o)"
        @keydown.space.prevent="openDetail(o)"
      >
        <!-- Header de la tarjeta -->
        <div class="card-header">
          <div class="card-id">
            #{{ o.id }}
          </div>
          <span
            class="status-pill"
            :style="{ background: getStatusColor(o.status || 'Pendiente') + '22', color: getStatusColor(o.status || 'Pendiente'), borderColor: getStatusColor(o.status || 'Pendiente') + '55' }"
          >
            {{ getStatusEmoji(o.status || 'Pendiente') }} {{ o.status || 'Pendiente' }}
          </span>
        </div>

        <!-- Mini stepper visual en la tarjeta -->
        <div
          v-if="(o.status || 'Pendiente') !== 'Cancelado'"
          class="card-mini-stepper"
        >
          <div
            v-for="step in 4"
            :key="step"
            class="mini-step"
            :class="{ 'mini-step--done': statusToStep(o.status || 'Pendiente') >= step }"
          />
        </div>
        <div
          v-else
          class="card-mini-stepper"
        >
          <div
            v-for="s in 4"
            :key="s"
            class="mini-step mini-step--cancelled"
          />
        </div>

        <!-- Productos del pedido -->
        <ul
          v-if="o.detalles?.length"
          class="card-products"
        >
          <li
            v-for="(d, i) in o.detalles.slice(0, 2)"
            :key="i"
          >
            {{ d.producto?.nombre || `Producto #${d.productoId}` }}
            <span class="qty">x{{ d.cantidad }}</span>
          </li>
          <li
            v-if="o.detalles.length > 2"
            class="more-items"
          >
            +{{ o.detalles.length - 2 }} producto(s) más
          </li>
        </ul>

        <!-- Footer de la tarjeta -->
        <div class="card-footer">
          <div class="card-date-col">
            <div class="card-date">
              📅 {{ new Date(o.createdAt).toLocaleDateString('es-EC') }}
            </div>
            <div class="card-sub-details">
              <span>IVA: +${{ getOrderTotals(o).iva.toFixed(2) }}</span>
              <span>Envío: {{ getOrderTotals(o).envio > 0 ? '+$' + getOrderTotals(o).envio.toFixed(2) : 'Gratis' }}</span>
            </div>
          </div>
          <div class="card-total">
            ${{ getOrderTotals(o).total.toFixed(2) }}
          </div>
        </div>

        <div class="card-click-hint">
          Ver detalle →
        </div>
      </article>
    </div>
  </section>

  <!-- ====== MODAL DETALLE DE PEDIDO ====== -->
  <dialog
    ref="detailDialog"
    class="detail-modal"
    aria-labelledby="detail-title"
    @click.self="closeDetail"
  >
    <div
      v-if="selectedOrder"
      class="detail-content"
    >
      <!-- Header del modal -->
      <div class="detail-header">
        <div>
          <h2 id="detail-title">
            Pedido #{{ selectedOrder.id }}
          </h2>
          <p class="detail-date">
            {{ new Date(selectedOrder.createdAt).toLocaleDateString('es-EC', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
          </p>
        </div>
        <button
          class="close-btn"
          aria-label="Cerrar detalle"
          @click="closeDetail"
        >
          ✕
        </button>
      </div>

      <!-- ====== FLUJO DE ESTADO ====== -->
      <div class="flow-section">
        <h3 class="flow-title">
          Estado del Pedido
        </h3>

        <!-- Estado CANCELADO: X grande sobre los pasos -->
        <div
          v-if="selectedOrder.status === 'Cancelado'"
          class="cancelled-overlay-wrap"
        >
          <div class="flow-steps flow-steps--faded">
            <div
              v-for="(step, idx) in getFlowSteps(selectedOrder)"
              :key="idx"
              class="flow-step"
            >
              <div class="flow-step__icon">
                {{ step.icon }}
              </div>
              <div class="flow-step__label">
                {{ step.label }}
              </div>
              <div
                v-if="idx < getFlowSteps(selectedOrder).length - 1"
                class="flow-connector"
              />
            </div>
          </div>
          <div
            class="cancelled-x"
            aria-label="Pedido cancelado"
          >
            <svg
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="60"
                cy="60"
                r="55"
                fill="#ef444420"
                stroke="#ef4444"
                stroke-width="4"
              />
              <line
                x1="30"
                y1="30"
                x2="90"
                y2="90"
                stroke="#ef4444"
                stroke-width="10"
                stroke-linecap="round"
                class="cancel-line cancel-line--1"
              />
              <line
                x1="90"
                y1="30"
                x2="30"
                y2="90"
                stroke="#ef4444"
                stroke-width="10"
                stroke-linecap="round"
                class="cancel-line cancel-line--2"
              />
            </svg>
            <p class="cancelled-text">
              Pedido Cancelado
            </p>
          </div>
        </div>

        <!-- Estado NORMAL: flujo de pasos animado -->
        <div
          v-else
          class="flow-steps"
        >
          <template
            v-for="(step, idx) in getFlowSteps(selectedOrder)"
            :key="idx"
          >
            <div
              class="flow-step"
              :class="{
                'flow-step--active': statusToStep(selectedOrder.status || 'Pendiente') === step.step,
                'flow-step--done': statusToStep(selectedOrder.status || 'Pendiente') > step.step,
              }"
            >
              <div class="flow-step__circle">
                <div class="flow-step__icon">
                  {{ step.icon }}
                </div>
                <div
                  v-if="statusToStep(selectedOrder.status || 'Pendiente') === step.step"
                  class="pulse-ring"
                />
              </div>
              <div class="flow-step__label">
                {{ step.label }}
              </div>
              <div class="flow-step__sublabel">
                Paso {{ step.step }}
              </div>
            </div>
            <div
              v-if="idx < getFlowSteps(selectedOrder).length - 1"
              class="flow-connector"
              :class="{ 'flow-connector--done': statusToStep(selectedOrder.status || 'Pendiente') > step.step }"
            />
          </template>
        </div>

        <!-- Mensaje del estado actual -->
        <div
          v-if="selectedOrder.status !== 'Cancelado'"
          class="status-message"
        >
          <span
            class="status-dot"
            :style="{ background: getStatusColor(selectedOrder.status || 'Pendiente') }"
          />
          <span>{{ statusMessages[selectedOrder.status || 'Pendiente'] }}</span>
        </div>
      </div>

      <!-- Dirección / Retiro -->
      <div
        v-if="selectedOrder.descripcion"
        class="detail-section"
      >
        <h3 class="detail-section__title">
          {{ selectedOrder.descripcion.metodo === 'pickup' ? '🏪 Retiro en Local' : '📍 Dirección de Entrega' }}
        </h3>
        <p class="detail-section__text">
          {{ selectedOrder.descripcion.metodo === 'pickup'
            ? (selectedOrder.descripcion.local || 'Tienda Principal')
            : (selectedOrder.descripcion.direccion || 'Sin dirección registrada') }}
        </p>
      </div>

      <!-- Lista de productos -->
      <div class="detail-section">
        <h3 class="detail-section__title">
          🛍️ Productos
        </h3>
        <ul class="detail-products-list">
          <li
            v-for="(d, i) in selectedOrder.detalles"
            :key="i"
            class="detail-product-item"
          >
            <span class="dp-name">{{ d.producto?.nombre || `Producto #${d.productoId}` }}</span>
            <span class="dp-qty">x{{ d.cantidad }}</span>
            <span class="dp-price">${{ Number(d.precioUnitario || 0).toFixed(2) }}</span>
          </li>
        </ul>
        <div class="detail-totals">
          <div class="detail-total-row">
            <span>Subtotal</span>
            <span>${{ getOrderTotals(selectedOrder).subtotal.toFixed(2) }}</span>
          </div>
          <div
            v-if="getOrderTotals(selectedOrder).descuento > 0"
            class="detail-total-row detail-discount"
          >
            <span>Descuento (20%)</span>
            <span>-${{ getOrderTotals(selectedOrder).descuento.toFixed(2) }}</span>
          </div>
          <div class="detail-total-row detail-iva">
            <span>IVA (15%)</span>
            <span>+${{ getOrderTotals(selectedOrder).iva.toFixed(2) }}</span>
          </div>
          <div class="detail-total-row detail-envio">
            <span>Envío</span>
            <span>{{ getOrderTotals(selectedOrder).envio > 0 ? '+$' + getOrderTotals(selectedOrder).envio.toFixed(2) : 'Gratis' }}</span>
          </div>
          <div class="detail-total-row detail-total-final">
            <span>Total</span>
            <strong>${{ getOrderTotals(selectedOrder).total.toFixed(2) }}</strong>
          </div>
        </div>
      </div>

      <!-- Acciones -->
      <div class="detail-actions">
        <button
          class="action-btn action-btn--pdf"
          @click="downloadInvoice(selectedOrder)"
        >
          ⬇️ Descargar Factura
        </button>
        <button
          v-if="selectedOrder.descripcion?.metodo === 'pickup'"
          class="action-btn action-btn--qr"
          @click="openQrModal(selectedOrder)"
        >
          🏪 Código QR
        </button>
        <button
          class="action-btn action-btn--reorder"
          @click="reorder(selectedOrder); closeDetail()"
        >
          🔄 Reordenar
        </button>
      </div>
    </div>
  </dialog>

  <!-- ====== MODAL QR (sin cambios) ====== -->
  <dialog
    ref="qrDialog"
    class="qr-modal"
    aria-labelledby="qr-dialog-title"
  >
    <div
      v-if="selectedOrderForQr"
      class="qr-modal-content"
    >
      <h2 id="qr-dialog-title">
        Retiro en Tienda
      </h2>
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
      <p class="qr-order-id">
        Pedido #{{ selectedOrderForQr.id }}
      </p>
      <p
        v-if="selectedOrderForQr.descripcion?.local"
        style="margin-top: -10px; margin-bottom: 15px; color: var(--muted); font-size: 0.9rem;"
      >
        Local: {{ selectedOrderForQr.descripcion.local }}
      </p>
      <button
        type="button"
        class="btn btn-primary btn--full"
        @click="closeQrModal"
      >
        Cerrar
      </button>
    </div>
  </dialog>
</template>



<style scoped>
/* ─── Encabezado ─────────────────────────────────────────── */
.section-heading {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--line);
}
.heading-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
}
.heading-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}
.last-updated {
  font-size: 0.78rem;
  color: var(--muted, #64748b);
  white-space: nowrap;
}
.btn-refresh {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.9rem;
  background: transparent;
  border: 1px solid var(--accent, #6366f1);
  color: var(--accent, #6366f1);
  border-radius: 0.5rem;
  font-size: 0.83rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.btn-refresh:hover:not(:disabled) {
  background: var(--accent, #6366f1);
  color: white;
}
.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-refresh--spinning svg {
  animation: spin 0.8s linear infinite;
}
.section-subtitle {
  color: var(--muted);
  font-size: 0.95rem;
  margin-top: 0.25rem;
}

/* ─── Estados vacíos / carga ─────────────────────────────── */
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
@keyframes spin { to { transform: rotate(360deg); } }

.empty-message {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--muted);
  font-size: 1.1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
.empty-icon { font-size: 3rem; }

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

/* ─── Grid de tarjetas ───────────────────────────────────── */
.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

/* ─── Tarjeta individual ─────────────────────────────────── */
.order-card {
  background: var(--surface, #fff);
  border: 1px solid var(--line, #e2e8f0);
  border-radius: 1rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  outline: none;
}
.order-card:hover,
.order-card:focus-visible {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.1);
  border-color: var(--accent, #6366f1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-id {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ink, #1e293b);
}
.status-pill {
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  border: 1px solid;
  white-space: nowrap;
}

/* Mini stepper en la tarjeta */
.card-mini-stepper {
  display: flex;
  gap: 0.35rem;
  height: 6px;
}
.mini-step {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: var(--surface-soft, #f1f5f9);
  transition: background 0.3s;
}
.mini-step--done {
  background: var(--accent, #6366f1);
}
.mini-step--cancelled {
  background: #fca5a5;
}

/* Productos en tarjeta */
.card-products {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.88rem;
  color: var(--ink, #1e293b);
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.card-products li { display: flex; justify-content: space-between; }
.qty { color: var(--muted, #64748b); }
.more-items { color: var(--muted, #64748b); font-style: italic; }

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid var(--line, #e2e8f0);
  font-size: 0.85rem;
  color: var(--muted, #64748b);
}
.card-total {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ink, #1e293b);
}
.card-click-hint {
  font-size: 0.78rem;
  color: var(--accent, #6366f1);
  font-weight: 600;
  text-align: right;
  opacity: 0;
  transition: opacity 0.2s;
}
.order-card:hover .card-click-hint,
.order-card:focus-visible .card-click-hint {
  opacity: 1;
}

/* ─── Modal detalle ──────────────────────────────────────── */
.detail-modal {
  border: none;
  border-radius: 1.5rem;
  padding: 0;
  max-width: 620px;
  width: calc(100% - 2rem);
  background: var(--surface, #fff);
  box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.3);
  margin: auto;
  max-height: 90vh;
  overflow-y: auto;
}
.detail-modal::backdrop {
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(6px);
}
.detail-content {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.detail-header h2 {
  font-size: 1.5rem;
  margin: 0 0 0.25rem;
  color: var(--ink, #1e293b);
}
.detail-date {
  font-size: 0.85rem;
  color: var(--muted, #64748b);
  margin: 0;
  text-transform: capitalize;
}
.close-btn {
  background: var(--surface-soft, #f1f5f9);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted, #64748b);
  transition: background 0.2s, color 0.2s;
  flex-shrink: 0;
}
.close-btn:hover { background: #e2e8f0; color: var(--ink, #1e293b); }

/* ─── Sección de flujo ───────────────────────────────────── */
.flow-section {
  background: var(--surface-soft, #f8fafc);
  border-radius: 1rem;
  padding: 1.5rem;
}
.flow-title {
  margin: 0 0 1.5rem;
  font-size: 1rem;
  font-weight: 700;
  color: var(--ink, #1e293b);
}

/* Pasos del flujo */
.flow-steps {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  position: relative;
  gap: 0;
}
.flow-steps--faded {
  opacity: 0.2;
  pointer-events: none;
}

.flow-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex: 0 0 auto;
  position: relative;
  z-index: 1;
}
.flow-step__circle {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--surface, #fff);
  border: 2px solid var(--line, #e2e8f0);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.4s, background 0.4s, box-shadow 0.4s;
}
.flow-step__icon {
  font-size: 1.5rem;
  line-height: 1;
}
.flow-step__label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--muted, #64748b);
  transition: color 0.3s;
  text-align: center;
}
.flow-step__sublabel {
  font-size: 0.7rem;
  color: var(--muted, #94a3b8);
  text-align: center;
}

/* Paso completado */
.flow-step--done .flow-step__circle {
  background: #d1fae5;
  border-color: #10b981;
}
.flow-step--done .flow-step__label { color: #10b981; }

/* Paso activo (actual) */
.flow-step--active .flow-step__circle {
  background: var(--accent, #6366f1);
  border-color: var(--accent, #6366f1);
  box-shadow: 0 0 0 6px rgba(99, 102, 241, 0.15);
}
.flow-step--active .flow-step__icon { filter: brightness(10); }
.flow-step--active .flow-step__label { color: var(--accent, #6366f1); }

/* Anillo de pulso para el paso activo */
.pulse-ring {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px solid var(--accent, #6366f1);
  animation: pulse-anim 1.8s ease-out infinite;
  opacity: 0;
}
@keyframes pulse-anim {
  0%   { opacity: 0.7; transform: scale(0.9); }
  100% { opacity: 0;   transform: scale(1.6); }
}

/* Conector entre pasos */
.flow-connector {
  flex: 1;
  height: 3px;
  background: var(--line, #e2e8f0);
  margin-top: 26px; /* centrado con el círculo de 56px / 2 - 3px/2 */
  border-radius: 2px;
  transition: background 0.5s ease;
}
.flow-connector--done {
  background: #10b981;
}

/* Mensaje de estado */
.status-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.25rem;
  font-size: 0.9rem;
  color: var(--ink, #1e293b);
  background: var(--surface, #fff);
  padding: 0.75rem 1rem;
  border-radius: 0.6rem;
  border: 1px solid var(--line, #e2e8f0);
}
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ─── CANCELADO: X grande ────────────────────────────────── */
.cancelled-overlay-wrap {
  position: relative;
}
.cancelled-x {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  z-index: 2;
}
.cancelled-x svg {
  width: 100px;
  height: 100px;
  filter: drop-shadow(0 4px 12px rgba(239, 68, 68, 0.3));
}
.cancel-line {
  stroke-dasharray: 90;
  stroke-dashoffset: 90;
  animation: draw-line 0.5s ease forwards;
}
.cancel-line--1 { animation-delay: 0.1s; }
.cancel-line--2 { animation-delay: 0.35s; }
@keyframes draw-line {
  to { stroke-dashoffset: 0; }
}
.cancelled-text {
  font-size: 0.9rem;
  font-weight: 700;
  color: #ef4444;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background: rgba(255,255,255,0.9);
  padding: 0.2rem 0.75rem;
  border-radius: 999px;
}

/* ─── Secciones del detalle ──────────────────────────────── */
.detail-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.detail-section__title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--ink, #1e293b);
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--line, #e2e8f0);
}
.detail-section__text {
  margin: 0;
  font-size: 0.95rem;
  color: var(--muted, #64748b);
}

/* Lista de productos del detalle */
.detail-products-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.detail-product-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  padding: 0.5rem 0;
  border-bottom: 1px dashed var(--line, #e2e8f0);
}
.dp-name { flex: 1; color: var(--ink, #1e293b); }
.dp-qty {
  color: var(--muted, #64748b);
  font-size: 0.85rem;
  background: var(--surface-soft, #f1f5f9);
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
}
.dp-price { font-weight: 600; color: var(--ink, #1e293b); }

.detail-totals {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding-top: 0.75rem;
  border-top: 1px dashed var(--line, #e2e8f0);
}
.detail-total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: var(--muted, #64748b);
}
.detail-discount {
  color: #10b981;
  font-weight: 600;
}
.detail-iva, .detail-envio {
  color: var(--muted, #64748b);
  font-size: 0.85rem;
}
.detail-total-final {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--ink, #1e293b);
  padding-top: 0.5rem;
  border-top: 1px solid var(--line, #e2e8f0);
  margin-top: 0.25rem;
}
.detail-total-final strong { font-size: 1.25rem; color: var(--accent, #6366f1); }

/* Sub detalles en la tarjeta */
.card-date-col {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.card-sub-details {
  display: flex;
  flex-direction: column;
  font-size: 0.75rem;
  color: var(--muted, #94a3b8);
}

/* ─── Botones de acciones ────────────────────────────────── */
.detail-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.action-btn {
  border-radius: 0.6rem;
  border: 1px solid;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
}
.action-btn--pdf {
  color: var(--accent, #6366f1);
  border-color: var(--accent, #6366f1);
  background: transparent;
}
.action-btn--pdf:hover { background: var(--accent, #6366f1); color: white; }

.action-btn--qr {
  color: #8b5cf6;
  border-color: #8b5cf6;
  background: transparent;
}
.action-btn--qr:hover { background: #8b5cf6; color: white; }

.action-btn--reorder {
  color: #10b981;
  border-color: #10b981;
  background: transparent;
}
.action-btn--reorder:hover { background: #10b981; color: white; }

/* ─── Modal QR (conservado) ──────────────────────────────── */
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

/* ─── Responsive ─────────────────────────────────────────── */
@media (max-width: 640px) {
  .orders-grid {
    grid-template-columns: 1fr;
  }
  .flow-steps {
    flex-direction: column;
    align-items: flex-start;
    gap: 0;
  }
  .flow-step {
    flex-direction: row;
    gap: 1rem;
    width: 100%;
    padding: 0.5rem 0;
  }
  .flow-step__circle {
    width: 44px;
    height: 44px;
    flex-shrink: 0;
  }
  .flow-step__icon { font-size: 1.2rem; }
  .flow-connector {
    width: 3px;
    height: 20px;
    margin-top: 0;
    margin-left: 20px;
  }
  .detail-actions {
    flex-direction: column;
  }
  .cancelled-x svg { width: 80px; height: 80px; }
}
</style>
