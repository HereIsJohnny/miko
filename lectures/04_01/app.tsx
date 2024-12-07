import { sendResult } from "../../libs/centrala";
import { extractImages, getActionsForImage, isWomanOnThePicture } from "./utils";
import { talkWith } from "./utils";



const okImage = async (imageName: string) => {
    console.log('!!!! RESULT !!!!', imageName);
}

const processImage = async (imageName: string) => {
    const action = await getActionsForImage(imageName);

    if (action === 'OK') {
        const womanDescription = await isWomanOnThePicture(imageName);
        console.log('!!!! WOMAN DESCRIPTION !!!!', womanDescription);
        if (womanDescription) {
            console.log('!!!! WOMAN !!!!', womanDescription);
            const flag = await sendResult(womanDescription, "photos");
            console.log('!!!! FLAG !!!!', flag);
        } else {
            console.log('!!!! NO WOMAN !!!!');
        }
    }

    const message = await talkWith(`${action} ${imageName}`);
    const images = await extractImages(message);

    processImage(images[0]);
}

const main = async () => {
    const firstMessage = await talkWith("START");

    const images = await extractImages(firstMessage);

    images.forEach(processImage);

}

main();

function mapImageNameToAbsoluteURL(imageName: string) {
    throw new Error("Function not implemented.");
}
function fetchImageAndToBase64(imageName: string) {
    throw new Error("Function not implemented.");
}

