/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview/cards/analytics-card.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive data, and TanStack Charts through @solid2-aria/tanstack-charts.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { DataChart } from "../../../components/chart/data-chart";
import { Badge } from "../../../registry/ui/badge";
import { Button } from "../../../registry/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../registry/ui/card";
import { ChartContainer } from "../../../registry/ui/chart";
import type { ChartConfig } from "../../../registry/ui/chart";

// Monthly visitor data for the area chart.
const chartData = [
  { month: "January", visitors: 186 },
  { month: "February", visitors: 305 },
  { month: "March", visitors: 237 },
  { month: "April", visitors: 73 },
  { month: "May", visitors: 209 },
  { month: "June", visitors: 214 },
];

// Chart configuration for the visitors dataset.
const chartConfig = {
  visitors: {
    color: "var(--chart-1)",
    label: "Visitors",
  },
} satisfies ChartConfig;

export function AnalyticsCard() {
  return (
    <Card class="mx-auto w-full max-w-sm data-[size=sm]:pb-0" size="sm">
      <CardHeader>
        <CardTitle>Analytics</CardTitle>
        <CardDescription>
          418.2K Visitors <Badge>+10%</Badge>
        </CardDescription>
        <CardAction>
          <Button variant="outline" size="sm">
            View Analytics
          </Button>
        </CardAction>
      </CardHeader>
      <ChartContainer config={chartConfig} class="aspect-[1/0.35]">
        <DataChart
          kind="area"
          label="Visitor statistics"
          data={chartData}
          series={[
            {
              color: "var(--color-visitors)",
              fillOpacity: 0.4,
              key: "visitors",
            },
          ]}
          grid={false}
          axis={false}
          tooltip={true}
          curve={"linear"}
          tooltipOptions={{ hideLabel: true, indicator: "line" }}
        />
      </ChartContainer>
    </Card>
  );
}

export default AnalyticsCard;
