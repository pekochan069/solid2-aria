import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dir, "../../..");

const upstream = path.resolve(
  process.argv[2] ??
    path.resolve(root, "../react-spectrum/packages/react-stately/src")
);

const target = path.resolve(import.meta.dir, "../src");

function fileName(name: string): string {
  return name
    .replace(/^use/u, "create")
    .replaceAll(/(?<lower>[a-z0-9])(?<upper>[A-Z])/gu, "$<lower>-$<upper>")
    .toLowerCase();
}

const allEntries = await readdir(upstream, {
  recursive: true,
  withFileTypes: true,
});

const entries = allEntries.filter(
  (entry) => entry.isFile() && entry.name.endsWith(".ts")
);

await Promise.all(
  entries.map(async (entry) => {
    const sourcePath = path.resolve(entry.parentPath, entry.name);
    const sourceRelative = path.relative(upstream, sourcePath);

    const destination =
      sourceRelative === "utils/useControlledState.ts"
        ? "utils/create-controlled-signal.ts"
        : path.relative(
            upstream,
            path.resolve(entry.parentPath, fileName(entry.name))
          );

    const [source, port] = await Promise.all([
      readFile(sourcePath, "utf-8"),
      readFile(path.resolve(target, destination), "utf-8"),
    ]);

    const notice = /^\/\*[\s\S]*?\*\//u.exec(source)?.[0];

    if (notice !== undefined) {
      assert.ok(
        port.includes(notice),
        `${destination}: upstream license notice changed`
      );
    }

    assert.ok(
      port.includes(
        `Derived from Adobe React Spectrum: packages/react-stately/src/${sourceRelative}.`
      ),
      `${destination}: missing provenance`
    );
    assert.ok(
      port.includes("Modified for Solid Aria:"),
      `${destination}: missing modification notice`
    );
    assert.ok(
      port.includes("LICENSES/Apache-2.0.txt and NOTICE.txt"),
      `${destination}: missing license references`
    );
    assert.doesNotMatch(
      port,
      /\/\* oxlint-disable [^\n]*typescript\/no-deprecated/u,
      `${destination}: use narrow compatibility-boundary directives instead of suppressing deprecations for the whole file`
    );
    assert.doesNotMatch(
      port,
      /from\s+['"](?:react(?:\/[^'"]*)?|@react-(?:types|stately)\/[^'"]*|use-sync-external-store[^'"]*)['"]/u,
      `${destination}: React dependency remains`
    );
    assert.doesNotMatch(
      port,
      /\b(?:useState|useMemo|useEffect|useRef|useCallback|useLayoutEffect|useSyncExternalStore)\s*[<(]/u,
      `${destination}: React hook remains`
    );
  })
);

console.info(
  `Verified ${entries.length} upstream modules: Solid counterparts, attribution, and React dependency removal.`
);
