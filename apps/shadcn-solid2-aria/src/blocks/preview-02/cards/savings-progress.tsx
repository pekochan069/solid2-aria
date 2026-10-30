/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview-02/cards/savings-progress.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive data, and TanStack Charts through @solid2-aria/tanstack-charts.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  DataChart,
  ChartCenterLabel,
} from "../../../components/chart/data-chart";
import { Card, CardContent, CardFooter } from "../../../registry/ui/card";
import { ChartContainer } from "../../../registry/ui/chart";
import type { ChartConfig } from "../../../registry/ui/chart";
import { Separator } from "../../../registry/ui/separator";

const chartData = [
  { fill: "var(--color-saved)", name: "saved", value: 24_000 },
  { fill: "var(--color-remaining)", name: "remaining", value: 6000 },
];

const chartConfig = {
  remaining: {
    color: "var(--chart-1)",
    label: "Remaining",
  },
  saved: {
    color: "var(--chart-2)",
    label: "Saved",
  },
} satisfies ChartConfig;

export function SavingsProgress() {
  return (
    <Card>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          class="mx-auto aspect-square max-h-[220px]"
        >
          <DataChart
            kind="pie"
            label="Visitor statistics"
            data={chartData}
            series={[{ key: "value", strokeWidth: 0 }]}
            grid={false}
            axis={false}
            tooltip={true}
            category={"name"}
            innerRadius={70}
            outerRadius={95}
            startAngle={((90 - 90) * Math.PI) / 180}
            endAngle={((90 - -270) * Math.PI) / 180}
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
                    >
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) - 12}
                        class="fill-foreground text-2xl font-bold"
                      >
                        $24,000
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 12}
                        class="fill-muted-foreground text-xs"
                      >
                        80% of $30,000
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
      <CardFooter class="flex-col gap-0">
        <div class="flex w-full items-center justify-between py-3">
          <span class="text-muted-foreground text-sm">Projected Finish</span>
          <span class="text-sm font-semibold">October 2024</span>
        </div>
        <Separator />
        <div class="flex w-full items-center justify-between py-3">
          <span class="text-muted-foreground text-sm">Monthly Average</span>
          <span class="text-sm font-semibold tabular-nums">$1,250</span>
        </div>
        <Separator />
        <div class="flex w-full items-center justify-between py-3">
          <span class="text-muted-foreground text-sm">Top Contributor</span>
          <span class="text-sm font-semibold">Auto-Transfer</span>
        </div>
      </CardFooter>
    </Card>
  );
}

export default SavingsProgress;
