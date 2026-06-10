<script setup>
import { computed } from 'vue'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['add-to-cart'])

const imageSrc = computed(() => {
  if (!props.product.imagen) return null
  return props.product.imagen.replace(/^\.\.\/view\/assets\//, '/')
})
</script>

<template>
  <li
    class="product-card"
    role="article"
    :aria-label="`${product.nombre}, $${Number(product.precio || 0).toFixed(2)}`"
    tabindex="0"
  >
    <div
      class="product-visual"
      :style="{ '--tone': product.tone || '#f3efe8', '--accent-color': product.accent || '#0c4d63' }"
    >
      <div v-if="product.categoria" class="product-tags">
        <span class="product-badge">{{ product.categoria }}</span>
      </div>
      <img
        v-if="imageSrc"
        :src="imageSrc"
        :alt="`${product.nombre} — imagen del producto`"
        class="product-image"
        loading="lazy"
        aria-hidden="true"
      />
      <div v-else class="product-art" aria-hidden="true">
        {{ product.nombre.charAt(0) }}
      </div>
    </div>

    <div class="product-info">
      <h3>{{ product.nombre }}</h3>
      <p v-if="product.descripcion">{{ product.descripcion }}</p>

      <div class="product-meta">
        <div class="product-badges-meta">
          <span class="product-tag" v-if="product.categoria">{{ product.categoria }}</span>
          <span
            class="product-tag"
            :class="{ 'product-tag--low': product.stock <= 5 }"
            v-if="product.stock !== undefined"
            :aria-label="`Stock: ${product.stock} unidades disponibles`"
          >
            {{ product.stock > 0 ? `${product.stock} uds` : 'Agotado' }}
          </span>
        </div>
        <span class="product-price" aria-label="Precio: ${{ Number(product.precio || 0).toFixed(2) }}">
          ${{ Number(product.precio || 0).toFixed(2) }}
        </span>
      </div>

      <div class="product-size-row" v-if="product.talla">
        <label :for="`size-${product.id}`" class="size-label">Talla:</label>
        <select
          :id="`size-${product.id}`"
          class="size-select"
          :disabled="(product.stock ?? 0) <= 0"
          :aria-label="`Seleccionar talla para ${product.nombre}`"
        >
          <option
            v-for="t in product.talla.split(' - ')"
            :key="t"
            :value="t"
          >{{ t }}</option>
        </select>
      </div>

      <button
        type="button"
        class="btn btn-primary"
        :disabled="(product.stock ?? 0) <= 0"
        :aria-label="`Agregar ${product.nombre} al carrito, $${Number(product.precio || 0).toFixed(2)}`"
        @click="emit('add-to-cart', product)"
      >
        {{ (product.stock ?? 0) > 0 ? 'Agregar al carrito' : 'Agotado' }}
      </button>
    </div>
  </li>
</template>
