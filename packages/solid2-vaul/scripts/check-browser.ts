/* oxlint-disable eslint/no-await-in-loop -- Input events on one page must execute in order. */
import assert from "node:assert/strict";

import { chromium, expect } from "@playwright/test";
import { transform } from "@solidjs/compiler";

const build = await Bun.build({
  conditions: ["browser", "development"],
  entrypoints: ["scripts/fixtures/app.tsx"],
  plugins: [
    {
      name: "solid-2-browser-fixture",
      setup(builder) {
        builder.onLoad({ filter: /\.tsx$/u }, async ({ path }) => ({
          contents: transform(await Bun.file(path).text(), {
            dev: true,
            filename: path,
            generate: "dom",
          }).code,
          loader: "ts",
        }));
      },
    },
  ],
  target: "browser",
});

assert.ok(build.success, build.logs.map(String).join("\n"));

const bundle = await build.outputs[0]?.text();

assert.ok(bundle !== undefined && bundle.length > 0);

const css = await Bun.file("dist/style.css").text();

const server = Bun.serve({
  fetch(request) {
    const path = new URL(request.url).pathname;

    if (path === "/app.js") {
      return new Response(bundle, {
        headers: { "content-type": "text/javascript" },
      });
    }

    if (path === "/style.css") {
      return new Response(css, { headers: { "content-type": "text/css" } });
    }

    return new Response(
      `<!doctype html><html><head><link rel="stylesheet" href="/style.css"><style>
  body { margin: 0; font: 16px sans-serif; } button { padding: 10px; }
  .overlay { position: fixed; inset: 0; background: #0007; z-index: 10; }
  .drawer { position: fixed; box-sizing: border-box; padding: 24px; background: white; z-index: 11; }
  .drawer[data-vaul-drawer-direction=bottom] { bottom: 0; left: 0; right: 0; height: 360px; }
  .drawer[data-vaul-drawer-direction=top] { top: 0; left: 0; right: 0; height: 360px; }
  .drawer[data-vaul-drawer-direction=left] { top: 0; bottom: 0; left: 0; width: 320px; }
  .drawer[data-vaul-drawer-direction=right] { top: 0; bottom: 0; right: 0; width: 320px; }
  .nested-overlay { z-index: 12; } .drawer.nested { z-index: 13; }
  </style></head><body><main id="app"></main><script type="module" src="/app.js"></script></body></html>`,
      { headers: { "content-type": "text/html" } }
    );
  },
  port: 0,
});

const browser = await chromium.launch({ headless: true });
const errors: string[] = [];

try {
  const page = await browser.newPage({ viewport: { height: 800, width: 800 } });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "warning" || message.type() === "error") {
      errors.push(message.text());
    }
  });
  const url = `http://localhost:${server.port}`;

  for (const direction of ["bottom", "top", "left", "right"]) {
    await page.goto(`${url}/?direction=${direction}`);
    await page.locator("[data-trigger]").click();
    const dialog = page.getByRole("dialog", { name: "Drawer title" });
    await expect(dialog).toBeVisible();
    await expect(page.getByLabel("Name")).toBeFocused();
    await page.waitForTimeout(550);
    const box = await dialog.boundingBox();
    assert.ok(box);
    const x = direction === "left" ? box.x + box.width - 40 : box.x + 40;
    const y = direction === "top" ? box.y + box.height - 20 : box.y + 20;
    await page.mouse.move(x, y);
    await page.mouse.down();

    const dx =
      direction === "left" ? -170 : 170 * Number(direction === "right");

    const dy =
      direction === "top" ? -170 : 170 * Number(direction === "bottom");

    await page.mouse.move(x + dx, y + dy, { steps: 12 });
    await page.mouse.up();
    await expect(dialog).toHaveCount(0);
    await expect(page.locator("[data-trigger]")).toBeFocused();
    await page.locator("[data-trigger]").click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
  }

  await page.goto(`${url}/?scale`);
  await page.locator("[data-trigger]").click();
  await page.waitForTimeout(550);
  await page.locator("[data-nested-trigger]").click();
  await expect(
    page.getByRole("dialog", { name: "Nested title" })
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-child]")).toHaveCount(0);
  await expect(
    page.getByRole("dialog", { name: "Drawer title" })
  ).toBeVisible();
  await page.locator("[data-close]").focus();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Name")).toBeFocused();
  await page.locator("[data-close]").click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  assert.equal(
    await page
      .locator("[data-vaul-drawer-wrapper]")
      .evaluate((el) => el.style.transform),
    ""
  );
  assert.equal(
    await page.locator("html").evaluate((el) => el.style.overflow),
    ""
  );

  await page.goto(`${url}/?snaps`);
  await page.locator("[data-trigger]").click();
  await page.waitForTimeout(550);
  const snapDialog = page.getByRole("dialog");
  const snapBox = await snapDialog.boundingBox();
  assert.ok(snapBox);
  assert.ok(Math.abs(snapBox.y - 600) < 2);
  await page.locator("[data-vaul-handle]").click();
  await expect(page.locator("[data-snap]")).toHaveText("0.5");
  await page.waitForTimeout(550);
  const middleBox = await snapDialog.boundingBox();
  assert.ok(middleBox);
  assert.ok(Math.abs(middleBox.y - 400) < 2);
  await page
    .locator("[data-vaul-overlay]")
    .click({ position: { x: 20, y: 20 } });
  await expect(snapDialog).toHaveCount(0);

  await page.goto(`${url}/?nonmodal`);
  await page.locator("[data-trigger]").click();
  await expect(page.locator("[data-vaul-overlay]")).toHaveCount(0);
  await page.locator("[data-outside]").click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByLabel("Name").focus();
  const scroll = page.locator("[data-scroll]");
  await scroll.hover();
  await page.mouse.wheel(0, 200);
  await expect
    .poll(async () => {
      const top = await scroll.evaluate((el) => el.scrollTop);

      return top;
    })
    .toBeGreaterThan(0);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  const mobile = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { height: 800, width: 400 },
  });

  const touchPage = await mobile.newPage();
  touchPage.on("pageerror", (error) => {
    errors.push(error.message);
  });
  await touchPage.goto(`${url}/`);
  await touchPage.locator("[data-trigger]").tap();
  await touchPage.waitForTimeout(550);
  const session = await mobile.newCDPSession(touchPage);

  const swipe = async (
    x: number,
    startY: number,
    endY: number
  ): Promise<void> => {
    await session.send("Input.dispatchTouchEvent", {
      touchPoints: [{ x, y: startY }],
      type: "touchStart",
    });

    for (let step = 1; step <= 12; step += 1) {
      await session.send("Input.dispatchTouchEvent", {
        touchPoints: [{ x, y: startY + ((endY - startY) * step) / 12 }],
        type: "touchMove",
      });
    }

    await session.send("Input.dispatchTouchEvent", {
      touchPoints: [],
      type: "touchEnd",
    });
  };

  const touchScroll = touchPage.locator("[data-scroll]");
  const scrollBox = await touchScroll.boundingBox();
  assert.ok(scrollBox);
  await swipe(scrollBox.x + 40, scrollBox.y + 75, scrollBox.y + 10);
  await expect
    .poll(async () => {
      const top = await touchScroll.evaluate((el) => el.scrollTop);

      return top;
    })
    .toBeGreaterThan(0);
  await expect(touchPage.getByRole("dialog")).toBeVisible();
  await touchScroll.evaluate((el) => {
    el.scrollTop = 0;
  });
  await touchPage.waitForTimeout(200);
  const touchBox = await touchPage.getByRole("dialog").boundingBox();
  assert.ok(touchBox);
  await swipe(touchBox.x + 30, touchBox.y + 20, touchBox.y + 180);
  await expect(touchPage.getByRole("dialog")).toHaveCount(0);
  await mobile.close();
  assert.deepEqual(errors, []);
  console.info(
    "Chromium: four drag directions, reopening, focus containment/restoration, nested drawers, snaps, outside dismissal, non-modal interaction, scrolling, touch scrolling and swiping, and cleanup passed."
  );
} finally {
  await browser.close();
  await server.stop(true);
}
