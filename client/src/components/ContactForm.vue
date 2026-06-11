<template>
  <section id="contacto-section" class="contact-section" aria-labelledby="sec-formulario">
      <div class="section-heading">
          <h2 id="sec-formulario">Escríbenos</h2>
          <p>Déjanos tus datos y te contactaremos por WhatsApp.</p>
      </div>

      <form id="form-contacto" class="form-accesible" novalidate aria-label="Formulario de contacto" @submit.prevent="handleSubmit">
          <div class="form-group">
              <label for="nombre">Nombre completo:</label>
              <input type="text" id="nombre" name="nombre" required minlength="3" maxlength="50"
                  aria-describedby="err-nombre" autocomplete="name"
                  aria-required="true" v-model="form.nombre" @input="sanitizeNombre" @blur="validateNombre">
              <span id="err-nombre" class="error-msg" role="alert" :hidden="!errors.nombre">{{ errors.nombre || 'El nombre es obligatorio y debe tener al menos 3 caracteres (solo letras).' }}</span>
          </div>

          <div class="form-group">
              <label for="correo">Correo electrónico:</label>
              <input type="email" id="correo" name="correo" required autocomplete="email"
                  aria-describedby="err-correo" aria-required="true" v-model="form.correo" @blur="validateCorreo">
              <span id="err-correo" class="error-msg" role="alert" :hidden="!errors.correo">{{ errors.correo || 'Revisa el formato (p. ej., usuario@dominio.com).' }}</span>
          </div>

          <div class="form-group">
              <label for="telefono">Teléfono (10 dígitos, empieza con 09):</label>
              <input type="tel" id="telefono" name="telefono" required pattern="^09\d{8}$"
                  inputmode="numeric" aria-describedby="err-telefono" aria-required="true" v-model="form.telefono" @input="sanitizeTelefono" @blur="validateTelefono">
              <span id="err-telefono" class="error-msg" role="alert" :hidden="!errors.telefono">{{ errors.telefono || 'El teléfono debe empezar con 09 y contener exactamente 10 dígitos.' }}</span>
          </div>

          <button type="submit" id="btn-submit-contacto" class="btn btn-primary"
              style="width: 100%; margin-top: 1rem;" :disabled="hasErrors || isSubmitting" :aria-disabled="hasErrors || isSubmitting">Enviar mensaje</button>
              
          <p v-if="success" style="margin-top: 1rem; color: #166534; font-weight: 600; text-align: center;">✅ Mensaje enviado. ¡Gracias por contactarnos!</p>
      </form>
  </section>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'

const NOMBRE_RE   = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{3,50}$/
const EMAIL_RE    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TELEFONO_RE = /^09\d{8}$/
const SQL_RE      = /[;'"\\-]|\/\*|\*\//g
const XSS_RE      = /[<>]/g

const form    = reactive({ nombre: '', correo: '', telefono: '' })
const errors  = reactive({ nombre: '', correo: '', telefono: '' })
const success = ref(false)
const isSubmitting = ref(false)

const hasErrors = computed(() => {
  return !form.nombre || !form.correo || !form.telefono || !!errors.nombre || !!errors.correo || !!errors.telefono
})

function sanitize(val) {
  return val.replace(SQL_RE, '').replace(XSS_RE, c => c === '<' ? '&lt;' : '&gt;')
}

function sanitizeNombre()   { form.nombre   = sanitize(form.nombre).replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '') }
function sanitizeTelefono() { form.telefono = form.telefono.replace(/\D/g, '') }

function validateNombre()   {
  errors.nombre   = NOMBRE_RE.test(form.nombre.trim())   ? '' : 'Ingresa un nombre válido (3-50 letras).'
}
function validateCorreo()   {
  errors.correo   = EMAIL_RE.test(form.correo.trim())    ? '' : 'Ingresa un correo electrónico válido.'
}
function validateTelefono() {
  errors.telefono = TELEFONO_RE.test(form.telefono)      ? '' : 'El teléfono debe comenzar con 09 y tener 10 dígitos.'
}

function handleSubmit() {
  validateNombre(); validateCorreo(); validateTelefono()
  if (hasErrors.value) return
  isSubmitting.value = true
  // Simulando envío
  setTimeout(() => {
    isSubmitting.value = false
    success.value = true
    form.nombre = ''; form.correo = ''; form.telefono = ''
    setTimeout(() => { success.value = false }, 5000)
  }, 800)
}
</script>

<style scoped>
.contact-section {
  max-width: 600px;
  margin: 3rem auto;
  padding: 2rem;
  background: var(--surface);
  border-radius: 1rem;
  box-shadow: var(--shadow);
  border: 1px solid var(--line);
}

.section-heading {
  text-align: center;
  margin-bottom: 2rem;
}

.section-heading h2 {
  font-size: 2rem;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}
</style>
