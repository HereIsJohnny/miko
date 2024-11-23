import FireCrawlApp, { ScrapeResponse } from "@mendable/firecrawl-js";
const apiKey = Bun.env.FIRECRAWL_API_KEY;
import fs from "fs";
import { TextSplitter } from "../../libs/TextService";

if (!apiKey) {
  throw new Error("FIRECRAWL_API_KEY is not set");
}

const convertUrlToMarkdown = async (url: string) => {
  const app = new FireCrawlApp({ apiKey });
  const scrapeResult = await app.scrapeUrl(url, {
    formats: ["markdown"],
  });

  if (scrapeResult.error) {
    throw new Error(scrapeResult.error);
  }

  return scrapeResult as ScrapeResponse;
};

const main = async () => {
  //
  const url = "https://www.anthropic.com/news/contextual-retrieval";
  const { markdown } = await convertUrlToMarkdown(url);

  if (!markdown) {
    throw new Error("No markdown found");
  }

  const textSplitter = new TextSplitter();
  const chunks = await textSplitter.split(markdown, 1000);
  console.log(chunks);

  fs.writeFileSync(__dirname + "/chunks.json", JSON.stringify(chunks, null, 2));
  //   if (result.markdown) {
  //     fs.writeFileSync(__dirname + "/markdown.md", result.markdown);
  //   }
};

main();
