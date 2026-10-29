import assert from "node:assert/strict";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const directory = await mkdtemp(path.join(tmpdir(), "solid2-charts-minimum-"));
const modules = path.join(directory, "node_modules");
const adapter = path.join(modules, "@solid2-aria/tanstack-charts");

try {
  const minimum = await realpath(
    path.join(root, "node_modules/tanstack-charts-minimum")
  );

  const manifest: unknown = JSON.parse(
    await readFile(path.join(minimum, "package.json"), "utf-8")
  );

  assert.ok(
    typeof manifest === "object" && manifest !== null && "version" in manifest
  );
  assert.equal(manifest.version, "1.0.0");

  await mkdir(adapter, { recursive: true });
  await cp(path.join(root, "package.json"), path.join(adapter, "package.json"));
  await cp(path.join(root, "dist"), path.join(adapter, "dist"), {
    recursive: true,
  });
  await writeFile(path.join(directory, "package.json"), '{"type":"module"}\n');

  await Promise.all(
    [
      { name: "@tanstack/charts", source: "tanstack-charts-minimum" },
      { name: "@solidjs/web", source: "@solidjs/web" },
      { name: "solid-js", source: "solid-js" },
      { name: "happy-dom", source: "happy-dom" },
    ].map(async ({ name, source }) => {
      const destination = path.join(modules, name);

      await mkdir(path.dirname(destination), { recursive: true });
      await symlink(
        await realpath(path.join(root, "node_modules", source)),
        destination,
        "dir"
      );
    })
  );

  const runtime = Bun.spawnSync(
    [process.execPath, path.join(root, "scripts/check-build.ts"), directory],
    { cwd: root, stderr: "pipe", stdout: "pipe" }
  );

  assert.equal(
    runtime.exitCode,
    0,
    runtime.stdout.toString() + runtime.stderr.toString()
  );
  console.info(runtime.stdout.toString().trim());

  await writeFile(
    path.join(directory, "consumer.ts"),
    `
import {Chart} from "@solid2-aria/tanstack-charts";
import type {ChartDefinition, ChartPoint, ChartProps} from "@solid2-aria/tanstack-charts";
import {barY, defineChart} from "@tanstack/charts";
export {Chart, barY, defineChart};
export type {ChartDefinition, ChartPoint, ChartProps};
`
  );
  await writeFile(
    path.join(directory, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        lib: ["ESNext", "DOM", "DOM.Iterable"],
        module: "Preserve",
        moduleResolution: "Bundler",
        noEmit: true,
        skipLibCheck: false,
        strict: true,
        target: "ESNext",
        types: [],
      },
      files: ["consumer.ts"],
    })
  );

  const types = Bun.spawnSync(
    [path.resolve(root, "../../node_modules/.bin/tsrs"), "-p", directory],
    { cwd: directory, stderr: "pipe", stdout: "pipe" }
  );

  assert.equal(
    types.exitCode,
    0,
    types.stdout.toString() + types.stderr.toString()
  );
  console.info("Chart 1.0.0 consumer declarations passed.");
} finally {
  await rm(directory, { force: true, recursive: true });
}
