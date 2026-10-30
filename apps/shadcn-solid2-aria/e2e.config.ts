import { web } from "@e2e-dev/web";
import type { E2EConfig } from "e2e";
import { chatgpt } from "e2e/oauth/chatgpt";

export default {
  // Your ChatGPT subscription serves the model; sign in once with `e2e login openai`, `e2e models openai` lists the ids.
  agents: {
    default: {
      model: chatgpt("gpt-6.1-terra"),
      system: "You are a thorough QA agent. Verify every outcome.",
    },
  },
  targets: [
    {
      app: {
        url: process.env.APP_URL ?? "http://localhost:5500",
      },
      engine: web(),
    },
  ],
} satisfies E2EConfig;
