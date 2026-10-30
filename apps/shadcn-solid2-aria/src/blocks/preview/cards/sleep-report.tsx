/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview/cards/sleep-report.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive data, and TanStack Charts through @solid2-aria/tanstack-charts.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { For } from "solid-js";

import { DataChart } from "../../../components/chart/data-chart";
import { Badge } from "../../../registry/ui/badge";
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

const sleepChartData = [
  { deep: 0, hour: "10pm", light: 30, rem: 0 },
  { deep: 20, hour: "11pm", light: 10, rem: 0 },
  { deep: 40, hour: "12am", light: 0, rem: 10 },
  { deep: 30, hour: "1am", light: 5, rem: 15 },
  { deep: 10, hour: "2am", light: 20, rem: 30 },
  { deep: 25, hour: "3am", light: 10, rem: 20 },
  { deep: 15, hour: "4am", light: 25, rem: 10 },
  { deep: 5, hour: "5am", light: 35, rem: 15 },
  { deep: 0, hour: "6am", light: 20, rem: 25 },
];

const sleepChartConfig = {
  deep: {
    color: "var(--chart-1)",
    label: "Deep",
  },
  light: {
    color: "var(--chart-2)",
    label: "Light",
  },
  rem: {
    color: "var(--chart-3)",
    label: "REM",
  },
} satisfies ChartConfig;

export function SleepReport() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sleep Report</CardTitle>
        <CardDescription>Last night · 7h 24m</CardDescription>
      </CardHeader>
      <CardContent class="flex flex-col gap-3">
        <ChartContainer config={sleepChartConfig} class="h-32 w-full">
          <DataChart
            kind="bar"
            label="Visitor statistics"
            data={sleepChartData}
            series={[
              { color: "var(--color-deep)", key: "deep", radius: 0 },
              { color: "var(--color-light)", key: "light", radius: 0 },
              { color: "var(--color-rem)", key: "rem" },
            ]}
            grid={false}
            axis={false}
            tooltip={false}
            stacked
          />
        </ChartContainer>
        <div class="grid grid-cols-4 gap-2">
          {
            <For
              each={[
                { label: "Deep", value: "2h 10m" },
                { label: "Light", value: "3h 48m" },
                { label: "REM", value: "1h 26m" },
                { label: "Score", value: "84" },
              ]}
            >
              {(s) => (
                <div class="text-center">
                  <div class="text-sm font-medium tabular-nums">{s.value}</div>
                  <div class="text-muted-foreground text-xs">{s.label}</div>
                </div>
              )}
            </For>
          }
        </div>
      </CardContent>
      <CardFooter>
        <Badge variant="outline">Good</Badge>
        <Button variant="outline" size="sm" class="ml-auto">
          Details
        </Button>
      </CardFooter>
    </Card>
  );
}

export default SleepReport;
