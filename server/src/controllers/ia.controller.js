const { GoogleGenerativeAI } = require("@google/generative-ai");
const ProductoModel = require("../models/producto.model");
const { GEMINI_API_KEY } = process.env;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "dummy_key");

async function chat(req, res, next) {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "BAD_REQUEST", message: "El mensaje es requerido." });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "INTERNAL_SERVER_ERROR", message: "La API Key de Gemini no está configurada en el servidor." });
    }

    // 1. Obtener todos los productos para el contexto
    const productos = await ProductoModel.findAll(0, 100);

    const inventarioTexto = productos.map(p => {
      const variante = p.variantes_producto?.[0];
      const stock = variante?.inventario_bodegas?.[0]?.inv_saldo_final || 0;
      return `- ID: ${p.id_producto}, Nombre: ${p.pro_descripcion}, Precio: $${p.pro_valor_compra}, Stock: ${stock}, Categoría: ${p.categoria ? p.categoria.cat_nombre : 'N/A'}`;
    }).join("\n");

    // 2. Construir el prompt del sistema
    const prompt = `Eres un asistente de ventas virtual para la tienda de ropa deportiva "Shop Sport".
Tu trabajo es responder las dudas de los clientes basándote ÚNICAMENTE en el siguiente catálogo de productos:

${inventarioTexto}

Instrucciones:
- Sé amable, conciso y persuasivo.
- Si te preguntan por un producto que no está en la lista, diles amablemente que por el momento no contamos con él.
- Si te preguntan el precio o recomendaciones, usa los datos del catálogo provisto.
- No inventes productos ni precios.
- Si la pregunta no está relacionada con la tienda o ropa deportiva, indica educadamente que solo puedes asistir con temas de la tienda.

Pregunta del cliente: "${message}"`;

    // 3. Llamar a Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    res.json({ reply: responseText });
  } catch (err) {
    console.error("Error en ia.controller:", err);
    next(err);
  }
}

module.exports = { chat };
