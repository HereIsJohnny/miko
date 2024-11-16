import Replicate from "replicate";
import { ImageProcessor } from "../../libs/ImageProcessor";
import { writeFileSync } from "fs";

const replicate = new Replicate({
  auth: Bun.env.REPLICATE_API_TOKEN,
});

const imageProcessor = new ImageProcessor();
const IMAGE_PATH = `${__dirname}/maps.JPG`;

const imageDetect = async (
  imageBase64: string,
  query: string,
  minConfidence = 0.4
) => {
  const output = (await replicate.run(
    "adirik/grounding-dino:efd10a8ddc57ea28773327e881ce95e20cc1d734c589f7dd01d2036921ed78aa",
    {
      input: {
        image: imageBase64,
        query,
        show_visualisation: true,
      },
    }
  )) as { detections: { bbox: number[]; label: string; confidence: number }[] };

  return output.detections.filter(
    (detection) => detection.confidence > minConfidence
  );
};

const main = async () => {
  const compressedImagePath = `${__dirname}/maps_compressed.png`;
  const { imageBase64 } = await imageProcessor.compressImage({
    imagePath: IMAGE_PATH,
    outputPath: compressedImagePath,
  });

  const fullBase64Path = imageProcessor.getFullBase64Path(imageBase64);

  const detections = await imageDetect(fullBase64Path, "old map", 0.4);

  await Promise.all(
    detections.map(async (detection, index) => {
      try {
        console.log({ bbox: detection.bbox });
        const outputPath = `${__dirname}/maps_cropped_${index}.png`;

        await imageProcessor.cropImage({
          imagePath: compressedImagePath,
          bbox: detection.bbox,
          outputPath,
        });
      } catch (error) {
        console.error(`Error cropping image ${index}:`, error);
      }
    })
  );
};

main();
