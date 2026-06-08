<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '../composables/useCart'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { items, itemCount, subtotal, total, drawerOpen, selectedIds, addProduct, updateQuantity, removeProduct, removeSelected, toggleSelected, closeDrawer, clearCart, submitOrder } = useCart()
const { isAuthenticated } = useAuth()

const overlay = ref(null)
const drawer = ref(null)
const dialog = ref(null)
const offlineAlertOpen = ref(false)
const submitting = ref(false)
const submitError = ref('')

const allSelected = computed({
  get: () => items.value.length > 0 && selectedIds.value.size === items.value.length,
  set: (val) => {
    if (val) {
      selectedIds.value = new Set(items.value.map((i) => i.id))
    } else {
      selectedIds.value = new Set()
    }
  },
})

let previousFocus = null

function handleKeydown(evt) {
  if (!drawerOpen.value) return

  if (evt.key === 'Escape') {
    if (offlineAlertOpen.value) {
      dialog.value?.close()
      offlineAlertOpen.value = false
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
  if (submitting.value) return
  submitting.value = true
  submitError.value = ''
  try {
    if (!isAuthenticated.value) {
      closeDrawer()
      router.push('/login')
      return
    }

    if (!navigator.onLine) {
      await submitOrder(router)
      offlineAlertOpen.value = true
      await nextTick()
      dialog.value?.showModal()
      return
    }

    await submitOrder(router)
    closeDrawer()
  } catch (err) {
    submitError.value = err.message || 'Error al procesar el pedido.'
  } finally {
    submitting.value = false
  }
}

function closeOfflineAlert() {
  dialog.value?.close()
  offlineAlertOpen.value = false
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
        @click="handleOverlayClick"
        aria-hidden="true"
      ></div>
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
            <span class="drawer-count" aria-hidden="true">({{ itemCount }})</span>
          </h2>
          <button
            type="button"
            class="drawer-close"
            @click="closeDrawer"
            aria-label="Cerrar carrito"
          >
            <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </header>

        <div v-if="items.length === 0" class="drawer-empty" role="status">
          <p>Tu carrito está vacío.</p>
          <button type="button" class="btn btn-primary" @click="closeDrawer">
            Seguir comprando
          </button>
        </div>

        <template v-else>
          <div class="drawer-bulk" v-if="items.length > 0">
            <label class="bulk-toggle">
              <input
                type="checkbox"
                :checked="allSelected"
                :indeterminate="selectedIds.size > 0 && selectedIds.size < items.length"
                @change="allSelected = !allSelected"
                aria-label="Seleccionar todos los productos"
              />
              <span>Seleccionar todos</span>
            </label>
            <button
              v-if="selectedIds.size > 0"
              type="button"
              class="btn-bulk-delete"
              @click="removeSelected"
              :aria-label="`Eliminar ${selectedIds.size} producto(s) seleccionados`"
            >
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Eliminar ({{ selectedIds.size }})
            </button>
          </div>

          <ul class="drawer-items" aria-label="Productos en el carrito">
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
                  @change="toggleSelected(item.id)"
                  :aria-label="`Seleccionar ${item.nombre}`"
                />
              </label>

              <div
                class="item-thumb"
                role="img"
                :aria-label="`Imagen de ${item.nombre}`"
                :style="{ backgroundImage: item.imagen ? `url(${item.imagen.replace(/^\.\.\/view\/assets\//, '/')})` : 'none' }"
              ></div>

              <div class="item-details">
                <p class="item-name">{{ item.nombre }}</p>
                <p class="item-price">${{ item.precio?.toFixed(2) }}</p>
              </div>

              <div class="item-qty" role="group" :aria-label="`Cantidad de ${item.nombre}`">
                <button
                  type="button"
                  class="qty-btn"
                  @click="decreaseQty(item)"
                  :aria-label="`Reducir cantidad de ${item.nombre}`"
                  :disabled="item.cantidad <= 1 && false"
                >
                  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
                <span class="qty-value" aria-live="polite" aria-atomic="true">{{ item.cantidad }}</span>
                <button
                  type="button"
                  class="qty-btn"
                  @click="increaseQty(item)"
                  :aria-label="`Aumentar cantidad de ${item.nombre}`"
                  :disabled="item.cantidad >= item.stock"
                >
                  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </div>

              <button
                type="button"
                class="item-remove"
                @click="removeProduct(item.id)"
                :aria-label="`Eliminar ${item.nombre} del carrito`"
              >
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </li>
          </ul>

          <div class="drawer-summary">
            <div class="summary-row">
              <span>Subtotal</span>
              <span>${{ subtotal.toFixed(2) }}</span>
            </div>
            <div class="summary-row summary-total">
              <span>Total</span>
              <span>${{ total.toFixed(2) }}</span>
            </div>
          </div>

          <div
            v-if="submitError"
            class="form-alert form-alert--error"
            role="alert"
            aria-live="assertive"
          >
            {{ submitError }}
          </div>

          <button
            type="button"
            class="btn btn-primary btn--full"
            :disabled="submitting || items.length === 0"
            @click="handleCheckout"
          >
            {{ submitting ? 'Procesando...' : 'Completar pedido' }}
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
      <h2 id="offline-dialog-title">Pedido guardado</h2>
      <p id="offline-dialog-desc">
        No hay conexión a internet. Tu pedido se ha guardado en la cola de tareas pendientes
        y se procesará automáticamente cuando vuelva la conexión.
      </p>
        <button type="button" class="btn btn-primary" @click="closeOfflineAlert(); closeDrawer()" autofocus>
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

.summary-total {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ink);
  border-top: 1px solid var(--line);
  padding-top: 0.5rem;
}

.drawer-summary + .btn--full,
.form-alert + .btn--full {
  margin: 0 1.25rem 1rem;
  width: auto;
}

.drawer-summary + .form-alert {
  margin: 0 1.25rem;
}

.offline-dialog {
  border: 1px solid var(--line);
  border-radius: 1.3rem;
  padding: 2rem;
  max-width: 420px;
  width: calc(100% - 2rem);
  background: var(--surface);
  box-shadow: var(--shadow);
}

.offline-dialog::backdrop {
  background: rgba(21, 33, 42, 0.5);
  backdrop-filter: blur(3px);
}

.offline-dialog h2 {
  font-size: 1.3rem;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.offline-dialog p {
  color: var(--muted);
  line-height: 1.6;
  margin-bottom: 1.25rem;
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
