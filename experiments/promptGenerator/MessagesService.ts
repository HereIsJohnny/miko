import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

export class MessageService {
  private messages: ChatCompletionMessageParam[] = [];

  constructor(systemPrompt?: string) {
    if (systemPrompt) {
      this.addSystemMessage(systemPrompt);
    }
  }

  addSystemMessage(content: string): MessageService {
    this.messages.push({
      role: "system",
      content,
    });
    return this;
  }

  addUserMessage(content: string): MessageService {
    this.messages.push({
      role: "user",
      content,
    });
    return this;
  }

  getAllMessages(): ChatCompletionMessageParam[] {
    return [...this.messages];
  }

  getMessagesByRole(role: "system" | "user"): ChatCompletionMessageParam[] {
    return this.messages.filter((message) => message.role === role);
  }

  clearMessages(): void {
    this.messages = [];
  }
}
