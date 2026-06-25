const Groq = require("groq-sdk");
const ProductoModel = require("../models/producto.model");
const { GROQ_API_KEY } = process.env;

const groq = new Groq({ apiKey: GROQ_API_KEY || "dummy_key" });

async function chat(req, res, next) {
  try {
    const { message, history } = req.body;

    if (!message && (!history || history.length === 0)) {
      return res.status(400).json({ error: "BAD_REQUEST", message: "El mensaje o historial es requerido." });
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
    const systemPrompt = `Eres el asistente virtual de la tienda "Shop Sport".
Tu único objetivo es ayudar a los clientes a encontrar ropa deportiva en el inventario y resolver sus dudas sobre los productos disponibles.
Usa respuestas claras y amables.

Inventario actual:
${inventarioTexto}

REGLAS ESTRICTAS:
1. NO puedes realizar compras, no puedes procesar pagos, ni procesar carritos de compra. Si el usuario te pide comprar, dile amablemente que debe añadir los productos al carrito y usar el botón de pago en la página web.
2. Solo puedes ofrecer productos del inventario con Stock > 0.
3. Si el usuario pregunta cosas que no tienen que ver con ropa deportiva o la tienda, dile educadamente que tu función es solo asistir en la tienda.
4. NO repitas "Hola" ni te presentes constantemente (recuerda la conversación).
5. Responde con naturalidad basándote en el hilo de la conversación.`;

    // 3. Preparar el array de mensajes con el historial
    let finalMessages = [{ role: "system", content: systemPrompt }];
    
    if (history && history.length > 0) {
      finalMessages = finalMessages.concat(history);
    } else if (message) {
      finalMessages.push({ role: "user", content: message });
    }

    // 4. Llamar a Groq (LLaMA 3)
    const chatCompletion = await groq.chat.completions.create({
      messages: finalMessages,
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
