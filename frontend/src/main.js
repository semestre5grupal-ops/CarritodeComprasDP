import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import HomeView from './views/HomeView.vue'
import CatalogView from './views/CatalogView.vue'

// Vanilla CSS
import './assets/css/styles.css'
import './assets/css/components/products.css'
import './assets/css/components/cart.css'
import './assets/css/components/catalog.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/',        component: HomeView,    name: 'home' },
    { path: '/catalog', component: CatalogView, name: 'catalog' }
  ],
  scrollBehavior: (to, from, savedPosition) => {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return savedPosition || { top: 0 }
  }
})

const pinia = createPinia()
const app   = createApp(App)

app.use(pinia)
app.use(router)
app.mount('#app')
