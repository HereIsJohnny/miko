interface Message {
  role: "system" | "user";
  content: string;
}

export class MessageService {
  private messages: Message[] = [];

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

  getAllMessages(): Message[] {
    return [...this.messages];
  }

  getMessagesByRole(role: "system" | "user"): Message[] {
    return this.messages.filter((message) => message.role === role);
  }

  clearMessages(): void {
    this.messages = [];
  }
}
