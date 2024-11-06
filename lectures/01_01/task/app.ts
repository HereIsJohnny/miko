const apiKey = Bun.env.FIRECRAWL_API_KEY;
const url = Bun.env["01_01_URL"] as string;

// Install with npm install @mendable/firecrawl-js
import FireCrawlApp from "@mendable/firecrawl-js";
import { OpenAIService } from "../thread/OpenAIService";

// meassure execution time
const startTime = Date.now();

const app = new FireCrawlApp({ apiKey });

const scrappPage = async (url: string) => {
  const scrapeResult = await app.scrapeUrl(url, {
    formats: ["html"],
  });

  if (scrapeResult.error) {
    console.error(scrapeResult.error);
    process.exit(1);
  }

  return scrapeResult;
};

const scrapeResult = await scrappPage(url);

const html = "html" in scrapeResult ? scrapeResult.html : "";

const userName = "tester";
const password = "574e112a";

const humanQuestion =
  html?.match(/#human-question">(.*?)<\/p>/)?.[1] ||
  html?.match(/<p id="human-question">Question:.*?<\/p>/)?.[0];

const openaiService = new OpenAIService();
const response = await openaiService.completion([
  {
    role: "system",
    content:
      "Answer the question only with year number. Only give a number. Do not add any other text.",
  },
  { role: "user", content: `Answer to the question: ${humanQuestion}` },
]);

const answer = response.choices[0].message.content;

console.log({ humanQuestion, answer });

const postBody = new URLSearchParams({
  username: userName,
  password: password,
  answer: answer,
});

console.log(postBody.toString());

const postResponse = await fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: postBody,
});

const postResponseText = await postResponse.text();

console.log(postResponseText);

const endTime = Date.now();
console.log(`Execution time: ${endTime - startTime}ms`);
