import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
  ...ultracite,
  // Keep the upstream license text verbatim.
  ignorePatterns: ["SONNER-LICENSE.md", "SOLID-SONNER-LICENSE.md"],
});
