"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateGeneralAnswer = exports.generateAnswer = exports.generateEmbeddings = exports.transcribeAudio = void 0;
const functions = require("firebase-functions");
const genai_1 = require("@google/genai");
const gemini = new genai_1.GoogleGenAI({
    apiKey: functions.config().gemini.api_key,
});
const model = "gemini-2.5-flash";
exports.transcribeAudio = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Usuário deve estar autenticado para transcrever áudio");
    }
    const { audioAsBase64, mimeType } = data;
    if (!audioAsBase64 || !mimeType) {
        throw new functions.https.HttpsError("invalid-argument", "audioAsBase64 e mimeType são obrigatórios");
    }
    try {
        console.log("🎵 Iniciando transcrição de áudio...");
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
            throw new functions.https.HttpsError("internal", "Não foi possível converter o áudio");
        }
        console.log("✅ Transcrição concluída com sucesso");
        return {
            transcription: response.text,
            userId: context.auth.uid,
            timestamp: Date.now(),
        };
    }
    catch (error) {
        console.error("❌ Erro na transcrição:", error);
        throw new functions.https.HttpsError("internal", `Erro na transcrição: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    }
});
exports.generateEmbeddings = functions.https.onCall(async (data, context) => {
    var _a;
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Usuário deve estar autenticado para gerar embeddings");
    }
    const { text } = data;
    if (!text) {
        throw new functions.https.HttpsError("invalid-argument", "text é obrigatório");
    }
    try {
        console.log("🧠 Gerando embeddings...");
        const response = await gemini.models.embedContent({
            model: "text-embedding-004",
            contents: [{ text }],
            config: {
                taskType: "RETRIEVAL_DOCUMENT",
            },
        });
        if (!((_a = response.embeddings) === null || _a === void 0 ? void 0 : _a[0].values)) {
            throw new functions.https.HttpsError("internal", "Não foi possível gerar os embeddings");
        }
        console.log("✅ Embeddings gerados com sucesso");
        return {
            embeddings: response.embeddings[0].values,
            userId: context.auth.uid,
            timestamp: Date.now(),
        };
    }
    catch (error) {
        console.error("❌ Erro ao gerar embeddings:", error);
        throw new functions.https.HttpsError("internal", `Erro ao gerar embeddings: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    }
});
exports.generateAnswer = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Usuário deve estar autenticado para gerar resposta");
    }
    const { question, transcriptions } = data;
    if (!question || !transcriptions) {
        throw new functions.https.HttpsError("invalid-argument", "question e transcriptions são obrigatórios");
    }
    try {
        console.log("🤖 Gerando resposta com contexto...");
        const context = transcriptions.join("\n\n");
        const prompt = `
      Com base no texto fornecido abaixo como contexto, responda a pergunta de forma clara e precisa em português do Brasil.
    
      CONTEXTO:
      ${context}

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
            throw new functions.https.HttpsError("internal", "Falha ao gerar resposta pelo Gemini");
        }
        console.log("✅ Resposta gerada com sucesso");
        return {
            answer: response.text,
            hasContext: true,
            contextChunks: transcriptions.length,
            userId: context.auth.uid,
            timestamp: Date.now(),
        };
    }
    catch (error) {
        console.error("❌ Erro ao gerar resposta:", error);
        throw new functions.https.HttpsError("internal", `Erro ao gerar resposta: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    }
});
exports.generateGeneralAnswer = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Usuário deve estar autenticado para gerar resposta");
    }
    const { question } = data;
    if (!question) {
        throw new functions.https.HttpsError("invalid-argument", "question é obrigatório");
    }
    try {
        console.log("🎯 Gerando resposta geral...");
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
            throw new functions.https.HttpsError("internal", "Falha ao gerar resposta geral pelo Gemini");
        }
        console.log("✅ Resposta geral gerada com sucesso");
        return {
            answer: response.text,
            hasContext: false,
            userId: context.auth.uid,
            timestamp: Date.now(),
        };
    }
    catch (error) {
        console.error("❌ Erro ao gerar resposta geral:", error);
        throw new functions.https.HttpsError("internal", `Erro ao gerar resposta geral: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    }
});
//# sourceMappingURL=index.js.map