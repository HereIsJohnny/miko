import fs from "fs";
import { MessageService } from "./MessagesService";
import { OpenAIService } from "./OpenAIService";
import readline from "readline";

const systemPrompt = fs.readFileSync(`${__dirname}/systemPrompt.md`, "utf8");
const messagesService = new MessageService(systemPrompt);
const openaiService = new OpenAIService();

const main = async () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let finished = false;

  while (!finished) {
    console.log("-- starting iteration --");
    const { content, reason } = await openaiService.generateResponse(
      messagesService.getAllMessages()
    );

    await messagesService.addSystemMessage(content);

    console.log("reason", reason);

    if (reason !== "stop") {
      finished = true;
    }

    await new Promise((resolve) =>
      rl.question(content + "\n\n", (answer) => {
        console.log("answer", answer);
        messagesService.addUserMessage(answer);
        resolve(null);
      })
    );

    console.log("-- ending iteration --");
  }
};

main();
