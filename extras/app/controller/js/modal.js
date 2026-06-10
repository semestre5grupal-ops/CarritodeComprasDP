/**
 * MODAL.JS — Vista Detalle del Producto
 * =========================================================
 * Responsabilidades:
 * - Inyectar y gestionar el modal de detalles del producto.
 * - Mostrar información detallada, imagen y selector de talla.
 * - Conectar la selección con agregarAlCarrito().
 */

import { repo } from './repo.js';
import * as cart from './cart.js';

document.addEventListener('DOMContentLoaded', () => {
    const modalHTML = `
        <div id="product-detail-overlay" class="product-detail-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-p-title">
            <div class="product-detail-modal" id="product-detail-modal">
                <button class="modal-close-btn" id="modal-close-btn" aria-label="Cerrar detalle de producto">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                
                <div class="detail-visual">
                    <img id="modal-p-img" src="" alt="">
                </div>
                
                <div class="detail-content">
                    <span class="detail-tagline" id="modal-p-category">Categoría</span>
                    <h2 class="detail-title" id="modal-p-title">Nombre del Producto</h2>
                    <p class="detail-price" id="modal-p-price">$0.00</p>
                    
                    <p class="detail-description" id="modal-p-desc">
                        Cargando descripción...
                    </p>
                    
                    <div class="product-size-row" style="margin-top: 1rem; margin-bottom: 1.5rem;">
                        <label for="modal-size-select" class="size-label">Talla:</label>
                        <select id="modal-size-select" class="size-select" aria-label="Seleccionar talla"></select>
                    </div>
                    
                    <div class="detail-actions">
                        <button class="btn btn-primary" id="modal-p-add-btn">Añadir al Carrito</button>
                    </div>
                </div>
            </div>
        </div>
        <style>
            .product-detail-overlay {
                position: fixed;
                top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(21, 33, 42, 0.3);
                backdrop-filter: blur(8px);
                display: flex; align-items: center; justify-content: center;
                opacity: 0; pointer-events: none;
                transition: opacity 0.3s ease;
                z-index: 2000;
            }
            .product-detail-overlay.show {
                opacity: 1; pointer-events: auto;
            }
            .product-detail-modal {
                background: rgba(255, 255, 255, 0.95);
                width: 90%; max-width: 800px;
                border-radius: 1.3rem;
                display: grid; grid-template-columns: 1fr 1fr;
                overflow: hidden; position: relative;
                transform: translateY(20px);
                transition: transform 0.3s ease;
                max-height: 90vh;
            }
            .product-detail-overlay.show .product-detail-modal {
                transform: translateY(0);
            }
            @media (max-width: 768px) {
                .product-detail-modal { grid-template-columns: 1fr; overflow-y: auto; }
            }
            .modal-close-btn {
                position: absolute; top: 1rem; right: 1rem;
                background: var(--surface-soft); border: none;
                border-radius: 50%; width: 40px; height: 40px;
                display: flex; align-items: center; justify-content: center;
                cursor: pointer; z-index: 10;
                color: var(--text);
                transition: transform 0.2s ease, background 0.2s ease;
            }
            .modal-close-btn:hover {
                transform: scale(1.1);
                background: var(--border-color);
            }
            .detail-visual {
                background: var(--surface-soft);
                display: flex; align-items: center; justify-content: center;
                padding: 2rem;
            }
            .detail-visual img {
                max-width: 100%; max-height: 400px;
                object-fit: contain;
            }
            .detail-content {
                padding: 2.5rem 2rem;
                display: flex; flex-direction: column;
            }
            .detail-tagline {
                font-size: 0.85rem; text-transform: uppercase;
                letter-spacing: 1px; color: var(--primary);
                font-weight: 700; margin-bottom: 0.5rem;
            }
            .detail-title {
                font-size: 1.8rem; margin: 0 0 1rem 0;
                color: var(--text);
            }
            .detail-price {
                font-size: 1.5rem; font-weight: 700;
                color: var(--text); margin-bottom: 1.5rem;
            }
            .detail-description {
                color: var(--text-light); line-height: 1.6;
                margin-bottom: 2rem;
            }
            .detail-actions {
                margin-top: auto;
            }
            .detail-actions .btn {
                width: 100%;
                padding: 1rem;
                font-size: 1.1rem;
                font-weight: 600;
            }
            .detail-actions .btn:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-md);
            }
        </style>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const overlay = document.getElementById('product-detail-overlay');
    const closeBtn = document.getElementById('modal-close-btn');
    const addBtn = document.getElementById('modal-p-add-btn');
    const sizeSelect = document.getElementById('modal-size-select');
    let currentProductId = null;

    function buildSizeOptions(tallaRango) {
        const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
        const parts = tallaRango.split(' - ');
        const startSize = parts[0].trim().toUpperCase();
        const endSize = parts[1] ? parts[1].trim().toUpperCase() : startSize;
        const startIndex = sizeOrder.indexOf(startSize);
        const endIndex = sizeOrder.indexOf(endSize);
        
        if (startIndex === -1) {
            return `<option value="${tallaRango}">${tallaRango}</option>`;
        }
        
        const available = sizeOrder.slice(
            startIndex,
            endIndex !== -1 ? endIndex + 1 : startIndex + 1
        );
        return available.map(s => `<option value="${s}">${s}</option>`).join('');
    }

    window.abrirModalProducto = (id) => {
        const productInfo = repo.getProductoById(id) || repo.productosDisponibles.find(item => item.id === id);
        if (!productInfo) return;

        currentProductId = id;

        document.getElementById('modal-p-img').src = productInfo.imagen ? repo.getProductoImagePath(productInfo.imagen) : '';
        document.getElementById('modal-p-img').alt = productInfo.nombre;
        document.getElementById('modal-p-category').textContent = productInfo.categoria;
        document.getElementById('modal-p-title').textContent = productInfo.nombre;
        document.getElementById('modal-p-price').textContent = '$' + productInfo.precio.toFixed(2);
        document.getElementById('modal-p-desc').textContent = productInfo.descripcion;
        
        sizeSelect.innerHTML = buildSizeOptions(productInfo.talla);

        // Validar stock global
        const cartItems = cart.getCartItems();
        const cartItemQuantity = cartItems.filter(item => item.id === id).reduce((acc, item) => acc + (item.cantidad || 0), 0);
        const stockDisponible = Math.max(0, productInfo.stock - cartItemQuantity);
        
        if (stockDisponible <= 0) {
            addBtn.disabled = true;
            addBtn.textContent = 'Agotado';
            sizeSelect.disabled = true;
        } else {
            addBtn.disabled = false;
            addBtn.textContent = 'Añadir al Carrito';
            sizeSelect.disabled = false;
        }

        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
        closeBtn.focus();
    };

    function closeModal() {
        overlay.classList.remove('show');
        document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('show')) closeModal();
    });

    addBtn.addEventListener('click', () => {
        if (currentProductId && window.agregarAlCarrito) {
            const size = sizeSelect.value;
            window.agregarAlCarrito(currentProductId, size);
            closeModal();
            
            // Reenfocar donde estábamos o abrir el carrito?
            const btnCart = document.querySelector('.btn-cart');
            if (btnCart) btnCart.focus();
        }
    });
});
