document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
});

/**
 * Función asíncrona para leer el JSON e imprimir los productos en el contenedor
 */
async function cargarProductos() {
    const grid = document.getElementById("product-grid");
    
    try {
        grid.setAttribute("aria-busy", "true");
        const response = await fetch("data/productos.json");
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const productos = await response.json();
        grid.innerHTML = "";
        
        productos.forEach(producto => {
            const article = document.createElement("article");
            article.className = "product-card";
            article.setAttribute("role", "listitem");
            article.setAttribute("aria-labelledby", `producto-${producto.id}-nombre`);
            article.setAttribute("aria-describedby", `producto-${producto.id}-descripcion producto-${producto.id}-precio producto-${producto.id}-talla`);
            
            article.innerHTML = `
                <div class="product-visual" style="--tone: ${producto.tone}; --accent: ${producto.accent};">
                    <span class="product-badge">${producto.destacado}</span>
                    <span class="product-category">${producto.categoria}</span>
                    <div class="product-art" aria-hidden="true">${producto.abreviatura}</div>
                </div>
                <h3 id="producto-${producto.id}-nombre">${producto.nombre}</h3>
                <p id="producto-${producto.id}-descripcion">${producto.descripcion}</p>
                <div class="product-meta">
                    <p id="producto-${producto.id}-precio" class="product-price">$${producto.precio.toFixed(2)}</p>
                    <p id="producto-${producto.id}-talla">${producto.talla}</p>
                </div>
                <button type="button" data-id="${producto.id}" class="btn btn-primary" aria-label="Añadir ${producto.nombre} al carrito">
                    Añadir
                </button>
            `;
            
            grid.appendChild(article);
        });

        grid.setAttribute("aria-busy", "false");
        
    } catch (error) {
        console.error("Error al cargar los productos:", error);
        grid.setAttribute("aria-busy", "false");
        grid.innerHTML = `<p class="error loading" role="alert">Hubo un problema al cargar los productos: ${error.message}</p>`;
    }
}
