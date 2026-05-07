/**
 * REPO.JS — Repositorio de Datos de Productos
 * =========================================================
 * Responsabilidades:
 * - Obtener productos desde el JSON local (con cacheo en IndexedDB)
 * - Resolver rutas de imágenes según la página actual
 * - Mantener la lista de productos disponibles en memoria
 *
 * Estrategia de datos:
 * 1. Fetch del JSON local (productos.json)
 * 2. Cacheo automático en IndexedDB (Estrategia 3 de persistencia)
 * 3. Fallback a IndexedDB manejado en catalog.js
 */

import { storage } from './storage.js';

export const repo = {
    /** @type {Array<Object>} Productos disponibles en memoria */
    productosDisponibles: [],

    /**
     * Establece la lista de productos disponibles en memoria.
     * @param {Array<Object>} productos - Array de productos
     */
    setProductosDisponibles(productos = []) {
        this.productosDisponibles = Array.isArray(productos) ? productos : [];
    },

    /**
     * Busca un producto en memoria por su ID.
     * @param {number} id - ID del producto
     * @returns {Object|null} Producto encontrado o null
     */
    getProductoById(id) {
        return this.productosDisponibles.find(producto => producto.id === id) || null;
    },

    /**
     * Resuelve la ruta de imagen de un producto según la ubicación de la página.
     * Maneja las diferencias de ruta entre index.html y catalog.html.
     * @param {string} imagenPath - Ruta relativa de la imagen desde el JSON
     * @returns {string} Ruta resuelta correctamente
     */
    getProductoImagePath(imagenPath) {
        if (!imagenPath) return '';
        const currentPath = location.pathname.replace(/\\/g, '/');
        // catalog.html está en /app/view/, index.html en la raíz
        return currentPath.includes('/app/view/')
            ? imagenPath
            : `app/view/${imagenPath}`;
    },

    /**
     * Calcula la ruta correcta al archivo productos.json
     * según la ubicación actual de la página.
     * @returns {string} Ruta al archivo JSON
     */
    getProductosDataPath() {
        const currentPath = location.pathname.replace(/\\/g, '/');
        return currentPath.includes('/app/view/')
            ? '../data/productos.json'
            : 'app/data/productos.json';
    },

    /**
     * Carga los productos desde el archivo JSON local.
     * Guarda automáticamente en IndexedDB como caché (Estrategia 3).
     * @returns {Promise<Array<Object>>} Lista de productos
     * @throws {Error} Si la respuesta HTTP no es exitosa
     */
    aplicarStockPersistido(productos = []) {
        const stockPersistido = storage.recuperarStockProductos();
        if (!stockPersistido || !Array.isArray(stockPersistido)) {
            return productos;
        }

        return productos.map(producto => {
            const stockGuardado = stockPersistido.find(item => item.id === producto.id);
            return stockGuardado ? { ...producto, stock: stockGuardado.stock } : producto;
        });
    },

    async obtenerProductos() {
        const response = await fetch(this.getProductosDataPath());
        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
        }

        const productos = this.aplicarStockPersistido(await response.json());
        this.productosDisponibles = productos;

        // Cachear en IndexedDB para acceso offline (Estrategia 3)
        try {
            await storage.guardarProductosIndexedDB(productos);
        } catch (error) {
            console.warn('⚠️ No se pudo guardar el catálogo en IndexedDB:', error);
        }

        return productos;
    },

    async guardarStockActual() {
        if (!Array.isArray(this.productosDisponibles)) return false;
        return storage.guardarStockProductos(this.productosDisponibles);
    },

    actualizarStockPorCompra(cartItems = []) {
        if (!Array.isArray(cartItems) || cartItems.length === 0) return;

        cartItems.forEach(item => {
            const producto = this.getProductoById(item.id);
            if (producto) {
                producto.stock = Math.max(0, producto.stock - item.cantidad);
            }
        });

        this.guardarStockActual();
    }
};
