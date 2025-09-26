// Script de teste para as Firebase Cloud Functions
import { FirebaseAIClient } from "./src/services/firebase-ai-client.ts";

async function testCloudFunctions() {
  console.log("🧪 Testando Firebase Cloud Functions...\n");

  // Token JWT do Firebase (o que você forneceu anteriormente)
  const idToken =
    "eyJhbGciOiJSUzI1NiIsImtpZCI6IjUwMDZlMjc5MTVhMTcwYWIyNmIxZWUzYjgxZDExNjU0MmYxMjRmMjAiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vbGV0bWVhc2stYTE1NGEiLCJhdWQiOiJsZXRtZWFzay1hMTU0YSIsImF1dGhfdGltZSI6MTc1ODY4OTM4MiwidXNlcl9pZCI6IlBzMk52eUZLVEhPWVFFNHlNYThSZEFyNFp0bzIiLCJzdWIiOiJQczJOdnlGS1RIT1lRRTR5TWE4UmRBcjRadG8yIiwiaWF0IjoxNzU4Njg5MzgyLCJleHAiOjE3NTg2OTI5ODIsImVtYWlsIjoic291ei5kZXZlbG9wZXJAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbInNvdXouZGV2ZWxvcGVyQGdtYWlsLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.dimgrgxPRK6HRm1pecLOKW1YY37ea3e0KhomeeibIY5Jn8lqEXsCcn6AqcGX8T6AGBkFH8BY5s_JM2BayVWYKuqAkDwO8z-W3FoebK5b0moWdYbDEz2HfymBrFi1TFVNFnXjfVeXZqamhQ13zHEVwIgvYQd6S6jejs3gMrIJpRB02kk1v_fxifllszQAVDBeuWhi2XRVvrq-J6CBJy_KbU1HD8QX8BkNViZsmWOiRJINtMbrx2_HUqCwR96Z7KI48BojIpbygxOLCcfbCi19mfuC6xdR7aQKMk5-qqh4KtUfukbZyvVuPmsfkvPOX_Kh0tDmaHdwX3qsbW8IBU6m2A";

  try {
    // Teste 1: Gerar embeddings
    console.log("1️⃣ Testando geração de embeddings...");
    const embeddingsResult = await FirebaseAIClient.generateEmbeddings(
      { text: "Olá, este é um teste de embedding" },
      idToken
    );
    console.log(
      "✅ Embeddings gerados:",
      embeddingsResult.embeddings.length,
      "dimensões"
    );
    console.log(
      "📅 Timestamp:",
      new Date(embeddingsResult.timestamp).toISOString()
    );
    console.log("👤 User ID:", embeddingsResult.userId);

    console.log("\n" + "=".repeat(50) + "\n");

    // Teste 2: Resposta geral
    console.log("2️⃣ Testando resposta geral...");
    const generalAnswer = await FirebaseAIClient.generateGeneralAnswer(
      { question: "O que é JavaScript?" },
      idToken
    );
    console.log("✅ Resposta geral gerada:");
    console.log("💬", generalAnswer.answer.substring(0, 200) + "...");
    console.log("🎯 Tem contexto:", generalAnswer.hasContext);
    console.log(
      "📅 Timestamp:",
      new Date(generalAnswer.timestamp).toISOString()
    );

    console.log("\n" + "=".repeat(50) + "\n");

    // Teste 3: Resposta com contexto
    console.log("3️⃣ Testando resposta com contexto...");
    const contextAnswer = await FirebaseAIClient.generateAnswer(
      {
        question: "O que foi explicado sobre React?",
        transcriptions: [
          "React é uma biblioteca JavaScript para construir interfaces de usuário.",
          "O React utiliza componentes reutilizáveis para criar aplicações.",
          "Os hooks são uma funcionalidade importante do React moderno.",
        ],
      },
      idToken
    );
    console.log("✅ Resposta com contexto gerada:");
    console.log("💬", contextAnswer.answer.substring(0, 200) + "...");
    console.log("🎯 Tem contexto:", contextAnswer.hasContext);
    console.log("📊 Chunks de contexto:", contextAnswer.contextChunks);
    console.log(
      "📅 Timestamp:",
      new Date(contextAnswer.timestamp).toISOString()
    );
  } catch (error) {
    console.error("❌ Erro nos testes:", error);
  }
}

// Executar testes
testCloudFunctions();
