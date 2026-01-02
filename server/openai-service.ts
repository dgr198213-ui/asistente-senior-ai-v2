import { z } from "zod";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Tipos de sentimiento
export type SentimentType = "positive" | "neutral" | "negative" | "distressed";

interface SentimentAnalysis {
  sentiment: SentimentType;
  score: number; // -1 a 1
  keywords: string[];
  requiresAlert: boolean;
}

interface AIResponse {
  message: string;
  sentiment: SentimentAnalysis;
  shouldUseTTS: boolean;
}

// Sistema de prompts mejorado
const SYSTEM_PROMPT = `Eres un asistente personal empático y paciente, diseñado específicamente para acompañar a personas mayores.

Características de tus respuestas:
- Usa un lenguaje claro, simple y directo
- Evita tecnicismos y jerga
- Sé breve pero completo (máximo 150 palabras)
- Muestra empatía genuina y paciencia
- Usa ejemplos concretos cuando sea necesario
- Habla en español de forma natural y cercana
- Si detectas angustia, ofrece apoyo emocional
- Sugiere ejercicios de respiración si es necesario
- Recuerda información personal del usuario cuando sea relevante

Puedes ayudar con:
- Recordatorios de medicamentos y citas
- Información sobre salud y bienestar
- Apoyo emocional y conversación
- Contactos de emergencia
- Responder preguntas generales
- Dar consejos prácticos para el día a día
- Ejercicios de memoria y cognitivos`;

// Palabras clave para análisis de sentimiento
const SENTIMENT_KEYWORDS = {
  distressed: [
    "solo", "soledad", "triste", "deprimido", "ansiedad", "miedo", "asustado",
    "desesperado", "angustia", "dolor", "sufrimiento", "llorar", "lloro",
    "morir", "muerte", "enfermo", "mal", "peor", "nunca", "nadie",
  ],
  negative: [
    "no", "malo", "mal", "problema", "error", "fallo", "cansado", "cansancio",
    "difícil", "imposible", "no puedo", "no sé", "confundido", "perdido",
  ],
  positive: [
    "bien", "bueno", "excelente", "feliz", "alegre", "gracias", "amor",
    "quiero", "puedo", "logré", "conseguí", "éxito", "mejor", "mejoré",
  ],
};

// Función para analizar sentimiento
export function analyzeSentiment(text: string): SentimentAnalysis {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);

  let score = 0;
  let keywords: string[] = [];
  let sentiment: SentimentType = "neutral";

  // Contar palabras de cada tipo
  for (const word of words) {
    if (SENTIMENT_KEYWORDS.distressed.some((kw) => word.includes(kw))) {
      score -= 2;
      keywords.push(word);
    } else if (SENTIMENT_KEYWORDS.negative.some((kw) => word.includes(kw))) {
      score -= 1;
      keywords.push(word);
    } else if (SENTIMENT_KEYWORDS.positive.some((kw) => word.includes(kw))) {
      score += 1;
      keywords.push(word);
    }
  }

  // Normalizar score
  score = Math.max(-1, Math.min(1, score / Math.max(1, words.length)));

  // Determinar sentimiento
  if (score <= -0.5) {
    sentiment = "distressed";
  } else if (score < -0.2) {
    sentiment = "negative";
  } else if (score > 0.2) {
    sentiment = "positive";
  } else {
    sentiment = "neutral";
  }

  return {
    sentiment,
    score,
    keywords: [...new Set(keywords)].slice(0, 5),
    requiresAlert: sentiment === "distressed",
  };
}

// Función para llamar a OpenAI con análisis de sentimiento
export async function callOpenAIWithSentiment(
  messages: Array<{ role: string; content: string }>,
  userMessage: string
): Promise<AIResponse> {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  try {
    // Analizar sentimiento del mensaje del usuario
    const sentimentAnalysis = analyzeSentiment(userMessage);

    // Agregar contexto de sentimiento al prompt si es necesario
    let contextPrompt = SYSTEM_PROMPT;
    if (sentimentAnalysis.sentiment === "distressed") {
      contextPrompt += `\n\nIMPORTANTE: El usuario parece estar angustiado o deprimido. Ofrece apoyo emocional genuino, sugiere ejercicios de respiración y considera recomendar contactar a un profesional de salud mental.`;
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: contextPrompt },
          ...messages.slice(-10), // Últimos 10 mensajes para contexto
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    return {
      message: assistantMessage,
      sentiment: sentimentAnalysis,
      shouldUseTTS: true, // Siempre usar TTS para mejor accesibilidad
    };
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    throw error;
  }
}

// Función para generar voz (TTS)
export async function generateSpeech(text: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  try {
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "tts-1-hd",
        input: text,
        voice: "nova", // Voz cálida y natural
        speed: 0.9, // Ligeramente más lento para personas mayores
      }),
    });

    if (!response.ok) {
      throw new Error(`TTS API error: ${response.statusText}`);
    }

    // Convertir respuesta a blob y luego a URL
    const arrayBuffer = await response.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error generating speech:", error);
    throw error;
  }
}

// Función para detectar si se requiere alerta
export function shouldAlertEmergencyContact(sentiment: SentimentAnalysis): boolean {
  return sentiment.sentiment === "distressed" && sentiment.score < -0.7;
}

// Función para sugerir ejercicios de respiración
export function getSuggestedBreathingExercise(sentiment: SentimentAnalysis): string {
  if (sentiment.sentiment === "distressed") {
    return `Vamos a hacer un ejercicio de respiración para calmar tu mente:
1. Inhala profundamente por la nariz durante 4 segundos
2. Mantén la respiración durante 4 segundos
3. Exhala lentamente por la boca durante 6 segundos
4. Espera 2 segundos
Repite esto 5 veces. Te sentirás mejor.`;
  }
  return "";
}
