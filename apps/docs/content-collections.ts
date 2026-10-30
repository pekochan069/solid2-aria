import path from "node:path";

import type { CollectionContext, Meta } from "@content-collections/core";
import {
  createDefaultImport,
  createNamedImport,
  defineCollection,
  defineConfig,
} from "@content-collections/core";
import { z } from "zod";

import type { MarkdownDocument } from "./src/components/markdown";

// oxlint-disable-next-line sort-keys
const docsSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  content: z.string(),
});

function withMarkdown<T extends { _meta: Meta }>(
  document: T,
  context: { collection: CollectionContext<T>["collection"] }
) {
  const modulePath = path.resolve(
    context.collection.directory,
    document._meta.filePath
  );

  return {
    ...document,
    Content: createDefaultImport<MarkdownDocument["Content"]>(modulePath),
    components: createNamedImport<MarkdownDocument["components"]>(
      "__markdownComponents",
      modulePath
    ),
  };
}

const solid2StatelyDocs = defineCollection({
  directory: "content/solid2-stately",
  include: "**/*.mdx",
  name: "solid2StatelyDocs",
  schema: docsSchema,
  transform: withMarkdown,
});

const solid2AriaDocs = defineCollection({
  directory: "content/solid2-aria",
  include: "**/*.mdx",
  name: "solid2AriaDocs",
  schema: docsSchema,
  transform: withMarkdown,
});

const solid2AriaComponentsDocs = defineCollection({
  directory: "content/solid2-aria-components",
  include: "**/*.mdx",
  name: "solid2AriaComponentsDocs",
  schema: docsSchema,
  transform: withMarkdown,
});

export default defineConfig({
  content: [solid2StatelyDocs, solid2AriaDocs, solid2AriaComponentsDocs],
});
