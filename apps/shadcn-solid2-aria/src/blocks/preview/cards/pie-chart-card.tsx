/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview/cards/pie-chart-card.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive data, and TanStack Charts through @solid2-aria/tanstack-charts.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  DataChart,
  ChartCenterLabel,
} from "../../../components/chart/data-chart";
import { hasKey } from "../../../lib/has-key";
import { Badge } from "../../../registry/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../registry/ui/card";
import { ChartContainer } from "../../../registry/ui/chart";
import type { ChartConfig } from "../../../registry/ui/chart";
import { Progress } from "../../../registry/ui/progress";

const pieChartData = [
  { browser: "chrome", fill: "var(--color-chrome)", visitors: 275 },
  { browser: "safari", fill: "var(--color-safari)", visitors: 200 },
  { browser: "firefox", fill: "var(--color-firefox)", visitors: 287 },
  { browser: "edge", fill: "var(--color-edge)", visitors: 173 },
];

const pieChartConfig = {
  chrome: {
    color: "var(--chart-1)",
    label: "Chrome",
  },
  edge: {
    color: "var(--chart-4)",
    label: "Edge",
  },
  firefox: {
    color: "var(--chart-3)",
    label: "Firefox",
  },
  safari: {
    color: "var(--chart-2)",
    label: "Safari",
  },
  visitors: {
    label: "Visitors",
  },
} satisfies ChartConfig;

export function PieChartCard() {
  const totalVisitors = pieChartData.reduce(
    (sum, item) => sum + item.visitors,
    0
  );

  let [topBrowser] = pieChartData;

  if (!topBrowser) {
    // oxlint-disable-next-line solid/components-return-once -- The checked-in chart fixture is validated before rendering.
    return null;
  }

  for (const browser of pieChartData) {
    if (browser.visitors > topBrowser.visitors) {
      topBrowser = browser;
    }
  }

  const topBrowserShare = Math.round(
    (topBrowser.visitors / totalVisitors) * 100
  );

  const topBrowserLabel = hasKey(pieChartConfig, topBrowser.browser)
    ? pieChartConfig[topBrowser.browser].label
    : "Top";

  return (
    <Card>
      <CardHeader class="pb-0">
        <CardTitle>Browser Share</CardTitle>
        <CardDescription>January - June 2026</CardDescription>
        <CardAction>
          <Badge variant="outline">{topBrowserLabel}</Badge>
        </CardAction>
      </CardHeader>
      <CardContent class="pt-0">
        <ChartContainer
          config={pieChartConfig}
          class="mx-auto aspect-square max-h-[190px]"
        >
          <DataChart
            kind="pie"
            label="Visitor statistics"
            data={pieChartData}
            series={[{ key: "visitors", strokeWidth: 5 }]}
            grid={false}
            axis={false}
            tooltip={true}
            category={"browser"}
            innerRadius={50}
            legend
            tooltipOptions={{ hideLabel: true }}
          >
            <ChartCenterLabel
              content={({ viewBox }) => {
                if (Boolean(viewBox) && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      text-anchor="middle"
                      dominant-baseline="middle"
                      fill="red"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy - 16}
                        class="fill-foreground text-2xl font-bold"
                      >
                        {totalVisitors.toLocaleString()}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 4}
                        class="fill-muted-foreground text-xs"
                      >
                        Visitors
                      </tspan>
                    </text>
                  );
                }

                return null;
              }}
            />
          </DataChart>
        </ChartContainer>
      </CardContent>
      <CardFooter class="flex-col items-stretch gap-2">
        <div class="flex items-center text-xs">
          <span class="font-medium">{topBrowserLabel}</span>
          <span class="text-muted-foreground ml-auto tabular-nums">
            {topBrowserShare}%
          </span>
        </div>
        <Progress
          value={topBrowserShare}
          class="**:data-[slot=progress-indicator]:bg-chart-3"
        />
      </CardFooter>
    </Card>
  );
}

export default PieChartCard;
