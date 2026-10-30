import assert from "node:assert/strict";
import { setTimeout as delay } from "node:timers/promises";

import { test } from "@e2e-dev/web";
import { expect } from "e2e";

test("create previews hovered styles without committing or reloading the iframe", async ({
  app,
  browser,
  screen,
}) => {
  await app.open("/create");
  await screen.getByRole("button", "Get Started", { exact: true }).tap();
  await expect(
    browser
      .frameLocator("iframe")
      .getByText("Contribution History", { exact: true })
  ).toBeVisible();

  const previewClass = async () =>
    await browser.evaluate(
      () =>
        document.querySelector("iframe")?.contentDocument?.querySelector("main")
          ?.className
    );

  const notes = browser
    .frameLocator("iframe")
    .locator(
      'textarea[placeholder="Add any notes for this payout configuration..."]'
    );

  await notes.fill("Keep these preview notes");

  const initialUrl = await browser.evaluate(() => location.href);
  const style = screen.getByRole("button", "Style", { exact: true });
  await style.tap();
  const maia = screen.getByRole("menuitemradio", "Maia", { exact: true });
  await maia.hover();
  await expect.poll(previewClass).toBe("standalone-preview style-maia");
  await expect(style).toContainText("Nova");
  assert.equal(await browser.evaluate(() => location.href), initialUrl);

  await browser.mouse.move(20, 20);
  await expect.poll(previewClass).toBe("standalone-preview style-nova");
  await browser.keyboard.press("ArrowUp");
  await browser.keyboard.press("ArrowDown");
  await expect.poll(previewClass).toBe("standalone-preview style-maia");
  await browser.keyboard.press("Escape");
  await expect.poll(previewClass).toBe("standalone-preview style-nova");

  await style.tap();
  await maia.hover();
  await maia.tap();
  await expect(style).toContainText("Maia");
  await browser.keyboard.press("Escape");
  await expect.poll(previewClass).toBe("standalone-preview style-maia");

  const state = await browser.evaluate(() => {
    const textarea = document
      .querySelector("iframe")
      ?.contentDocument?.querySelector("textarea");

    return {
      notes: textarea?.value,
      style: new URL(location.href).searchParams.get("style"),
    };
  });

  assert.equal(state.style, "maia");
  assert.equal(state.notes, "Keep these preview notes");

  await browser.locator(".create-customizer-header button").tap();
  await screen.getByRole("menuitem", /^Undo/u).tap();
  await expect.poll(previewClass).toBe("standalone-preview style-nova");
});

test("create previews theme colors and keeps mobile choices uncommitted until a tap", async ({
  app,
  browser,
  screen,
}) => {
  await app.open("/create");
  await screen.getByRole("button", "Get Started", { exact: true }).tap();
  await expect(
    browser
      .frameLocator("iframe")
      .getByText("Contribution History", { exact: true })
  ).toBeVisible();

  const primary = async () =>
    await browser.evaluate(() => {
      const doc = document.querySelector("iframe")?.contentDocument;

      return doc?.defaultView
        ?.getComputedStyle(doc.documentElement)
        .getPropertyValue("--primary")
        .trim();
    });

  const initialUrl = await browser.evaluate(() => location.href);
  await screen.getByRole("button", "Theme", { exact: true }).tap();
  await screen.getByRole("menuitemradio", "Blue", { exact: true }).hover();
  await expect.poll(primary).toBe("oklch(0.488 0.243 264.376)");
  assert.equal(await browser.evaluate(() => location.href), initialUrl);
  await browser.keyboard.press("Escape");
  await expect.poll(primary).toBe("oklch(0.205 0 0)");

  await browser.setViewport({ height: 1000, width: 390 });
  await screen.getByRole("button", "Style", { exact: true }).tap();
  const maia = screen.getByRole("menuitemradio", "Maia", { exact: true });
  await maia.hover();
  await delay(100);
  await expect(
    browser.frameLocator("iframe").locator("main.style-nova")
  ).toBeVisible();
  await maia.tap();
  await expect(
    browser.frameLocator("iframe").locator("main.style-maia")
  ).toBeVisible();
  await expect(maia).not.toBeVisible();
});
