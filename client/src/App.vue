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

const showLogoutModal = ref(false)

function confirmLogout() {
  showLogoutModal.value = true
}

function cancelLogout() {
  showLogoutModal.value = false
}

function handleLogout() {
  showLogoutModal.value = false
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
  <a
    class="skip-link"
    href="#main-content"
  >Saltar al contenido principal</a>

  <div
    v-if="showPromoBanner"
    class="promo-banner"
    role="alert"
    aria-live="polite"
  >
    <p>¡Usa el código <strong>DEPORTE20</strong> para un 20% de descuento en tu primera compra!</p>
    <button
      type="button"
      aria-label="Cerrar banner promocional"
      @click="closePromoBanner"
    >
      ×
    </button>
  </div>

  <CartDrawer />

  <div
    v-if="showLogoutModal"
    class="modal-overlay"
    @click="cancelLogout"
  >
    <div
      class="modal-content"
      @click.stop
    >
      <h3>Cerrar sesión</h3>
      <p>¿Está seguro que desea cerrar su sesión?</p>
      <div class="modal-actions">
        <button
          type="button"
          class="btn btn-secondary"
          @click="cancelLogout"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="btn btn-dark"
          @click="handleLogout"
        >
          Sí, salir
        </button>
      </div>
    </div>
  </div>

  <header class="site-header">
    <div class="nav-bar wrap-wide">
      <h1 class="brand">
        <router-link
          to="/"
          aria-label="Volver al inicio"
        >
          Shop<span>sport</span>
        </router-link>
      </h1>

      <nav
        class="primary-nav"
        aria-label="Navegación principal"
      >
        <ul>
          <li>
            <router-link to="/">
              Inicio
            </router-link>
          </li>
          <li>
            <router-link to="/catalog">
              Catálogo
            </router-link>
          </li>
        </ul>
      </nav>

      <div
        class="nav-actions"
        aria-label="Acciones rápidas"
      >
        <template v-if="isAuthenticated">
          <div class="user-dropdown-container">
            <span
              class="nav-pill btn-user"
              style="cursor: pointer;"
            >
              <svg
                aria-hidden="true"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle
                  cx="12"
                  cy="7"
                  r="4"
                />
              </svg>
              <span class="user-text">{{ user?.username }}</span>
              <svg
                aria-hidden="true"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="chevron"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
            <div class="user-dropdown-menu">
              <router-link
                to="/mis-pedidos"
                class="dropdown-item"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  aria-hidden="true"
                ><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect
                  x="9"
                  y="3"
                  width="6"
                  height="4"
                  rx="1"
                /></svg>
                Mis Pedidos
              </router-link>
              <router-link
                to="/perfil"
                class="dropdown-item"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  aria-hidden="true"
                ><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle
                  cx="12"
                  cy="7"
                  r="4"
                /></svg>
                Mi Perfil
              </router-link>
              <router-link
                v-if="isAdmin"
                to="/admin"
                class="dropdown-item"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  aria-hidden="true"
                ><rect
                  x="3"
                  y="3"
                  width="7"
                  height="7"
                /><rect
                  x="14"
                  y="3"
                  width="7"
                  height="7"
                /><rect
                  x="14"
                  y="14"
                  width="7"
                  height="7"
                /><rect
                  x="3"
                  y="14"
                  width="7"
                  height="7"
                /></svg>
                Admin
              </router-link>
              <div class="dropdown-divider" />
              <button
                type="button"
                class="dropdown-item dropdown-item--danger"
                @click="confirmLogout"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  aria-hidden="true"
                ><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line
                  x1="21"
                  y1="12"
                  x2="9"
                  y2="12"
                /></svg>
                Salir
              </button>
            </div>
          </div>
        </template>
        <template v-else>
          <router-link
            to="/login"
            class="nav-pill btn-user"
            aria-label="Iniciar sesión"
          >
            <svg
              aria-hidden="true"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle
                cx="12"
                cy="7"
                r="4"
              />
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
          <svg
            aria-hidden="true"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z" />
            <line
              x1="3"
              y1="6"
              x2="21"
              y2="6"
            />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <span
            class="cart-badge"
            aria-hidden="true"
          >{{ itemCount }}</span>
        </button>
      </div>
    </div>
  </header>

  <main
    id="main-content"
    aria-label="Contenido principal"
  >
    <router-view />
  </main>

  <footer
    class="site-footer wrap-wide"
    aria-label="Pie de página"
  >
    <div>
      <h2
        class="brand"
        style="margin-bottom: 0.5rem;"
      >
        <router-link
          to="/"
          aria-label="Volver al inicio"
        >
          Shop<span>sport</span>
        </router-link>
      </h2>
      <p>Ropa deportiva minimalista para una tienda clara, ordenada y fácil de navegar.</p>
    </div>
    <nav aria-label="Vínculos internos">
      <h3>Nosotros</h3>
      <ul>
        <li>
          <router-link to="/">
            Inicio
          </router-link>
        </li>
        <li>
          <router-link to="/catalog">
            Catálogo
          </router-link>
        </li>
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

/* User Dropdown Menu */
.user-dropdown-container {
  position: relative;
  display: inline-flex;
}

.user-dropdown-container .nav-pill {
  cursor: pointer;
  pointer-events: auto !important;
}

.chevron {
  margin-left: 4px;
  transition: transform 0.2s;
}

.user-dropdown-container:hover .chevron {
  transform: rotate(180deg);
}

.user-dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: white;
  border-radius: 0.8rem;
  box-shadow: 0 10px 25px rgba(21, 33, 42, 0.1);
  border: 1px solid var(--line);
  padding: 0.5rem;
  min-width: 150px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.2s ease;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.user-dropdown-container:hover .user-dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  color: var(--ink);
  text-decoration: none;
  border-radius: 0.5rem;
  transition: background-color 0.15s, color 0.15s;
  font-size: 0.85rem;
  text-align: left;
  border: none;
  background: transparent;
  cursor: pointer;
  width: 100%;
}

.dropdown-item:hover {
  background-color: rgba(97, 168, 184, 0.1);
  color: var(--accent);
}

.dropdown-item--danger {
  color: #dc2626;
}
.dropdown-item--danger:hover {
  background-color: rgba(220, 38, 38, 0.08);
  color: #dc2626;
}

.dropdown-divider {
  height: 1px;
  background: var(--line, #e2e8f0);
  margin: 0.25rem 0.5rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(21, 33, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--surface);
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: var(--shadow);
  text-align: center;
  max-width: 400px;
  width: 90%;
}

.modal-content h3 {
  margin-bottom: 1rem;
  font-size: 1.25rem;
  color: var(--ink);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.modal-content p {
  color: var(--muted);
  margin-bottom: 1.5rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

</style>
