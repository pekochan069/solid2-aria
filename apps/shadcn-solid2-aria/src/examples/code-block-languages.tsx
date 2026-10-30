/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/code-block-languages.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { For } from "solid-js";

import {
  CodeBlock,
  CodeBlockContent,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from "../registry/ui/code-block";
import { useHighlightedCode } from "./_support";

const samples = [
  {
    code: `@import "tailwindcss";

:root {
  --radius: 0.625rem;
}`,
    language: "css",
    title: "app/globals.css",
  },
  {
    code: `def greet(name: str) -> str:
    return f"Hello, {name}!"`,
    language: "python",
    title: "main.py",
  },
  {
    code: "A language that is not in the list renders as plain text.",
    language: "text",
    title: "notes.txt",
  },
];

function Sample(componentProps: { code: string; language: string }) {
  const lines = useHighlightedCode(
    () => componentProps.code,
    () => componentProps.language
  );

  return (
    <CodeBlockContent>
      {
        <For each={lines()}>
          {(line, _index) => <CodeBlockLine>{line}</CodeBlockLine>}
        </For>
      }
    </CodeBlockContent>
  );
}

export function CodeBlockLanguages() {
  return (
    <div class="flex w-full max-w-md flex-col gap-4">
      {
        <For each={samples}>
          {(sample) => (
            <CodeBlock>
              <CodeBlockHeader>
                <CodeBlockTitle>{sample.title}</CodeBlockTitle>
              </CodeBlockHeader>
              <Sample code={sample.code} language={sample.language} />
            </CodeBlock>
          )}
        </For>
      }
    </div>
  );
}

export default CodeBlockLanguages;
