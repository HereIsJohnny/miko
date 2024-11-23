import { MessageService } from "./../02_01/MessagesService";
import { flow } from "lodash/fp";
import Turndown from "turndown";
import fs from "fs";
import { MessagesService } from "../../libs/MessagesService";
import { OpenAIService } from "../../libs/OpenAIService";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { sendResult } from "../../libs/centrala";
const apiKey = process.env.API_KEY;
const urlPattern = process.env["02_05_URL"];
const articleUrl = process.env["02_05_URL_2"];

if (!articleUrl) {
  throw new Error("02_05_URL_2 is not set");
}

if (!apiKey) {
  throw new Error("API_KEY is not set");
}

if (!urlPattern) {
  throw new Error("02_05_URL is not set");
}

const url = urlPattern.replace("KLUCZ-API", apiKey);

const openAIService = new OpenAIService();

const getQuestions = async (url: string) => {
  const response = await fetch(url);
  const questions = (await response.text()).split("\n").filter((v) => !!v);
  return questions.map((questions) => {
    const [id, content] = questions.split("=");
    return { id, content };
  });
};

const getAbsoluteUrl = (relativePath: string): string => {
  return `https://centrala.ag3nts.org/dane/${relativePath}`;
};

const convertHtmlToMarkdown = (html: string) => {
  const turndown = new Turndown();
  return turndown.turndown(html);
};

const getHTML = async (url: string) => {
  const response = await fetch(url);
  return await response.text();
};

const saveMarkdown = async (markdown: string) => {
  fs.writeFileSync(`${__dirname}/article.md`, markdown);
};

const imageToText = async (imagePath: string) => {
  console.log({ imagePath });
  const image = await fetch(imagePath).then((res) => res.arrayBuffer());

  const imageBase64 = Buffer.from(image).toString("base64");

  const messages = new MessagesService();

  messages.addImageMessage(
    `data:image/jpeg;base64,${imageBase64}`,
    "Opisz zdjecie w kilku slowach. Po polsku."
  );

  const response = await openAIService.completion(
    messages.getAllMessages() as ChatCompletionMessageParam[],
    "gpt-4o"
  );

  const result = response.choices[0].message.content;
  console.log(result);
  return result;
};

const mp3ToText = async (mp3Path: string) => {
  const result = await openAIService.transcribe(mp3Path + ".mp3");
  console.log("mp3", result);
  return result;
};

async function processMarkdownImages(
  input: string,
  imageProcessor: (imagePath: string) => Promise<string>
): Promise<string> {
  // Regex to match markdown image syntax: ![alt text](path/to/image)
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;

  // Find all matches
  const matches = Array.from(input.matchAll(imageRegex));

  // Process all images concurrently
  const replacements = await Promise.all(
    matches.map(async (match) => {
      const [fullMatch, altText, imagePath] = match;
      const replacement = await imageProcessor(getAbsoluteUrl(imagePath));
      return {
        original: fullMatch,
        replacement,
      };
    })
  );

  // Apply all replacements to the input string
  let result = input;
  for (const { original, replacement } of replacements) {
    result = result.replace(original, replacement);
  }

  return result;
}

async function processMarkdownMp3(
  markdown: string,
  mp3Processor: (mp3Path: string) => Promise<string>
) {
  const mp3Regex = /\[(.*?)\]\((.*?)\.mp3\)/g;
  const matches = markdown.matchAll(mp3Regex);
  for (const match of matches) {
    const [fullMatch, altText, mp3Path] = match;
    const replacement = await mp3Processor(getAbsoluteUrl(mp3Path));
    markdown = markdown.replace(fullMatch, replacement);
  }
  return markdown;
}

const processArticle = flow(convertHtmlToMarkdown);

const main = async () => {
  // const html = await getHTML(articleUrl);
  // const markdown = processArticle(html);
  // const processedImages = await processMarkdownImages(markdown, imageToText);
  // const processedMp3 = await processMarkdownMp3(processedImages, mp3ToText);
  // await saveMarkdown(processedMp3);
  const markdown = fs.readFileSync(`${__dirname}/article.md`, "utf-8");
  const questions = await getQuestions(url);

  const messages = new MessagesService(`
    You are a helpful assistant. Your role is to answer to the question based on the provided context.
    Answer in Polish with one sentence for each question. Response in format:
    [
      {
        "question_id": "1",
        "answer": "Odpowiedz na pytanie 1"
      }
    ]

    <Context>
      ${markdown}
    </Context>
  `);

  const questionsListMessage = questions.reduce((acc, question, index) => {
    return acc.addUserMessage(`${index + 1}. ${question.content}`);
  }, messages);

  const response = await openAIService.completion(
    questionsListMessage.getAllMessages() as ChatCompletionMessageParam[],
    "gpt-4o"
  );

  console.log({ questions });

  // transform response to object
  const answers = JSON.parse(response.choices[0].message.content);

  console.log(answers);

  const result = answers.reduce((acc, answer) => {
    acc["0" + answer.question_id] = answer.answer;
    return acc;
  }, {});

  const key = await sendResult(result, "arxiv");

  console.log(key);

  // const messageService = new MessagesService(`
  //     You are a helpful assistant. Your role is to answer to the questions
  // `);
};

main();
