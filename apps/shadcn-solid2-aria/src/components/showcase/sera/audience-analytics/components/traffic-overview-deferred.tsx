/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(styles)/sera/audience-analytics/components/traffic-overview.tsx and traffic-overview-deferred.tsx.
 * Modified for Solid Aria: native Solid 2 card composition with the shared SVG timeline renderer.
 * Licensed under MIT. See ../../../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import type { ComponentProps } from "@solidjs/web";
import { cn } from "cn";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../../registry/ui/card";
import { trafficSeries } from "../../../chart-data";
import { TimelineChart } from "../../../timeline-chart";

export function TrafficOverviewDeferred(props: ComponentProps<typeof Card>) {
  return (
    <Card {...props} class={cn("sera-traffic-chart", props.class)}>
      <CardHeader>
        <CardTitle class="text-2xl">Traffic Overview</CardTitle>
        <CardDescription>
          Traffic for the last 30 days has increased by 12.4% compared to the
          previous period.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TimelineChart
          variant="traffic"
          label="Traffic for the last 30 days"
          points={trafficSeries.map((row) => ({
            date: row.date,
            first: row.views,
            second: row.unique,
          }))}
        />
      </CardContent>
    </Card>
  );
}
