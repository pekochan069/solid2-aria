/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/code-block-highlighted-lines.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { For } from "solid-js";

import {
  CodeBlock,
  CodeBlockContent,
  CodeBlockLine,
} from "../registry/ui/code-block";

const code = `export default {
  experimental: {
    reactCompiler: true,
    viewTransition: true,
  },
  images: {
    remotePatterns: [{ hostname: "avatars.githubusercontent.com" }],
  },
}`;

const highlighted = new Set([2, 3]);

export function CodeBlockHighlightedLines() {
  return (
    <div class="w-full max-w-md">
      <CodeBlock>
        <CodeBlockContent lineNumbers>
          {
            <For each={code.split("\n")}>
              {(line, index) => (
                <CodeBlockLine
                  variant={highlighted.has(index()) ? "highlighted" : "default"}
                >
                  {line}
                </CodeBlockLine>
              )}
            </For>
          }
        </CodeBlockContent>
      </CodeBlock>
    </div>
  );
}

export default CodeBlockHighlightedLines;
