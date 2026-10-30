import assert from "node:assert/strict";

import { test } from "@e2e-dev/web";
import { expect } from "e2e";

test("typeset renders its font controls on the server", async ({ app }) => {
  const response = await fetch(new URL("/typeset", app.baseUrl));
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /<body/u);
  assert.match(html, /aria-label="Heading"/u);
  assert.match(html, /aria-label="Body"/u);
  assert.match(html, /aria-label="Mono"/u);
  assert.match(html, /Building an Accessible Solid 2 Interface/u);
});

test("typeset applies font choices and restores them after reloading", async ({
  app,
  browser,
  screen,
}) => {
  await browser.goto(new URL("/typeset", app.baseUrl).href, {
    waitUntil: "networkidle",
  });

  const heading = screen.getByRole("button", "Heading", { exact: true });
  const body = screen.getByRole("button", "Body", { exact: true });
  const mono = screen.getByRole("button", "Mono", { exact: true });

  await expect(heading).toContainText("Geist");
  await expect(body).toContainText("Geist");
  await expect(mono).toContainText("Geist Mono");
  await body.tap();
  await expect(screen.getByRole("menuitemradio")).toHaveText([
    "Geist",
    "Inter",
    "System Sans",
    "Georgia",
    "Geist Mono",
  ]);
  await screen.getByRole("menuitemradio", "Georgia", { exact: true }).tap();
  await browser.keyboard.press("Escape");
  await expect
    .poll(
      async () =>
        await browser.evaluate(() => {
          const title = document.querySelector(".typeset-fixture h1");

          return title ? getComputedStyle(title).fontFamily : "";
        })
    )
    .toContain("Georgia");
  await expect(heading).toContainText("Georgia");
  await heading.tap();
  await screen.getByRole("menuitemradio", "Geist Mono", { exact: true }).tap();
  await browser.keyboard.press("Escape");
  await mono.tap();
  await screen.getByRole("menuitemradio", "System Sans", { exact: true }).tap();
  await browser.keyboard.press("Escape");
  await screen.getByRole("button", "Size", { exact: true }).tap();
  await screen.getByRole("menuitemradio", "18px", { exact: true }).tap();
  await browser.keyboard.press("Escape");
  await screen.getByRole("button", "Leading", { exact: true }).tap();
  await screen.getByRole("menuitemradio", "Loose (1.9)", { exact: true }).tap();
  await browser.keyboard.press("Escape");
  await screen.getByRole("button", "Measure", { exact: true }).tap();
  await screen.getByRole("menuitemradio", "90ch", { exact: true }).tap();
  await browser.keyboard.press("Escape");
  await expect(screen.getByRole("tabpanel")).toContainText(
    "--typeset-font-body: Georgia, 'Times New Roman', serif;"
  );
  await expect(screen.getByRole("tabpanel")).toContainText(
    '--typeset-font-heading: "Geist Mono", monospace;'
  );
  await expect(screen.getByRole("tabpanel")).toContainText(
    "--typeset-font-mono: Arial, Helvetica, sans-serif;"
  );
  await browser.reload();
  await expect(heading).toContainText("Geist Mono");
  await expect(body).toContainText("Georgia");
  await expect(mono).toContainText("System Sans");
  await expect(
    screen.getByRole("button", "Size", { exact: true })
  ).toContainText("18px");
  await expect(
    screen.getByRole("button", "Leading", { exact: true })
  ).toContainText("Loose (1.9)");
  await expect(
    screen.getByRole("button", "Measure", { exact: true })
  ).toContainText("90ch");
  await screen.getByRole("link", "Read the docs").tap();
  await expect(
    screen.getByRole("heading", /^Customize the typography/u)
  ).toBeVisible();
});

test("typeset locks survive shuffle and its menu shortcuts update history", async ({
  app,
  browser,
  screen,
}) => {
  await browser.goto(
    new URL("/typeset?body=serif&scale=18&flow=2em&item=article", app.baseUrl)
      .href,
    { waitUntil: "networkidle" }
  );

  const body = screen.getByRole("button", "Body", { exact: true });
  const size = screen.getByRole("button", "Size", { exact: true });
  await expect(size).toContainText("18px");
  await body.hover();
  await screen.getByRole("button", "Lock Body", { exact: true }).tap();
  await size.hover();
  await screen.getByRole("button", "Lock Size", { exact: true }).tap();
  await screen.getByRole("button", "Shuffle", { exact: true }).tap();
  await expect(body).toContainText("Georgia");
  await expect(size).toContainText("18px");
  await expect(screen.getByRole("button", "Unlock Body")).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await expect(screen.getByRole("button", "Preview article")).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await size.tap();
  await screen.getByRole("menuitemradio", "14px", { exact: true }).tap();
  await browser.keyboard.press("Escape");
  await expect(size).toContainText("14px");
  await browser.keyboard.press("ControlOrMeta+z");
  await expect(size).toContainText("18px");
  await browser.keyboard.press("ControlOrMeta+Shift+z");
  await expect(size).toContainText("14px");
  await browser.keyboard.press("Shift+r");
  await expect(size).toContainText("15px");
  await expect(body).toContainText("Geist");
  await expect(browser.locator(".typeset-rhythm")).toHaveText(
    "15px / 26px / 19px"
  );
  await screen.getByRole("button", "Menu", { exact: true }).tap();
  await expect(screen.getByRole("menuitem", /^Undo/u)).toContainText("Ctrl+Z");
  await app.screenshot("typeset-menu");
});

test("typeset mobile pickers fit the viewport and keep code accessible", async ({
  app,
  browser,
  screen,
}) => {
  await browser.setViewport({ height: 844, width: 390 });
  await browser.goto(new URL("/typeset", app.baseUrl).href, {
    waitUntil: "networkidle",
  });
  await expect(
    screen.getByRole("button", "Measure", { exact: true })
  ).toBeHidden();
  await expect(
    screen.getByRole("button", "Menu", { exact: true })
  ).toBeHidden();

  const shuffle = await screen
    .getByRole("button", "Shuffle", { exact: true })
    .boundingBox();

  const code = await screen
    .getByRole("button", "Get Code", { exact: true })
    .boundingBox();

  assert.ok(
    shuffle && code && Math.abs(shuffle.width - code.width) < 1,
    JSON.stringify({ code, shuffle })
  );
  await screen.getByRole("button", "Body", { exact: true }).tap();
  await expect(screen.getByRole("menuitemradio", "Georgia")).toBeVisible();
  const popup = await browser.locator(".designer-picker-menu").boundingBox();
  assert.ok(popup && popup.x >= 0 && popup.x + popup.width <= 390);
  await app.screenshot("typeset-mobile-picker");
  await screen.getByRole("menuitemradio", "Georgia").tap();
  await expect(screen.getByRole("menu")).toBeHidden();
  await expect(
    screen.getByRole("button", "Body", { exact: true })
  ).toContainText("Georgia");
  await screen.getByRole("button", "Get Code", { exact: true }).tap();
  const drawer = screen.getByRole("dialog");
  await expect(drawer).toContainText("--typeset-font-body: Georgia");
  const bounds = await drawer.boundingBox();
  assert.ok(bounds && bounds.height >= 600);
  await expect
    .poll(async () => {
      const position = await drawer.boundingBox();

      return position?.y ?? 844;
    })
    .toBeLessThan(150);
  await app.screenshot("typeset-mobile-code");
  await drawer.getByRole("button", "Done", { exact: true }).tap();
  await expect(drawer).toBeHidden();
  assert.equal(
    await browser.evaluate(() => document.documentElement.scrollWidth),
    390
  );
});

test("typeset sidebar previews choices without changing the saved settings", async ({
  app,
  browser,
  screen,
}) => {
  await browser.setViewport({ height: 1000, width: 1440 });
  await browser.goto(new URL("/typeset", app.baseUrl).href, {
    waitUntil: "networkidle",
  });
  await app.screenshot("typeset-sidebar");

  const body = screen.getByRole("button", "Body", { exact: true });
  await expect(body).toContainText("Geist");
  const savedUrl = await browser.evaluate(() => location.href);
  await body.tap();
  await screen.getByRole("menuitemradio", "Georgia", { exact: true }).hover();
  await expect
    .poll(
      async () =>
        await browser.evaluate(() => {
          const title = document.querySelector(".typeset-fixture h1");

          return title ? getComputedStyle(title).fontFamily : "";
        })
    )
    .toContain("Georgia");
  await expect(body).toContainText("Geist");
  assert.equal(await browser.evaluate(() => location.href), savedUrl);
  await browser.keyboard.press("Escape");
  await expect
    .poll(
      async () =>
        await browser.evaluate(() => {
          const title = document.querySelector(".typeset-fixture h1");

          return title ? getComputedStyle(title).fontFamily : "";
        })
    )
    .toContain("Geist");
});
