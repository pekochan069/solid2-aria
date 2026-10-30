import path from "node:path";

import type { CollectionContext, Meta } from "@content-collections/core";
import {
  createDefaultImport,
  createNamedImport,
  defineCollection,
  defineConfig,
} from "@content-collections/core";
import { z } from "zod";

import type { MarkdownDocument } from "./src/lib/markdown";

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

const docs = defineCollection({
  directory: "content/docs",
  include: "**/*.mdx",
  name: "shadcnSolid2AriaDocs",
  schema: docsSchema,
  transform: withMarkdown,
});

export default defineConfig({
  content: [docs],
});
