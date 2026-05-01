import { initContacto } from './contacto.js';
import { storage } from './storage.js';

// Estado Global
let productosDisponibles = [];
let carrito = [];
let pendingDeleteId = null;
let pendingDeleteBulkIds = null;

function guardarCarritoEnStorage() {
    try {
        storage.guardarCarritoLocalStorage(carrito);
        storage.guardarTimestampSesion();
    } catch (error) {
        console.error("Error al guardar el carrito:", error);
    }
}

function cargarCarritoDeStorage() {
    try {
        carrito = storage.recuperarCarritoLocalStorage();
        if (!Array.isArray(carrito)) {
            carrito = [];
        }
    } catch (error) {
        console.error("Error al recuperar el carrito:", error);
        carrito = [];
        storage.limpiarCarritoLocalStorage();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    cargarCarritoDeStorage();
    if (typeof renderCart === 'function') renderCart();
    inicializarSistema();
    if (typeof initScrollTop === 'function') initScrollTop();
    if (typeof initCartDrawer === 'function') initCartDrawer();
    if (typeof initCartDelegation === 'function') initCartDelegation();
    if (typeof gestionCookies !== 'undefined') gestionCookies.init();

    // Iniciar PWA Listeners
    initNetworkListeners();
    // Iniciar validaciones de contacto
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

const gestionCookies = {
    init() {
        const banner = document.getElementById('cookie-banner');
        const btnAccept = document.getElementById('btn-accept-cookies');
        const btnReject = document.getElementById('btn-reject-cookies');

        if (!banner) return;

        if (this.obtenerCookie('terminosAceptados') === 'true') {
            banner.style.display = 'none';
            banner.setAttribute('aria-hidden', 'true');
        } else {
            banner.style.display = 'flex';
            banner.setAttribute('aria-hidden', 'false');

            setTimeout(() => {
                if (btnAccept) {
                    btnAccept.disabled = false;
                    btnAccept.style.cursor = 'pointer';
                }
            }, 600);

            if (btnAccept) {
                btnAccept.addEventListener('click', () => {
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
        const stringCookie = `${nombre}=${valor};${expira};path=/`;
        document.cookie = stringCookie;
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

function desbloquearInterfaz() {
    const btnCart = document.querySelector(".btn-cart");
    if (btnCart) btnCart.disabled = false;
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

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener("change", (e) => {
            const itemCheckboxes = document.querySelectorAll(".item-checkbox");
            itemCheckboxes.forEach(checkbox => {
                checkbox.checked = e.target.checked;
            });
            evaluarEstadoBulkDelete();
        });
    }

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
} // <--- ¡AQUÍ ESTABA EL ERROR! ESTA LLAVE FALTABA Y ROMPÍA TODO EL CÓDIGO

function initCartDelegation() {
    const cartContainer = document.getElementById("cart-items-container");
    if (!cartContainer) return;

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
window.agregarAlCarrito = agregarAlCarrito; // Expuesto para el onclick del HTML

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

    if (window.location.pathname.includes('catalog.html')) {
        return;
    }

    try {
        grid.setAttribute("aria-busy", "true");
        const response = await fetch(getProductosDataPath());

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const productos = await response.json();
        productosDisponibles = productos;

        await storage.guardarProductosIndexedDB(productos);

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
                <button type="button" data-id="${producto.id}" class="btn btn-primary" onclick="agregarAlCarrito(${producto.id})" aria-label="Añadir ${producto.nombre} al carrito">
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
        grid.removeAttribute("role");
        grid.innerHTML = `<p class="error loading" role="alert">Hubo un problema al cargar los productos: ${error.message}</p>`;
    }
}

// ======================================================================
// PWA: GESTIÓN DE RED Y SINCRONIZACIÓN OFFLINE
// ======================================================================

function initNetworkListeners() {
    const banner = document.getElementById('network-status');
    if (!banner) return;

    window.addEventListener('offline', () => {
        banner.textContent = 'Sin conexión a internet. Tus acciones se guardarán de forma local.';
        banner.className = 'network-status offline';
        banner.classList.remove('hidden');
    });

    window.addEventListener('online', async () => {
        banner.textContent = 'Conexión restablecida. Sincronizando datos...';
        banner.className = 'network-status online';
        banner.classList.remove('hidden');

        await sincronizarTareasOffline();

        setTimeout(() => {
            banner.classList.add('hidden');
        }, 3000);
    });

    if (!navigator.onLine) {
        banner.textContent = 'Sin conexión a internet. Modo offline activo.';
        banner.className = 'network-status offline';
        banner.classList.remove('hidden');
    }
}

async function sincronizarTareasOffline() {
    console.log('🔄 Iniciando sincronización de tareas offline...');
    try {
        const tareas = await storage.obtenerTareasPendientes();

        if (tareas.length === 0) {
            console.log('ℹ️ No hay tareas pendientes para sincronizar.');
            return;
        }

        for (const tarea of tareas) {
            if (tarea.accion === 'enviar_contacto') {
                console.log(`📤 Sincronizando: ${tarea.accion}`, tarea.datos);
                await new Promise(resolve => setTimeout(resolve, 1500));
                console.log(`✅ Tarea sincronizada con éxito: ${tarea.id}`);
                await storage.eliminarTarea(tarea.id);
            } else if (tarea.accion === 'completar_pedido') {
                console.log(`📤 Procesando pedido offline: ${tarea.id}`, tarea.datos);
                await new Promise(resolve => setTimeout(resolve, 2000));
                console.log(`✅ Pedido sincronizado con éxito: ${tarea.id}`);
                await storage.eliminarTarea(tarea.id);
            }
        }
    } catch (error) {
        console.error(`❌ Error al sincronizar tareas:`, error);
    }
}

// Delegación del botón Checkout
document.body.addEventListener('click', async (e) => {
    if (e.target.id === 'btn-submit' && !e.target.disabled) {
        e.preventDefault();
        if (carrito.length === 0) return;

        if (!navigator.onLine) {
            await storage.guardarTareaOffline('completar_pedido', [...carrito]);
            carrito = [];
            guardarCarritoEnStorage();
            if (typeof renderCart === 'function') renderCart();
            alert("🔴 Estás sin conexión. Tu pedido se ha guardado localmente y se procesará en cuanto vuelva el internet.");
        } else {
            alert("🟢 ¡Pedido procesado con éxito!");
            carrito = [];
            guardarCarritoEnStorage();
            if (typeof renderCart === 'function') renderCart();
        }

        // Cerrar carrito al finalizar
        const btnCloseCart = document.getElementById("btn-close-cart");
        if (btnCloseCart) btnCloseCart.click();
    }
});