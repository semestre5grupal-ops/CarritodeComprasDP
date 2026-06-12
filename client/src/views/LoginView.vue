<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../models/useAuth'

const router = useRouter()
const { login, loading } = useAuth()

const username = ref('')
const password = ref('')
const errors = ref({})
const serverError = ref('')


function validateField(field) {
  if (field === 'username') {
    if (!username.value) errors.value.username = 'El usuario es obligatorio.'
    else delete errors.value.username
  }
  if (field === 'password') {
    if (!password.value) errors.value.password = 'La contraseña es obligatoria.'
    else delete errors.value.password
  }
}

function validate() {
  validateField('username')
  validateField('password')
  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  serverError.value = ''
  if (!validate()) return

  try {
    await login(username.value, password.value)
    router.push('/')
  } catch (err) {
    if (err.status === 401) {
      serverError.value = 'Usuario o contraseña incorrectos.'
    } else {
      serverError.value = err.message || 'Error al iniciar sesión.'
    }
  }
}
</script>

<template>
  <section class="auth-section wrap-wide" aria-labelledby="login-title">
    <form
      class="auth-form"
      novalidate
      @submit.prevent="handleSubmit"
      aria-label="Formulario de inicio de sesión"
    >
      <h2 id="login-title">Iniciar sesión</h2>

      <div
        v-if="serverError"
        class="form-alert form-alert--error"
        role="alert"
        aria-live="assertive"
      >
        {{ serverError }}
      </div>

      <div class="form-group" :class="{ 'has-error': errors.username }">
        <label for="login-username">Usuario</label>
        <input
          id="login-username"
          v-model="username"
          type="text"
          autocomplete="username"
          maxlength="30"
          required
          :aria-invalid="errors.username ? 'true' : 'false'"
          :aria-describedby="errors.username ? 'login-username-err' : undefined"
          placeholder="Tu nombre de usuario"
          @blur="validateField('username')"
          @input="errors.username && validateField('username')"
        />
        <p
          v-if="errors.username"
          :id="`login-username-err`"
          class="field-error"
          role="alert"
        >
          {{ errors.username }}
        </p>
      </div>

      <div class="form-group" :class="{ 'has-error': errors.password }">
        <label for="login-password">Contraseña</label>
        <input
          id="login-password"
          v-model="password"
          type="password"
          autocomplete="current-password"
          maxlength="50"
          required
          :aria-invalid="errors.password ? 'true' : 'false'"
          :aria-describedby="errors.password ? 'login-password-err' : undefined"
          placeholder="Tu contraseña"
          @blur="validateField('password')"
          @input="errors.password && validateField('password')"
        />
        <p
          v-if="errors.password"
          :id="`login-password-err`"
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
        {{ loading ? 'Ingresando...' : 'Ingresar' }}
      </button>

      <p class="auth-link">
        ¿No tienes cuenta?
        <router-link to="/register">Regístrate aquí</router-link>
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
