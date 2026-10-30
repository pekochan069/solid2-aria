/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/new-york-v4/charts/chart-radial-stacked.tsx.
 * Modified for Solid Aria: upstream chart data and card content rendered with native Solid SVG charts in place of React Recharts.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ChartDemo } from "../../components/catalog/chart-demo";

const chartData = [
  {
    desktop: 1260,
    mobile: 570,
    month: "january",
  },
];

export default function Chart() {
  return (
    <ChartDemo
      name="chart-radial-stacked"
      type="radial"
      title="Radial Chart - Stacked"
      description="January - June 2024"
      data={chartData}
    />
  );
}
