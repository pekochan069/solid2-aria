/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/new-york-v4/charts/chart-bar-negative.tsx.
 * Modified for Solid Aria: upstream chart data and card content rendered with native Solid SVG charts in place of React Recharts.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ChartDemo } from "../../components/catalog/chart-demo";

const chartData = [
  {
    month: "January",
    visitors: 186,
  },
  {
    month: "February",
    visitors: 205,
  },
  {
    month: "March",
    visitors: -207,
  },
  {
    month: "April",
    visitors: 173,
  },
  {
    month: "May",
    visitors: -209,
  },
  {
    month: "June",
    visitors: 214,
  },
];

export default function Chart() {
  return (
    <ChartDemo
      name="chart-bar-negative"
      type="bar"
      title="Bar Chart - Negative"
      description="January - June 2024"
      data={chartData}
    />
  );
}
