import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");
const packages = path.join(root, "packages");

const entries = await readdir(packages, {
  recursive: true,
  withFileTypes: true,
});

const files = entries.filter((entry) => {
  const relative = path.relative(
    packages,
    path.join(entry.parentPath, entry.name)
  );

  return (
    entry.isFile() &&
    !relative
      .split(path.sep)
      .some((part) => ["dist", "node_modules", ".turbo"].includes(part))
  );
});

const removed = [
  "createState",
  "createRef",
  "createComputed",
  "createCallback",
  "createCaptureProps",
  "onDoubleClick",
  "KeyboardCaptureProps",
  "createLayoutEffect",
  "createExternalStore",
  "createReducer",
  "flushSync",
  "liveObject",
  "RefObject",
  "MutableRefObject",
  "ReactNode",
  "ReactElement",
  "ForwardedRef",
  "SyntheticEvent",
  "SSRProvider",
  "SSRProviderProps",
  "createSSRSafeId",
  "createIsSSR",
];

const compatibilityNames = new RegExp(`\\b(?:${removed.join("|")})\\b`, "u");

const removedImports =
  /(?:from\s*|import\s*\()["'][^"']*(?:\/reactivity|\/(?:create-(?:object-ref|sync-ref|layout-effect|effect-event|update-effect|update-layout-effect|deep-memo|capture-props)|merge-refs|ssr-provider))["']/u;

const failures: string[] = [];
let checkedSources = 0;

await Promise.all(
  files.map(async (entry) => {
    const file = path.join(entry.parentPath, entry.name);
    const relative = path.relative(root, file);
    const source = await readFile(file, "utf-8");

    if (entry.name === "package.json") {
      const manifest: unknown = JSON.parse(source);
      assert.ok(manifest !== null && typeof manifest === "object");

      if (
        /"\.\/(?:reactivity|ssr\/ssr-provider|utils\/(?:create-(?:object-ref|sync-ref|layout-effect|effect-event|update-effect|update-layout-effect|deep-memo|capture-props)|merge-refs))"/u.test(
          source
        )
      ) {
        failures.push(
          `${relative}: removed compatibility entrypoint is published`
        );
      }
    }

    if (
      !/\.[cm]?[jt]sx?$/u.test(entry.name) ||
      !/(?:^|\/)(?:src|test)\//u.test(relative)
    ) {
      return;
    }

    checkedSources += 1;

    // Preserve string contents while removing comments, including upstream notices.
    const code = source.replaceAll(
      /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\/\/[^\n]*|\/\*[\s\S]*?\*\//gu,
      (token) => (token.startsWith("//") || token.startsWith("/*") ? "" : token)
    );

    const compatibility = compatibilityNames.exec(code);

    if (compatibility) {
      failures.push(
        `${relative}: removed compatibility API ${compatibility[0]}`
      );
    }

    if (
      /\bon(?!GotPointerCapture\b|LostPointerCapture\b)[A-Z]\w*Capture\s*(?:\??:|\()/u.test(
        code
      )
    ) {
      failures.push(`${relative}: unsupported React-style capture event prop`);
    }

    if (removedImports.test(code)) {
      failures.push(`${relative}: imports a removed compatibility module`);
    }

    if (/\bimport\s+type\s+\*\s+as\s+React\b/u.test(code)) {
      failures.push(`${relative}: React namespace compatibility type import`);
    }

    if (
      /export\s*(?:\{[^}]*\bas\s+use[A-Z]|(?:const|function)\s+use[A-Z](?!ontext\b))/u.test(
        code
      )
    ) {
      failures.push(`${relative}: exported React-style hook alias`);
    }
  })
);

assert.equal(failures.length, 0, failures.toSorted().join("\n"));

console.log(
  `Checked ${files.length} package files and ${checkedSources} source/test modules: native Solid APIs only.`
);
