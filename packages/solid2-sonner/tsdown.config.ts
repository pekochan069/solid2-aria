import { solid } from "rolldown-plugin-solid-compiler";
import { defineConfig } from "tsdown";
import type { UserConfig } from "tsdown";

const notice = `/*!
 * Derived from solid-sonner (https://github.com/wobsoriano/solid-sonner), src/.
 * Copyright (c) 2022 Robert Soriano <https://github.com/wobsoriano>
 * Derived from Sonner (https://github.com/emilkowalski/sonner), src/.
 * Copyright (c) 2023 Emil Kowalski
 * Modified for Solid Aria: Solid 2 reactivity, rendering, lifecycle, and packaging.
 * MIT licensed. See LICENSE, SOLID-SONNER-LICENSE.md, SONNER-LICENSE.md, and NOTICE.txt in the package root.
 */`;

export default defineConfig(
  [false, true].map((server): UserConfig => ({
    banner: notice,
    clean: true,
    copy: server ? [] : [{ from: "src/styles.css", to: "dist" }],
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
