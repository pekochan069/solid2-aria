/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview-02/cards/claimable-balance.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Badge } from "../../../registry/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../registry/ui/card";
import { Item, ItemContent } from "../../../registry/ui/item";
import { Separator } from "../../../registry/ui/separator";

export function ClaimableBalance() {
  return (
    <Card>
      <CardHeader>
        <CardDescription>Claimable Balance</CardDescription>
        <CardTitle class="text-5xl tabular-nums">$0.00</CardTitle>
        <Badge variant="outline">
          <span class="size-2 rounded-full bg-yellow-500" />
          Pending Setup
        </Badge>
      </CardHeader>
      <CardContent class="flex flex-1 flex-col justify-end">
        <Item variant="muted" class="flex-col items-stretch">
          <ItemContent class="gap-3">
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground text-sm">Net Royalties</span>
              <span class="text-sm font-medium tabular-nums">$0.00</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground text-sm">Processing Fee</span>
              <span class="text-sm font-medium tabular-nums">-$0.00</span>
            </div>
            <Separator />
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground text-sm">
                Total Ready to Claim
              </span>
              <span class="text-sm font-semibold tabular-nums">$0.00 USD</span>
            </div>
          </ItemContent>
        </Item>
      </CardContent>
      <CardFooter>
        <CardDescription>
          Once your bank is connected, balances over $10.00 are automatically
          eligible for monthly distribution on the 15th of each month.
        </CardDescription>
      </CardFooter>
    </Card>
  );
}

export default ClaimableBalance;
