import { defineConfig } from "@trigger.dev/sdk/v3";
import { ffmpeg } from "@trigger.dev/build/extensions/core";
import { prismaExtension } from "@trigger.dev/build/extensions/prisma";

export default defineConfig({
  project: "proj_skzmzthtnevqlseddzdc",
  maxDuration: 300,
  dirs: ["src/trigger"],
  build: {
    extensions: [
      ffmpeg(),
      prismaExtension({
        mode: "legacy",
        schema: "prisma/schema.prisma",
      }),
    ],
  },
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 1,
    },
  },
});
