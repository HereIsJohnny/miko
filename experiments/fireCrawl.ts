const apiKey = Bun.env.FIRECRAWL_API_KEY;

// Install with npm install @mendable/firecrawl-js
import FireCrawlApp from "@mendable/firecrawl-js";

const app = new FireCrawlApp({ apiKey: "fc-b6d2d7caccc2441c82f528e84ee94936" });

const scrapeResult = await app.scrapeUrl("https://gazeta.pl/", {
  formats: ["markdown"],
});

console.log(scrapeResult);
