import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dir, "../../..");

const upstream = path.resolve(
  process.argv[2] ??
    path.resolve(root, "../react-spectrum/packages/react-aria/src")
);

const target = path.resolve(import.meta.dir, "../src");
const failures: string[] = [];

async function readPort(destination: string): Promise<string> {
  try {
    return await readFile(path.resolve(target, destination), "utf-8");
  } catch (error) {
    if (
      !(error instanceof Error) ||
      !("code" in error) ||
      error.code !== "ENOENT"
    ) {
      throw error;
    }

    const alternate = destination.endsWith(".tsx")
      ? destination.slice(0, -1)
      : `${destination}x`;

    return await readFile(path.resolve(target, alternate), "utf-8");
  }
}

function filename(name: string): string {
  return name
    .replace(/^use/u, "create")
    .replaceAll(/(?<prefix>[A-Z]+)(?<word>[A-Z][a-z])/gu, "$<prefix>-$<word>")
    .replaceAll(
      /(?<prefix>[a-z0-9])(?<capital>[A-Z])/gu,
      "$<prefix>-$<capital>"
    )
    .toLowerCase();
}

const awaitedValue1188 = await readdir(upstream, {
  recursive: true,
  withFileTypes: true,
});

const removedCompatibilityModules = new Set([
  "utils/useLayoutEffect.ts",
  "utils/useEffectEvent.ts",
  "utils/useUpdateEffect.ts",
  "utils/useUpdateLayoutEffect.ts",
  "utils/useSyncRef.ts",
  "utils/useObjectRef.ts",
  "utils/useDeepMemo.ts",
  "utils/mergeRefs.ts",
  "ssr/SSRProvider.tsx",
]);

const entries = awaitedValue1188.filter(
  (entry) =>
    entry.isFile() &&
    /\.tsx?$/u.test(entry.name) &&
    !removedCompatibilityModules.has(
      path.relative(upstream, path.resolve(entry.parentPath, entry.name))
    )
);

await Promise.all(
  entries.map(async (entry) => {
    const sourcePath = path.resolve(entry.parentPath, entry.name);
    const relative = path.relative(upstream, sourcePath);
    const destination = path.join(path.dirname(relative), filename(entry.name));

    try {
      const [source, port] = await Promise.all([
        readFile(sourcePath, "utf-8"),
        readPort(destination),
      ]);

      const notice = /^\/\*[\s\S]*?\*\//u.exec(source)?.[0];

      if (notice !== undefined) {
        assert.ok(port.includes(notice), "upstream notice changed");
      }

      for (const attribution of source.matchAll(/^\/\/ Source:[^\n]*/gmu)) {
        assert.ok(
          port.includes(attribution[0]),
          "upstream source attribution changed"
        );
      }

      assert.ok(
        port.includes(
          `Derived from Adobe React Spectrum: packages/react-aria/src/${relative}.`
        ),
        "missing upstream provenance"
      );
      assert.ok(
        port.includes("Modified for Solid Aria:"),
        "missing modification notice"
      );
      assert.ok(
        port.includes("LICENSES/Apache-2.0.txt and NOTICE.txt"),
        "missing license references"
      );
      assert.doesNotMatch(
        port,
        /(?:from\s+|import\s*\(|require\s*\()\s*['"](?:react(?:-dom)?(?:\/[^'"]*)?|react-stately(?:\/[^'"]*)?|@react-(?:types|aria|stately)\/[^'"]*|use-sync-external-store[^'"]*)['"]/u,
        "React dependency remains"
      );
      assert.doesNotMatch(
        port,
        /\b(?:useState|useMemo|useEffect|useRef|useCallback|useLayoutEffect|useSyncExternalStore|useReducer|useImperativeHandle|useInsertionEffect)\s*[<(]/u,
        "React hook call remains"
      );
      assert.doesNotMatch(port, /@ts-nocheck/u, "TypeScript checking disabled");
    } catch (error) {
      failures.push(
        `${destination}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  })
);

const translations = path.resolve(import.meta.dir, "../intl");
const upstreamTranslations = path.resolve(upstream, "../intl");

const awaitedValue3416 = await readdir(upstreamTranslations, {
  recursive: true,
  withFileTypes: true,
});

const json = awaitedValue3416.filter(
  (entry) => entry.isFile() && entry.name.endsWith(".json")
);

await Promise.all(
  json.map(async (entry) => {
    const relative = path.relative(
      upstreamTranslations,
      path.resolve(entry.parentPath, entry.name)
    );

    try {
      const [source, port] = await Promise.all([
        readFile(path.resolve(upstreamTranslations, relative), "utf-8"),
        readFile(path.resolve(translations, relative), "utf-8"),
      ]);

      assert.deepEqual(
        JSON.parse(port),
        JSON.parse(source),
        "translation contents changed"
      );
    } catch (error) {
      failures.push(
        `intl/${relative}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  })
);

if (failures.length > 0) {
  console.error(failures.toSorted().join("\n"));
  throw new Error(
    `${failures.length} coverage failures across ${entries.length} source modules and ${json.length} translations`
  );
}

console.info(
  `Verified ${entries.length} upstream modules and ${json.length} translations: complete coverage, verbatim notices, provenance, and React dependency removal.`
);
