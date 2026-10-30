/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/spinner-demo.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Item, ItemContent, ItemMedia, ItemTitle } from "../registry/ui/item";
import { Spinner } from "../registry/ui/spinner";

export function SpinnerDemo() {
  return (
    <div class="flex w-full max-w-xs flex-col gap-4 [--radius:1rem]">
      <Item variant="muted">
        <ItemMedia>
          <Spinner />
        </ItemMedia>
        <ItemContent>
          <ItemTitle class="line-clamp-1">Processing payment...</ItemTitle>
        </ItemContent>
        <ItemContent class="flex-none justify-end">
          <span class="text-sm tabular-nums">$100.00</span>
        </ItemContent>
      </Item>
    </div>
  );
}

export default SpinnerDemo;
