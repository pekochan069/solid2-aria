/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/code-block-markdown.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import type { ComponentProps } from "@solidjs/web";
import { omit, createMemo, For } from "solid-js";

import { Bubble, BubbleContent } from "../registry/ui/bubble";
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
import { Message, MessageContent } from "../registry/ui/message";
import { useChat, createChat, getMessageText } from "./_chat";
import { Streamdown, useIsCodeFenceIncomplete } from "./_markdown";
import type { ExtraProps } from "./_markdown";
import { useHighlightedCode } from "./_support";

const response =
  'Wrap the source accessor in `createDebounced`. It delays updates until the input stops changing.\n\n```ts\nimport { createEffect, createSignal, untrack, type Accessor } from "solid-js";\n\nexport function createDebounced<T>(source: Accessor<T>, delay = 300) {\n  const [value, setValue] = createSignal<T>(untrack(source));\n  createEffect(source, (next) => {\n    const timer = setTimeout(() => setValue(() => next), delay);\n    return () => clearTimeout(timer);\n  });\n  return value;\n}\n```\n\nRead the returned accessor when displaying the result.';

const chat = createChat()
  .user("How do I debounce a search input in Solid?")
  .assistant(({ writer }) => {
    writer.text(response);
  });

const transcript = chat.get();
const [question] = chat.get(1);
const transport = chat.transport({ delayMs: 30 });

function MarkdownCodeBlock(componentProps: { code: string; language: string }) {
  // True while the closing fence has not arrived yet.
  const incomplete = useIsCodeFenceIncomplete();

  const lines = useHighlightedCode(
    () => componentProps.code,
    () => componentProps.language
  );

  return (
    <CodeBlock>
      <CodeBlockHeader>
        <CodeBlockTitle>{componentProps.language || "text"}</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton
            value={componentProps.code}
            isDisabled={incomplete()}
          />
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
  );
}

function MarkdownCode(componentProps: ComponentProps<"code"> & ExtraProps) {
  const props = omit(componentProps, "node", "class", "children");

  // Streamdown marks fenced code with data-block. Everything else is inline.
  return (
    <>
      {"data-block" in props ? (
        <MarkdownCodeBlock
          code={
            typeof componentProps.children === "string"
              ? componentProps.children
              : ""
          }
          language={
            /language-(?<language>\S+)/u.exec(
              typeof componentProps.class === "string"
                ? componentProps.class
                : ""
            )?.groups?.language ?? ""
          }
        />
      ) : (
        <code
          class="bg-muted rounded-sm px-1 py-0.5 font-mono text-[0.9em]"
          {...props}
        >
          {componentProps.children}
        </code>
      )}
    </>
  );
}

const components = { code: MarkdownCode };

export function CodeBlockMarkdown() {
  const { messages, sendMessage, setMessages, status } = useChat({
    messages: transcript,
    transport,
  });

  const busy = createMemo(
    () => status() === "submitted" || status() === "streaming"
  );

  return (
    <div class="flex min-h-112 w-full max-w-md flex-col gap-4 py-6 text-sm">
      {
        <For each={messages()}>
          {(message) =>
            message.role === "user" ? (
              <Message align="end">
                <MessageContent>
                  <Bubble align="end" variant="muted">
                    <BubbleContent>{getMessageText(message)}</BubbleContent>
                  </Bubble>
                </MessageContent>
              </Message>
            ) : (
              <Message>
                <MessageContent>
                  <Streamdown
                    controls={false}
                    components={components}
                    isAnimating={busy() && message === messages().at(-1)}
                  >
                    {getMessageText(message)}
                  </Streamdown>
                </MessageContent>
              </Message>
            )
          }
        </For>
      }
      {!busy() && (
        <Button
          variant="outline"
          size="sm"
          class="mt-auto self-start"
          onPress={() => {
            setMessages([]);
            void sendMessage(question);
          }}
        >
          Replay
        </Button>
      )}
    </div>
  );
}

export default CodeBlockMarkdown;
