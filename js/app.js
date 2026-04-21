document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
    inicializarSistema();
});


async function inicializarSistema() {
    const overlay = document.getElementById("loading-overlay");
    
    try {
        // Simulamos un pequeño retardo si la carga es muy rápida (ej. desde LocalStorage)
        // para garantizar que la Heurística 1 se cumpla visualmente.
        await new Promise(resolve => setTimeout(resolve, 800)); 
        
        await cargarProductos();
        
        // 2. Habilitar la interfaz protegida
        desbloquearInterfaz();
        
    } catch (error) {
        console.error("Error crítico de inicialización:", error);
        document.getElementById("product-grid").innerHTML = 
            `<p class="error" role="alert">Error al cargar la colección: ${error.message}</p>`;
    } finally {
        // 3. Ocultar la ventana de carga
        overlay.classList.add("hidden");
    }
}

function desbloquearInterfaz() {
    document.getElementById("btn-carrito").disabled = false;
    document.getElementById("vaciar-cart").disabled = false;
    document.getElementById("btn-submit").disabled = false;
}

async function cargarProductos() {
    const grid = document.getElementById("product-grid");
    
    const response = await fetch("data/productos.json");
    if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const productos = await response.json();
    grid.innerHTML = "";
    
    productos.forEach(producto => {
        const article = document.createElement("article");
        article.className = "product-card";
        
        // Se cambió alt text para que sea más descriptivo (Accesibilidad)
        article.innerHTML = `
            <img src="${producto.imagen}" alt="Fotografía de la prenda: ${producto.nombre}" loading="lazy" style="max-width: 100%;">
            <h3>${producto.nombre}</h3>
            <p>${producto.descripcion}</p>
            <p class="precio"><strong>$${producto.precio.toFixed(2)}</strong></p>
            <button type="button" data-id="${producto.id}" class="btn-primary" aria-label="Añadir ${producto.nombre} al carrito">
                Añadir al carrito
            </button>
        `;
        grid.appendChild(article);
    });
}

/**
 * Función asíncrona para leer el JSON e imprimir los productos en el contenedor
 */
async function cargarProductos() {
    const grid = document.getElementById("product-grid");
    
    try {
        // Hacemos el fetch al archivo JSON. 
        // Nota: Asegúrate de que tu servidor local esté corriendo para que fetch funcione correctamente.
        const response = await fetch("data/productos.json");
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const productos = await response.json();
        
        // Limpiamos el mensaje de "Cargando..."
        grid.innerHTML = "";
        
        // Iteramos sobre los productos para crear y agregar cada tarjeta al HTML
        productos.forEach(producto => {
            const article = document.createElement("article");
            article.className = "product-card";
            
            article.innerHTML = `
                <img src="${producto.imagen}" alt="Imagen de ${producto.nombre}" style="max-width: 100%;">
                <h3>${producto.nombre}</h3>
                <p>${producto.descripcion}</p>
                <p class="precio"><strong>$${producto.precio.toFixed(2)}</strong></p>
                <button type="button" data-id="${producto.id}" class="btn-primary" aria-label="Añadir ${producto.nombre} al carrito">
                    Añadir al carrito
                </button>
            `;
            
            grid.appendChild(article);
        });
        
    } catch (error) {
        console.error("Error al cargar los productos:", error);
        grid.innerHTML = `<p class="error" role="alert">Hubo un problema al cargar los productos: ${error.message}</p>`;
    }
}
