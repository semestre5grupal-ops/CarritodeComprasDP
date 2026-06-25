<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import ProductController from '../controllers/ProductController'
import ProductCard from '../components/ProductCard.vue'
import AIChatbot from '../components/AIChatbot.vue'
import { useCart } from '../models/useCart'

const { addProduct, openDrawer } = useCart()

const productos = ref([])
const loading = ref(true)
const error = ref(null)

const mobileFiltersOpen = ref(false)
const SESSION_KEY = 'shopsport_catalog_filters'
const filters = reactive(loadFilters())

function loadFilters() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : defaultFilters()
  } catch { return defaultFilters() }
}
function defaultFilters() {
  return { categorias: [], tallas: [], colores: [], precios: [] }
}
function resetFilters() {
  Object.assign(filters, defaultFilters())
  sessionStorage.removeItem(SESSION_KEY)
  mobileFiltersOpen.value = false // Auto-close on clear
}

watch(filters, () => {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(filters))
}, { deep: true })

// Lock body scroll when mobile filters are open
watch(mobileFiltersOpen, (isOpen) => {
  if (isOpen) {
    document.body.classList.add('mobile-filters-open')
  } else {
    document.body.classList.remove('mobile-filters-open')
  }
})

const priceRanges = [
  { label: '$0 - $20',   min: 0,   max: 20, value: '0-20'  },
  { label: '$20 - $50',  min: 20,  max: 50, value: '20-50'  },
  { label: '$50+',       min: 50,  max: Infinity, value: '50+' }
]

const categorias = computed(() => [...new Set(productos.value.map(p => p.categoria))].filter(Boolean).sort())
const colors = computed(() => [...new Set(productos.value.map(p => p.color))].filter(Boolean).sort())
const sizes = computed(() => [...new Set(productos.value.map(p => p.talla))].filter(Boolean).sort())

function getColorSwatchStyle(c) {
    const map = {
        'Negro': { bg: '#000000', border: 'none' },
        'Blanco': { bg: '#ffffff', border: '1px solid #ccc' },
        'Azul': { bg: '#1a365d', border: 'none' },
        'Gris': { bg: '#a0aec0', border: 'none' }
    }
    const colorStyle = map[c] || { bg: c.toLowerCase(), border: 'none' }
    return `background-color: ${colorStyle.bg}; ${colorStyle.border !== 'none' ? `border: ${colorStyle.border};` : ''}`
}

async function loadProducts() {
  loading.value = true
  error.value = null
  try {
    const data = await ProductController.getAll()
    productos.value = data || []
  } catch (err) {
    error.value = err.message || 'Error al cargar productos'
    productos.value = []
  } finally {
    loading.value = false
  }
}

const filtered = computed(() => {
  let list = productos.value

  if (filters.categorias && filters.categorias.length) {
    list = list.filter(p => filters.categorias.includes(p.categoria))
  }
  if (filters.tallas && filters.tallas.length) {
    list = list.filter(p => filters.tallas.includes(p.talla))
  }
  if (filters.colores && filters.colores.length) {
    list = list.filter(p => filters.colores.includes(p.color))
  }
  if (filters.precios && filters.precios.length) {
    list = list.filter(p => {
      const pprecio = Number(p.precio)
      return filters.precios.some(r => pprecio >= r.min && pprecio < r.max)
    })
  }

  return list
})

const groupedProducts = computed(() => {
  const groups = {}
  filtered.value.forEach(p => {
    const cat = p.categoria || 'Otros'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(p)
  })
  
  // Sort categories alphabetically or keeping a fixed order if preferred
  // We'll just return the object, Vue iterates it reasonably well
  return groups
})

function handleAddToCart(product) {
  addProduct(product, 1)
  openDrawer()
}

function scrollCarousel(event, direction) {
  const row = event.target.closest('.mobile-category-row')
  if (!row) return
  const carousel = row.querySelector('.mobile-carousel')
  if (carousel) {
    const scrollAmount = 240 + 16 // card width + gap
    carousel.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' })
  }
}

onMounted(() => {
  loadProducts()
  window.addEventListener('order-completed', loadProducts)
})

onUnmounted(() => {
  window.removeEventListener('order-completed', loadProducts)
})
</script>

<template>
  <main id="contenido" aria-label="Contenido principal">

    <!-- Encabezado de página -->
    <section class="wrap-wide catalog-page-header" aria-labelledby="page-title">
        <h2 id="page-title">Catálogo Completo</h2>
        <p>Explora toda nuestra colección de ropa deportiva con filtros personalizados</p>
    </section>

    <button type="button" id="mobile-filter-open" class="mobile-filter-open-btn" :aria-expanded="mobileFiltersOpen" aria-controls="filter-panel" aria-label="Abrir menú de filtros" @click="mobileFiltersOpen = true">
        Filtros
        <span aria-hidden="true">☰</span>
    </button>

    <!-- Catálogo con filtros -->
    <section class="wrap-wide" aria-labelledby="catalog-label">
        <h2 id="catalog-label" class="sr-only">Catálogo de productos con filtros</h2>
        <div class="catalog-container">

            <!-- Sidebar de Filtros -->
            <aside class="filters-sidebar" :class="{ 'expanded': mobileFiltersOpen }" aria-label="Panel de filtros de búsqueda" aria-describedby="filter-hint">
                <p id="filter-hint" class="sr-only">Usa los filtros para refinar los productos. Los cambios se aplican automáticamente.</p>
                <div class="filter-header">
                    <h3>Filtrar Por</h3>
                    <button type="button" class="filter-toggle-btn" aria-expanded="false" aria-controls="filter-panel" @click="mobileFiltersOpen = false">
                        Cerrar
                        <span class="toggle-icon" aria-hidden="true">×</span>
                    </button>
                </div>
                <div class="filter-panel" id="filter-panel" :class="{ 'collapsed': !mobileFiltersOpen }">
                
                <!-- Categoría -->
                <fieldset class="filter-group">
                    <legend class="filter-legend">Categoría</legend>
                    <div class="filter-options">
                        <div class="filter-option" v-for="c in categorias" :key="c">
                            <input type="checkbox" :id="`filter-cat-${c}`" class="gender-filter" :value="c" v-model="filters.categorias">
                            <label :for="`filter-cat-${c}`">{{ c }}</label>
                        </div>
                    </div>
                </fieldset>

                <!-- Talla -->
                <fieldset class="filter-group">
                    <legend class="filter-legend">Talla</legend>
                    <div class="filter-options">
                        <div class="filter-option" v-for="s in sizes" :key="s">
                            <input type="checkbox" :id="`filter-talla-${s}`" class="size-filter" :value="s" v-model="filters.tallas">
                            <label :for="`filter-talla-${s}`">{{ s }}</label>
                        </div>
                    </div>
                </fieldset>

                <!-- Color -->
                <fieldset class="filter-group">
                    <legend class="filter-legend">Color</legend>
                    <div class="filter-options color-list">
                        <div class="filter-option" v-for="c in colors" :key="c">
                            <input type="checkbox" :id="`filter-color-${c}`" class="color-filter" :value="c" v-model="filters.colores">
                            <label :for="`filter-color-${c}`">
                                <span class="color-swatch" :style="getColorSwatchStyle(c)" aria-hidden="true"></span> {{ c }}
                            </label>
                        </div>
                    </div>
                </fieldset>

                <!-- Precio -->
                <fieldset class="filter-group">
                    <legend class="filter-legend">Precio</legend>
                    <div class="filter-options">
                        <div class="filter-option" v-for="p in priceRanges" :key="p.label">
                            <input type="checkbox" :id="`filter-precio-${p.value}`" class="price-filter" :value="p" v-model="filters.precios">
                            <label :for="`filter-precio-${p.value}`">{{ p.label }}</label>
                        </div>
                    </div>
                </fieldset>

                <button type="button" class="btn-clear-filters" aria-label="Limpiar todos los filtros seleccionados" @click="resetFilters">Limpiar filtros</button>
                </div>
            </aside>

            <div class="mobile-filter-backdrop" id="mobile-filter-backdrop" :aria-hidden="!mobileFiltersOpen" :class="{'visible': mobileFiltersOpen}" @click="mobileFiltersOpen = false"></div>

            <!-- Contenedor de Productos -->
            <div class="product-grid-container">
                <div class="filter-info" role="status" aria-live="polite" aria-atomic="true">
                    <p id="filter-count">Mostrando {{ filtered.length }} productos</p>
                </div>

                <!-- Desktop Grid (hidden on mobile) -->
                <ul id="product-grid" class="product-grid desktop-only" aria-label="Catálogo de productos" :aria-busy="loading" aria-live="polite">
                    <li v-if="loading" class="loading">
                      <div class="spinner" aria-hidden="true"></div>
                      <p>Cargando productos...</p>
                    </li>
                    <li v-else-if="error" class="error-message">Error: {{ error }}</li>
                    <li v-else-if="filtered.length === 0" style="grid-column: 1/-1; text-align: center; padding: 2rem;">No se encontraron productos con estos filtros.</li>
                    <ProductCard v-else v-for="p in filtered" :key="p.id" :product="p" @add-to-cart="handleAddToCart" />
                </ul>

                <!-- Mobile Carousels (hidden on desktop) -->
                <div class="mobile-only categories-container" aria-label="Catálogo agrupado por categoría">
                    <div v-if="loading" class="loading">
                      <div class="spinner" aria-hidden="true"></div>
                      <p>Cargando productos...</p>
                    </div>
                    <div v-else-if="error" class="error-message">Error: {{ error }}</div>
                    <div v-else-if="filtered.length === 0" style="text-align: center; padding: 2rem;">No se encontraron productos con estos filtros.</div>
                    
                    <div v-else v-for="(prods, cat) in groupedProducts" :key="cat" class="mobile-category-row">
                        <div class="mobile-category-header">
                            <h3 class="mobile-category-title">{{ cat }}</h3>
                            <div class="mobile-carousel-controls">
                                <button type="button" class="mobile-carousel-arrow" @click="scrollCarousel($event, -1)" aria-label="Desplazar a la izquierda">&#10094;</button>
                                <button type="button" class="mobile-carousel-arrow" @click="scrollCarousel($event, 1)" aria-label="Desplazar a la derecha">&#10095;</button>
                            </div>
                        </div>
                        <ul class="mobile-carousel">
                            <ProductCard v-for="p in prods" :key="p.id" :product="p" @add-to-cart="handleAddToCart" />
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Asistente de IA -->
    <AIChatbot />
  </main>
</template>

<style scoped>
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

@media (min-width: 768px) {
}
</style>
