import { defineConfig } from "@trigger.dev/sdk/v3";
import { ffmpeg } from "@trigger.dev/build/extensions/core";

export default defineConfig({
  project: "proj_skzmzthtnevqlseddzdc",
  maxDuration: 300,
  dirs: ["src/trigger"],
  build: {
    extensions: [ffmpeg()],
  },
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 1,
    },
  },
});
