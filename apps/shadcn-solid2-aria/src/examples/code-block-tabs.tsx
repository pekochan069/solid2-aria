/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/code-block-tabs.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { For } from "solid-js";

import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from "../registry/ui/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../registry/ui/tabs";
import { useHighlightedCode } from "./_support";

const files = [
  {
    code: `import { streamText } from "ai"

export async function POST(request: Request) {
  const { messages } = await request.json()
  const result = streamText({ model: "anthropic/claude-sonnet-4.5", messages })

  return result.toUIMessageStreamResponse()
}`,
    id: "route",
    language: "ts",
    title: "app/api/chat/route.ts",
  },
  {
    code: `import { createSignal } from "solid-js"
import { Button } from "#components/ui/button"

export function Counter() {
  const [count, setCount] = createSignal(0)

  return <Button onPress={() => setCount(value => value + 1)}>{count()}</Button>
}`,
    id: "chat",
    language: "tsx",
    title: "components/chat.tsx",
  },
  {
    code: "AI_GATEWAY_API_KEY=your-api-key",
    id: "env",
    language: "bash",
    title: ".env.local",
  },
];

function FileCode(componentProps: { code: string; language: string }) {
  const lines = useHighlightedCode(
    () => componentProps.code,
    () => componentProps.language
  );

  return (
    <CodeBlockContent lineNumbers>
      {
        <For each={lines()}>
          {(line, _index) => <CodeBlockLine>{line}</CodeBlockLine>}
        </For>
      }
    </CodeBlockContent>
  );
}

export function CodeBlockTabs() {
  return (
    <Tabs defaultSelectedKey="route" class="w-full max-w-md">
      <TabsList>
        {
          <For each={files}>
            {(file) => (
              <TabsTrigger id={file.id}>
                {file.title.split("/").at(-1)}
              </TabsTrigger>
            )}
          </For>
        }
      </TabsList>
      {
        <For each={files}>
          {(file) => (
            <TabsContent id={file.id}>
              <CodeBlock>
                <CodeBlockHeader>
                  <CodeBlockTitle>{file.title}</CodeBlockTitle>
                  <CodeBlockActions>
                    <CodeBlockCopyButton value={file.code} />
                  </CodeBlockActions>
                </CodeBlockHeader>
                <FileCode code={file.code} language={file.language} />
              </CodeBlock>
            </TabsContent>
          )}
        </For>
      }
    </Tabs>
  );
}

export default CodeBlockTabs;
