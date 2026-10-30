/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/code-block-floating-actions.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
} from "../registry/ui/code-block";

const output = `$ bun add @solid2-aria/components@^0.0.1
Progress: resolved 412, reused 398, downloaded 14, added 14, done
dependencies:
+ @solid2-aria/components 0.0.1
+ ai 6.0.12
+ zod 4.1.12
Done in 2.8s using bun`;

export function CodeBlockFloatingActions() {
  return (
    <div class="w-full max-w-md">
      <CodeBlock>
        <CodeBlockActions>
          <CodeBlockCopyButton value={output} />
        </CodeBlockActions>
        <CodeBlockContent>{output}</CodeBlockContent>
      </CodeBlock>
    </div>
  );
}

export default CodeBlockFloatingActions;
