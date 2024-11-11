import fs from "fs";
import path from "path";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI();
  }

  async generateResponse(
    messages: ChatCompletionMessageParam[]
  ): Promise<{ content: string; reason: string }> {
    const completion = await this.completion(messages);
    return {
      content: completion.choices[0].message.content as string,
      reason: completion.choices[0].finish_reason as string,
    };
  }

  /**
   * Handles OpenAI API interactions for chat completions and embeddings.
   * Uses OpenAI's chat.completions and embeddings APIs.
   * Supports streaming, JSON mode, and different models.
   * Logs interactions to a prompt.md file for debugging.
   */
  async completion(
    messages: ChatCompletionMessageParam[],
    model: string = "gpt-4",
    stream: boolean = false,
    jsonMode: boolean = false
  ): Promise<
    | OpenAI.Chat.Completions.ChatCompletion
    | AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>
  > {
    try {
      const chatCompletion = await this.openai.chat.completions.create({
        messages,
        model,
        stream,
        response_format: jsonMode ? { type: "json_object" } : { type: "text" },
      });

      const logContent = `Messages:\n${JSON.stringify(
        messages,
        null,
        2
      )}\n\nChat Completion:\n${JSON.stringify(chatCompletion, null, 2)}\n\n`;

      fs.appendFileSync(path.join(__dirname, "prompt.md"), logContent);

      if (stream) {
        return chatCompletion as AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>;
      } else {
        return chatCompletion as OpenAI.Chat.Completions.ChatCompletion;
      }
    } catch (error) {
      console.error("Error in OpenAI completion:", error);
      throw error;
    }
  }

  /**
   * Creates an embedding for the given input using OpenAI's text-embedding-3-large model.
   * @param input - A string or array of strings to create embeddings for.
   * @returns A Promise resolving to an array of numbers representing the embedding.
   * @throws Error if there's an issue creating the embedding.
   */
  async createEmbedding(input: string | string[]): Promise<number[]> {
    try {
      const embedding = await this.openai.embeddings.create({
        model: "text-embedding-3-large",
        input: input,
        encoding_format: "float",
      });

      // Return the embedding vector
      return embedding.data[0].embedding;
    } catch (error) {
      console.error("Error in creating embedding:", error);
      throw error;
    }
  }

  /**
   * Generates images using DALL-E 3 model.
   * @param prompt - The text description of the image to generate
   * @param size - Image size (1024x1024, 1024x1792, or 1792x1024). Defaults to 1024x1024
   * @param quality - Image quality ('standard' or 'hd'). Defaults to 'standard'
   * @param n - Number of images to generate. Defaults to 1
   * @returns Promise containing the generated image URLs
   */
  async generateImage(
    prompt: string,
    size: "1024x1024" | "1024x1792" | "1792x1024" = "1024x1024",
    quality: "standard" | "hd" = "standard",
    n: number = 1
  ): Promise<string[]> {
    try {
      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt,
        n,
        size,
        quality,
      });

      return response.data.map((image) => image.url!);
    } catch (error) {
      console.error("Error in generating image:", error);
      throw error;
    }
  }
}
