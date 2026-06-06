<template>
  <header class="site-header">
    <div class="nav-bar wrap-wide">
      <RouterLink to="/" class="brand">Shop<span>sport</span></RouterLink>

      <button type="button" class="mobile-menu-toggle" aria-expanded="false" aria-controls="primary-navigation" aria-label="Abrir menú de navegación">
          <svg class="hamburger-icon" aria-hidden="true" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
      </button>

      <nav id="primary-navigation" class="primary-nav" aria-label="Navegación principal">
          <ul>
              <li><RouterLink to="/">Inicio</RouterLink></li>
              <li><RouterLink to="/catalog">Catálogo</RouterLink></li>
              <li><RouterLink :to="{ path: '/', hash: '#contacto-section' }">Contacto</RouterLink></li>
          </ul>
      </nav>
      
      <div class="nav-actions" aria-label="Acciones rápidas">
          <a href="https://proyecto-bd-seven.vercel.app/auth/sign-in" class="btn-user nav-pill" aria-label="Iniciar sesión">
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span class="user-text">Login</span>
          </a>
          <button type="button" class="btn-cart nav-pill" :aria-label="`Abrir carrito, ${cartStore.totalItems} artículos`"
              :aria-expanded="cartStore.isOpen" aria-controls="cart-drawer" @click="cartStore.openCart()">
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span class="cart-badge" aria-hidden="true">{{ cartStore.totalItems }}</span>
          </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useCartStore } from '../store/cart.js'
const cartStore = useCartStore()
</script>
