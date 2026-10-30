/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview-02/cards/contribution-history.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive data, and TanStack Charts through @solid2-aria/tanstack-charts.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { DataChart } from "../../../components/chart/data-chart";
import { Button } from "../../../registry/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../registry/ui/card";
import { ChartContainer } from "../../../registry/ui/chart";
import type { ChartConfig } from "../../../registry/ui/chart";
import { Item, ItemContent, ItemDescription } from "../../../registry/ui/item";
import { useDesignSystemSearchParams } from "../../_config";

const chartData = [
  { amount: 800, month: "Dec" },
  { amount: 1100, month: "Jan" },
  { amount: 900, month: "Feb" },
  { amount: 1300, month: "Mar" },
  { amount: 750, month: "Apr" },
  { amount: 1400, month: "May" },
];

const chartConfig = {
  amount: {
    color: "var(--chart-2)",
    label: "Contribution",
  },
} satisfies ChartConfig;

export function ContributionHistory() {
  const [params] = useDesignSystemSearchParams();
  const isRounded = !["lyra", "sera"].includes(params.style);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contribution History</CardTitle>
        <CardDescription>Last 6 months of activity</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} class="h-[200px] w-full">
          <DataChart
            kind="bar"
            label="Visitor statistics"
            data={chartData}
            series={[
              {
                color: "var(--color-amount)",
                key: "amount",
                maxThickness: 40,
                radius: isRounded ? [6, 6, 0, 0] : 0,
              },
            ]}
            grid={false}
            axis={true}
            tooltip={true}
            category={"month"}
            tooltipOptions={{ class: "min-w-40", hideLabel: true }}
          />
        </ChartContainer>
      </CardContent>
      <CardContent>
        <div class="grid w-full grid-cols-1 gap-3 md:grid-cols-2">
          <Item variant="muted" class="flex-col items-stretch">
            <ItemContent class="gap-1">
              <ItemDescription class="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Upcoming
              </ItemDescription>
              <span class="cn-font-heading text-lg font-semibold">
                May 25, 2024
              </span>
              <span class="text-muted-foreground text-sm">
                $1,000 scheduled
              </span>
            </ItemContent>
          </Item>
          <Item variant="muted" class="flex-col items-stretch">
            <ItemContent class="gap-1">
              <ItemDescription class="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Auto-Save Plan
              </ItemDescription>
              <span class="cn-font-heading text-lg font-semibold">
                Accelerated
              </span>
              <span class="text-muted-foreground text-sm">
                Recurring weekly
              </span>
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

export default ContributionHistory;
