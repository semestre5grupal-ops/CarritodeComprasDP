<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from './models/useAuth'
import { useCart } from './models/useCart'
import CartDrawer from './components/CartDrawer.vue'
import api from './services/api'
import { processQueue } from './services/db'

const router = useRouter()
const { user, isAuthenticated, isAdmin, logout } = useAuth()
const { itemCount, openDrawer } = useCart()

function handleAuthExpired() {
  alert('Su sesión ha expirado. Por favor, inicie sesión nuevamente.')
}

function handleLogout() {
  logout()
  router.push('/')
}

const showPromoBanner = ref(false)

function checkCookie() {
  const match = document.cookie.match(new RegExp('(^| )promo_closed=([^;]+)'))
  if (!match || match[2] !== 'true') {
    showPromoBanner.value = true
  }
}

function closePromoBanner() {
  showPromoBanner.value = false
  // Cookie expires in 7 days
  const d = new Date()
  d.setTime(d.getTime() + (7*24*60*60*1000))
  document.cookie = `promo_closed=true;expires=${d.toUTCString()};path=/`
}

async function syncOfflineQueue() {
  if (navigator.onLine) {
    try {
      const result = await processQueue(api)
      if (result.processed > 0) {
        alert(`Se han sincronizado ${result.processed} pedido(s) pendiente(s) que realizaste sin conexión.`)
      }
    } catch (err) {
      console.error('Error al sincronizar pedidos offline:', err)
    }
  }
}

onMounted(() => {
  window.addEventListener('auth:expired', handleAuthExpired)
  window.addEventListener('online', syncOfflineQueue)
  checkCookie()
  syncOfflineQueue()
})

onUnmounted(() => {
  window.removeEventListener('auth:expired', handleAuthExpired)
  window.removeEventListener('online', syncOfflineQueue)
})
</script>

<template>
  <a class="skip-link" href="#main-content">Saltar al contenido principal</a>

  <div v-if="showPromoBanner" class="promo-banner" role="alert" aria-live="polite">
    <p>¡Usa el código <strong>DEPORTE20</strong> para un 20% de descuento en tu primera compra!</p>
    <button type="button" @click="closePromoBanner" aria-label="Cerrar banner promocional">×</button>
  </div>

  <CartDrawer />

  <header class="site-header">
    <div class="nav-bar wrap-wide">
      <h1 class="brand">
        <router-link to="/" aria-label="Volver al inicio">
          Shop<span>sport</span>
        </router-link>
      </h1>

      <nav class="primary-nav" aria-label="Navegación principal">
        <ul>
          <li><router-link to="/">Inicio</router-link></li>
          <li><router-link to="/catalog">Catálogo</router-link></li>
        </ul>
      </nav>

      <div class="nav-actions" aria-label="Acciones rápidas">
        <template v-if="isAuthenticated">
          <span class="nav-pill btn-user" style="pointer-events: none;">
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span class="user-text">{{ user?.username }}</span>
          </span>
          <router-link
            v-if="isAdmin"
            to="/admin"
            class="nav-pill"
            aria-label="Panel de administración"
          >
            Admin
          </router-link>
        </template>
        <template v-else>
          <router-link
            to="/login"
            class="nav-pill btn-user"
            aria-label="Iniciar sesión"
          >
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span class="user-text">Login</span>
          </router-link>
        </template>

        <button
          type="button"
          class="nav-pill btn-cart"
          :aria-label="`Abrir carrito, ${itemCount} artículos`"
          @click="openDrawer"
        >
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <span class="cart-badge" aria-hidden="true">{{ itemCount }}</span>
        </button>
      </div>
    </div>
  </header>

  <main id="main-content" aria-label="Contenido principal">
    <router-view />
  </main>

  <footer class="site-footer wrap-wide" aria-label="Pie de página">
    <div>
      <h2 class="brand" style="margin-bottom: 0.5rem;">
        <router-link to="/" aria-label="Volver al inicio">Shop<span>sport</span></router-link>
      </h2>
      <p>Ropa deportiva minimalista para una tienda clara, ordenada y fácil de navegar.</p>
    </div>
    <nav aria-label="Vínculos internos">
      <h3>Nosotros</h3>
      <ul>
        <li><router-link to="/">Inicio</router-link></li>
        <li><router-link to="/catalog">Catálogo</router-link></li>
      </ul>
    </nav>
    <div aria-label="Medios de contacto">
      <h3>Contáctanos</h3>
      <p style="color: var(--muted); font-size: 0.9rem;">
        Escríbenos a través de nuestro formulario de contacto.
      </p>
    </div>
  </footer>
</template>

<style scoped>
.promo-banner {
  background: var(--accent);
  color: white;
  text-align: center;
  padding: 0.5rem 2rem;
  font-size: 0.85rem;
  font-weight: 500;
  position: relative;
  z-index: 100;
}
.promo-banner button {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  opacity: 0.8;
  padding: 0 0.5rem;
}
.promo-banner button:hover {
  opacity: 1;
}
</style>
