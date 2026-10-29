import assert from "node:assert/strict";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import manifest from "../package.json" with { type: "json" };

const root = path.resolve(import.meta.dirname, "..");
const consumer = await mkdtemp(path.join(tmpdir(), "solid2-sonner-consumer-"));
const modules = path.join(consumer, "node_modules");
const installedPackage = path.join(modules, manifest.name);

await mkdir(installedPackage, { recursive: true });

await writeFile(path.join(consumer, "package.json"), '{"type":"module"}\n');

// Copy only shipped files so source resolution cannot hide a broken export.
await Promise.all(
  ["package.json", ...manifest.files].map(async (file) => {
    await cp(path.join(root, file), path.join(installedPackage, file), {
      recursive: true,
    });
  })
);

await Promise.all(
  ["solid-js", "@solidjs/web", "happy-dom"].map(async (name) => {
    const target = path.join(modules, name);
    await mkdir(path.dirname(target), { recursive: true });
    await symlink(
      await realpath(path.join(root, "node_modules", name)),
      target
    );
  })
);

const css = await readFile(
  path.join(installedPackage, manifest.exports["./styles.css"]),
  "utf-8"
);

assert.match(css, /\[data-sonner-toaster\]/u);

assert.match(css, /Copyright \(c\) 2023 Emil Kowalski/u);

await Promise.all(
  Object.values(manifest.exports["."]).map(async (target) => {
    const artifact = await readFile(
      path.join(installedPackage, target),
      "utf-8"
    );

    assert.match(artifact, /Modified for Solid Aria:/u);
    assert.doesNotMatch(artifact, /react\/jsx-runtime|solid-js\/web/u);
  })
);

const executable = Bun.which("bun") ?? process.execPath;

await Promise.all(
  ["server.mjs", "browser.mjs"].map(async (fixture) => {
    await cp(
      path.join(root, "scripts/fixtures", fixture),
      path.join(consumer, fixture)
    );
  })
);

for (const [fixture, conditions] of [
  ["server.mjs", []],
  ["browser.mjs", ["--conditions=browser", "--conditions=development"]],
] as const) {
  const result = Bun.spawnSync(
    [executable, ...conditions, path.join(consumer, fixture)],
    {
      cwd: consumer,
      stderr: "pipe",
      stdout: "pipe",
    }
  );

  assert.equal(
    result.exitCode,
    0,
    result.stdout.toString() + result.stderr.toString()
  );
  console.info(result.stdout.toString().trim());
}

await writeFile(
  path.join(consumer, "consumer.tsx"),
  `
import {Toaster, toast, useSonner} from '@solid2-aria/sonner';
import type {ToasterProps, ExternalToast, PromiseData} from '@solid2-aria/sonner';
const props: ToasterProps = {theme: 'system', richColors: true, closeButton: true};
const options: ExternalToast = {id: 'saved', action: {label: 'Undo', onClick(event) {event.preventDefault();}}};
const promise: PromiseData<number> = {loading: 'Loading', success: value => ({message: String(value), description: 'Done'})};
function App() {const state = useSonner(); return <><Toaster {...props}/><span>{state.toasts().length}</span></>;}
toast.success('Saved', options);
toast.promise(Promise.resolve(42), promise)?.unwrap();
toast.custom(id => <button onClick={() => toast.dismiss(id)}>Close</button>);
void App;
`
);

await writeFile(
  path.join(consumer, "tsconfig.json"),
  JSON.stringify({
    compilerOptions: {
      jsx: "preserve",
      jsxImportSource: "@solidjs/web",
      lib: ["ESNext", "DOM", "DOM.Iterable"],
      module: "Preserve",
      moduleResolution: "Bundler",
      noEmit: true,
      skipLibCheck: true,
      strict: true,
      target: "ESNext",
      types: [],
    },
    include: ["consumer.tsx"],
  })
);

const types = Bun.spawnSync(
  [
    path.join(root, "node_modules/.bin/tsrs"),
    "--noEmit",
    "-p",
    path.join(consumer, "tsconfig.json"),
  ],
  {
    cwd: consumer,
    stderr: "pipe",
    stdout: "pipe",
  }
);

assert.equal(
  types.exitCode,
  0,
  types.stdout.toString() + types.stderr.toString()
);

console.info(
  "Isolated package exports, CSS, licenses, and consumer types passed."
);
