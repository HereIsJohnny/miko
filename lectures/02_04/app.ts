import { ImageProcessor } from "./../../libs/ImageProcessor";
import fs from "fs";
import { glob } from "glob";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { MessagesService } from "../../libs/MessagesService";
import { OpenAIService } from "../../libs/OpenAIService";
import { sendResult } from "../../libs/centrala";

const openAIService = new OpenAIService();

type FileType = "mp3" | "png" | "txt";

const mp3ToText = async (audioPath: string) => {
  const transcription = await openAIService.transcribe(audioPath);
  return transcription;
};

const textToText = async (txtPath: string) => {
  console.log("Processing", txtPath);
  const text = fs.readFileSync(txtPath, "utf8");
  return text;
};

const imageToText = async (imagePath: string) => {
  // image to base 64
  // const base64Image = fs.readFileSync(imagePath, "base64");

  const imageProcessor = new ImageProcessor();
  const { imageBase64 } = await imageProcessor.compressImage({ imagePath });

  const messages = new MessagesService();

  messages.addImageMessage(
    `data:image/jpeg;base64,${imageBase64}`,
    "Extract text from the image. Skip header and footer."
  );

  const response = await openAIService.completion(
    messages.getAllMessages() as ChatCompletionMessageParam[],
    "gpt-4o"
  );

  const result = response.choices[0].message.content;
  console.log(result);
  return result;
  // return { name: result.name || image.name, preview: result.preview || "" };

  // return completion.choices[0].message.content;
};

const processFile = async (filePath: string) => {
  const fileExtension: FileType = filePath.split(".").pop() as FileType;
  let text: string;
  switch (fileExtension) {
    case "mp3":
      text = await mp3ToText(filePath);
      break;
    case "png":
      text = await imageToText(filePath);
      break;
    case "txt":
      text = await textToText(filePath);
      break;
    default:
      throw new Error(`Unknown file extension: ${fileExtension}`);
  }

  const fileName = filePath.split("/").pop();
  // save text to the file
  const finalPath = `${__dirname}/processed/${fileName}|.txt`;
  console.log("Saving to", finalPath);
  fs.writeFileSync(finalPath, text);

  // return await classifyText(text);
};

const classifyText = async (text: string) => {
  const messages = new MessagesService(`
**Classify Notes: People, Hardware, or Other**

This prompt's sole purpose is to classify notes based on their content into three categories: "people," "hardware," or "other."

<prompt_objective>
Classify each note into one of the following categories: "people," "hardware," or "other" based on its content. Respond with the category name only.
</prompt_objective>

<prompt_rules>
- **"people"**: If the note contains name or surname of a person of a captured person.
- **"hardware"**: If the note discusses issues or problems with machines, devices, or any hardware-related issues (e.g., malfunctions, repairs, parts). It is not about the software issues. 
- **NEVER** classify software-related issues as "hardware".
- **NEVER** classify hardware-related issues as "people" or vice versa.
- **NEVER** include anything other than the category name in the output.
- The output **MUST** only include one of the categories: "people," "hardware," or "other."

</prompt_rules>

People category take precedence over hardware.

<prompt_examples>
USER: "Godzina II:50. W czujniku ruchu wykryto usterkę spowodowaną zwarciem kabli. Przyczyną była mała mysz, która dostała się między przewody, powodując chwilowe przerwy w działaniu sensorów. Odłączono zasilanie, usunięto ciało obce i zabezpieczono osłony kabli przed dalszymi uszkodzeniami. Czujnik ponownie skalibrowany i sprawdzony pod kątem poprawności działania."
AI: hardware

USER: "Godzina 22:43. Wykryto jednostkę organiczną w pobliżu północnego skrzydła fabryki. Osobnik przedstawił się jako Aleksander Ragowski. Przeprowadzono skan biometryczny, zgodność z bazą danych potwierdzona. Jednostka przekazana do działu kontroli. Patrol kontynuowany."
AI: people

</prompt_examples>

  `);

  messages.addUserMessage(text);

  const response = await openAIService.completion(
    messages.getAllMessages() as ChatCompletionMessageParam[],
    "gpt-4o"
  );

  return response.choices[0].message.content;
};

const classifyPeople = async (text: string) => {
  const messages = new MessagesService(`
    Classify if the text contains name or surname. Respond with "yes" or "no".
    

    <prompt_examples>
    USER: "Godzina 22:43. Wykryto jednostkę organiczną w pobliżu północnego skrzydła fabryki. Osobnik przedstawił się jako Aleksander Ragowski. Przeprowadzono skan biometryczny, zgodność z bazą danych potwierdzona. Jednostka przekazana do działu kontroli. Patrol kontynuowany."
    AI: yes

    USER: "Godzina 01:30. Przebieg patroli nocnych na poziomie ściśle monitorowanym. Czujniki pozostają aktywne, a wytyczne dotyczące wykrywania życia organicznego – bez rezultatów. Stan patrolu bez zakłóceń."
    AI: no

    USER: "Godzina 22:50. Sektor północno-zachodni spokojny, stan obszaru stabilny. Skanery temperatury i ruchu wskazują brak wykrycia. Jednostka w pełni operacyjna, powracam do dalszego patrolu."
    AI: no
    </prompt_examples>
  `);

  const response = await openAIService.completion(
    messages.getAllMessages() as ChatCompletionMessageParam[],
    "gpt-4o"
  );

  return response.choices[0].message.content;
};

const processAllFiles = async () => {
  console.log("Processing files");
  // read all files in data folder using glob
  const allFiles = await glob(`${__dirname}/data/**.png`);

  console.log("Found", allFiles.length, "files");

  allFiles.forEach(async (filePath) => {
    console.log("Processing", filePath);
    await processFile(filePath);
  });
};

const main = async () => {
  const people: string[] = [];
  const hardware: string[] = [];
  const allProcessedFiles = await glob(`${__dirname}/processed/**.txt`);
  console.log("Found", allProcessedFiles.length, "processed files");

  await Promise.all(
    allProcessedFiles.map(async (filePath) => {
      const text = fs.readFileSync(filePath, "utf8");
      const result = await classifyText(text);
      // const result = await classifyPeople(text);
      // console.log({ filePath, result });
      const fileName = filePath.split("/").pop()?.split("|")[0];
      if (result === "people") {
        people.push(fileName!);
      } else if (result === "hardware") {
        hardware.push(fileName!);
      }
    })
  );

  // console.log("People", people.sort());
  // console.log("Hardware", hardware.sort());

  // "People field is incorrect - are you sure about 2024-11-12_report-17.png?"
  // "People field is incorrect - are you sure about 2024-11-12_report-16.png?"

  console.log({ people, hardware });

  const result = await sendResult(
    {
      people: people.sort(),
      hardware: hardware.sort(),
    },
    "kategorie"
  );

  console.log(result);
};

main();
