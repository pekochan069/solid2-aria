/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/chart-example-axis.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive data, and TanStack Charts through @solid2-aria/tanstack-charts.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { DataChart } from "../components/chart/data-chart";
import { ChartContainer } from "../registry/ui/chart";
import type { ChartConfig } from "../registry/ui/chart";

const chartData = [
  { desktop: 186, mobile: 80, month: "January" },
  { desktop: 305, mobile: 200, month: "February" },
  { desktop: 237, mobile: 120, month: "March" },
  { desktop: 73, mobile: 190, month: "April" },
  { desktop: 209, mobile: 130, month: "May" },
  { desktop: 214, mobile: 140, month: "June" },
];

const chartConfig = {
  desktop: {
    color: "#2563eb",
    label: "Desktop",
  },
  mobile: {
    color: "#60a5fa",
    label: "Mobile",
  },
} satisfies ChartConfig;

export function ChartBarDemoAxis() {
  return (
    <ChartContainer config={chartConfig} class="min-h-[200px] w-full">
      <DataChart
        kind="bar"
        label="Visitor statistics"
        data={chartData}
        series={[
          { color: "var(--color-desktop)", key: "desktop", radius: 4 },
          { color: "var(--color-mobile)", key: "mobile", radius: 4 },
        ]}
        grid={true}
        axis={true}
        tooltip={false}
        category={"month"}
        formatCategory={(value) => value.slice(0, 3)}
      />
    </ChartContainer>
  );
}

export default ChartBarDemoAxis;
