/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/code-block-diff.tsx.
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

const patch = ` export function Greeting({ name }: { name: string }) {
-  return <p>Hello, {name}</p>
+  return <p className="text-sm text-muted-foreground">
+    Hello, {name}!
+  </p>
 }`;

function getVariant(line: string) {
  if (line.startsWith("+")) {
    return "added";
  }

  if (line.startsWith("-")) {
    return "removed";
  }

  return "default";
}

export function CodeBlockDiff() {
  return (
    <div class="w-full max-w-md">
      <CodeBlock>
        <CodeBlockHeader>
          <CodeBlockTitle>components/greeting.tsx</CodeBlockTitle>
          <CodeBlockActions>
            <CodeBlockCopyButton value={patch} />
          </CodeBlockActions>
        </CodeBlockHeader>
        <CodeBlockContent>
          {
            <For each={patch.split("\n")}>
              {(line, _index) => (
                <CodeBlockLine variant={getVariant(line)}>
                  {line.slice(1)}
                </CodeBlockLine>
              )}
            </For>
          }
        </CodeBlockContent>
      </CodeBlock>
    </div>
  );
}

export default CodeBlockDiff;
