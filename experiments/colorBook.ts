import { OpenAIService } from "../libs/OpenAIService";
import { MessageService } from "./promptGenerator/MessagesService";
const main = async () => {
  const messageService = new MessageService(`
        You're a color book generator for 3 year olds. You should generate picture for the chdilren to color. Please generate simple shapes that are easy to color dont use gradients, only contours. Don'y draw anything that is not in the user quote. You're given a description of what should be in the book. This description is a quote of 3 year olds. Get essence of what should be in the book and generate a black and white color book. Use black only for the lines.

       
    `);

  const openai = new OpenAIService();

  messageService.addUserMessage(`
  Jest bardzo duzo Panow i Panii. Oni maja otwarta apteczke i lecza kogos. Idac na basen. Jest male dziecko.  
  `);

  try {
    const response = await openai.generateImage(
      messageService
        .getAllMessages()
        .map((m) => m.content)
        .join("\n")
    );
    console.log(response);
  } catch (error) {
    console.error("Error generating image:", error.message);
    // Log the full error in development
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }
};

main();
