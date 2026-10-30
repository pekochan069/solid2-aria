import { pathToFileURL } from "node:url";

import type {
  MdxJsxAttributeUnion,
  MdxJsxFlowElementHast,
  MdxJsxTextElementHast,
} from "satteri";
import { defineHastPlugin, defineMdastPlugin, mdxToJs } from "satteri";
import { satteriAutolinkHeadings } from "satteri-autolink-headings";
import satteriCallouts from "satteri-callouts";
import { satteriSlug } from "satteri-slug";
import type { Plugin } from "vite";

export function vitePluginSatteri(): Plugin {
  return {
    enforce: "pre",
    name: "vite-plugin-satteri",
    transform: {
      filter: { id: /\.mdx$/u },
      async handler(source, id) {
        const tags = new Set<string>();

        const codeBlocks = defineMdastPlugin({
          code(node, context) {
            const title =
              /\btitle=(?:"(?<double>[^"]*)"|'(?<single>[^']*)')/u.exec(
                node.meta ?? ""
              );

            const attributes: MdxJsxAttributeUnion[] = [
              { name: "code", type: "mdxJsxAttribute", value: node.value },
              {
                name: "language",
                type: "mdxJsxAttribute",
                value: node.lang ?? "text",
              },
            ];

            if (title) {
              attributes.push({
                name: "title",
                type: "mdxJsxAttribute",
                value: title.groups?.double ?? title.groups?.single ?? "",
              });
            }

            context.replaceNode(node, {
              attributes,
              children: [],
              name: "__Solid2AriaCodeBlock",
              type: "mdxJsxFlowElement",
            });
          },
          name: "solid-markdown-code-blocks",
        });

        const collectJsxTag = {
          filter: [],
          visit(node: MdxJsxFlowElementHast | MdxJsxTextElementHast) {
            if (node.name !== null && /^[a-z][\w-]*$/u.test(node.name)) {
              tags.add(node.name);
            }
          },
        };

        const collectTags = defineHastPlugin({
          element: {
            filter: [],
            visit(node) {
              tags.add(node.tagName);
            },
          },
          mdxJsxFlowElement: collectJsxTag,
          mdxJsxTextElement: collectJsxTag,
          name: "solid-markdown-tags",
        });

        const codeBlockImport = `import { CodeBlock as __Solid2AriaCodeBlock } from ${JSON.stringify(new URL("../src/components/markdown/code-block", import.meta.url).pathname)};`;

        const { code } = await mdxToJs(`${source}\n\n${codeBlockImport}\n`, {
          elementAttributeNameCase: "html",
          features: { frontmatter: true, gfm: true },
          fileURL: pathToFileURL(id),
          hastPlugins: [
            satteriSlug(),
            satteriAutolinkHeadings({
              behavior: "append",
              content: {
                children: [
                  {
                    type: "text",
                    value: "#",
                  },
                ],
                properties: {
                  className: ["anchor-icon"],
                  "data-pagefind-ignore": true,
                },
                tagName: "span",
                type: "element",
              },
              properties: {
                className: ["anchor"],
              },
            }),
            satteriCallouts(),
            collectTags,
          ],
          jsx: true,
          jsxImportSource: "@solidjs/web",
          mdastPlugins: [codeBlocks],
          stylePropertyNameCase: "css",
        });

        // Solid calls component references as functions. Supply native tag
        // components for Satteri's string defaults through Markdown's props.
        const components = [...tags].map(
          (tag) => `${JSON.stringify(tag)}: (props) => <${tag} {...props} />`
        );

        return {
          code: `${code}\nexport const __markdownComponents = {${components.join(",")}};\n`,
          map: null,
        };
      },
    },
  };
}
