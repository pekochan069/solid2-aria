import { readdir } from "node:fs/promises";

import { test } from "@e2e-dev/web";
import { expect } from "e2e";

const files = await readdir(new URL("../src/blocks/charts", import.meta.url));

const charts = files
  .filter((file) => file.endsWith(".tsx"))
  .map((file) => file.slice(0, -4));

for (const name of charts) {
  test(`renders ${name} with finite geometry and keyboard tooltips`, async ({
    app,
    browser,
  }) => {
    await app.open(`/view/aria-nova/${name}`);
    const chart = browser.locator(".ts-chart-surface svg");
    await expect(chart).toBeVisible();
    await expect
      .poll(
        async () =>
          await browser.evaluate(() => {
            const svg = document.querySelector(".ts-chart-surface svg");

            return (
              svg !== null &&
              !/NaN|Infinity/u.test(svg.innerHTML) &&
              svg.querySelectorAll("path, rect, circle").length > 1
            );
          })
      )
      .toBe(true);
    await chart.focus();
    await chart.press("ArrowRight");
    await expect(browser.locator('[data-slot="chart-tooltip"]')).toBeVisible();
  });
}

test("updates chart ranges and series and fits a mobile container", async ({
  app,
  browser,
  screen,
}) => {
  await app.open("/view/aria-nova/chart-bar-interactive");
  const bars = browser.locator(".ts-chart__marks rect");
  await expect(bars).toHaveCount(180);
  await screen
    .getByRole("combobox", "Chart time range")
    .selectOption("Last 7 days");
  await expect(bars).toHaveCount(14);
  await screen.getByRole("button", "Desktop", { exact: true }).tap();
  await expect(bars).toHaveCount(7);
  await screen.getByRole("button", "All", { exact: true }).tap();
  await expect(bars).toHaveCount(14);
  await browser.setViewport({ height: 844, width: 390 });
  await expect
    .poll(
      async () =>
        await browser.evaluate(() => {
          const chart = document.querySelector(".ts-chart-surface svg");

          if (!(chart instanceof SVGSVGElement)) {
            return false;
          }

          const bounds = chart.getBoundingClientRect();

          return (
            bounds.width > 0 &&
            bounds.right <= innerWidth &&
            Math.abs(chart.viewBox.baseVal.height - bounds.height) < 1
          );
        })
    )
    .toBe(true);
  await app.screenshot("mobile-interactive-chart");
});
