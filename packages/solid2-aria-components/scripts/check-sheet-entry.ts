/* oxlint-disable no-await-in-loop -- Browser actions must complete before the next interaction. */
import assert from "node:assert/strict";
import { mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { chromium } from "@playwright/test";
import { transform } from "@solidjs/compiler";
import { createServer } from "vite";

interface SheetFrame {
  entering: boolean;
  focused: boolean;
  right: number;
  scrollLeft: number;
  scrollTop: number;
  top: number;
}

declare global {
  interface Window {
    sheetFrames: SheetFrame[];
  }
}

// Run after building core, stately, and components: bun scripts/check-sheet-entry.ts
const repo = path.resolve(import.meta.dirname, "../../..");

const root = await mkdtemp(path.join(tmpdir(), "solid2-sheet-entry-"));

await writeFile(
  path.join(root, "index.html"),
  `<!doctype html>
<html lang="en"><meta charset="utf-8"><title>Sheet entry regression</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; }
  .overlay { position: fixed; inset: 0; }
  .sheet { flex-shrink: 0; background: white; }
  .bottom { width: 100%; height: 280px; }
  .left { width: 320px; height: 100%; }
  .content { padding: 32px; }
</style>
<div id="app"></div><script type="module" src="/fixture.tsx"></script></html>`
);

await writeFile(
  path.join(root, "fixture.tsx"),
  `
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { SheetOverlay, Sheet, SheetContent } from "@solid2-aria/components/sheet";

function App() {
  const position = new URLSearchParams(location.search).get("position") === "left" ? "left" : "bottom";
  const [open, setOpen] = createSignal(true);
  return <>
    <button onClick={() => setOpen(true)}>Open sheet</button>
    <SheetOverlay isOpen={open()} onOpenChange={setOpen} position={position} class="overlay">
      <Sheet class={["sheet", position]}>
        <SheetContent aria-label="Entry regression" class="content">
          <p>Native scrolling brings the sheet into view.</p>
          <button onClick={() => setOpen(false)}>Close sheet</button>
        </SheetContent>
      </Sheet>
    </SheetOverlay>
  </>;
}
render(() => <App />, document.getElementById("app"));
`
);

const components = path.join(
  repo,
  "packages/solid2-aria-components/dist/browser"
);

const core = path.join(repo, "packages/solid2-aria/dist/browser");
const stately = path.join(repo, "packages/solid2-stately/dist");

const solid = await realpath(
  path.join(repo, "packages/solid2-aria-components/node_modules/solid-js")
);

const web = await realpath(
  path.join(repo, "packages/solid2-aria-components/node_modules/@solidjs/web")
);

const server = await createServer({
  configFile: false,
  logLevel: "error",
  optimizeDeps: { include: [], noDiscovery: true },
  plugins: [
    {
      enforce: "pre",
      name: "solid-sheet-fixture",
      transform(source: string, id: string) {
        if (id.endsWith("/fixture.tsx")) {
          return transform(source, {
            dev: true,
            filename: id,
            generate: "dom",
            hydratable: true,
          });
        }

        return null;
      },
    },
  ],
  resolve: {
    alias: [
      {
        find: /^@solid2-aria\/components\/(?<path>.+)$/u,
        replacement: `${components}/$1.js`,
      },
      {
        find: /^@solid2-aria\/core\/(?<path>.+)$/u,
        replacement: `${core}/$1.js`,
      },
      {
        find: /^@solid2-aria\/stately\/(?<path>.+)$/u,
        replacement: `${stately}/$1.js`,
      },
      { find: /^solid-js$/u, replacement: `${solid}/dist/solid.dev.js` },
      {
        find: /^solid-js\/internal$/u,
        replacement: `${solid}/dist/internal.js`,
      },
      { find: /^@solidjs\/web$/u, replacement: `${web}/dist/web.dev.js` },
    ],
  },
  root,
  server: { fs: { allow: [repo, root] }, host: "127.0.0.1", port: 0 },
});

const errors: string[] = [];
const failures: string[] = [];
let browser;

try {
  await server.listen();
  browser = await chromium.launch({ headless: true });
  const [baseUrl] = server.resolvedUrls?.local ?? [];
  assert.ok(baseUrl !== undefined, "Missing fixture URL");

  for (const position of ["bottom", "left"]) {
    for (const reducedMotion of ["no-preference", "reduce"] satisfies (
      | "no-preference"
      | "reduce"
    )[]) {
      const label = `${position}, ${reducedMotion}`;

      const page = await browser.newPage({
        reducedMotion,
        viewport: { height: 800, width: 1000 },
      });

      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error" || message.type() === "warning") {
          errors.push(message.text());
        }
      });
      await page.addInitScript(() => {
        window.sheetFrames = [];

        const sample = () => {
          const scroller = document.querySelector<HTMLElement>(
            "[data-sheet-scroll]"
          );

          const content = document.querySelector<HTMLElement>(
            "[data-sheet-content]"
          );

          const overlay = document.querySelector<HTMLElement>(".overlay");

          if (scroller && content && overlay) {
            const rect = content.getBoundingClientRect();
            window.sheetFrames.push({
              entering: Object.hasOwn(overlay.dataset, "entering"),
              focused: content.contains(document.activeElement),
              right: rect.right,
              scrollLeft: scroller.scrollLeft,
              scrollTop: scroller.scrollTop,
              top: rect.top,
            });
          }

          requestAnimationFrame(sample);
        };

        requestAnimationFrame(sample);
      });

      try {
        await page.goto(`${baseUrl}?position=${position}`);

        for (const opening of ["initial", "reopened"]) {
          if (opening === "reopened") {
            await page.evaluate(() => {
              window.sheetFrames = [];
            });
            await page
              .getByRole("button", { exact: true, name: "Open sheet" })
              .click();
          }

          await page.waitForFunction(
            () => {
              const overlay = document.querySelector<HTMLElement>(".overlay");

              const content = document.querySelector<HTMLElement>(
                "[data-sheet-content]"
              );

              return (
                overlay &&
                !Object.hasOwn(overlay.dataset, "entering") &&
                content?.contains(document.activeElement)
              );
            },
            undefined,
            { timeout: 3000 }
          );

          const state = await page
            .locator("[data-sheet-scroll]")
            .evaluate((scroller) => {
              const content = scroller.querySelector("[data-sheet-content]");

              if (!content || !(scroller instanceof HTMLElement)) {
                throw new Error("Missing sheet content");
              }

              const rect = content.getBoundingClientRect();

              return {
                bottom: rect.bottom,
                frames: window.sheetFrames,
                left: rect.left,
                right: rect.right,
                scrollLeft: scroller.scrollLeft,
                scrollTop: scroller.scrollTop,
                snap: scroller.style.scrollSnapType,
                top: rect.top,
              };
            });

          assert.ok(
            state.top >= -1 &&
              state.left >= -1 &&
              state.bottom <= 801 &&
              state.right <= 1001,
            `${opening}: content outside viewport: ${JSON.stringify(state)}`
          );
          assert.equal(
            state.snap,
            position === "left" ? "x mandatory" : "y mandatory"
          );
          assert.equal(
            position === "left" ? state.scrollLeft : state.scrollTop,
            position === "left" ? 0 : 800
          );

          if (reducedMotion === "no-preference") {
            assert.ok(
              state.frames.some((frame) => frame.entering && !frame.focused),
              `${opening}: focus not deferred`
            );
            assert.ok(
              state.frames.some(
                (frame) =>
                  frame.entering &&
                  (position === "left"
                    ? frame.right > 2 && frame.right < state.right - 2
                    : frame.top > state.top + 2 && frame.top < 799)
              ),
              `${opening}: no native intermediate scroll geometry`
            );
          }

          await page.keyboard.press("Escape");
          await page
            .getByRole("dialog", { name: "Entry regression" })
            .waitFor({ state: "detached", timeout: 3000 });
        }

        console.info(`PASS sheet entry, focus, Escape, and reopen: ${label}`);
      } catch (error) {
        failures.push(
          `${label}: ${error instanceof Error ? error.message : String(error)}`
        );
      } finally {
        await page.close();
      }
    }
  }

  assert.deepEqual(errors, [], "Browser console errors or warnings");
  assert.deepEqual(failures, [], "Sheet browser regressions");
} finally {
  await browser?.close();
  await server.close();
  await rm(root, { force: true, recursive: true });
}
