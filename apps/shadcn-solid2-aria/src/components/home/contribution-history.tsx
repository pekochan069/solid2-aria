/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(root)/cards/contribution-history.tsx.
 * Modified for Solid Aria: Solid 2 JSX, local Solid2 Aria components, native attributes, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { For } from "solid-js";

import { Button } from "../../registry/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../registry/ui/card";
import { Item, ItemContent, ItemDescription } from "../../registry/ui/item";

const chartData = [
  { amount: 800, month: "Dec" },
  { amount: 1100, month: "Jan" },
  { amount: 900, month: "Feb" },
  { amount: 1300, month: "Mar" },
  { amount: 750, month: "Apr" },
];

export function ContributionHistory() {
  const maxAmount = Math.max(...chartData.map((item) => item.amount));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contribution History</CardTitle>
        <CardDescription>Last 6 months of activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          class="flex h-50 w-full items-end gap-3"
          role="img"
          aria-label="Last 6 months of contribution activity"
        >
          <For each={chartData}>
            {(item, index) => (
              <div class="flex h-full flex-1 flex-col justify-end gap-2">
                <div
                  data-index={index()}
                  class="data-[index=5]:bg-chart-6 data-[index=0]:bg-chart-1 data-[index=1]:bg-chart-2 data-[index=2]:bg-chart-3 data-[index=3]:bg-chart-4 data-[index=4]:bg-chart-5 min-h-2 rounded-lg"
                  style={{ height: `${(item.amount / maxAmount) * 100}%` }}
                />
                <span class="text-muted-foreground text-center text-xs">
                  {item.month}
                </span>
              </div>
            )}
          </For>
        </div>
      </CardContent>
      <CardContent>
        <div class="grid w-full grid-cols-1 gap-3 xl:grid-cols-2">
          <Item variant="muted" class="flex-col items-stretch">
            <ItemContent class="gap-1">
              <ItemDescription class="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Upcoming
              </ItemDescription>
              <span class="cn-font-heading text-base font-semibold">
                May 2024
              </span>
              <span class="text-muted-foreground text-sm">Scheduled</span>
            </ItemContent>
          </Item>
          <Item variant="muted" class="hidden flex-col items-stretch xl:flex">
            <ItemContent class="gap-1">
              <ItemDescription class="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Savings Plan
              </ItemDescription>
              <span class="cn-font-heading text-base font-semibold">
                Accelerated
              </span>
              <span class="text-muted-foreground text-sm">Recurring</span>
            </ItemContent>
          </Item>
        </div>
      </CardContent>
      <CardFooter>
        <Button class="w-full">View Full Report</Button>
      </CardFooter>
    </Card>
  );
}
