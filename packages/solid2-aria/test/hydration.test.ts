import { expect, test } from "bun:test";

for (const name of [
  "button",
  "dependencies",
  "description",
  "effect",
  "focus",
  "hover",
  "id",
  "slot",
  "ssr",
  "store",
]) {
  test(`${name} preserves the SSR element during hydration`, () => {
    const cwd = new URL("..", import.meta.url).pathname;

    const server = Bun.spawnSync({
      cmd: [
        process.execPath,
        "--preload",
        "./test/ssr-setup.ts",
        "--eval",
        `
          import {renderToString, ssrElement} from "@solidjs/web";
          import {cases} from "./test/fixtures/hydration";
          process.stdout.write(await renderToString(() => {
            cases[${JSON.stringify(name)}]();
            return ssrElement("output", {}, "Ready", true);
          }));
        `,
      ],
      cwd,
    });

    expect(server.exitCode, server.stderr.toString()).toBe(0);

    const client = Bun.spawnSync({
      cmd: [
        process.execPath,
        "--conditions=browser",
        "--conditions=development",
        "--preload",
        "./test/setup.ts",
        "--eval",
        `
          import assert from "node:assert/strict";
          import {getNextElement, hydrate} from "@solidjs/web";
          import {cases} from "./test/fixtures/hydration";
          const host = document.createElement("div");
          host.innerHTML = process.env.SOLID_SSR_HTML;
          document.body.append(host);
          const output = host.firstElementChild;
          assert.ok(output);
          globalThis._$HY = {completed: new WeakSet(), events: [], r: {}, s: {"": 1}};
          let hydrated;
          const dispose = hydrate(() => {
            cases[${JSON.stringify(name)}]();
            return hydrated = getNextElement();
          }, host);
          assert.equal(hydrated, output);
          dispose();
          host.remove();
        `,
      ],
      cwd,
      env: { ...process.env, SOLID_SSR_HTML: server.stdout.toString() },
    });

    expect(client.exitCode, client.stderr.toString()).toBe(0);
  });
}
