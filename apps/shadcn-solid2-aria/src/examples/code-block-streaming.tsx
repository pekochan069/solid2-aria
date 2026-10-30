/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/code-block-streaming.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { RotateCcwIcon } from "@lucide/solid";
import { createMemo, createEffect, createSignal, For } from "solid-js";

import { Button } from "../registry/ui/button";
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from "../registry/ui/code-block";
import { useHighlightedCode } from "./_support";

const blocks: {
  title?: string;
  language: string;
  code: string;
  lineNumbers?: boolean;
  highlight?: number[];
  diff?: boolean;
}[] = [
  {
    code: `import { createEffect, createSignal, untrack, type Accessor } from "solid-js";

export function createDebounced<T>(source: Accessor<T>, delay = 300) {
  const [value, setValue] = createSignal<T>(untrack(source));
  createEffect(source, (next) => {
    const timer = setTimeout(() => setValue(() => next), delay);
    return () => clearTimeout(timer);
  });
  return value;
}`,
    language: "ts",
    lineNumbers: true,
    title: "lib/create-debounced.ts",
  },
  {
    code: "bun run generate:ui",
    language: "bash",
  },
  {
    code: ` import { createSignal } from "solid-js";
 export function Search() {
   const [query, setQuery] = createSignal("");
-  const results = createSearch(query);
+  const debounced = createDebounced(query, 300);
+  const results = createSearch(debounced);
   return <SearchResults results={results()} />;
 }`,
    diff: true,
    language: "tsx",
    lineNumbers: true,
    title: "components/search.tsx",
  },
  {
    code: `import { streamText } from "ai"

export async function POST(request: Request) {
  const { messages } = await request.json()

  const result = streamText({
    model: "anthropic/claude-sonnet-4.5",
    messages,
  })

  return result.toUIMessageStreamResponse()
}`,
    highlight: [5, 6, 7, 8],
    language: "ts",
    lineNumbers: true,
    title: "app/api/chat/route.ts",
  },
  {
    code: "AI_GATEWAY_API_KEY=your-api-key",
    language: "bash",
    title: ".env.local",
  },
];

// Where each block starts in the stream.
const offsets = blocks.map((_, index) =>
  blocks.slice(0, index).reduce((total, block) => total + block.code.length, 0)
);

const total = blocks.reduce((sum, block) => sum + block.code.length, 0);

function StreamingBlock(componentProps: {
  block: (typeof blocks)[number];
  code: string;
}) {
  const rows = createMemo(() => componentProps.code.split("\n"));

  // A diff row starts with +, - or a space. The marker is not part of the code.
  const source = createMemo(() =>
    componentProps.block.diff === true
      ? rows()
          .map((row) => row.slice(1))
          .join("\n")
      : componentProps.code
  );

  const lines = useHighlightedCode(
    () => source(),
    () => componentProps.block.language
  );

  return (
    <CodeBlock>
      {Boolean(componentProps.block.title) && (
        <CodeBlockHeader>
          <CodeBlockTitle>{componentProps.block.title}</CodeBlockTitle>
          <CodeBlockActions>
            <CodeBlockCopyButton
              value={source()}
              isDisabled={
                componentProps.code.length < componentProps.block.code.length
              }
            />
          </CodeBlockActions>
        </CodeBlockHeader>
      )}
      <CodeBlockContent lineNumbers={componentProps.block.lineNumbers}>
        {
          <For each={lines()}>
            {(line, index) => (
              <CodeBlockLine
                variant={(() => {
                  if (componentProps.block.diff === true) {
                    if (rows()[index()]?.startsWith("+") === true) {
                      return "added";
                    }

                    if (rows()[index()]?.startsWith("-") === true) {
                      return "removed";
                    }

                    return "default";
                  }

                  if (
                    componentProps.block.highlight?.includes(index()) === true
                  ) {
                    return "highlighted";
                  }

                  return "default";
                })()}
              >
                {line}
              </CodeBlockLine>
            )}
          </For>
        }
      </CodeBlockContent>
    </CodeBlock>
  );
}

export function CodeBlockStreaming() {
  const [length, setLength] = createSignal(total);

  createEffect(
    () => [length()],
    () => {
      if (length() >= total) {
        return;
      }

      const timeout = setTimeout(() => {
        setLength(length() + 3);
      }, 16);

      // oxlint-disable-next-line typescript/consistent-return -- Setup returns cleanup only when the observed element exists.
      return () => {
        clearTimeout(timeout);
      };
    }
  );

  return (
    <div class="flex w-full max-w-md flex-col gap-4">
      {
        <For each={blocks}>
          {(block, index) => (
            <>
              {" "}
              {length() > (offsets[index()] ?? 0) && (
                <StreamingBlock
                  block={block}
                  code={block.code.slice(0, length() - (offsets[index()] ?? 0))}
                />
              )}
            </>
          )}
        </For>
      }
      <Button
        variant="outline"
        size="sm"
        class="self-start"
        isDisabled={length() < total}
        onPress={() => {
          setLength(0);
        }}
      >
        <RotateCcwIcon />
        Replay
      </Button>
    </div>
  );
}

export default CodeBlockStreaming;
