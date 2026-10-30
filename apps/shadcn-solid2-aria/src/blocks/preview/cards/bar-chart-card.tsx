/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview/cards/bar-chart-card.tsx.
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
import { useDesignSystemSearchParams } from "../../_config";

const barChartData = [
  { desktop: 186, mobile: 80, month: "January" },
  { desktop: 305, mobile: 200, month: "February" },
  { desktop: 237, mobile: 120, month: "March" },
  { desktop: 73, mobile: 190, month: "April" },
  { desktop: 209, mobile: 130, month: "May" },
  { desktop: 214, mobile: 140, month: "June" },
];

const barChartConfig = {
  desktop: {
    color: "var(--chart-1)",
    label: "Desktop",
  },
  mobile: {
    color: "var(--chart-2)",
    label: "Mobile",
  },
} satisfies ChartConfig;

const desktopTotal = barChartData.reduce((sum, item) => sum + item.desktop, 0);
const mobileTotal = barChartData.reduce((sum, item) => sum + item.mobile, 0);

const desktopDelta = Math.round(
  ((desktopTotal - mobileTotal) / mobileTotal) * 100
);

const desktopDeltaPrefix = desktopDelta > 0 ? "+" : "";

export function BarChartCard() {
  const [params] = useDesignSystemSearchParams();
  const isRounded = !["lyra", "sera"].includes(params.style);

  return (
    <Card>
      <CardHeader>
        <CardTitle class="text-lg">Traffic channels</CardTitle>
        <CardDescription class="line-clamp-2 text-sm leading-snug">
          Monthly desktop and mobile traffic for the last six months, compare
          volume and mix across platforms and devices at a glance.
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-col gap-4 pt-0">
        <ChartContainer config={barChartConfig} class="max-h-[180px] w-full">
          <DataChart
            kind="bar"
            label="Visitor statistics"
            data={barChartData}
            series={[
              {
                color: "var(--color-desktop)",
                key: "desktop",
                radius: isRounded ? [6, 6, 0, 0] : 0,
              },
              {
                color: "var(--color-mobile)",
                key: "mobile",
                radius: isRounded ? [6, 6, 0, 0] : 0,
              },
            ]}
            grid={true}
            axis={true}
            tooltip={true}
            category={"month"}
            formatCategory={(value) => value.slice(0, 3)}
            legend
            tooltipOptions={{ indicator: "dashed" }}
          />
        </ChartContainer>
        <div class="divide-border/60 grid w-full grid-cols-3 divide-x">
          <div class="px-2 text-center">
            <div class="text-muted-foreground text-[0.65rem] uppercase">
              Desktop
            </div>
            <div class="text-sm font-medium tabular-nums">
              {desktopTotal.toLocaleString()}
            </div>
          </div>
          <div class="px-2 text-center">
            <div class="text-muted-foreground text-[0.65rem] uppercase">
              Mobile
            </div>
            <div class="text-sm font-medium tabular-nums">
              {mobileTotal.toLocaleString()}
            </div>
          </div>
          <div class="px-2 text-center">
            <div class="text-muted-foreground text-[0.65rem] uppercase">
              Mix Delta
            </div>
            <div class="text-sm font-medium tabular-nums">
              {desktopDeltaPrefix}
              {desktopDelta}%
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button class="w-full">View report</Button>
      </CardFooter>
    </Card>
  );
}

export default BarChartCard;
