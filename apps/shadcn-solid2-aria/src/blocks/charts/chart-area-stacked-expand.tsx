/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/new-york-v4/charts/chart-area-stacked-expand.tsx.
 * Modified for Solid Aria: upstream chart data and card content rendered with native Solid SVG charts in place of React Recharts.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ChartDemo } from "../../components/catalog/chart-demo";

const chartData = [
  {
    desktop: 186,
    mobile: 80,
    month: "January",
    other: 45,
  },
  {
    desktop: 305,
    mobile: 200,
    month: "February",
    other: 100,
  },
  {
    desktop: 237,
    mobile: 120,
    month: "March",
    other: 150,
  },
  {
    desktop: 73,
    mobile: 190,
    month: "April",
    other: 50,
  },
  {
    desktop: 209,
    mobile: 130,
    month: "May",
    other: 100,
  },
  {
    desktop: 214,
    mobile: 140,
    month: "June",
    other: 160,
  },
];

export default function Chart() {
  return (
    <ChartDemo
      name="chart-area-stacked-expand"
      type="area"
      title="Area Chart - Stacked Expanded"
      description="Showing total visitors for the last 6months"
      data={chartData}
    />
  );
}
