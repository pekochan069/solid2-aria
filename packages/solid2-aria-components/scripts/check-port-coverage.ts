import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { requireValue } from "@solid2-aria/core/utils/require-value";
import { transform } from "@solidjs/compiler";

Bun.plugin({
  name: "solid-coverage-jsx",
  setup(builder) {
    builder.onLoad({ filter: /\.tsx$/u }, async ({ path: filename }) => ({
      contents: transform(await Bun.file(filename).text(), {
        filename,
        generate: "ssr",
        hydratable: true,
      }).code,
      loader: "ts",
    }));
  },
});

const root = path.resolve(import.meta.dirname, "..");

const upstream = path.resolve(
  process.argv[2] ??
    path.join(root, "../../../react-spectrum/packages/react-aria-components")
);

const kebab = (name: string) =>
  name.replaceAll(/(?<lower>[a-z0-9])(?<upper>[A-Z])/gu, "$1-$2").toLowerCase();

const sourceFiles = await readdir(path.join(upstream, "src"));

const files = sourceFiles.filter((name) => /\.tsx?$/u.test(name));

await Promise.all(
  files.map(async (name) => {
    const source = await readFile(path.join(upstream, "src", name), "utf-8");
    const nativePath = name.replace(/^use(?=[A-Z])/u, "create");

    const target = await readFile(
      path.join(root, "src", kebab(nativePath)),
      "utf-8"
    );

    const notice = /^\/\*[\s\S]*?\*\//u.exec(source)?.[0];

    if (notice !== undefined && /Copyright/u.test(notice)) {
      assert.ok(target.includes(notice), `${name}: upstream notice changed`);
    }

    assert.ok(
      target.includes(
        `Derived from Adobe React Spectrum: packages/react-aria-components/src/${name}.`
      ),
      `${name}: missing provenance`
    );
    assert.ok(
      target.includes("Modified for Solid Aria:"),
      `${name}: missing modification notice`
    );
    assert.ok(
      target.includes("LICENSES/Apache-2.0.txt and NOTICE.txt"),
      `${name}: missing license references`
    );
    assert.doesNotMatch(
      target,
      /from\s+['"](?:react(?:\/[^'"]*)?|react-dom[^'"]*|react-aria[^'"]*|react-stately[^'"]*|@react-types[^'"]*|use-sync-external-store[^'"]*)['"]/u,
      `${name}: React dependency`
    );
    assert.doesNotMatch(
      target,
      /\b(?:useState|useEffect|useMemo|useRef|useLayoutEffect|useSyncExternalStore)\s*[(<]/u,
      `${name}: React hook`
    );
    assert.doesNotMatch(
      target,
      /\b(?:createState|createRef|createComputed|createCallback|createLayoutEffect|createExternalStore|createReducer|flushSync|liveObject|RefObject|MutableRefObject)\b/u,
      `${name}: React compatibility API`
    );
    assert.doesNotMatch(
      target,
      /from\s+['"]@solid2-aria\/core\/reactivity['"]|(?<!\.)\.current\b/u,
      `${name}: React compatibility dependency or object ref`
    );
  })
);

const translationFiles = await readdir(path.join(upstream, "intl"));

const translations = translationFiles.filter((name) => name.endsWith(".json"));

await Promise.all(
  translations.map(async (name) => {
    const upstreamTranslation: unknown = JSON.parse(
      await readFile(path.join(upstream, "intl", name), "utf-8")
    );

    const translation: unknown = JSON.parse(
      await readFile(path.join(root, "intl", name), "utf-8")
    );

    assert.deepEqual(
      translation,
      upstreamTranslation,
      `${name}: translation differs from upstream`
    );
  })
);

const source = await readFile(path.join(upstream, "exports/index.ts"), "utf-8");
const actual = await import("../src/index");
const missing: string[] = [];

function runtimeExports(barrel: string): string[] {
  const names: string[] = [];

  for (const match of barrel.matchAll(
    /export\s+(?<type>type\s+)?\{(?<body>[\s\S]*?)\}\s+from\s+['"][^'"]+['"]/gu
  )) {
    if (match[1] !== undefined) {
      continue;
    }

    for (const entry of requireValue(match[2], "Expected match[2]").split(
      ","
    )) {
      if (entry.trim().startsWith("type ")) {
        continue;
      }

      const name = entry
        .trim()
        .split(/\s+as\s+/u)
        .at(-1);

      if (name !== undefined && name.length > 0) {
        names.push(name);
      }
    }
  }

  return names;
}

for (const name of runtimeExports(source)) {
  const nativeName = name.replace(/^use(?=[A-Z])/u, "create");

  if (
    nativeName !== "Provider" &&
    nativeName !== "SSRProvider" &&
    !(nativeName in actual)
  ) {
    missing.push(nativeName);
  }
}

assert.deepEqual(missing, [], "Missing upstream runtime exports");

assert.deepEqual(
  Object.keys(actual).filter((name) => /^use[A-Z]/u.test(name)),
  [],
  "React hook compatibility exports"
);

console.info(
  `Verified ${files.length} source modules, original notices, ${translations.length} translations, and root runtime exports.`
);
