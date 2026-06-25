<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '../models/useCart'
import OrderController from '../controllers/OrderController'

const router = useRouter()
const { items, total, clearCart } = useCart()

const deliveryMethod = ref('delivery') // 'delivery' | 'pickup'
const storeLocation = ref('')

const stores = ref([])

onMounted(async () => {
  try {
    const data = await OrderController.getLocales()
    stores.value = data.map(b => b.bod_nombre_)
  } catch (err) {
    console.error('Error al cargar locales:', err)
  }
})

const consumidorFinal = ref(false)
const checkoutForm = ref({
  nombre: '',
  cedula: '',
  celular: '',
  telefono: '',
  direccion: ''
})

const submitError = ref('')
const submitting = ref(false)
const showSuccessModal = ref(false)
const orderCreatedId = ref(null)

const isFormValid = computed(() => {
  if (items.value.length === 0) return false
  if (deliveryMethod.value === 'pickup' && !storeLocation.value) return false
  
  if (consumidorFinal.value) return true
  
  if (!checkoutForm.value.nombre || !checkoutForm.value.cedula || !checkoutForm.value.celular) {
    return false
  }
  
  if (deliveryMethod.value === 'delivery' && !checkoutForm.value.direccion) {
    return false
  }
  
  return true
})

function handleConsumidorFinal(e) {
  const isFinal = e.target.checked
  if (isFinal) {
    checkoutForm.value.nombre = 'Consumidor Final'
    checkoutForm.value.cedula = '9999999999999'
    checkoutForm.value.celular = '9999999999'
    checkoutForm.value.telefono = ''
  } else {
    checkoutForm.value.nombre = ''
    checkoutForm.value.cedula = ''
    checkoutForm.value.celular = ''
    checkoutForm.value.telefono = ''
  }
}

async function handleCheckout() {
  if (!isFormValid.value) return
  submitting.value = true
  submitError.value = ''

  try {
    const data = {
      detalles: items.value.map(i => ({
        productoId: i.id,
        cantidad: i.cantidad,
        precioUnitario: i.precio
      })),
      clienteDatos: checkoutForm.value,
      metodoEntrega: deliveryMethod.value,
      localRetiro: storeLocation.value,
      direccionEntrega: checkoutForm.value.direccion
    }
    const res = await OrderController.create(data)
    
    orderCreatedId.value = res.data?.id
    clearCart()
    showSuccessModal.value = true
  } catch (err) {
    submitError.value = err.message || 'Error al procesar el pago'
  } finally {
    submitting.value = false
  }
}

function goToOrders() {
  showSuccessModal.value = false
  router.push('/mis-pedidos')
}
</script>

<template>
  <main class="checkout-page wrap-wide" aria-labelledby="checkout-title">
    <h1 id="checkout-title" class="page-title">Finalizar Compra</h1>

    <div v-if="items.length === 0" class="empty-cart-message">
      <p>Tu carrito está vacío.</p>
      <button class="btn btn-secondary" @click="router.push('/catalog')">Ir al Catálogo</button>
    </div>

    <div v-else class="checkout-layout">
      
      <!-- Columna Izquierda: Formularios -->
      <div class="checkout-steps">
        
        <!-- Paso 1: Método de Entrega -->
        <section class="checkout-card">
          <h2>1. Método de Entrega</h2>
          <div class="delivery-options">
            <label class="delivery-option" :class="{ selected: deliveryMethod === 'delivery' }">
              <input type="radio" v-model="deliveryMethod" value="delivery" name="delivery" />
              <span class="option-icon">🚚</span>
              <div class="option-text">
                <strong>Envío a Domicilio</strong>
                <span>Recibe tu pedido en casa</span>
              </div>
            </label>

            <label class="delivery-option" :class="{ selected: deliveryMethod === 'pickup' }">
              <input type="radio" v-model="deliveryMethod" value="pickup" name="delivery" />
              <span class="option-icon">🏪</span>
              <div class="option-text">
                <strong>Retiro en Local</strong>
                <span>Recoge tú mismo en nuestras tiendas</span>
              </div>
            </label>
          </div>

          <div v-if="deliveryMethod === 'pickup'" class="store-selection fade-in">
            <label for="store-select">Selecciona el local de retiro:</label>
            <select id="store-select" v-model="storeLocation" class="input-base">
              <option value="" disabled>Seleccione un local...</option>
              <option v-for="store in stores" :key="store" :value="store">{{ store }}</option>
            </select>
          </div>
        </section>

        <!-- Paso 2: Datos de Facturación / Envío -->
        <section class="checkout-card">
          <h2>2. Datos de {{ deliveryMethod === 'delivery' ? 'Envío y Facturación' : 'Facturación' }}</h2>

          <div class="form-group consumidor-final-check" v-if="total <= 50">
            <label class="cf-label">
              <input type="checkbox" v-model="consumidorFinal" @change="handleConsumidorFinal" />
              Facturar como Consumidor Final
            </label>
          </div>
          <div class="form-group consumidor-final-check text-muted" v-else>
            <label class="cf-label" style="opacity: 0.6;" title="Solo disponible para compras hasta $50">
              <input type="checkbox" disabled />
              Facturar como Consumidor Final (Solo <= $50)
            </label>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label for="cf-nombre">Nombre y Apellido *</label>
              <input id="cf-nombre" v-model="checkoutForm.nombre" type="text" class="input-base" required @input="checkoutForm.nombre = checkoutForm.nombre.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]/g, '')" :disabled="consumidorFinal" />
            </div>
            <div class="form-group">
              <label for="cf-cedula">Cédula / RUC *</label>
              <input id="cf-cedula" v-model="checkoutForm.cedula" type="text" class="input-base" required maxlength="13" @input="checkoutForm.cedula = checkoutForm.cedula.replace(/[^0-9]/g, '')" :disabled="consumidorFinal" />
            </div>
            <div class="form-group">
              <label for="cf-celular">Celular *</label>
              <input id="cf-celular" v-model="checkoutForm.celular" type="text" class="input-base" required maxlength="10" @input="checkoutForm.celular = checkoutForm.celular.replace(/[^0-9]/g, '')" :disabled="consumidorFinal" />
            </div>
            <div class="form-group">
              <label for="cf-telefono">Teléfono Fijo (Opcional)</label>
              <input id="cf-telefono" v-model="checkoutForm.telefono" type="text" class="input-base" maxlength="10" @input="checkoutForm.telefono = checkoutForm.telefono.replace(/[^0-9]/g, '')" :disabled="consumidorFinal" />
            </div>
            <div class="form-group" v-if="deliveryMethod === 'delivery'" style="grid-column: 1 / -1;">
              <label for="cf-direccion">Dirección de Entrega *</label>
              <textarea id="cf-direccion" v-model="checkoutForm.direccion" class="input-base" required rows="2" placeholder="Ej: Av. Francisco de Orellana, Guayaquil. Edificio World Trade Center, Piso 3"></textarea>
            </div>
          </div>
        </section>
      </div>

      <!-- Columna Derecha: Resumen de Orden -->
      <aside class="checkout-summary">
        <h2>Resumen del Pedido</h2>
        
        <ul class="summary-items">
          <li v-for="item in items" :key="item.id">
            <span class="item-name">{{ item.nombre }} x{{ item.cantidad }}</span>
            <span class="item-price">${{ (item.precio * item.cantidad).toFixed(2) }}</span>
          </li>
        </ul>

        <hr class="summary-divider" />

        <div class="summary-totals">
          <div class="total-row">
            <span>Subtotal</span>
            <span>${{ total.toFixed(2) }}</span>
          </div>
          <div class="total-row">
            <span>Envío</span>
            <span>{{ deliveryMethod === 'pickup' ? 'Gratis' : 'Calculando...' }}</span>
          </div>
          <div class="total-row final-total">
            <span>Total a Pagar</span>
            <span>${{ total.toFixed(2) }}</span>
          </div>
        </div>

        <button 
          class="btn btn-primary btn--full pay-button" 
          :disabled="!isFormValid || submitting"
          @click="handleCheckout"
        >
          {{ submitting ? 'Procesando...' : 'Pagar y Confirmar' }}
        </button>

        <p v-if="submitError" class="error-msg">{{ submitError }}</p>
      </aside>

    </div>

    <!-- Success Modal -->
    <dialog class="success-modal" :open="showSuccessModal">
      <div class="success-content">
        <div class="icon-success">✅</div>
        <h2>¡Pedido Confirmado!</h2>
        <p>Tu pedido #{{ orderCreatedId }} se ha generado exitosamente.</p>
        <button class="btn btn-primary" @click="goToOrders">Ver mis Pedidos</button>
      </div>
    </dialog>
  </main>
</template>

<style scoped>
.checkout-page {
  padding-top: 2rem;
  padding-bottom: 4rem;
}

.page-title {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: var(--ink);
}

.empty-cart-message {
  text-align: center;
  padding: 4rem;
  background: var(--surface);
  border-radius: 1rem;
}

.checkout-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 2rem;
  align-items: start;
}

.checkout-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  border: 1px solid var(--line);
}

.checkout-card h2 {
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  color: var(--ink);
  border-bottom: 1px solid var(--line);
  padding-bottom: 0.5rem;
}

.delivery-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.delivery-option {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 2px solid var(--line);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.delivery-option:hover {
  border-color: var(--accent);
}

.delivery-option.selected {
  border-color: var(--accent);
  background: rgba(14, 165, 233, 0.05);
}

.option-icon {
  font-size: 1.8rem;
  margin: 0 1rem;
}

.option-text strong {
  display: block;
  font-size: 1.05rem;
  color: var(--ink);
}

.option-text span {
  font-size: 0.85rem;
  color: var(--muted);
}

.store-selection {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: var(--surface-soft);
  border-radius: 8px;
}

.store-selection label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.consumidor-final-check {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--surface-soft);
  border-radius: 8px;
  border: 1px solid var(--line);
}

.cf-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  cursor: pointer;
}

.checkout-summary {
  background: var(--surface-soft);
  border-radius: 12px;
  padding: 2rem;
  position: sticky;
  top: 100px;
}

.summary-items {
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
}

.summary-items li {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
}

.item-name {
  color: var(--ink);
}

.summary-divider {
  border: 0;
  border-top: 1px dashed #ccc;
  margin: 1.5rem 0;
}

.total-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  color: var(--muted);
}

.final-total {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--ink);
  margin-top: 1rem;
}

.pay-button {
  margin-top: 1.5rem;
  padding: 1rem;
  font-size: 1.1rem;
}

.pay-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-msg {
  color: #b91c1c;
  margin-top: 1rem;
  font-size: 0.9rem;
  text-align: center;
}

.success-modal {
  border: none;
  border-radius: 1rem;
  padding: 3rem;
  max-width: 400px;
  width: 90%;
  margin: auto;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
}

.success-modal::backdrop {
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
}

.success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.icon-success {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.fade-in {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 900px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
