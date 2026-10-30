/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/hover-card-sides.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { For } from "solid-js";

import { Button } from "../registry/ui/button";
import { HoverCard, HoverCardTrigger } from "../registry/ui/hover-card";

const HOVER_CARD_PLACEMENTS = ["left", "top", "bottom", "right"] as const;

export function HoverCardSides() {
  return (
    <div class="flex flex-wrap justify-center gap-2">
      {
        <For each={HOVER_CARD_PLACEMENTS}>
          {(placement) => (
            <HoverCardTrigger delay={100} closeDelay={100}>
              <Button variant="outline" class="capitalize">
                {placement}
              </Button>
              <HoverCard placement={placement}>
                <div class="flex flex-col gap-1">
                  <h4 class="font-medium">Hover Card</h4>
                  <p>
                    This hover card appears on the {placement} side of the
                    trigger.
                  </p>
                </div>
              </HoverCard>
            </HoverCardTrigger>
          )}
        </For>
      }
    </div>
  );
}

export default HoverCardSides;
