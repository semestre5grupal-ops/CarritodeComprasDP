<template>
  <aside
    id="cookie-banner"
    class="cookie-banner"
    role="dialog"
    aria-labelledby="cookie-title"
    aria-describedby="cookie-desc"
    :aria-hidden="!visible"
    :style="{ display: visible ? 'flex' : 'none' }"
  >
      <div class="cookie-content wrap-wide">
          <h3 id="cookie-title">Políticas de Compra</h3>
          <p id="cookie-desc">
              Utilizamos cookies propias y almacenamiento local para mejorar tu experiencia, mantener tu carrito de
              compras activo y guardar tus preferencias. ¿Aceptas nuestras políticas de compra?
          </p>
          <div class="cookie-actions">
              <button type="button" id="btn-accept-cookies" class="btn btn-primary" aria-label="Aceptar políticas de compra" @click="accept">Aceptar</button>
              <button type="button" id="btn-reject-cookies" class="btn btn-secondary" aria-label="Rechazar políticas de compra" @click="reject">Rechazar</button>
          </div>
      </div>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const COOKIE_KEY = 'terminosAceptados'
const visible    = ref(false)

onMounted(() => {
  if (getCookie(COOKIE_KEY) !== 'true') {
    visible.value = true
  }
})

function accept() {
  setCookie(COOKIE_KEY, 'true', 365)
  visible.value = false
}
function reject() {
  setCookie(COOKIE_KEY, 'false', 30)
  visible.value = false
}

function setCookie(name, value, days) {
  const d = new Date()
  d.setTime(d.getTime() + days * 86400000)
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`
}
function getCookie(name) {
  return document.cookie.split(';').find(c => c.trim().startsWith(name + '='))?.split('=')[1] || null
}
</script>
