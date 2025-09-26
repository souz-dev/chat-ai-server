import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod/v4";
import { db } from "../../db/connection.ts";
import { schema } from "../../db/schema/index.ts";
import { FirebaseAIClient } from "../../services/firebase-ai-client.ts";

export const uploadAudioRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/rooms/:roomId/audio",
    {
      schema: {
        params: z.object({
          roomId: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { roomId } = request.params;
      const audio = await request?.file();

      const authHeader = request.headers.authorization;
      const idToken = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : undefined;

      if (!audio) {
        return reply.status(400).send({
          error: "Audio file is required",
        });
      }

      try {
        const audioBuffer = await audio.toBuffer();
        const audioAsBase64 = audioBuffer.toString("base64");

        const transcriptionResult = await FirebaseAIClient.transcribeAudio(
          {
            audioAsBase64,
            mimeType: audio.mimetype,
          },
          idToken
        );

        const embeddingsResult = await FirebaseAIClient.generateEmbeddings(
          {
            text: transcriptionResult.transcription,
          },
          idToken
        );

        const result = await db
          .insert(schema.audioChunks)
          .values({
            roomId,
            transcription: transcriptionResult.transcription,
            embeddings: embeddingsResult.embeddings,
          })
          .returning();

        const chunk = result[0];

        if (!chunk) {
          throw new Error("Failed to save audio chunk");
        }

        return reply.status(201).send({
          chunkId: chunk.id,
          transcription: transcriptionResult.transcription,
          processedAt: transcriptionResult.timestamp,
          embeddingsDimensions: embeddingsResult.embeddings.length,
        });
      } catch (error) {
        console.error("Error processing audio:", error);

        return reply.status(500).send({
          error: "Failed to process audio",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
};
