// Estado Global
let productosDisponibles = [];
let carrito = [];
let pendingDeleteId = null;
let pendingDeleteBulkIds = null;

document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
    initScrollTop();
    initCartDrawer();
});

/**
 * Función para manejar el botón de scroll hacia arriba
 */
function initScrollTop() {
    const btnScroll = document.getElementById("btn-scroll-top");
    if (!btnScroll) return;

    window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
            btnScroll.classList.add("show");
            btnScroll.setAttribute("aria-hidden", "false");
            btnScroll.setAttribute("tabindex", "0");
        } else {
            btnScroll.classList.remove("show");
            btnScroll.setAttribute("aria-hidden", "true");
            btnScroll.setAttribute("tabindex", "-1");
        }
    });

    btnScroll.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

/**
 * Inicialización y Lógica del Carrito de Compras (Mobile First, Accesible)
 */
function initCartDrawer() {
    const btnOpenCart = document.querySelector(".btn-cart");
    const btnCloseCart = document.getElementById("btn-close-cart");
    const cartOverlay = document.getElementById("cart-overlay");
    const cartDrawer = document.getElementById("cart-drawer");
    const selectAllCheckbox = document.getElementById("select-all-cart");
    const btnDeleteBulk = document.getElementById("btn-delete-bulk");
    
    const dialogConfirm = document.getElementById("confirm-dialog");
    const btnDialogCancel = document.getElementById("btn-dialog-cancel");
    const btnDialogAccept = document.getElementById("btn-dialog-accept");

    // Abrir carrito
    btnOpenCart.addEventListener("click", () => {
        cartOverlay.classList.add("active");
        cartOverlay.setAttribute("aria-hidden", "false");
        cartDrawer.classList.add("open");
        cartDrawer.setAttribute("aria-hidden", "false");
        btnCloseCart.focus();
    });

    // Funciones para cerrar
    const closeCart = () => {
        cartOverlay.classList.remove("active");
        cartOverlay.setAttribute("aria-hidden", "true");
        cartDrawer.classList.remove("open");
        cartDrawer.setAttribute("aria-hidden", "true");
        btnOpenCart.focus();
    };

    btnCloseCart.addEventListener("click", closeCart);
    cartOverlay.addEventListener("click", closeCart);
    
    // Escuchar botón escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (dialogConfirm.open) {
                dialogConfirm.close();
            } else if (cartDrawer.classList.contains("open")) {
                closeCart();
            }
        }
    });

    // Agregar desde lista de productos usando event delegation
    document.body.addEventListener("click", (e) => {
        const btnAdd = e.target.closest("button[data-id]");
        
        // Verifica si es el bottom "Añadir" del main content
        if (btnAdd && btnAdd.classList.contains("btn-primary") && !btnAdd.closest("#cart-drawer") && !btnAdd.closest("#confirm-dialog")) {
            const prodId = parseInt(btnAdd.dataset.id);
            agregarAlCarrito(prodId);
            
            // Abramos el carrito visualmente para validar el feedback
            btnOpenCart.click(); 
        }
    });

    // Logica de confirmacion dialog custom
    btnDialogCancel.addEventListener("click", () => {
        dialogConfirm.close();
        pendingDeleteId = null;
        pendingDeleteBulkIds = null;
    });

    btnDialogAccept.addEventListener("click", () => {
        if (pendingDeleteId !== null) {
            eliminarProductoDefinitivamente(pendingDeleteId);
            pendingDeleteId = null;
        } else if (pendingDeleteBulkIds !== null) {
            carrito = carrito.filter(item => !pendingDeleteBulkIds.includes(item.id));
            renderCart();
            pendingDeleteBulkIds = null;
        }
        dialogConfirm.close();
    });

    // Seleccion múltiple
    selectAllCheckbox.addEventListener("change", (e) => {
        const itemCheckboxes = document.querySelectorAll(".item-checkbox");
        itemCheckboxes.forEach(checkbox => {
            checkbox.checked = e.target.checked;
        });
        evaluarEstadoBulkDelete();
    });

    // Borrado multiple
    btnDeleteBulk.addEventListener("click", () => {
        const itemCheckboxes = document.querySelectorAll(".item-checkbox:checked");
        const idsToRemove = Array.from(itemCheckboxes).map(cb => parseInt(cb.dataset.id));
        
        if (idsToRemove.length > 0) {
            pendingDeleteBulkIds = idsToRemove;
            document.getElementById("dialog-title").textContent = "¿Desea eliminar los productos seleccionados del carrito?";
            dialogConfirm.showModal();
        }
    });
}

function agregarAlCarrito(idProducto) {
    const productoExistente = carrito.find(item => item.id === idProducto);
    
    if (productoExistente) {
        productoExistente.cantidad++;
    } else {
        const productInfo = productosDisponibles.find(item => item.id === idProducto);
        if (productInfo) {
            carrito.push({ ...productInfo, cantidad: 1 });
        }
    }
    renderCart();
}

function modificarCantidad(id, delta) {
    const producto = carrito.find(item => item.id === id);
    if (!producto) return;

    if (producto.cantidad === 1 && delta === -1) {
        // Pedir validacion antes de dejarlo en 0 
        pendingDeleteId = id;
        document.getElementById("dialog-title").textContent = "¿Desea eliminar el producto del carrito?";
        document.getElementById("confirm-dialog").showModal();
    } else {
        producto.cantidad += delta;
        renderCart();
    }
}

function eliminarProductoDefinitivamente(id) {
    carrito = carrito.filter(item => item.id !== id);
    renderCart();
}

function evaluarEstadoBulkDelete() {
    const itemsChecked = document.querySelectorAll(".item-checkbox:checked");
    const btnDeleteBulk = document.getElementById("btn-delete-bulk");
    
    if (itemsChecked.length > 0) {
        btnDeleteBulk.classList.add("active");
        btnDeleteBulk.disabled = false;
    } else {
        btnDeleteBulk.classList.remove("active");
        btnDeleteBulk.disabled = true;
    }
}

function initCheckboxListeners() {
    const itemCheckboxes = document.querySelectorAll(".item-checkbox");
    const selectAllCheckbox = document.getElementById("select-all-cart");
    
    itemCheckboxes.forEach(cb => {
        cb.addEventListener("change", () => {
            const allChecked = Array.from(itemCheckboxes).every(i => i.checked);
            selectAllCheckbox.checked = allChecked;
            evaluarEstadoBulkDelete();
        });
    });
}

function renderCart() {
    const container = document.getElementById("cart-items-container");
    const totalPriceEl = document.getElementById("cart-total-price");
    
    if (carrito.length === 0) {
        container.innerHTML = `
            <div class="cart-empty-msg">
                <svg aria-hidden="true" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                <p>Tu carrito está vacío.</p>
            </div>
        `;
        totalPriceEl.textContent = "$0.00";
        document.getElementById("select-all-cart").checked = false;
        evaluarEstadoBulkDelete();
        actualizarBotonCabecera();
        return;
    }

    let subtotal = 0;
    container.innerHTML = "";

    carrito.forEach(item => {
        subtotal += item.precio * item.cantidad;
        
        const article = document.createElement("article");
        article.className = "cart-item";
        
        // Estructura semántica incluyendo imagen, detalles y basura
        const imgNode = item.imagen 
            ? `<img src="${item.imagen}" alt="${item.nombre}" class="cart-item-img">`
            : `<div class="cart-item-img" style="background:#eee"></div>`; 

        article.innerHTML = `
            <input type="checkbox" class="item-checkbox cart-item-checkbox" data-id="${item.id}" aria-label="Seleccionar ${item.nombre}">
            ${imgNode}
            <div class="cart-item-details">
                <h4>${item.nombre}</h4>
                <span class="cart-item-cat">${item.categoria} - ${item.talla}</span>
                <span class="cart-item-price">$${(item.precio * item.cantidad).toFixed(2)}</span>
                <div class="cart-item-controls">
                    <div class="qty-control">
                        <button type="button" class="qty-btn dec-btn" data-id="${item.id}" aria-label="Reducir cantidad">-</button>
                        <input type="text" class="qty-input" value="${item.cantidad}" aria-label="Cantidad de ${item.nombre}" readonly>
                        <button type="button" class="qty-btn inc-btn" data-id="${item.id}" aria-label="Aumentar cantidad">+</button>
                    </div>
                    <button type="button" class="btn-remove-item" data-id="${item.id}" aria-label="Eliminar ${item.nombre} del carrito" title="Eliminar">
                        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                            <path d="M3 6h18"></path><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(article);
    });

    totalPriceEl.textContent = `$${subtotal.toFixed(2)}`;

    // Reasignar eventos a botones inyectados
    document.querySelectorAll(".dec-btn").forEach(btn => {
        btn.addEventListener("click", () => modificarCantidad(parseInt(btn.dataset.id), -1));
    });

    document.querySelectorAll(".inc-btn").forEach(btn => {
        btn.addEventListener("click", () => modificarCantidad(parseInt(btn.dataset.id), 1));
    });

    document.querySelectorAll(".btn-remove-item").forEach(btn => {
        btn.addEventListener("click", () => {
            // Confirmación también requerida para cesto de basura según lineamientos UX
            pendingDeleteId = parseInt(btn.dataset.id);
            document.getElementById("dialog-title").textContent = "¿Desea eliminar el producto del carrito?";
            document.getElementById("confirm-dialog").showModal();
        });
    });

    initCheckboxListeners();
    evaluarEstadoBulkDelete();
    actualizarBotonCabecera();
}

function actualizarBotonCabecera() {
    const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    const cartBtn = document.querySelector(".btn-cart");
    const cartBadge = document.querySelector(".cart-badge");
    
    if (cartBtn && cartBadge) {
        cartBadge.textContent = totalItems;
        cartBtn.setAttribute("aria-label", `Abrir carrito, ${totalItems} artículos`);
    }
}


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
        productosDisponibles = productos; // Guardar en estado global
        grid.innerHTML = "";
        
        productos.forEach(producto => {
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

        grid.setAttribute("aria-busy", "false");
        
    } catch (error) {
        console.error("Error al cargar los productos:", error);
        grid.setAttribute("aria-busy", "false");
        grid.innerHTML = `<p class="error loading" role="alert">Hubo un problema al cargar los productos: ${error.message}</p>`;
    }
}
