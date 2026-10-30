import type { ComponentProps, JSX } from "@solidjs/web";
import { dynamic } from "@solidjs/web";
import {
  Switch,
  Match,
  createContext,
  createMemo,
  For,
  useContext,
} from "solid-js";

export interface ExtraProps {
  "data-block"?: boolean;
  node?: unknown;
}

type CodeComponent = (
  props: ComponentProps<"code"> & ExtraProps
) => JSX.Element;

type Block =
  | { kind: "paragraph" | "quote"; text: string }
  | { kind: "heading"; text: string; level: number }
  | { kind: "code"; text: string; language: string; incomplete: boolean }
  | { kind: "list"; ordered: boolean; items: string[] }
  | { kind: "rule" };

const FenceContext = createContext<{ incomplete: boolean }>();

export function useIsCodeFenceIncomplete() {
  const fence = useContext(FenceContext);

  return () => fence.incomplete;
}

function parseFence(lines: string[], start: number, fence: RegExpExecArray) {
  let index = start;
  const marker = fence.groups?.marker ?? "```";
  const content: string[] = [];
  let closed = false;
  index += 1;

  while (index < lines.length) {
    const next = lines[index] ?? "";

    if (
      next.trim().startsWith(marker) &&
      !next.trim().slice(marker.length).trim()
    ) {
      closed = true;
      index += 1;
      break;
    }

    content.push(next);
    index += 1;
  }

  const block: Block = {
    incomplete: !closed,
    kind: "code",
    language: (fence.groups?.language ?? "").trim().split(/\s/u)[0] ?? "",
    text: content.join("\n"),
  };

  return { block, next: index };
}

function parseList(lines: string[], start: number, list: RegExpExecArray) {
  let index = start;
  const ordered = list.groups?.bullet === undefined;
  const items: string[] = [];

  while (index < lines.length) {
    const item = /^\s*(?:(?<bullet>[-+*])|\d+[.)])\s+(?<text>.+)$/u.exec(
      lines[index] ?? ""
    );

    if (!item || (item[1] === undefined) !== ordered) {
      break;
    }

    items.push(item.groups?.text ?? "");
    index += 1;
  }

  const block: Block = { items, kind: "list", ordered };

  return { block, next: index };
}

function parseQuote(lines: string[], start: number) {
  let index = start;
  const quote: string[] = [];

  while (index < lines.length && /^\s*>/u.test(lines[index] ?? "")) {
    quote.push((lines[index] ?? "").replace(/^\s*>\s?/u, ""));
    index += 1;
  }

  const block: Block = { kind: "quote", text: quote.join("\n") };

  return { block, next: index };
}

function parseBlocks(source: string): Block[] {
  const lines = source.replaceAll(/\r\n?/gu, "\n").split("\n");
  const blocks: Block[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (line === undefined) {
      break;
    }

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const fence = /^\s{0,3}(?<marker>`{3,}|~{3,})(?<language>[^`~]*)$/u.exec(
      line
    );

    if (fence) {
      const result = parseFence(lines, index, fence);
      blocks.push(result.block);
      index = result.next;
      continue;
    }

    const heading = /^(?<level>#{1,6})\s+(?<text>.+?)\s*#*\s*$/u.exec(line);

    if (heading) {
      blocks.push({
        kind: "heading",
        level: heading.groups?.level?.length ?? 1,
        text: heading.groups?.text ?? "",
      });
      index += 1;
      continue;
    }

    if (/^\s*(?:---+|\*\*\*+|___+)\s*$/u.test(line)) {
      blocks.push({ kind: "rule" });
      index += 1;
      continue;
    }

    const list = /^\s*(?:(?<bullet>[-+*])|\d+[.)])\s+(?<text>.+)$/u.exec(line);

    if (list) {
      const result = parseList(lines, index, list);
      blocks.push(result.block);
      index = result.next;
      continue;
    }

    if (/^\s*>/u.test(line)) {
      const result = parseQuote(lines, index);
      blocks.push(result.block);
      index = result.next;
      continue;
    }

    const paragraph = [line];
    index += 1;

    while (index < lines.length) {
      const next = lines[index] ?? "";

      if (
        !next.trim() ||
        /^\s*(?:#{1,6}\s|`{3,}|~{3,}|>|[-+*]\s|\d+[.)]\s)/u.test(next)
      ) {
        break;
      }

      paragraph.push(next);
      index += 1;
    }

    blocks.push({ kind: "paragraph", text: paragraph.join("\n") });
  }

  return blocks;
}

function Inline(props: { text: string }) {
  const tokens = createMemo(() =>
    props.text.split(
      /(?<token>`+[^`]+`+|\*\*[^*]+\*\*|__[^_]+__|\*[^*\n]+\*|_[^_\n]+_|~~[^~]+~~|\[[^\]]+\]\([^\s)]+\))/gu
    )
  );

  return (
    <For each={tokens()} keyed={false}>
      {(token) => {
        const value = () => token();

        const link = () =>
          /^\[(?<label>[^\]]+)\]\((?<href>[^\s)]+)\)$/u.exec(value());

        return (
          <>
            {
              <Switch fallback={value()}>
                <Match when={value().startsWith("`")}>
                  {
                    <code class="bg-muted rounded-sm px-1 py-0.5 font-mono text-[0.9em]">
                      {value().replaceAll(/^`+|`+$/gu, "")}
                    </code>
                  }
                </Match>
                <Match when={/^(?:\*\*|__)/u.test(value())}>
                  {<strong>{value().slice(2, -2)}</strong>}
                </Match>
                <Match when={/^\*[^*]|^_[^_]/u.test(value())}>
                  {<em>{value().slice(1, -1)}</em>}
                </Match>
                <Match when={value().startsWith("~~")}>
                  {<del>{value().slice(2, -2)}</del>}
                </Match>
                <Match when={link()}>
                  {
                    <a
                      class="underline underline-offset-4"
                      href={
                        /^(?:https?:|mailto:|\/|#)/u.test(
                          link()?.groups?.href ?? ""
                        )
                          ? link()?.groups?.href
                          : undefined
                      }
                    >
                      {link()?.groups?.label}
                    </a>
                  }
                </Match>
              </Switch>
            }
          </>
        );
      }}
    </For>
  );
}

function CodeFence(props: {
  block: Extract<Block, { kind: "code" }>;
  component?: CodeComponent;
}) {
  const context = {
    get incomplete() {
      return props.block.incomplete;
    },
  };

  const Code = dynamic(() => props.component ?? "code");

  return (
    <FenceContext value={context}>
      {props.component ? (
        <Code class={`language-${props.block.language}`} data-block>
          {props.block.text}
        </Code>
      ) : (
        <pre class="bg-muted overflow-auto rounded-lg p-4">
          <code>{props.block.text}</code>
        </pre>
      )}
    </FenceContext>
  );
}

export function Streamdown(props: {
  children: string;
  controls?: boolean;
  isAnimating?: boolean;
  components?: { code: CodeComponent };
  class?: string;
}) {
  const blocks = createMemo(() => parseBlocks(props.children));

  return (
    <div class={["space-y-4", props.class]}>
      <For each={blocks()}>
        {(block) => {
          switch (block.kind) {
            case "code": {
              return (
                <CodeFence block={block} component={props.components?.code} />
              );
            }

            case "heading": {
              const Heading = dynamic(() =>
                (() => {
                  if (block.level === 1) {
                    return "h1";
                  }

                  if (block.level === 2) {
                    return "h2";
                  }

                  if (block.level === 3) {
                    return "h3";
                  }

                  return "h4";
                })()
              );

              return (
                <Heading class="font-semibold">
                  <Inline text={block.text} />
                </Heading>
              );
            }

            case "list": {
              return block.ordered ? (
                <ol class="list-decimal space-y-1 pl-6">
                  <For each={block.items}>
                    {(item) => (
                      <li>
                        <Inline text={item} />
                      </li>
                    )}
                  </For>
                </ol>
              ) : (
                <ul class="list-disc space-y-1 pl-6">
                  <For each={block.items}>
                    {(item) => (
                      <li>
                        <Inline text={item} />
                      </li>
                    )}
                  </For>
                </ul>
              );
            }

            case "quote": {
              return (
                <blockquote class="text-muted-foreground border-l-2 pl-4">
                  <Inline text={block.text} />
                </blockquote>
              );
            }

            case "rule": {
              return <hr class="border-border" />;
            }

            case "paragraph": {
              return (
                <p>
                  <Inline text={block.text} />
                </p>
              );
            }

            default: {
              const unexpected: never = block;

              return unexpected;
            }
          }
        }}
      </For>
    </div>
  );
}

export function Markdown(props: { children?: JSX.Element; class?: string }) {
  return (
    <>
      {typeof props.children === "string" ? (
        <Streamdown class={props.class}>{props.children}</Streamdown>
      ) : (
        <div class={props.class}>{props.children}</div>
      )}
    </>
  );
}
