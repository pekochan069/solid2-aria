import assert from "node:assert/strict";
import {
  mkdtemp,
  mkdir,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { registryItemSchema } from "shadcn/schema";
import { Node, Project, SyntaxKind } from "ts-morph";

import { splitSourceNotice } from "../src/lib/source-notice";

const app = path.resolve(import.meta.dirname, "..");

const upstream =
  process.env.SHADCN_UI_DIR ?? path.resolve(app, "../../../shadcn-ui");

const origin = process.env.REGISTRY_URL ?? "http://localhost:5500";
const project = new Project({ useInMemoryFileSystem: true });

type CssLiteral = string | { [name: string]: CssLiteral };

function literal(node: Node): CssLiteral {
  if (Node.isStringLiteral(node)) {
    return node.getLiteralValue();
  }

  if (Node.isObjectLiteralExpression(node)) {
    return Object.fromEntries(
      node.getProperties().map((property) => {
        const assignment = property.asKindOrThrow(
          SyntaxKind.PropertyAssignment
        );

        const name = assignment.getNameNode();

        return [
          Node.isStringLiteral(name) ? name.getLiteralValue() : name.getText(),
          literal(assignment.getInitializerOrThrow()),
        ];
      })
    );
  }

  throw new Error(
    `Expected an upstream CSS object or string: ${node.getText()}`
  );
}

const styleSource = project.createSourceFile(
  "style.ts",
  await readFile(
    path.join(upstream, "apps/v4/registry/bases/aria/registry.ts"),
    "utf-8"
  )
);

const style = styleSource
  .getVariableDeclarationOrThrow("ARIA_STYLE")
  .getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression);

const themeSource = project.createSourceFile(
  "themes.ts",
  await readFile(path.join(upstream, "apps/v4/registry/themes.ts"), "utf-8")
);

const neutral = themeSource
  .getVariableDeclarationOrThrow("THEMES")
  .getFirstDescendantByKindOrThrow(SyntaxKind.ArrayLiteralExpression)
  .getElements()
  .filter(Node.isObjectLiteralExpression)
  .find(
    (item) =>
      literal(
        item
          .getPropertyOrThrow("name")
          .asKindOrThrow(SyntaxKind.PropertyAssignment)
          .getInitializerOrThrow()
      ) === "neutral"
  );

assert.ok(neutral, "Missing upstream neutral theme");

const expected = registryItemSchema.parse({
  css: literal(
    style
      .getPropertyOrThrow("css")
      .asKindOrThrow(SyntaxKind.PropertyAssignment)
      .getInitializerOrThrow()
  ),
  cssVars: literal(
    neutral
      .getPropertyOrThrow("cssVars")
      .asKindOrThrow(SyntaxKind.PropertyAssignment)
      .getInitializerOrThrow()
  ),
  name: "theme",
  type: "registry:style",
});

const response = await fetch(new URL("/r/theme.json", origin));

assert.equal(response.status, 200);

const actual = registryItemSchema.parse(await response.json());

assert.deepEqual(
  actual.css,
  expected.css,
  "Registry CSS must match upstream ARIA_STYLE.css"
);

assert.deepEqual(
  actual.cssVars,
  expected.cssVars,
  "Registry tokens must match upstream neutral.cssVars"
);

const directory = await mkdtemp(path.join(tmpdir(), "shadcn-registry-css-"));

const server = Bun.serve({
  fetch: () =>
    Response.json({ ...expected, dependencies: actual.dependencies }),
  port: 0,
});

async function install(name: string, url: string) {
  const cwd = path.join(directory, name);

  await Promise.all([
    mkdir(path.join(cwd, "src"), { recursive: true }),
    mkdir(path.join(cwd, "node_modules"), { recursive: true }),
  ]);
  await Promise.all([
    writeFile(path.join(cwd, "src/App.css"), '@import "tailwindcss";\n'),
    writeFile(
      path.join(cwd, "package.json"),
      JSON.stringify({
        dependencies: { tailwindcss: "^4.0.0" },
        imports: { "#*": "./src/*" },
        name: `registry-css-${name}`,
        packageManager: `bun@${Bun.version}`,
        private: true,
      })
    ),
    writeFile(
      path.join(cwd, "tsconfig.json"),
      JSON.stringify({ compilerOptions: { moduleResolution: "bundler" } })
    ),
    writeFile(
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
          css: "src/App.css",
          cssVariables: true,
        },
        tsx: true,
      })
    ),
    symlink(
      path.join(app, "node_modules/tailwindcss"),
      path.join(cwd, "node_modules/tailwindcss")
    ),
  ]);

  const child = Bun.spawn(
    [
      process.execPath,
      path.join(app, "node_modules/shadcn/dist/index.js"),
      "add",
      url,
      "--cwd",
      cwd,
      "--yes",
    ],
    {
      cwd,
      env: {
        ...process.env,
        NO_COLOR: "1",
        PATH: `${path.dirname(process.execPath)}:${process.env.PATH}`,
      },
      stderr: "pipe",
      stdout: "pipe",
      timeout: 60_000,
    }
  );

  const [status, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);

  assert.equal(status, 0, stdout + stderr);

  return await readFile(path.join(cwd, "src/App.css"), "utf-8");
}

try {
  const [upstreamCss, installedCss] = await Promise.all([
    install("upstream", new URL("/theme.json", server.url).href),
    install("local", new URL("/r/theme.json", origin).href),
  ]);

  assert.equal(
    installedCss,
    upstreamCss,
    "Installed CSS must match upstream installation byte for byte"
  );
  assert.equal(
    splitSourceNotice(
      await readFile(path.join(app, "public/theme.css"), "utf-8")
    ).code.trimEnd(),
    upstreamCss.trimEnd(),
    "Downloaded CSS must match the upstream installation"
  );
  console.info(
    "Upstream registry data, installed CSS, and downloaded CSS match."
  );
} finally {
  await server.stop(true);
  await rm(directory, { force: true, recursive: true });
}
