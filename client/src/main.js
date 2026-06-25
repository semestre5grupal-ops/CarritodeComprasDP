import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import { getUser } from './services/api'
import './assets/styles.css'
import './assets/catalog.css'
import './assets/products.css'
import './assets/cart.css'

// ─── Lazy Loading: cada vista se carga bajo demanda ─────────────────────────
// Esto permite que Vite genere chunks separados por vista, reduciendo el
// tamaño del bundle inicial y mejorando el Time to Interactive (TTI).
const HomeView     = () => import('./views/HomeView.vue')
const CatalogView  = () => import('./views/CatalogView.vue')
const LoginView    = () => import('./views/LoginView.vue')
const RegisterView = () => import('./views/RegisterView.vue')
const AdminView    = () => import('./views/AdminView.vue')
const MyOrdersView = () => import('./views/MyOrdersView.vue')

const CheckoutView = () => import('./views/CheckoutView.vue')

const routes = [
  { path: '/',           name: 'home',      component: HomeView,     meta: { title: 'Inicio' } },
  { path: '/catalog',    name: 'catalog',   component: CatalogView,  meta: { title: 'Catálogo' } },
  { path: '/login',      name: 'login',     component: LoginView,    meta: { title: 'Iniciar sesión' } },
  { path: '/register',   name: 'register',  component: RegisterView, meta: { title: 'Crear cuenta' } },
  { path: '/admin',      name: 'admin',     component: AdminView,    meta: { title: 'Administración', requiresAdmin: true } },
  { path: '/mis-pedidos',name: 'my-orders', component: MyOrdersView, meta: { title: 'Mis Pedidos',    requiresAuth: true } },
  { path: '/checkout',   name: 'checkout',  component: CheckoutView, meta: { title: 'Finalizar Compra', requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // Desplazar siempre al inicio al navegar entre páginas
  scrollBehavior: () => ({ top: 0, behavior: 'smooth' }),
})

// ─── Guardias de Navegación (Route Guards) ───────────────────────────────────
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

