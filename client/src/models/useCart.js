import { ref, computed } from 'vue'
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
const couponCode = ref('')
const discount = computed(() => {
  if (couponCode.value.trim().toUpperCase() === 'DEPORTE20') {
    return Math.round(subtotal.value * 0.2 * 100) / 100
  }
  return 0
})
const deliveryMethod = ref('delivery') // 'delivery' | 'pickup'
const ENVIO_COSTO = 2.50

const itemCount = computed(() => items.value.reduce((sum, i) => sum + i.cantidad, 0))
const subtotal = computed(() => items.value.reduce((sum, i) => sum + i.precio * i.cantidad, 0))
const total = computed(() => Math.round((subtotal.value - discount.value) * 100) / 100)
const iva = computed(() => Math.round(total.value * 0.15 * 100) / 100)
const envio = computed(() => deliveryMethod.value === 'pickup' ? 0 : ENVIO_COSTO)
const totalConIva = computed(() => Math.round((total.value + iva.value + envio.value) * 100) / 100)

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
  couponCode.value = ''
  saveCart(items.value)
}

function openDrawer() { drawerOpen.value = true }
function closeDrawer() { drawerOpen.value = false }

import OrderController from '../controllers/OrderController'

async function submitOrder(router, clienteDatos) {
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
    const data = await OrderController.create({ detalles, clienteDatos, cupon: couponCode.value })
    clearCart()
    window.dispatchEvent(new Event('order-completed'))
    return data
  }

  await addToQueue({ detalles, clienteDatos, cupon: couponCode.value })
  clearCart()
  window.dispatchEvent(new Event('order-completed'))
  return { offline: true }
}

export function useCart() {
  return {
    items,
    itemCount,
    subtotal,
    discount,
    total,
    iva,
    envio,
    totalConIva,
    deliveryMethod,
    couponCode,
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
