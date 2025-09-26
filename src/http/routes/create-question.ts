import { and, eq, sql } from "drizzle-orm";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod/v4";
import { db } from "../../db/connection.ts";
import { schema } from "../../db/schema/index.ts";
import { FirebaseAIClient } from "../../services/firebase-ai-client.ts";

export const createQuestionRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/rooms/:roomId/questions",
    {
      schema: {
        params: z.object({
          roomId: z.string(),
        }),
        body: z.object({
          question: z.string().min(1),
        }),
      },
    },
    async (request, reply) => {
      const { roomId } = request.params;
      const { question } = request.body;

      const authHeader = request.headers.authorization;
      const idToken = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : undefined;

      try {
        const embeddingsResult = await FirebaseAIClient.generateEmbeddings(
          {
            text: question,
          },
          idToken
        );

        const embeddingsAsString = `[${embeddingsResult.embeddings.join(",")}]`;

        const chunks = await db
          .select({
            id: schema.audioChunks.id,
            transcription: schema.audioChunks.transcription,
            similarity: sql<number>`1 - (${schema.audioChunks.embeddings} <=> ${embeddingsAsString}::vector)`,
          })
          .from(schema.audioChunks)
          .where(
            and(
              eq(schema.audioChunks.roomId, roomId),
              sql`1 - (${schema.audioChunks.embeddings} <=> ${embeddingsAsString}::vector) > 0.7`
            )
          )
          .orderBy(
            sql`${schema.audioChunks.embeddings} <=> ${embeddingsAsString}::vector`
          )
          .limit(3);

        let answer: string | null = null;
        let hasContext = false;

        if (chunks.length > 0) {
          const transcriptions = chunks.map((chunk) => chunk.transcription);
          const answerResult = await FirebaseAIClient.generateAnswer(
            {
              question,
              transcriptions,
            },
            idToken
          );

          answer = answerResult.answer;
          hasContext = true;
        } else {
          const generalAnswerResult =
            await FirebaseAIClient.generateGeneralAnswer(
              {
                question,
              },
              idToken
            );

          answer = generalAnswerResult.answer;
          hasContext = false;
        }

        const result = await db
          .insert(schema.questions)
          .values({ roomId, question, answer })
          .returning();

        const insertedQuestion = result[0];

        if (!insertedQuestion) {
          throw new Error("Failed to create question");
        }

        return reply.status(201).send({
          questionId: insertedQuestion.id,
          answer,
          hasContext,
          contextInfo: hasContext
            ? `Based on ${chunks.length} audio chunk(s) from the class`
            : "General answer - upload class content for more specific responses",
        });
      } catch (error) {
        console.error("Error processing question:", error);

        return reply.status(500).send({
          error: "Failed to process question",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
};
