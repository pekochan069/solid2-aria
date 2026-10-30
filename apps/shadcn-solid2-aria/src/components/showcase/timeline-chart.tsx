/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/examples/dashboard/components/chart-area-interactive.tsx and app/(app)/(styles)/sera/audience-analytics/components/traffic-overview.tsx.
 * Modified for Solid Aria: responsive TanStack Charts through @solid2-aria/tanstack-charts, Solid 2 reactive data, and shared tooltips.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ChartContainer } from "../../registry/ui/chart";
import { DataChart } from "../chart/data-chart";

interface TimelinePoint {
  date: string;
  first: number;
  second: number;
}

const date = (value: string) =>
  new Date(`${value}T00:00:00Z`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

export function TimelineChart(props: {
  points: TimelinePoint[];
  variant: "visitors" | "traffic";
  label: string;
}) {
  const series = () => [
    {
      color: props.variant === "traffic" ? "var(--chart-5)" : "var(--primary)",
      key: "first",
      label: props.variant === "traffic" ? "Views" : "Desktop",
    },
    {
      color: props.variant === "traffic" ? "var(--chart-1)" : "var(--primary)",
      fillOpacity: 0.2,
      key: "second",
      label: props.variant === "traffic" ? "Unique" : "Mobile",
      strokeDasharray: props.variant === "traffic" ? "4 6" : undefined,
    },
  ];

  const config = () =>
    Object.fromEntries(
      series().map((item) => [
        item.key,
        { color: item.color, label: item.label },
      ])
    );

  return (
    <div
      class="timeline-chart"
      style={{ height: props.variant === "traffic" ? "328px" : "250px" }}
    >
      <ChartContainer config={config()} class="aspect-auto h-full w-full">
        <DataChart
          data={props.points.map((point) => ({ ...point }))}
          kind={props.variant === "traffic" ? "line" : "area"}
          series={series()}
          label={props.label}
          category="date"
          formatCategory={date}
          curve={props.variant === "traffic" ? "linear" : "natural"}
          stacked={props.variant === "visitors"}
          gradient={props.variant === "visitors"}
          tooltipOptions={{ labelFormatter: date }}
        />
      </ChartContainer>
    </div>
  );
}
