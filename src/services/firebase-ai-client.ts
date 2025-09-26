// Cliente HTTP para chamar Firebase Cloud Functions diretamente
interface TranscribeAudioRequest {
  audioAsBase64: string;
  mimeType: string;
}

interface TranscribeAudioResponse {
  transcription: string;
  userId: string;
  timestamp: number;
}

interface GenerateEmbeddingsRequest {
  text: string;
}

interface GenerateEmbeddingsResponse {
  embeddings: number[];
  userId: string;
  timestamp: number;
}

interface GenerateAnswerRequest {
  question: string;
  transcriptions: string[];
}

interface GenerateAnswerResponse {
  answer: string;
  hasContext: boolean;
  contextChunks?: number;
  userId: string;
  timestamp: number;
}

interface GenerateGeneralAnswerRequest {
  question: string;
}

export class FirebaseAIClient {
  private static readonly PROJECT_ID = "letmeask-a154a";
  private static readonly REGION = "us-central1";

  private static getCloudFunctionUrl(functionName: string): string {
    return `https://${this.REGION}-${this.PROJECT_ID}.cloudfunctions.net/${functionName}`;
  }

  private static async callCloudFunction<TRequest, TResponse>(
    functionName: string,
    data: TRequest,
    idToken?: string
  ): Promise<TResponse> {
    const url = this.getCloudFunctionUrl(functionName);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Se tiver token de auth, adicionar no header
    if (idToken) {
      headers["Authorization"] = `Bearer ${idToken}`;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ data }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = (await response.json()) as { result?: TResponse };
      if (!("result" in result)) {
        throw new Error(`Invalid response format: missing 'result' property`);
      }
      return result.result as TResponse;
    } catch (error) {
      throw new Error(
        `Failed to call Cloud Function '${functionName}': ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  static async transcribeAudio(
    data: TranscribeAudioRequest,
    idToken?: string
  ): Promise<TranscribeAudioResponse> {
    return this.callCloudFunction("transcribeAudio", data, idToken);
  }

  static async generateEmbeddings(
    data: GenerateEmbeddingsRequest,
    idToken?: string
  ): Promise<GenerateEmbeddingsResponse> {
    return this.callCloudFunction("generateEmbeddings", data, idToken);
  }

  static async generateAnswer(
    data: GenerateAnswerRequest,
    idToken?: string
  ): Promise<GenerateAnswerResponse> {
    return this.callCloudFunction("generateAnswer", data, idToken);
  }

  static async generateGeneralAnswer(
    data: GenerateGeneralAnswerRequest,
    idToken?: string
  ): Promise<GenerateAnswerResponse> {
    return this.callCloudFunction("generateGeneralAnswer", data, idToken);
  }
}
