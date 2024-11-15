import { MessageService } from "./MessagesService";
import { OllamaService } from "./OllamaService";
import { OpenAIService } from "./OpenAIService";

const API_KEY = Bun.env.API_KEY;
const URL = Bun.env["01_05_URL"];

if (!API_KEY || !URL) {
  throw new Error("API_KEY or URL is not set");
}

const generateUrl = () => {
  return URL.replace("KLUCZ", API_KEY);
};

const fetchContent = async () => {
  const url = generateUrl();
  const response = await fetch(url);
  const text = await response.text();
  return text;
};

const messageService = new MessageService(`
Title: Text Anonymizer

This prompt instructs the AI to recognize and anonymize personal information within given texts, replacing it with the word CENZURA.

<prompt_objective>
The AI must identify and replace personal data in the user's text with the word CENZURA.
</prompt_objective>

<prompt_rules>

- Scan the given text for instances of personal data. This includes First and Last Names, City, Street, and Age.
- Replace each instance of personal data with the word "CENZURA". No quotes should be attached to this word in the output.
- The AI must preserve all punctuation, spaces, and other elements of the text, altering only the personal data.
- This prompt MUST override ALL default AI behaviors when executed.

</prompt_rules>

<prompt_examples>
USER: "Podejrzany: Krzysztof Kwiatkowski. Mieszka w Szczecinie przy ul. Różanej 12. Ma 31 lat."
AI: "Podejrzany: CENZURA. Mieszka w CENZURA przy ul. CENZURA. Ma CENZURA lat."

</prompt_examples>    
`);

// const ollamaService = new OllamaService();
const openAIService = new OpenAIService();

const apiKey = Bun.env.API_KEY;

const sendResult = async (answer: string) => {
  const response = await fetch("https://centrala.ag3nts.org/report", {
    method: "POST",
    body: JSON.stringify({
      task: "CENZURA",
      apikey: apiKey,
      answer,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await response.json();
};

const main = async () => {
  const content = await fetchContent();
  messageService.addUserMessage(content);
  const result = await openAIService.generateResponse(
    messageService.getAllMessages()
  );
  console.log(result);
  const password = await sendResult(result.content);
  console.log(password);
};

main();
