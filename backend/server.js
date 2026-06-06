/**
 * SERVER.JS — Shop Sport REST API
 * =========================================================
 * Endpoints:
 *   GET  /api/products        → Returns the full product catalog
 *   POST /api/checkout        → Validates stock and processes an order
 *   GET  /api/products/:id    → Returns a single product by ID
 */

const express = require('express');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'data', 'productos.json');

// ── Middleware ────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Helpers ───────────────────────────────────────────────

/**
 * Reads and parses the products database from disk.
 * @returns {Array<Object>}
 */
function readProducts() {
    // Strip UTF-8 BOM (0xEF,0xBB,0xBF) that Windows tools sometimes prepend
    const raw = fs.readFileSync(DB_PATH, 'utf8').replace(/^\uFEFF/, '');
    return JSON.parse(raw);
}

/**
 * Writes an updated products array back to disk atomically.
 * @param {Array<Object>} products
 */
function writeProducts(products) {
    fs.writeFileSync(DB_PATH, JSON.stringify(products, null, 4), 'utf8');
}

// ── Routes ────────────────────────────────────────────────

/**
 * GET /api/products
 * Returns the full product catalog with current stock levels.
 */
app.get('/api/products', (req, res) => {
    try {
        const products = readProducts();
        res.json({ success: true, data: products });
    } catch (error) {
        console.error('Error reading products:', error);
        res.status(500).json({ success: false, message: 'Error al cargar los productos.' });
    }
});

/**
 * GET /api/products/:id
 * Returns a single product by its numeric ID.
 */
app.get('/api/products/:id', (req, res) => {
    try {
        const id       = parseInt(req.params.id, 10);
        const products = readProducts();
        const product  = products.find(p => p.id === id);

        if (!product) {
            return res.status(404).json({ success: false, message: `Producto con ID ${id} no encontrado.` });
        }

        res.json({ success: true, data: product });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ success: false, message: 'Error al obtener el producto.' });
    }
});

/**
 * POST /api/checkout
 * Body: { items: [{ id, cantidad, tallaSeleccionada }] }
 *
 * 1. Validates that each item has sufficient stock.
 * 2. Decrements stock in the JSON file.
 * 3. Returns the updated product list.
 */
app.post('/api/checkout', (req, res) => {
    const { items } = req.body;

    // ── Input validation ──
    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: 'El carrito está vacío o tiene un formato inválido.' });
    }

    try {
        const products = readProducts();

        // ── Stock validation pass ──
        const errors = [];
        for (const item of items) {
            const product = products.find(p => p.id === item.id);

            if (!product) {
                errors.push(`Producto con ID ${item.id} no encontrado.`);
                continue;
            }

            if (product.stock < item.cantidad) {
                errors.push(
                    `Stock insuficiente para "${product.nombre}": ` +
                    `solicitado ${item.cantidad}, disponible ${product.stock}.`
                );
            }
        }

        if (errors.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Algunos productos no tienen stock suficiente.',
                errors
            });
        }

        // ── Apply stock decrements ──
        for (const item of items) {
            const product = products.find(p => p.id === item.id);
            product.stock = Math.max(0, product.stock - item.cantidad);
        }

        writeProducts(products);

        res.json({
            success: true,
            message: '¡Pedido procesado con éxito! Gracias por tu compra.',
            data: products
        });

    } catch (error) {
        console.error('Error processing checkout:', error);
        res.status(500).json({ success: false, message: 'Error interno al procesar el pedido.' });
    }
});

// ── Start server ──────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`✅ Shop Sport API running on http://localhost:${PORT}`);
    console.log(`   GET  http://localhost:${PORT}/api/products`);
    console.log(`   POST http://localhost:${PORT}/api/checkout`);
});
