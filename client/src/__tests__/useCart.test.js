/**
 * useCart.test.js
 * ════════════════════════════════════════════════════════════════
 * Pruebas UNITARIAS del composable useCart.js
 *
 * Tipo: Unitarias (no requieren servidor ni base de datos)
 * Herramienta: Vitest
 *
 * Cobertura:
 *   ✓ addProduct()        — Agregar producto al carrito
 *   ✓ addProduct()        — Incrementar cantidad si ya existe
 *   ✓ updateQuantity()    — Actualizar cantidad de un producto
 *   ✓ updateQuantity()    — Eliminar producto si cantidad <= 0
 *   ✓ removeProduct()     — Eliminar producto del carrito
 *   ✓ clearCart()         — Vaciar todo el carrito
 *   ✓ itemCount           — Computed: total de ítems
 *   ✓ subtotal            — Computed: subtotal sin descuento
 *   ✓ discount            — Computed: descuento con cupón DEPORTE20
 *   ✓ total               — Computed: total con descuento aplicado
 *   ✓ toggleSelected()    — Selección de productos
 *   ✓ removeSelected()    — Eliminar productos seleccionados
 *   ✓ openDrawer/close    — Control del drawer del carrito
 *   ✓ Persistencia        — Guardar y cargar desde localStorage
 * ════════════════════════════════════════════════════════════════
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

// ─── Mock de LocalStorage ────────────────────────────────────────────────────
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value) },
    removeItem: (key) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true })
Object.defineProperty(globalThis, 'sessionStorage', { value: localStorageMock, writable: true })

// ─── Productos de Prueba ─────────────────────────────────────────────────────
const productoA = { id: 1, nombre: 'Camiseta Sport', precio: 25.00, stock: 10, imagen: null, categoria: 'tops' }
const productoB = { id: 2, nombre: 'Leggins Pro',    precio: 45.00, stock: 5,  imagen: null, categoria: 'bottoms' }

// ─── Import dinámico para resetear estado entre tests ───────────────────────
// useCart usa refs globales (singleton), así que resetamos limpiando el localStorage
// y usando clearCart() entre cada test.

// Importamos el módulo una sola vez (el singleton)
import { useCart } from '../models/useCart'

// ════════════════════════════════════════════════════════════════
// BLOQUE 1: Operaciones básicas del carrito
// ════════════════════════════════════════════════════════════════
describe('useCart() — Operaciones básicas', () => {
  const { items, addProduct, removeProduct, clearCart, itemCount, subtotal } = useCart()

  beforeEach(() => {
    clearCart()
  })

  afterEach(() => {
    localStorageMock.clear()
  })

  it('✓ Debe estar vacío al inicio', () => {
    expect(items.value).toHaveLength(0)
    expect(itemCount.value).toBe(0)
    expect(subtotal.value).toBe(0)
  })

  it('✓ addProduct: debe agregar un producto nuevo al carrito', () => {
    addProduct(productoA, 2)

    expect(items.value).toHaveLength(1)
    expect(items.value[0].id).toBe(1)
    expect(items.value[0].cantidad).toBe(2)
    expect(items.value[0].nombre).toBe('Camiseta Sport')
  })

  it('✓ addProduct: debe incrementar la cantidad si el producto ya está en el carrito', () => {
    addProduct(productoA, 1)
    addProduct(productoA, 3)

    expect(items.value).toHaveLength(1)
    expect(items.value[0].cantidad).toBe(4)
  })

  it('✓ addProduct: debe agregar productos diferentes como ítems separados', () => {
    addProduct(productoA, 1)
    addProduct(productoB, 2)

    expect(items.value).toHaveLength(2)
  })

  it('✓ removeProduct: debe eliminar el producto correcto del carrito', () => {
    addProduct(productoA, 1)
    addProduct(productoB, 1)
    removeProduct(productoA.id)

    expect(items.value).toHaveLength(1)
    expect(items.value[0].id).toBe(productoB.id)
  })

  it('✓ clearCart: debe vaciar completamente el carrito', () => {
    addProduct(productoA, 3)
    addProduct(productoB, 2)
    clearCart()

    expect(items.value).toHaveLength(0)
    expect(itemCount.value).toBe(0)
  })
})

// ════════════════════════════════════════════════════════════════
// BLOQUE 2: Computed properties (itemCount, subtotal, total, discount)
// ════════════════════════════════════════════════════════════════
describe('useCart() — Propiedades computadas', () => {
  const { addProduct, clearCart, itemCount, subtotal, total, discount, couponCode } = useCart()

  beforeEach(() => {
    clearCart()
    couponCode.value = ''
  })

  it('✓ itemCount: debe contar el total de unidades, no de productos únicos', () => {
    addProduct(productoA, 3)
    addProduct(productoB, 2)

    expect(itemCount.value).toBe(5)
  })

  it('✓ subtotal: debe calcular la suma correcta de precio × cantidad', () => {
    addProduct(productoA, 2)  // 2 × 25 = 50
    addProduct(productoB, 1)  // 1 × 45 = 45

    expect(subtotal.value).toBe(95)
  })

  it('✓ discount: debe ser 0 sin cupón aplicado', () => {
    addProduct(productoA, 2)

    expect(discount.value).toBe(0)
    expect(total.value).toBe(subtotal.value)
  })

  it('✓ discount: debe aplicar 20% con el cupón DEPORTE20', () => {
    addProduct(productoA, 2)  // subtotal = 50
    couponCode.value = 'DEPORTE20'

    expect(discount.value).toBe(10)  // 20% de 50
    expect(total.value).toBe(40)     // 50 - 10
  })

  it('✓ discount: el cupón debe ser case-insensitive', () => {
    addProduct(productoA, 2)
    couponCode.value = 'deporte20'

    expect(discount.value).toBe(10)
  })

  it('✓ total: debe ser igual al subtotal cuando no hay descuento', () => {
    addProduct(productoB, 1)

    expect(total.value).toBe(45)
  })
})

// ════════════════════════════════════════════════════════════════
// BLOQUE 3: updateQuantity()
// ════════════════════════════════════════════════════════════════
describe('useCart() — updateQuantity()', () => {
  const { items, addProduct, updateQuantity, clearCart } = useCart()

  beforeEach(() => {
    clearCart()
  })

  it('✓ Debe actualizar la cantidad del producto correctamente', () => {
    addProduct(productoA, 1)
    updateQuantity(productoA.id, 5)

    expect(items.value[0].cantidad).toBe(5)
  })

  it('✓ Debe respetar el límite de stock (no superar el stock disponible)', () => {
    addProduct(productoA, 1) // stock = 10
    updateQuantity(productoA.id, 99)

    expect(items.value[0].cantidad).toBe(productoA.stock) // = 10
  })

  it('✓ Debe eliminar el producto si la cantidad es 0', () => {
    addProduct(productoA, 3)
    updateQuantity(productoA.id, 0)

    expect(items.value).toHaveLength(0)
  })

  it('✓ Debe eliminar el producto si la cantidad es negativa', () => {
    addProduct(productoA, 3)
    updateQuantity(productoA.id, -1)

    expect(items.value).toHaveLength(0)
  })
})

// ════════════════════════════════════════════════════════════════
// BLOQUE 4: Selección de productos (selectedIds)
// ════════════════════════════════════════════════════════════════
describe('useCart() — toggleSelected() y removeSelected()', () => {
  const { items, addProduct, clearCart, selectedIds, toggleSelected, removeSelected } = useCart()

  beforeEach(() => {
    clearCart()
  })

  it('✓ toggleSelected: debe agregar un ID al set de seleccionados', () => {
    toggleSelected(1)
    expect(selectedIds.value.has(1)).toBe(true)
  })

  it('✓ toggleSelected: debe quitar el ID si ya estaba seleccionado (toggle)', () => {
    toggleSelected(1)
    toggleSelected(1)
    expect(selectedIds.value.has(1)).toBe(false)
  })

  it('✓ removeSelected: debe eliminar solo los productos seleccionados', () => {
    addProduct(productoA, 1)
    addProduct(productoB, 1)
    toggleSelected(productoA.id)
    removeSelected()

    expect(items.value).toHaveLength(1)
    expect(items.value[0].id).toBe(productoB.id)
  })

  it('✓ removeSelected: debe limpiar el set de seleccionados al terminar', () => {
    addProduct(productoA, 1)
    toggleSelected(productoA.id)
    removeSelected()

    expect(selectedIds.value.size).toBe(0)
  })
})

// ════════════════════════════════════════════════════════════════
// BLOQUE 5: Control del Drawer
// ════════════════════════════════════════════════════════════════
describe('useCart() — openDrawer() y closeDrawer()', () => {
  const { drawerOpen, openDrawer, closeDrawer, clearCart } = useCart()

  beforeEach(() => {
    clearCart()
    drawerOpen.value = false
  })

  it('✓ openDrawer: debe cambiar drawerOpen a true', () => {
    openDrawer()
    expect(drawerOpen.value).toBe(true)
  })

  it('✓ closeDrawer: debe cambiar drawerOpen a false', () => {
    openDrawer()
    closeDrawer()
    expect(drawerOpen.value).toBe(false)
  })
})

// ════════════════════════════════════════════════════════════════
// BLOQUE 6: Persistencia en localStorage
// ════════════════════════════════════════════════════════════════
describe('useCart() — Persistencia en localStorage', () => {
  const { addProduct, clearCart } = useCart()

  beforeEach(() => {
    clearCart()
    localStorageMock.clear()
  })

  it('✓ Debe guardar el carrito en localStorage al agregar un producto', () => {
    addProduct(productoA, 2)

    const stored = localStorageMock.getItem('shopsport_cart')
    expect(stored).not.toBeNull()

    const parsed = JSON.parse(stored)
    expect(parsed).toHaveLength(1)
    expect(parsed[0].id).toBe(productoA.id)
    expect(parsed[0].cantidad).toBe(2)
  })

  it('✓ Debe guardar un carrito vacío en localStorage al limpiar', () => {
    addProduct(productoA, 1)
    clearCart()

    const stored = localStorageMock.getItem('shopsport_cart')
    const parsed = JSON.parse(stored)
    expect(parsed).toHaveLength(0)
  })
})
