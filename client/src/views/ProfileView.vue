<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '../models/useAuth'

const { user, fetchProfile, updateProfile } = useAuth()

// ─── Estado del formulario ────────────────────────────────────
const form = ref({
  username: '',
  email: '',
  nombre: '',
  celular: '',
  telefono: '',
})

// Errores por campo (validación)
const fieldErrors = ref({
  username: '',
  email: '',
  nombre: '',
  celular: '',
  telefono: '',
})

// Errores de caracteres inválidos (sanitización)
const invalidChar = ref({
  username: false,
  nombre: false,
  celular: false,
  telefono: false,
})

// Variables para re-trigger de animación
const shakeAnim = ref({
  username: false,
  nombre: false,
  celular: false,
  telefono: false,
})

const saving = ref(false)
const loadingProfile = ref(true)
const successMsg = ref('')
const errorMsg = ref('')

// ─── Cargar datos actuales ────────────────────────────────────
onMounted(async () => {
  try {
    const profile = await fetchProfile()
    if (profile) {
      form.value.username = profile.username || ''
      form.value.email = profile.email || ''
      if (profile.cliente) {
        form.value.nombre   = profile.cliente.cli_nombre   || profile.username || ''
        form.value.celular  = profile.cliente.cli_celular  || ''
        form.value.telefono = profile.cliente.cli_telefono || ''
      } else {
        form.value.nombre = profile.username || ''
      }
    }
  } catch (_) {
    errorMsg.value = 'No se pudieron cargar los datos del perfil.'
  } finally {
    loadingProfile.value = false
  }
})

// ─── Funciones auxiliares para la animación ─────────────────
function triggerInvalidChar(field) {
  invalidChar.value[field] = true
  shakeAnim.value[field] = false
  setTimeout(() => { shakeAnim.value[field] = true }, 10) // forzar reflow
}
function clearInvalidChar(field) {
  invalidChar.value[field] = false
  shakeAnim.value[field] = false
}

// ─── Sanitizadores en tiempo real ────────────────────────────
// Username: solo letras (a-z, A-Z, áéíóú y similares), guión bajo y guión
function onUsernameInput(e) {
  const raw = e.target.value
  const clean = raw.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ_-]/g, '')
  if (raw !== clean) {
    triggerInvalidChar('username')
  } else {
    clearInvalidChar('username')
  }
  form.value.username = clean
  e.target.value = clean
  fieldErrors.value.username = clean.length < 3 && clean.length > 0
    ? 'Mínimo 3 caracteres.' : ''
}

// Nombre: solo letras y espacios (sin números ni símbolos)
function onNombreInput(e) {
  const raw = e.target.value
  const clean = raw.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '')
  if (raw !== clean) {
    triggerInvalidChar('nombre')
  } else {
    clearInvalidChar('nombre')
  }
  form.value.nombre = clean
  e.target.value = clean
  fieldErrors.value.nombre = ''
}

// Celular: solo dígitos, máx 10 (Ecuador: 09XXXXXXXX)
function onCelularInput(e) {
  const raw = e.target.value
  const clean = raw.replace(/\D/g, '').slice(0, 10)
  if (raw !== clean) {
    triggerInvalidChar('celular')
  } else {
    clearInvalidChar('celular')
  }
  form.value.celular = clean
  e.target.value = clean
  if (clean.length > 0 && clean.length < 10) {
    fieldErrors.value.celular = 'El celular debe tener 10 dígitos (ej: 0987654321).'
  } else if (clean.length === 10 && !clean.startsWith('09')) {
    fieldErrors.value.celular = 'El celular ecuatoriano debe empezar con 09.'
  } else {
    fieldErrors.value.celular = ''
  }
}

// Teléfono fijo: solo dígitos, 7-9 dígitos (Ecuador: 0X-XXXXXXX)
function onTelefonoInput(e) {
  const raw = e.target.value
  const clean = raw.replace(/\D/g, '').slice(0, 9)
  if (raw !== clean) {
    triggerInvalidChar('telefono')
  } else {
    clearInvalidChar('telefono')
  }
  form.value.telefono = clean
  e.target.value = clean
  if (clean.length > 0 && clean.length < 7) {
    fieldErrors.value.telefono = 'El teléfono fijo debe tener entre 7 y 9 dígitos.'
  } else {
    fieldErrors.value.telefono = ''
  }
}

// ─── Guardar cambios ──────────────────────────────────────────
async function save() {
  successMsg.value = ''
  errorMsg.value   = ''

  // Validar username
  if (!form.value.username.trim() || form.value.username.trim().length < 3) {
    fieldErrors.value.username = 'El nombre de usuario es obligatorio y debe tener al menos 3 caracteres.'
    return
  }
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ_-]{3,60}$/.test(form.value.username.trim())) {
    fieldErrors.value.username = 'Solo se permiten letras, guiones y guión bajo.'
    return
  }

  // Validar email
  if (!form.value.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    fieldErrors.value.email = 'Ingresa un correo electrónico válido.'
    return
  }

  // Validar celular si fue ingresado
  if (form.value.celular && (form.value.celular.length !== 10 || !form.value.celular.startsWith('09'))) {
    fieldErrors.value.celular = 'El celular debe tener 10 dígitos y empezar con 09.'
    return
  }

  // Validar teléfono fijo si fue ingresado
  if (form.value.telefono && (form.value.telefono.length < 7 || form.value.telefono.length > 9)) {
    fieldErrors.value.telefono = 'El teléfono fijo debe tener entre 7 y 9 dígitos.'
    return
  }

  // Si hay algún error de campo pendiente, no guardar
  if (Object.values(fieldErrors.value).some(e => e !== '')) return

  saving.value = true
  try {
    await updateProfile({
      username: form.value.username.trim(),
      email:    form.value.email.trim(),
      nombre:   form.value.nombre.trim()   || form.value.username.trim(),
      celular:  form.value.celular.trim()  || undefined,
      telefono: form.value.telefono.trim() || undefined,
    })
    successMsg.value = '¡Perfil actualizado correctamente! Los comprobantes de compra llegarán al nuevo correo.'
  } catch (err) {
    errorMsg.value = err.message || 'Error al actualizar el perfil.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="profile-wrap wrap-wide" aria-labelledby="profile-title">

    <!-- ── Encabezado ─────────────────────────────────────────── -->
    <div class="profile-hero">
      <div class="avatar-ring">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </div>
      <div>
        <h1 id="profile-title" class="profile-title">Mi Perfil</h1>
        <p class="profile-subtitle">
          Gestiona tu información personal. Los cambios se reflejan en toda la tienda,
          incluidos los correos de confirmación de compra.
        </p>
      </div>
    </div>

    <!-- ── Loading ────────────────────────────────────────────── -->
    <div v-if="loadingProfile" class="loading-state" role="status" aria-live="polite">
      <div class="spinner"></div>
      <p>Cargando tu perfil...</p>
    </div>

    <!-- ── Formulario ─────────────────────────────────────────── -->
    <div v-else class="profile-card">

      <!-- Alertas globales -->
      <div v-if="successMsg" class="alert alert--success" role="alert" aria-live="assertive">
        <span class="alert-icon">✅</span>
        {{ successMsg }}
      </div>
      <div v-if="errorMsg" class="alert alert--error" role="alert" aria-live="assertive">
        <span class="alert-icon">⚠️</span>
        {{ errorMsg }}
      </div>

      <form @submit.prevent="save" novalidate>

        <!-- Sección: Cuenta -->
        <div class="form-section">
          <h2 class="form-section__title">
            <span class="section-icon">🔐</span> Información de cuenta
          </h2>
          <p class="form-section__desc">
            Tu nombre de usuario se usa para iniciar sesión.
            El correo recibirá todas las notificaciones y facturas de compra.
          </p>

          <div class="form-row">
            <!-- Username -->
            <div class="form-group" :class="{ 'form-group--error': fieldErrors.username || invalidChar.username, 'shake': shakeAnim.username }">
              <label for="pf-username">Nombre de usuario</label>
              <input
                id="pf-username"
                :value="form.username"
                @input="onUsernameInput"
                type="text"
                maxlength="60"
                autocomplete="username"
                placeholder="tu_usuario"
                required
                :aria-invalid="!!fieldErrors.username || !!invalidChar.username"
                aria-describedby="err-username"
              />
              <span v-if="invalidChar.username" class="field-error" role="alert">
                Caracter inválido
              </span>
              <span v-else-if="fieldErrors.username" id="err-username" class="field-error" role="alert">
                {{ fieldErrors.username }}
              </span>
              <span v-else class="field-hint">Solo letras, guiones y guión bajo. Sin números.</span>
            </div>

            <!-- Email -->
            <div class="form-group" :class="{ 'form-group--error': fieldErrors.email }">
              <label for="pf-email">
                Correo electrónico
                <span class="label-hint">📧 Las facturas llegan aquí</span>
              </label>
              <input
                id="pf-email"
                v-model.trim="form.email"
                type="email"
                maxlength="40"
                autocomplete="email"
                placeholder="tu@correo.com"
                required
                :aria-invalid="!!fieldErrors.email"
                aria-describedby="err-email"
              />
              <span v-if="fieldErrors.email" id="err-email" class="field-error" role="alert">
                {{ fieldErrors.email }}
              </span>
            </div>
          </div>
        </div>

        <div class="form-divider"></div>

        <!-- Sección: Datos personales -->
        <div class="form-section">
          <h2 class="form-section__title">
            <span class="section-icon">👤</span> Datos personales
          </h2>
          <p class="form-section__desc">
            Estos datos se utilizan para completar tus pedidos y generar tus facturas.
          </p>

          <div class="form-row">
            <!-- Nombre completo -->
            <div class="form-group" :class="{ 'form-group--error': fieldErrors.nombre || invalidChar.nombre, 'shake': shakeAnim.nombre }">
              <label for="pf-nombre">Nombre completo</label>
              <input
                id="pf-nombre"
                :value="form.nombre"
                @input="onNombreInput"
                type="text"
                maxlength="100"
                autocomplete="name"
                placeholder="Juan Pérez"
                :aria-invalid="!!fieldErrors.nombre || !!invalidChar.nombre"
                aria-describedby="err-nombre"
              />
              <span v-if="invalidChar.nombre" class="field-error" role="alert">
                Caracter inválido
              </span>
              <span v-else-if="fieldErrors.nombre" id="err-nombre" class="field-error" role="alert">
                {{ fieldErrors.nombre }}
              </span>
              <span v-else class="field-hint">Solo letras y espacios. Sin números ni símbolos.</span>
            </div>

            <!-- Celular -->
            <div class="form-group" :class="{ 'form-group--error': fieldErrors.celular || invalidChar.celular, 'shake': shakeAnim.celular }">
              <label for="pf-celular">Celular</label>
              <input
                id="pf-celular"
                :value="form.celular"
                @input="onCelularInput"
                type="tel"
                maxlength="10"
                autocomplete="tel"
                placeholder="0987654321"
                :aria-invalid="!!fieldErrors.celular || !!invalidChar.celular"
                aria-describedby="err-celular"
              />
              <span v-if="invalidChar.celular" class="field-error" role="alert">
                Caracter inválido
              </span>
              <span v-else-if="fieldErrors.celular" id="err-celular" class="field-error" role="alert">
                {{ fieldErrors.celular }}
              </span>
              <span v-else class="field-hint">10 dígitos · Ej: 0987654321</span>
            </div>
          </div>

          <div class="form-row">
            <!-- Teléfono fijo -->
            <div class="form-group" :class="{ 'form-group--error': fieldErrors.telefono || invalidChar.telefono, 'shake': shakeAnim.telefono }">
              <label for="pf-telefono">Teléfono fijo <span class="label-optional">(opcional)</span></label>
              <input
                id="pf-telefono"
                :value="form.telefono"
                @input="onTelefonoInput"
                type="tel"
                maxlength="9"
                placeholder="022345678"
                :aria-invalid="!!fieldErrors.telefono || !!invalidChar.telefono"
                aria-describedby="err-telefono"
              />
              <span v-if="invalidChar.telefono" class="field-error" role="alert">
                Caracter inválido
              </span>
              <span v-else-if="fieldErrors.telefono" id="err-telefono" class="field-error" role="alert">
                {{ fieldErrors.telefono }}
              </span>
              <span v-else class="field-hint">7–9 dígitos · Ej: 022345678</span>
            </div>
          </div>
        </div>

        <!-- Acciones -->
        <div class="form-actions">
          <button
            type="submit"
            class="btn-save"
            :disabled="saving"
            :aria-busy="saving"
          >
            <span v-if="saving" class="btn-spinner"></span>
            {{ saving ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </div>

      </form>
    </div>

  </section>
</template>

<style scoped>
/* ─── Layout general ─────────────────────────────────────────── */
.profile-wrap {
  margin-top: 2.5rem;
  margin-bottom: 4rem;
}

/* ─── Hero / Encabezado ──────────────────────────────────────── */
.profile-hero {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid var(--line, #e2e8f0);
}

.avatar-ring {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent, #6366f1) 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: white;
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.35);
}

.profile-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--ink, #1e293b);
  margin: 0 0 0.3rem;
  letter-spacing: -0.02em;
}

.profile-subtitle {
  font-size: 0.9rem;
  color: var(--muted, #64748b);
  margin: 0;
  line-height: 1.55;
  max-width: 520px;
}

/* ─── Loading ────────────────────────────────────────────────── */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem 2rem;
  color: var(--muted, #64748b);
}
.spinner {
  width: 36px;
  height: 36px;
  border: 4px solid var(--line, #e2e8f0);
  border-top-color: var(--accent, #6366f1);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ─── Tarjeta del formulario ─────────────────────────────────── */
.profile-card {
  background: var(--surface, #fff);
  border: 1px solid var(--line, #e2e8f0);
  border-radius: 1.25rem;
  padding: 2.5rem;
  box-shadow: 0 4px 24px rgba(0,0,0,0.05);
}

/* ─── Alertas ────────────────────────────────────────────────── */
.alert {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: 0.75rem;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 1.75rem;
  line-height: 1.5;
}
.alert-icon { font-size: 1.1rem; flex-shrink: 0; margin-top: 1px; }
.alert--success {
  background: rgba(16, 185, 129, 0.08);
  color: #065f46;
  border: 1px solid rgba(16, 185, 129, 0.25);
}
.alert--error {
  background: rgba(185, 28, 28, 0.08);
  color: #b91c1c;
  border: 1px solid rgba(185, 28, 28, 0.22);
}

/* ─── Secciones del form ─────────────────────────────────────── */
.form-section {
  margin-bottom: 1.5rem;
}
.form-section__title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--ink, #1e293b);
  margin: 0 0 0.35rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.section-icon { font-size: 1.1rem; }
.form-section__desc {
  font-size: 0.85rem;
  color: var(--muted, #64748b);
  margin: 0 0 1.25rem;
  line-height: 1.5;
}

.form-divider {
  height: 1px;
  background: var(--line, #e2e8f0);
  margin: 1.75rem 0;
}

/* ─── Filas y grupos del form ────────────────────────────────── */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.form-group label {
  font-size: 0.83rem;
  font-weight: 600;
  color: var(--ink, #1e293b);
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}
.label-hint {
  font-size: 0.75rem;
  color: var(--accent, #6366f1);
  font-weight: 500;
}
.label-optional {
  font-size: 0.75rem;
  color: var(--muted, #94a3b8);
  font-weight: 400;
}
.form-group input {
  padding: 0.65rem 0.9rem;
  border: 1.5px solid var(--line, #e2e8f0);
  border-radius: 0.6rem;
  font-size: 0.9rem;
  color: var(--ink, #1e293b);
  background: var(--surface, #fff);
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
}
.form-group input:focus {
  border-color: var(--accent, #6366f1);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}
.form-group input::placeholder {
  color: var(--muted, #94a3b8);
}

/* Estado de error por campo */
.form-group--error input {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}
.field-error {
  font-size: 0.78rem;
  color: #dc2626;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  animation: fadeIn 0.2s ease;
}
.field-error::before {
  content: '⚠';
  font-size: 0.75rem;
}
.field-hint {
  font-size: 0.75rem;
  color: var(--muted, #94a3b8);
  font-style: italic;
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

@keyframes shakeAnimation {
  0% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  50% { transform: translateX(4px); }
  75% { transform: translateX(-4px); }
  100% { transform: translateX(0); }
}

.shake input {
  animation: shakeAnimation 0.3s ease-in-out;
  border-color: #dc2626 !important;
  color: #dc2626 !important;
  background-color: #fef2f2 !important;
}

/* ─── Botón guardar ──────────────────────────────────────────── */
.form-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 1.5rem;
  border-top: 1px solid var(--line, #e2e8f0);
  margin-top: 0.5rem;
}
.btn-save {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, var(--accent, #6366f1) 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 0.7rem;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
  letter-spacing: 0.01em;
}
.btn-save:hover:not(:disabled) {
  opacity: 0.92;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45);
}
.btn-save:active:not(:disabled) { transform: translateY(0); }
.btn-save:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
}
.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

/* ─── Responsive ─────────────────────────────────────────────── */
@media (max-width: 640px) {
  .profile-hero {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  .profile-card {
    padding: 1.5rem;
  }
  .form-row {
    grid-template-columns: 1fr;
  }
  .btn-save {
    width: 100%;
    justify-content: center;
  }
}
</style>
