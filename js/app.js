// Cache global de productos
let __productosCache = null;

document.addEventListener("DOMContentLoaded", () => {
    inicializarSistema();
});

async function inicializarSistema() {
    const overlay = document.getElementById("loading-overlay");
    
    try {
        await new Promise(resolve => setTimeout(resolve, 800)); 
        await cargarProductos();
        desbloquearInterfaz();
    } catch (error) {
        console.error("Error crítico de inicialización:", error);
        const grid = document.getElementById("product-grid");
        if (grid) {
            grid.innerHTML = `<p class="error" role="alert">Error al cargar la colección: ${error.message}</p>`;
        }
    } finally {
        overlay?.classList.add("hidden");
    }
}

function desbloquearInterfaz() {
    const ids = ["btn-carrito", "vaciar-cart", "btn-submit"];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = false;
    });
}

/**
 * Carga productos desde JSON y configura filtros
 */
async function cargarProductos() {
    const grid = document.getElementById("product-grid");
    if (!grid) return;

    try {
        if (location.protocol === 'file:') {
            throw new Error('La página se abrió con file:// — ejecuta un servidor local (por ejemplo: `python -m http.server`) y vuelve a cargar.');
        }

        grid.setAttribute("aria-busy", "true");

        let response;
        try {
            response = await fetch("data/productos.json");
        } catch (err) {
            response = await fetch("./data/productos.json");
        }

        if (!response || !response.ok) {
            const status = response?.status || 'network';
            throw new Error(`Error HTTP: ${status}`);
        }

        const productos = await response.json();
        __productosCache = productos;

        // Poblarpiedades de filtros si existen
        populateFilters(productos);

        // Renderizar inicial
        applyFiltersToGrid(grid);

    } catch (error) {
        console.error("Error al cargar los productos:", error);
        grid.setAttribute("aria-busy", "false");
        grid.innerHTML = `<p class="error loading" role="alert">Hubo un problema al cargar los productos: ${error.message}</p>`;
    }
}

/**
 * Renderiza productos en el grid
 */
function renderProductsIntoGrid(grid, items) {
    grid.innerHTML = "";

    items.forEach(producto => {
        const article = document.createElement("article");
        article.className = "product-card";
        article.setAttribute("role", "listitem");
        article.setAttribute("aria-labelledby", `producto-${producto.id}-nombre`);
        article.setAttribute("aria-describedby", `producto-${producto.id}-descripcion producto-${producto.id}-precio producto-${producto.id}-talla`);

        const precio = (typeof producto.precio === 'number') ? producto.precio : (parseFloat(producto.precio) || 0);
        const img = producto.imagen ? `<img src="${producto.imagen}" alt="Imagen ${producto.nombre}" loading="lazy">` : '';

        article.innerHTML = `
            <div class="product-visual" style="--tone: ${producto.tone || ''}; --accent: ${producto.accent || ''};">
                ${img}
                <span class="product-badge">${producto.destacado || ''}</span>
                <span class="product-category">${producto.categoria || ''}</span>
                <div class="product-art" aria-hidden="true">${producto.abreviatura || ''}</div>
            </div>
            <h3 id="producto-${producto.id}-nombre">${producto.nombre || 'Sin nombre'}</h3>
            <p id="producto-${producto.id}-descripcion">${producto.descripcion || ''}</p>
            <div class="product-meta">
                <p id="producto-${producto.id}-precio" class="product-price">$${precio.toFixed(2)}</p>
                <p id="producto-${producto.id}-talla">${producto.talla || ''}</p>
            </div>
            <button type="button" data-id="${producto.id}" class="btn btn-primary" aria-label="Añadir ${producto.nombre || ''} al carrito">
                Añadir
            </button>
        `;

        grid.appendChild(article);
    });

    grid.setAttribute("aria-busy", "false");
}

/**
 * Puebla los selectores de filtro con opciones únicas del JSON
 */
function populateFilters(productos) {
    try {
        const selCat = document.getElementById('filter-category');
        const selSize = document.getElementById('filter-size');
        const selSeason = document.getElementById('filter-season');

        if (!selCat && !selSize && !selSeason) return;

        const cats = new Set();
        const sizes = new Set();
        const seasons = new Set();

        productos.forEach(p => {
            if (p.categoria) cats.add(p.categoria);
            if (p.talla) sizes.add(p.talla);
            if (p.destacado) seasons.add(p.destacado);
        });

        if (selCat) {
            selCat.querySelectorAll('option:not(:first-child)').forEach(o => o.remove());
            Array.from(cats).sort().forEach(c => {
                const opt = document.createElement('option');
                opt.value = c;
                opt.textContent = c;
                selCat.appendChild(opt);
            });
            selCat.addEventListener('change', () => applyFiltersToGrid(document.getElementById('product-grid')));
        }

        if (selSize) {
            selSize.querySelectorAll('option:not(:first-child)').forEach(o => o.remove());
            Array.from(sizes).sort().forEach(s => {
                const opt = document.createElement('option');
                opt.value = s;
                opt.textContent = s;
                selSize.appendChild(opt);
            });
            selSize.addEventListener('change', () => applyFiltersToGrid(document.getElementById('product-grid')));
        }

        if (selSeason) {
            selSeason.querySelectorAll('option:not(:first-child)').forEach(o => o.remove());
            Array.from(seasons).sort().forEach(s => {
                const opt = document.createElement('option');
                opt.value = s;
                opt.textContent = s;
                selSeason.appendChild(opt);
            });
            selSeason.addEventListener('change', () => applyFiltersToGrid(document.getElementById('product-grid')));
        }

        const reset = document.getElementById('filter-reset');
        if (reset) {
            reset.addEventListener('click', (e) => {
                e.preventDefault();
                if (selCat) selCat.value = '';
                if (selSize) selSize.value = '';
                if (selSeason) selSeason.value = '';
                applyFiltersToGrid(document.getElementById('product-grid'));
            });
        }
    } catch (err) {
        console.warn('populateFilters error', err);
    }
}

/**
 * Aplica filtros y renderiza el grid
 */
function applyFiltersToGrid(grid) {
    if (!__productosCache || !grid) {
        if (!__productosCache) cargarProductos();
        return;
    }

    let items = Array.from(__productosCache);

    const selCat = document.getElementById('filter-category');
    const selSize = document.getElementById('filter-size');
    const selSeason = document.getElementById('filter-season');

    if (selCat && selCat.value) {
        items = items.filter(p => (p.categoria || '').toLowerCase() === selCat.value.toLowerCase());
    }

    if (selSize && selSize.value) {
        items = items.filter(p => (p.talla || '').toLowerCase() === selSize.value.toLowerCase());
    }

    if (selSeason && selSeason.value) {
        items = items.filter(p => (p.destacado || '').toLowerCase() === selSeason.value.toLowerCase());
    }

    // Respetar data-limit si existe
    const limitAttr = grid.dataset.limit;
    const limit = limitAttr ? parseInt(limitAttr, 10) : null;
    const finalItems = Number.isInteger(limit) && limit > 0 ? items.slice(0, limit) : items;

    renderProductsIntoGrid(grid, finalItems);
}
