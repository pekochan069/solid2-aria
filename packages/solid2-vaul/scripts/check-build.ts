import assert from "node:assert/strict";
import {
  cp,
  mkdir,
  mkdtemp,
  realpath,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import manifest from "../package.json" with { type: "json" };

const root = path.resolve(import.meta.dirname, "..");
const consumer = await mkdtemp(path.join(tmpdir(), "solid2-vaul-consumer-"));
const modules = path.join(consumer, "node_modules");
const installed = path.join(modules, manifest.name);

await mkdir(installed, { recursive: true });

await writeFile(path.join(consumer, "package.json"), '{"type":"module"}\n');

await Promise.all(
  ["package.json", ...manifest.files].map(async (file) => {
    await cp(path.join(root, file), path.join(installed, file), {
      recursive: true,
    });
  })
);

await Promise.all(
  ["solid-js", "@solidjs/web", "@solid2-aria/core", "happy-dom"].map(
    async (name) => {
      const target = path.join(modules, name);
      await mkdir(path.dirname(target), { recursive: true });
      await symlink(
        await realpath(path.join(root, "node_modules", name)),
        target
      );
    }
  )
);

await Promise.all(
  Object.values(manifest.exports["."]).map(async (file) => {
    const artifact = await Bun.file(path.join(installed, file)).text();
    assert.match(artifact, /Modified for Solid Aria:/u);
    assert.doesNotMatch(
      artifact,
      /react\/jsx-runtime|from ["']react["']|solid-js\/web/u
    );
  })
);

assert.match(
  await Bun.file(path.join(installed, manifest.exports["./style.css"])).text(),
  /\[data-vaul-drawer\]/u
);

assert.match(
  await Bun.file(path.join(installed, "VAUL-LICENSE")).text(),
  /Copyright \(c\) 2023 Emil Kowalski/u
);

await Promise.all(
  ["server.mjs", "browser.mjs", "shared.mjs"].map(async (file) => {
    await cp(
      path.join(root, "scripts/fixtures", file),
      path.join(consumer, file)
    );
  })
);

const executable = Bun.which("bun") ?? process.execPath;

for (const [fixture, flags] of [
  ["server.mjs", []],
  ["browser.mjs", ["--conditions=browser", "--conditions=development"]],
] as const) {
  const result = Bun.spawnSync(
    [executable, ...flags, path.join(consumer, fixture)],
    { cwd: consumer, stderr: "pipe", stdout: "pipe" }
  );

  assert.equal(
    result.exitCode,
    0,
    result.stdout.toString() + result.stderr.toString()
  );
  assert.doesNotMatch(result.stderr.toString(), /STRICT_|WRITE_/u);
  console.info(result.stdout.toString().trim());
}

await writeFile(
  path.join(consumer, "consumer.tsx"),
  `
import { Drawer } from '@solid2-aria/vaul';
import type { DialogProps, ContentProps, DrawerDirection, SnapPoint } from '@solid2-aria/vaul';
import { createSignal } from 'solid-js';
function App() {
  const [open, setOpen] = createSignal(false);
  const [snap, setSnap] = createSignal<SnapPoint | null>(0.25);
  const props: DialogProps = { snapPoints: [0.25, 0.5, 1], fadeFromIndex: 2 };
  const content: ContentProps = { onPointerDownOutside(event) { event.preventDefault(); }, onOpenAutoFocus(event) { event.preventDefault(); } };
  return <Drawer.Root {...props} open={open()} onOpenChange={value => { setOpen(value); }} activeSnapPoint={snap()} setActiveSnapPoint={value => { setSnap(value); }}>
    <Drawer.Trigger render={attributes => <button {...attributes}>Open</button>}/>
    <Drawer.Portal><Drawer.Overlay/><Drawer.Content {...content}><Drawer.Handle/><Drawer.Title>Title</Drawer.Title><Drawer.Description>Description</Drawer.Description><Drawer.Close>Close</Drawer.Close></Drawer.Content></Drawer.Portal>
  </Drawer.Root>;
}
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
  { cwd: consumer, stderr: "pipe", stdout: "pipe" }
);

assert.equal(
  types.exitCode,
  0,
  types.stdout.toString() + types.stderr.toString()
);

console.info(
  "Isolated package exports, CSS, licenses, and consumer types passed."
);
