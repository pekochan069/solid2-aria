/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/new-york-v4/charts/chart-bar-default.tsx.
 * Modified for Solid Aria: upstream chart data and card content rendered with native Solid SVG charts in place of React Recharts.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ChartDemo } from "../../components/catalog/chart-demo";

const chartData = [
  {
    desktop: 186,
    month: "January",
  },
  {
    desktop: 305,
    month: "February",
  },
  {
    desktop: 237,
    month: "March",
  },
  {
    desktop: 73,
    month: "April",
  },
  {
    desktop: 209,
    month: "May",
  },
  {
    desktop: 214,
    month: "June",
  },
];

export default function Chart() {
  return (
    <ChartDemo
      name="chart-bar-default"
      type="bar"
      title="Bar Chart"
      description="January - June 2024"
      data={chartData}
    />
  );
}
