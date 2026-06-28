<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '../models/useCart'
import { useAuth } from '../models/useAuth'

const router = useRouter()
const { items, itemCount, subtotal, discount, total, iva, envio, totalConIva, couponCode, drawerOpen, selectedIds, addProduct, updateQuantity, removeProduct, removeSelected, toggleSelected, closeDrawer, submitOrder } = useCart()
const { isAuthenticated, user, fetchProfile } = useAuth()

const overlay = ref(null)
const drawer = ref(null)
const dialog = ref(null)
const alertState = ref(null) // 'offline' or 'success'

const allSelected = computed({
  get: () => items.value.length > 0 && selectedIds.value.size === items.value.length,
  set: (val) => {
    if (val) {
      selectedIds.value = new Set(items.value.map(i => i.id))
    } else {
      selectedIds.value = new Set()
    }
  }
})

let previousFocus = null

function handleKeydown(evt) {
  if (!drawerOpen.value) return

  if (evt.key === 'Escape') {
    if (alertState.value) {
      dialog.value?.close()
      alertState.value = null
      return
    }
    closeDrawer()
    return
  }

  if (evt.key === 'Tab') {
    trapFocus(evt)
  }
}

function trapFocus(evt) {
  const focusable = drawer.value?.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  if (!focusable || focusable.length === 0) return

  const first = focusable[0]
  const last = focusable[focusable.length - 1]

  if (evt.shiftKey && document.activeElement === first) {
    evt.preventDefault()
    last.focus()
  } else if (!evt.shiftKey && document.activeElement === last) {
    evt.preventDefault()
    first.focus()
  }
}

watch(drawerOpen, async (open) => {
  if (open) {
    previousFocus = document.activeElement
    document.body.style.overflow = 'hidden'
    await nextTick()
    drawer.value?.focus()
  } else {
    document.body.style.overflow = ''
    if (previousFocus) {
      previousFocus.focus()
      previousFocus = null
    }
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})

function handleOverlayClick(evt) {
  if (evt.target === overlay.value) {
    closeDrawer()
  }
}

function increaseQty(item) {
  if (item.cantidad < item.stock) {
    addProduct({ id: item.id, nombre: item.nombre, precio: item.precio, imagen: item.imagen, categoria: item.categoria, stock: item.stock }, 1)
  }
}

function decreaseQty(item) {
  if (item.cantidad > 1) {
    updateQuantity(item.id, item.cantidad - 1)
  } else {
    removeProduct(item.id)
  }
}

async function handleCheckout() {
  if (!isAuthenticated.value) {
    closeDrawer()
    router.push('/login')
    return
  }

  closeDrawer()
  router.push('/checkout')
}

function closeAlert() {
  dialog.value?.close()
  alertState.value = null
}
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer-fade">
      <div
        v-if="drawerOpen"
        ref="overlay"
        class="cart-overlay"
        :class="{ 'active': drawerOpen }"
        aria-hidden="true"
        @click="handleOverlayClick"
      />
    </Transition>

    <Transition name="drawer-slide">
      <aside
        v-if="drawerOpen"
        ref="drawer"
        class="cart-drawer"
        :class="{ 'open': drawerOpen }"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        tabindex="-1"
      >
        <header class="drawer-header">
          <h2 id="cart-drawer-title">
            Carrito
            <span
              class="drawer-count"
              aria-hidden="true"
            >({{ itemCount }})</span>
          </h2>
          <button
            type="button"
            class="drawer-close"
            aria-label="Cerrar carrito"
            @click="closeDrawer"
          >
            <svg
              aria-hidden="true"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div
          v-if="items.length === 0"
          class="drawer-empty"
          role="status"
        >
          <p>Tu carrito está vacío.</p>
          <button
            type="button"
            class="btn btn-primary"
            @click="closeDrawer"
          >
            Seguir comprando
          </button>
        </div>

        <template v-else>
          <div
            v-if="items.length > 0"
            class="drawer-bulk"
          >
            <label class="bulk-toggle">
              <input
                type="checkbox"
                :checked="allSelected"
                :indeterminate="selectedIds.size > 0 && selectedIds.size < items.length"
                aria-label="Seleccionar todos los productos"
                @change="allSelected = !allSelected"
              >
              <span>Seleccionar todos</span>
            </label>
            <button
              v-if="selectedIds.size > 0"
              type="button"
              class="btn-bulk-delete"
              :aria-label="`Eliminar ${selectedIds.size} producto(s) seleccionados`"
              @click="removeSelected"
            >
              <svg
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Eliminar ({{ selectedIds.size }})
            </button>
          </div>

          <ul
            class="drawer-items"
            aria-label="Productos en el carrito"
          >
            <li
              v-for="item in items"
              :key="item.id"
              class="drawer-item"
              :class="{ 'is-selected': selectedIds.has(item.id) }"
            >
              <label class="item-check">
                <input
                  type="checkbox"
                  :checked="selectedIds.has(item.id)"
                  :aria-label="`Seleccionar ${item.nombre}`"
                  @change="toggleSelected(item.id)"
                >
              </label>

              <div
                class="item-thumb"
                role="img"
                :aria-label="`Imagen de ${item.nombre}`"
                :style="{ backgroundImage: item.imagen ? `url(${item.imagen.replace(/^\.\.\/view\/assets\//, '/')})` : 'none' }"
              />

              <div class="item-details">
                <p class="item-name">
                  {{ item.nombre }}
                </p>
                <p class="item-price">
                  ${{ Number(item.precio || 0).toFixed(2) }}
                </p>
              </div>

              <div
                class="item-qty"
                role="group"
                :aria-label="`Cantidad de ${item.nombre}`"
              >
                <button
                  type="button"
                  class="qty-btn"
                  :aria-label="`Reducir cantidad de ${item.nombre}`"
                  :disabled="item.cantidad <= 1 && false"
                  @click="decreaseQty(item)"
                >
                  <svg
                    aria-hidden="true"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
                <span
                  class="qty-value"
                  aria-live="polite"
                  aria-atomic="true"
                >{{ item.cantidad }}</span>
                <button
                  type="button"
                  class="qty-btn"
                  :aria-label="`Aumentar cantidad de ${item.nombre}`"
                  :disabled="item.cantidad >= item.stock"
                  @click="increaseQty(item)"
                >
                  <svg
                    aria-hidden="true"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>

              <button
                type="button"
                class="item-remove"
                :aria-label="`Eliminar ${item.nombre} del carrito`"
                @click="removeProduct(item.id)"
              >
                <svg
                  aria-hidden="true"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </li>
          </ul>

          <!-- Resumen de totales -->
          <div class="drawer-summary">
            <div class="summary-row">
              <span>Subtotal</span>
              <span>${{ subtotal.toFixed(2) }}</span>
            </div>

            <div class="coupon-section">
              <input
                id="cart-coupon"
                v-model="couponCode"
                type="text"
                maxlength="9"
                placeholder="Ingresa cupón (ej: DEPORTE20)"
                class="coupon-input"
                aria-label="Cupón de descuento"
              >
              <div
                v-if="couponCode.trim() !== '' && couponCode.trim().toUpperCase() !== 'DEPORTE20'"
                class="coupon-error"
              >
                Cupón inválido
              </div>
            </div>

            <div
              v-if="discount > 0"
              class="summary-row discount-row"
            >
              <span>Descuento (20%)</span>
              <span>-${{ discount.toFixed(2) }}</span>
            </div>

            <div class="summary-row iva-row">
              <span>IVA (15%)</span>
              <span>+${{ iva.toFixed(2) }}</span>
            </div>

            <div class="summary-row envio-row">
              <span>Envío</span>
              <span>{{ envio > 0 ? '+$' + envio.toFixed(2) : 'Gratis' }}</span>
            </div>

            <div class="summary-row summary-total">
              <span>Total</span>
              <span>${{ totalConIva.toFixed(2) }}</span>
            </div>
          </div>

          <button
            type="button"
            class="btn btn-primary btn--full"
            :disabled="items.length === 0"
            @click="handleCheckout"
          >
            Ir a Pagar
          </button>
        </template>
      </aside>
    </Transition>

    <dialog
      ref="dialog"
      class="offline-dialog"
      aria-labelledby="offline-dialog-title"
      aria-describedby="offline-dialog-desc"
    >
      <h2 id="offline-dialog-title">
        {{ alertState === 'offline' ? 'Pedido guardado' : '¡Pedido exitoso!' }}
      </h2>
      <p id="offline-dialog-desc">
        <template v-if="alertState === 'offline'">
          No hay conexión a internet. Tu pedido se ha guardado en la cola de tareas pendientes
          y se procesará automáticamente cuando vuelva la conexión.
        </template>
        <template v-else>
          Tu pedido ha sido procesado correctamente y ya se encuentra registrado en nuestro sistema. ¡Gracias por tu compra!
        </template>
      </p>
      <button
        type="button"
        class="btn btn-primary"
        autofocus
        @click="closeAlert(); closeDrawer()"
      >
        Entendido
      </button>
    </dialog>
  </Teleport>
</template>

<style scoped>
.cart-overlay {
  position: fixed;
  inset: 0;
  z-index: 900;
  background: rgba(21, 33, 42, 0.45);
  backdrop-filter: blur(3px);
}

.cart-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(420px, 100vw);
  z-index: 950;
  background: var(--surface);
  border-left: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 32px rgba(21, 33, 42, 0.12);
  outline: none;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.25rem 0.75rem;
  border-bottom: 1px solid var(--line);
  flex-shrink: 0;
}

.drawer-header h2 {
  font-size: 1.3rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.drawer-count {
  font-weight: 300;
  color: var(--muted);
  font-size: 1.1rem;
}

.drawer-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.3rem;
  border-radius: 0.4rem;
  color: var(--ink);
  transition: background 0.15s;
}

.drawer-close:hover {
  background: var(--surface-soft);
}

.drawer-bulk {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--line);
  flex-shrink: 0;
}

.bulk-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  cursor: pointer;
  user-select: none;
}

.bulk-toggle input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--accent);
  cursor: pointer;
}

.btn-bulk-delete {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(185, 28, 28, 0.08);
  color: #b91c1c;
  border: 1px solid rgba(185, 28, 28, 0.2);
  border-radius: 999px;
  padding: 0.35rem 0.8rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-bulk-delete:hover {
  background: rgba(185, 28, 28, 0.16);
}

.drawer-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  color: var(--muted);
}

.drawer-items {
  flex: 1;
  overflow-y: auto;
  list-style: none;
  padding: 0.5rem 0;
}

.drawer-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  transition: background 0.15s;
}

.drawer-item:hover,
.drawer-item.is-selected {
  background: var(--surface-soft);
}

.item-check input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--accent);
  cursor: pointer;
  display: block;
}

.item-thumb {
  width: 52px;
  height: 52px;
  border-radius: 0.6rem;
  background-size: cover;
  background-position: center;
  background-color: var(--surface-soft);
  flex-shrink: 0;
}

.item-details {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-price {
  font-size: 0.82rem;
  color: var(--muted);
  margin-top: 0.15rem;
}

.item-qty {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
  overflow: hidden;
  flex-shrink: 0;
}

.qty-btn {
  background: none;
  border: none;
  padding: 0.3rem 0.45rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: var(--ink);
  transition: background 0.1s;
}

.qty-btn:hover:not(:disabled) {
  background: var(--surface-soft);
}

.qty-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.qty-value {
  min-width: 1.5rem;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 600;
}

.item-remove {
  background: none;
  border: none;
  padding: 0.3rem;
  cursor: pointer;
  color: var(--muted);
  transition: color 0.15s;
  flex-shrink: 0;
}

.item-remove:hover {
  color: #b91c1c;
}

.drawer-summary {
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--line);
  display: grid;
  gap: 0.5rem;
  flex-shrink: 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--muted);
}

.coupon-section {
  margin: 0.25rem 0;
}
.coupon-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
  background: var(--surface-soft);
  color: var(--ink);
  outline: none;
  transition: border-color 0.2s;
}
.coupon-input:focus {
  border-color: var(--accent);
}
.discount-row {
  color: #10b981;
  font-weight: 600;
}
.coupon-error {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  padding-left: 0.25rem;
  font-weight: 500;
}

.iva-row {
  color: var(--muted);
  font-size: 0.85rem;
}

.envio-row {
  color: var(--muted);
  font-size: 0.85rem;
}

.summary-total {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ink);
  border-top: 1px solid var(--line);
  padding-top: 0.5rem;
}

.text-muted {
  color: var(--muted);
}

/* transition */
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.25s ease;
}
.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
}
.drawer-slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.drawer-slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
