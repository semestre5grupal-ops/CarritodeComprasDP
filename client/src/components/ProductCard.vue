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
    :aria-label="`${product.nombre}, $${product.precio?.toFixed(2)}`"
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
        <span class="product-price" aria-label="Precio: ${{ product.precio?.toFixed(2) }}">
          ${{ product.precio?.toFixed(2) }}
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
        :aria-label="`Agregar ${product.nombre} al carrito, $${product.precio?.toFixed(2)}`"
        @click="emit('add-to-cart', product)"
      >
        {{ (product.stock ?? 0) > 0 ? 'Agregar al carrito' : 'Agotado' }}
      </button>
    </div>
  </li>
</template>

<style scoped>
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.product-card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 1.3rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  box-shadow: 0 10px 24px rgba(21, 33, 42, 0.03);
  transition: transform 0.3s ease, box-shadow 0.3s ease, outline 0.1s;
  cursor: pointer;
  list-style: none;
}

.product-card:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 16px 32px rgba(21, 33, 42, 0.08);
}

.product-visual {
  width: 100%;
  aspect-ratio: 4 / 5;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 25% 20%, rgba(255, 255, 255, 0.75), transparent 26%),
    linear-gradient(135deg, var(--tone, #f3efe8), #ffffff 72%);
  display: flex;
  flex-direction: column;
}

.product-visual::after {
  content: "";
  position: absolute;
  inset: auto -18% -28% auto;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--accent-color, #0c4d63) 0%, rgba(255, 255, 255, 0) 72%);
  opacity: 0.45;
  z-index: 0;
  pointer-events: none;
}

.product-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  z-index: 1;
  transition: transform 0.6s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.product-tags {
  display: flex;
  justify-content: space-between;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  padding: 1rem;
  z-index: 2;
  pointer-events: none;
}

.product-badge {
  display: inline-flex;
  width: fit-content;
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  backdrop-filter: blur(4px);
  background: rgba(255, 255, 255, 0.86);
  color: var(--ink);
}

.product-art {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 3rem;
  font-weight: 600;
  letter-spacing: -0.05em;
  color: rgba(21, 33, 42, 0.15);
  z-index: 1;
  position: relative;
}

.product-info {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex-grow: 1;
}

.product-info h3 {
  font-size: 1.1rem;
  font-weight: 500;
  line-height: 1.2;
  margin: 0;
}

.product-info p {
  color: var(--muted);
  line-height: 1.4;
  font-size: 0.9rem;
  margin: 0;
}

.product-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 0.5rem;
  gap: 0.75rem;
}

.product-badges-meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.product-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  background: rgba(97, 168, 184, 0.12);
  color: #1e3a47;
  font-size: 0.8rem;
  font-weight: 600;
}

.product-tag--low {
  background: rgba(209, 58, 58, 0.12);
  color: #b91c1c;
}

.product-price {
  font-weight: 600;
  color: var(--ink);
  font-size: 1.05rem;
  white-space: nowrap;
}

.product-card .btn-primary {
  width: 100%;
  margin-top: 0.5rem;
  font-weight: 500;
}

.product-size-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.25rem;
}

.size-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ink);
  white-space: nowrap;
  flex-shrink: 0;
}

.size-select {
  flex: 1;
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
  background: var(--surface-soft);
  color: var(--ink);
  font-size: 0.85rem;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2366737b' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.6rem center;
  padding-right: 1.8rem;
}

.size-select:focus {
  outline: 3px solid var(--accent-3);
  outline-offset: 2px;
  border-color: var(--accent);
}

.size-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
