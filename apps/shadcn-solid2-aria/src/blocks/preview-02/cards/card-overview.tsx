/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview-02/cards/card-overview.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive data, and TanStack Charts through @solid2-aria/tanstack-charts.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { DataChart } from "../../../components/chart/data-chart";
import { Badge } from "../../../registry/ui/badge";
import { Button } from "../../../registry/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "../../../registry/ui/card";
import { ChartContainer } from "../../../registry/ui/chart";
import type { ChartConfig } from "../../../registry/ui/chart";

const activityData = [
  { amount: 40, month: "Jan" },
  { amount: 55, month: "Feb" },
  { amount: 35, month: "Mar" },
  { amount: 60, month: "Apr" },
  { amount: 45, month: "May" },
  { amount: 50, month: "Jun" },
  { amount: 65, month: "Jul" },
  { amount: 40, month: "Aug" },
  { amount: 55, month: "Sep" },
  { amount: 70, month: "Oct" },
  { amount: 45, month: "Nov" },
  { amount: 80, month: "Dec" },
];

const chartConfig = {
  amount: {
    color: "var(--chart-2)",
    label: "Activity",
  },
} satisfies ChartConfig;

export function CardOverview() {
  return (
    <div class="grid grid-cols-2 gap-3">
      <Card>
        <CardContent>
          <CardDescription>Card Balance</CardDescription>
          <CardTitle class="text-2xl tabular-nums">US$12.94</CardTitle>
          <CardDescription class="tabular-nums">
            US$11,337.06 Available
          </CardDescription>
        </CardContent>
      </Card>
      <Card class="flex flex-col justify-between">
        <CardContent class="flex flex-1 flex-col justify-between">
          <div class="flex flex-col gap-1">
            <CardDescription>Payment Due</CardDescription>
            <CardTitle class="text-2xl">1 Apr</CardTitle>
          </div>
          <Button variant="outline" size="sm" class="mt-3 w-full">
            Pay Early
          </Button>
        </CardContent>
      </Card>
      <Card class="col-span-2">
        <CardContent class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <CardDescription>Yearly Activity</CardDescription>
            <Badge variant="secondary">+US$0.25 Daily Cash</Badge>
          </div>
          <ChartContainer config={chartConfig} class="h-20 w-full">
            <DataChart
              kind="bar"
              label="Visitor statistics"
              data={activityData}
              series={[{ color: "var(--color-amount)", key: "amount" }]}
              grid={false}
              axis={true}
              tooltip={true}
              category={"month"}
              formatCategory={(v) => v.slice(0, 1)}
              tooltipOptions={{ hideLabel: true }}
            />
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export default CardOverview;
