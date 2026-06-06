import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  // ── State ─────────────────────────────────────────────────
  const items = ref(loadFromStorage())
  const isOpen = ref(false)

  // ── Getters ───────────────────────────────────────────────
  const totalItems = computed(() =>
    items.value.reduce((acc, item) => acc + item.cantidad, 0)
  )

  const totalPrice = computed(() =>
    items.value.reduce((acc, item) => acc + item.precio * item.cantidad, 0)
  )

  const getProductQty = computed(() => (id) =>
    items.value
      .filter(i => String(i.id) === String(id))
      .reduce((acc, i) => acc + i.cantidad, 0)
  )

  // ── Actions ───────────────────────────────────────────────
  function addItem(product, talla) {
    const cartId = `${product.id}-${talla}`
    const existing = items.value.find(i => i.cartId === cartId)
    const globalQty = getProductQty.value(product.id)
    const stockLeft = Math.max(0, product.stock - globalQty)

    if (stockLeft <= 0) return false

    if (existing) {
      existing.cantidad += 1
    } else {
      items.value.push({ ...product, cartId, cantidad: 1, tallaSeleccionada: talla })
    }
    persist()
    return true
  }

  function increment(cartId, products) {
    const item = items.value.find(i => i.cartId === cartId)
    if (!item) return false
    const product = products.find(p => p.id === item.id)
    const globalQty = getProductQty.value(item.id)
    if (product && globalQty >= product.stock) return false
    item.cantidad += 1
    persist()
    return true
  }

  function decrement(cartId) {
    const item = items.value.find(i => i.cartId === cartId)
    if (!item || item.cantidad <= 1) return false
    item.cantidad -= 1
    persist()
    return true
  }

  function removeItem(cartId) {
    items.value = items.value.filter(i => i.cartId !== cartId)
    persist()
  }

  function removeItems(cartIds) {
    const set = new Set(cartIds)
    items.value = items.value.filter(i => !set.has(i.cartId))
    persist()
  }

  function clearCart() {
    items.value = []
    persist()
  }

  function openCart() { isOpen.value = true }
  function closeCart() { isOpen.value = false }
  function toggleCart() { isOpen.value = !isOpen.value }

  // ── Persistence (localStorage) ────────────────────────────
  function persist() {
    try {
      localStorage.setItem('shopsport_cart_vue', JSON.stringify(items.value))
    } catch (e) {
      console.warn('Could not persist cart:', e)
    }
  }

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem('shopsport_cart_vue')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  return {
    items, isOpen,
    totalItems, totalPrice, getProductQty,
    addItem, increment, decrement, removeItem, removeItems, clearCart,
    openCart, closeCart, toggleCart
  }
})
