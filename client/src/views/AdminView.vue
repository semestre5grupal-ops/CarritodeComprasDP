<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import ProductController from '../controllers/ProductController'
import OrderController from '../controllers/OrderController'
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
    // Cuando el backend esté listo y desplegado, descomenta la siguiente línea y borra los datos falsos:
    // const data = await api.get('/usuarios')
    // users.value = data || []
    
    // Por ahora, simulamos los datos para que no te dé error 404:
    await new Promise(r => setTimeout(r, 500))
    users.value = [
      { id: 1, username: 'admin', email: 'admin@shopsport.com', role: 'admin' },
      { id: 2, username: 'usuario', email: 'user@shopsport.com', role: 'user' }
    ]
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
  if (isNaN(body.precio) || body.precio <= 0) { formError.value = 'Precio debe ser un número positivo.'; return }
  if (isNaN(body.stock) || body.stock < 0) { formError.value = 'Stock debe ser un número válido.'; return }

  saving.value = true
  try {
    let resData;
    if (editingId.value) {
      resData = await ProductController.update(editingId.value, body)
    } else {
      resData = await ProductController.create(body)
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
      console.log('[DEBUG] Simulando eliminación de pedido en backend:', deletingId.value)
      // await api.delete(`/pedidos/${deletingId.value}`)
      await new Promise(r => setTimeout(r, 500))
      await loadOrders()
    } else if (deleteType.value === 'user') {
      console.log('[DEBUG] Simulando eliminación de usuario en backend:', deletingId.value)
      // await api.delete(`/usuarios/${deletingId.value}`)
      await new Promise(r => setTimeout(r, 500))
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
    console.log('[DEBUG] Simulando actualizar estado del pedido en backend:', editingOrderId.value, orderForm.value)
    // await api.put(`/pedidos/${editingOrderId.value}/status`, { status: orderForm.value.status })
    await new Promise(r => setTimeout(r, 500))
    
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
    console.log('[DEBUG] Simulando guardar usuario en backend:', editingUserId.value, userForm.value)
    /* 
    const payload = { ...userForm.value }
    if (editingUserId.value) {
      if (!payload.password) delete payload.password
      await api.put(`/usuarios/${editingUserId.value}`, payload)
    } else {
      await api.post('/usuarios', payload)
    }
    */
    await new Promise(r => setTimeout(r, 500))
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
            <input id="af-precio" v-model="productForm.precio" type="number" step="0.01" min="0.01" required @keydown="['-', 'e', 'E', '+'].includes($event.key) && $event.preventDefault()" />
          </div>
          <div class="form-group">
            <label for="af-stock">Stock</label>
            <input id="af-stock" v-model="productForm.stock" type="number" min="0" required @keydown="['-', 'e', 'E', '+', '.'].includes($event.key) && $event.preventDefault()" />
          </div>
        </div>

        <div class="form-group">
          <label for="af-imagen">Ruta de imagen (opcional)</label>
          <input id="af-imagen" v-model.trim="productForm.imagen" type="text" placeholder="../view/assets/images/producto.jpg" />
        </div>

        <div class="form-group">
          <label for="af-talla">Tallas (opcional, separadas por " - ")</label>
          <input id="af-talla" v-model.trim="productForm.talla" type="text" placeholder="S - M - L - XL" />
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
</style>
