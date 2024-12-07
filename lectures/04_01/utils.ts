import { sendResult } from "../../libs/centrala";
import { OpenAIService } from "../../libs/OpenAIService";

const baseURL = "https://centrala.ag3nts.org/dane/barbara/";

const openaiService = new OpenAIService();

export const getActionsForImage = async (imageName: string) => {
  const absoluteImageURL = mapImageNameToAbsoluteURL(imageName);
  console.log("Analysing image:", absoluteImageURL);

  const imageBase64 = await fetchImageAndToBase64(imageName);

  const response = await openaiService.completion(
    [
      {
        role: "system",
        content: `
            You need to analyse image and return action this should be done to the image.
            Return only one action from the list: REPAIR, DARKEN, BRIGHTEN, OK.

            REPAIR - if image is damaged and has glitches
            DARKEN - if image is too bright
            BRIGHTEN - if image is too dark
            OK - if image is clear and fine

            <format>
            {
                "action": "REPAIR"
            }
            </format>
        `,
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`,
            },
          },
        ],
      },
    ],
    "gpt-4o"
  );

  const content = response.choices[0].message.content;
  const jsonString = content.replace(/```json\n|\n```/g, "");
  const result = JSON.parse(jsonString);
  return result.action;
};

export const isWomanOnThePicture = async (imageName: string) => {
  const absoluteImageURL = mapImageNameToAbsoluteURL(imageName);
  console.log("Is woman on the image:", absoluteImageURL);
  const imageBase64 = await fetchImageAndToBase64(imageName);

  const response = await openaiService.completion(
    [
      {
        role: "system",
        content: `
            Jeśli na zdjęciu znajduje się kobieta jest to Barbara. Opisz dokladnie jej wyglad Barbary. Opisz wszystko co znajduje sie na zdjeciu i jej cechy szczegolne. Opis rozpocznij od "Barbara ma...". Skup się na znakach szczególnych

            Jeśli na zdjęciu nie ma kobiety, zwróć FALSE.
        `,
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`,
            },
          },
        ],
      },
    ],
    "gpt-4o"
  );

  const content = response.choices[0].message.content;
  return content === "FALSE" ? false : content;
};

export const talkWith = async (task: string) => {
  const response = await sendResult(task, "photos");

  return response.message;
};

export const mapImageNameToAbsoluteURL = (imageName: string) => {
  return `${baseURL}${imageName.replace(".", "-small.")}`;
};

export const extractImages = async (message: string) => {
  const systemPrompt = `
    You need to analyse message and return list of the images in the message. Return only names of the images not the full path. Return correct JSON format.

    Example 1:
    Message: "Siemano! Powiedzieli Ci, że mam fotki. No mam! Oto one: IMG_559.PNG, IMG_1410.PNG, IMG_1443.PNG, IMG_1444.PNG. Wszystkie siedzą sobie tutaj: https://centrala.ag3nts.org/dane/barbara/. Pamiętaj, że zawsze mogę poprawić je dla Ciebie (polecenia: REPAIR/DARKEN/BRIGHTEN)."

    <format>
    {
        "images": ["IMG_559.PNG", "IMG_1410.PNG", "IMG_1443.PNG", "IMG_1444.PNG"]
    }
    </format>

    Example 2:
    Message: "Się robi! Czekaj... czekaj... o! Usunąłem uszkodzenia. Proszę: IMG_559_FGR4.PNG"

    <format>
    {
        "images": ["IMG_559_FGR4.PNG"]
    }
    </format>
    `;

  const response = await openaiService.completion([
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content: message,
    },
  ]);

  const result = JSON.parse(response.choices[0].message.content);

  return result.images;
};

export const fetchImageAndToBase64 = async (imageName: string) => {
  const absoluteImageURL = mapImageNameToAbsoluteURL(imageName);
  const response = await fetch(absoluteImageURL);
  const arrayBuffer = await response.arrayBuffer();
  const base64Image = Buffer.from(arrayBuffer).toString("base64");
  return base64Image;
};
