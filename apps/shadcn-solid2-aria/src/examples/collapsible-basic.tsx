/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/collapsible-basic.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ChevronDownIcon } from "@lucide/solid";

import { Button } from "../registry/ui/button";
import { Card, CardContent } from "../registry/ui/card";
import { Collapsible, CollapsibleContent } from "../registry/ui/collapsible";

export function CollapsibleBasic() {
  return (
    <Card class="mx-auto w-full max-w-sm">
      <CardContent>
        <Collapsible class="data-open:bg-muted rounded-md">
          <Button slot="trigger" variant="ghost" class="w-full">
            Product details
            <ChevronDownIcon class="ml-auto group-data-panel-open/button:rotate-180" />
          </Button>
          <CollapsibleContent>
            <div class="flex flex-col items-start gap-2 p-2.5 pt-0 text-sm">
              <div>
                This panel can be expanded or collapsed to reveal additional
                content.
              </div>
              <Button size="xs">Learn More</Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

export default CollapsibleBasic;
