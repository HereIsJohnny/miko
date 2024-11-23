import { sendResult } from "./../../libs/centrala";
import path from "path";
import {
  ChatCompletion,
  ChatCompletionMessageParam,
} from "openai/resources/index.mjs";
import { OpenAIService } from "../../libs/OpenAIService";
import fs from "fs";

const openaiService = new OpenAIService();

type Keywords = {
  keywords: string[];
  path: string;
};

const generateKeywords = async (text: string) => {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `
      Twoim zadaniem jest wygenerowanie najwiecej 50 najwazniejszych slow kluczowych. 
      
      Słowa kluczowe muszą być unikalne i nie powinny się powtarzać. Slowa kluczowe muszą być w formie mianownika.
      Jesli nie jest to możliwe, zwróć pustą tablicę. Wynik zwroc w postaci tablicy JSON.

      Przykład: 
      {
        "keywords": [
          "słowo1",
          "słowo2",
          "słowo3"
        ]
      }
    `,
    },
    {
      role: "user",
      content: text,
    },
  ];

  const completion = (await openaiService.completion(
    messages,
    "gpt-4o",
    false,
    true
  )) as ChatCompletion;

  return completion.choices[0].message.content;
};

const generateKeywordsForAllFacts = async () => {
  const factPaths = fs
    .readdirSync(__dirname + "/facts")
    .map((p) => path.join(__dirname + "/facts", p));

  const keywords = await Promise.all(
    factPaths.map(async (factPath) => {
      const keywords = await generateKeywords(
        fs.readFileSync(factPath, "utf-8")
      );

      if (keywords === "[]" || !keywords) {
        return null;
      }

      const parsedKeywords = JSON.parse(keywords);
      return { path: factPath, keywords: parsedKeywords.keywords };
    })
  );

  fs.writeFileSync(
    path.join(__dirname, "facts_keywords.json"),
    JSON.stringify(keywords, null, 2)
  );
};

const generateKeywordsForAllReports = async () => {
  const reportPaths = fs
    .readdirSync(__dirname + "/reports")
    .map((p) => path.join(__dirname + "/reports", p));

  const keywords = await Promise.all(
    reportPaths.map(async (reportPath) => {
      const keywords = await generateKeywords(
        fs.readFileSync(reportPath, "utf-8")
      );

      if (keywords === "[]" || !keywords) {
        return null;
      }

      const parsedKeywords = JSON.parse(keywords);
      return { path: reportPath, keywords: parsedKeywords.keywords };
    })
  );

  fs.writeFileSync(
    path.join(__dirname, "reports_keywords.json"),
    JSON.stringify(keywords, null, 2)
  );
};

const generatePromptMetadata = async () => {
  const reportsKeywords = JSON.parse(
    fs.readFileSync(path.join(__dirname, "reports_keywords.json"), "utf-8")
  );

  const factsKeywords = JSON.parse(
    fs.readFileSync(path.join(__dirname, "facts_keywords.json"), "utf-8")
  );

  const promptMetadata = reportsKeywords.map((report: Keywords) => {
    const { keywords: reportKeywords, path: reportPath } = report;
    const reportName = reportPath.split("/").pop();

    const factsToInclude = factsKeywords.filter((fact: Keywords) => {
      return reportKeywords.some((keyword) => fact.keywords.includes(keyword));
    });

    const factsPaths = factsToInclude.map((f) => f.path);

    return {
      report: reportPath,
      facts: factsPaths,
    };
  });

  return promptMetadata;
};

const generateKeywordsUsingContext = async (
  userTextPath: string,
  contextPaths: string[]
) => {
  const userText = fs.readFileSync(userTextPath, "utf-8");
  const context = contextPaths
    .map((p) => fs.readFileSync(p, "utf-8"))
    .join("\n");

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `
            Twoim zadaniem jest stworzenie listy słów kluczowych (w formie mianownika) na podstawie podanego przez użytkownika raportu. Stworz 50 slow kluczowych.
            Na potrzeby poprawnego rozumienia treści raportów otrzymujesz poniższy konktest zawierający dodatkowe fakty. 
            
            Nadaj priorytet osobom i faktom o nich. Na przkład jeśli w mowa o osobie która jest wspominana w faktach, wykorzystaj wiedzę z faktów by stworzyć precyzyjne słowa kluczowe o tej osobie. Gdy pojawiają się nazwy wlasne, nazwiska - kluczowe informacje o tych osobach lub rzeczach (znajdujące się w faktach) powinny być zawarte w słowach kluczowych. 
            == KONTEKST ==
            ${context}
            == KONIEC KONTEKSTU ==
            
            Słowa kluczowe muszą być unikalne i nie powinny się powtarzać. 
            Wynik zwroc w postaci tablicy JSON.

            Przykład:
            {
              "keywords": [
                "słowo1",
                "słowo2",
                "słowo3"
              ]
            }
          `,
    },
    {
      role: "user",
      content: userText,
    },
  ];

  const completion = (await openaiService.completion(
    messages,
    "gpt-4o",
    false,
    true
  )) as ChatCompletion;

  return JSON.parse(completion.choices[0].message.content);
};

const main = async () => {
  await generateKeywordsForAllFacts();
  await generateKeywordsForAllReports();

  const promptMetadata = await generatePromptMetadata();
  let answers: Record<string, string[]> = {};

  await Promise.all(
    promptMetadata.map(async (metadata) => {
      const keywords = await generateKeywordsUsingContext(
        metadata.report,
        metadata.facts
      );
      const factName = metadata.report.split("/").pop();
      answers[factName] = keywords.keywords.join(", ");
    })
  );

  console.log(answers);

  fs.writeFileSync(
    path.join(__dirname, "answers.json"),
    JSON.stringify(answers, null, 2)
  );

  //   const answers = JSON.parse(
  //     fs.readFileSync(path.join(__dirname, "answers.json"), "utf-8")
  //   );

  const key = await sendResult(answers, "dokumenty");
  console.log(key);
};

main();
