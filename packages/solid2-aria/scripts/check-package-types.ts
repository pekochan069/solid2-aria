import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");
const directory = await mkdtemp(path.join(tmpdir(), "solid2-aria-consumer-"));

try {
  await mkdir(path.join(directory, "node_modules/@solid2-aria"), {
    recursive: true,
  });
  await symlink(
    root,
    path.join(directory, "node_modules/@solid2-aria/core"),
    "dir"
  );
  await Promise.all(
    ["types-shared", "types-shared-web"].map(async (name) => {
      await symlink(
        path.join(root, "node_modules/@solid2-aria", name),
        path.join(directory, "node_modules/@solid2-aria", name),
        "dir"
      );
    })
  );

  await writeFile(path.join(directory, "package.json"), '{"type":"module"}\n');
  await writeFile(
    path.join(directory, "index.ts"),
    `
import {createButton, createPress, createFocusManager, FocusScope, I18nProvider} from "@solid2-aria/core";
import type {AriaButtonProps, MenuTriggerAria} from "@solid2-aria/core";
import {createOverlayPosition} from "@solid2-aria/core/overlays/create-overlay-position";
import type {PressEvents} from "@solid2-aria/types-shared";
import type {StyleProps} from "@solid2-aria/types-shared-web";
const props: AriaButtonProps = {"aria-label": "Submit"};
const element = document.createElement("button");
const ref = () => element;
const button = createButton(props, ref);
const press = createPress({onPress(event) {event.pointerType;}});
createFocusManager()?.focusNext();
export {button, press, FocusScope, I18nProvider, createOverlayPosition};
export type {MenuTriggerAria, PressEvents, StyleProps};
`
  );
  await Promise.all(
    [
      ["Preserve", "Bundler"],
      ["NodeNext", "NodeNext"],
    ].map(async ([module, moduleResolution]) => {
      const config = path.join(directory, `tsconfig-${moduleResolution}.json`);

      await writeFile(
        config,
        JSON.stringify({
          compilerOptions: {
            lib: ["ESNext", "DOM", "DOM.Iterable"],
            module,
            moduleResolution,
            noEmit: true,
            skipLibCheck: false,
            strict: true,
            target: "ESNext",
          },
          files: ["index.ts"],
        })
      );

      const result = Bun.spawn(["bun", "x", "tsrs", "-p", config], {
        cwd: root,
        stderr: "inherit",
        stdout: "inherit",
      });

      assert.equal(
        await result.exited,
        0,
        `Built package declarations failed ${moduleResolution} consumer compilation`
      );
      console.info(
        `Compiled package declarations with ${moduleResolution} resolution.`
      );
    })
  );
} finally {
  await rm(directory, { force: true, recursive: true });
}
