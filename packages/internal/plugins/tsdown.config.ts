import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["vite/*.ts"],
  format: "esm",
  outDir: "dist",
  platform: "neutral",
});
