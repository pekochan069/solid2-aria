/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/bubble-collapsible.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ChevronDownIcon } from "@lucide/solid";
import { createSignal } from "solid-js";

import { Bubble, BubbleContent } from "../registry/ui/bubble";
import { Button } from "../registry/ui/button";
import { Collapsible } from "../registry/ui/collapsible";

const text = `The accessibility review found two focus states that were visually too subtle in dark mode.

I checked the dialog, menu, and drawer paths because each one renders focusable controls inside a layered surface.

The dialog and drawer are fine. The menu needs the hover and focus tokens split so keyboard focus stays visible when the pointer is not involved.

I also recommend keeping the change in the style file instead of the primitive so the other themes can choose their own focus treatment later.`;

const previewLength = 180;

export function BubbleCollapsible() {
  const [open, setOpen] = createSignal(false);
  const isLong = text.length > previewLength;
  const preview = `${text.slice(0, previewLength)}...`;

  return (
    <div class="flex w-full max-w-sm flex-col gap-8 py-12">
      <Bubble variant="muted">
        <BubbleContent>How can I help you today?</BubbleContent>
      </Bubble>

      <Bubble variant="muted" align="end">
        <BubbleContent class="whitespace-pre-line">
          <Collapsible
            isExpanded={open()}
            onExpandedChange={(value) => {
              setOpen(value);
            }}
          >
            <div>{open() || !isLong ? text : preview}</div>
            {isLong ? (
              <Button
                slot="trigger"
                variant="link"
                class="text-muted-foreground gap-1 p-0"
              >
                {open() ? "Show less" : "Show more"}
                <ChevronDownIcon
                  data-icon="inline-end"
                  class="group-data-panel-open/button:rotate-180"
                />
              </Button>
            ) : null}
          </Collapsible>
        </BubbleContent>
      </Bubble>
    </div>
  );
}

export default BubbleCollapsible;
