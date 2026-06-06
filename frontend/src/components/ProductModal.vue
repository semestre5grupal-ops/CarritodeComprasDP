<template>
  <Teleport to="body">
    <div
      v-if="modal.activeProduct.value"
      id="product-detail-overlay"
      class="product-detail-overlay"
      :class="{ show: modal.activeProduct.value }"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-p-title"
      @click.self="modal.close()"
      @keydown.escape="modal.close()"
    >
      <div class="product-detail-modal" id="product-detail-modal" ref="boxRef">
          <button class="modal-close-btn" id="modal-close-btn" aria-label="Cerrar detalle de producto" @click="modal.close()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
          </button>
          
          <div class="detail-visual">
              <img v-if="product.imagen" :src="product.imagen" :alt="product.nombre" id="modal-p-img">
              <div v-else style="font-size: 3rem; opacity: 0.5;">{{ product.abreviatura }}</div>
          </div>
          
          <div class="detail-content">
              <span class="detail-tagline" id="modal-p-category">{{ product.categoria }}</span>
              <h2 class="detail-title" id="modal-p-title">{{ product.nombre }}</h2>
              <p class="detail-price" id="modal-p-price">${{ product.precio.toFixed(2) }}</p>
              
              <p class="detail-description" id="modal-p-desc">
                  {{ product.descripcion }}
              </p>
              
              <div class="product-size-row" style="margin-top: 1rem; margin-bottom: 1.5rem;">
                  <label for="modal-size-select" class="size-label">Talla:</label>
                  <select id="modal-size-select" class="size-select" aria-label="Seleccionar talla" v-model="selectedSize" :disabled="stockLeft <= 0">
                      <option v-for="size in sizes" :key="size" :value="size">{{ size }}</option>
                  </select>
              </div>
              
              <div class="detail-actions">
                  <button class="btn btn-primary" id="modal-p-add-btn" :disabled="stockLeft <= 0 || !selectedSize" @click="addToCart">
                      {{ stockLeft <= 0 ? 'Agotado' : 'Añadir al Carrito' }}
                  </button>
              </div>
          </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useModal }     from '../composables/useModal.js'
import { useCartStore } from '../store/cart.js'

const modal        = useModal()
const cartStore    = useCartStore()
const selectedSize = ref('')
const boxRef       = ref(null)

const product = computed(() => modal.activeProduct.value || {})

const SIZE_ORDER = ['XS','S','M','L','XL','XXL']
const sizes = computed(() => {
  const t = product.value?.talla || ''
  const parts = t.split(' - ')
  const start = SIZE_ORDER.indexOf(parts[0]?.trim().toUpperCase())
  const end   = SIZE_ORDER.indexOf(parts[1]?.trim().toUpperCase())
  if (start === -1) return [t]
  return SIZE_ORDER.slice(start, end !== -1 ? end + 1 : start + 1)
})

const reserved  = computed(() => cartStore.getProductQty(product.value?.id))
const stockLeft = computed(() => Math.max(0, (product.value?.stock || 0) - reserved.value))

watch(() => modal.activeProduct.value, async (p) => {
  if (p && sizes.value.length > 0) {
    selectedSize.value = sizes.value[0]
    await nextTick()
    boxRef.value?.querySelector('#modal-close-btn')?.focus()
  }
})

function addToCart() {
  if (!selectedSize.value) return
  const ok = cartStore.addItem(product.value, selectedSize.value)
  if (ok) {
    alert(`Agregaste exitosamente ${product.value.nombre} al carrito`)
    cartStore.openCart()
    modal.close()
  } else {
    alert('Stock insuficiente: No se puede agregar más unidades de este producto.')
  }
}
</script>
