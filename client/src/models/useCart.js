import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'
import { addToQueue } from '../services/db'
import { useAuth } from './useAuth'

const CART_KEY = 'shopsport_cart'
const CART_TS_KEY = 'shopsport_cart_ts'

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
  sessionStorage.setItem(CART_TS_KEY, Date.now().toString())
}

const drawerOpen = ref(false)
const selectedIds = ref(new Set())

const items = ref(loadCart())
const itemCount = computed(() => items.value.reduce((sum, i) => sum + i.cantidad, 0))
const subtotal = computed(() => items.value.reduce((sum, i) => sum + i.precio * i.cantidad, 0))
const total = computed(() => Math.round(subtotal.value * 100) / 100)

function addProduct(product, cantidad = 1) {
  const existing = items.value.find((i) => i.id === product.id)
  if (existing) {
    existing.cantidad += cantidad
  } else {
    items.value.push({
      id: product.id,
      nombre: product.nombre,
      precio: product.precio,
      imagen: product.imagen,
      categoria: product.categoria,
      stock: product.stock,
      cantidad,
    })
  }
  saveCart(items.value)
}

function updateQuantity(productId, cantidad) {
  const item = items.value.find((i) => i.id === productId)
  if (item) {
    if (cantidad <= 0) {
      removeProduct(productId)
      return
    }
    item.cantidad = Math.min(cantidad, item.stock)
    saveCart(items.value)
  }
}

function removeProduct(productId) {
  items.value = items.value.filter((i) => i.id !== productId)
  selectedIds.value.delete(productId)
  saveCart(items.value)
}

function removeSelected() {
  const ids = [...selectedIds.value]
  items.value = items.value.filter((i) => !ids.includes(i.id))
  selectedIds.value = new Set()
  saveCart(items.value)
}

function toggleSelected(productId) {
  const next = new Set(selectedIds.value)
  if (next.has(productId)) {
    next.delete(productId)
  } else {
    next.add(productId)
  }
  selectedIds.value = next
}

function clearCart() {
  items.value = []
  selectedIds.value = new Set()
  saveCart(items.value)
}

function openDrawer() { drawerOpen.value = true }
function closeDrawer() { drawerOpen.value = false }

import OrderController from '../controllers/OrderController'

async function submitOrder(router) {
  const { isAuthenticated: authState } = useAuth()
  if (!authState.value) {
    router.push('/login')
    return { redirected: true }
  }

  const detalles = items.value.map((i) => ({
    productoId: i.id,
    cantidad: i.cantidad,
    precioUnitario: i.precio,
  }))

  if (navigator.onLine) {
    const data = await OrderController.create({ detalles })
    clearCart()
    return data
  }

  await addToQueue({ detalles })
  clearCart()
  return { offline: true }
}

export function useCart() {
  return {
    items,
    itemCount,
    subtotal,
    total,
    drawerOpen,
    selectedIds,
    addProduct,
    updateQuantity,
    removeProduct,
    removeSelected,
    toggleSelected,
    clearCart,
    openDrawer,
    closeDrawer,
    submitOrder,
  }
}
