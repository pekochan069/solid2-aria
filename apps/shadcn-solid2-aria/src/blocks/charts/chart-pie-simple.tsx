/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/new-york-v4/charts/chart-pie-simple.tsx.
 * Modified for Solid Aria: upstream chart data and card content rendered with native Solid SVG charts in place of React Recharts.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ChartDemo } from "../../components/catalog/chart-demo";

const chartData = [
  {
    browser: "chrome",
    fill: "var(--color-chrome)",
    visitors: 275,
  },
  {
    browser: "safari",
    fill: "var(--color-safari)",
    visitors: 200,
  },
  {
    browser: "firefox",
    fill: "var(--color-firefox)",
    visitors: 187,
  },
  {
    browser: "edge",
    fill: "var(--color-edge)",
    visitors: 173,
  },
  {
    browser: "other",
    fill: "var(--color-other)",
    visitors: 90,
  },
];

export default function Chart() {
  return (
    <ChartDemo
      name="chart-pie-simple"
      type="pie"
      title="Pie Chart"
      description="January - June 2024"
      data={chartData}
    />
  );
}
