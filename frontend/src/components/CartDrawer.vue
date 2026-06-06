<template>
  <!-- Overlay -->
  <div
    id="cart-overlay"
    class="cart-overlay"
    :class="{ 'hidden': !cartStore.isOpen }"
    aria-hidden="true"
    @click="cartStore.closeCart()"
    style="display: block;"
    v-show="cartStore.isOpen"
  ></div>

  <!-- Drawer -->
  <aside
    id="cart-drawer"
    class="cart-drawer"
    :class="{ 'open': cartStore.isOpen }"
    aria-hidden="true"
    aria-modal="true"
    role="dialog"
    aria-label="Tu carrito de compras"
    aria-live="polite"
  >
    <div class="cart-header">
        <h2>Tu Carrito</h2>
        <button type="button" id="btn-close-cart" class="btn-close-cart" aria-label="Cerrar carrito" @click="cartStore.closeCart()">
            <svg aria-hidden="true" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    </div>

    <div class="cart-bulk-actions">
        <label for="select-all-cart">
            <input type="checkbox" id="select-all-cart" aria-label="Seleccionar todos los productos del carrito" :disabled="cartStore.items.length === 0" @change="toggleSelectAll($event)">
            Seleccionar todos
        </label>
        <button type="button" id="btn-delete-bulk" class="btn-delete-bulk" :disabled="selectedItems.length === 0"
            aria-label="Eliminar productos seleccionados" @click="deleteSelected()">
            Eliminar items
        </button>
    </div>

    <div id="cart-items-container" class="cart-items-container" aria-live="polite" aria-atomic="false">
        <div v-if="cartStore.items.length === 0" class="cart-empty-msg">
            <svg aria-hidden="true" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <p>Tu carrito está vacío.</p>
        </div>

        <ul v-else style="list-style: none; padding: 0; margin: 0;">
            <li v-for="item in cartStore.items" :key="item.cartId" class="cart-item">
                <input type="checkbox" class="cart-item-checkbox" :value="item.cartId" v-model="selectedItems" :aria-label="`Seleccionar ${item.nombre}`">
                <img :src="item.imagen" :alt="item.nombre" class="cart-item-img">
                <div class="cart-item-details">
                    <p class="cart-item-cat">{{ item.categoria }}</p>
                    <h3 class="cart-item-title">{{ item.nombre }}</h3>
                    <p class="cart-item-size">Talla: {{ item.tallaSeleccionada }}</p>
                    <p class="cart-item-price">${{ item.precio.toFixed(2) }}</p>
                    <div class="cart-item-controls">
                        <button type="button" class="btn-qty" @click="handleDecrement(item)" :aria-label="`Disminuir cantidad de ${item.nombre}`">-</button>
                        <span class="qty-display" aria-live="polite">{{ item.cantidad }}</span>
                        <button type="button" class="btn-qty" @click="handleIncrement(item)" :aria-label="`Aumentar cantidad de ${item.nombre}`">+</button>
                    </div>
                </div>
                <button type="button" class="btn-remove" @click="confirmDelete(item)" :aria-label="`Eliminar ${item.nombre} del carrito`">
                    <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"></path></svg>
                </button>
            </li>
        </ul>
    </div>

    <div class="cart-footer">
        <div class="cart-totals">
            <span>Total estimado:</span>
            <span id="cart-total-price" aria-live="polite" aria-atomic="true">${{ cartStore.totalPrice.toFixed(2) }}</span>
        </div>
        <p id="cart-last-update" aria-live="polite" class="cart-item-cat"
            style="display: none; text-align: center; margin-bottom: 0.8rem;"></p>
        <button type="button" id="btn-submit" class="btn btn-primary w-100" aria-label="Proceder al pago" @click="handleCheckout" :disabled="cartStore.items.length === 0 || checkingOut">
            {{ checkingOut ? 'Procesando...' : 'Completar pedido' }}
        </button>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { useCartStore }     from '../store/cart.js'
import { useProductsStore } from '../store/products.js'

const cartStore     = useCartStore()
const productsStore = useProductsStore()
const checkingOut   = ref(false)
const selectedItems = ref([])

function toggleSelectAll(event) {
  if (event.target.checked) {
    selectedItems.value = cartStore.items.map(i => i.cartId)
  } else {
    selectedItems.value = []
  }
}

function deleteSelected() {
  if (confirm('¿Eliminar los productos seleccionados?')) {
    cartStore.removeItems(selectedItems.value)
    selectedItems.value = []
  }
}

function confirmDelete(item) {
  if (confirm(`¿Desea eliminar ${item.nombre} del carrito?`)) {
    cartStore.removeItem(item.cartId)
    selectedItems.value = selectedItems.value.filter(id => id !== item.cartId)
  }
}

function handleIncrement(item) {
  const ok = cartStore.increment(item.cartId, productsStore.products)
  if (!ok) alert('Stock máximo alcanzado para este producto.')
}

function handleDecrement(item) {
  const ok = cartStore.decrement(item.cartId)
  if (!ok) {
    confirmDelete(item)
  }
}

async function handleCheckout() {
  const items = cartStore.items
  if (items.length === 0) return

  checkingOut.value = true
  try {
    if (!navigator.onLine) {
      productsStore.applyCheckout(items)
      cartStore.clearCart()
      cartStore.closeCart()
      alert('Sin conexión. Tu pedido se guardó localmente.')
      return
    }

    const res  = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    })
    const json = await res.json()

    if (json.success) {
      productsStore.applyCheckout(items)
      cartStore.clearCart()
      cartStore.closeCart()
      alert('¡Pedido completado con éxito! Gracias por tu compra.')
    } else {
      const msg = json.errors ? json.errors.join('\n') : json.message
      alert(`Error al procesar el pedido:\n${msg}`)
    }
  } catch (e) {
    console.error('Checkout error:', e)
    alert('Error de conexión. Intenta nuevamente.')
  } finally {
    checkingOut.value = false
  }
}
</script>
