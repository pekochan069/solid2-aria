import { solid } from "rolldown-plugin-solid-compiler";
import { defineConfig } from "tsdown";
import type { UserConfig } from "tsdown";

const notice = `/*!
 * Copyright (c) 2026-present Tanner Linsley
 * Derived from TanStack/charts (https://github.com/TanStack/charts): packages/solid-charts/src/{Chart.tsx,types.ts}.
 * Modified for Solid Aria: Solid 2 reactivity, renderer imports, lifecycle, and browser/server packaging.
 * MIT licensed. See LICENSE, TANSTACK-LICENSE, and NOTICE.txt in the package root.
 */`;

export default defineConfig(
  [false, true].map((server): UserConfig => ({
    banner: notice,
    clean: true,
    dts: server
      ? false
      : {
          generator: "tsgo",
          tsconfig: "tsconfig.build.json",
          tsgo: { moduleUrl: import.meta.resolve("typescript") },
        },
    entry: ["src/index.tsx"],
    exports: false,
    format: "esm",
    outDir: server ? "dist/server" : "dist/browser",
    platform: "neutral",
    plugins: [
      solid({
        jsx: {
          generate: server ? "ssr" : "dom",
          hydratable: true,
        },
      }),
    ],
    sourcemap: true,
  }))
);
