import { OpenAIService } from "./../02_01/OpenAIService";
import { OpenAIService } from "../../libs/OpenAIService";
import { MessagesService } from "../../libs/MessagesService";
import fs from "fs";
import { sendResult } from "../../libs/centrala";

const apiKey = Bun.env["API_KEY"];
const urlTemplate = Bun.env["02_02_URL"];

if (!apiKey || !urlTemplate) {
  throw new Error("API_KEY or 02_02_URL is not set");
}

const url = urlTemplate.replace("KLUCZ-API", apiKey);

const main = async () => {
  //   console.log("starting main", { url });
  //   const response = await fetch(url);
  //   const { description } = await response.json();

  const openAIService = new OpenAIService();
  //   const messagesService = new MessageService(`
  //     You are helpful assistant. Print characteristics of the robot user has described.
  //     Example:
  //     <user>I saw robot ... coming to me on big wheels, it was red and yellow. I was scared but i saw it having camera on the top.</user>
  //     <assistant>
  //         robot,red and yellow, big wheels, camera on the top.
  //     </assistant>
  //   `);

  //   messagesService.addUserMessage(description);

  //   const completion = await openAIService.completion(
  //     messagesService.getAllMessages()
  //   );

  //   console.log({ description });

  //   console.log(completion.choices[0].message.content);

  //   const imageUrl = await openAIService.generateImage(
  //     completion.choices[0].message.content
  //   );

  const imageUrl = await openAIService.generateImage(
    "zdjecie wysokiej jakosci, profesjonalny fotograf. krzew o nazwie pięknotka budinera w ogrodzie."
  );

  console.log({ imageUrl });

  // save image to file
  //   const imageResponse = await fetch(imageUrl);
  //   const imageBuffer = await imageResponse.arrayBuffer();
  //   fs.writeFileSync("image.png", Buffer.from(imageBuffer));

  //   const flag = await sendResult(imageUrl, "robotid");

  //   console.log({ flag });
};

main();
