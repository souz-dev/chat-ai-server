import * as functions from "firebase-functions";
import { GoogleGenAI } from "@google/genai";

const gemini = new GoogleGenAI({
  apiKey: functions.config().gemini.api_key,
});

const model = "gemini-2.5-flash";

export const transcribeAudio = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated to transcribe audio"
    );
  }

  const { audioAsBase64, mimeType } = data;

  if (!audioAsBase64 || !mimeType) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "audioAsBase64 and mimeType are required"
    );
  }

  try {
    const response = await gemini.models.generateContent({
      model,
      contents: [
        {
          text: "Transcreva o áudio para português do Brasil. Seja preciso e natural na transcrição. Mantenha a pontuação adequada e divida o texto em parágrafos quando for apropriado.",
        },
        {
          inlineData: {
            mimeType,
            data: audioAsBase64,
          },
        },
      ],
    });

    if (!response.text) {
      throw new functions.https.HttpsError(
        "internal",
        "Failed to transcribe audio"
      );
    }

    return {
      transcription: response.text,
      userId: context.auth.uid,
      timestamp: Date.now(),
    };
  } catch (error) {
    throw new functions.https.HttpsError(
      "internal",
      `Transcription failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
});

export const generateEmbeddings = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated to generate embeddings"
      );
    }

    const { text } = data;

    if (!text) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "text is required"
      );
    }

    try {
      const response = await gemini.models.embedContent({
        model: "text-embedding-004",
        contents: [{ text }],
        config: {
          taskType: "RETRIEVAL_DOCUMENT",
        },
      });

      if (!response.embeddings?.[0].values) {
        throw new functions.https.HttpsError(
          "internal",
          "Failed to generate embeddings"
        );
      }

      return {
        embeddings: response.embeddings[0].values,
        userId: context.auth.uid,
        timestamp: Date.now(),
      };
    } catch (error) {
      throw new functions.https.HttpsError(
        "internal",
        `Failed to generate embeddings: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
);

export const generateAnswer = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated to generate answer"
    );
  }

  const { question, transcriptions } = data;

  if (!question || !transcriptions) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "question and transcriptions are required"
    );
  }

  try {
    const transcriptionsText = transcriptions.join("\n\n");

    const prompt = `
      Com base no texto fornecido abaixo como contexto, responda a pergunta de forma clara e precisa em português do Brasil.
    
      CONTEXTO:
      ${transcriptionsText}

      PERGUNTA:
      ${question}

      INSTRUÇÕES:
      - Use apenas informações contidas no contexto enviado;
      - Se a resposta não for encontrada no contexto, apenas responda que não possui informações suficientes para responder;
      - Seja objetivo;
      - Mantenha um tom educativo e profissional;
      - Cite trechos relevantes do contexto se apropriado;
      - Se for citar o contexto, utilize o termo "conteúdo da aula";
    `.trim();

    const response = await gemini.models.generateContent({
      model,
      contents: [
        {
          text: prompt,
        },
      ],
    });

    if (!response.text) {
      throw new functions.https.HttpsError(
        "internal",
        "Failed to generate answer"
      );
    }

    return {
      answer: response.text,
      hasContext: true,
      contextChunks: transcriptions.length,
      userId: context.auth.uid,
      timestamp: Date.now(),
    };
  } catch (error) {
    throw new functions.https.HttpsError(
      "internal",
      `Failed to generate answer: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
});

export const generateGeneralAnswer = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated to generate answer"
      );
    }

    const { question } = data;

    if (!question) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "question is required"
      );
    }

    try {
      const prompt = `
      Responda a seguinte pergunta de forma educativa e profissional em português do Brasil.
      
      PERGUNTA:
      ${question}

      INSTRUÇÕES:
      - Forneça uma resposta informativa e útil
      - Se for uma pergunta muito específica sobre um conteúdo que você não tem acesso, explique isso educadamente
      - Mantenha um tom educativo e profissional
      - Se possível, dê dicas gerais ou direcionamentos úteis sobre o tópico
      - Sugira que o usuário faça upload de conteúdo (áudio/vídeo da aula) para respostas mais específicas
    `.trim();

      const response = await gemini.models.generateContent({
        model,
        contents: [
          {
            text: prompt,
          },
        ],
      });

      if (!response.text) {
        throw new functions.https.HttpsError(
          "internal",
          "Failed to generate general answer"
        );
      }

      return {
        answer: response.text,
        hasContext: false,
        userId: context.auth.uid,
        timestamp: Date.now(),
      };
    } catch (error) {
      throw new functions.https.HttpsError(
        "internal",
        `Failed to generate general answer: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
);
