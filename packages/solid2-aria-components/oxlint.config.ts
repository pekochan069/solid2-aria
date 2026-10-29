import { defineConfig } from "oxlint";

import root from "../../oxlint.config.ts";

export default defineConfig({
  extends: [root],
  rules: {
    // Layout delegates are instance methods required by their public interfaces.
    "eslint/class-methods-use-this": [
      "error",
      {
        ignoreClassesWithImplements: "public-fields",
        ignoreOverrideMethods: true,
      },
    ],
    // Related collection node classes retain their upstream module boundary.
    "eslint/complexity": ["error", { max: 20, variant: "modified" }],
    "eslint/max-classes-per-file": ["error", 7],
    "eslint/no-use-before-define": [
      "error",
      { classes: false, functions: false },
    ],
    // Public render-state documentation retains the upstream CSS selector tag.
    "jsdoc/check-tag-names": ["error", { definedTags: ["selector"] }],
  },
});
