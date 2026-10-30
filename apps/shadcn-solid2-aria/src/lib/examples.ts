import type { Component } from "solid-js";
import { lazy } from "solid-js";

const modules = import.meta.glob<{ default: Component }>([
  "../examples/*.tsx",
  "!../examples/_*.tsx",
]);

const sources = import.meta.glob<string>(
  ["../examples/*.tsx", "!../examples/_*.tsx"],
  {
    import: "default",
    query: "?raw",
  }
);

export const examples = new Map(
  Object.entries(modules).map(([path, load]): [string, Component] => [
    path.slice("../examples/".length, -".tsx".length),
    lazy(load),
  ])
);

export async function loadExampleSource(slug: string) {
  const load = sources[`../examples/${slug}.tsx`];
  const source = await load?.();

  return source?.replaceAll("../registry/ui/", "#components/ui/");
}

const helpers = import.meta.glob<string>(
  ["../examples/_*.tsx", "../examples/_*.ts"],
  { import: "default", query: "?raw" }
);

export async function loadExampleFiles(slug: string) {
  const primary = await loadExampleSource(slug);

  if (primary === undefined) {
    throw new Error(`No source for example ${slug}`);
  }

  const files = [{ code: primary, name: `${slug}.tsx` }];
  const seen = new Set<string>();

  async function includeHelpers(code: string) {
    const names = [
      ...code.matchAll(/from ["']\.\/(?<name>_[^"']+)["']/gu),
    ].flatMap((match) => {
      const name = match.groups?.name;

      return name !== undefined && !seen.has(name) ? [name] : [];
    });

    for (const name of names) {
      seen.add(name);
    }

    const loaded = await Promise.all(
      names.map(async (name) => {
        const extension =
          helpers[`../examples/${name}.tsx`] === undefined ? ".ts" : ".tsx";

        const load = helpers[`../examples/${name}${extension}`];

        if (load === undefined) {
          throw new Error(`Missing example dependency ${name}`);
        }

        const source = await load();

        return {
          code: source.replaceAll("../registry/ui/", "#components/ui/"),
          name: `${name}${extension}`,
        };
      })
    );

    files.push(...loaded);
    await Promise.all(
      loaded.map(async (file) => {
        await includeHelpers(file.code);
      })
    );
  }

  await includeHelpers(primary);

  return files;
}
