/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/resizable-vertical.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../registry/ui/resizable";

export function ResizableVertical() {
  return (
    <ResizablePanelGroup
      orientation="vertical"
      class="min-h-[200px] max-w-sm rounded-lg border"
    >
      <ResizablePanel defaultSize={25}>
        <div class="flex h-full items-center justify-center p-6">
          <span class="font-semibold">Header</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={75}>
        <div class="flex h-full items-center justify-center p-6">
          <span class="font-semibold">Content</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export default ResizableVertical;
