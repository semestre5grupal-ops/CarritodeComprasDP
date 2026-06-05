<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'
import ProductCard from '../components/ProductCard.vue'
import { useCart } from '../composables/useCart'

const { addProduct } = useCart()

const productos = ref([])
const loading = ref(true)
const error = ref(null)
const activeCategory = ref(null)

const categorias = computed(() => {
  const cats = [...new Set(productos.value.map((p) => p.categoria).filter(Boolean))]
  return cats.sort()
})

const filtered = computed(() => {
  if (!activeCategory.value) return productos.value
  return productos.value.filter((p) => p.categoria === activeCategory.value)
})

async function loadProducts() {
  loading.value = true
  error.value = null
  try {
    const params = activeCategory.value ? `?categoria=${encodeURIComponent(activeCategory.value)}` : ''
    const data = await api.get(`/productos${params}`)
    productos.value = data.data || []
  } catch (err) {
    error.value = err.message || 'Error al cargar productos'
    productos.value = []
  } finally {
    loading.value = false
  }
}

function filterByCategory(categoria) {
  activeCategory.value = activeCategory.value === categoria ? null : categoria
  loadProducts()
}

function handleAddToCart(product) {
  addProduct(product, 1)
}

onMounted(() => {
  loadProducts()
})
</script>

<template>
  <section class="catalog-section wrap-wide" aria-labelledby="catalog-title" aria-live="polite">
    <div class="section-heading">
      <h2 id="catalog-title">Catálogo</h2>
      <p>Prendas deportivas seleccionadas para una tienda limpia, ordenada y fácil de navegar.</p>
    </div>

    <div
      v-if="categorias.length > 0"
      class="category-filters"
      role="group"
      aria-label="Filtrar por categoría"
    >
      <button
        v-for="cat in categorias"
        :key="cat"
        type="button"
        class="collection-chip"
        :class="{ active: activeCategory === cat }"
        :aria-pressed="activeCategory === cat ? 'true' : 'false'"
        @click="filterByCategory(cat)"
      >
        {{ cat }}
      </button>
    </div>

    <div v-if="loading" class="loading" role="status" aria-live="polite">
      <div class="spinner" aria-hidden="true"></div>
      <p>Cargando productos...</p>
    </div>

    <div
      v-else-if="error"
      class="error-message"
      role="alert"
      aria-live="assertive"
    >
      <p>{{ error }}</p>
      <button type="button" class="btn btn-primary" @click="loadProducts">
        Reintentar
      </button>
    </div>

    <p
      v-else-if="filtered.length === 0 && !loading"
      class="empty-message"
      role="status"
    >
      No se encontraron productos{{ activeCategory ? ` en la categoría "${activeCategory}"` : '' }}.
    </p>

    <ul
      v-else
      class="product-grid"
      aria-label="Listado de productos"
    >
      <ProductCard
        v-for="product in filtered"
        :key="product.id"
        :product="product"
        @add-to-cart="handleAddToCart"
      />
    </ul>
  </section>
</template>

<style scoped>
.catalog-section {
  margin-top: 1.2rem;
}

.category-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  margin-bottom: 1.5rem;
}

.collection-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.8rem 1rem;
  border-radius: 999px;
  border: 2px solid transparent;
  background: var(--ink);
  color: #fff;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-size: 0.72rem;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, transform 0.15s;
}

.collection-chip:hover {
  transform: translateY(-1px);
}

.collection-chip.active,
.collection-chip[aria-pressed="true"] {
  background: var(--accent);
  border-color: var(--accent);
}

.collection-chip:focus-visible {
  outline: 3px solid var(--accent-3);
  outline-offset: 3px;
}

.loading {
  grid-column: 1 / -1;
  padding: 2rem;
  text-align: center;
  color: var(--muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--line);
  border-top: 4px solid var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.error-message {
  text-align: center;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: var(--muted);
}

.empty-message {
  text-align: center;
  padding: 2rem;
  color: var(--muted);
}

@media (min-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}
</style>
