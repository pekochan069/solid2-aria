import { dynamic } from "@solidjs/web";
import { lazy } from "solid-js";
import type { Component } from "solid-js";

import type { MarkdownContentProps, MarkdownComponents } from "./markdown";

interface DocumentModule {
  default: Component<MarkdownContentProps>;
  __markdownComponents: MarkdownComponents;
}

const modules = import.meta.glob<DocumentModule>("../../content/docs/**/*.mdx");

const sources = import.meta.glob<string>("../../content/docs/**/*.mdx", {
  import: "default",
  query: "?raw",
});

const documents = new Map(
  Object.entries(modules).map(([path, load]) => [
    path.slice("../../content/docs/".length, -4),
    lazy(load),
  ])
);

export function Document(props: { slug: string }) {
  const Content = dynamic(() => documents.get(props.slug));

  return (
    <div>
      <Content />
    </div>
  );
}

export async function loadDocument(slug: string) {
  const load = sources[`../../content/docs/${slug}.mdx`];

  if (!load) {
    return null;
  }

  const source = await load();

  const raw = source
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/u, "")
    .replaceAll(
      /```[^\n]*\n[\s\S]*?```|\{\/\*[\s\S]*?\*\/\}|^import\s[\s\S]*?from\s+["'][^"']+["'];?\s*$/gmu,
      (block) => (block.startsWith("```") ? block : "")
    )
    .trim();

  const seen = new Map<string, number>();

  const sections = [
    ...raw
      .replaceAll(/```[^\n]*\n[\s\S]*?```/gu, "")
      .matchAll(/^(?<depth>#{2,3})\s+(?<heading>.+)$/gmu),
  ].map((match) => {
    const heading = match.groups?.heading;
    const depth = match.groups?.depth;

    if (heading === undefined || depth === undefined) {
      throw new Error("Invalid document heading");
    }

    const title = heading.replaceAll(/[`*_]/gu, "");

    const base = title
      .toLowerCase()
      .replaceAll(/[^\p{L}\p{N}\s-]/gu, "")
      .replaceAll(/\s/gu, "-");

    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);

    return {
      depth: depth.length,
      id: count === 0 ? base : `${base}-${count}`,
      title,
    };
  });

  return { raw, sections };
}
