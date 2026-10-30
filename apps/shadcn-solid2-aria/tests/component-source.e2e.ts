import { test } from "@e2e-dev/web";
import { expect } from "e2e";
import { z } from "zod";

test("manual installation source expands and collapses like upstream", async ({
  app,
  browser,
  screen,
}) => {
  // Capture clipboard writes without a headless browser permission prompt.
  await browser.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: (value: string) => {
          document.documentElement.dataset.copiedSource = value;
        },
      },
    });
  });
  await app.open("/docs/components/accordion");
  await expect(screen.getByRole("tablist", "Package manager")).toBeVisible();
  await screen.getByRole("tab", "Manual", { exact: true }).tap();

  const manual = screen.getByRole("tabpanel", "Manual", { exact: true });
  await expect(manual).toContainText("components/ui/accordion.tsx");

  const viewer = browser.locator(".component-source");
  await expect(
    browser.locator(".component-source code[data-line-numbers]")
  ).toBeVisible();
  await viewer.scrollIntoView();
  await app.screenshot("manual-installation");

  const registryResponse = await fetch(
    new URL("/r/accordion.json", app.baseUrl)
  );

  const registry = z
    .object({ files: z.array(z.object({ content: z.string() })).nonempty() })
    .parse(await registryResponse.json());

  expect(
    await browser.evaluate(
      () => document.querySelector(".component-source code")?.textContent
    )
  ).toBe(registry.files[0]?.content);
  expect(
    await browser.evaluate(
      () =>
        document.querySelector(".source-content")?.getBoundingClientRect()
          .height
    )
  ).toBe(256);
  await expect(
    manual.getByRole("button", "Expand", { exact: true })
  ).toHaveCount(2);
  await manual.getByRole("button", "Expand", { exact: true }).first().tap();
  await expect(
    manual.getByRole("button", "Collapse", { exact: true })
  ).toHaveCount(1);
  await expect(viewer.getByRole("button", "Collapse")).toHaveAttribute(
    "aria-expanded",
    "true"
  );
  expect(
    await browser.evaluate(
      () =>
        document.querySelector(".source-content")?.getBoundingClientRect()
          .height
    )
  ).toBeGreaterThan(256);

  const expandedCode = await browser.evaluate(() => {
    const pre = document.querySelector(".component-source pre");

    if (!pre) {
      throw new Error("Missing expanded source");
    }

    return { height: pre.clientHeight, scrollHeight: pre.scrollHeight };
  });

  expect(expandedCode.height).toBeGreaterThan(768);
  expect(expandedCode.height).toBe(expandedCode.scrollHeight);
  await viewer.getByRole("button", "Collapse").scrollIntoView();
  await app.screenshot("manual-installation-expanded");
  await viewer.getByRole("button", "Copy", { exact: true }).tap();
  await expect(
    viewer.getByRole("button", "Copied", { exact: true })
  ).toBeVisible();
  expect(
    await browser.evaluate(() => document.documentElement.dataset.copiedSource)
  ).toBe(registry.files[0]?.content);
  await manual.getByRole("button", "Collapse", { exact: true }).tap();
  await expect(
    manual.getByRole("button", "Expand", { exact: true })
  ).toHaveCount(2);

  await browser.setViewport({ height: 844, width: 390 });
  await viewer.scrollIntoView();
  await app.screenshot("manual-installation-mobile");

  const layout = await browser.evaluate(() => {
    const title = document.querySelector(".component-source figcaption > span");
    const toggle = document.querySelector(".source-toolbar button");

    if (!title || !toggle) {
      throw new Error("Missing source header controls");
    }

    return {
      pageWidth: document.documentElement.scrollWidth,
      titleRight: title.getBoundingClientRect().right,
      toggleLeft: toggle.getBoundingClientRect().left,
      viewport: innerWidth,
    };
  });

  expect(layout.pageWidth).toBe(layout.viewport);
  expect(layout.titleRight).toBeLessThanOrEqual(layout.toggleLeft);
  await manual.getByRole("button", "Expand", { exact: true }).nth(1).tap();
  await expect(viewer.getByRole("button", "Collapse")).toBeVisible();
  await viewer.getByRole("button", "Collapse").press("Enter");
  await expect(
    manual.getByRole("button", "Expand", { exact: true })
  ).toHaveCount(2);
});
