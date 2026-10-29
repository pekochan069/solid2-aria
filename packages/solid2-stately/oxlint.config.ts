import { defineConfig } from "oxlint";

import root from "../../oxlint.config.ts";

export default defineConfig({
  extends: [root],
  rules: {
    // Subclass hooks and existing public instance helpers keep their library API shape.
    "eslint/class-methods-use-this": [
      "error",
      {
        exceptMethods: [
          "captureBeforeLayout",
          "isStickyColumn",
          "recombineColumns",
          "shouldInvalidate",
          "shouldInvalidateLayoutOptions",
          "splitColumnsIntoControlledAndUncontrolled",
          "tokenize",
          "update",
        ],
        ignoreOverrideMethods: true,
      },
    ],
    // Disjoint state/segment cases are one decision; retain the branch limit within algorithms.
    "eslint/complexity": ["error", { max: 20, variant: "modified" }],
    // Related library values (token ranges and reusable views) form one public module.
    "eslint/max-classes-per-file": ["error", 3],
    // Factories use hoisted functions and deferred references between related classes.
    // Variable declaration order remains checked.
    "eslint/no-use-before-define": [
      "error",
      { classes: false, functions: false },
    ],
  },
});
