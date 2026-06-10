/**
 * APP.JS — Orquestador Principal
 * =========================================================
 * Responsabilidades:
 * - Inicialización del sistema (carga, overlay, productos)
 * - Gestión del carrito drawer (abrir/cerrar, focus trap)
 * - Delegación de eventos del carrito
 * - Gestión de cookies de políticas
 * - Listeners de red (PWA offline-first)
 * - Scroll-to-top y menú mobile
 * - Exporta window.agregarAlCarrito para compatibilidad global
 */

import { initContacto } from './contacto.js';
import { storage } from './storage.js';
import { repo } from './repo.js';
import * as cart from './cart.js';
import * as view from './view.js';
import './modal.js';
import './citas.js';
import { initCarousel } from './carousel.js';

// ── Estado global de diálogos ─────────────────────────────
let pendingDeleteId = null;
let pendingDeleteBulkIds = null;

// ── Función de alerta global (usada desde contacto.js) ────
window.mostrarAlerta = view.showAlert;

// ── Función global para añadir al carrito (usada desde HTML) ─
/**
 * @param {number} id - ID del producto
 * @param {string} [tallaSeleccionada] - Talla elegida por el usuario en el selector
 */
window.agregarAlCarrito = (id, tallaSeleccionada) => {
    const added = cart.addToCart(id, tallaSeleccionada);
    if (!added) {
        window.mostrarAlerta('Stock insuficiente', 'No se puede agregar más unidades de este producto.');
        return;
    }

    view.renderCart(cart.getCartItems());
    window.actualizarStockCatalogo?.();
    window.actualizarStockInicio?.();

    const product = cart.getCartItems().find(item => String(item.id) === String(id));
    const nombre = product ? product.nombre : "el producto";
    view.showToast(`Agregaste exitosamente ${nombre} al carrito`);
};

window.actualizarStockInicio = () => {
    const grid = document.getElementById('product-grid');
    if (!grid || window.location.pathname.includes('catalog.html')) return;
    if (!repo.productosDisponibles || repo.productosDisponibles.length === 0) return;

    grid.innerHTML = repo.productosDisponibles
        .slice(0, 4)
        .map(producto => getProductoHtml(producto))
        .join('');
};

// ====================================================================
// INICIALIZACIÓN PRINCIPAL
// ====================================================================
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Cargar carrito desde localStorage
    cart.loadCart();
    view.renderCart(cart.getCartItems());

    // 2. Inicializar sistema (productos, overlay)
    await inicializarSistema();

    // 3. Inicializar módulos de UI
    initScrollTop();
    initCartDrawer();
    initCartDelegation();
    initMobileMenu();
    initCollectionChips();
    initProductCardDelegation();
    initCarousel();

    // 4. Inicializar cookies
    if (typeof gestionCookies !== 'undefined') {
        gestionCookies.init();
    } else {
        cookieManager.init();
    }

    // 5. Listeners de red PWA
    initNetworkListeners();

    // 6. Validaciones del formulario de contacto
    initContacto();
});

// ====================================================================
// MENÚ MOBILE
// ====================================================================
/**
 * Inicializa el menú hamburguesa para dispositivos móviles.
 * Gestiona aria-expanded correctamente.
 */
function initMobileMenu() {
    const toggleBtn = document.querySelector('.mobile-menu-toggle');
    const primaryNav = document.getElementById('primary-navigation');

    if (!toggleBtn || !primaryNav) return;

    toggleBtn.addEventListener('click', () => {
        const isOpen = primaryNav.classList.toggle('is-open');
        toggleBtn.setAttribute('aria-expanded', String(isOpen));
        toggleBtn.setAttribute('aria-label', isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
    });

    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!primaryNav.contains(e.target) && !toggleBtn.contains(e.target)) {
            primaryNav.classList.remove('is-open');
            toggleBtn.setAttribute('aria-expanded', 'false');
        }
    });
}

// ====================================================================
// COLLECTION CHIPS (Filtros visuales de categoría)
// ====================================================================
/**
 * Inicializa los chips de categoría en la página de inicio.
 * Actualiza aria-pressed para indicar el estado activo.
 */
function initCollectionChips() {
    const chips = document.querySelectorAll('.collection-chip');
    if (!chips.length) return;

    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            const isPressed = chip.getAttribute('aria-pressed') === 'true';
            // Toggle del chip actual
            chip.setAttribute('aria-pressed', String(!isPressed));
            chip.classList.toggle('active', !isPressed);
        });
    });
}

// ====================================================================
// PRODUCT CARD DELEGATION (Home Page)
// ====================================================================
/**
 * Gestiona los clics y teclado en las tarjetas de producto de la página de inicio.
 */
function initProductCardDelegation() {
    const grid = document.getElementById('product-grid');
    if (!grid || window.location.pathname.includes('catalog.html')) return;

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

// ====================================================================
// INICIALIZACIÓN DEL SISTEMA
// ====================================================================
/**
 * Carga los productos y gestiona el overlay de carga inicial.
 */
async function inicializarSistema() {
    const overlay = document.getElementById('loading-overlay');
    try {
        await new Promise(resolve => setTimeout(resolve, 800));
        await cargarProductos();
        desbloquearInterfaz();
    } catch (error) {
        console.error('Error crítico de inicialización:', error);
        const grid = document.getElementById('product-grid');
        if (grid) {
            grid.innerHTML = `<li class="error" role="alert">Error al cargar la colección: ${error.message}</li>`;
        }
    } finally {
        if (overlay) overlay.classList.add('hidden');
    }
}

// ====================================================================
// GESTIÓN DE COOKIES
// ====================================================================
/**
 * Módulo de gestión de consentimiento de cookies.
 * Implementa la Estrategia 4 de Persistencia.
 */
const cookieManager = {
    init() {
        const banner = document.getElementById('cookie-banner');
        const btnAccept = document.getElementById('btn-accept-cookies');
        const btnReject = document.getElementById('btn-reject-cookies');

        if (!banner) return;

        if (storage.obtenerCookie('terminosAceptados') === 'true') {
            banner.style.display = 'none';
            banner.setAttribute('aria-hidden', 'true');
        } else {
            banner.style.display = 'flex';
            banner.setAttribute('aria-hidden', 'false');

            setTimeout(() => {
                if (btnAccept) {
                    btnAccept.disabled = false;
                    btnAccept.removeAttribute('aria-disabled');
                }
                // Mover foco al primer botón del banner (WCAG 2.4.3)
                if (btnReject) btnReject.focus();
            }, 650);

            // ── Focus trap del banner de cookies ──────────────────────────
            banner.addEventListener('keydown', (e) => {
                if (e.key !== 'Tab') return;
                const focusables = Array.from(
                    banner.querySelectorAll('button:not([disabled])')
                );
                if (focusables.length === 0) return;
                const first = focusables[0];
                const last = focusables[focusables.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    }
                } else {
                    if (document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
                }
            });

            if (btnAccept) {
                btnAccept.addEventListener('click', () => {
                    storage.guardarCookie('terminosAceptados', 'true', 365);
                    // Guardar preferencia en cookies (Estrategia 4 - preferencias)
                    storage.guardarPreferenciasUsuario({
                        cookiesAceptadas: true,
                        fechaAceptacion: new Date().toISOString()
                    });
                    banner.style.display = 'none';
                    banner.setAttribute('aria-hidden', 'true');
                });
            }

            if (btnReject) {
                btnReject.addEventListener('click', () => {
                    storage.guardarCookie('terminosAceptados', 'false', 30);
                    banner.style.display = 'none';
                    banner.setAttribute('aria-hidden', 'true');
                });
            }
        }
    }
};

// Alias legacy para compatibilidad
const gestionCookies = cookieManager;

// ====================================================================
// INTERFAZ
// ====================================================================
/**
 * Desbloquea el botón del carrito una vez que el sistema está listo.
 */
function desbloquearInterfaz() {
    const btnCart = document.querySelector('.btn-cart');
    if (btnCart) btnCart.disabled = false;
}

// ====================================================================
// SCROLL TO TOP
// ====================================================================
/**
 * Gestiona el botón de volver arriba.
 * Actualiza aria-hidden y tabindex dinámicamente.
 */
function initScrollTop() {
    const btnScroll = document.getElementById('btn-scroll-top');
    if (!btnScroll) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            btnScroll.classList.add('show');
            btnScroll.setAttribute('aria-hidden', 'false');
            btnScroll.setAttribute('tabindex', '0');
        } else {
            btnScroll.classList.remove('show');
            btnScroll.setAttribute('aria-hidden', 'true');
            btnScroll.setAttribute('tabindex', '-1');
        }
    });

    btnScroll.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ====================================================================
// CART DRAWER — Con Focus Trap completo
// ====================================================================
/**
 * Inicializa el drawer del carrito con:
 * - Apertura/cierre con aria-expanded actualizado
 * - Focus trap completo (Tab y Shift+Tab dentro del drawer)
 * - Cierre con Escape
 * - Confirmación para eliminar/bulk delete
 */
function initCartDrawer() {
    const btnOpenCart = document.querySelector('.btn-cart');
    const btnCloseCart = document.getElementById('btn-close-cart');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartDrawer = document.getElementById('cart-drawer');
    const selectAllCheckbox = document.getElementById('select-all-cart');
    const btnDeleteBulk = document.getElementById('btn-delete-bulk');

    const dialogConfirm = document.getElementById('confirm-dialog');
    const btnDialogCancel = document.getElementById('btn-dialog-cancel');
    const btnDialogAccept = document.getElementById('btn-dialog-accept');

    if (!btnOpenCart || !cartOverlay || !cartDrawer || !btnCloseCart) return;

    // ── Función de apertura ──
    const openCart = () => {
        cartOverlay.classList.add('active');
        cartOverlay.setAttribute('aria-hidden', 'false');
        cartDrawer.classList.add('open');
        cartDrawer.setAttribute('aria-hidden', 'false');
        btnOpenCart.setAttribute('aria-expanded', 'true');

        // Resetear checkboxes al abrir
        const allCheckboxes = cartDrawer.querySelectorAll('.item-checkbox');
        allCheckboxes.forEach(cb => { cb.checked = false; });
        if (selectAllCheckbox) selectAllCheckbox.checked = false;
        view.evaluarEstadoBulkDelete();

        // Foco al botón de cierre
        btnCloseCart.focus();
    };

    // ── Función de cierre ──
    const closeCart = () => {
        cartOverlay.classList.remove('active');
        cartOverlay.setAttribute('aria-hidden', 'true');
        cartDrawer.classList.remove('open');
        cartDrawer.setAttribute('aria-hidden', 'true');
        btnOpenCart.setAttribute('aria-expanded', 'false');
        btnOpenCart.focus();
    };

    // ── Focus trap dentro del drawer ──
    cartDrawer.addEventListener('keydown', (e) => {
        if (!cartDrawer.classList.contains('open')) return;
        if (e.key !== 'Tab') return;

        // Elementos enfocables dentro del drawer
        const focusables = Array.from(
            cartDrawer.querySelectorAll(
                'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
        ).filter(el => !el.closest('[aria-hidden="true"]'));

        if (focusables.length === 0) return;

        const firstEl = focusables[0];
        const lastEl = focusables[focusables.length - 1];

        if (e.shiftKey) {
            // Shift+Tab: si estamos en el primero, ir al último
            if (document.activeElement === firstEl) {
                e.preventDefault();
                lastEl.focus();
            }
        } else {
            // Tab: si estamos en el último, ir al primero
            if (document.activeElement === lastEl) {
                e.preventDefault();
                firstEl.focus();
            }
        }
    });

    // ── Eventos de apertura y cierre ──
    btnOpenCart.addEventListener('click', openCart);
    btnCloseCart.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // ── Escape para cerrar ──
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (dialogConfirm && dialogConfirm.open) {
                dialogConfirm.close();
            } else if (cartDrawer.classList.contains('open')) {
                closeCart();
            }
        }
    });

    // ── Diálogo de confirmación ──
    if (btnDialogCancel && dialogConfirm) {
        btnDialogCancel.addEventListener('click', () => {
            dialogConfirm.close();
            pendingDeleteId = null;
            pendingDeleteBulkIds = null;
        });
    }

    if (btnDialogAccept && dialogConfirm) {
        btnDialogAccept.addEventListener('click', () => {
            if (pendingDeleteId !== null) {
                cart.deleteItem(pendingDeleteId);
                pendingDeleteId = null;
            } else if (pendingDeleteBulkIds !== null) {
                cart.removeItemsByIds(pendingDeleteBulkIds);
                pendingDeleteBulkIds = null;
            }
            view.renderCart(cart.getCartItems());
            window.actualizarStockCatalogo?.();
            window.actualizarStockInicio?.();
            dialogConfirm.close();
        });
    }

    // ── Seleccionar todos (bulk) ──
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
            const itemCheckboxes = cartDrawer.querySelectorAll('.item-checkbox');
            itemCheckboxes.forEach(checkbox => {
                checkbox.checked = e.target.checked;
            });
            view.evaluarEstadoBulkDelete();
        });
    }

    // ── Eliminar múltiples ──
    if (btnDeleteBulk && dialogConfirm) {
        btnDeleteBulk.addEventListener('click', () => {
            const itemCheckboxes = cartDrawer.querySelectorAll('.item-checkbox:checked');
            const idsToRemove = Array.from(itemCheckboxes).map(cb => cb.dataset.id);

            if (idsToRemove.length > 0) {
                pendingDeleteBulkIds = idsToRemove;
                document.getElementById('dialog-title').textContent = '¿Desea eliminar los productos seleccionados del carrito?';
                dialogConfirm.showModal();
            }
        });
    }
}

// ====================================================================
// DELEGACIÓN DE EVENTOS DEL CARRITO
// ====================================================================
/**
 * Gestiona los clics en los botones +/- y eliminar dentro del carrito.
 * Usa delegación de eventos para eficiencia.
 */
function initCartDelegation() {
    const cartContainer = document.getElementById('cart-items-container');
    if (!cartContainer) return;

    cartContainer.addEventListener('click', (e) => {
        const btnInc = e.target.closest('.inc-btn');
        const btnDec = e.target.closest('.dec-btn');
        const btnRemove = e.target.closest('.btn-remove-item');

        if (btnInc) {
            const success = cart.modifyQuantity(btnInc.dataset.id, 1);
            if (!success) {
                window.mostrarAlerta('Stock insuficiente', 'No hay suficientes unidades disponibles para aumentar la cantidad.');
                return;
            }
            view.renderCart(cart.getCartItems());
            window.actualizarStockCatalogo?.();
            window.actualizarStockInicio?.();
        } else if (btnDec) {
            const id = btnDec.dataset.id;
            const item = cart.getCartItemById(id);
            if (item && item.cantidad === 1) {
                pendingDeleteId = id;
                document.getElementById('dialog-title').textContent = '¿Desea eliminar el producto del carrito?';
                document.getElementById('confirm-dialog').showModal();
            } else {
                cart.modifyQuantity(id, -1);
                view.renderCart(cart.getCartItems());
                window.actualizarStockCatalogo?.();
                window.actualizarStockInicio?.();
            }
        } else if (btnRemove) {
            pendingDeleteId = btnRemove.dataset.id;
            document.getElementById('dialog-title').textContent = '¿Desea eliminar el producto del carrito?';
            document.getElementById('confirm-dialog').showModal();
        }
    });

    cartContainer.addEventListener('change', (e) => {
        if (e.target.classList.contains('item-checkbox')) {
            const itemCheckboxes = document.querySelectorAll('.item-checkbox');
            const selectAllCheckbox = document.getElementById('select-all-cart');

            if (selectAllCheckbox) {
                const allChecked = Array.from(itemCheckboxes).every(i => i.checked);
                selectAllCheckbox.checked = allChecked;
            }
            view.evaluarEstadoBulkDelete();
        }
    });
}

// ====================================================================
// RENDERIZADO DE TARJETAS DE PRODUCTO (Home Page)
// ====================================================================
/**
 * Construye las opciones <option> para el selector de talla de un producto.
 * @param {string} tallaRango - Rango de tallas del producto (ej: "S - XL")
 * @returns {string} HTML de las opciones
 */
function buildSizeOptions(tallaRango) {
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const parts = tallaRango.split(' - ');
    const startSize = parts[0].trim().toUpperCase();
    const endSize = parts[1] ? parts[1].trim().toUpperCase() : startSize;
    const startIndex = sizeOrder.indexOf(startSize);
    const endIndex = sizeOrder.indexOf(endSize);

    if (startIndex === -1) {
        // Talla no estándar: mostrar solo como opción única
        return `<option value="${tallaRango}">${tallaRango}</option>`;
    }

    const available = sizeOrder.slice(
        startIndex,
        endIndex !== -1 ? endIndex + 1 : startIndex + 1
    );
    return available.map(s => `<option value="${s}">${s}</option>`).join('');
}

/**
 * Genera el HTML de una tarjeta de producto para la página de inicio.
 * @param {Object} producto - Objeto del producto desde el JSON
 * @returns {string} HTML de la tarjeta como string
 */
function getProductoHtml(producto) {
    const imgHtml = producto.imagen
        ? `<img src="${repo.getProductoImagePath(producto.imagen)}" alt="${producto.nombre}" class="product-image" loading="lazy">`
        : `<div class="product-art" aria-hidden="true">${producto.abreviatura}</div>`;

    const reservedQuantity = cart.getProductQuantityInCart(producto.id);
    const stockDisponible = Math.max(0, producto.stock - reservedQuantity);
    const lowStockLabel = stockDisponible > 0 && stockDisponible <= 5
        ? `<span class="product-stock product-stock-low" aria-live="polite">Pocas unidades</span>`
        : '';
    const stockText = stockDisponible === 0
        ? 'Agotado'
        : stockDisponible === 1
            ? 'Última unidad'
            : `Disponibles: ${stockDisponible}`;

    return `
        <li class="product-card" role="button" tabindex="0" data-id="${producto.id}"
            aria-labelledby="producto-${producto.id}-nombre"
            aria-describedby="producto-${producto.id}-descripcion producto-${producto.id}-precio producto-${producto.id}-talla">
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
                        <span class="product-tag">${stockText}</span>
                        ${lowStockLabel}
                    </div>
                </div>
            </div>
        </li>
    `;
}

// ====================================================================
// CARGA DE PRODUCTOS (Home Page)
// ====================================================================
/**
 * Carga los productos destacados (primeros 4) en la página de inicio.
 * Usa repo.obtenerProductos() que cachea en IndexedDB.
 */
async function cargarProductos() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    if (window.location.pathname.includes('catalog.html')) return;

    try {
        grid.setAttribute('aria-busy', 'true');
        const productos = await repo.obtenerProductos();
        grid.innerHTML = productos
            .slice(0, 4)
            .map(producto => getProductoHtml(producto))
            .join('');
        grid.setAttribute('aria-busy', 'false');
    } catch (error) {
        console.error('Error al cargar los productos:', error);
        grid.setAttribute('aria-busy', 'false');
        grid.removeAttribute('role');
        grid.innerHTML = `<li class="error loading" role="alert">Hubo un problema al cargar los productos: ${error.message}</li>`;
    }
}

// ====================================================================
// PWA: GESTIÓN DE RED Y SINCRONIZACIÓN OFFLINE
// ====================================================================
/**
 * Inicializa los listeners de conectividad para el modo offline.
 * Muestra un banner cuando se pierde/recupera la conexión.
 */
function initNetworkListeners() {
    const banner = document.getElementById('network-status');
    if (!banner) return;

    window.addEventListener('offline', () => {
        banner.textContent = '⚠️ Sin conexión. Tus acciones se guardarán localmente.';
        banner.className = 'network-status offline';
        banner.classList.remove('hidden');
    });

    window.addEventListener('online', async () => {
        banner.textContent = '✅ Conexión restablecida. Sincronizando datos...';
        banner.className = 'network-status online';
        banner.classList.remove('hidden');

        await sincronizarTareasOffline();

        setTimeout(() => {
            banner.classList.add('hidden');
        }, 3000);
    });

    if (!navigator.onLine) {
        banner.textContent = '⚠️ Sin conexión. Modo offline activo.';
        banner.className = 'network-status offline';
        banner.classList.remove('hidden');
    }
}

/**
 * Procesa y sincroniza tareas guardadas mientras estaba offline.
 * Las tareas se almacenan en IndexedDB (colaTareas).
 */
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
                console.log(`✅ Tarea sincronizada: ${tarea.id}`);
                await storage.eliminarTarea(tarea.id);
            } else if (tarea.accion === 'completar_pedido') {
                console.log(`📤 Procesando pedido offline: ${tarea.id}`, tarea.datos);
                await new Promise(resolve => setTimeout(resolve, 2000));
                console.log(`✅ Pedido sincronizado: ${tarea.id}`);
                await storage.eliminarTarea(tarea.id);
            }
        }
    } catch (error) {
        console.error('❌ Error al sincronizar tareas:', error);
    }
}

// ====================================================================
// CHECKOUT — Delegación del botón "Completar pedido"
// ====================================================================
/**
 * Escucha el clic en el botón de checkout.
 * Maneja modo online y offline correctamente.
 */
document.body.addEventListener('click', async (e) => {
    if (e.target.id === 'btn-submit' && !e.target.disabled) {
        e.preventDefault();
        e.target.blur();

        const cartItems = cart.getCartItems();
        if (cartItems.length === 0) return;

        if (!navigator.onLine) {
            await storage.guardarTareaOffline('completar_pedido', [...cartItems]);
            repo.actualizarStockPorCompra(cartItems);
            cart.clearCart();
            view.renderCart(cart.getCartItems());
            window.actualizarStockCatalogo?.();
            window.actualizarStockInicio?.();
            window.mostrarAlerta('Modo Offline 📡', 'Estás sin conexión. Tu pedido se ha guardado localmente y se procesará cuando vuelva el internet.');
        } else {
            repo.actualizarStockPorCompra(cartItems);
            cart.clearCart();
            view.renderCart(cart.getCartItems());
            window.actualizarStockCatalogo?.();
            window.actualizarStockInicio?.();
            window.mostrarAlerta('¡Éxito! 🎉', 'Pedido procesado con éxito. ¡Gracias por tu compra!');
        }

        const btnCloseCart = document.getElementById('btn-close-cart');
        if (btnCloseCart) btnCloseCart.click();
    }
});