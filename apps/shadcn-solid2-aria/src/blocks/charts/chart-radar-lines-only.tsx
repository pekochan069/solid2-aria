/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/new-york-v4/charts/chart-radar-lines-only.tsx.
 * Modified for Solid Aria: upstream chart data and card content rendered with native Solid SVG charts in place of React Recharts.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ChartDemo } from "../../components/catalog/chart-demo";

const chartData = [
  {
    desktop: 186,
    mobile: 160,
    month: "January",
  },
  {
    desktop: 185,
    mobile: 170,
    month: "February",
  },
  {
    desktop: 207,
    mobile: 180,
    month: "March",
  },
  {
    desktop: 173,
    mobile: 160,
    month: "April",
  },
  {
    desktop: 160,
    mobile: 190,
    month: "May",
  },
  {
    desktop: 174,
    mobile: 204,
    month: "June",
  },
];

export default function Chart() {
  return (
    <ChartDemo
      name="chart-radar-lines-only"
      type="radar"
      title="Radar Chart - Lines Only"
      description="Showing total visitors for the last 6 months"
      data={chartData}
    />
  );
}
