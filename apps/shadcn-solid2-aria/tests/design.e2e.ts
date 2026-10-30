import assert from "node:assert/strict";

import { test } from "@e2e-dev/web";
import { expect } from "e2e";

test("documentation keeps upstream typography around live components", async ({
  app,
  browser,
}) => {
  await app.open("/docs/components/button");
  await expect(browser.locator("h2#installation")).toBeVisible();
  await expect(
    browser.locator("[data-example='button-demo'] button").nth(0)
  ).toBeVisible();

  const typography = await browser.evaluate(() => {
    const heading = document.querySelector("h2#installation");
    const paragraph = document.querySelector("#cursor + p + p");

    const button = document.querySelector(
      "[data-example='button-demo'] button"
    );

    if (!heading || !paragraph || !button) {
      throw new Error("Missing documentation content");
    }

    return {
      buttonHeight: button.getBoundingClientRect().height,
      headingSize: getComputedStyle(heading).fontSize,
      headingWeight: getComputedStyle(heading).fontWeight,
      paragraphSpacing: getComputedStyle(paragraph).marginBlockStart,
    };
  });

  assert.equal(typography.headingSize, "18.75px");
  assert.equal(typography.headingWeight, "600");
  assert.equal(typography.paragraphSpacing, "18.75px");
  assert.equal(typography.buttonHeight, 32);
});

test("homepage preserves upstream gallery breakpoints and has no horizontal overflow", async ({
  app,
  browser,
}) => {
  await app.open("/");
  await expect(browser.locator(".cards-grid")).toBeVisible();

  for (const size of [
    { columns: 0, gap: "32px", width: 390 },
    { columns: 2, gap: "32px", width: 768 },
    { columns: 3, gap: "24px", width: 1024 },
    { columns: 4, gap: "24px", width: 1440 },
    { columns: 4, gap: "32px", width: 1600 },
    { columns: 5, gap: "40px", width: 1920 },
    { columns: 5, gap: "40px", width: 2560 },
  ]) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- Browser steps share one page and must run in order.
    await browser.setViewport({ height: 1000, width: size.width });
    // oxlint-disable-next-line eslint/no-await-in-loop -- Browser steps share one page and must run in order.
    await expect(browser.locator(".home-heading")).toBeVisible();

    // oxlint-disable-next-line eslint/no-await-in-loop -- Browser steps share one page and must run in order.
    const layout = await browser.evaluate(() => {
      const grid = document.querySelector(".cards-grid");

      if (!grid) {
        throw new Error("Missing gallery");
      }

      return {
        columns: [...grid.children].filter(
          (element) => element.getBoundingClientRect().width > 0
        ).length,
        gap: getComputedStyle(grid).columnGap,
        mobileImageX: document
          .querySelector(".mobile-gallery img")
          ?.getBoundingClientRect().x,
        scrollWidth: document.documentElement.scrollWidth,
        sidebarHeight: document
          .querySelector(".demo-sidebar")
          ?.getBoundingClientRect().height,
        viewport: innerWidth,
      };
    });

    assert.equal(
      layout.scrollWidth,
      layout.viewport,
      `Overflow at ${size.width}px`
    );
    assert.equal(
      layout.columns,
      size.columns,
      `Gallery columns at ${size.width}px`
    );
    assert.equal(layout.gap, size.gap, `Gallery gap at ${size.width}px`);

    if (size.width === 1440) {
      assert.equal(layout.sidebarHeight, 224);
    }

    if (size.width === 390) {
      assert.equal(layout.mobileImageX, 8);
    }
  }
});

test("chart catalog starts with the full width interactive example", async ({
  app,
  browser,
}) => {
  await app.open("/charts/area");
  await expect(
    browser.locator(".catalog-chart-grid > article").nth(0)
  ).toContainText("Area Chart - Interactive");

  const layout = await browser.evaluate(() => {
    const grid = document.querySelector(".catalog-chart-grid");
    const first = grid?.children[0];
    const second = grid?.children[1];

    if (!grid || !first || !second) {
      throw new Error("Missing charts");
    }

    return {
      first: first.getBoundingClientRect().width,
      grid: grid.getBoundingClientRect().width,
      second: second.getBoundingClientRect().width,
    };
  });

  assert.equal(layout.first, layout.grid);
  assert.ok(layout.second < layout.grid / 2);
});

test("color format selectors share the selected format across palettes", async ({
  app,
  browser,
  screen,
}) => {
  await app.open("/colors");
  await browser.locator(".color-format-selector").nth(0).tap();
  await screen.getByRole("option", "hex", { exact: true }).tap();
  await expect(browser.locator(".color-format-selector").nth(0)).toContainText(
    "hex"
  );
  await expect(browser.locator(".color-format-selector").nth(1)).toContainText(
    "hex"
  );
});

test("dashboard keeps the upstream initial date range and updates the visitor chart", async ({
  app,
  browser,
  screen,
}) => {
  await app.open("/examples/dashboard");
  await expect(browser.locator(".dashboard-visitors")).toContainText("Jun 23");
  await screen.getByRole("button", "Last 3 months", { exact: true }).tap();
  await expect(browser.locator(".dashboard-visitors")).toContainText("Apr 1");

  const height = await browser.evaluate(
    () =>
      document
        .querySelector(".dashboard-visitors svg[role='img']")
        ?.getBoundingClientRect().height
  );

  assert.equal(height, 250);
});

test("tasks keeps upstream row order and filters the visible table", async ({
  app,
  browser,
}) => {
  await app.open("/examples/tasks");
  await expect(
    browser.locator(".showcase-tasks tbody tr").nth(0)
  ).toContainText("TASK-8782");
  await browser.locator('input[aria-label="Filter tasks"]').fill("TASK-7878");
  await expect(browser.locator(".showcase-tasks tbody tr")).toContainText(
    "TASK-7878"
  );
});

test("RTL examples switch language and keep the context picker working", async ({
  app,
  browser,
  screen,
}) => {
  await app.open("/examples/rtl");
  await expect(browser.locator('[data-slot="rtl-components"]')).toContainText(
    "طريقة الدفع"
  );
  await browser
    .locator('.rtl-language-selector [data-slot="select-trigger"]')
    .tap();
  await screen.getByRole("option", "Hebrew (עברית)", { exact: true }).tap();
  await expect(browser.locator('[data-slot="rtl-components"]')).toContainText(
    "אמצעי תשלום"
  );
  await screen.getByRole("button", "הוסף הקשר", { exact: true }).tap();
  await expect(
    browser.locator('[data-slot="command-item"]').nth(0)
  ).toContainText("הערות פגישה");
  await browser.locator('[data-slot="command-item"]').nth(0).tap();
  await expect(browser.locator('[data-slot="rtl-components"]')).toContainText(
    "הערות פגישה"
  );
});

test("Sera renders its editorial tables and updates media details", async ({
  app,
  browser,
}) => {
  await app.open("/sera");
  await expect(
    browser.locator('[data-preview="audience-analytics"]')
  ).toContainText("AUDIENCE ANALYTICS");
  await browser
    .locator('input[aria-label="Search articles"]')
    .fill("Brutalism");
  await expect(
    browser.locator(
      '[data-preview="article-directory"] [data-slot="table-body"] [data-slot="table-row"]'
    )
  ).toHaveCount(1);
  await browser
    .locator('[data-preview="media-library"] button[aria-pressed]')
    .nth(1)
    .tap();
  await expect(
    browser.locator('[data-preview="media-library"] [data-slot="card"]').nth(1)
  ).toContainText("brutalism-interior-raw.jpg");
  const tagInput = browser.locator('input[placeholder="Filter by tag..."]');
  await tagInput.tap();
  await tagInput.fill("design");
  await browser.locator('[role="option"][data-key="design-week"]').tap();
  await expect(browser.locator('[data-slot="combobox-chip"]')).toHaveCount(3);
  await expect(
    browser.locator('[data-slot="combobox-chip"]').nth(2)
  ).toContainText("design-week");
});

test("typeset menu can undo a typography change", async ({
  app,
  browser,
  screen,
}) => {
  await browser.goto(new URL("/typeset", app.baseUrl).href, {
    waitUntil: "networkidle",
  });
  await screen.getByRole("button", "Size", { exact: true }).tap();
  await screen.getByRole("menuitemradio", "18px", { exact: true }).tap();
  await browser.keyboard.press("Escape");
  assert.equal(
    await browser.evaluate(
      () =>
        getComputedStyle(
          document.querySelector(".typeset-fixture") ?? document.body
        ).fontSize
    ),
    "18px"
  );
  await screen.getByRole("button", "Menu", { exact: true }).tap();
  await screen.getByRole("menuitem", /^Undo/u).tap();
  assert.equal(
    await browser.evaluate(
      () =>
        getComputedStyle(
          document.querySelector(".typeset-fixture") ?? document.body
        ).fontSize
    ),
    "15px"
  );
});

test("create welcome opens a working preview with readable chart labels", async ({
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

  const labelSize = await browser.evaluate(() => {
    const frame = document.querySelector("iframe");

    const label = frame?.contentDocument?.querySelector(
      '[data-slot="capture-target"] > div svg text'
    );

    if (!label) {
      throw new Error("Missing chart labels");
    }

    return label.getBoundingClientRect().height;
  });

  assert.ok(
    labelSize >= 12,
    `Chart labels should use screen pixels, received ${labelSize}px`
  );
  await expect(browser.locator("#designer-header-actions")).toContainText(
    "Get Code"
  );
});
