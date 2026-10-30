/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/new-york-v4/charts/chart-pie-stacked.tsx.
 * Modified for Solid Aria: upstream chart data and card content rendered with native Solid SVG charts in place of React Recharts.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ChartDemo } from "../../components/catalog/chart-demo";

const chartData = [
  {
    desktop: 186,
    fill: "var(--color-january)",
    mobile: 80,
    month: "january",
  },
  {
    desktop: 305,
    fill: "var(--color-february)",
    mobile: 200,
    month: "february",
  },
  {
    desktop: 237,
    fill: "var(--color-march)",
    mobile: 120,
    month: "march",
  },
  {
    desktop: 173,
    fill: "var(--color-april)",
    mobile: 190,
    month: "april",
  },
  {
    desktop: 209,
    fill: "var(--color-may)",
    mobile: 130,
    month: "may",
  },
];

export default function Chart() {
  return (
    <ChartDemo
      name="chart-pie-stacked"
      type="pie"
      title="Pie Chart - Stacked"
      description="January - June 2024"
      data={chartData}
    />
  );
}
