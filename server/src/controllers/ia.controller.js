const Groq = require("groq-sdk");
const ProductoModel = require("../models/producto.model");
const { GROQ_API_KEY } = process.env;

const groq = new Groq({ apiKey: GROQ_API_KEY || "dummy_key" });

async function chat(req, res, next) {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "BAD_REQUEST", message: "El mensaje es requerido." });
    }

    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: "INTERNAL_SERVER_ERROR", message: "La API Key de Groq no está configurada en el servidor." });
    }

    // 1. Obtener todos los productos para el contexto
    const productos = await ProductoModel.findAll(0, 100);

    const inventarioTexto = productos.map(p => {
      const variante = p.variantes_producto?.[0];
      const stock = variante?.inventario_bodegas?.[0]?.inv_saldo_final || 0;
      return `- ID: ${p.id_producto}, Nombre: ${p.pro_descripcion}, Precio: $${p.pro_valor_compra}, Stock: ${stock}, Categoría: ${p.categoria ? p.categoria.cat_nombre : 'N/A'}`;
    }).join("\n");

    // 2. Construir el prompt del sistema
    const systemPrompt = `Eres un asistente virtual experto en ventas para la tienda de ropa deportiva "Shop Sport".
Tu objetivo principal es ayudar a los clientes a encontrar productos, responder preguntas y convencerlos de comprar de manera amable y profesional.
Usa respuestas cortas (máximo 3-4 líneas por párrafo). Sé entusiasta.

Inventario actual de la tienda:
${inventarioTexto}

Solo puedes ofrecer productos que estén en este inventario y que tengan Stock mayor a 0.
Si el usuario pregunta por un producto que no está en el inventario o sin stock, dile amablemente que no lo tenemos disponible por ahora pero ofrécele una alternativa similar del inventario.
Si te saludan, saluda de vuelta y preséntate como el Asistente Virtual de Shop Sport.`;

    // 3. Llamar a Groq (LLaMA 3)
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "No pude generar una respuesta.";

    // 4. Devolver la respuesta
    res.json({ reply: responseText });
  } catch (error) {
    console.error("Error en ia.controller (Groq):", error);
    next(error);
  }
}

module.exports = {
  chat
};
