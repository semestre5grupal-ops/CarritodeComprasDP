<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import ProductController from '../controllers/ProductController'
import OrderController from '../controllers/OrderController'
import ReportController from '../controllers/ReportController'
import api from '../services/api'

const activeTab = ref('products')
const products = ref([])
const orders = ref([])
const users = ref([])
const loading = ref(true)
const error = ref(null)

const productForm = ref({ nombre: '', precio: '', stock: '', categoria: '', imagen: '', talla: '' })
const editingId = ref(null)
const formDialog = ref(null)
const formError = ref('')
const saving = ref(false)

const deleteDialog = ref(null)
const deleteType = ref('') // 'product' | 'order' | 'user'
const deletingId = ref(null)
const deleteName = ref('')

const userFormDialog = ref(null)
const editingUserId = ref(null)
const userForm = ref({ username: '', email: '', password: '', role: 'user' })
const userFormError = ref('')
const savingUser = ref(false)

const orderFormDialog = ref(null)
const editingOrderId = ref(null)
const orderForm = ref({ status: 'Pendiente' })
const orderFormError = ref('')
const savingOrder = ref(false)

const categorias = ['Mujer', 'Hombre', 'Unisex']

// ─── Estado del panel de Reportes ───────────────────────────────────────────
const report = ref(null)
const reportLoading = ref(false)
const reportError = ref('')
const selectedRange = ref('mes_actual') // preset activo
const customFrom = ref('')
const customTo = ref('')

const rangePresets = [
  { key: 'mes_actual', label: 'Mes actual' },
  { key: 'mes_pasado', label: 'Mes pasado' },
  { key: '3meses', label: 'Últimos 3 meses' },
  { key: '6meses', label: 'Últimos 6 meses' },
  { key: 'anio', label: 'Último año' },
  { key: 'personalizado', label: 'Personalizado' },
]

function toYMD(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Traduce el preset seleccionado a un par { from, to } en formato 'YYYY-MM-DD'.
function resolveRange(key) {
  const now = new Date()
  if (key === 'personalizado') {
    return { from: customFrom.value || null, to: customTo.value || null }
  }
  if (key === 'mes_actual') {
    return { from: toYMD(new Date(now.getFullYear(), now.getMonth(), 1)), to: toYMD(now) }
  }
  if (key === 'mes_pasado') {
    const first = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const last = new Date(now.getFullYear(), now.getMonth(), 0)
    return { from: toYMD(first), to: toYMD(last) }
  }
  const months = { '3meses': 3, '6meses': 6, anio: 12 }[key] || 1
  const from = new Date(now)
  from.setMonth(from.getMonth() - months)
  return { from: toYMD(from), to: toYMD(now) }
}

const reportSummary = computed(() => report.value?.resumen || null)
const reportSeries = computed(() => report.value?.series || [])
const reportTop = computed(() => report.value?.topProductos || [])
const maxSerieTotal = computed(() => Math.max(1, ...reportSeries.value.map((s) => s.total)))
const maxTopCantidad = computed(() => Math.max(1, ...reportTop.value.map((p) => p.cantidad)))

function formatSerieLabel(label) {
  // 'YYYY-MM-DD' -> 'DD/MM' ; 'YYYY-MM' -> 'MM/YYYY'
  const parts = label.split('-')
  if (parts.length === 3) return `${parts[2]}/${parts[1]}`
  return `${parts[1]}/${parts[0]}`
}

function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

async function loadReport() {
  if (selectedRange.value === 'personalizado' && (!customFrom.value || !customTo.value)) {
    reportError.value = 'Selecciona una fecha de inicio y una de fin.'
    return
  }
  if (selectedRange.value === 'personalizado' && customFrom.value > customTo.value) {
    reportError.value = 'La fecha de inicio no puede ser mayor que la fecha de fin.'
    return
  }
  reportLoading.value = true
  reportError.value = ''
  try {
    const { from, to } = resolveRange(selectedRange.value)
    report.value = await ReportController.getVentas(from, to)
  } catch (err) {
    reportError.value = err.message || 'Error al cargar el reporte'
    report.value = null
  } finally {
    reportLoading.value = false
  }
}

function selectRange(key) {
  selectedRange.value = key
  if (key !== 'personalizado') {
    loadReport()
  }
}

async function loadProducts() {
  loading.value = true
  error.value = ''
  try {
    const data = await ProductController.getAll()
    products.value = data || []
  } catch (err) {
    error.value = err.message || 'Error al cargar productos'
  } finally {
    loading.value = false
  }
}

async function loadOrders() {
  loading.value = true
  error.value = ''
  try {
    const data = await OrderController.getAll()
    orders.value = data || []
  } catch (err) {
    error.value = err.message || 'Error al cargar pedidos'
  } finally {
    loading.value = false
  }
}

async function loadUsers() {
  loading.value = true
  error.value = ''
  try {
    const response = await api.get('/usuarios')
    users.value = response.data || []
  } catch (err) {
    error.value = err.message || 'Error al cargar usuarios'
  } finally {
    loading.value = false
  }
}

function openCreateForm() {
  editingId.value = null
  productForm.value = { nombre: '', precio: '', stock: '', categoria: '', imagen: '', talla: '' }
  formError.value = ''
  formDialog.value?.showModal()
  nextTick(() => document.getElementById('af-nombre')?.focus())
}

async function openEditForm(product) {
  editingId.value = product.id
  productForm.value = {
    nombre: product.nombre || '',
    precio: product.precio?.toString() || '',
    stock: product.stock?.toString() || '',
    categoria: product.categoria || '',
    imagen: product.imagen || '',
    talla: product.talla || '',
  }
  formError.value = ''
  formDialog.value?.showModal()
  nextTick(() => document.getElementById('af-nombre')?.focus())
}

function closeForm() {
  formDialog.value?.close()
}

async function saveProduct() {
  formError.value = ''
  const body = {
    nombre: productForm.value.nombre.trim().replace(/<[^>]*>?/gm, ''),
    precio: parseFloat(productForm.value.precio),
    stock: parseInt(productForm.value.stock, 10),
    categoria: productForm.value.categoria,
    imagen: productForm.value.imagen?.trim().replace(/<[^>]*>?/gm, '') || undefined,
    talla: productForm.value.talla?.trim().replace(/<[^>]*>?/gm, '') || undefined,
  }

  if (!body.nombre) { formError.value = 'El nombre es obligatorio.'; return }
  if (!body.categoria) { formError.value = 'Debes seleccionar una categoría.'; return }
  if (isNaN(body.precio) || body.precio <= 0 || body.precio > 9999.99) { formError.value = 'Precio debe estar entre 0.01 y 9999.99'; return }
  if (isNaN(body.stock) || body.stock < 0 || body.stock > 2147483647) { formError.value = 'Stock debe ser un número válido entre 0 y 2147483647'; return }

  saving.value = true
  try {
    if (editingId.value) {
      await ProductController.update(editingId.value, body)
    } else {
      await ProductController.create(body)
    }
    closeForm()
    await loadProducts()
  } catch (err) {
    formError.value = err.message || 'Error al guardar el producto.'
  } finally {
    saving.value = false
  }
}

function confirmDelete(id, name, type) {
  deletingId.value = id
  deleteName.value = name
  deleteType.value = type
  deleteDialog.value?.showModal()
}

function closeDelete() {
  deleteDialog.value?.close()
  deletingId.value = null
  deleteName.value = ''
  deleteType.value = ''
}

async function executeDelete() {
  if (!deletingId.value) return
  try {
    if (deleteType.value === 'product') {
      await ProductController.remove(deletingId.value)
      await loadProducts()
    } else if (deleteType.value === 'order') {
      await api.delete(`/pedidos/${deletingId.value}`)
      await loadOrders()
    } else if (deleteType.value === 'user') {
      await api.delete(`/usuarios/${deletingId.value}`)
      await loadUsers()
    }
    closeDelete()
  } catch (err) {
    error.value = err.message || 'Error al eliminar.'
    closeDelete()
  }
}

// --- Orders Functions ---
function openOrderEditForm(order) {
  editingOrderId.value = order.id
  orderForm.value.status = order.status || 'Pendiente'
  orderFormError.value = ''
  orderFormDialog.value?.showModal()
}
function closeOrderForm() { orderFormDialog.value?.close() }
async function saveOrder() {
  savingOrder.value = true; orderFormError.value = ''
  try {
    await api.put(`/pedidos/${editingOrderId.value}/status`, { status: orderForm.value.status })
    
    // Mutate local state for visual feedback
    const orderIndex = orders.value.findIndex(o => o.id === editingOrderId.value)
    if (orderIndex !== -1) {
      orders.value[orderIndex].status = orderForm.value.status
    }
    
    closeOrderForm()
  } catch (err) { orderFormError.value = err.message || 'Error al guardar pedido' }
  finally { savingOrder.value = false }
}

// --- Users Functions ---
function openUserCreateForm() {
  editingUserId.value = null
  userForm.value = { username: '', email: '', password: '', role: 'user' }
  userFormError.value = ''
  userFormDialog.value?.showModal()
  nextTick(() => document.getElementById('uf-username')?.focus())
}
function openUserEditForm(user) {
  editingUserId.value = user.id
  userForm.value = { username: user.username, email: user.email, password: '', role: user.role }
  userFormError.value = ''
  userFormDialog.value?.showModal()
  nextTick(() => document.getElementById('uf-username')?.focus())
}
function closeUserForm() { userFormDialog.value?.close() }
async function saveUser() {
  savingUser.value = true; userFormError.value = ''
  
  // Sanitización adicional antes de enviar
  userForm.value.username = userForm.value.username.trim().replace(/<[^>]*>?/gm, '')
  userForm.value.email = userForm.value.email.trim().replace(/<[^>]*>?/gm, '')

  if (!userForm.value.username || !userForm.value.email) {
    userFormError.value = 'Usuario y correo son obligatorios'
    savingUser.value = false
    return
  }
  try {
    const payload = { ...userForm.value }
    if (editingUserId.value) {
      if (!payload.password) delete payload.password
      await api.put(`/usuarios/${editingUserId.value}`, payload)
    } else {
      await api.post('/usuarios', payload)
    }

    closeUserForm()
    await loadUsers()
  } catch (err) { userFormError.value = err.message || 'Error al guardar usuario' }
  finally { savingUser.value = false }
}

function trapFocus(e) {
  const activeDialog = formDialog.value?.open ? formDialog.value : 
                       (orderFormDialog.value?.open ? orderFormDialog.value : 
                       (userFormDialog.value?.open ? userFormDialog.value : null))
  if (e.key === 'Tab' && activeDialog) {
    const focusable = activeDialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    
    if (e.shiftKey) {
      if (document.activeElement === first) {
        last.focus()
        e.preventDefault()
      }
    } else {
      if (document.activeElement === last) {
        first.focus()
        e.preventDefault()
      }
    }
  }
}

onMounted(() => {
  loadProducts()
  document.addEventListener('keydown', trapFocus)
})

onUnmounted(() => {
  document.removeEventListener('keydown', trapFocus)
})
</script>

<template>
  <section class="admin-section wrap-wide" aria-labelledby="admin-title">
    <div class="section-heading">
      <h2 id="admin-title">Panel de Administración</h2>
    </div>

    <nav class="admin-tabs" role="tablist" aria-label="Secciones de administración">
      <button
        type="button"
        role="tab"
        :aria-selected="activeTab === 'products'"
        :class="{ active: activeTab === 'products' }"
        @click="activeTab = 'products'; loadProducts()"
      >
        Productos
      </button>
      <button
        type="button"
        role="tab"
        :aria-selected="activeTab === 'orders'"
        :class="{ active: activeTab === 'orders' }"
        @click="activeTab = 'orders'; loadOrders()"
      >
        Pedidos
      </button>
      <button
        type="button"
        role="tab"
        :aria-selected="activeTab === 'users'"
        :class="{ active: activeTab === 'users' }"
        @click="activeTab = 'users'; loadUsers()"
      >
        Usuarios
      </button>
      <button
        type="button"
        role="tab"
        :aria-selected="activeTab === 'reports'"
        :class="{ active: activeTab === 'reports' }"
        @click="activeTab = 'reports'; loadReport()"
      >
        Reportes
      </button>
    </nav>

    <div
      v-if="error"
      class="form-alert form-alert--error"
      role="alert"
      aria-live="assertive"
    >
      {{ error }}
    </div>

    <!-- Products Tab -->
    <div v-if="activeTab === 'products'" role="tabpanel" aria-label="Gestión de productos">
      <div class="admin-toolbar">
        <span class="admin-count">{{ products.length }} producto(s)</span>
        <button type="button" class="btn btn-primary" @click="openCreateForm">
          + Nuevo producto
        </button>
      </div>

      <div v-if="loading" class="loading" role="status" aria-live="polite">
        <div class="spinner" aria-hidden="true"></div>
        <p>Cargando productos...</p>
      </div>

      <div v-else-if="products.length === 0" class="empty-message" role="status">
        No hay productos registrados.
      </div>

      <div v-else class="admin-table-wrap">
        <table class="admin-table" aria-label="Lista de productos">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Nombre</th>
              <th scope="col">Categoría</th>
              <th scope="col">Precio</th>
              <th scope="col">Stock</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in products" :key="p.id">
              <td>{{ p.id }}</td>
              <td>{{ p.nombre }}</td>
              <td>{{ p.categoria }}</td>
              <td>${{ Number(p.precio || 0).toFixed(2) }}</td>
              <td>
                <span :class="{ 'stock-low': p.stock <= 5 }">{{ p.stock }}</span>
              </td>
              <td class="actions-cell">
                <button
                  type="button"
                  class="btn-action btn-action--edit"
                  @click="openEditForm(p)"
                  :aria-label="`Editar ${p.nombre}`"
                >
                  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button
                  type="button"
                  class="btn-action btn-action--delete"
                  @click="confirmDelete(p.id, p.nombre, 'product')"
                  :aria-label="`Eliminar ${p.nombre}`"
                >
                  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Orders Tab -->
    <div v-if="activeTab === 'orders'" role="tabpanel" aria-label="Gestión de pedidos">
      <div class="admin-toolbar">
        <span class="admin-count">{{ orders.length }} pedido(s)</span>
      </div>

      <div v-if="loading" class="loading" role="status" aria-live="polite">
        <div class="spinner" aria-hidden="true"></div>
        <p>Cargando pedidos...</p>
      </div>

      <div v-else-if="orders.length === 0" class="empty-message" role="status">
        No hay pedidos registrados.
      </div>

      <div v-else class="admin-table-wrap">
        <table class="admin-table" aria-label="Lista de pedidos">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Usuario</th>
              <th scope="col">Productos</th>
              <th scope="col">Total</th>
              <th scope="col">Estado</th>
              <th scope="col">Fecha</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in orders" :key="o.id">
              <td>{{ o.id }}</td>
              <td>{{ o.usuario?.username || o.userId }}</td>
              <td>
                <ul class="order-detail-list" v-if="o.detalles?.length">
                  <li v-for="(d, index) in o.detalles" :key="'det-' + index">
                    {{ d.producto?.nombre || `Producto #${d.productoId}` }} x{{ d.cantidad }}
                  </li>
                </ul>
                <span v-else class="muted">—</span>
              </td>
              <td>${{ Number(o.total || 0).toFixed(2) }}</td>
              <td>
                <span class="status-badge" :class="'status-' + (o.status?.toLowerCase() || 'pendiente')">
                  {{ o.status || 'Pendiente' }}
                </span>
              </td>
              <td>{{ new Date(o.createdAt).toLocaleDateString('es-EC') }}</td>
              <td class="actions-cell">
                <button
                  type="button"
                  class="btn-action btn-action--edit"
                  @click="openOrderEditForm(o)"
                  :aria-label="`Modificar estado del pedido ${o.id}`"
                >
                  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button
                  type="button"
                  class="btn-action btn-action--delete"
                  @click="confirmDelete(o.id, `Pedido #${o.id}`, 'order')"
                  :aria-label="`Eliminar pedido ${o.id}`"
                >
                  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Users Tab -->
    <div v-if="activeTab === 'users'" role="tabpanel" aria-label="Gestión de usuarios">
      <div class="admin-toolbar">
        <span class="admin-count">{{ users.length }} usuario(s)</span>
        <button type="button" class="btn btn-primary" @click="openUserCreateForm">
          + Nuevo usuario
        </button>
      </div>

      <div v-if="loading" class="loading" role="status" aria-live="polite">
        <div class="spinner" aria-hidden="true"></div>
        <p>Cargando usuarios...</p>
      </div>

      <div v-else-if="users.length === 0" class="empty-message" role="status">
        No hay usuarios registrados o el servicio no está disponible aún.
      </div>

      <div v-else class="admin-table-wrap">
        <table class="admin-table" aria-label="Lista de usuarios">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Username</th>
              <th scope="col">Email</th>
              <th scope="col">Rol</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id">
              <td>{{ u.id }}</td>
              <td>{{ u.username }}</td>
              <td>{{ u.email }}</td>
              <td>
                <span :class="{'role-admin': u.role === 'admin', 'role-user': u.role === 'user'}">
                  {{ u.role === 'admin' ? 'Administrador' : 'Usuario' }}
                </span>
              </td>
              <td class="actions-cell">
                <button
                  type="button"
                  class="btn-action btn-action--edit"
                  @click="openUserEditForm(u)"
                  :aria-label="`Editar usuario ${u.username}`"
                >
                  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button
                  type="button"
                  class="btn-action btn-action--delete"
                  @click="confirmDelete(u.id, u.username, 'user')"
                  :aria-label="`Eliminar usuario ${u.username}`"
                >
                  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Reports Tab -->
    <div v-if="activeTab === 'reports'" role="tabpanel" aria-label="Reportes de ventas">
      <div class="report-filters">
        <div class="range-presets" role="group" aria-label="Rango de fechas">
          <button
            v-for="preset in rangePresets"
            :key="preset.key"
            type="button"
            class="range-chip"
            :class="{ active: selectedRange === preset.key }"
            :aria-pressed="selectedRange === preset.key"
            @click="selectRange(preset.key)"
          >
            {{ preset.label }}
          </button>
        </div>

        <div v-if="selectedRange === 'personalizado'" class="custom-range">
          <div class="form-group">
            <label for="rep-from">Desde</label>
            <input id="rep-from" v-model="customFrom" type="date" :max="customTo || undefined" />
          </div>
          <div class="form-group">
            <label for="rep-to">Hasta</label>
            <input id="rep-to" v-model="customTo" type="date" :min="customFrom || undefined" />
          </div>
          <button type="button" class="btn btn-primary" @click="loadReport">Aplicar</button>
        </div>
      </div>

      <div
        v-if="reportError"
        class="form-alert form-alert--error"
        role="alert"
        aria-live="assertive"
      >
        {{ reportError }}
      </div>

      <div v-if="reportLoading" class="loading" role="status" aria-live="polite">
        <div class="spinner" aria-hidden="true"></div>
        <p>Cargando reporte...</p>
      </div>

      <template v-else-if="reportSummary">
        <!-- Tarjetas resumen -->
        <div class="report-cards">
          <div class="report-card">
            <span class="report-card__label">Ventas totales</span>
            <strong class="report-card__value">{{ formatMoney(reportSummary.totalVentas) }}</strong>
          </div>
          <div class="report-card">
            <span class="report-card__label">Pedidos</span>
            <strong class="report-card__value">{{ reportSummary.numPedidos }}</strong>
          </div>
          <div class="report-card">
            <span class="report-card__label">Productos vendidos</span>
            <strong class="report-card__value">{{ reportSummary.totalProductos }}</strong>
          </div>
          <div class="report-card">
            <span class="report-card__label">Ticket promedio</span>
            <strong class="report-card__value">{{ formatMoney(reportSummary.ticketPromedio) }}</strong>
          </div>
        </div>

        <!-- Gráfico de ventas en el tiempo -->
        <div class="report-block">
          <h3 class="report-block__title">Ventas en el periodo</h3>
          <div v-if="reportSeries.length === 0" class="empty-message">Sin datos en el rango seleccionado.</div>
          <div v-else class="bar-chart" role="img" aria-label="Gráfico de ventas por periodo">
            <div
              v-for="s in reportSeries"
              :key="s.label"
              class="bar-chart__col"
              :title="`${formatSerieLabel(s.label)} · ${formatMoney(s.total)} · ${s.pedidos} pedido(s)`"
            >
              <span class="bar-chart__value">{{ s.total > 0 ? formatMoney(s.total) : '' }}</span>
              <div
                class="bar-chart__bar"
                :style="{ height: Math.round((s.total / maxSerieTotal) * 100) + '%' }"
              ></div>
              <span class="bar-chart__label">{{ formatSerieLabel(s.label) }}</span>
            </div>
          </div>
        </div>

        <!-- Productos más comprados -->
        <div class="report-block">
          <h3 class="report-block__title">Productos más comprados</h3>
          <div v-if="reportTop.length === 0" class="empty-message">Sin productos vendidos en el rango.</div>
          <div v-else class="admin-table-wrap">
            <table class="admin-table" aria-label="Productos más comprados">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Producto</th>
                  <th scope="col">Unidades</th>
                  <th scope="col">Popularidad</th>
                  <th scope="col">Ingresos</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(p, index) in reportTop" :key="p.id">
                  <td>{{ index + 1 }}</td>
                  <td>{{ p.nombre }}</td>
                  <td>{{ p.cantidad }}</td>
                  <td>
                    <div class="rank-bar">
                      <div
                        class="rank-bar__fill"
                        :style="{ width: Math.round((p.cantidad / maxTopCantidad) * 100) + '%' }"
                      ></div>
                    </div>
                  </td>
                  <td>{{ formatMoney(p.ingresos) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </div>

    <!-- Product Form Dialog -->
    <dialog
      ref="formDialog"
      class="admin-dialog"
      aria-labelledby="form-dialog-title"
    >
      <form @submit.prevent="saveProduct" novalidate>
        <h2 id="form-dialog-title">{{ editingId ? 'Editar producto' : 'Nuevo producto' }}</h2>

        <div
          v-if="formError"
          class="form-alert form-alert--error"
          role="alert"
          aria-live="assertive"
        >
          {{ formError }}
        </div>

        <div class="form-group">
          <label for="af-nombre">Nombre</label>
          <input id="af-nombre" v-model.trim="productForm.nombre" @input="productForm.nombre = productForm.nombre.replace(/[0-9]/g, '')" type="text" maxlength="100" required />
        </div>

        <div class="form-group">
          <label for="af-categoria">Categoría</label>
          <select id="af-categoria" v-model="productForm.categoria" required>
            <option value="" disabled>Seleccionar</option>
            <option v-for="c in categorias" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="af-precio">Precio ($)</label>
            <input id="af-precio" v-model="productForm.precio" type="number" step="0.01" min="0.01" max="9999.99" required @keydown="['-', 'e', 'E', '+'].includes($event.key) && $event.preventDefault()" />
          </div>
          <div class="form-group">
            <label for="af-stock">Stock</label>
            <input id="af-stock" v-model="productForm.stock" type="number" min="0" max="2147483647" required @keydown="['-', 'e', 'E', '+', '.'].includes($event.key) && $event.preventDefault()" />
          </div>
        </div>

        <div class="form-group">
          <label for="af-imagen">Ruta de imagen (opcional)</label>
          <input id="af-imagen" v-model.trim="productForm.imagen" type="text" placeholder="../view/assets/images/producto.jpg" />
        </div>

        <div class="form-group">
          <label for="af-talla">Tallas (opcional, separadas por " - ")</label>
          <input id="af-talla" v-model.trim="productForm.talla" @input="productForm.talla = productForm.talla.replace(/[^a-zA-Z\s-]/g, '').toUpperCase()" type="text" placeholder="S - M - L - XL" />
        </div>

        <div class="dialog-actions">
          <button type="button" class="btn btn-secondary" @click="closeForm" :disabled="saving">
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary" :disabled="saving">
            {{ saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear' }}
          </button>
        </div>
      </form>
    </dialog>

    <!-- Order Form Dialog -->
    <dialog
      ref="orderFormDialog"
      class="admin-dialog"
      aria-labelledby="order-form-title"
    >
      <form @submit.prevent="saveOrder" novalidate>
        <h2 id="order-form-title">Modificar Estado del Pedido</h2>

        <div
          v-if="orderFormError"
          class="form-alert form-alert--error"
          role="alert"
          aria-live="assertive"
        >
          {{ orderFormError }}
        </div>

        <div class="form-group">
          <label for="of-status">Estado</label>
          <select id="of-status" v-model="orderForm.status" required>
            <option value="Pendiente">Pendiente</option>
            <option value="Procesando">Procesando</option>
            <option value="Enviado">Enviado</option>
            <option value="Entregado">Entregado</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>

        <div class="dialog-actions">
          <button type="button" class="btn btn-secondary" @click="closeOrderForm" :disabled="savingOrder">
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary" :disabled="savingOrder">
            {{ savingOrder ? 'Guardando...' : 'Actualizar Estado' }}
          </button>
        </div>
      </form>
    </dialog>

    <!-- User Form Dialog -->
    <dialog
      ref="userFormDialog"
      class="admin-dialog"
      aria-labelledby="user-form-title"
    >
      <form @submit.prevent="saveUser" novalidate>
        <h2 id="user-form-title">{{ editingUserId ? 'Editar usuario' : 'Nuevo usuario' }}</h2>

        <div
          v-if="userFormError"
          class="form-alert form-alert--error"
          role="alert"
          aria-live="assertive"
        >
          {{ userFormError }}
        </div>

        <div class="form-group">
          <label for="uf-username">Nombre de Usuario</label>
          <input 
            id="uf-username" 
            v-model.trim="userForm.username" 
            @input="userForm.username = userForm.username.replace(/[^a-zA-Z0-9_ \-]/g, '')"
            type="text" 
            maxlength="50"
            required 
          />
        </div>

        <div class="form-group">
          <label for="uf-email">Correo Electrónico</label>
          <input 
            id="uf-email" 
            v-model.trim="userForm.email" 
            @input="userForm.email = userForm.email.replace(/\s/g, '')"
            type="email" 
            maxlength="100"
            required 
          />
        </div>

        <div class="form-group">
          <label for="uf-password">Contraseña {{ editingUserId ? '(Dejar en blanco para no cambiar)' : '' }}</label>
          <input 
            id="uf-password" 
            v-model="userForm.password" 
            type="password" 
            maxlength="100"
            :required="!editingUserId" 
          />
        </div>

        <div class="form-group">
          <label for="uf-role">Rol</label>
          <select id="uf-role" v-model="userForm.role" required>
            <option value="user">Usuario normal</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <div class="dialog-actions">
          <button type="button" class="btn btn-secondary" @click="closeUserForm" :disabled="savingUser">
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary" :disabled="savingUser">
            {{ savingUser ? 'Guardando...' : editingUserId ? 'Actualizar' : 'Crear' }}
          </button>
        </div>
      </form>
    </dialog>

    <!-- Delete Confirmation Dialog -->
    <dialog
      ref="deleteDialog"
      class="admin-dialog admin-dialog--small"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-desc"
    >
      <h2 id="delete-dialog-title">Confirmar eliminación</h2>
      <p id="delete-dialog-desc">
        ¿Estás seguro de eliminar <strong>{{ deleteName }}</strong>?
        Esta acción no se puede deshacer.
      </p>
      <div class="dialog-actions">
        <button type="button" class="btn btn-secondary" @click="closeDelete">
          Cancelar
        </button>
        <button type="button" class="btn btn-primary" style="background:#b91c1c" @click="executeDelete">
          Eliminar
        </button>
      </div>
    </dialog>
  </section>
</template>

<style scoped>
.admin-section {
  margin-top: 1.2rem;
}

.admin-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid var(--line);
}

.admin-tabs button {
  background: none;
  border: none;
  padding: 0.75rem 1.25rem;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--muted);
  cursor: pointer;
  transition: color 0.15s, box-shadow 0.15s;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
}

.admin-tabs button:hover {
  color: var(--ink);
}

.admin-tabs button.active,
.admin-tabs button[aria-selected="true"] {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.admin-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.admin-count {
  font-size: 0.9rem;
  color: var(--muted);
  font-weight: 500;
}

.admin-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--line);
  border-radius: 1rem;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.admin-table th {
  background: var(--surface-soft);
  text-align: left;
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--muted);
  border-bottom: 1px solid var(--line);
  white-space: nowrap;
}

.admin-table td {
  padding: 0.7rem 1rem;
  border-bottom: 1px solid var(--line);
  vertical-align: top;
}

.admin-table tr:last-child td {
  border-bottom: none;
}

.admin-table tr:hover td {
  background: var(--surface-soft);
}

.admin-table .actions-cell {
  white-space: nowrap;
}

.stock-low {
  color: #b91c1c;
  font-weight: 600;
}

.role-admin {
  background: var(--accent);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}

.role-user {
  background: var(--surface-soft);
  color: var(--ink);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.status-badge {
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: inline-block;
}

.status-pendiente { background: #fef08a; color: #854d0e; }
.status-procesando { background: #bae6fd; color: #0369a1; }
.status-enviado { background: #ddd6fe; color: #5b21b6; }
.status-entregado { background: #bbf7d0; color: #166534; }
.status-cancelado { background: #fecaca; color: #991b1b; }

.btn-action {
  background: none;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
  padding: 0.4rem 0.5rem;
  cursor: pointer;
  color: var(--muted);
  transition: color 0.15s, border-color 0.15s, background 0.15s;
  margin-right: 0.3rem;
}

.btn-action--edit:hover {
  color: var(--accent);
  border-color: var(--accent);
  background: rgba(12, 77, 99, 0.06);
}

.btn-action--delete:hover {
  color: #b91c1c;
  border-color: #b91c1c;
  background: rgba(185, 28, 28, 0.06);
}

.order-detail-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.2rem;
}

.order-detail-list li {
  font-size: 0.85rem;
}

.muted {
  color: var(--muted);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  color: var(--muted);
}

.spinner {
  width: 36px;
  height: 36px;
  border: 4px solid var(--line);
  border-top: 4px solid var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-message {
  text-align: center;
  padding: 2rem;
  color: var(--muted);
}

.form-alert {
  padding: 0.75rem 1rem;
  border-radius: 0.7rem;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.form-alert--error {
  background: rgba(185, 28, 28, 0.1);
  color: #b91c1c;
  border: 1px solid rgba(185, 28, 28, 0.25);
}

/* Dialog */
.admin-dialog {
  border: 1px solid var(--line);
  border-radius: 1.3rem;
  padding: 2rem;
  max-width: 520px;
  width: calc(100% - 2rem);
  background: var(--surface);
  box-shadow: var(--shadow);
  margin: 0;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.admin-dialog::backdrop {
  background: rgba(21, 33, 42, 0.5);
  backdrop-filter: blur(3px);
}

.admin-dialog--small {
  max-width: 380px;
}

.admin-dialog h2 {
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 1rem;
}

.admin-dialog p {
  color: var(--muted);
  line-height: 1.6;
  margin-bottom: 1.25rem;
}

.form-group {
  display: grid;
  gap: 0.35rem;
  margin-bottom: 1rem;
}

.form-group label {
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.6rem 0.85rem;
  border: 1px solid var(--line);
  border-radius: 0.6rem;
  background: var(--surface-soft);
  color: var(--ink);
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: 3px solid var(--accent-3);
  outline-offset: 2px;
  border-color: var(--accent);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

@media (max-width: 600px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

/* ─── Panel de Reportes ───────────────────────────────────────────────── */
.report-filters {
  margin-bottom: 1.5rem;
}

.range-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.range-chip {
  background: var(--surface-soft);
  border: 1px solid var(--line);
  border-radius: 9999px;
  padding: 0.45rem 0.95rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--muted);
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}

.range-chip:hover {
  color: var(--ink);
  border-color: var(--accent);
}

.range-chip.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.custom-range {
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid var(--line);
  border-radius: 0.9rem;
  background: var(--surface-soft);
}

.custom-range .form-group {
  margin-bottom: 0;
}

.report-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  margin-bottom: 1.75rem;
}

.report-card {
  border: 1px solid var(--line);
  border-radius: 1rem;
  padding: 1.1rem 1.25rem;
  background: var(--surface-soft);
  display: grid;
  gap: 0.4rem;
}

.report-card__label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--muted);
  font-weight: 600;
}

.report-card__value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--ink);
}

.report-block {
  margin-bottom: 2rem;
}

.report-block__title {
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
  color: var(--ink);
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  height: 240px;
  padding: 1.5rem 1rem 0;
  border: 1px solid var(--line);
  border-radius: 1rem;
  background: var(--surface-soft);
  overflow-x: auto;
}

.bar-chart__col {
  flex: 1 0 32px;
  min-width: 32px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 0.35rem;
}

.bar-chart__bar {
  width: 70%;
  max-width: 46px;
  min-height: 2px;
  background: linear-gradient(180deg, var(--accent), var(--accent-3, var(--accent)));
  border-radius: 6px 6px 0 0;
  transition: height 0.3s ease;
}

.bar-chart__value {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--muted);
  white-space: nowrap;
}

.bar-chart__label {
  font-size: 0.68rem;
  color: var(--muted);
  white-space: nowrap;
}

.rank-bar {
  width: 100%;
  min-width: 80px;
  height: 8px;
  background: var(--surface-soft);
  border: 1px solid var(--line);
  border-radius: 9999px;
  overflow: hidden;
}

.rank-bar__fill {
  height: 100%;
  background: var(--accent);
  border-radius: 9999px;
  transition: width 0.3s ease;
}
</style>
