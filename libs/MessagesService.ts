interface Message {
  role: "system" | "user";
  content: string | (ImageMessage | TextMessage)[];
}

interface ImageMessage {
  type: "image_url";
  image_url: { url: string };
}

interface TextMessage {
  type: "text";
  text: string;
}

export class MessagesService {
  private messages: Message[] = [];

  constructor(systemPrompt?: string) {
    if (systemPrompt) {
      this.addSystemMessage(systemPrompt);
    }
  }

  addSystemMessage(content: string): MessagesService {
    this.messages.push({
      role: "system",
      content,
    });
    return this;
  }

  addUserMessage(content: string): MessagesService {
    this.messages.push({
      role: "user",
      content,
    });
    return this;
  }

  addImageMessage(imageUrl: string, text: string): MessagesService {
    this.messages.push({
      role: "user",
      content: [
        { type: "image_url", image_url: { url: imageUrl } },
        { type: "text", text },
      ],
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
