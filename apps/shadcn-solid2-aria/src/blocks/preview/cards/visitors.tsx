/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview/cards/visitors.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive data, and TanStack Charts through @solid2-aria/tanstack-charts.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { DataChart } from "../../../components/chart/data-chart";
import { Badge } from "../../../registry/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../registry/ui/card";
import { ChartContainer } from "../../../registry/ui/chart";
import type { ChartConfig } from "../../../registry/ui/chart";

const areaChartData = [
  { desktop: 186, month: "January" },
  { desktop: 305, month: "February" },
  { desktop: 237, month: "March" },
  { desktop: 73, month: "April" },
  { desktop: 209, month: "May" },
  { desktop: 214, month: "June" },
];

const areaChartConfig = {
  desktop: {
    color: "var(--chart-1)",
    label: "Desktop",
  },
} satisfies ChartConfig;

const latestVisitors = areaChartData.at(-1)?.desktop ?? 0;

const previousVisitors = areaChartData.at(-2)?.desktop ?? latestVisitors;

const trendPercent =
  previousVisitors === 0
    ? 0
    : Math.round(
        ((latestVisitors - previousVisitors) / previousVisitors) * 100
      );

const trendPrefix = trendPercent > 0 ? "+" : "";

export function Visitors() {
  return (
    <Card class="pb-0">
      <CardHeader>
        <CardTitle>Visitors</CardTitle>
        <CardDescription>Last 6 months </CardDescription>
        <CardAction>
          <Badge variant={trendPercent >= 0 ? "secondary" : "destructive"}>
            {trendPrefix}
            {trendPercent}% vs last month
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent class="px-0">
        <ChartContainer config={areaChartConfig} class="h-48 w-full">
          <DataChart
            kind="area"
            label="Visitor statistics"
            data={areaChartData}
            series={[
              {
                color: "var(--color-desktop)",
                fillOpacity: 0.15,
                key: "desktop",
                strokeWidth: 2,
              },
            ]}
            grid={false}
            axis={false}
            tooltip={true}
            category={"month"}
            formatCategory={(value) => value.slice(0, 3)}
            curve={"natural"}
            tooltipOptions={{ indicator: "line" }}
          />
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default Visitors;
