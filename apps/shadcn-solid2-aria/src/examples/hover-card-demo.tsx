/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/hover-card-demo.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Button } from "../registry/ui/button";
import { HoverCard, HoverCardTrigger } from "../registry/ui/hover-card";

export default function HoverCardDemo() {
  return (
    <HoverCardTrigger delay={10} closeDelay={100}>
      <Button variant="link">Hover Here</Button>
      <HoverCard class="flex w-64 flex-col gap-0.5">
        <div class="font-semibold">@solid_js</div>
        <div>A reactive JavaScript library for building user interfaces.</div>
        <div class="text-muted-foreground mt-1 text-xs">
          Joined December 2021
        </div>
      </HoverCard>
    </HoverCardTrigger>
  );
}
