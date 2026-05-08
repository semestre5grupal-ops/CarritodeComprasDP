/**
 * CATALOG.JS — Lógica del Catálogo con Filtros
 * =========================================================
 * Responsabilidades:
 * - Cargar productos desde repo (con fallback a IndexedDB)
 * - Aplicar filtros por género, talla, color y precio
 * - Renderizar las tarjetas de producto
 * - Guardar/recuperar estado de filtros (sessionStorage)
 * - Integrar con el carrito (window.agregarAlCarrito desde app.js)
 */

import { storage } from './storage.js';
import { repo } from './repo.js';
import * as cart from './cart.js';

/** @type {Array<Object>} Productos cargados del catálogo */
let catalogProductos = [];

/**
 * Construye opciones <option> para el selector de talla en el catálogo.
 * @param {string} tallaRango - Ej: "S - XL"
 * @returns {string} HTML de las opciones
 */
function buildCatalogSizeOptions(tallaRango) {
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const parts = tallaRango.split(' - ');
    const start = parts[0].trim().toUpperCase();
    const end   = parts[1] ? parts[1].trim().toUpperCase() : start;
    const si = sizeOrder.indexOf(start);
    const ei = sizeOrder.indexOf(end);
    if (si === -1) return `<option value="${tallaRango}">${tallaRango}</option>`;
    return sizeOrder
        .slice(si, ei !== -1 ? ei + 1 : si + 1)
        .map(s => `<option value="${s}">${s}</option>`)
        .join('');
}

function getStockDisponible(producto) {
    const reservado = cart.getProductQuantityInCart(producto.id);
    return Math.max(0, producto.stock - reservado);
}

// ====================================================================
// INICIALIZACIÓN
// ====================================================================
document.addEventListener('DOMContentLoaded', () => {
    cargarCatalogos();
    inicializarFiltros();
    initFilterToggle();

    // Delegación de clic y teclado para las tarjetas del catálogo
    const grid = document.getElementById('product-grid');
    if (grid) {
        grid.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            if (card) {
                const id = parseInt(card.dataset.id, 10);
                if (id && typeof window.abrirModalProducto === 'function') {
                    window.abrirModalProducto(id);
                }
            }
        });
        grid.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const card = e.target.closest('.product-card');
                if (card) {
                    e.preventDefault();
                    const id = parseInt(card.dataset.id, 10);
                    if (id && typeof window.abrirModalProducto === 'function') {
                        window.abrirModalProducto(id);
                    }
                }
            }
        });
    }
});

function initFilterToggle() {
    const sidebar = document.querySelector('.filters-sidebar');
    const closeBtn = document.querySelector('.filter-toggle-btn');
    const openBtn = document.getElementById('mobile-filter-open');
    const backdrop = document.getElementById('mobile-filter-backdrop');

    if (!sidebar || !closeBtn || !openBtn || !backdrop) return;

    const updateState = (open) => {
        sidebar.classList.toggle('expanded', open);
        backdrop.classList.toggle('visible', open);
        document.body.classList.toggle('mobile-filters-open', open);
        openBtn.setAttribute('aria-expanded', String(open));
        closeBtn.setAttribute('aria-expanded', String(open));
    };

    openBtn.addEventListener('click', () => {
        updateState(true);
    });

    closeBtn.addEventListener('click', () => {
        updateState(false);
    });

    backdrop.addEventListener('click', () => {
        updateState(false);
    });
}

// ====================================================================
// CARGA DE PRODUCTOS — Con fallback a IndexedDB
// ====================================================================
/**
 * Carga todos los productos del catálogo.
 * Estrategia: repo.obtenerProductos() → fetch + cacheo en IndexedDB.
 * Fallback: si el fetch falla, intenta recuperar desde IndexedDB (offline).
 */
async function cargarCatalogos() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    try {
        grid.setAttribute('aria-busy', 'true');

        // Usar repo.obtenerProductos() que gestiona la ruta correctamente
        // y ya cachea en IndexedDB automáticamente
        const productos = await repo.obtenerProductos();

        catalogProductos = productos;
        renderizarProductosFiltrados();
        grid.setAttribute('aria-busy', 'false');

    } catch (fetchError) {
        console.warn('⚠️ Fetch falló, intentando recuperar desde IndexedDB...', fetchError);

        try {
            // FALLBACK: Intentar recuperar desde IndexedDB (modo offline)
            const productosCache = await storage.recuperarProductosIndexedDB();

            if (productosCache && productosCache.length > 0) {
                console.log(`📦 ${productosCache.length} productos recuperados desde IndexedDB (cache offline)`);
                const productosPersistidos = repo.aplicarStockPersistido(productosCache);
                catalogProductos = productosPersistidos;
                repo.setProductosDisponibles(productosPersistidos);
                renderizarProductosFiltrados();
                grid.setAttribute('aria-busy', 'false');

                // Mostrar aviso de modo offline
                const filterInfo = document.getElementById('filter-count');
                if (filterInfo) {
                    filterInfo.textContent = `${productosPersistidos.length} productos (modo offline — datos en caché)`;
                }
            } else {
                throw new Error('No hay datos en caché de IndexedDB');
            }
        } catch (cacheError) {
            console.error('❌ Error al cargar productos (fetch e IndexedDB fallaron):', cacheError);
            grid.setAttribute('aria-busy', 'false');
            grid.innerHTML = `
                <li class="error loading" role="alert" aria-live="assertive">
                    Hubo un problema al cargar los productos. 
                    Verifica tu conexión e intenta recargar la página.
                </li>`;
        }
    } finally {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.classList.add('hidden');
    }
}

// ====================================================================
// FILTROS
// ====================================================================
/**
 * Inicializa todos los listeners de filtros y restaura estado desde sessionStorage.
 */
function inicializarFiltros() {
    const genderFilters = document.querySelectorAll('.gender-filter');
    const sizeFilters = document.querySelectorAll('.size-filter');
    const colorFilters = document.querySelectorAll('.color-filter');
    const priceFilters = document.querySelectorAll('.price-filter');
    const btnClearFilters = document.querySelector('.btn-clear-filters');

    // Escuchar cambios en los filtros
    [...genderFilters, ...sizeFilters, ...colorFilters, ...priceFilters].forEach(filter => {
        filter.addEventListener('change', () => {
            renderizarProductosFiltrados();
            guardarEstadoFiltros(); // sessionStorage: persistir estado de filtros
        });
    });

    if (btnClearFilters) {
        btnClearFilters.addEventListener('click', limpiarFiltros);
    }

    // Restaurar estado de filtros desde sessionStorage (si existe)
    restaurarEstadoFiltros();
}

/**
 * Guarda el estado actual de los filtros en sessionStorage.
 * Usa la Estrategia 2 de Persistencia (sessionStorage - temporal de sesión).
 */
function guardarEstadoFiltros() {
    const estado = {
        generos: getSelectedGenders(),
        tallas: getSelectedSizes(),
        colores: getSelectedColors(),
        precios: getSelectedPrices()
    };
    storage.guardarEstadoTemporalSesion('catalogFilters', estado);
}

/**
 * Restaura el estado de filtros desde sessionStorage al cargar la página.
 */
function restaurarEstadoFiltros() {
    const estado = storage.recuperarEstadoTemporalSesion('catalogFilters');
    if (!estado) return;

    const mapFilterClass = {
        generos: '.gender-filter',
        tallas: '.size-filter',
        colores: '.color-filter',
        precios: '.price-filter'
    };

    Object.entries(estado).forEach(([key, valores]) => {
        if (!Array.isArray(valores) || valores.length === 0) return;
        const selector = mapFilterClass[key];
        if (!selector) return;
        document.querySelectorAll(selector).forEach(input => {
            if (valores.includes(input.value)) {
                input.checked = true;
            }
        });
    });
}

/**
 * Desmarca todos los filtros y vuelve a renderizar todos los productos.
 */
function limpiarFiltros() {
    document.querySelectorAll('.gender-filter, .size-filter, .color-filter, .price-filter')
        .forEach(filter => { filter.checked = false; });

    // Limpiar del sessionStorage también
    storage.guardarEstadoTemporalSesion('catalogFilters', null);

    if (catalogProductos.length > 0) {
        renderizarProductosFiltrados();
    }
}

// ── Getters de filtros seleccionados ──────────────────────

/**
 * @returns {string[]} Géneros seleccionados
 */
function getSelectedGenders() {
    return Array.from(document.querySelectorAll('.gender-filter:checked')).map(f => f.value);
}

/**
 * @returns {string[]} Tallas seleccionadas
 */
function getSelectedSizes() {
    return Array.from(document.querySelectorAll('.size-filter:checked')).map(f => f.value);
}

/**
 * @returns {string[]} Colores seleccionados
 */
function getSelectedColors() {
    return Array.from(document.querySelectorAll('.color-filter:checked')).map(f => f.value);
}

/**
 * @returns {string[]} Rangos de precio seleccionados
 */
function getSelectedPrices() {
    return Array.from(document.querySelectorAll('.price-filter:checked')).map(f => f.value);
}

// ── Funciones de coincidencia para filtros ────────────────

/**
 * Verifica si las tallas del producto coinciden con las seleccionadas.
 * @param {string} productTallas - Rango de tallas del producto (ej: "S - XL")
 * @param {string[]} selectedSizes - Tallas seleccionadas por el usuario
 * @returns {boolean}
 */
function sizesMatch(productTallas, selectedSizes) {
    if (selectedSizes.length === 0) return true;
    const parts = productTallas.split(' - ');
    const startSize = parts[0].trim().toUpperCase();
    const endSize = parts[1] ? parts[1].trim().toUpperCase() : startSize;
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const startIndex = sizeOrder.indexOf(startSize);
    const endIndex = sizeOrder.indexOf(endSize);

    return selectedSizes.some(size => {
        const sizeIndex = sizeOrder.indexOf(size.toUpperCase());
        return sizeIndex >= startIndex && sizeIndex <= endIndex;
    });
}

/**
 * Verifica si el color del producto coincide con los seleccionados.
 * @param {string} productColor - Color del producto
 * @param {string[]} selectedColors - Colores seleccionados
 * @returns {boolean}
 */
function colorsMatch(productColor, selectedColors) {
    if (selectedColors.length === 0) return true;
    if (!productColor) return false;
    return selectedColors.some(color => productColor.toLowerCase().includes(color.toLowerCase()));
}

/**
 * Verifica si el precio del producto está en los rangos seleccionados.
 * @param {number} productPrice - Precio del producto
 * @param {string[]} selectedPrices - Rangos de precio seleccionados ("0-20", "20-50", "50+")
 * @returns {boolean}
 */
function pricesMatch(productPrice, selectedPrices) {
    if (selectedPrices.length === 0) return true;
    return selectedPrices.some(range => {
        if (range === '0-20') return productPrice <= 20;
        if (range === '20-50') return productPrice > 20 && productPrice <= 50;
        if (range === '50+') return productPrice > 50;
        return false;
    });
}

// ====================================================================
// RENDERIZADO DEL CATÁLOGO
// ====================================================================
/**
 * Filtra y renderiza los productos en el grid del catálogo.
 * Muestra el conteo de productos encontrados.
 */
function renderizarProductosFiltrados() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    const selectedGenders = getSelectedGenders();
    const selectedSizes = getSelectedSizes();
    const selectedColors = getSelectedColors();
    const selectedPrices = getSelectedPrices();

    // Aplicar filtros
    const productosFiltrados = catalogProductos.filter(producto => {
        const genderMatch = selectedGenders.length === 0 || selectedGenders.includes(producto.categoria);
        const sizeMatch = selectedSizes.length === 0 || sizesMatch(producto.talla, selectedSizes);
        const colorMatch = selectedColors.length === 0 || colorsMatch(producto.color, selectedColors);
        const priceMatch = selectedPrices.length === 0 || pricesMatch(producto.precio, selectedPrices);
        return genderMatch && sizeMatch && colorMatch && priceMatch;
    });

    // Actualizar contador (aria-live="polite" anunciará el cambio)
    const filterCount = document.getElementById('filter-count');
    if (filterCount) {
        filterCount.textContent = `Mostrando ${productosFiltrados.length} de ${catalogProductos.length} productos`;
    }

    // Limpiar grid
    grid.innerHTML = '';

    if (productosFiltrados.length === 0) {
        grid.innerHTML = `
            <li class="no-results" role="status">
                <p>No se encontraron productos con los filtros seleccionados.</p>
            </li>`;
        return;
    }

    // Renderizar tarjetas
    productosFiltrados.forEach(producto => {
        const li = document.createElement('li');
        li.className = 'product-card';
        li.setAttribute('role', 'button');
        li.setAttribute('tabindex', '0');
        li.dataset.id = producto.id;
        li.setAttribute('aria-labelledby', `producto-${producto.id}-nombre`);
        li.setAttribute('aria-describedby',
            `producto-${producto.id}-descripcion producto-${producto.id}-precio producto-${producto.id}-talla`);

        const imgHtml = producto.imagen
            ? `<img src="${repo.getProductoImagePath(producto.imagen)}" alt="${producto.nombre}" class="product-image" loading="lazy">`
            : `<div class="product-art" aria-hidden="true">${producto.abreviatura}</div>`;

        const stockDisponible = getStockDisponible(producto);
        const stockLabel = stockDisponible === 0
            ? 'Agotado'
            : stockDisponible === 1
                ? 'Última unidad'
                : `Disponibles: ${stockDisponible}`;
        const lowStockHtml = stockDisponible > 0 && stockDisponible <= 5
            ? `<span class="product-stock product-stock-low" aria-live="polite">Pocas unidades</span>`
            : '';

        li.innerHTML = `
            <div class="product-visual" style="--tone: ${producto.tone}; --accent: ${producto.accent};">
                ${imgHtml}
                <div class="product-tags">
                    <span class="product-badge">${producto.destacado}</span>
                    <span class="product-category">${producto.categoria}</span>
                </div>
            </div>
            <div class="product-info">
                <h3 id="producto-${producto.id}-nombre">${producto.nombre}</h3>
                <p id="producto-${producto.id}-descripcion">${producto.descripcion}</p>
                <div class="product-meta">
                    <p id="producto-${producto.id}-precio" class="product-price">$${producto.precio.toFixed(2)}</p>
                    <div class="product-badges-meta">
                        <span class="product-tag">${stockLabel}</span>
                        ${lowStockHtml}
                    </div>
                </div>
            </div>
        `;

        grid.appendChild(li);
    });
}

window.actualizarStockCatalogo = () => {
    renderizarProductosFiltrados();
};
