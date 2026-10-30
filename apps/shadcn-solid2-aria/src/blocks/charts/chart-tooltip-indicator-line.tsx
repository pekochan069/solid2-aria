/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/new-york-v4/charts/chart-tooltip-indicator-line.tsx.
 * Modified for Solid Aria: upstream chart data and card content rendered with native Solid SVG charts in place of React Recharts.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ChartDemo } from "../../components/catalog/chart-demo";

const chartData = [
  {
    date: "2024-07-15",
    running: 450,
    swimming: 300,
  },
  {
    date: "2024-07-16",
    running: 380,
    swimming: 420,
  },
  {
    date: "2024-07-17",
    running: 520,
    swimming: 120,
  },
  {
    date: "2024-07-18",
    running: 140,
    swimming: 550,
  },
  {
    date: "2024-07-19",
    running: 600,
    swimming: 350,
  },
  {
    date: "2024-07-20",
    running: 480,
    swimming: 400,
  },
];

export default function Chart() {
  return (
    <ChartDemo
      name="chart-tooltip-indicator-line"
      type="tooltip"
      title="Tooltip - Line Indicator"
      description="Tooltip with line indicator."
      data={chartData}
    />
  );
}
