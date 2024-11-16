import { glob } from "glob";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { OpenAIService } from "./OpenAIService";
import { ImageProcessor } from "../../libs/ImageProcessor";
import { sendResult } from "../../libs/centrala";

const openAIService = new OpenAIService();

const main = async () => {
  //   const mapPaths = await glob(`${__dirname}/maps/1.png`);
  //   const base64Images = await Promise.all(
  //     mapPaths.map((path) => pngToBase64(path))
  //   //   );
  //   const imageProcessor = new ImageProcessor();

  //   const { imageBase64 } = await imageProcessor.compressImage({
  //     imagePath: `${__dirname}/maps/1.png`,
  //   });

  //   const messages: ChatCompletionMessageParam[] = [
  //     {
  //       role: "system",
  //       content:
  //         "You are helpful assistant. Your role is to analyse maps and tell what city this is. List cross streets and landmarks. Based on that guess the name of the city. Or give me the list of the potential cities.",
  //     },
  //     {
  //       role: "user",
  //       content: [
  //         {
  //           type: "image_url",
  //           image_url: {
  //             url: `data:image/jpeg;base64,${imageBase64}`,
  //             detail: "high",
  //           },
  //         },
  //       ],
  //     },
  //   ];

  //   //   const tokenCount = await openAIService.calculateImageTokens(messages);
  //   const completion = await openAIService.completion(messages);
  //   console.log(completion.choices[0].message.content);

  sendResult(completion.choices[0].message.content, "02_02");

  //   for (const base64Image of base64Images) {
};

main();
