<script setup>
import { ref, onMounted } from 'vue'
import OrderController from '../controllers/OrderController'

const orders = ref([])
const loading = ref(true)
const error = ref(null)

async function loadOrders() {
  loading.value = true
  error.value = ''
  try {
    const data = await OrderController.getMyOrders()
    orders.value = data || []
  } catch (err) {
    error.value = err.message || 'Error al cargar mis pedidos'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOrders()
})
</script>

<template>
  <section class="wrap-wide" aria-labelledby="orders-title" style="margin-top: 2rem;">
    <div class="section-heading">
      <h2 id="orders-title">Mis Pedidos</h2>
    </div>

    <div
      v-if="error"
      class="form-alert form-alert--error"
      role="alert"
      aria-live="assertive"
    >
      {{ error }}
    </div>

    <div v-if="loading" class="loading" role="status" aria-live="polite">
      <div class="spinner" aria-hidden="true"></div>
      <p>Cargando tus pedidos...</p>
    </div>

    <div v-else-if="orders.length === 0" class="empty-message" role="status">
      No has realizado ningún pedido aún. ¡Explora nuestro catálogo!
    </div>

    <div v-else class="table-wrap">
      <table class="data-table" aria-label="Historial de mis pedidos">
        <thead>
          <tr>
            <th scope="col">ID Pedido</th>
            <th scope="col">Fecha</th>
            <th scope="col">Productos</th>
            <th scope="col">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="o in orders" :key="o.id">
            <td>#{{ o.id }}</td>
            <td>{{ new Date(o.createdAt).toLocaleDateString('es-EC') }}</td>
            <td>
              <ul class="order-detail-list" v-if="o.detalles?.length">
                <li v-for="(d, index) in o.detalles" :key="'det-' + index">
                  {{ d.producto?.nombre || `Producto #${d.productoId}` }} x{{ d.cantidad }}
                </li>
              </ul>
              <span v-else class="muted">—</span>
            </td>
            <td style="font-weight: 600;">${{ Number(o.total || 0).toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.section-heading {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--line);
}

.table-wrap {
  overflow-x: auto;
  border: 1px solid var(--line);
  border-radius: 1rem;
  margin-bottom: 3rem;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.data-table th {
  background: var(--surface-soft);
  text-align: left;
  padding: 1rem;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--muted);
  border-bottom: 1px solid var(--line);
  white-space: nowrap;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--line);
  vertical-align: top;
  color: var(--ink);
}

.data-table tr:last-child td {
  border-bottom: none;
}

.data-table tr:hover td {
  background: var(--surface-soft);
}

.order-detail-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.3rem;
}

.order-detail-list li {
  font-size: 0.9rem;
  color: var(--ink);
}

.muted {
  color: var(--muted);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
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
  padding: 3rem;
  color: var(--muted);
  font-size: 1.1rem;
}

.form-alert {
  padding: 1rem;
  border-radius: 0.7rem;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
}

.form-alert--error {
  background: rgba(185, 28, 28, 0.1);
  color: #b91c1c;
  border: 1px solid rgba(185, 28, 28, 0.25);
}
</style>
