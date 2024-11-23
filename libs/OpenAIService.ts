import fs from "fs";
import path from "path";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI();
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

  async generateImage(prompt: string): Promise<string> {
    const response = await this.openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
    });

    return response.data[0].url!;
  }

  async transcribe(audioPath: string): Promise<string> {
    console.log("Transcribing audio...", audioPath);

    try {
      let audioFile;

      if (audioPath.startsWith("http")) {
        // Handle remote file
        const response = await fetch(audioPath);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Create a File object that OpenAI's API can handle
        audioFile = new File([buffer], "audio.mp3", { type: "audio/mpeg" });
      } else {
        // Handle local file
        audioFile = fs.createReadStream(audioPath);
      }

      const transcription = await this.openai.audio.transcriptions.create({
        file: audioFile,
        language: "pl",
        model: "whisper-1", // Note: Changed from "gpt-4o" to "whisper-1" as it's the correct model for transcription
      });

      return transcription.text;
    } catch (error) {
      console.error("Error in transcription:", error);
      throw error;
    }
  }
}
