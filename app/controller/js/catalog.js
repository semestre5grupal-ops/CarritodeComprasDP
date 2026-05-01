// Catalog Page Script
// Maneja la carga de productos con filtros para la página de catálogo
// Integra estrategias de persistencia: localStorage, sessionStorage, IndexedDB, Cookies

import { storage } from './storage.js';

let catalogProductos = [];

// Inicializar la página de catálogo
document.addEventListener("DOMContentLoaded", () => {
    cargarCatalogos();
    inicializarFiltros();
    initScrollTop();
    initCartDrawer();
    initCartDelegation();
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
        
        // Guardar catálogo en IndexedDB para caché offline
        await storage.guardarProductosIndexedDB(productos);
        
        renderizarProductosFiltrados();
        grid.setAttribute("aria-busy", "false");
        
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
    const btnClearFilters = document.querySelector(".btn-clear-filters");

    genderFilters.forEach(filter => {
        filter.addEventListener("change", renderizarProductosFiltrados);
    });

    sizeFilters.forEach(filter => {
        filter.addEventListener("change", renderizarProductosFiltrados);
    });

    if (btnClearFilters) {
        btnClearFilters.addEventListener("click", limpiarFiltros);
    }
}

// Limpiar todos los filtros
function limpiarFiltros() {
    const genderFilters = document.querySelectorAll(".gender-filter");
    const sizeFilters = document.querySelectorAll(".size-filter");

    genderFilters.forEach(filter => {
        filter.checked = true;
    });

    sizeFilters.forEach(filter => {
        filter.checked = true;
    });

    renderizarProductosFiltrados();
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

// Verificar si una talla del producto coincide con las tallas seleccionadas
function sizesMatch(productTallas, selectedSizes) {
    if (selectedSizes.length === 0) return true;
    
    // Separar las tallas del producto
    const productSizeArray = productTallas.split(" - ");
    
    // Convertir a mayúsculas para comparación
    const startSize = productSizeArray[0].trim().toUpperCase();
    const endSize = productSizeArray[1] ? productSizeArray[1].trim().toUpperCase() : startSize;

    // Orden de tallas
    const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL"];
    const startIndex = sizeOrder.indexOf(startSize);
    const endIndex = sizeOrder.indexOf(endSize);

    // Verificar si alguna talla seleccionada está dentro del rango
    for (let size of selectedSizes) {
        const sizeIndex = sizeOrder.indexOf(size.toUpperCase());
        if (sizeIndex >= startIndex && sizeIndex <= endIndex) {
            return true;
        }
    }

    return false;
}

// Renderizar productos filtrados
function renderizarProductosFiltrados() {
    const grid = document.getElementById("product-grid");
    const selectedGenders = getSelectedGenders();
    const selectedSizes = getSelectedSizes();

    // Filtrar productos
    const productosFiltrados = catalogProductos.filter(producto => {
        const genderMatch = selectedGenders.includes(producto.categoria);
        const sizeMatch = sizesMatch(producto.talla, selectedSizes);
        return genderMatch && sizeMatch;
    });

    // Limpiar grid
    grid.innerHTML = "";

    // Mostrar información de filtros
    const filterCount = document.getElementById("filter-count");
    if (filterCount) {
        filterCount.textContent = `Mostrando ${productosFiltrados.length} de ${catalogProductos.length} productos`;
    }

    // Renderizar productos
    if (productosFiltrados.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <p>No se encontraron productos con los filtros seleccionados.</p>
                <p style="font-size: 0.9rem; color: #ccc; margin-top: 1rem;">Intenta cambiar los filtros de género o talla.</p>
            </div>
        `;
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
                    `<img src="${producto.imagen}" alt="${producto.nombre}" class="product-image" loading="lazy">` : 
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
                    <p id="producto-${producto.id}-talla">${producto.talla}</p>
                </div>
                <button type="button" data-id="${producto.id}" class="btn btn-primary" aria-label="Añadir ${producto.nombre} al carrito">
                    Añadir
                </button>
            </div>
        `;
        
        grid.appendChild(article);
    });
}
