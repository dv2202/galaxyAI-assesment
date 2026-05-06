import { task } from "@trigger.dev/sdk/v3";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface GeminiPayload {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  imageUrls?: string[];
}

type InlineDataPart = { inlineData: { mimeType: string; data: string } };

async function urlToInlineData(
  url: string,
  fallbackMime: string
): Promise<InlineDataPart | null> {
  if (url.startsWith("data:")) {
    const matches = url.match(/^data:(.+?);base64,(.+)$/);
    if (matches) {
      return { inlineData: { mimeType: matches[1], data: matches[2] } };
    }
    return null;
  }
  try {
    const response = await fetch(url);
    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get("content-type") || fallbackMime;
    return {
      inlineData: { mimeType: contentType, data: buffer.toString("base64") },
    };
  } catch {
    return null;
  }
}

export const geminiGenerateTask = task({
  id: "gemini-generate",
  maxDuration: 60,
  run: async (payload: GeminiPayload): Promise<string> => {
    const { prompt, systemPrompt, model, imageUrls } = payload;

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_AI_API_KEY not configured");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({
      model: model || "gemini-2.5-pro",
      systemInstruction: systemPrompt || undefined,
    });

    const parts: Array<
      { text: string } | InlineDataPart
    > = [];

    parts.push({ text: prompt });

    const mediaEntries: [string[] | undefined, string][] = [
      [imageUrls, "image/png"],
    ];

    for (const [urls, fallbackMime] of mediaEntries) {
      if (!urls) continue;
      for (const url of urls) {
        const part = await urlToInlineData(url, fallbackMime);
        if (part) parts.push(part);
      }
    }

    const result = await geminiModel.generateContent(parts);
    const response = result.response;
    return response.text();
  },
});
