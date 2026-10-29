import solidv2 from "eslint-plugin-solid/configs/v2-strict";
import { defineConfig } from "oxlint";
import type { OxlintConfig } from "oxlint";
import antiSlop from "ultracite/oxlint/anti-slop";
import core from "ultracite/oxlint/core";

const config: OxlintConfig = defineConfig({
  env: core.env,
  extends: [core, antiSlop],
  ignorePatterns: core.ignorePatterns,
  jsPlugins: ["eslint-plugin-solid", "eslint-plugin-de-morgan"],
  options: { typeAware: true },
  overrides: [
    {
      files: ["packages/solid2-aria/**/*.ts", "packages/solid2-aria/**/*.tsx"],
      // Accessibility algorithms follow the same switch-case branch limit as @solid2-aria/stately.
      rules: {
        // Preserve instance APIs required by declared interfaces and subclass overrides.
        "eslint/class-methods-use-this": [
          "error",
          {
            ignoreClassesWithImplements: "public-fields",
            ignoreOverrideMethods: true,
          },
        ],
        "eslint/complexity": ["error", { max: 20, variant: "modified" }],
        // Collection node kinds and their immutable container form one public module.
        "eslint/max-classes-per-file": ["error", 7],
        "eslint/no-use-before-define": [
          "error",
          { classes: false, functions: false },
        ],
        // ARIA ID references are dynamic values, resolved by the native ID API.
        "unicorn/prefer-query-selector": [
          "error",
          { allowWithVariables: true },
        ],
      },
    },
    {
      files: [
        "packages/@solid2-aria/**/*.d.ts",
        "packages/solid2-aria-types/**/*.d.ts",
      ],
      // Preserve upstream API variance, augmentable interfaces, and open generic contracts.
      rules: {
        "eslint/max-classes-per-file": "off",
        "eslint/no-warning-comments": "off",
        "typescript/ban-types": "off",
        "typescript/method-signature-style": "off",
        "typescript/no-empty-interface": "off",
        "typescript/no-empty-object-type": "off",
        "typescript/no-explicit-any": "off",
      },
    },
    {
      files: ["apps/docs/src/components/ui/*.tsx"],
      // File route names are router identifiers; component functions are hoisted.
      rules: {
        "eslint/sort-keys": "off",
        "sort-keys": "off",
      },
    },
    {
      files: [
        "apps/docs/src/routes/**/*.tsx",
        "apps/shadcn-solid2-aria/src/routes/**/*.tsx",
      ],
      // File route names are router identifiers; component functions are hoisted.
      rules: {
        "eslint/no-use-before-define": ["error", { functions: false }],
        "typescript/only-throw-error": "off",
        "unicorn/filename-case": "off",
      },
    },
  ],
  rules: {
    "anti-slop/no-runtime-typeof": "off",
    "eslint/no-use-before-define": ["error", { functions: false }],
    "func-style": "off",
    "oxc/no-barrel-file": "off",
    "typescript/no-misused-spread": "off",
    ...solidv2.rules,

    "de-morgan/no-negated-conjunction": "error",
    "de-morgan/no-negated-disjunction": "error",
    "solid/reactivity": [
      "warn",
      {
        customReactiveFunctions: [
          "addGlobalListener",
          "chain",
          "dynamicComponent",
          "filterDOMProps",
          "getSyntheticLink",
          "mergeProps",
          "reduce",
          "spread",
          "toSorted",
          "x",
          "y",
          "y0",
          "y1",
          "/^set[A-Z]/",
        ],
      },
    ],
  },
  settings: solidv2.settings,
});

export default config;
