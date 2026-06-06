// composables/useModal.js — global product modal state
import { ref } from 'vue'

const activeProduct = ref(null)

export function useModal() {
  function open(product)  { activeProduct.value = product }
  function close()        { activeProduct.value = null }
  return { activeProduct, open, close }
}
