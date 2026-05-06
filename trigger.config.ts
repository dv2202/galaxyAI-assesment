import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  project: "proj_skzmzthtnevqlseddzdc",
  maxDuration: 300,
  dirs: ["src/trigger"],
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 1,
    },
  },
});
