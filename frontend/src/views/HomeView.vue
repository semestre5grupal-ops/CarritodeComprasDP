<template>
  <main id="contenido" aria-label="Contenido principal">

    <!-- ===== HERO ===== -->
    <section id="hero" class="hero wrap-wide" aria-labelledby="hero-title" aria-describedby="hero-summary">
        <!-- Background Carousel -->
        <div class="hero-carousel" aria-hidden="true" id="hero-carousel">
            <img src="/images/mujer-correr.webp" alt="" class="carousel-slide active">
            <img src="/images/personas-corriendo.webp" alt="" class="carousel-slide">
            <img src="/images/persona-yoga.webp" alt="" class="carousel-slide">
            <div class="carousel-overlay"></div>
        </div>
        
        <!-- Carousel Controls -->
        <div class="carousel-controls" aria-label="Controles del carrusel">
            <button type="button" id="btn-prev-slide" class="carousel-btn" aria-label="Imagen anterior" aria-controls="hero-carousel">
                <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <button type="button" id="btn-next-slide" class="carousel-btn" aria-label="Siguiente imagen" aria-controls="hero-carousel">
                <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
        </div>

        <div class="hero-copy">
            <p class="eyebrow">Nueva colección rendimiento</p>
            <h2 id="hero-title">Empieza por lo esencial.</h2>
            <p id="hero-summary">Ropa deportiva minimalista para entrenar, descansar y moverte con comodidad.
                Prendas limpias, ordenadas y pensadas para el uso diario.</p>
            <div class="hero-actions">
                <RouterLink to="/catalog" class="btn btn-primary">Ver catálogo</RouterLink>
            </div>
        </div>
    </section>

    <!-- ===== BENEFICIOS ===== -->
    <section class="benefits wrap-wide" aria-labelledby="sec-beneficios">
        <h2 id="sec-beneficios" class="sr-only">Ventajas principales</h2>
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
    <section id="catalogo" class="catalog-section wrap-wide" aria-labelledby="sec-productos" aria-live="polite">
        <div class="section-heading">
            <h2 id="sec-productos">Destacados</h2>
            <p>Prendas deportivas seleccionadas para una tienda limpia, ordenada y fácil de navegar.</p>
        </div>
        <ul id="product-grid" class="product-grid" aria-label="Listado de productos destacados" :aria-busy="store.loading">
            <li v-if="store.loading" class="loading" aria-live="polite">Cargando productos...</li>
            <li v-else-if="store.error">Error: {{ store.error }}</li>
            <ProductCard v-else v-for="p in filteredProducts" :key="p.id" :product="p" />
        </ul>
    </section>

    <!-- ===== COLECCIÓN BANNER ===== -->
    <section id="coleccion" class="collection-banner wrap-wide" aria-labelledby="sec-coleccion">
        <div class="collection-copy">
            <p class="eyebrow">shop sport essentials</p>
            <h2 id="sec-coleccion">La primera capa define todo.</h2>
            <p>Una selección básica, sobria y funcional para construir looks deportivos sin ruido visual.</p>
        </div>
        <div class="collection-switch" aria-label="Filtrar por categoría">
            <button type="button" class="collection-chip" :aria-pressed="activeCategory === 'Mujer'" @click="activeCategory = 'Mujer'">MUJER</button>
            <button type="button" class="collection-chip" :aria-pressed="activeCategory === 'Hombre'" @click="activeCategory = 'Hombre'">HOMBRE</button>
            <button type="button" class="collection-chip" :aria-pressed="activeCategory === 'Kids'" @click="activeCategory = 'Kids'">KIDS</button>
            <button type="button" class="collection-chip" :aria-pressed="activeCategory === 'Accesorios'" @click="activeCategory = 'Accesorios'">ACCESORIOS</button>
        </div>
    </section>

    <!-- ===== DESCUENTO CTA ===== -->
    <section class="discount-cta wrap-wide" aria-labelledby="sec-descuento">
        <div class="discount-cta__content">
            <p class="eyebrow discount-cta__eyebrow">Primera compra online</p>
            <h2 id="sec-descuento">15% de descuento</h2>
            <p>Activa tu descuento al registrarte. Solo una vez, vale la pena.</p>
            <RouterLink to="/catalog" class="btn discount-cta__btn">Comprar</RouterLink>
        </div>
    </section>

    <ContactForm />

  </main>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useProductsStore } from '../store/products.js'
import ProductCard from '../components/ProductCard.vue'
import ContactForm from '../components/ContactForm.vue'

const store = useProductsStore()
const activeCategory = ref('Mujer') // Not actually filtering anything in the vanilla version, it just highlighted

const filteredProducts = computed(() => {
  return store.products.slice(0, 8)
})
</script>
