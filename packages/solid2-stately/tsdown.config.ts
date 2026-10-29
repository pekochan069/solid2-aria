import { readFile } from "node:fs/promises";
import path from "node:path";

import { defineConfig } from "tsdown";

const sourceDirectory = `${path.join(import.meta.dirname, "src")}${path.sep}`;

export default defineConfig({
  copy: [
    { from: "../../LICENSES", to: "dist" },
    { from: "../../NOTICE.txt", to: "dist" },
  ],
  dts: true,
  entry: ["src/**/*.ts", "!src/**/*.d.ts"],
  exports: true,
  format: "esm",
  outputOptions: {
    async postBanner(chunk) {
      const notices = await Promise.all(
        chunk.moduleIds
          .filter((id) => id.startsWith(sourceDirectory))
          .map(async (id) => {
            const source = await readFile(
              id.replace(/\.d\.ts$/u, ".ts"),
              "utf-8"
            );

            return (source.match(/\/\*[\s\S]*?\*\//gu) ?? [])
              .filter((comment) =>
                /Copyright|Derived from Adobe React Spectrum|@license/u.test(
                  comment
                )
              )
              .join("\n");
          })
      );

      return [...new Set(notices)].filter(Boolean).join("\n");
    },
  },
  platform: "neutral",
  sourcemap: true,
  unbundle: true,
});
