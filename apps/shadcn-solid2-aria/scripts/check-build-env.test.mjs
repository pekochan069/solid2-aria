import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { z } from "zod";

const appDirectory = fileURLToPath(new URL("../", import.meta.url));

const repositoryDirectory = fileURLToPath(
  new URL("../../../", import.meta.url)
);

const turboBuildSchema = z.object({
  tasks: z.array(
    z.object({
      envMode: z.string(),
      environmentVariables: z.object({ configured: z.array(z.string()) }),
      hash: z.string(),
      outputs: z.array(z.string()),
      taskId: z.string(),
    })
  ),
});

const loadConfig = `
  import { loadConfigFromFile } from "vite";
  await loadConfigFromFile(
    { command: "build", mode: "production" },
    undefined,
    process.cwd(),
    "silent",
  );
`;

/** @param {string} publicUrl Public origin supplied to the build. */
function checkBuildConfig(publicUrl) {
  return spawnSync(
    process.execPath,
    ["--input-type=module", "--eval", loadConfig],
    {
      cwd: appDirectory,
      encoding: "utf-8",
      env: { ...process.env, VITE_PUBLIC_URL: publicUrl },
    }
  );
}

for (const publicUrl of ["", "example.com", "ftp://example.com"]) {
  void test(`build rejects VITE_PUBLIC_URL=${JSON.stringify(publicUrl)}`, () => {
    const result = checkBuildConfig(publicUrl);
    assert.ifError(result.error);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /VITE_PUBLIC_URL/u);
  });
}

for (const publicUrl of ["http://localhost:5500", "https://example.com"]) {
  void test(`build accepts VITE_PUBLIC_URL=${publicUrl}`, () => {
    const result = checkBuildConfig(publicUrl);
    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stderr);
  });
}

/** @param {string} publicUrl Public origin supplied to Turbo. */
function checkTurboBuild(publicUrl) {
  const result = spawnSync(
    process.execPath,
    [
      "node_modules/turbo/bin/turbo",
      "run",
      "build",
      "--filter=shadcn-solid2-aria",
      "--dry=json",
    ],
    {
      cwd: repositoryDirectory,
      encoding: "utf-8",
      env: { ...process.env, VITE_PUBLIC_URL: publicUrl },
    }
  );

  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr);
  const summary = turboBuildSchema.parse(JSON.parse(result.stdout));

  const build = summary.tasks.find(
    (task) => task.taskId === "shadcn-solid2-aria#build"
  );

  assert.ok(build, "Turbo must schedule this app's build");

  return build;
}

void test("Turbo passes VITE_PUBLIC_URL to the build in strict mode", () => {
  const build = checkTurboBuild("https://example.com");
  assert.equal(build.envMode, "strict");
  assert.match(
    build.environmentVariables.configured.join("\n"),
    /^VITE_PUBLIC_URL=/mu
  );
});

void test("changing VITE_PUBLIC_URL invalidates Turbo's build cache", () => {
  const production = checkTurboBuild("https://example.com");
  const repeatedProduction = checkTurboBuild("https://example.com");
  const preview = checkTurboBuild("https://preview.example.com");
  assert.equal(production.hash, repeatedProduction.hash);
  assert.notEqual(production.hash, preview.hash);
});

void test("Turbo includes Nitro's production output in the build cache", () => {
  const build = checkTurboBuild("https://example.com");
  assert.ok(build.outputs.includes(".output/**"));
  assert.ok(build.outputs.includes(".vercel/output/**"));
});
