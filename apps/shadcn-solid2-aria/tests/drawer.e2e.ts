import assert from "node:assert/strict";

import { test } from "@e2e-dev/web";
import { expect } from "e2e";

test("drawer stays visible while animating closed", async ({
  app,
  browser,
}) => {
  await browser.setViewport({ height: 844, width: 390 });
  await browser.emulateMedia({ reducedMotion: "no-preference" });
  await app.open("/docs/components/drawer");
  await browser
    .locator("[data-example='drawer-swipe-handle']")
    .getByRole("button", "Open Drawer")
    .tap();
  await expect
    .poll(
      async () =>
        await browser.evaluate(
          () =>
            document
              .querySelector("[data-vaul-drawer]")
              ?.getAnimations()
              .every((animation) => animation.playState === "finished") ?? false
        )
    )
    .toBe(true);

  const motion = await browser.evaluate(async () => {
    const drawer = document.querySelector<HTMLElement>("[data-vaul-drawer]");

    const close = drawer?.querySelector<HTMLButtonElement>(
      "[data-slot='drawer-close']"
    );

    if (!drawer || !close) {
      throw new Error("Missing open drawer");
    }

    const start = drawer.getBoundingClientRect().top;
    close.click();
    const frames: number[] = [];
    const { promise, resolve } = Promise.withResolvers<null>();

    const sample = () => {
      if (!drawer.isConnected || frames.length >= 90) {
        resolve(null);

        return;
      }

      frames.push(drawer.getBoundingClientRect().top);
      requestAnimationFrame(sample);
    };

    requestAnimationFrame(sample);
    await promise;

    return { frames, height: innerHeight, removed: !drawer.isConnected, start };
  });

  assert.ok(
    motion.frames.some(
      (top) => top > motion.start + 2 && top < motion.height - 2
    ),
    JSON.stringify(motion)
  );
  assert.equal(motion.removed, true);
});

test("snap drawer opens directly toward its compact snap point", async ({
  app,
  browser,
  screen,
}) => {
  await browser.setViewport({ height: 844, width: 390 });
  await browser.emulateMedia({ reducedMotion: "no-preference" });
  await app.open("/docs/components/drawer");
  await expect(screen.getByRole("button", "Open Snap Drawer")).toBeVisible();

  const tops = await browser.evaluate(async () => {
    const trigger = document.querySelector<HTMLButtonElement>(
      "[data-example='drawer-snap-points'] [data-slot='drawer-trigger']"
    );

    if (!trigger) {
      throw new Error("Missing snap drawer trigger");
    }

    trigger.click();
    const frames: number[] = [];
    const { promise, resolve } = Promise.withResolvers<null>();
    let remaining = 45;

    const sample = () => {
      const drawer = document.querySelector("[data-vaul-drawer]");

      if (drawer) {
        frames.push(drawer.getBoundingClientRect().top);
      }

      remaining -= 1;

      if (remaining === 0) {
        resolve(null);

        return;
      }

      requestAnimationFrame(sample);
    };

    requestAnimationFrame(sample);
    await promise;

    return frames;
  });

  assert.ok(Math.min(...tops) >= 844 - 496 - 1, JSON.stringify(tops));
  assert.ok(
    tops.some((top) => top > 844 - 496 + 2 && top < 844 - 2),
    JSON.stringify(tops)
  );
  assert.ok(
    Math.abs((tops.at(-1) ?? 0) - (844 - 496)) < 1,
    JSON.stringify(tops)
  );
});

test("drawer documentation loads through client navigation and browser history", async ({
  app,
  browser,
  screen,
}) => {
  await browser.emulateMedia({ reducedMotion: "reduce" });
  await app.open("/docs/components/dialog");
  await screen.getByRole("link", "Drawer", { exact: true }).tap();

  const trigger = browser
    .locator("[data-example='drawer-demo']")
    .getByRole("button", "Open Drawer");

  const dialog = screen.getByRole("dialog", "Pick a delivery time");

  await expect(screen.getByRole("heading", /^API Reference/u)).toBeVisible();
  await trigger.tap();
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", "Cancel").tap();
  await expect(dialog).toBeHidden();
  await screen.getByRole("link", "Dialog", { exact: true }).tap();
  await browser.back();
  await trigger.tap();
  await expect(dialog).toBeVisible();
  await app.screenshot("drawer-after-client-navigation");
  await dialog.getByRole("button", "Cancel").tap();
  await expect(dialog).toBeHidden();

  await browser.setViewport({ height: 844, width: 390 });
  await browser.reload();
  await trigger.tap();
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("data-vaul-drawer-direction", "bottom");
  await app.screenshot("drawer-on-mobile");
});

test("controlled drawer supports keyboard and outside dismissal with focus restoration", async ({
  app,
  browser,
  screen,
}) => {
  await browser.setViewport({ height: 900, width: 1280 });
  await app.open("/docs/components/drawer");

  const trigger = browser
    .locator("[data-example='drawer-demo']")
    .getByRole("button", "Open Drawer");

  const dialog = screen.getByRole("dialog", "Pick a delivery time");

  await trigger.tap();
  await expect(dialog).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(dialog).toHaveAttribute("data-vaul-drawer-direction", "right");

  const description = await browser.evaluate(() => {
    const id = document
      .querySelector("[data-vaul-drawer]")
      ?.getAttribute("aria-describedby");

    return id === null || id === undefined
      ? null
      : (document.querySelector(`#${CSS.escape(id)}`)?.textContent?.trim() ??
          null);
  });

  assert.equal(description, "We'll prepare your order as soon as possible.");
  await dialog.getByRole("button", "Cancel").tap();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");

  await trigger.press("Enter");
  await expect(dialog).toBeVisible();
  await browser.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();

  await trigger.tap();
  await expect(dialog).toBeVisible();
  await browser
    .locator("[data-slot='drawer-overlay']")
    .tap({ position: { x: 5, y: 5 } });
  await expect(dialog).toBeHidden();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

for (const direction of ["top", "right", "bottom", "left"]) {
  test(`drawer opens against the ${direction} viewport edge`, async ({
    app,
    browser,
    screen,
  }) => {
    await browser.setViewport({ height: 900, width: 1280 });
    await browser.emulateMedia({ reducedMotion: "reduce" });
    await app.open("/docs/components/drawer");

    await browser
      .locator("[data-example='drawer-sides']")
      .getByRole("button", `Open ${direction} drawer`)
      .tap();
    const dialog = screen.getByRole("dialog", "Move Goal");
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute(
      "data-vaul-drawer-direction",
      direction
    );

    const bounds = await browser.evaluate(() => {
      const element = document.querySelector("[data-vaul-drawer]");

      if (!element) {
        throw new Error("Missing drawer");
      }

      const rect = element.getBoundingClientRect();

      return {
        bottom: rect.bottom,
        height: rect.height,
        left: rect.left,
        right: rect.right,
        top: rect.top,
        width: rect.width,
      };
    });

    assert.ok(bounds.width > 0 && bounds.height > 0);

    if (direction === "top") {
      assert.ok(Math.abs(bounds.top) < 1);
    }

    if (direction === "right") {
      assert.ok(Math.abs(bounds.right - 1280) < 1);
    }

    if (direction === "bottom") {
      assert.ok(Math.abs(bounds.bottom - 900) < 1);
    }

    if (direction === "left") {
      assert.ok(Math.abs(bounds.left) < 1);
    }

    await dialog.getByRole("button", "Close").tap();
    await expect(dialog).toBeHidden();
  });
}

test("nested drawers close independently and return focus to their parent", async ({
  app,
  browser,
  screen,
}) => {
  await browser.setViewport({ height: 844, width: 390 });
  await app.open("/docs/components/drawer");

  const trigger = browser
    .locator("[data-example='drawer-nested']")
    .getByRole("button", "Open Drawer");

  await trigger.tap();
  const parent = screen.getByRole("dialog", "Drawer");
  await expect(parent).toBeVisible();
  await parent.getByRole("button", "Open Nested Drawer").tap();
  const nested = screen.getByRole("dialog", "Nested Drawer");
  await expect(nested).toBeVisible();
  await nested.getByRole("button", "Open Third Drawer").tap();
  await expect(screen.getByRole("dialog", "Third Drawer")).toBeVisible();
  await browser.keyboard.press("Escape");
  await expect(screen.getByRole("dialog", "Third Drawer")).toBeHidden();
  await expect(nested.getByRole("button", "Open Third Drawer")).toBeFocused();
  await nested.getByRole("button", "Close").tap();
  await expect(nested).toBeHidden();
  await expect(parent).toBeVisible();
  await expect(parent.getByRole("button", "Open Nested Drawer")).toBeFocused();
  await parent.getByRole("button", "Close").tap();
  await expect(parent).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("handle cycles controlled snap points and then dismisses the drawer", async ({
  app,
  browser,
  screen,
}) => {
  await browser.setViewport({ height: 844, width: 390 });
  await browser.emulateMedia({ reducedMotion: "reduce" });
  await app.open("/docs/components/drawer");
  const trigger = screen.getByRole("button", "Open Snap Drawer");
  await trigger.tap();
  const dialog = screen.getByRole("dialog", "Snap points");
  await expect(dialog).toBeVisible();

  const top = async () =>
    await browser.evaluate(
      () =>
        document.querySelector("[data-vaul-drawer]")?.getBoundingClientRect()
          .top ?? null
    );

  await expect.poll(top).toBeCloseTo(844 - 496, 0);
  const handle = browser.locator("[data-slot='drawer-swipe-handle']");
  await handle.tap();
  await expect.poll(top).toBeCloseTo(0, 0);
  await handle.tap();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("handle-only drawer dismisses with a pointer drag", async ({
  app,
  browser,
  screen,
}) => {
  await browser.setViewport({ height: 844, width: 390 });
  await app.open("/docs/components/drawer");

  const trigger = browser
    .locator("[data-example='drawer-swipe-handle']")
    .getByRole("button", "Open Drawer");

  await trigger.tap();
  const dialog = screen.getByRole("dialog", "Drawer");
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("data-vaul-handle-only", "true");

  await expect
    .poll(
      async () =>
        await browser.evaluate(
          () =>
            document
              .querySelector("[data-vaul-drawer]")
              ?.getAnimations()
              .every((animation) => animation.playState === "finished") ?? false
        )
    )
    .toBe(true);

  const point = await browser.evaluate(() => {
    const handle = document.querySelector("[data-slot='drawer-swipe-handle']");

    if (!handle) {
      throw new Error("Missing swipe handle");
    }

    const rect = handle.getBoundingClientRect();

    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  });

  await browser.mouse.move(point.x, point.y);
  await browser.mouse.down();
  await browser.mouse.move(point.x, point.y + 30);
  await browser.mouse.move(point.x, 830);
  await browser.mouse.up();
  await expect(dialog).toBeHidden();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).toBeFocused();
});
