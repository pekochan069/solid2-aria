import { solid } from "rolldown-plugin-solid-compiler";
import { defineConfig } from "tsdown";
import type { UserConfig } from "tsdown";

const notice = `/*!
 * Derived from Vaul (https://github.com/emilkowalski/vaul), src/.
 * Copyright (c) 2023 Emil Kowalski
 * Modified for Solid Aria: native Solid 2 rendering, state, events, and lifecycle.
 * MIT licensed. See LICENSE, VAUL-LICENSE, and NOTICE.txt in the package root.
 */`;

export default defineConfig(
  [false, true].map((server): UserConfig => ({
    banner: notice,
    clean: true,
    copy: server ? [] : [{ from: "src/style.css", to: "dist" }],
    dts: server
      ? false
      : {
          generator: "tsgo",
          tsconfig: "tsconfig.build.json",
          tsgo: { moduleUrl: import.meta.resolve("typescript") },
        },
    entry: ["src/index.ts"],
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
