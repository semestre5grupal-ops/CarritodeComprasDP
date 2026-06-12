import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import HomeView from './views/HomeView.vue'
import CatalogView from './views/CatalogView.vue'
import LoginView from './views/LoginView.vue'
import RegisterView from './views/RegisterView.vue'
import AdminView from './views/AdminView.vue'
import MyOrdersView from './views/MyOrdersView.vue'
import { getUser } from './services/api'
import './assets/styles.css'
import './assets/catalog.css'
import './assets/products.css'
import './assets/cart.css'
const routes = [
  { path: '/', name: 'home', component: HomeView, meta: { title: 'Inicio' } },
  { path: '/catalog', name: 'catalog', component: CatalogView, meta: { title: 'Catálogo' } },
  { path: '/login', name: 'login', component: LoginView, meta: { title: 'Iniciar sesión' } },
  { path: '/register', name: 'register', component: RegisterView, meta: { title: 'Crear cuenta' } },
  { path: '/admin', name: 'admin', component: AdminView, meta: { title: 'Administración', requiresAdmin: true } },
  { path: '/mis-pedidos', name: 'my-orders', component: MyOrdersView, meta: { title: 'Mis Pedidos', requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const user = getUser()
  if (to.meta.requiresAuth && !user) {
    next('/login')
    return
  }
  if (to.meta.requiresAdmin && (!user || user.role !== 'admin')) {
    next('/')
    return
  }
  next()
})

router.afterEach((to) => {
  document.title = to.meta.title ? `Shop Sport | ${to.meta.title}` : 'Shop Sport'
})

const app = createApp(App)
app.use(router)
app.mount('#app')
