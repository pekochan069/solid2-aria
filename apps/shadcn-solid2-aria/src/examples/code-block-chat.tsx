/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/code-block-chat.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { For } from "solid-js";

import { Bubble, BubbleContent } from "../registry/ui/bubble";
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from "../registry/ui/code-block";
import { Message, MessageContent } from "../registry/ui/message";
import { useHighlightedCode } from "./_support";

const code = `import { streamText } from "ai"

export async function POST(request: Request) {
  const { messages } = await request.json()

  const result = streamText({
    model: "anthropic/claude-sonnet-4.5",
    messages,
  })

  return result.toUIMessageStreamResponse()
}`;

export function CodeBlockChat() {
  const lines = useHighlightedCode(
    () => code,
    () => "ts"
  );

  return (
    <div class="flex w-full max-w-md flex-col gap-4 text-sm">
      <Message align="end">
        <MessageContent>
          <Bubble variant="muted">
            <BubbleContent>How do I stream a response?</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message>
        <MessageContent class="gap-3">
          <p>Create a route handler that returns the stream:</p>
          <CodeBlock>
            <CodeBlockHeader>
              <CodeBlockTitle>app/api/chat/route.ts</CodeBlockTitle>
              <CodeBlockActions>
                <CodeBlockCopyButton value={code} />
              </CodeBlockActions>
            </CodeBlockHeader>
            <CodeBlockContent>
              {
                <For each={lines()}>
                  {(line, _index) => <CodeBlockLine>{line}</CodeBlockLine>}
                </For>
              }
            </CodeBlockContent>
          </CodeBlock>
          <p>The client reads it with useChat.</p>
        </MessageContent>
      </Message>
    </div>
  );
}

export default CodeBlockChat;
