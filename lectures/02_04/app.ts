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
      Analyse user input and classify it contains informations about:
      - people (information about people or traces of presence of people. there must be mention of name or surname)
      - hardware (information about hardware problems or malfunctions, problems with equipment)
      - other (other information)

      There are 3 categories: people, hardware, other.
     
      Never classify software bugs or issues as a hardware issue. Never classify text without person name as a people.

      Response only with the category name. 

      Examples:
      - "Przebieg patroli nocnych na poziomie ściśle monitorowanym. Czujniki pozostają aktywne, a wytyczne dotyczące wykrywania życia organicznego – bez rezultatów. Stan patrolu bez zakłóceń." - other
      - "Godzina 00:11. Czujniki dźwięku wykryły ultradźwiękowy sygnał, pochodzenie: nadajnik ukryty w zielonych krzakach, nieopodal lasu. Przeprowadzono analizę obiektu. Analiza odcisków palców wskazuje osobę o imieniu Barbara Zawadzka, skorelowano z bazą urodzeń. Nadajnik przekazany do działu śledczego. Obszar zabezpieczony, patrol zakończony bez dalszych incydentów." - people
      - "Godzina 22:43. Wykryto jednostkę organiczną w pobliżu północnego skrzydła fabryki. Osobnik przedstawił się jako Aleksander Ragowski. Przeprowadzono skan biometryczny, zgodność z bazą danych potwierdzona. Jednostka przekazana do działu kontroli. Patrol kontynuowany." - people
      - Godzina 03:45. Patrol na peryferiach zachodnich zakończony. Czujniki nie wykazały żadnych niepokojących sygnałów. Obszar bez anomalii, kończę bieżący cykl i przechodzę do kolejnego sektora. - other
      - W czujniku ruchu wykryto usterkę spowodowaną zwarciem kabli. - hardware

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
      const fileName = filePath.split("/").pop()?.split("|")[0];
      if (result === "people") {
        console.log("People", fileName);
        people.push(fileName!);
      } else if (result === "hardware") {
        hardware.push(fileName!);
      }
    })
  );

  console.log("People", people.sort());
  console.log("Hardware", hardware.sort());

  // "People field is incorrect - are you sure about 2024-11-12_report-17.png?"
  // "People field is incorrect - are you sure about 2024-11-12_report-16.png?"

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
