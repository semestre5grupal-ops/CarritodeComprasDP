<template>
  <main
    id="contenido"
    aria-label="Contenido principal"
  >
    <!-- ===== HERO ===== -->
    <section
      id="hero"
      class="hero wrap-wide"
      aria-labelledby="hero-title"
      aria-describedby="hero-summary"
    >
      <!-- Background Carousel -->
      <div
        id="hero-carousel"
        class="hero-carousel"
        aria-hidden="true"
      >
        <img
          v-for="(slide, index) in slides"
          :key="index"
          :src="slide"
          alt=""
          class="carousel-slide"
          :class="{ active: activeSlide === index }"
        >
        <div class="carousel-overlay" />
      </div>
        
      <!-- Carousel Controls -->
      <div
        class="carousel-controls"
        aria-label="Controles del carrusel"
      >
        <button
          id="btn-prev-slide"
          type="button"
          class="carousel-btn"
          aria-label="Imagen anterior"
          aria-controls="hero-carousel"
          @click="prevSlide"
        >
          <svg
            aria-hidden="true"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          ><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <button
          id="btn-next-slide"
          type="button"
          class="carousel-btn"
          aria-label="Siguiente imagen"
          aria-controls="hero-carousel"
          @click="nextSlide"
        >
          <svg
            aria-hidden="true"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          ><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>

      <div class="hero-copy">
        <p class="eyebrow">
          Nueva colección rendimiento
        </p>
        <h2 id="hero-title">
          Empieza por lo esencial.
        </h2>
        <p id="hero-summary">
          Ropa deportiva minimalista para entrenar, descansar y moverte con comodidad.
          Prendas limpias, ordenadas y pensadas para el uso diario.
        </p>
        <div class="hero-actions">
          <RouterLink
            to="/catalog"
            class="btn btn-primary"
          >
            Ver catálogo
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- ===== BENEFICIOS ===== -->
    <section
      class="benefits wrap-wide"
      aria-labelledby="sec-beneficios"
    >
      <h2
        id="sec-beneficios"
        class="sr-only"
      >
        Ventajas principales
      </h2>
      <ul class="benefits-list">
        <li class="benefits-item">
          <span aria-hidden="true">01</span>
          <h3>Envíos a todo Ecuador</h3>
          <p>Procesos simples, seguimiento claro y entregas rápidas.</p>
        </li>
        <li class="benefits-item">
          <span aria-hidden="true">02</span>
          <h3>Cambios sin complicaciones</h3>
          <p>Compra con tranquilidad y ajusta tu talla si lo necesitas.</p>
        </li>
        <li class="benefits-item">
          <span aria-hidden="true">03</span>
          <h3>Telas técnicas</h3>
          <p>Materiales suaves, transpirables y resistentes al uso constante.</p>
        </li>
        <li class="benefits-item">
          <span aria-hidden="true">04</span>
          <h3>Atención por WhatsApp</h3>
          <p>Resolvemos dudas de tallas, colores y disponibilidad.</p>
        </li>
      </ul>
    </section>

    <!-- ===== PRODUCTOS DESTACADOS ===== -->
    <section
      id="catalogo"
      class="catalog-section wrap-wide"
      aria-labelledby="sec-productos"
      aria-live="polite"
    >
      <div class="section-heading">
        <h2 id="sec-productos">
          Destacados
        </h2>
        <p>Prendas deportivas seleccionadas para una tienda limpia, ordenada y fácil de navegar.</p>
      </div>
      <ul
        id="product-grid"
        class="product-grid"
        aria-label="Listado de productos destacados"
        :aria-busy="loading"
      >
        <li
          v-if="loading"
          class="loading"
          aria-live="polite"
        >
          Cargando productos...
        </li>
        <li v-else-if="error">
          Error: {{ error }}
        </li>
        <ProductCard
          v-for="p in filteredProducts"
          v-else
          :key="p.id"
          :product="p"
          @add-to-cart="handleAddToCart"
        />
      </ul>
    </section>

    <!-- ===== COLECCIÓN BANNER ===== -->
    <section
      id="coleccion"
      class="collection-banner wrap-wide"
      aria-labelledby="sec-coleccion"
    >
      <div class="collection-copy">
        <p class="eyebrow">
          shop sport essentials
        </p>
        <h2 id="sec-coleccion">
          La primera capa define todo.
        </h2>
        <p>Una selección básica, sobria y funcional para construir looks deportivos sin ruido visual.</p>
      </div>
    </section>

    <!-- ===== DESCUENTO CTA ===== -->
    <section
      class="discount-cta wrap-wide"
      aria-labelledby="sec-descuento"
    >
      <div class="discount-cta__content">
        <p class="eyebrow discount-cta__eyebrow">
          Primera compra online
        </p>
        <h2 id="sec-descuento">
          15% de descuento
        </h2>
        <p>Activa tu descuento al registrarte. Solo una vez, vale la pena.</p>
        <RouterLink
          to="/register"
          class="btn discount-cta__btn"
        >
          Crear cuenta
        </RouterLink>
      </div>
    </section>

    <ContactForm />
  </main>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import ProductController from '../controllers/ProductController'
import ProductCard from '../components/ProductCard.vue'
import ContactForm from '../components/ContactForm.vue'
import { useCart } from '../models/useCart'

const { addProduct, openDrawer } = useCart()

const activeSlide = ref(0)
const slides = [
  '/images/mujer-correr.webp',
  '/images/personas-corriendo.webp',
  '/images/persona-yoga.webp'
]

function nextSlide() { activeSlide.value = (activeSlide.value + 1) % slides.length }
function prevSlide() { activeSlide.value = (activeSlide.value - 1 + slides.length) % slides.length }

const productos = ref([])
const loading = ref(true)
const error = ref(null)

const filteredProducts = computed(() => {
  return productos.value.slice(0, 8)
})

function handleAddToCart(product) {
  addProduct(product, 1)
  openDrawer()
}

async function loadProducts() {
  loading.value = true
  error.value = null
  try {
    const data = await ProductController.getAll()
    productos.value = data || []
  } catch (err) {
    error.value = err.message || 'Error al cargar productos'
  } finally {
    loading.value = false
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

<style scoped>
.loading {
  grid-column: 1 / -1;
  padding: 2rem;
  text-align: center;
  color: var(--muted);
}
</style>
