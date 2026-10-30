/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/new-york-v4/charts/chart-pie-donut-text.tsx.
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
    visitors: 287,
  },
  {
    browser: "edge",
    fill: "var(--color-edge)",
    visitors: 173,
  },
  {
    browser: "other",
    fill: "var(--color-other)",
    visitors: 190,
  },
];

export default function Chart() {
  return (
    <ChartDemo
      name="chart-pie-donut-text"
      type="pie"
      title="Pie Chart - Donut with Text"
      description="January - June 2024"
      data={chartData}
    />
  );
}
