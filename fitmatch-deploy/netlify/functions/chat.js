// Esta función corre en el servidor de Netlify, nunca en el celular de tus amigos.
// Por eso es el único lugar seguro donde vive tu ANTHROPIC_API_KEY: nadie que
// use la app puede verla, aunque abran las herramientas de desarrollador.

const SYSTEM_PROMPT =
  "Eres un acompañante emocional dentro de una app de bienestar para personas activas " +
  "(gente que entrena en el gym o corre). Responde en español de México, de forma cálida, " +
  "humana, natural y fluida, como lo haría un amigo emocionalmente inteligente que sabe " +
  "escuchar. Valida lo que la persona siente antes de opinar. Haz preguntas reflexivas " +
  "cuando ayude a que la persona profundice. No repitas frases genéricas tipo 'estoy aquí " +
  "para ayudarte' en cada respuesta. No diagnostiques condiciones médicas ni psicológicas. " +
  "Mantén las respuestas breves y conversacionales (2 a 5 líneas), nunca como un ensayo. " +
  "Si detectas señales de crisis, ideas de autolesión o riesgo para la persona, tómalo en " +
  "serio, responde con calma y cariño, y sugiere buscar ayuda profesional de inmediato, " +
  "mencionando la Línea de la Vida en México (800 911 2000, disponible las 24 horas).";

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Método no permitido" }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Falta configurar ANTHROPIC_API_KEY en las variables de entorno de Netlify."
      })
    };
  }

  let messages;
  try {
    const body = JSON.parse(event.body || "{}");
    messages = Array.isArray(body.messages) ? body.messages : [];
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: "JSON inválido" }) };
  }

  if (messages.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: "No se recibieron mensajes" }) };
  }

  // Límite de seguridad simple para evitar conversaciones enormes accidentales
  // (protege tu crédito de la API ante un uso descontrolado del navegador).
  let trimmedMessages = messages.slice(-30);
  // Si el recorte corta a la mitad de un par user/assistant, la API exige que
  // el primer turno sea "user"; si no lo es, se descarta ese primer mensaje suelto.
  if (trimmedMessages.length > 0 && trimmedMessages[0].role !== "user") {
    trimmedMessages = trimmedMessages.slice(1);
  }

  try {
    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 800,
        system: SYSTEM_PROMPT,
        messages: trimmedMessages
      })
    });

    const data = await anthropicResponse.json();

    if (!anthropicResponse.ok) {
      return {
        statusCode: anthropicResponse.status,
        body: JSON.stringify({ error: data.error || "Error al llamar a la API de Anthropic" })
      };
    }

    const textBlock = (data.content || []).find(function (b) { return b.type === "text"; });

    return {
      statusCode: 200,
      body: JSON.stringify({ reply: textBlock ? textBlock.text : "No pude generar una respuesta." })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};
