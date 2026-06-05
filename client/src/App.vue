<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from './composables/useAuth'
import { useCart } from './composables/useCart'
import CartDrawer from './components/CartDrawer.vue'

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

onMounted(() => {
  window.addEventListener('auth:expired', handleAuthExpired)
})

onUnmounted(() => {
  window.removeEventListener('auth:expired', handleAuthExpired)
})
</script>

<template>
  <a class="skip-link" href="#main-content">Saltar al contenido principal</a>

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
          <li><router-link to="/" aria-current="page">Inicio</router-link></li>
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
