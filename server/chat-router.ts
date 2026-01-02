import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";

// Configuración de OpenAI (opcional, usa variables de entorno si están disponibles)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const USE_MOCK_RESPONSES = !OPENAI_API_KEY;

// Sistema de prompts para el asistente
const SYSTEM_PROMPT = `Eres un asistente personal amable y paciente, diseñado específicamente para ayudar a personas mayores.

Características de tus respuestas:
- Usa un lenguaje claro, simple y directo
- Evita tecnicismos y jerga
- Sé breve pero completo
- Muestra empatía y paciencia
- Usa ejemplos concretos cuando sea necesario
- Habla en español de forma natural y cercana

Puedes ayudar con:
- Recordatorios de medicamentos y citas
- Información sobre salud y bienestar
- Contactos de emergencia
- Responder preguntas generales
- Dar consejos prácticos para el día a día`;

// Función para llamar a OpenAI (si está configurado)
async function callOpenAI(messages: Array<{ role: string; content: string }>) {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    throw error;
  }
}

// Respuestas mock para cuando no hay API key configurada
function getMockResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();

  // Respuestas contextuales basadas en palabras clave
  if (lowerMessage.includes("hola") || lowerMessage.includes("buenos días") || lowerMessage.includes("buenas tardes")) {
    return "¡Hola! ¿Cómo estás hoy? Estoy aquí para ayudarte con lo que necesites.";
  }

  if (lowerMessage.includes("recordatorio") || lowerMessage.includes("recordar")) {
    return "Puedo ayudarte con recordatorios. Ve a la sección de Recordatorios para crear uno nuevo. ¿Necesitas que te recuerde tomar algún medicamento o asistir a una cita?";
  }

  if (lowerMessage.includes("salud") || lowerMessage.includes("presión") || lowerMessage.includes("glucosa")) {
    return "Para registrar tus mediciones de salud, ve a la sección de Salud. Allí puedes guardar tu presión arterial, glucosa, peso y más. ¿Te gustaría que te explique cómo hacerlo?";
  }

  if (lowerMessage.includes("emergencia") || lowerMessage.includes("ayuda") || lowerMessage.includes("contacto")) {
    return "Si necesitas ayuda urgente, puedes usar el botón rojo de emergencia en la pantalla principal. También puedes agregar contactos de emergencia en la sección Más. ¿Quieres que te ayude a configurar tus contactos?";
  }

  if (lowerMessage.includes("medicamento") || lowerMessage.includes("medicina") || lowerMessage.includes("pastilla")) {
    return "Es importante tomar los medicamentos a tiempo. Puedo ayudarte a crear recordatorios para cada medicamento. ¿A qué hora necesitas tomar tus medicinas?";
  }

  if (lowerMessage.includes("cita") || lowerMessage.includes("doctor") || lowerMessage.includes("médico")) {
    return "Puedo ayudarte a recordar tus citas médicas. Ve a Recordatorios y crea uno nuevo de tipo 'Cita'. ¿Cuándo es tu próxima cita con el doctor?";
  }

  if (lowerMessage.includes("gracias")) {
    return "¡De nada! Estoy aquí para ayudarte siempre que lo necesites. ¿Hay algo más en lo que pueda asistirte?";
  }

  if (lowerMessage.includes("adiós") || lowerMessage.includes("chao") || lowerMessage.includes("hasta luego")) {
    return "¡Hasta luego! Que tengas un excelente día. Recuerda que siempre estaré aquí cuando me necesites.";
  }

  // Respuesta genérica
  return "Entiendo tu pregunta. Estoy aquí para ayudarte con recordatorios, salud, contactos de emergencia y más. ¿Podrías decirme específicamente en qué necesitas ayuda?";
}

export const chatRouter = router({
  // Endpoint para enviar mensajes al asistente
  sendMessage: publicProcedure
    .input(
      z.object({
        message: z.string().min(1).max(1000),
        conversationHistory: z
          .array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string(),
            })
          )
          .optional()
          .default([]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        let response: string;

        if (USE_MOCK_RESPONSES) {
          // Usar respuestas mock si no hay API key
          response = getMockResponse(input.message);
        } else {
          // Usar OpenAI si está configurado
          const messages = [
            ...input.conversationHistory.slice(-10), // Últimos 10 mensajes para contexto
            { role: "user" as const, content: input.message },
          ];
          response = await callOpenAI(messages);
        }

        return {
          success: true,
          message: response,
          usedMockResponse: USE_MOCK_RESPONSES,
        };
      } catch (error) {
        console.error("Error processing message:", error);

        // Fallback a respuesta mock en caso de error
        return {
          success: true,
          message: getMockResponse(input.message),
          usedMockResponse: true,
          error: "API error, using fallback response",
        };
      }
    }),

  // Endpoint para obtener configuración del asistente
  getConfig: publicProcedure.query(() => {
    return {
      systemPrompt: SYSTEM_PROMPT,
      useMockResponses: USE_MOCK_RESPONSES,
      features: {
        voiceRecording: true,
        textInput: true,
        conversationHistory: true,
      },
    };
  }),
});

export type ChatRouter = typeof chatRouter;
