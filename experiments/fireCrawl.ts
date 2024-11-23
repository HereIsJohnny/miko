const apiKey = Bun.env.FIRECRAWL_API_KEY;

// Install with npm install @mendable/firecrawl-js
import FireCrawlApp from "@mendable/firecrawl-js";

const app = new FireCrawlApp({ apiKey });

const scrapeResult = await app.scrapeUrl("https://gazeta.pl/", {
  formats: ["markdown"],
});

console.log(scrapeResult);
