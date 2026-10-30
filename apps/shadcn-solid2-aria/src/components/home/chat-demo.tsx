/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(root)/cards/index.tsx and apps/v4/examples/radix/message-scroller-demo.tsx.
 * Modified for Solid Aria: reuse the Solid 2 message scroller example with the upstream homepage presentation.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { MessageScrollerDemo } from "../../examples/message-scroller-demo";

export function ChatDemo() {
  return (
    <div class="**:[.text-center.text-xs]:hidden">
      <MessageScrollerDemo />
    </div>
  );
}
