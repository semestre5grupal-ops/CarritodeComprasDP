<template>
  <li class="product-card" role="button" tabindex="0" :data-id="product.id"
      :aria-labelledby="`producto-${product.id}-nombre`"
      :aria-describedby="`producto-${product.id}-descripcion producto-${product.id}-precio producto-${product.id}-talla`"
      @click="modal.open(product)"
      @keydown.enter.space.prevent="modal.open(product)">
      <div class="product-visual" :style="{ '--tone': product.tone, '--accent': product.accent }">
          <img v-if="product.imagen" :src="product.imagen" :alt="product.nombre" class="product-image" loading="lazy">
          <div v-else class="product-art" aria-hidden="true">{{ product.abreviatura }}</div>
          <div class="product-tags">
              <span class="product-badge">{{ product.destacado }}</span>
              <span class="product-category">{{ product.categoria }}</span>
          </div>
      </div>
      <div class="product-info">
          <h3 :id="`producto-${product.id}-nombre`">{{ product.nombre }}</h3>
          <p :id="`producto-${product.id}-descripcion`">{{ product.descripcion }}</p>
          <div class="product-meta">
              <p :id="`producto-${product.id}-precio`" class="product-price">${{ product.precio.toFixed(2) }}</p>
              <div class="product-badges-meta">
                  <span class="product-tag">{{ stockText }}</span>
                  <span v-if="stockLeft > 0 && stockLeft <= 5" class="product-stock product-stock-low" aria-live="polite">Pocas unidades</span>
              </div>
          </div>
      </div>
  </li>
</template>

<script setup>
import { computed } from 'vue'
import { useCartStore } from '../store/cart.js'
import { useModal }     from '../composables/useModal.js'

const props = defineProps({ product: { type: Object, required: true } })
const cart  = useCartStore()
const modal = useModal()

const reserved  = computed(() => cart.getProductQty(props.product.id))
const stockLeft = computed(() => Math.max(0, props.product.stock - reserved.value))

const stockText = computed(() => {
  if (stockLeft.value === 0) return 'Agotado'
  if (stockLeft.value === 1) return 'Última unidad'
  return `Disponibles: ${stockLeft.value}`
})
</script>
