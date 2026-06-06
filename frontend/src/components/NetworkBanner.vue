<template>
  <div
    id="network-status"
    class="network-status"
    :class="[isOnline ? 'online' : 'offline', { hidden: !visible }]"
    role="alert"
    aria-live="assertive"
  >
    {{ isOnline ? '✅ Conexión restablecida. Sincronizando datos...' : '⚠️ Sin conexión. Modo offline activo.' }}
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isOnline = ref(navigator.onLine)
const visible  = ref(!navigator.onLine)
let hideTimer  = null

function onOnline()  {
  isOnline.value = true
  visible.value  = true
  hideTimer = setTimeout(() => { visible.value = false }, 3000)
}
function onOffline() {
  isOnline.value = false
  visible.value  = true
  clearTimeout(hideTimer)
}

onMounted(() => {
  window.addEventListener('online',  onOnline)
  window.addEventListener('offline', onOffline)
})
onUnmounted(() => {
  window.removeEventListener('online',  onOnline)
  window.removeEventListener('offline', onOffline)
})
</script>
