/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/new-york-v4/charts/chart-area-step.tsx.
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
      name="chart-area-step"
      type="area"
      title="Area Chart - Step"
      description="Showing total visitors for the last 6 months"
      data={chartData}
    />
  );
}
