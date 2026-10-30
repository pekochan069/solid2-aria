import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const registry = process.env.REGISTRY_URL ?? "http://localhost:5500";
const cli = new URL("../node_modules/shadcn/dist/index.js", import.meta.url);
const cwd = await mkdtemp(path.join(tmpdir(), "solid-registry-install-"));

const stylesheet = `@import "tailwindcss";

:root {
  --primary: #123456;
  --radius: 1.25rem;
}
.dark {
  --primary: #abcdef;
}
@theme inline {
  --color-primary: var(--brand-color);
}
.app {
  color: rebeccapurple;
}
`;

/**
 * @param {string} name Registry item to install.
 * @param {string[]} [args] Additional CLI inspection flags.
 */
function preview(name, args = []) {
  const result = spawnSync(
    process.execPath,
    [
      cli.pathname,
      "add",
      new URL(`/r/${name}.json`, registry).href,
      "--cwd",
      cwd,
      "--dry-run",
      ...args,
    ],
    {
      encoding: "utf-8",
      env: { ...process.env, NO_COLOR: "1" },
      timeout: 30_000,
    }
  );

  assert.equal(result.status, 0, result.error?.message ?? result.stderr);

  return result.stdout;
}

try {
  await mkdir(path.join(cwd, "src"));
  await symlink(
    new URL("../node_modules", import.meta.url).pathname,
    path.join(cwd, "node_modules")
  );
  await writeFile(
    path.join(cwd, "package.json"),
    JSON.stringify({
      dependencies: { tailwindcss: "^4.0.0" },
      name: "registry-install-test",
      private: true,
    })
  );
  await writeFile(
    path.join(cwd, "tsconfig.json"),
    JSON.stringify({ compilerOptions: { paths: { "#*": ["./src/*"] } } })
  );
  await writeFile(
    path.join(cwd, "components.json"),
    JSON.stringify({
      aliases: {
        components: "#components",
        hooks: "#hooks",
        lib: "#lib",
        ui: "#components/ui",
        utils: "#lib/utils",
      },
      rsc: false,
      style: "new-york",
      tailwind: {
        baseColor: "neutral",
        css: "src/app.css",
        cssVariables: true,
      },
      tsx: true,
    })
  );
  await writeFile(path.join(cwd, "src/app.css"), stylesheet);

  for (const name of ["button", "button-group"]) {
    const output = preview(name);
    assert.ok(output.includes(`src/components/ui/${name}.tsx`));

    if (name === "button-group") {
      assert.match(output, /components\/ui\/separator\.tsx/u);
    }

    assert.doesNotMatch(output, /LICENSES\//u);
    assert.doesNotMatch(
      output,
      /src\/app\.css/u,
      `${name} must not change the app stylesheet`
    );
    console.log(
      `PASS: ${name} installs components without license files or stylesheet changes`
    );
  }

  await writeFile(path.join(cwd, "src/app.css"), '@import "tailwindcss";\n');
  assert.doesNotMatch(preview("theme"), /LICENSES\//u);
  const theme = preview("theme", ["--view", "src/app.css"]);
  assert.match(theme, /--primary:/u);
  assert.match(theme, /--primary:\s*oklch\(0\.205 0 0\)/u);
  assert.match(theme, /@import "shadcn\/tailwind\.css"/u);
  console.log(
    "PASS: explicit theme setup supplies tokens and upstream shared CSS"
  );
} finally {
  await rm(cwd, { force: true, recursive: true });
}
