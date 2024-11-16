import { path } from "path";
import { readFileSync } from "fs";
import sharp from "sharp";

export interface ResizedImageMetadata {
  width: number;
  height: number;
}

export class ImageProcessor {
  constructor() {}

  async compressImage({
    imagePath,
    width = 2048,
    height = 2048,
    outputPath,
  }: {
    imagePath: string;
    width?: number;
    height?: number;
    outputPath?: string;
  }): Promise<{ imageBase64: string; metadata: ResizedImageMetadata }> {
    try {
      const imageBuffer = readFileSync(imagePath);
      const resizedImageBuffer = await sharp(imageBuffer)
        .resize(width, height, { fit: "inside" })
        .png({ compressionLevel: 9 })
        .toBuffer();

      if (outputPath) {
        await sharp(resizedImageBuffer).toFile(outputPath);
      }

      const imageBase64 = resizedImageBuffer.toString("base64");
      const metadata = await sharp(resizedImageBuffer).metadata();

      return {
        imageBase64,
        metadata: { width: metadata.width ?? 0, height: metadata.height ?? 0 },
      };
    } catch (error) {
      console.error("Image processing failed:", error);
      throw error;
    }
  }

  async cropImage({
    imagePath,
    bbox,
    outputPath,
  }: {
    imagePath: string;
    bbox: number[];
    outputPath: string;
  }) {
    sharp(imagePath)
      .extract({
        left: bbox[0],
        top: bbox[1],
        width: bbox[2],
        height: bbox[3],
      })
      .toFile(outputPath);
  }

  getFullBase64Path(base64: string) {
    return `data:image/png;base64,${base64}`;
  }
}
