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
        model: "gpt-3.5-turbo",
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

// Base de respuestas contextuales expandida
const RESPONSE_DATABASE = {
  // Saludos y despedidas
  saludos: [
    "¡Hola! ¿Cómo estás hoy? Estoy aquí para ayudarte con lo que necesites.",
    "¡Buenos días! Espero que tengas un excelente día. ¿En qué puedo ayudarte?",
    "¡Buenas tardes! ¿Cómo te sientes? Cuéntame si necesitas algo.",
    "¡Buenas noches! Que descanses bien. ¿Hay algo en lo que pueda asistirte?",
    "¡Hola de nuevo! Me alegra verte. ¿Qué necesitas hoy?",
  ],
  despedidas: [
    "¡Hasta luego! Que tengas un excelente día. Recuerda que siempre estaré aquí cuando me necesites.",
    "¡Adiós! Cuídate mucho y no olvides tomar tus medicamentos.",
    "¡Chao! Que descanses bien. Nos vemos pronto.",
    "¡Hasta pronto! Que tengas un día maravilloso.",
    "¡Nos vemos! Recuerda que estoy aquí para ti.",
  ],

  // Recordatorios
  recordatorios: [
    "Puedo ayudarte con recordatorios. Ve a la sección de Recordatorios para crear uno nuevo. ¿Necesitas que te recuerde tomar algún medicamento o asistir a una cita?",
    "Los recordatorios son muy útiles para no olvidar cosas importantes. ¿Quieres crear un recordatorio ahora?",
    "Puedo recordarte tomar tus medicamentos, asistir a citas o cualquier otra cosa importante. ¿Qué necesitas recordar?",
    "En la sección de Recordatorios puedes crear tantos como necesites. ¿Hay algo que no quieras olvidar?",
    "Los recordatorios te ayudarán a mantener una rutina saludable. ¿Qué necesitas recordar?",
  ],

  // Medicamentos
  medicamentos: [
    "Es muy importante tomar los medicamentos a tiempo. Puedo ayudarte a crear recordatorios para cada medicamento. ¿A qué hora necesitas tomar tus medicinas?",
    "Los medicamentos son esenciales para tu salud. Te recomiendo crear recordatorios para no olvidarlos. ¿Cuáles son tus medicamentos?",
    "Tomar los medicamentos correctamente es fundamental. ¿Necesitas ayuda para organizarlos?",
    "Puedo recordarte cuándo tomar cada medicamento. ¿A qué hora sueles tomarlos?",
    "Nunca olvides tomar tus medicamentos. Créate recordatorios para cada uno.",
  ],

  // Salud
  salud: [
    "Para registrar tus mediciones de salud, ve a la sección de Salud. Allí puedes guardar tu presión arterial, glucosa, peso y más. ¿Te gustaría que te explique cómo hacerlo?",
    "Es importante monitorear tu salud regularmente. En la sección de Salud puedes registrar tus mediciones.",
    "Mantener un registro de tu salud es muy importante. ¿Quieres registrar una medición ahora?",
    "La salud es lo más importante. Registra tus mediciones regularmente para estar al tanto.",
    "En la sección de Salud puedes ver tu historial de mediciones. ¿Necesitas registrar algo?",
  ],

  // Presión arterial
  presion: [
    "La presión arterial es un indicador importante de tu salud. Te recomiendo medirla regularmente. ¿Cuál es tu presión actual?",
    "Mantener la presión bajo control es esencial. ¿Necesitas registrar una medición?",
    "Valores normales de presión son alrededor de 120/80. Si tienes valores diferentes, consulta con tu médico.",
    "La presión arterial puede variar durante el día. Es bueno medirla a la misma hora.",
    "¿Necesitas ayuda para registrar tu presión arterial?",
  ],

  // Glucosa
  glucosa: [
    "Mantener los niveles de glucosa controlados es muy importante, especialmente si tienes diabetes. ¿Cuál es tu nivel de glucosa?",
    "La glucosa normal en ayunas está entre 70 y 100 mg/dL. ¿Necesitas registrar tu medición?",
    "Controlar la glucosa regularmente es fundamental para tu bienestar. ¿Quieres registrar un valor?",
    "Valores de glucosa altos o bajos pueden afectar tu salud. Mantén un registro.",
    "¿Necesitas ayuda para registrar tu nivel de glucosa?",
  ],

  // Peso
  peso: [
    "Mantener un peso saludable es importante para tu bienestar. ¿Cuál es tu peso actual?",
    "Registrar tu peso regularmente te ayuda a monitorear tu salud. ¿Quieres registrarlo?",
    "El peso puede variar durante el día. Es mejor pesarse a la misma hora.",
    "Un peso saludable depende de tu altura y edad. Consulta con tu médico.",
    "¿Necesitas registrar tu peso?",
  ],

  // Frecuencia cardíaca
  corazon: [
    "La frecuencia cardíaca normal en reposo es entre 60 y 100 latidos por minuto. ¿Cuál es la tuya?",
    "Monitorear tu frecuencia cardíaca es importante para tu salud cardiovascular. ¿Quieres registrarla?",
    "Una frecuencia cardíaca elevada o muy baja puede ser preocupante. Consulta con tu médico.",
    "¿Necesitas ayuda para registrar tu frecuencia cardíaca?",
    "Mantener un registro de tu corazón es muy importante.",
  ],

  // Emergencia
  emergencia: [
    "Si necesitas ayuda urgente, puedes usar el botón rojo de emergencia en la pantalla principal. También puedes agregar contactos de emergencia en la sección Más. ¿Quieres que te ayude a configurar tus contactos?",
    "En caso de emergencia, no dudes en usar el botón de emergencia. También es bueno tener contactos configurados.",
    "Tu seguridad es lo más importante. Asegúrate de tener contactos de emergencia guardados.",
    "¿Necesitas agregar contactos de emergencia?",
    "Siempre ten a mano los números de emergencia. ¿Quieres configurarlos?",
  ],

  // Contactos
  contactos: [
    "Puedo ayudarte a gestionar tus contactos de emergencia. Ve a la sección Más para agregarlos. ¿Quieres agregar un contacto ahora?",
    "Es importante tener contactos de emergencia guardados. ¿Necesitas agregar o editar alguno?",
    "Tus contactos de emergencia son muy importantes. Asegúrate de que estén actualizados.",
    "¿Quieres llamar a alguno de tus contactos?",
    "Puedo ayudarte a llamar a tus contactos de emergencia.",
  ],

  // Citas médicas
  citas: [
    "Puedo ayudarte a recordar tus citas médicas. Ve a Recordatorios y crea uno nuevo de tipo 'Cita'. ¿Cuándo es tu próxima cita con el doctor?",
    "Es importante no olvidar las citas médicas. ¿Quieres crear un recordatorio?",
    "Las citas regulares con el médico son esenciales para tu salud. ¿Tienes alguna próxima?",
    "¿Necesitas recordar una cita médica?",
    "Crear recordatorios para citas médicas es una buena idea.",
  ],

  // Ejercicio
  ejercicio: [
    "El ejercicio regular es muy importante para la salud. Incluso caminar 30 minutos al día es beneficioso. ¿Haces ejercicio regularmente?",
    "Mantenerse activo ayuda a mejorar la salud cardiovascular y mental. ¿Qué tipo de ejercicio prefieres?",
    "No necesitas hacer ejercicio intenso. Caminar, nadar o hacer yoga son excelentes opciones.",
    "¿Te gustaría crear un recordatorio para hacer ejercicio?",
    "La actividad física es fundamental para una vida saludable.",
  ],

  // Nutrición
  nutricion: [
    "Una buena alimentación es fundamental para tu salud. Come muchas frutas, verduras y proteínas. ¿Cuál es tu dieta actual?",
    "Evita alimentos muy salados, grasosos o azucarados. Prefiere alimentos frescos y naturales.",
    "Beber suficiente agua es muy importante. Intenta beber al menos 8 vasos al día.",
    "Una dieta equilibrada te ayudará a sentirte mejor. ¿Necesitas consejos?",
    "La nutrición es clave para tu bienestar.",
  ],

  // Sueño
  sueno: [
    "Dormir bien es esencial para tu salud. Intenta dormir 7-8 horas cada noche. ¿Cómo es tu sueño?",
    "Una buena rutina de sueño es importante. Intenta acostarte a la misma hora cada día.",
    "Si tienes problemas para dormir, consulta con tu médico. Hay muchas opciones para ayudarte.",
    "¿Necesitas un recordatorio para ir a dormir?",
    "El descanso es fundamental para tu bienestar.",
  ],

  // Estrés
  estres: [
    "El estrés puede afectar tu salud. Intenta relajarte con meditación, música o actividades que disfrutes.",
    "Respirar profundamente puede ayudarte a reducir el estrés. Intenta hacerlo varias veces al día.",
    "Es importante tomarte tiempo para ti. ¿Qué actividades te relajan?",
    "Si te sientes estresado, habla con alguien de confianza o consulta a un profesional.",
    "Tu bienestar mental es tan importante como el físico.",
  ],

  // Seguridad en el hogar
  seguridad: [
    "La seguridad en el hogar es muy importante. Asegúrate de tener buena iluminación y evitar objetos que puedan causar caídas.",
    "Mantén tu hogar limpio y organizado para evitar accidentes. ¿Necesitas consejos?",
    "Tener números de emergencia a mano es fundamental. ¿Los tienes?",
    "Considera instalar barras de apoyo en el baño para mayor seguridad.",
    "Tu seguridad es lo más importante.",
  ],

  // Información general
  general: [
    "Estoy aquí para ayudarte con recordatorios, salud, contactos de emergencia y mucho más. ¿Qué necesitas?",
    "Puedo asistirte con cualquier pregunta sobre tu salud y bienestar. ¿En qué puedo ayudarte?",
    "Soy tu asistente personal. Cuéntame qué necesitas.",
    "¿Hay algo específico en lo que pueda ayudarte?",
    "Estoy aquí para ti. ¿Qué necesitas?",
  ],

  // Agradecimiento
  agradecimiento: [
    "¡De nada! Estoy aquí para ayudarte siempre que lo necesites. ¿Hay algo más en lo que pueda asistirte?",
    "Me alegra poder ayudarte. ¿Necesitas algo más?",
    "¡Para eso estoy! Siempre estoy disponible para ti.",
    "¡Claro! Es un placer ayudarte.",
    "¡De nada! ¿Hay algo más que necesites?",
  ],

  // Ayuda con la app
  app_help: [
    "¿Necesitas ayuda con la aplicación? Puedo explicarte cómo usar cada sección. ¿Cuál necesitas?",
    "La aplicación tiene varias secciones: Inicio, Asistente, Recordatorios, Salud y Más. ¿Cuál quieres explorar?",
    "Estoy aquí para ayudarte a usar la aplicación. ¿Qué no entiendes?",
    "¿Necesitas que te explique cómo crear un recordatorio o registrar una medición?",
    "Puedo guiarte a través de cualquier función de la aplicación.",
  ],

  // Clima
  clima: [
    "El clima es importante para planificar tu día. ¿Necesitas saber cómo está el clima?",
    "Recuerda usar protección solar si va a estar soleado. ¿Necesitas información del clima?",
    "Si llueve, asegúrate de llevar un paraguas si sales.",
    "¿Quieres saber cómo está el clima hoy?",
    "El clima puede afectar tu salud. Prepárate adecuadamente.",
  ],

  // Cumplidos y ánimo
  animo: [
    "¡Eres muy valiente por cuidar tu salud! Sigue adelante.",
    "¡Excelente trabajo! Estás haciendo un gran trabajo cuidándote.",
    "¡Estoy orgulloso de ti! Sigue así.",
    "¡Tú puedes! Siempre estaré aquí para apoyarte.",
    "¡Eres increíble! Sigue adelante.",
  ],

  // Preguntas sobre la edad
  edad: [
    "La edad es solo un número. Lo importante es que te cuides y disfrutes de la vida.",
    "No importa tu edad, siempre es importante cuidar tu salud.",
    "Cada edad tiene sus desafíos, pero también sus ventajas. ¿Cómo te sientes?",
    "¿Hay algo específico relacionado con tu edad que te preocupe?",
    "La experiencia es una ventaja. ¡Úsala a tu favor!",
  ],
};

// Función mejorada para obtener respuesta contextual
function getMockResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase().trim();

  // Palabras clave y sus categorías
  const keywords = {
    saludos: ["hola", "buenos días", "buenas tardes", "buenas noches", "hey", "ey", "qué tal"],
    despedidas: ["adiós", "chao", "hasta luego", "nos vemos", "bye", "adios"],
    recordatorios: ["recordatorio", "recordar", "recordarme", "recuerdo", "no olvides"],
    medicamentos: ["medicamento", "medicina", "pastilla", "píldora", "droga", "fármaco"],
    salud: ["salud", "presión", "glucosa", "peso", "corazón", "medición", "medida"],
    presion: ["presión", "presión arterial", "tensión"],
    glucosa: ["glucosa", "azúcar", "diabetes", "diabético"],
    peso: ["peso", "kilos", "kg", "gordo", "delgado"],
    corazon: ["corazón", "cardíaco", "latidos", "frecuencia cardíaca"],
    emergencia: ["emergencia", "ayuda", "urgente", "911", "auxilio", "peligro"],
    contactos: ["contacto", "contactos", "llamar", "teléfono", "número"],
    citas: ["cita", "doctor", "médico", "hospital", "clínica", "cita médica"],
    ejercicio: ["ejercicio", "caminar", "deporte", "actividad", "movimiento", "gimnasia"],
    nutricion: ["comida", "comer", "dieta", "alimento", "fruta", "verdura", "nutrición"],
    sueno: ["dormir", "sueño", "cama", "descanso", "noche"],
    estres: ["estrés", "ansiedad", "preocupación", "nervios", "tensión"],
    seguridad: ["seguridad", "caída", "accidente", "peligro", "hogar"],
    clima: ["clima", "tiempo", "lluvia", "sol", "temperatura", "frío", "calor"],
    app_help: ["cómo", "cómo usar", "ayuda", "no entiendo", "no sé", "explicar"],
    agradecimiento: ["gracias", "muchas gracias", "thank you", "grazie", "merci"],
    edad: ["edad", "viejo", "joven", "años"],
    animo: ["triste", "feliz", "bien", "mal", "cansado", "deprimido"],
  };

  // Buscar coincidencias de palabras clave
  for (const [category, words] of Object.entries(keywords)) {
    for (const word of words) {
      if (lowerMessage.includes(word)) {
        const responses = RESPONSE_DATABASE[category as keyof typeof RESPONSE_DATABASE];
        if (responses && Array.isArray(responses)) {
          // Seleccionar una respuesta aleatoria de la categoría
          return responses[Math.floor(Math.random() * responses.length)];
        }
      }
    }
  }

  // Si no hay coincidencia, usar respuesta general aleatoria
  const generalResponses = RESPONSE_DATABASE.general;
  return generalResponses[Math.floor(Math.random() * generalResponses.length)];
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
      responseCategories: Object.keys(RESPONSE_DATABASE).length,
      totalResponses: Object.values(RESPONSE_DATABASE).reduce(
        (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
        0
      ),
    };
  }),
});

export type ChatRouter = typeof chatRouter;
