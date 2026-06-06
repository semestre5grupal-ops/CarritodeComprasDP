<template>
  <Teleport to="body">
    <div class="toast-container" aria-live="polite" aria-atomic="true">
      <TransitionGroup name="slide-up">
        <div v-for="t in toasts" :key="t.id" class="toast">{{ t.message }}</div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from '../composables/useToast.js'
const { toasts } = useToast()
</script>
