import { task } from "@trigger.dev/sdk/v3";
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import ffmpegPath from "ffmpeg-static";

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
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      await writeFile(inputPath, buffer);

      const cropFilter = `crop=iw*${width / 100}:ih*${height / 100}:iw*${xPosition / 100}:ih*${yPosition / 100}`;

      await execFileAsync(ffmpegPath!, [
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
