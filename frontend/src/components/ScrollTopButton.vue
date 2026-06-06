<template>
  <button
    id="btn-scroll-top"
    class="btn-scroll-top"
    :class="{ show: show }"
    aria-label="Volver arriba"
    :aria-hidden="!show"
    :tabindex="show ? 0 : -1"
    @click="scrollTop"
  >
    <svg aria-hidden="true" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
        <polyline points="18 15 12 9 6 15"></polyline>
    </svg>
  </button>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
const show = ref(false)
function onScroll() { show.value = window.scrollY > 300 }
function scrollTop() { window.scrollTo({ top: 0, behavior: 'smooth' }) }
onMounted(()   => window.addEventListener('scroll', onScroll))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>
