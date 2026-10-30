import { dynamic } from "@solidjs/web";
import { ClientOnly } from "@tanstack/solid-router";
import { lazy, Loading } from "solid-js";
import type { Component } from "solid-js";

import { examples, loadExampleFiles } from "../../lib/examples";
import { blocks, charts } from "./inventory";

const modules = import.meta.glob<{ default: Component }>([
  "../../blocks/**/page.tsx",
  "../../blocks/**/index.tsx",
  "../../blocks/charts/*.tsx",
]);

const views = new Map<string, Component | undefined>(
  [...blocks, ...charts].map((item) => {
    const load = modules[`../../blocks/${item.entry}.tsx`];

    return [item.name, load ? lazy(load) : undefined];
  })
);

for (const [name, component] of examples) {
  if (!views.has(name)) {
    views.set(name, component);
  }
}

export function hasBlockPreview(name: string) {
  return views.has(name);
}

export function BlockPreview(props: { name: string }) {
  const Preview = dynamic(() => views.get(props.name));

  return (
    <ClientOnly>
      <Loading
        fallback={
          <p class="text-muted-foreground p-6 text-sm">Loading preview...</p>
        }
      >
        <Preview />
      </Loading>
    </ClientOnly>
  );
}

const sources = import.meta.glob<string>(
  ["../../blocks/**/*.tsx", "./chart-demo.tsx", "../chart/*.{ts,tsx}"],
  {
    import: "default",
    query: "?raw",
  }
);

export async function loadBlockFiles(name: string) {
  const item = [...blocks, ...charts].find((i) => i.name === name);

  if (!item) {
    return examples.has(name) ? await loadExampleFiles(name) : [];
  }

  const prefix = name.startsWith("chart-")
    ? `../../blocks/charts/${name}.tsx`
    : `../../blocks/${name}/`;

  const entries = Object.entries(sources).filter(([path]) =>
    path.startsWith(prefix)
  );

  const files = await Promise.all(
    entries.map(async ([path, load]) => ({
      code: await load(),
      name: path.replace("../../blocks/", ""),
    }))
  );

  const required = new Set<string>();

  for (const file of files) {
    for (const helper of ["_config", "_icons"]) {
      if (file.code.includes(helper)) {
        required.add(`../../blocks/${helper}.tsx`);
      }
    }
  }

  if (name.startsWith("chart-")) {
    required.add("./chart-demo.tsx");
  }

  if (
    name.startsWith("chart-") ||
    files.some((file) => file.code.includes("/chart/data-chart"))
  ) {
    for (const file of [
      "data-chart.tsx",
      "definition.ts",
      "data.ts",
      "cartesian.ts",
      "polar.ts",
    ]) {
      required.add(`../chart/${file}`);
    }
  }

  files.push(
    ...(await Promise.all(
      [...required].map(async (path) => ({
        code: (await sources[path]?.()) ?? "",
        name: path
          .replace("../../blocks/", "blocks/")
          .replace("../chart/", "components/chart/")
          .replace("./", "components/catalog/"),
      }))
    ))
  );

  return files;
}
