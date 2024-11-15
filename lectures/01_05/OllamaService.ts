import fs from "fs";
import path from "path";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export class OllamaService {
  private baseUrl: string;

  constructor(baseUrl: string = "http://localhost:11434") {
    this.baseUrl = baseUrl;
  }

  /**
   * Handles Ollama API interactions for chat completions and embeddings.
   * Similar interface to OpenAI but uses Ollama's API endpoints.
   * Logs interactions to a prompt.md file for debugging.
   */
  async completion(
    messages: ChatCompletionMessageParam[],
    model: string = "llama3.2",
    stream: boolean = false,
    jsonMode: boolean = true
  ) {
    console.table({ messages });
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          stream,
          // format: jsonMode ? "json" : "text",
        }),
      });

      console.log({ response });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      let result;
      if (stream) {
        return response.body;
      } else {
        result = await response.json();
      }

      const logContent = `Messages:\n${JSON.stringify(
        messages,
        null,
        2
      )}\n\nChat Completion:\n${JSON.stringify(result, null, 2)}\n\n`;

      fs.appendFileSync(path.join(__dirname, "prompt.md"), logContent);

      return result;
    } catch (error) {
      console.error("Error in Ollama completion:", error);
      throw error;
    }
  }

  /**
   * Creates an embedding for the given input using Ollama's API.
   * @param input - A string to create embeddings for.
   * @returns A Promise resolving to an array of numbers representing the embedding.
   * @throws Error if there's an issue creating the embedding.
   */
  async createEmbedding(input: string | string[]): Promise<number[]> {
    try {
      const actualInput = Array.isArray(input) ? input.join(" ") : input;

      const response = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama2",
          prompt: actualInput,
        }),
      });

      console.log({ response });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const result = await response.json();
      return result.embedding;
    } catch (error) {
      console.error("Error in creating embedding:", error);
      throw error;
    }
  }
}
