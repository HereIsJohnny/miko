import FireCrawlApp from "@mendable/firecrawl-js";
import fs from "fs";
import { OpenAIService } from "../../libs/OpenAIService";
import { sendResult } from "../../libs/centrala";

const fireCrawlApiKey = Bun.env.FIRECRAWL_API_KEY;
const aidevsApiKey = Bun.env.API_KEY;
const mainUrl = Bun.env["04_03_URL"];
const questionsUrl = Bun.env["04_03_QUESTIONS_URL"];

if (!fireCrawlApiKey || !aidevsApiKey || !mainUrl || !questionsUrl) {
  console.error("FIRECRAWL_API_KEY or API_KEY or 04_03_URL is not set");
  process.exit(1);
}

const firecrawlApp = new FireCrawlApp({ apiKey: fireCrawlApiKey });
const openai = new OpenAIService();

const QUESTIONS = [
  "Podaj adres mailowy do firmy SoftoAI",
  "Jaki jest adres interfejsu webowego do sterowania robotami zrealizowanego dla klienta jakim jest firma BanAN?",
  "Jakie dwa certyfikaty jakości ISO otrzymała firma SoftoAI?",
];

const urlToFileName = (url: string) => url.replace(/[^a-zA-Z0-9]/g, "_");

const scrapPage = async (url: string) => {
  const localFilePath = `${__dirname}/saved/${urlToFileName(url)}.json`;

  if (fs.existsSync(localFilePath)) {
    return JSON.parse(fs.readFileSync(localFilePath, "utf8"));
  }

  const scrapeResult = await firecrawlApp.scrapeUrl(url, {
    formats: ["markdown", "links"],
    onlyMainContent: false,
  });

  fs.writeFileSync(localFilePath, JSON.stringify(scrapeResult, null, 2));

  return scrapeResult;
};

const analysePage = async (
  question: string,
  pageContent: string,
  links: string[]
) => {
  const response = await openai.completion([
    {
      role: "system",
      content: `
        You are given question, page content and links. 
        If the questions can be answered using the page content answer it. 
        If the questions can't be answered using the page content return link that most likely will answer the question. 
        Return in JSON format. Always return correct JSON format.
        
        Example if page content contains answer:
        {
          "question": "ORIGINAL QUESTION",
          "answer": "ANSWER",
          "link": null
        }

        Example if page content does not contain answer:
        {
          "question": "ORIGINAL QUESTION",
          "answer": null,
          "link": "LINK"
        }
      `,
    },
    {
      role: "user",
      content: `Question: ${question}\n\nPage content: ${pageContent}\n\nLinks: ${links.join(
        "\n"
      )}`,
    },
  ]);

  const content = response.choices[0].message.content;
  console.log("Raw Response:", content);

  try {
    return JSON.parse(content.trim());
  } catch (error) {
    console.error("Failed to parse JSON response:", error);
    console.error("Response content:", content);
    throw new Error("Failed to parse AI response");
  }
};

const loop = async (
  question: string,
  url: string = mainUrl,
  maxIterations: number = 10
) => {
  console.log("--------------------------------");
  console.log(`Iteration ${maxIterations}`);
  console.log(`Question: ${question}`);
  console.log(`URL: ${url}`);
  const page = await scrapPage(url);
  const analysis = await analysePage(question, page.markdown, page.links);

  console.log("Analysis:", analysis);

  if (analysis.answer !== null) {
    return analysis.answer;
  } else {
    return await loop(question, analysis.link, maxIterations - 1);
  }
};

const main = async () => {
  const answer1 = await loop(QUESTIONS[0]);
  const answer2 = await loop(QUESTIONS[1]);
  const answer3 = await loop(QUESTIONS[2]);

  console.log("--------------------------------");
  console.log("Answer 1:", answer1);
  console.log("Answer 2:", answer2);
  console.log("Answer 3:", answer3);

  const flag = await sendResult(
    {
      "01": answer1,
      "02": answer2,
      "03": answer3,
    },
    "softo"
  );

  console.log("Flag:", flag);
};

main();
