import assert from "node:assert/strict";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";

interface Manifest {
  name: string;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  exports?: object;
}

// oxlint-disable-next-line anti-slop/no-unsafe-dictionary-type -- JSON fields are unknown until manifest validation below.
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDependencyMap(
  value: unknown
): value is Record<string, string> | undefined {
  return (
    value === undefined ||
    (isRecord(value) &&
      Object.values(value).every((entry) => typeof entry === "string"))
  );
}

function isManifest(value: unknown): value is Manifest {
  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    isDependencyMap(value.dependencies) &&
    isDependencyMap(value.peerDependencies) &&
    (value.exports === undefined || isRecord(value.exports))
  );
}

const root = path.resolve(import.meta.dir, "../../..");
const packageRoot = path.resolve(import.meta.dir, "..");
const fixture = await mkdtemp(path.join(tmpdir(), "solid2-stately-neutral-"));
const copied = new Set<string>();

async function copyPackage(source: string): Promise<Manifest> {
  const manifest: unknown = JSON.parse(
    await readFile(path.join(source, "package.json"), "utf-8")
  );

  assert.ok(isManifest(manifest), `Invalid package manifest in ${source}`);
  assert.ok(
    !["@solidjs/web", "@solid2-aria/types-shared-web"].includes(manifest.name),
    `${manifest.name} is required by the production dependency graph`
  );

  if (copied.has(manifest.name)) {
    return manifest;
  }

  copied.add(manifest.name);
  const destination = path.join(fixture, "node_modules", manifest.name);
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, destination, {
    dereference: true,
    filter: (file) => !["node_modules", ".git"].includes(path.basename(file)),
    recursive: true,
  });
  const require = createRequire(path.join(source, "package.json"));
  await Promise.all(
    Object.keys({ ...manifest.dependencies, ...manifest.peerDependencies }).map(
      async (name) => {
        const dependency = await realpath(
          path.dirname(require.resolve(`${name}/package.json`))
        );

        await copyPackage(dependency);
      }
    )
  );

  return manifest;
}

try {
  const manifest = await copyPackage(packageRoot);
  await writeFile(
    path.join(fixture, "package.json"),
    JSON.stringify({ type: "module" })
  );

  const imports = Object.keys(manifest.exports ?? {})
    .filter((key) => key !== "./package.json")
    .map(
      (key, index) =>
        `import type * as Module${index} from "${key === "." ? "@solid2-aria/stately" : `@solid2-aria/stately/${key.slice(2)}`}";`
    );

  await writeFile(
    path.join(fixture, "types.ts"),
    `${imports.join("\n")}

import { Item } from "@solid2-aria/stately";
const nativeView = { kind: "native-view" };
const child: import("solid-js").Element = nativeView;
Item({ key: "native", children: child, textValue: "Native view" });
`
  );
  await writeFile(
    path.join(fixture, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        lib: ["ESNext", "DOM", "DOM.Iterable"],
        module: "Preserve",
        moduleResolution: "bundler",
        noEmit: true,
        skipLibCheck: false,
        strict: true,
        target: "ESNext",
        types: [],
      },
      files: ["types.ts"],
    })
  );

  const types = Bun.spawnSync(
    [path.join(root, "node_modules/.bin/tsc"), "-p", fixture],
    { cwd: fixture, stderr: "inherit", stdout: "inherit" }
  );

  assert.equal(
    types.exitCode,
    0,
    "Published declarations must resolve without a web renderer"
  );
  await writeFile(
    path.join(fixture, "runtime.ts"),
    `
import assert from "node:assert/strict";
import { createRoot, flush } from "solid-js";
import { createToggleState, createListState, Item } from "@solid2-aria/stately";
createRoot(dispose => {
  const state = createToggleState({});
  assert.equal(state.isSelected, false);
  state.toggle();
  flush();
  assert.equal(state.isSelected, true);
  const child = { kind: "native-view" };
  const list = createListState({ children: Item({ key: "native", children: child, textValue: "Native view" }) });
  assert.equal(list.collection.getItem("native")?.rendered, child);
  dispose();
});
`
  );

  const runtime = Bun.spawnSync(
    [
      process.execPath,
      "--conditions=browser",
      "--conditions=development",
      "runtime.ts",
    ],
    {
      cwd: fixture,
      env: { ...process.env, NODE_PATH: "" },
      stderr: "inherit",
      stdout: "inherit",
    }
  );

  assert.equal(runtime.exitCode, 0, "State must run without a web renderer");
  console.log(
    `Checked all ${imports.length} entry points and runtime state without @solidjs/web (${copied.size} production packages).`
  );
} finally {
  await rm(fixture, { force: true, recursive: true });
}
