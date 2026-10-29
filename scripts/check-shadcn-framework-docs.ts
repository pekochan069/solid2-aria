import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = path.join(root, "apps/shadcn-solid2-aria");
const upstream = path.resolve(root, "../shadcn-ui/apps/v4");
const frameworks = ["vite", "vite-start", "tanstack-router", "tanstack-start"];

const read = (file: string) => readFileSync(file, "utf-8");

const localDoc = (slug: string) =>
  read(path.join(app, "content/docs", `${slug}.mdx`));

const upstreamDoc = (slug: string) =>
  read(path.join(upstream, "content/docs", `${slug}.mdx`));

const headings = (source: string) =>
  [...source.matchAll(/^## (?<title>.+)$/gmu)].map(
    (match) => match.groups?.title
  );

const themeSteps = (source: string) =>
  [
    ...source.matchAll(
      /^#{2,3} (?<title>Create a theme provider|Wrap your root layout|Add a mode toggle)$/gmu
    ),
  ].map((match) => match.groups?.title);

const svgPaths = (svg: string) =>
  [...svg.matchAll(/\bd="(?<path>[^"]+)"/gu)].map(
    (match) => match.groups?.path
  );

assert.match(localDoc("installation"), /<Steps>/u);

assert.match(localDoc("installation"), /<RegistryCommand name="button"/u);

assert.match(
  localDoc("installation"),
  /<FrameworkCards section="installation"/u
);

assert.match(localDoc("dark-mode"), /<FrameworkCards section="dark-mode"/u);

assert.equal(headings(localDoc("dark-mode")).length, 0);

for (const framework of frameworks) {
  const installation = localDoc(`installation/${framework}`);
  const darkMode = localDoc(`dark-mode/${framework}`);
  const isServer = framework === "vite-start" || framework === "tanstack-start";

  const source = upstreamDoc(
    isServer ? "dark-mode/tanstack-start" : "dark-mode/vite"
  );

  assert.deepEqual(themeSteps(darkMode), themeSteps(source), framework);
  assert.match(installation, /<Steps>/u);
  assert.match(installation, /<RegistryCommand name="button"/u);
  assert.match(darkMode, /function ModeToggle/u);
  assert.match(darkMode, /DropdownMenuTrigger/u);
  assert.match(darkMode, /class="sr-only">Toggle theme/u);
  assert.match(darkMode, /showLineNumbers/u);
  assert.equal(darkMode.includes("<Steps>"), isServer);

  if (framework !== "tanstack-router") {
    assert.deepEqual(headings(installation), [
      "Use shadcn/create",
      "Use the CLI",
      "Existing Project",
    ]);
  }

  for (const document of [installation, darkMode]) {
    assert.match(document, /Copyright \(c\) 2023 shadcn/u);
    assert.match(document, /Derived from shadcn\/ui/u);
    assert.match(document, /Modified for Solid Aria/u);
    assert.doesNotMatch(
      document,
      /from ["'](?:react|@tanstack\/react-router|lucide-react)["']/u
    );
    assert.doesNotMatch(document, /shadcn@latest init/u);
    assert.doesNotMatch(document, /className=/u);
  }
}

const cards = read(path.join(app, "src/components/docs/framework-cards.tsx"));
const linkedCard = read(path.join(app, "src/components/docs/linked-card.tsx"));
const originalComponents = read(path.join(upstream, "mdx-components.tsx"));

const cardClasses =
  "flex w-full flex-col items-center rounded-2xl bg-surface p-6 text-surface-foreground transition-colors hover:bg-surface/80 sm:p-10";

assert.ok(originalComponents.includes(cardClasses));

const localCardClasses = /"(?<classes>[^"]*bg-surface[^"]*)"/u.exec(linkedCard)
  ?.groups?.classes;

assert.ok(localCardClasses !== undefined);

assert.deepEqual(
  localCardClasses.split(" ").toSorted(),
  cardClasses.split(" ").toSorted()
);

for (const [name, slug, href] of [
  ["ViteIcon", "installation/index", "/docs/installation/vite"],
  [
    "TanStackInstallationIcon",
    "installation/index",
    "/docs/installation/tanstack",
  ],
  ["TanStackDarkModeIcon", "dark-mode/index", "/docs/dark-mode/tanstack-start"],
]) {
  assert.ok(name !== undefined && slug !== undefined && href !== undefined);

  const source = upstreamDoc(slug)
    .split(`href="${href}"`)
    .at(1)
    ?.split("</LinkedCard>")
    .at(0);

  const local = cards.split(`function ${name}()`).at(1)?.split("</svg>").at(0);

  assert.ok(source !== undefined);
  assert.ok(local !== undefined);
  assert.deepEqual(
    svgPaths(local),
    svgPaths(source),
    `${name}: preserve original SVG paths`
  );
}

const manifest = read(path.join(app, "content/docs/port-manifest.json"));

JSON.parse(manifest);

const [included = "", excluded = ""] = manifest.split('"excluded": [');

const sources = (section: string) =>
  [...section.matchAll(/"source": "(?<source>[^"]+)"/gu)].map(
    (match) => match.groups?.source
  );

const usedSources = new Set(sources(included));

for (const source of sources(excluded)) {
  assert.ok(!usedSources.has(source), `${source}: both included and excluded`);
}

const origin = process.argv.at(2);

if (origin !== undefined) {
  await Promise.all(
    ["installation", "dark-mode"].flatMap((section) =>
      [
        section,
        ...frameworks.map((framework) => `${section}/${framework}`),
      ].map(async (slug) => {
        const response = await fetch(new URL(`/docs/${slug}`, origin));
        const html = await response.text();

        assert.equal(response.status, 200, slug);
        assert.match(html, /<h1[\s>]/u, slug);

        if (slug === section) {
          for (const framework of frameworks) {
            assert.ok(
              html.includes(`href="/docs/${section}/${framework}"`),
              slug
            );
          }
        } else {
          assert.match(
            html,
            /data-line-numbers/u,
            `${slug}: render code line numbers`
          );
        }
      })
    )
  );
}

console.info(
  "Framework documentation matches upstream cards, SVGs, headings, steps, and attribution."
);
