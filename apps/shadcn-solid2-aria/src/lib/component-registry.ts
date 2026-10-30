import { registryItemSchema, registrySchema } from "shadcn/schema";
import type { RegistryItem } from "shadcn/schema";

import manifest from "../../package.json";
import theme from "../registry/theme.json";
import { componentMetadata } from "./component-metadata";
import { absoluteUrl, siteUrl } from "./site";
import { splitSourceNotice } from "./source-notice";

const sources = import.meta.glob<string>("../components/ui/*.tsx", {
  eager: true,
  import: "default",
  query: "?raw",
});

const versions = new Map(Object.entries(manifest.dependencies));

const workspaceVersions = new Map(
  Object.values(
    import.meta.glob<{ name: string; version: string }>(
      "../../../../packages/*/package.json",
      { eager: true, import: "default" }
    )
  ).map((workspace): [string, string] => [workspace.name, workspace.version])
);

const metadata = new Map(Object.entries(componentMetadata));

function dependency(name: string) {
  const requestedVersion = versions.get(name);

  const version =
    requestedVersion?.startsWith("workspace:") === true
      ? workspaceVersions.get(name)
      : requestedVersion;

  if (version === undefined) {
    throw new Error(`Missing registry dependency version: ${name}`);
  }

  return `${name}@${version}`;
}

const themeItem = registryItemSchema.parse({
  ...theme,
  $schema: "https://ui.shadcn.com/schema/registry-item.json",
  dependencies: ["tailwindcss", "tw-animate-css", "shadcn"].map(dependency),
  description: "Upstream shadcn/ui Aria styles and neutral theme.",
  name: "theme",
  title: "Solid2 Aria theme",
  type: "registry:style",
});

function component(name: string, content: string): RegistryItem {
  const npm = new Set(["solid-js", "@solidjs/web"]);
  const local = new Set<string>();

  if (name === "chart") {
    npm.add("@tanstack/charts");
  }

  for (const match of content.matchAll(
    /\bfrom\s+["'](?<specifier>[^"']+)["']/gu
  )) {
    const specifier = match.groups?.specifier;

    if (specifier === undefined) {
      throw new Error(`Invalid registry import in ${name}`);
    }

    if (specifier.startsWith("./")) {
      local.add(specifier.slice(2));
    } else if (specifier.startsWith(".") || specifier.startsWith("#")) {
      throw new Error(`Unsupported registry import in ${name}: ${specifier}`);
    } else {
      npm.add(
        specifier
          .split("/")
          .slice(0, specifier.startsWith("@") ? 2 : 1)
          .join("/")
      );
    }
  }

  const details = metadata.get(name);

  if (!details) {
    throw new Error(`Missing registry metadata: ${name}`);
  }

  return registryItemSchema.parse({
    ...details,
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    dependencies: [...npm].toSorted().map(dependency),
    files: [
      {
        content: splitSourceNotice(content).code,
        path: `components/ui/${name}.tsx`,
        type: "registry:ui",
      },
    ],
    name,
    registryDependencies: [...local]
      .toSorted()
      .map((value) => absoluteUrl(`/r/${value}.json`)),
    type: "registry:ui",
  });
}

const items = new Map<string, RegistryItem>([
  ["theme", themeItem],
  ...Object.entries(sources).map(([path, source]): [string, RegistryItem] => {
    const name = path.slice("../components/ui/".length, -4);

    return [name, component(name, source)];
  }),
]);

export function getRegistryItem(name: string) {
  return items.get(name);
}

export function getComponentRegistry() {
  return registrySchema.parse({
    $schema: "https://ui.shadcn.com/schema/registry.json",
    homepage: siteUrl,
    items: [...items.values()].map((item) => ({
      ...item,
      files: item.files?.map(({ content: _content, ...file }) => file),
    })),
    name: "shadcn-solid2-aria",
  });
}
