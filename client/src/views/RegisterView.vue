<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { register, loading } = useAuth()

const username = ref('')
const email = ref('')
const password = ref('')
const errors = ref({})
const serverError = ref('')

const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,50}$/

function validate() {
  const errs = {}
  if (!username.value) {
    errs.username = 'El usuario es obligatorio.'
  } else if (!USERNAME_RE.test(username.value)) {
    errs.username = '3-30 caracteres. Solo letras, números y guion bajo.'
  }
  if (!email.value) {
    errs.email = 'El correo es obligatorio.'
  } else if (!EMAIL_RE.test(email.value)) {
    errs.email = 'Ingrese un correo electrónico válido.'
  }
  if (!password.value) {
    errs.password = 'La contraseña es obligatoria.'
  } else if (!PASSWORD_RE.test(password.value)) {
    errs.password = 'Mín. 6 caracteres, mayúscula, minúscula y número.'
  }
  errors.value = errs
  return Object.keys(errs).length === 0
}

async function handleSubmit() {
  serverError.value = ''
  if (!validate()) return

  try {
    await register(username.value, email.value, password.value)
    router.push('/')
  } catch (err) {
    if (err.status === 409) {
      serverError.value = 'El usuario o correo ya está registrado.'
    } else {
      serverError.value = err.message || 'Error al registrarse.'
    }
  }
}
</script>

<template>
  <section class="auth-section wrap-wide" aria-labelledby="register-title">
    <form
      class="auth-form"
      novalidate
      @submit.prevent="handleSubmit"
      aria-label="Formulario de registro"
    >
      <h2 id="register-title">Crear cuenta</h2>

      <div
        v-if="serverError"
        class="form-alert form-alert--error"
        role="alert"
        aria-live="assertive"
      >
        {{ serverError }}
      </div>

      <div class="form-group" :class="{ 'has-error': errors.username }">
        <label for="reg-username">Usuario</label>
        <input
          id="reg-username"
          v-model="username"
          type="text"
          autocomplete="username"
          maxlength="30"
          required
          :aria-invalid="errors.username ? 'true' : 'false'"
          :aria-describedby="errors.username ? 'reg-username-err' : undefined"
          placeholder="Ej: juanperez"
        />
        <p
          v-if="errors.username"
          :id="`reg-username-err`"
          class="field-error"
          role="alert"
        >
          {{ errors.username }}
        </p>
      </div>

      <div class="form-group" :class="{ 'has-error': errors.email }">
        <label for="reg-email">Correo electrónico</label>
        <input
          id="reg-email"
          v-model="email"
          type="email"
          autocomplete="email"
          maxlength="100"
          required
          :aria-invalid="errors.email ? 'true' : 'false'"
          :aria-describedby="errors.email ? 'reg-email-err' : undefined"
          placeholder="ejemplo@correo.com"
        />
        <p
          v-if="errors.email"
          :id="`reg-email-err`"
          class="field-error"
          role="alert"
        >
          {{ errors.email }}
        </p>
      </div>

      <div class="form-group" :class="{ 'has-error': errors.password }">
        <label for="reg-password">Contraseña</label>
        <input
          id="reg-password"
          v-model="password"
          type="password"
          autocomplete="new-password"
          maxlength="50"
          required
          :aria-invalid="errors.password ? 'true' : 'false'"
          :aria-describedby="errors.password ? 'reg-password-err' : undefined"
          placeholder="Mín. 6, mayúscula, minúscula, número"
        />
        <p
          v-if="errors.password"
          :id="`reg-password-err`"
          class="field-error"
          role="alert"
        >
          {{ errors.password }}
        </p>
      </div>

      <button
        type="submit"
        class="btn btn-primary btn--full"
        :disabled="loading"
      >
        {{ loading ? 'Registrando...' : 'Crear cuenta' }}
      </button>

      <p class="auth-link">
        ¿Ya tienes cuenta?
        <router-link to="/login">Inicia sesión aquí</router-link>
      </p>
    </form>
  </section>
</template>

<style scoped>
.auth-section {
  display: flex;
  justify-content: center;
  padding-top: 2rem;
}

.auth-form {
  width: 100%;
  max-width: 420px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 1.3rem;
  padding: 2rem 1.5rem;
  display: grid;
  gap: 1.25rem;
}

.auth-form h2 {
  font-size: 1.6rem;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.form-group {
  display: grid;
  gap: 0.4rem;
}

.form-group label {
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink);
}

.form-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--line);
  border-radius: 0.7rem;
  background: var(--surface-soft);
  color: var(--ink);
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus {
  outline: 3px solid var(--accent-3);
  outline-offset: 2px;
  border-color: var(--accent);
}

.form-group.has-error input {
  border-color: #b91c1c;
}

.form-group.has-error input:focus {
  outline-color: #b91c1c;
}

.field-error {
  font-size: 0.8rem;
  color: #b91c1c;
  font-weight: 500;
}

.form-alert {
  padding: 0.75rem 1rem;
  border-radius: 0.7rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.form-alert--error {
  background: rgba(185, 28, 28, 0.1);
  color: #b91c1c;
  border: 1px solid rgba(185, 28, 28, 0.25);
}

.btn--full {
  width: 100%;
}

.auth-link {
  text-align: center;
  font-size: 0.9rem;
  color: var(--muted);
}

.auth-link a {
  color: var(--accent);
  text-decoration: underline;
  font-weight: 600;
}
</style>
