import { readFile } from "node:fs/promises";
import path from "node:path";

import { transform } from "@solidjs/compiler";
import { defineConfig } from "tsdown";
import type { UserConfig } from "tsdown";

interface BundledExportConditions {
  types: string;
  browser: string;
  default: string;
}

const sourceDirectory = `${path.join(import.meta.dirname, "src")}${path.sep}`;

export default defineConfig(
  [false, true].map((server): UserConfig => ({
    clean: true,
    copy: server
      ? []
      : [
          { from: "../../LICENSES", to: "dist" },
          { from: "../../NOTICE.txt", to: "dist" },
        ],
    dts: server ? false : { tsconfig: "tsconfig.build.json" },
    entry: ["src/**/*.ts", "src/**/*.tsx"],
    exports: server
      ? false
      : {
          customExports(exports) {
            return Object.fromEntries(
              Object.keys(exports).map(
                (key): [string, string | BundledExportConditions] => {
                  if (key === "./package.json") {
                    return [key, "./package.json"];
                  }

                  const name = key === "." ? "index" : key.slice(2);

                  return [
                    key,
                    // oxlint-disable-next-line eslint/sort-keys -- Conditional exports must resolve declaration types before runtime targets.
                    {
                      types: `./dist/browser/${name}.d.ts`,
                      browser: `./dist/browser/${name}.js`,
                      default: `./dist/server/${name}.js`,
                    },
                  ];
                }
              )
            );
          },
        },
    format: "esm",
    outDir: server ? "dist/server" : "dist/browser",
    outputOptions: {
      async postBanner(chunk) {
        const notices = await Promise.all(
          chunk.moduleIds
            .filter((id) => id.startsWith(sourceDirectory))
            .map(async (id) => {
              const sourcePath = id.replace(/\.d\.ts$/u, ".ts");
              let source: string;

              try {
                source = await readFile(sourcePath, "utf-8");
              } catch (error) {
                if (
                  !(error instanceof Error) ||
                  !("code" in error) ||
                  error.code !== "ENOENT"
                ) {
                  throw error;
                }

                source = await readFile(`${sourcePath}x`, "utf-8");
              }

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
    plugins: [
      {
        name: "solid-jsx",
        transform: {
          filter: { id: /\.tsx$/u },
          handler(code, id) {
            const result = transform(code, {
              filename: id,
              generate: server ? "ssr" : "dom",
              hydratable: true,
              sourceMap: true,
            });

            return { code: result.code, map: result.map ?? null };
          },
          order: "pre",
        },
      },
    ],
    sourcemap: true,
    unbundle: true,
  }))
);
