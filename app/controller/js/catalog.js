// Catalog Page Script
// Maneja la carga de productos con filtros para la página de catálogo
// Integra estrategias de persistencia: localStorage, sessionStorage, IndexedDB, Cookies

import { storage } from './storage.js';

let catalogProductos = [];
let productosDisponibles = [];

// Inicializar la página de catálogo
document.addEventListener("DOMContentLoaded", () => {
    cargarCatalogos();
    inicializarFiltros();
    if (typeof initScrollTop === 'function') initScrollTop();
    if (typeof initCartDrawer === 'function') initCartDrawer();
    if (typeof initCartDelegation === 'function') initCartDelegation();
});

// Cargar todos los productos
async function cargarCatalogos() {
    const grid = document.getElementById("product-grid");
    if (!grid) return;
    
    try {
        grid.setAttribute("aria-busy", "true");
        const response = await fetch("../data/productos.json");
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const productos = await response.json();
        catalogProductos = productos;
        productosDisponibles = productos; // Para que el carrito funcione

        renderizarProductosFiltrados();
        grid.setAttribute("aria-busy", "false");
        
        
        try {
            await storage.guardarProductosIndexedDB(productos);
        } catch (storageError) {
            console.warn("No se pudo guardar en IndexedDB, pero el catálogo cargó:", storageError);
        }
        
    } catch (error) {
        console.error("Error al cargar los productos:", error);
        grid.setAttribute("aria-busy", "false");
        grid.innerHTML = `<p class="error loading" role="alert">Hubo un problema al cargar los productos: ${error.message}</p>`;
    }
}

// Inicializar los filtros
function inicializarFiltros() {
    const genderFilters = document.querySelectorAll(".gender-filter");
    const sizeFilters = document.querySelectorAll(".size-filter");
    const colorFilters = document.querySelectorAll(".color-filter");
    const priceFilters = document.querySelectorAll(".price-filter");
    const btnClearFilters = document.querySelector(".btn-clear-filters");

    [...genderFilters, ...sizeFilters, ...colorFilters, ...priceFilters].forEach(filter => {
        filter.addEventListener("change", renderizarProductosFiltrados);
    });

    if (btnClearFilters) {
        btnClearFilters.addEventListener("click", limpiarFiltros);
    }

    limpiarFiltros();
}

// Limpiar todos los filtros
function limpiarFiltros() {
    const genderFilters = document.querySelectorAll(".gender-filter");
    const sizeFilters = document.querySelectorAll(".size-filter");
    const colorFilters = document.querySelectorAll(".color-filter");
    const priceFilters = document.querySelectorAll(".price-filter");

    [...genderFilters, ...sizeFilters, ...colorFilters, ...priceFilters].forEach(filter => {
        filter.checked = false;
    });

    if (catalogProductos.length > 0) {
        renderizarProductosFiltrados();
    }
}

// Obtener géneros seleccionados
function getSelectedGenders() {
    const selected = [];
    document.querySelectorAll(".gender-filter:checked").forEach(filter => {
        selected.push(filter.value);
    });
    return selected;
}

// Obtener tallas seleccionadas
function getSelectedSizes() {
    const selected = [];
    document.querySelectorAll(".size-filter:checked").forEach(filter => {
        selected.push(filter.value);
    });
    return selected;
}

// Obtener colores seleccionados
function getSelectedColors() {
    const selected = [];
    document.querySelectorAll(".color-filter:checked").forEach(filter => {
        selected.push(filter.value);
    });
    return selected;
}

// Obtener rangos de precio seleccionados
function getSelectedPrices() {
    const selected = [];
    document.querySelectorAll(".price-filter:checked").forEach(filter => {
        selected.push(filter.value);
    });
    return selected;
}

// Verificar si una talla del producto coincide con las tallas seleccionadas
function sizesMatch(productTallas, selectedSizes) {
    if (selectedSizes.length === 0) return true;

    const productSizeArray = productTallas.split(" - ");
    const startSize = productSizeArray[0].trim().toUpperCase();
    const endSize = productSizeArray[1] ? productSizeArray[1].trim().toUpperCase() : startSize;

    const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL"];
    const startIndex = sizeOrder.indexOf(startSize);
    const endIndex = sizeOrder.indexOf(endSize);

    return selectedSizes.some(size => {
        const sizeIndex = sizeOrder.indexOf(size.toUpperCase());
        return sizeIndex >= startIndex && sizeIndex <= endIndex;
    });
}

function colorsMatch(productColor, selectedColors) {
    if (selectedColors.length === 0) return true;
    if (!productColor) return false;

    return selectedColors.some(color => productColor.toLowerCase().includes(color.toLowerCase()));
}

function pricesMatch(productPrice, selectedPrices) {
    if (selectedPrices.length === 0) return true;

    return selectedPrices.some(range => {
        if (range === "0-20") return productPrice <= 20;
        if (range === "20-50") return productPrice > 20 && productPrice <= 50;
        if (range === "50+") return productPrice > 50;
        return false;
    });
}

function getProductoImagePath(imagenPath) {
    if (!imagenPath) return "";
    const currentPath = location.pathname.replace(/\\/g, "/");
    return currentPath.includes("/app/view/") ? imagenPath : `app/view/${imagenPath}`;
}

// Renderizar productos filtrados
function renderizarProductosFiltrados() {
    const grid = document.getElementById("product-grid");
    const selectedGenders = getSelectedGenders();
    const selectedSizes = getSelectedSizes();
    const selectedColors = getSelectedColors();
    const selectedPrices = getSelectedPrices();

    // Filtrar productos
    const productosFiltrados = catalogProductos.filter(producto => {
        // Si no hay nada seleccionado, el match es TRUE (pasa el producto)
        const genderMatch = selectedGenders.length === 0 || selectedGenders.includes(producto.categoria);
        const sizeMatch = selectedSizes.length === 0 || sizesMatch(producto.talla, selectedSizes);
        const colorMatch = selectedColors.length === 0 || colorsMatch(producto.color, selectedColors);
        const priceMatch = selectedPrices.length === 0 || pricesMatch(producto.precio, selectedPrices);
        
        return genderMatch && sizeMatch && colorMatch && priceMatch;
    });


    // Mostrar información de filtros
    const filterCount = document.getElementById("filter-count");
    if (filterCount) {
        filterCount.textContent = `Mostrando ${productosFiltrados.length} de ${catalogProductos.length} productos`;
    }

    // Limpiar grid
    grid.innerHTML = "";

    // Renderizar productos
    if (productosFiltrados.length === 0) {
        grid.innerHTML = `<div class="no-results"><p>No se encontraron productos.</p></div>`;
        return;
    }
    

    productosFiltrados.forEach(producto => {
        const article = document.createElement("article");
        article.className = "product-card";
        article.setAttribute("role", "listitem");
        article.setAttribute("aria-labelledby", `producto-${producto.id}-nombre`);
        article.setAttribute("aria-describedby", `producto-${producto.id}-descripcion producto-${producto.id}-precio producto-${producto.id}-talla`);
        
        article.innerHTML = `
            <div class="product-visual" style="--tone: ${producto.tone}; --accent: ${producto.accent};">
                ${producto.imagen ? 
                    `<img src="${getProductoImagePath(producto.imagen)}" alt="${producto.nombre}" class="product-image" loading="lazy">` : 
                    `<div class="product-art" aria-hidden="true">${producto.abreviatura}</div>`
                }
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
                        <span id="producto-${producto.id}-talla" class="product-tag">${producto.talla}</span>
                        <span class="product-tag">${producto.color}</span>
                    </div>
                </div>
                <button type="button" data-id="${producto.id}" class="btn btn-primary" aria-label="Añadir ${producto.nombre} al carrito">
                    Añadir
                </button>
            </div>
        `;
        
        grid.appendChild(article);
    });
    
}
