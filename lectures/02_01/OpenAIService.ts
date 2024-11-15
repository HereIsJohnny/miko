import fs from "fs";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import path from "path";

export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI();
  }

  async transcribe(audioPath: string): Promise<string> {
    console.log("Transcribing audio...", audioPath);

    const transcription = await this.openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      language: "pl",
      model: "whisper-1",
    });
    return transcription.text;
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
}
