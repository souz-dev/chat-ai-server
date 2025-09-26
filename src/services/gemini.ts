import { GoogleGenAI } from "@google/genai";
import { env } from "../env.ts";

const gemini = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
});

const model = "gemini-2.5-flash";

export async function transcribeAudio(audioAsBase64: string, mimeType: string) {
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
    throw new Error("Não foi possível converter o áudio");
  }

  return response.text;
}

export async function generateEmbeddings(text: string) {
  const response = await gemini.models.embedContent({
    model: "text-embedding-004",
    contents: [{ text }],
    config: {
      taskType: "RETRIEVAL_DOCUMENT",
    },
  });

  if (!response.embeddings?.[0].values) {
    throw new Error("Não foi possível gerar os embeddings.");
  }

  return response.embeddings[0].values;
}

export async function generateAnswer(
  question: string,
  transcriptions: string[]
) {
  const context = transcriptions.join("\n\n");

  console.log("🤖 Contexto para IA:", context.substring(0, 200) + "...");

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
    - Se for citar o contexto, utilize o temo "conteúdo da aula";
  `.trim();

  try {
    console.log("🔄 Enviando prompt para Gemini...");
    const response = await gemini.models.generateContent({
      model,
      contents: [
        {
          text: prompt,
        },
      ],
    });

    console.log(
      "📨 Resposta recebida do Gemini:",
      response.text ? "Sucesso" : "Vazio"
    );

    if (!response.text) {
      throw new Error("Falha ao gerar resposta pelo Gemini");
    }

    return response.text;
  } catch (error) {
    console.error("❌ Erro ao chamar Gemini:", error);
    throw error;
  }
}

export async function generateGeneralAnswer(question: string) {
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

  try {
    console.log(
      "🔄 Gerando resposta geral para:",
      question.substring(0, 50) + "..."
    );
    const response = await gemini.models.generateContent({
      model,
      contents: [
        {
          text: prompt,
        },
      ],
    });

    console.log(
      "📨 Resposta geral gerada:",
      response.text ? "Sucesso" : "Vazio"
    );

    if (!response.text) {
      throw new Error("Falha ao gerar resposta geral pelo Gemini");
    }

    return response.text;
  } catch (error) {
    console.error("❌ Erro ao gerar resposta geral:", error);
    throw error;
  }
}
