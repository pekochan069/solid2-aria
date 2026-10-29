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

export function vitePluginSatteri(
  options: {
    codeBlockImport?: string;
  } = {}
) {
  return {
    enforce: "pre",
    name: "vite-plugin-satteri",
    transform: {
      filter: { id: /\.mdx$/u },
      // oxlint-disable-next-line typescript/no-invalid-void-type
      async handler(this: void, source, id) {
        const tags = new Set<string>();

        const codeBlocks = defineMdastPlugin({
          code(node, context) {
            const title =
              /\btitle=(?:"(?<double>[^"]*)"|'(?<single>[^']*)')/u.exec(
                node.meta ?? ""
              );

            const attributes: MdxJsxAttributeUnion[] = [
              {
                name: "code",
                type: "mdxJsxAttribute",
                value: {
                  type: "mdxJsxAttributeValueExpression",
                  value: JSON.stringify(node.value),
                },
              },
              {
                name: "language",
                type: "mdxJsxAttribute",
                value: {
                  type: "mdxJsxAttributeValueExpression",
                  value: JSON.stringify(node.lang ?? "text"),
                },
              },
            ];

            if (title) {
              attributes.push({
                name: "title",
                type: "mdxJsxAttribute",
                value: {
                  type: "mdxJsxAttributeValueExpression",
                  value: JSON.stringify(
                    title.groups?.double ?? title.groups?.single ?? ""
                  ),
                },
              });
            }

            if (/(?:^|\s)showLineNumbers(?:\s|$)/u.test(node.meta ?? "")) {
              attributes.push({
                name: "showLineNumbers",
                type: "mdxJsxAttribute",
                value: {
                  type: "mdxJsxAttributeValueExpression",
                  value: "true",
                },
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

        const codeBlockImport = `import { CodeBlock as __Solid2AriaCodeBlock } from ${JSON.stringify(options.codeBlockImport ?? "#components/markdown/code-block")};`;

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

        // The preloaded module's default export is used directly by lazy hydration.
        // It must supply native components itself, rather than relying on its loader.
        const components = [...tags].map(
          (tag) => `${JSON.stringify(tag)}: (props) => <${tag} {...props} />`
        );

        const defaultExport = /^export default MDXContent;$/mu;

        if (!defaultExport.test(code)) {
          throw new Error(`Missing MDX default export in ${id}`);
        }

        const content = code.replace(
          defaultExport,
          `
import { untrack as __solidUntrack } from "solid-js";
export default function SolidMarkdown(props) {
  const components = __solidUntrack(() => ({ ...__markdownComponents, ...props.components }));
  return <MDXContent {...props} components={components} />;
}`
        );

        return {
          code: `${content}\nexport const __markdownComponents = {${components.join(",")}};\n`,
          map: null,
        };
      },
    },
  } satisfies Plugin;
}
