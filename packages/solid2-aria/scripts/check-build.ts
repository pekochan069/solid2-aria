import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import type * as SourceLibrary from "../src/index";
import { noop } from "../src/utils/noop";
import { isTruthy } from "../src/utils/truthy";

const root = path.resolve(import.meta.dirname, "..");
const browser = process.argv.includes("--browser");
const directory = path.join(root, "dist", browser ? "browser" : "server");

type Library = typeof SourceLibrary;

type BuiltLibrary = Pick<Library, "createButton" | "VisuallyHidden">;

const awaitedValue510 = await readdir(directory, {
  recursive: true,
  withFileTypes: true,
});

const entries = awaitedValue510.filter(
  (entry) => entry.isFile() && entry.name.endsWith(".js")
);

const failures: string[] = [];

await Promise.all(
  entries.map(async (entry) => {
    const filename = path.resolve(entry.parentPath, entry.name);

    try {
      await import(pathToFileURL(filename).href);
    } catch (error) {
      failures.push(
        `${path.relative(directory, filename)}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  })
);

const manifest: unknown = JSON.parse(
  await readFile(path.join(root, "package.json"), "utf-8")
);

assert.ok(isManifest(manifest));

await Promise.all(
  Object.entries(manifest.exports).map(async ([name, value]) => {
    if (typeof value === "string") {
      const file = await stat(path.resolve(root, value));
      assert.ok(file.isFile(), `${name}: missing export file`);

      return;
    }

    assert.ok(value !== null && typeof value === "object");
    assert.equal(
      Object.keys(value)[0],
      "types",
      `${name}: types condition must precede runtime conditions`
    );
    await Promise.all(
      Object.values(value).map(async (target) => {
        assert.equal(typeof target, "string");

        if (typeof target === "string") {
          const file = await stat(path.resolve(root, target));
          assert.ok(file.isFile(), `${name}: missing ${target}`);
        }
      })
    );
  })
);

const notice = await stat(path.join(root, "dist/NOTICE.txt"));
const license = await stat(path.join(root, "dist/LICENSES/Apache-2.0.txt"));

assert.ok(notice.isFile());

assert.ok(license.isFile());

if (failures.length) {
  throw new Error(
    `${failures.length} built entry imports failed:\n${failures.join("\n")}`
  );
}

const library: unknown = await import(
  pathToFileURL(path.join(directory, "index.js")).href
);

assert.ok(isBuiltLibrary(library));

const packageName = "@solid2-aria/core";
const publicEntry: unknown = await import(packageName);

assert.ok(isBuiltLibrary(publicEntry));

assert.equal(
  publicEntry.createButton,
  library.createButton,
  "Package conditions resolved the wrong renderer entry"
);

const buttonSubpath = "@solid2-aria/core/button/create-button";
const publicButton: unknown = await import(buttonSubpath);

assert.ok(isButtonEntry(publicButton));

assert.equal(
  publicButton.createButton,
  library.createButton,
  "Package subpath resolved the wrong renderer entry"
);

const web = await import("@solidjs/web");

if (browser) {
  const { createRoot, createSignal, flush } = await import("solid-js");
  const host = document.createElement("div");
  document.body.append(host);

  const dispose = web.render(
    () => library.VisuallyHidden({ children: "Built browser content" }),
    host
  );

  flush();
  assert.equal(host.textContent, "Built browser content");
  assert.ok(
    isTruthy(
      host.firstElementChild
        ?.getAttribute("style")
        ?.includes("position: absolute")
    )
  );
  dispose();
  assert.equal(host.childNodes.length, 0);
  host.remove();

  let disposeRoot = noop;

  const result = createRoot((disposeValue) => {
    disposeRoot = disposeValue;
    const [disabled, setDisabled] = createSignal(false);

    const aria = library.createButton(
      {
        get isDisabled() {
          return disabled();
        },
      },
      () => document.createElement("button")
    );

    return { aria, setDisabled };
  });

  assert.equal(result.aria.buttonProps.disabled, false);
  result.setDisabled(true);
  flush();
  assert.equal(result.aria.buttonProps.disabled, true);
  disposeRoot();
  const presses: string[] = [];
  const pressHost = document.createElement("div");
  document.body.append(pressHost);

  const disposePress = web.render(() => {
    const button = document.createElement("button");
    button.textContent = "Press";

    const aria = library.createButton(
      {
        onPress: (event) => {
          presses.push(event.pointerType);
        },
      },
      () => button
    );

    web.spread(button, () => aria.buttonProps);

    return button;
  }, pressHost);

  flush();
  const button = pressHost.querySelector("button");
  assert.ok(button);
  button.dispatchEvent(
    new PointerEvent("pointerdown", {
      bubbles: true,
      button: 0,
      pointerId: 1,
      pointerType: "mouse",
    })
  );
  button.dispatchEvent(
    new PointerEvent("pointerup", {
      bubbles: true,
      button: 0,
      pointerId: 1,
      pointerType: "mouse",
    })
  );
  button.dispatchEvent(
    new MouseEvent("click", { bubbles: true, button: 0, detail: 1 })
  );
  assert.deepEqual(
    presses,
    ["mouse"],
    "Pointer activation must fire onPress once"
  );
  button.dispatchEvent(
    new KeyboardEvent("keydown", { bubbles: true, key: "Enter" })
  );
  button.dispatchEvent(
    new KeyboardEvent("keyup", { bubbles: true, key: "Enter" })
  );
  assert.deepEqual(
    presses,
    ["mouse", "keyboard"],
    "Keyboard activation must fire onPress once"
  );
  disposePress();
  pressHost.remove();
} else {
  const html = web.renderToString(() =>
    library.VisuallyHidden({ children: "Built server content" })
  );

  assert.match(html, /Built server content/u);
  assert.match(html, /position:absolute/u);
}

console.info(
  `Imported ${entries.length} ${browser ? "browser" : "server"} modules, rendered built components, and verified all package export targets and bundled notices.`
);

function isButtonEntry(value: unknown): value is Pick<Library, "createButton"> {
  return (
    typeof value === "object" &&
    value !== null &&
    "createButton" in value &&
    typeof value.createButton === "function"
  );
}

function isBuiltLibrary(value: unknown): value is BuiltLibrary {
  return (
    isButtonEntry(value) &&
    "VisuallyHidden" in value &&
    typeof value.VisuallyHidden === "function"
  );
}

interface ExportConditions {
  [condition: string]: string;
}

interface PackageExports {
  [entry: string]: string | ExportConditions;
}

interface PackageManifest {
  exports: PackageExports;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isExportConditions(value: unknown): value is ExportConditions {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.values(value).every(isString)
  );
}

function isPackageExports(value: unknown): value is PackageExports {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const exportValues: readonly unknown[] = Object.values(value);

  return exportValues.every(
    (entry) => typeof entry === "string" || isExportConditions(entry)
  );
}

function isManifest(value: unknown): value is PackageManifest {
  return (
    value !== null &&
    typeof value === "object" &&
    "exports" in value &&
    isPackageExports(value.exports)
  );
}
