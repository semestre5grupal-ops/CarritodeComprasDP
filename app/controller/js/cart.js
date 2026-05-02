/**
 * CART.JS — Modelo del Carrito de Compras
 * =========================================================
 * Responsabilidades:
 * - Mantener el estado del carrito en memoria
 * - Persistir y recuperar el carrito desde localStorage (Estrategia 1)
 * - Registrar timestamp de sesión en sessionStorage (Estrategia 2)
 * - Exportar operaciones CRUD del carrito
 */

import { repo } from './repo.js';
import { storage } from './storage.js';

/** @type {Array<Object>} Estado en memoria del carrito */
let carrito = [];

// ====================================================================
// PERSISTENCIA INTERNA
// ====================================================================

/**
 * Guarda el carrito en localStorage y actualiza el timestamp de sesión.
 * Usa las Estrategias 1 (localStorage) y 2 (sessionStorage) de persistencia.
 * @private
 */
function guardarCarritoEnStorage() {
    storage.guardarCarritoLocalStorage(carrito);
    storage.guardarTimestampSesion();
}

// ====================================================================
// OPERACIONES DEL CARRITO
// ====================================================================

/**
 * Carga el carrito desde localStorage al iniciar la app.
 * Si los datos están corruptos, retorna un array vacío.
 * @returns {Array<Object>} Carrito cargado
 */
export function loadCart() {
    carrito = storage.recuperarCarritoLocalStorage();
    if (!Array.isArray(carrito)) {
        carrito = [];
    }
    return carrito;
}

/**
 * Retorna todos los items actuales del carrito.
 * @returns {Array<Object>}
 */
export function getCartItems() {
    return carrito;
}

/**
 * Busca un item del carrito por su ID.
 * @param {number} id - ID del producto
 * @returns {Object|null} Item encontrado o null
 */
export function getCartItemById(id) {
    return carrito.find(item => item.id === id) || null;
}

/**
 * Calcula el total de unidades en el carrito.
 * @returns {number} Total de artículos
 */
export function getTotalItems() {
    return carrito.reduce((acc, item) => acc + (item.cantidad || 0), 0);
}

/**
 * Añade un producto al carrito.
 * Si ya existe, incrementa la cantidad; si no, lo agrega como nuevo item.
 * @param {number} id - ID del producto a añadir
 * @returns {Array<Object>} Carrito actualizado
 */
export function addToCart(id) {
    const productoExistente = carrito.find(item => item.id === id);

    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        const productInfo = repo.getProductoById(id) ||
            repo.productosDisponibles.find(item => item.id === id);
        if (productInfo) {
            carrito.push({ ...productInfo, cantidad: 1 });
        }
    }

    guardarCarritoEnStorage();
    return carrito;
}

/**
 * Modifica la cantidad de un producto en el carrito.
 * No permite bajar de 1 (para eso usa deleteItem).
 * @param {number} id - ID del producto
 * @param {number} delta - Cambio de cantidad (+1 o -1)
 * @returns {boolean} true si la operación fue exitosa
 */
export function modifyQuantity(id, delta) {
    const producto = carrito.find(item => item.id === id);
    if (!producto) return false;

    if (producto.cantidad === 1 && delta === -1) {
        return false; // No puede bajar de 1
    }

    producto.cantidad += delta;
    guardarCarritoEnStorage();
    return true;
}

/**
 * Elimina un producto del carrito por su ID.
 * @param {number} id - ID del producto a eliminar
 * @returns {Array<Object>} Carrito actualizado
 */
export function deleteItem(id) {
    carrito = carrito.filter(item => item.id !== id);
    guardarCarritoEnStorage();
    return carrito;
}

/**
 * Elimina múltiples productos del carrito por sus IDs.
 * @param {number[]} ids - Array de IDs a eliminar
 * @returns {Array<Object>} Carrito actualizado
 */
export function removeItemsByIds(ids = []) {
    carrito = carrito.filter(item => !ids.includes(item.id));
    guardarCarritoEnStorage();
    return carrito;
}

/**
 * Vacía completamente el carrito.
 * @returns {Array<Object>} Array vacío
 */
export function clearCart() {
    carrito = [];
    guardarCarritoEnStorage();
    return carrito;
}
