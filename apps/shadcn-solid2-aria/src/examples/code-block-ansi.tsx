/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/code-block-ansi.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { TerminalIcon } from "@lucide/solid";
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

const output = `$ pnpm test
  // oxlint-disable-next-line eslint/no-control-regex -- ANSI escape sequences begin with the ESC control character.
\u001B[32m✓\u001B[39m src/format.test.ts \u001B[2m(4 tests)\u001B[22m
\u001B[32m✓\u001B[39m src/parse.test.ts \u001B[2m(7 tests)\u001B[22m
\u001B[31m✗\u001B[39m src/stream.test.ts \u001B[2m(3 tests | 1 failed)\u001B[22m

\u001B[31mAssertionError: expected 'hello' to be 'hello world'\u001B[39m

Tests  \u001B[31m1 failed\u001B[39m | \u001B[32m13 passed\u001B[39m (14)`;

export function CodeBlockAnsi() {
  const lines = useHighlightedCode(
    () => output,
    () => "ansi"
  );

  return (
    <div class="w-full max-w-md">
      <CodeBlock>
        <CodeBlockHeader>
          <CodeBlockTitle>
            <TerminalIcon />
            Terminal
          </CodeBlockTitle>
          <CodeBlockActions>
            <CodeBlockCopyButton
              // oxlint-disable-next-line eslint/no-control-regex -- Match ANSI ESC control sequences.
              value={output.replaceAll(/\u001B\[[\d;]*m/gu, "")}
            />
          </CodeBlockActions>
        </CodeBlockHeader>
        <CodeBlockContent wrap>
          {
            <For each={lines()}>
              {(line, _index) => <CodeBlockLine>{line}</CodeBlockLine>}
            </For>
          }
        </CodeBlockContent>
      </CodeBlock>
    </div>
  );
}

export default CodeBlockAnsi;
