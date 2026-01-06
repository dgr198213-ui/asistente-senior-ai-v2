import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { transcribeAudio } from "./_core/voiceTranscription";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";
import { TRPCError } from "@trpc/server";

export const aiRouter = router({
  voiceMessage: publicProcedure
    .input(
      z.object({
        audioBase64: z.string(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // 1. Validar tamaño del base64 antes de procesar (aprox 20MB para permitir margen sobre los 16MB finales)
        // El tamaño del base64 es ~1.33 veces el tamaño binario
        if (input.audioBase64.length > 25 * 1024 * 1024) {
          throw new TRPCError({
            code: "PAYLOAD_TOO_LARGE",
            message: "El archivo de audio es demasiado grande. Por favor, graba un mensaje más corto.",
          });
        }

        // 2. Convertir base64 a Buffer
        const audioBuffer = Buffer.from(input.audioBase64, "base64");
        
        // Validar tamaño binario real (límite de 16MB para Whisper)
        const sizeMB = audioBuffer.length / (1024 * 1024);
        if (sizeMB > 16) {
          throw new TRPCError({
            code: "PAYLOAD_TOO_LARGE",
            message: `El audio pesa ${sizeMB.toFixed(2)}MB. El límite es de 16MB.`,
          });
        }
        
        // 2. Subir a almacenamiento temporal para obtener una URL (requerido por transcribeAudio)
        const fileName = `voice_${Date.now()}.${input.mimeType.split("/")[1] || "m4a"}`;
        const { url: audioUrl } = await storagePut(`temp_audio/${fileName}`, audioBuffer, input.mimeType);

        // 3. Transcribir (STT)
        const transcriptionResult = await transcribeAudio({
          audioUrl,
          language: "es",
        });

        if ("error" in transcriptionResult) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Error en transcripción: ${transcriptionResult.error}`,
          });
        }

        const transcription = transcriptionResult.text;

        // 4. Llamar a Claude (LLM)
        const llmResult = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "Eres un asistente personal para personas mayores. Responde de manera clara, amable y paciente. Usa un lenguaje sencillo pero respetuoso.",
            },
            {
              role: "user",
              content: transcription,
            },
          ],
        });

        const response = typeof llmResult.choices[0].message.content === "string" 
          ? llmResult.choices[0].message.content 
          : "Lo siento, no pude procesar una respuesta.";

        return {
          transcription,
          response,
        };
      } catch (error) {
        console.error("Error in voiceMessage:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Error desconocido en el servidor",
        });
      }
    }),
});
