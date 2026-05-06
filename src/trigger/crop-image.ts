import { task } from "@trigger.dev/sdk/v3";
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

const execFileAsync = promisify(execFile);

interface CropImagePayload {
  imageUrl: string;
  xPosition: number;
  yPosition: number;
  width: number;
  height: number;
}

export const cropImageTask = task({
  id: "crop-image",
  maxDuration: 120,
  run: async (payload: CropImagePayload): Promise<string> => {
    const { imageUrl, xPosition, yPosition, width, height } = payload;

    if (!imageUrl) {
      throw new Error("imageUrl is empty — the image field has no value. Make sure an image is uploaded before executing.");
    }

    const tempDir = await mkdtemp(join(tmpdir(), "crop-"));
    const inputPath = join(tempDir, "input.png");
    const outputPath = join(tempDir, "output.png");

    try {
      let buffer: Buffer;
      if (imageUrl.startsWith("data:")) {
        const matches = imageUrl.match(/^data:.+?;base64,(.+)$/);
        console.log("imageurl", imageUrl);
        if (!matches) throw new Error("Invalid base64 data URL");
        buffer = Buffer.from(matches[1], "base64");
      } else {
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch image (${response.status}). The URL may have expired — try re-uploading the image.`);
        }
        buffer = Buffer.from(await response.arrayBuffer());
      }
      await writeFile(inputPath, buffer);

      const cropFilter = `crop=iw*${width / 100}:ih*${height / 100}:iw*${xPosition / 100}:ih*${yPosition / 100}`;

      await execFileAsync("ffmpeg", [
        "-i", inputPath,
        "-vf", cropFilter,
        "-y",
        outputPath,
      ]);

      // MANDATORY: 30+ second artificial delay
      await new Promise((resolve) => setTimeout(resolve, 30000));

      const outputBuffer = await readFile(outputPath);
      return `data:image/png;base64,${outputBuffer.toString("base64")}`;
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  },
});
