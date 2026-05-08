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
    // Migración para asignar cartId a items legacy
    carrito.forEach(item => {
        if (!item.cartId) {
            item.tallaSeleccionada = item.tallaSeleccionada || item.talla;
            item.cartId = `${item.id}-${item.tallaSeleccionada}`;
        }
    });
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
 * Busca un item del carrito por su cartId o id.
 * @param {string|number} identifier - ID del carrito o ID del producto
 * @returns {Object|null} Item encontrado o null
 */
export function getCartItemById(identifier) {
    return carrito.find(item => item.cartId === String(identifier) || String(item.id) === String(identifier)) || null;
}

/**
 * Retorna la cantidad total de un producto en el carrito (sumando todas las tallas).
 * @param {number|string} id - ID del producto
 * @returns {number} Cantidad total en el carrito
 */
export function getProductQuantityInCart(id) {
    return carrito.filter(item => String(item.id) === String(id)).reduce((acc, item) => acc + (item.cantidad || 0), 0);
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
 * @param {string} [tallaSeleccionada] - Talla específica elegida por el usuario
 * @returns {Array<Object>|false} Carrito actualizado o false si no hay stock
 */
export function addToCart(id, tallaSeleccionada) {
    const productInfo = repo.getProductoById(id) || repo.productosDisponibles.find(item => item.id === id);

    if (!productInfo) {
        return false;
    }

    const talla = tallaSeleccionada || productInfo.talla;
    const cartId = `${id}-${talla}`;
    
    // Buscar si ya existe este producto con esta talla específica
    const productoExistente = carrito.find(item => item.cartId === cartId || (String(item.id) === String(id) && item.tallaSeleccionada === talla));

    // Calcular el stock global usado por todas las tallas de este producto en el carrito
    const cantidadGlobalEnCarrito = getProductQuantityInCart(id);
    const stockDisponibleGlobal = Math.max(0, productInfo.stock - cantidadGlobalEnCarrito);

    if (stockDisponibleGlobal <= 0 && !productoExistente) {
        return false; // No hay stock para añadir uno nuevo
    }

    if (productoExistente && stockDisponibleGlobal <= 0) {
        return false; // No hay stock global para incrementar este existente
    }

    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        carrito.push({
            ...productInfo,
            cartId: cartId,
            cantidad: 1,
            tallaSeleccionada: talla
        });
    }

    guardarCarritoEnStorage();
    return carrito;
}

/**
 * Modifica la cantidad de un producto en el carrito.
 * No permite bajar de 1 (para eso usa deleteItem).
 * @param {string} cartId - ID del carrito (ej. "1-M")
 * @param {number} delta - Cambio de cantidad (+1 o -1)
 * @returns {boolean} true si la operación fue exitosa
 */
export function modifyQuantity(cartId, delta) {
    const producto = carrito.find(item => item.cartId === String(cartId) || String(item.id) === String(cartId));
    if (!producto) return false;

    if (producto.cantidad === 1 && delta === -1) {
        return false; // No puede bajar de 1
    }

    if (delta > 0 && producto.cantidad >= producto.stock) {
        return false; // No hay más stock disponible
    }

    producto.cantidad += delta;
    guardarCarritoEnStorage();
    return true;
}

/**
 * Elimina un producto del carrito por su cartId.
 * @param {string} cartId - ID del carrito a eliminar
 * @returns {Array<Object>} Carrito actualizado
 */
export function deleteItem(cartId) {
    carrito = carrito.filter(item => item.cartId !== String(cartId) && String(item.id) !== String(cartId));
    guardarCarritoEnStorage();
    return carrito;
}

/**
 * Elimina múltiples productos del carrito por sus cartIds.
 * @param {string[]} ids - Array de cartIds a eliminar
 * @returns {Array<Object>} Carrito actualizado
 */
export function removeItemsByIds(ids = []) {
    const stringIds = ids.map(String);
    carrito = carrito.filter(item => !stringIds.includes(item.cartId) && !stringIds.includes(String(item.id)));
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
