import { initContacto } from './contacto.js';

// Estado Global
let productosDisponibles = [];
let carrito = [];
let pendingDeleteId = null;
let pendingDeleteBulkIds = null;

const CLAVE_CARRITO_STORAGE = 'sportstore_shopping_cart';

function guardarCarritoEnStorage() {
    try {
        localStorage.setItem(CLAVE_CARRITO_STORAGE, JSON.stringify(carrito));
        sessionStorage.setItem('lastUpdate', new Date().toISOString());
    } catch (error) {
        console.error("Error al guardar el carrito en localStorage:", error);
    }
}

function cargarCarritoDeStorage() {
    try {
        const datosGuardados = localStorage.getItem(CLAVE_CARRITO_STORAGE);
        if (datosGuardados) {
            carrito = JSON.parse(datosGuardados);
        } else {
            carrito = [];
        }
    } catch (error) {
        console.error("Error al analizar el carrito de localStorage:", error);
        carrito = [];
        localStorage.removeItem(CLAVE_CARRITO_STORAGE);
    }
}

// 1. Corregimos el punto de entrada para aprovechar tu lógica de carga
document.addEventListener("DOMContentLoaded", () => {
    cargarCarritoDeStorage();
    renderCart(); // Aseguramos que el carrito se renderice si había datos
    inicializarSistema();
    initScrollTop();
    initCartDrawer();
    initCartDelegation(); // Centralizamos la delegación de eventos del carrito

    // Iniciar gestión de cookies y políticas
    gestionCookies.init();

    // Iniciar validación de contacto
    initContacto();
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
        if (overlay) overlay.classList.add("hidden");
    }
}

// ======================================================================
// MÓDULO DE PERSISTENCIA: COOKIES
// ======================================================================
// ======================================================================
// MÓDULO DE PERSISTENCIA: COOKIES (VERSIÓN DEPURACIÓN Y LOCALHOST)
// ======================================================================
const gestionCookies = {
    init() {
        console.log("1. Iniciando módulo de cookies...");
        const banner = document.getElementById('cookie-banner');
        const btnAccept = document.getElementById('btn-accept-cookies');
        const btnReject = document.getElementById('btn-reject-cookies');

        if (!banner) {
            console.error("❌ ERROR CRÍTICO: No se encuentra el <aside id='cookie-banner'> en tu HTML. Verifica que lo pegaste antes de </body>.");
            return;
        }
        console.log("2. HTML del banner encontrado correctamente.");

        if (this.obtenerCookie('terminosAceptados') === 'true') {
            console.log("3. La cookie ya existe. Ocultando banner.");
            banner.style.display = 'none'; // Forzado por JS
            banner.setAttribute('aria-hidden', 'true');
        } else {
            console.log("3. No hay cookie. Mostrando banner de políticas.");
            banner.style.display = 'flex'; // Forzamos visibilidad ignorando el CSS
            banner.setAttribute('aria-hidden', 'false');

            setTimeout(() => {
                if (btnAccept) {
                    btnAccept.disabled = false;
                    btnAccept.style.cursor = 'pointer';
                    console.log("4. Botón de aceptar habilitado.");
                } else {
                    console.error("❌ ERROR: No se encontró el botón con id='btn-accept-cookies'");
                }
            }, 600);

            if (btnAccept) {
                btnAccept.addEventListener('click', () => {
                    console.log("5. Clic detectado. Creando cookie...");
                    this.crearCookie('terminosAceptados', 'true', 30);
                    banner.style.display = 'none';
                    banner.setAttribute('aria-hidden', 'true');
                });
            }

            if (btnReject) {
                btnReject.addEventListener('click', () => {
                    banner.style.display = 'none';
                    banner.setAttribute('aria-hidden', 'true');
                });
            }
        }
    },

    crearCookie(nombre, valor, diasExpira) {
        const fecha = new Date();
        fecha.setTime(fecha.getTime() + (diasExpira * 24 * 60 * 60 * 1000));
        const expira = "expires=" + fecha.toUTCString();
        // Ajuste clave: Quitamos SameSite=Lax para evitar bloqueos en 127.0.0.1 sin HTTPS
        const stringCookie = `${nombre}=${valor};${expira};path=/`;
        document.cookie = stringCookie;
        console.log("6. Cookie inyectada en el navegador:", stringCookie);
    },

    obtenerCookie(nombre) {
        const nombreBuscado = nombre + "=";
        const cookiesActuales = document.cookie.split(';');

        for (let i = 0; i < cookiesActuales.length; i++) {
            let c = cookiesActuales[i].trim();
            if (c.indexOf(nombreBuscado) === 0) {
                return c.substring(nombreBuscado.length, c.length);
            }
        }
        return null;
    }
};

// 2. Protegemos contra posibles elementos nulos en el DOM
function desbloquearInterfaz() {
    const btnCarrito = document.getElementById("btn-carrito");
    const btnVaciar = document.getElementById("vaciar-cart");
    const btnSubmit = document.getElementById("btn-submit");

    if (btnCarrito) btnCarrito.disabled = false;
    if (btnVaciar) btnVaciar.disabled = false;
    if (btnSubmit) btnSubmit.disabled = false;
}

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
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

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

    // Abrir/Cerrar carrito
    if (btnOpenCart && cartOverlay && cartDrawer && btnCloseCart) {
        btnOpenCart.addEventListener("click", () => {
            cartOverlay.classList.add("active");
            cartOverlay.setAttribute("aria-hidden", "false");
            cartDrawer.classList.add("open");
            cartDrawer.setAttribute("aria-hidden", "false");
            btnCloseCart.focus();
        });

        const closeCart = () => {
            cartOverlay.classList.remove("active");
            cartOverlay.setAttribute("aria-hidden", "true");
            cartDrawer.classList.remove("open");
            cartDrawer.setAttribute("aria-hidden", "true");
            btnOpenCart.focus();
        };

        btnCloseCart.addEventListener("click", closeCart);
        cartOverlay.addEventListener("click", closeCart);

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                if (dialogConfirm && dialogConfirm.open) {
                    dialogConfirm.close();
                } else if (cartDrawer.classList.contains("open")) {
                    closeCart();
                }
            }
        });
    }

    // Agregar desde lista de productos usando event delegation
    document.body.addEventListener("click", (e) => {
        const btnAdd = e.target.closest("button[data-id]");
        if (btnAdd && btnAdd.classList.contains("btn-primary") && !btnAdd.closest("#cart-drawer") && !btnAdd.closest("#confirm-dialog")) {
            const prodId = parseInt(btnAdd.dataset.id);
            agregarAlCarrito(prodId);
            if (btnOpenCart) btnOpenCart.click();
        }
    });

    // Lógica de confirmación dialog custom
    if (btnDialogCancel && dialogConfirm) {
        btnDialogCancel.addEventListener("click", () => {
            dialogConfirm.close();
            pendingDeleteId = null;
            pendingDeleteBulkIds = null;
        });
    }

    if (btnDialogAccept && dialogConfirm) {
        btnDialogAccept.addEventListener("click", () => {
            if (pendingDeleteId !== null) {
                eliminarProductoDefinitivamente(pendingDeleteId);
                pendingDeleteId = null;
            } else if (pendingDeleteBulkIds !== null) {
                carrito = carrito.filter(item => !pendingDeleteBulkIds.includes(item.id));
                guardarCarritoEnStorage();
                renderCart();
                pendingDeleteBulkIds = null;
            }
            dialogConfirm.close();
        });
    }

    // Selección múltiple global
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener("change", (e) => {
            const itemCheckboxes = document.querySelectorAll(".item-checkbox");
            itemCheckboxes.forEach(checkbox => {
                checkbox.checked = e.target.checked;
            });
            evaluarEstadoBulkDelete();
        });
    }

    // Borrado múltiple
    if (btnDeleteBulk && dialogConfirm) {
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
}

// 3. NUEVA: Delegación de eventos para optimizar el redibujado del carrito
function initCartDelegation() {
    const cartContainer = document.getElementById("cart-items-container");
    if (!cartContainer) return;

    // Controla clics de sumar, restar y eliminar
    cartContainer.addEventListener("click", (e) => {
        const btnInc = e.target.closest('.inc-btn');
        const btnDec = e.target.closest('.dec-btn');
        const btnRemove = e.target.closest('.btn-remove-item');

        if (btnInc) {
            modificarCantidad(parseInt(btnInc.dataset.id), 1);
        } else if (btnDec) {
            modificarCantidad(parseInt(btnDec.dataset.id), -1);
        } else if (btnRemove) {
            pendingDeleteId = parseInt(btnRemove.dataset.id);
            document.getElementById("dialog-title").textContent = "¿Desea eliminar el producto del carrito?";
            document.getElementById("confirm-dialog").showModal();
        }
    });

    // Controla el cambio de los checkboxes individuales
    cartContainer.addEventListener("change", (e) => {
        if (e.target.classList.contains("item-checkbox")) {
            const itemCheckboxes = document.querySelectorAll(".item-checkbox");
            const selectAllCheckbox = document.getElementById("select-all-cart");

            if (selectAllCheckbox) {
                const allChecked = Array.from(itemCheckboxes).every(i => i.checked);
                selectAllCheckbox.checked = allChecked;
            }
            evaluarEstadoBulkDelete();
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
    guardarCarritoEnStorage();
    renderCart();
}

function modificarCantidad(id, delta) {
    const producto = carrito.find(item => item.id === id);
    if (!producto) return;

    if (producto.cantidad === 1 && delta === -1) {
        pendingDeleteId = id;
        document.getElementById("dialog-title").textContent = "¿Desea eliminar el producto del carrito?";
        document.getElementById("confirm-dialog").showModal();
    } else {
        producto.cantidad += delta;
        guardarCarritoEnStorage();
        renderCart();
    }
}

function eliminarProductoDefinitivamente(id) {
    carrito = carrito.filter(item => item.id !== id);
    guardarCarritoEnStorage();
    renderCart();
}

function evaluarEstadoBulkDelete() {
    const itemsChecked = document.querySelectorAll(".item-checkbox:checked");
    const btnDeleteBulk = document.getElementById("btn-delete-bulk");

    if (btnDeleteBulk) {
        if (itemsChecked.length > 0) {
            btnDeleteBulk.classList.add("active");
            btnDeleteBulk.disabled = false;
        } else {
            btnDeleteBulk.classList.remove("active");
            btnDeleteBulk.disabled = true;
        }
    }
}

// 4. Limpiamos la función renderCart de listeners redundantes
function renderCart() {
    const container = document.getElementById("cart-items-container");
    const totalPriceEl = document.getElementById("cart-total-price");
    const selectAllCheckbox = document.getElementById("select-all-cart");

    if (!container) return;

    if (carrito.length === 0) {
        container.innerHTML = `
            <div class="cart-empty-msg">
                <svg aria-hidden="true" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                <p>Tu carrito está vacío.</p>
            </div>
        `;
        if (totalPriceEl) totalPriceEl.textContent = "$0.00";

        // Mejoramos la UX deshabilitando el check maestro si no hay nada
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.disabled = true;
        }

        evaluarEstadoBulkDelete();
        actualizarBotonCabecera();
        actualizarTimestampUI();
        return;
    }

    if (selectAllCheckbox) selectAllCheckbox.disabled = false;

    let subtotal = 0;
    container.innerHTML = "";

    carrito.forEach(item => {
        subtotal += item.precio * item.cantidad;

        const article = document.createElement("article");
        article.className = "cart-item";

        const imgNode = item.imagen
            ? `<img src="${getProductoImagePath(item.imagen)}" alt="${item.nombre}" class="cart-item-img">`
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

    if (totalPriceEl) totalPriceEl.textContent = `$${subtotal.toFixed(2)}`;

    evaluarEstadoBulkDelete();
    actualizarBotonCabecera();
    actualizarTimestampUI();
}

function actualizarTimestampUI() {
    const lastUpdateEl = document.getElementById("cart-last-update");
    if (lastUpdateEl) {
        const lastUpdateStr = sessionStorage.getItem('lastUpdate');
        if (lastUpdateStr) {
            const date = new Date(lastUpdateStr);
            const timeString = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            lastUpdateEl.textContent = `Última actualización: ${timeString}`;
            lastUpdateEl.style.display = 'block';
        } else {
            lastUpdateEl.style.display = 'none';
        }
    }
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

function getProductosDataPath() {
    const currentPath = location.pathname.replace(/\\/g, "/");
    return currentPath.includes("/app/view/") ? "../data/productos.json" : "app/data/productos.json";
}

function getProductoImagePath(imagenPath) {
    if (!imagenPath) return "";
    const currentPath = location.pathname.replace(/\\/g, "/");
    return currentPath.includes("/app/view/") ? imagenPath : `app/view/${imagenPath}`;
}

async function cargarProductos() {
    const grid = document.getElementById("product-grid");
    if (!grid) return;

    try {
        grid.setAttribute("aria-busy", "true");
        const response = await fetch(getProductosDataPath());

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const productos = await response.json();
        productosDisponibles = productos;
        grid.innerHTML = "";

        productos.slice(0, 4).forEach(producto => {
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
        // Eliminamos el role="list" para evitar conflicto de accesibilidad al inyectar un párrafo
        grid.removeAttribute("role");
        grid.innerHTML = `<p class="error loading" role="alert">Hubo un problema al cargar los productos: ${error.message}</p>`;
    }
}