import { MessageService } from "./../01_03/MessagesService";
import { OpenAIService } from "./OpenAIService";
import { glob } from "glob";
import fs from "fs/promises";

const apiKey = Bun.env.API_KEY;

if (!apiKey) {
  throw new Error("API_KEY is not set");
}

const sendResult = async (answer: string) => {
  const response = await fetch("https://centrala.ag3nts.org/report", {
    method: "POST",
    body: JSON.stringify({
      task: "mp3",
      apikey: apiKey,
      answer,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await response.json();
};

const openAIService = new OpenAIService();

const originalSampleRate = 44100;
const targetSampleRate = 16000;

const transcribe = async (audioPath: string, title: string) => {
  const transcription = await openAIService.transcribe(audioPath);

  await Bun.write(`${__dirname}/transcripts/text/${title}.txt`, transcription);
};

const getTitle = (path: string) => {
  return path.split("/").pop()?.split(".")[0] ?? "undefined";
};

const systemPrompt = `
[Analyzing Professor May's Workplace]

This prompt aims to analyse few transcripts and find out on what university and what insistute professor May is working on. 

Please print information in the following format:

University: <university name>
Institute: <institute name>
### END OF PROMPT
`;

const main = async () => {
  const messageService = new MessageService(systemPrompt);
  const paths = await glob(`${__dirname}/transcripts/text/*.txt`);
  let allTranscripts = "";
  let i = 1;
  for (const path of paths) {
    const transcript = await fs.readFile(path, "utf-8");
    allTranscripts += `PERSON ${i}: ${transcript}\n`;
    i++;
  }

  messageService.addUserMessage(
    "Analyze the following transcripts: " + allTranscripts
  );

  const { content } = await openAIService.generateResponse(
    messageService.getAllMessages()
  );

  const openAIService2 = new OpenAIService();
  const messageService2 = new MessageService(content).addUserMessage(
    "Do you know the street name? Please print it in the following format: <street name>"
  );

  const { content: streetName } = await openAIService2.generateResponse(
    messageService2.getAllMessages()
  );

  console.log(streetName);

  const answer = await sendResult(streetName);
  console.log(answer);

  //   console.log(streetName);
};

main();
