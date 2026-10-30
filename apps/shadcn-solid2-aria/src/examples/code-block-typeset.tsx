/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/code-block-typeset.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { FileCodeIcon } from "@lucide/solid";
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
import { useHighlightedCode } from "./_support";

const code = `import { streamText } from "ai"

export async function POST(request: Request) {
  const { messages } = await request.json()
  const result = streamText({ model: "anthropic/claude-sonnet-4.5", messages })

  return result.toUIMessageStreamResponse()
}`;

export function CodeBlockTypeset() {
  const lines = useHighlightedCode(
    () => code,
    () => "ts"
  );

  return (
    <div class="typeset w-full max-w-md">
      <h3>Stream a response</h3>
      <p>
        Create a route handler that calls <code>streamText</code> and returns
        the stream to the client.
      </p>
      <CodeBlock>
        <CodeBlockHeader>
          <CodeBlockTitle>
            <FileCodeIcon />
            app/api/chat/route.ts
          </CodeBlockTitle>
          <CodeBlockActions>
            <CodeBlockCopyButton value={code} />
          </CodeBlockActions>
        </CodeBlockHeader>
        <CodeBlockContent lineNumbers>
          {
            <For each={lines()}>
              {(line, _index) => <CodeBlockLine>{line}</CodeBlockLine>}
            </For>
          }
        </CodeBlockContent>
      </CodeBlock>
      <p>
        The <code>useChat</code> hook reads the stream on the client and renders
        the answer while it is written.
      </p>
    </div>
  );
}

export default CodeBlockTypeset;
