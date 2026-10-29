import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
  ...ultracite,
  ignorePatterns: ["./apps/docs/content", "**/*.mdx", "**/routeTree.gen.ts"],
});
