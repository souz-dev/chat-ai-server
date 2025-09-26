import { db } from "./src/db/connection.ts";
import { schema } from "./src/db/schema/index.ts";

async function clearDatabase() {
  try {
    console.log("🗑️  Limpando banco de dados...");

    // Apagar na ordem correta devido às foreign keys
    console.log("Apagando audio chunks...");
    await db.delete(schema.audioChunks);

    console.log("Apagando questions...");
    await db.delete(schema.questions);

    console.log("Apagando rooms...");
    await db.delete(schema.rooms);

    console.log("✅ Banco de dados limpo com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao limpar banco:", error);
  } finally {
    process.exit(0);
  }
}

clearDatabase();
