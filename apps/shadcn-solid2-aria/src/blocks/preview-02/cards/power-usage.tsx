/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview-02/cards/power-usage.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive data, and TanStack Charts through @solid2-aria/tanstack-charts.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { DataChart } from "../../../components/chart/data-chart";
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
import { Progress } from "../../../registry/ui/progress";
import { Separator } from "../../../registry/ui/separator";
import { useDesignSystemSearchParams } from "../../_config";

const chartData = [
  { hour: "6a", usage: 1.2 },
  { hour: "8a", usage: 2.8 },
  { hour: "10a", usage: 3.1 },
  { hour: "12p", usage: 2.4 },
  { hour: "2p", usage: 3.4 },
  { hour: "4p", usage: 2.9 },
  { hour: "6p", usage: 3.8 },
  { hour: "8p", usage: 3.2 },
];

const chartConfig = {
  usage: {
    color: "var(--chart-2)",
    label: "Usage (kW)",
  },
} satisfies ChartConfig;

export function PowerUsage() {
  const [params] = useDesignSystemSearchParams();
  const isRounded = !["lyra", "sera"].includes(params.style);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Power Usage</CardTitle>
        <CardDescription>Whole Home</CardDescription>
      </CardHeader>
      <CardContent class="flex flex-col gap-4">
        <ChartContainer config={chartConfig} class="h-[140px] w-full">
          <DataChart
            kind="bar"
            label="Visitor statistics"
            data={chartData}
            series={[
              {
                color: "var(--color-usage)",
                key: "usage",
                radius: isRounded ? [4, 4, 0, 0] : 0,
              },
            ]}
            grid={false}
            axis={true}
            tooltip={true}
            category={"hour"}
            tooltipOptions={{ hideLabel: true }}
          />
        </ChartContainer>
        <Separator />
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-0.5">
            <span class="text-muted-foreground text-sm">Currently Using</span>
            <span class="text-lg font-semibold tabular-nums">3.4 kW</span>
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="text-muted-foreground text-sm">Solar Gen</span>
            <span class="text-chart-1 text-lg font-semibold tabular-nums">
              +1.2 kW
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter class="flex-col items-start gap-1">
        <span class="text-muted-foreground text-sm">Battery Level</span>
        <div class="flex w-full items-center gap-2">
          <Progress value={85} class="flex-1" />
          <span class="text-sm font-medium tabular-nums">85%</span>
        </div>
      </CardFooter>
    </Card>
  );
}

export default PowerUsage;
