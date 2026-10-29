import assert from "node:assert/strict";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { requireValue } from "@solid2-aria/core/utils/require-value";

import packageManifest from "../package.json" with { type: "json" };

const root = path.resolve(import.meta.dirname, "..");
const repository = path.resolve(root, "../..");

const workspacePackages = [
  { directory: "solid2-stately", name: "@solid2-aria/stately" },
  { directory: "solid2-aria", name: "@solid2-aria/core" },
  { directory: "solid2-aria-components", name: "@solid2-aria/components" },
];

const subpaths = Object.keys(packageManifest.exports).filter(
  (subpath) => subpath !== "." && subpath !== "./package.json"
);

await Promise.all(
  workspacePackages.map(async ({ name, directory }) => {
    const source = path.join(repository, "packages", directory, "src");
    const files = await readdir(source, { recursive: true });

    await Promise.all(
      files
        .filter((file) => file.endsWith(".d.ts"))
        .map(async (file) => {
          const stem = path.join(source, file.slice(0, -5));

          const implementations = await Promise.all([
            Bun.file(`${stem}.ts`).exists(),
            Bun.file(`${stem}.tsx`).exists(),
          ]);

          assert.ok(
            !implementations.some(Boolean),
            `${name}/src/${file}: build emitted a declaration beside its implementation`
          );
        })
    );
  })
);

const temporary = await mkdtemp(
  path.join(tmpdir(), "solid2-aria-components-consumer-")
);

const modules = path.join(temporary, "node_modules");

await mkdir(modules);

await writeFile(path.join(temporary, "package.json"), '{"type":"module"}\n');

await Promise.all(
  workspacePackages.map(async ({ name, directory }) => {
    const destination = path.join(modules, name);
    const source = path.join(repository, "packages", directory);
    await mkdir(destination, { recursive: true });
    await cp(path.join(source, "dist"), path.join(destination, "dist"), {
      recursive: true,
    });
    await cp(
      path.join(source, "package.json"),
      path.join(destination, "package.json")
    );
  })
);

await Promise.all(
  [
    "solid-js",
    "@solidjs/web",
    "@internationalized/date",
    "@internationalized/string",
    "@internationalized/number",
    "@solid2-aria/types-shared",
    "@solid2-aria/types-shared-web",
    "happy-dom",
    "aria-hidden",
    "clsx",
  ].map(async (name) => {
    const destination = path.join(modules, name);
    await mkdir(path.dirname(destination), { recursive: true });

    const candidates = await Promise.all(
      [
        root,
        path.join(repository, "packages/solid2-aria"),
        path.join(repository, "packages/solid2-stately"),
        repository,
      ].map(async (owner) => {
        let installed: string | undefined;

        try {
          installed = await realpath(path.join(owner, "node_modules", name));
        } catch (error) {
          if (
            !(error instanceof Error) ||
            !("code" in error) ||
            error.code !== "ENOENT"
          ) {
            throw error;
          }
        }

        return installed;
      })
    );

    const dependency = candidates.find((candidate) => candidate !== undefined);

    assert.ok(dependency !== undefined, `Missing installed dependency ${name}`);
    await symlink(dependency, destination);
  })
);

const artifacts = path.join(modules, "@solid2-aria/components/dist");

for (const [subpath, target] of Object.entries(packageManifest.exports)) {
  assert.doesNotMatch(
    subpath,
    /[A-Z]/u,
    `${subpath}: expected kebab-case export`
  );
  assert.ok(!subpath.startsWith("./exports/"), `${subpath}: redundant barrel`);

  if (subpath === "./package.json") {
    continue;
  }

  const name = subpath === "." ? "index" : subpath.slice(2);

  assert.deepEqual(
    target,
    {
      browser: `./dist/browser/${name}.js`,
      default: `./dist/server/${name}.js`,
      types: `./dist/browser/${name}.d.ts`,
    },
    `${subpath}: expected direct implementation export`
  );
}

const artifactFiles = await readdir(artifacts, { recursive: true });

await Promise.all(
  artifactFiles.map(async (file) => {
    if (!/\.(?:js|d\.ts)$/u.test(file)) {
      return;
    }

    const text = await readFile(path.join(artifacts, file), "utf-8");
    assert.doesNotMatch(
      text,
      /(?:from\s*|import\s*\()['"](?:react(?:\/|['"])|react-dom|react-aria|react-stately|@react-types|[^'"]*solid-(?:aria|stately)\/src\/)/u,
      `${file}: source-only or React import`
    );
    assert.doesNotMatch(
      text,
      /node_modules\/solid-(?:aria|stately)\/src/u,
      `${file}: nonportable declaration`
    );
  })
);

await readFile(path.join(artifacts, "NOTICE.txt"));

await readFile(path.join(artifacts, "LICENSES/Apache-2.0.txt"));

const server = path.join(temporary, "server.mjs");

await writeFile(
  server,
  `
import assert from 'node:assert/strict';
import {renderToString} from '@solidjs/web';
import {Button, TextField, Label, Input, Slider, SliderTrack, SliderThumb, ListBox, ListBoxItem} from '@solid2-aria/components';
for (const subpath of ${JSON.stringify(subpaths)}) await import('@solid2-aria/components/' + subpath.slice(2));
const {Button: SubpathButton} = await import('@solid2-aria/components/button');
const {CheckboxGroup: SubpathGroup} = await import('@solid2-aria/components/checkbox');
const {Label: SubpathLabel} = await import('@solid2-aria/components/label');
assert.equal(SubpathButton, Button); assert.equal(typeof SubpathGroup, 'function'); assert.equal(typeof SubpathLabel, 'function');
const html = await renderToString(() => Button({isDisabled: true, children: 'Save'}));
assert.match(html, /<button/); assert.match(html, /disabled/); assert.match(html, /Save/);
const field = await renderToString(() => TextField({defaultValue: 'Ada', get children() {return [Label({children: 'Name'}), Input({})];}}));
assert.match(field, /Ada/); assert.match(field, /Name/);
const slider = await renderToString(() => Slider({'aria-label': 'Volume', defaultValue: 30, get children() {return SliderTrack({get children() {return SliderThumb({});}});}}));
assert.match(slider, /type="range"/);
const list = await renderToString(() => ListBox({'aria-label': 'Choices', get children() {return [ListBoxItem({id: 'a', textValue: 'Alpha', children: 'Alpha'})];}}));
assert.match(list, /Alpha/); assert.match(list, /listbox/);
console.info('Server consumer rendered buttons, fields, and sliders.');
`
);

const browser = path.join(temporary, "browser.mjs");

await writeFile(
  browser,
  `
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
const window = new Window({url: 'https://consumer.test'});
for (const key of ${JSON.stringify(["window", "document", "navigator", "HTMLElement", "SVGElement", "Element", "Node", "Text", "Event", "CustomEvent", "InputEvent", "MouseEvent", "KeyboardEvent", "FocusEvent", "PointerEvent", "CSS", "DOMRect", "HTMLInputElement", "HTMLButtonElement", "HTMLSelectElement", "HTMLTextAreaElement", "HTMLFormElement", "HTMLAnchorElement", "HTMLOptionElement", "MutationObserver", "ResizeObserver", "NodeFilter", "ShadowRoot", "DocumentFragment", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame"])}) Object.defineProperty(globalThis, key, {value: window[key], configurable: true, writable: true});
const {render} = await import('@solidjs/web');
const {createSignal, flush} = await import('solid-js');
const {Button, DialogTrigger, Modal, Dialog} = await import('@solid2-aria/components');
for (const subpath of ${JSON.stringify(subpaths)}) await import('@solid2-aria/components/' + subpath.slice(2));
const [pending, setPending] = createSignal(false); let presses = 0;
const host = document.createElement('div'); document.body.append(host);
let dispose = render(() => Button({get isPending() {return pending();}, get children() {return pending() ? 'Saving' : 'Save';}, onPress() {presses++;}}), host); flush();
const button = host.querySelector('button'); button.click(); flush(); assert.equal(presses, 1);
setPending(true); flush(); assert.equal(host.querySelector('button'), button); assert.equal(button.textContent, 'Saving'); button.click(); flush(); assert.equal(presses, 1); dispose();
dispose = render(() => DialogTrigger({get children() {return [Button({children: 'Open'}), Modal({get children() {return Dialog({'aria-label': 'Details', children: 'Dialog body'});}})];}}), host); flush();
host.querySelector('button').click(); flush(); assert.ok(document.querySelector('[role="dialog"]')); dispose(); host.remove();
console.info('Browser consumer verified press, pending updates, DOM identity, and modal opening.');
`
);

for (const [filename, conditions] of [
  [server, []],
  [browser, ["--conditions=browser", "--conditions=development"]],
] as const) {
  const process = Bun.spawnSync(
    [
      Bun.which("bun") ?? requireValue(Bun.argv[0], "Expected Bun.argv[0]"),
      ...conditions,
      filename,
    ],
    { cwd: temporary, stderr: "pipe", stdout: "pipe" }
  );

  assert.equal(process.exitCode, 0, process.stderr.toString().slice(-12_000));
  console.info(process.stdout.toString().trim());
}

await writeFile(
  path.join(temporary, "consumer.ts"),
  `
import type {SliderProps, DatePickerProps, CollectionProps} from '@solid2-aria/components';
import type {ButtonProps} from '@solid2-aria/components/button';
import type {CheckboxGroupProps} from '@solid2-aria/components/checkbox';
import {createDragAndDrop} from '@solid2-aria/components/create-drag-and-drop';
import {composeRenderProps} from '@solid2-aria/components/utils';
import type {CalendarDate} from '@internationalized/date';
const button: ButtonProps = {onPress(event) {event.continuePropagation();}, children: state => state.isPending ? 'Saving' : 'Save'};
const slider: SliderProps<number[]> = {defaultValue: [10, 50]};
const picker: DatePickerProps<CalendarDate> = {'aria-label': 'Date'};
const collection: CollectionProps<{id: string}> = {items: [{id: 'a'}], children: item => item.id};
const checkboxGroup: CheckboxGroupProps = {'aria-label': 'Choices'};
void [button, slider, picker, collection, checkboxGroup, createDragAndDrop, composeRenderProps];
`
);

await writeFile(
  path.join(temporary, "tsconfig.json"),
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
    include: ["consumer.ts"],
  })
);

const types = Bun.spawnSync(
  [
    path.join(repository, "node_modules/.bin/tsrs"),
    "--noEmit",
    "-p",
    path.join(temporary, "tsconfig.json"),
  ],
  { cwd: temporary, stderr: "pipe", stdout: "pipe" }
);

assert.equal(
  types.exitCode,
  0,
  types.stdout.toString() + types.stderr.toString()
);

console.info("Isolated consumer declarations passed.");
