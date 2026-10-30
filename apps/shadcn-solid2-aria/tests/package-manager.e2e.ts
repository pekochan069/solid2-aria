import { test } from "@e2e-dev/web";
import { expect } from "e2e";

const commands = {
  bun: "bun add",
  npm: "npm install",
  pnpm: "pnpm add",
  yarn: "yarn add",
};

for (const [manager, command] of Object.entries(commands)) {
  test(`remembers ${manager} after reloading`, async ({
    app,
    screen,
    browser,
  }) => {
    await app.open("/docs/installation/vite");

    const managers = screen.getByRole("tablist", "Package manager").first();
    await managers.getByRole("tab", "npm").tap();
    await expect(managers.getByRole("tab", "npm")).toBeSelected();

    const commandCount = await screen
      .getByRole("tablist", "Package manager")
      .count();

    await managers.getByRole("tab", manager).tap();
    await expect(
      screen.getByRole("tab", manager, { selected: true })
    ).toHaveCount(commandCount);
    await expect
      .poll(
        async () =>
          await browser.evaluate(() =>
            localStorage.getItem("shadcn-solid2-package-manager")
          )
      )
      .toBe(manager);

    await browser.reload();
    await expect(
      screen.getByRole("tab", manager, { selected: true })
    ).toHaveCount(commandCount);
    await expect(screen.getByRole("tabpanel", manager).first()).toContainText(
      command
    );
  });
}

test("shares the package manager across documentation pages", async ({
  app,
  screen,
  browser,
}) => {
  await app.open("/docs/installation/vite");

  const managers = screen.getByRole("tablist", "Package manager").first();

  const navigation = screen.getByRole(
    "complementary",
    "Documentation navigation"
  );

  await managers.getByRole("tab", "pnpm").tap();
  await expect(managers.getByRole("tab", "pnpm")).toBeSelected();

  await navigation.getByRole("link", "Theming", { exact: true }).tap();
  await expect(browser).toHaveURL("/docs/theming");
  await expect(
    screen.getByRole("heading", "Theming", { exact: true })
  ).toBeVisible();
  await navigation.getByRole("link", "Vite", { exact: true }).first().tap();
  await expect(browser).toHaveURL("/docs/installation/vite");
  await expect(
    screen.getByRole("heading", "Vite", { exact: true })
  ).toBeVisible();
  await expect(managers.getByRole("tab", "pnpm")).toBeSelected();
  await expect(screen.getByRole("tabpanel", "pnpm").first()).toContainText(
    "pnpm add"
  );

  await browser.reload();
  await expect(managers.getByRole("tab", "pnpm")).toBeSelected();
});
