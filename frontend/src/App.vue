<template>
  <SiteHeader />
  <RouterView v-slot="{ Component }">
    <component :is="Component" />
  </RouterView>
  <SiteFooter />
  
  <CartDrawer />
  
  <!-- UI Overlays -->
  <NetworkBanner />
  <CookieBanner />
  <ScrollTopButton />
</template>

<script setup>
import { onMounted } from 'vue'
import { useProductsStore } from './store/products.js'
import SiteHeader     from './components/SiteHeader.vue'
import SiteFooter     from './components/SiteFooter.vue'
import CartDrawer     from './components/CartDrawer.vue'
import NetworkBanner  from './components/NetworkBanner.vue'
import CookieBanner   from './components/CookieBanner.vue'
import ScrollTopButton from './components/ScrollTopButton.vue'

const productsStore = useProductsStore()
onMounted(() => productsStore.fetchProducts())
</script>
