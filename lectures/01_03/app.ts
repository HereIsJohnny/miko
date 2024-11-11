import * as fs from "fs";
import { MessageService } from "./MessagesService";
import { OpenAIService } from "./OpenAIService";

const apiKey = Bun.env.API_KEY;

if (!apiKey) {
  throw new Error("API_KEY is not set");
}

const json = fs.readFileSync(`${import.meta.dir}/json.txt`, "utf-8");

// iterate over the json object
type JSONType = {
  apikey: string;
  description: string;
  copyright: string;
  "test-data": {
    question: string;
    answer: number;
    test?: {
      q: string;
      a: string;
    };
  }[];
};

const jsonObject = JSON.parse(json) as JSONType;

const messageService = new MessageService(
  `
      You are a helpful assistant. Your mission is to answer questions using minimal number of words. 
      Your are given a question and your task is to answer it using only the answer. 
  
      <example>
          Question: How many people live in Poland?
          Answer: 38000000
      </example>
  
      <example>
          Question: What is the capital of USA?
          Answer: Washington
      </example>
  `
);

const openaiService = new OpenAIService();

const getAnswer = async (question: string) => {
  console.log(`Getting answer for question: ${question}`);
  const completion = await openaiService.completion(
    messageService.addUserMessage(question).getAllMessages()
  );
  console.log(`Answer: ${completion.choices[0].message.content}`);
  return completion.choices[0].message.content;
};

const reponseData: JSONType = {
  apikey: apiKey,
  description: jsonObject.description,
  copyright: jsonObject.copyright,
  "test-data": await Promise.all(
    jsonObject["test-data"].map(async (item) => ({
      question: item.question,
      answer: eval(item.question),
      test: item.test
        ? {
            q: item.test.q,
            a: await getAnswer(item.test.q),
          }
        : undefined,
    }))
  ),
};

const response = await fetch("https://centrala.ag3nts.org/report", {
  method: "POST",
  body: JSON.stringify({
    task: "JSON",
    apikey: apiKey,
    answer: reponseData,
  }),
  headers: {
    "Content-Type": "application/json",
  },
});

console.log(await response.json());
