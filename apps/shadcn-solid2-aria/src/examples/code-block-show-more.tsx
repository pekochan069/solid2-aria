/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/code-block-show-more.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ChevronDownIcon } from "@lucide/solid";
import { createUniqueId, createSignal, For } from "solid-js";

import { Button } from "../registry/ui/button";
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockFooter,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from "../registry/ui/code-block";
import { useHighlightedCode } from "./_support";

const code = `import { createSignal, For } from "solid-js";
import { Button } from "#components/ui/button";
import { Input } from "#components/ui/input";

export function Chat() {
  const [input, setInput] = createSignal("");
  const [messages, setMessages] = createSignal<string[]>([]);

  return (
    <div class="flex flex-col gap-4">
      <For each={messages()}>
        {(message) => <p>{message}</p>}
      </For>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const text = input().trim();
          if (!text) return;
          setMessages((previous) => [...previous, text]);
          setInput("");
        }}
      >
        <Input value={input()} onInput={(event) => setInput(event.currentTarget.value)} />
        <Button type="submit" isDisabled={!input().trim()}>Send</Button>
      </form>
    </div>
  );
}`;

export function CodeBlockShowMore() {
  const [expanded, setExpanded] = createSignal(false);

  const lines = useHighlightedCode(
    () => code,
    () => "tsx"
  );

  const id = createUniqueId();

  return (
    <div class="w-full max-w-md">
      <CodeBlock>
        <CodeBlockHeader>
          <CodeBlockTitle>components/chat.tsx</CodeBlockTitle>
          <CodeBlockActions>
            <CodeBlockCopyButton value={code} />
          </CodeBlockActions>
        </CodeBlockHeader>
        <CodeBlockContent
          id={id}
          lineNumbers
          class={
            expanded() ? undefined : "scroll-fade-y max-h-64 overflow-y-hidden"
          }
        >
          {
            <For each={lines()}>
              {(line, _index) => <CodeBlockLine>{line}</CodeBlockLine>}
            </For>
          }
        </CodeBlockContent>
        <CodeBlockFooter class="justify-center">
          <Button
            variant="ghost"
            size="xs"
            aria-expanded={expanded()}
            aria-controls={id}
            onPress={() => {
              setExpanded(!expanded());
            }}
          >
            <ChevronDownIcon class="transition-transform in-aria-expanded:rotate-180" />
            {expanded() ? "Show less" : "Show more"}
          </Button>
        </CodeBlockFooter>
      </CodeBlock>
    </div>
  );
}

export default CodeBlockShowMore;
