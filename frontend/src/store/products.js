import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useProductsStore = defineStore('products', () => {
  const products = ref([])
  const loading  = ref(false)
  const error    = ref(null)

  async function fetchProducts() {
    loading.value = true
    error.value   = null
    try {
      const res  = await fetch('/api/products')
      const json = await res.json()
      if (!json.success) throw new Error(json.message)
      products.value = json.data
    } catch (e) {
      console.error('fetchProducts error:', e)
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  /** Decrement stock locally after a successful checkout (optimistic update) */
  function applyCheckout(cartItems) {
    for (const item of cartItems) {
      const p = products.value.find(p => p.id === item.id)
      if (p) p.stock = Math.max(0, p.stock - item.cantidad)
    }
  }

  function getById(id) {
    return products.value.find(p => p.id === id) || null
  }

  return { products, loading, error, fetchProducts, applyCheckout, getById }
})
