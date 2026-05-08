/**
 * VIEW.JS — Capa de Presentación del Carrito
 * =========================================================
 * Responsabilidades:
 * - Renderizar los items del carrito en el DOM
 * - Actualizar el contador del badge de cabecera
 * - Mostrar/ocultar botón de eliminación masiva
 * - Mostrar el timestamp de última actualización (sessionStorage)
 * - Gestionar el modal de alertas
 */

import { repo } from './repo.js';

// ====================================================================
// MODAL DE ALERTAS
// ====================================================================

/**
 * Muestra un diálogo modal de alerta accesible.
 * Usa el elemento <dialog> nativo para focus trap automático.
 * @param {string} titulo - Título del modal
 * @param {string} mensaje - Mensaje del modal
 */
export function showAlert(titulo, mensaje) {
    const modal = document.getElementById('alert-dialog');
    const titleEl = document.getElementById('alert-title');
    const msgEl = document.getElementById('alert-message');
    const btnAccept = document.getElementById('btn-alert-accept');

    if (modal && titleEl && msgEl) {
        titleEl.textContent = titulo;
        msgEl.textContent = mensaje;
        modal.showModal();
        if (btnAccept) {
            btnAccept.onclick = () => modal.close();
        }
    } else {
        // Fallback si el dialog no existe en el DOM
        alert(`${titulo}\n\n${mensaje}`);
    }
}

/**
 * Muestra una notificación temporal (Toast) de manera accesible.
 * @param {string} mensaje - Mensaje a mostrar
 */
export function showToast(mensaje) {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container';
        toastContainer.setAttribute('aria-live', 'polite');
        toastContainer.setAttribute('aria-atomic', 'true');
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = mensaje;
    toast.setAttribute('role', 'status');
    
    toastContainer.appendChild(toast);
    
    // Forzar reflow para que la transición de CSS se aplique
    toast.offsetHeight;
    toast.classList.add('show');
    
    // Ocultar y eliminar después de 4.5 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => toast.remove());
    }, 4500);
}

// ====================================================================
// RENDERIZADO DEL CARRITO
// ====================================================================

/**
 * Renderiza la lista completa de items del carrito en el drawer.
 * Actualiza totales, badge de cabecera y timestamp.
 * @param {Array<Object>} cartItems - Array de items del carrito
 */
export function renderCart(cartItems) {
    const container = document.getElementById('cart-items-container');
    const totalPriceEl = document.getElementById('cart-total-price');
    const selectAllCheckbox = document.getElementById('select-all-cart');

    if (!container) return;

    // ── Carrito vacío ──
    if (cartItems.length === 0) {
        container.innerHTML = `
            <div class="cart-empty-msg">
                <svg aria-hidden="true" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <p>Tu carrito está vacío.</p>
            </div>
        `;
        if (totalPriceEl) totalPriceEl.textContent = '$0.00';
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.disabled = true;
        }
        evaluarEstadoBulkDelete();
        actualizarBotonCabecera(cartItems);
        actualizarTimestampUI();
        return;
    }

    // ── Habilitar checkbox de selección ──
    if (selectAllCheckbox) {
        selectAllCheckbox.removeAttribute('disabled');
        selectAllCheckbox.checked = false;
    }

    // ── Renderizar items ──
    let subtotal = 0;
    container.innerHTML = '';

    cartItems.forEach(item => {
        subtotal += item.precio * item.cantidad;

        const article = document.createElement('article');
        article.className = 'cart-item';
        article.setAttribute('aria-label', `${item.nombre}, cantidad: ${item.cantidad}`);

        const imgNode = item.imagen
            ? `<img src="${repo.getProductoImagePath(item.imagen)}" alt="${item.nombre}" class="cart-item-img">`
            : `<div class="cart-item-img" style="background: var(--surface-soft);" aria-hidden="true"></div>`;

        const incDisabled = item.cantidad >= item.stock ? 'disabled' : '';
        const stockNotice = item.stock !== undefined
            ? `<span class="cart-item-stock">${item.stock - item.cantidad} unidad${item.stock - item.cantidad === 1 ? '' : 'es'} disponibles</span>`
            : '';

        article.innerHTML = `
            <input type="checkbox" class="item-checkbox cart-item-checkbox"
                data-id="${item.cartId || item.id}"
                aria-label="Seleccionar ${item.nombre} para eliminar">
            ${imgNode}
            <div class="cart-item-details">
                <h4>${item.nombre}</h4>
                <span class="cart-item-cat">${item.categoria} — Talla: ${item.tallaSeleccionada || item.talla}</span>
                <span class="cart-item-price" aria-label="Precio: $${(item.precio * item.cantidad).toFixed(2)}">
                    $${(item.precio * item.cantidad).toFixed(2)}
                </span>
                ${stockNotice}
                <div class="cart-item-controls">
                    <div class="qty-control" role="group" aria-label="Cantidad de ${item.nombre}">
                        <button type="button" class="qty-btn dec-btn" data-id="${item.cartId || item.id}"
                            aria-label="Reducir cantidad de ${item.nombre}">−</button>
                        <input type="number" class="qty-input" value="${item.cantidad}"
                            aria-label="Cantidad de ${item.nombre}"
                            aria-readonly="true" readonly
                            min="1" step="1">
                        <button type="button" class="qty-btn inc-btn" data-id="${item.cartId || item.id}" ${incDisabled}
                            aria-label="Aumentar cantidad de ${item.nombre}">+</button>
                    </div>
                    <button type="button" class="btn-remove-item" data-id="${item.cartId || item.id}"
                        aria-label="Eliminar ${item.nombre} del carrito"
                        title="Eliminar producto">
                        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        container.appendChild(article);
    });

    // ── Actualizar totales ──
    if (totalPriceEl) totalPriceEl.textContent = `$${subtotal.toFixed(2)}`;
    evaluarEstadoBulkDelete();
    actualizarBotonCabecera(cartItems);
    actualizarTimestampUI();
}

// ====================================================================
// TIMESTAMP DE SESIÓN
// ====================================================================

/**
 * Muestra en el footer del carrito la última hora de actualización.
 * Usa sessionStorage (Estrategia 2 de persistencia).
 */
export function actualizarTimestampUI() {
    const lastUpdateEl = document.getElementById('cart-last-update');
    if (!lastUpdateEl) return;

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

// ====================================================================
// BADGE DE CABECERA
// ====================================================================

/**
 * Actualiza el badge numérico y el aria-label del botón del carrito.
 * @param {Array<Object>} cartItems - Items actuales del carrito
 */
export function actualizarBotonCabecera(cartItems) {
    const totalItems = cartItems.reduce((acc, item) => acc + (item.cantidad || 0), 0);
    const cartBtn = document.querySelector('.btn-cart');
    const cartBadge = document.querySelector('.cart-badge');

    if (cartBtn && cartBadge) {
        cartBadge.textContent = totalItems;
        cartBtn.setAttribute('aria-label', `Abrir carrito, ${totalItems} artículo${totalItems !== 1 ? 's' : ''}`);
    }
}

// ====================================================================
// ELIMINACIÓN MASIVA
// ====================================================================

/**
 * Actualiza el estado de los controles bulk del carrito.
 * - Activa/desactiva el checkbox "Seleccionar todos"
 * - Activa/desactiva el botón "Eliminar items"
 */
export function evaluarEstadoBulkDelete() {
    const itemsChecked = document.querySelectorAll('.item-checkbox:checked');
    const btnDeleteBulk = document.getElementById('btn-delete-bulk');
    const selectAllCheckbox = document.getElementById('select-all-cart');

    if (selectAllCheckbox) {
        const hasCartItems = document.querySelectorAll('.item-checkbox').length > 0;
        if (hasCartItems) {
            selectAllCheckbox.removeAttribute('disabled');
        } else {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.setAttribute('disabled', '');
        }
    }

    if (!btnDeleteBulk) return;

    if (itemsChecked.length > 0) {
        btnDeleteBulk.classList.add('active');
        btnDeleteBulk.removeAttribute('disabled');
        btnDeleteBulk.removeAttribute('aria-disabled');
    } else {
        btnDeleteBulk.classList.remove('active');
        btnDeleteBulk.setAttribute('disabled', '');
        btnDeleteBulk.setAttribute('aria-disabled', 'true');
    }
}
