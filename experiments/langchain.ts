import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const model = new ChatOpenAI({ model: "gpt-4o" });
const parser = new StringOutputParser();

const messages = [
  new SystemMessage("Translate the following from English into Polish"),
  new HumanMessage("hi!"),
];

const response = await model.invoke(messages);
const result = await parser.invoke(response);
console.log({ result });

// const systemTemplate = "Translate the following into {language}:";
// const promptTemplate = ChatPromptTemplate.fromMessages([
//   ["system", systemTemplate],
//   ["user", "{text}"],
// ]);

// const promptValue = await promptTemplate.invoke({
//   language: "polish",
//   text: "hi",
// });

// const llmChain = promptTemplate.pipe(model).pipe(parser);
// const result = await llmChain.invoke({ language: "italian", text: "hi" });
// console.log({ result });
