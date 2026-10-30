/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(styles)/sera/audience-analytics/components/metrics-grid.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive control state, and local Aria primitives.
 * Licensed under MIT. See ../../../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { TrendingDownIcon, TrendingUpIcon } from "@lucide/solid";
import { cn } from "cn";
import { For } from "solid-js";

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "../../../../../registry/ui/card";

interface Metric {
  label: string;
  value: string;
  comparison: string;
  change: string;
  trend: "up" | "down";
}

const METRIC_CARDS: Metric[] = [
  {
    change: "vs last period",
    comparison: "12.4%",
    label: "Total visitors",
    trend: "up",
    value: "248.5k",
  },
  {
    change: "vs last period",
    comparison: "8.7%",
    label: "Unique readers",
    trend: "up",
    value: "182.1k",
  },
  {
    change: "vs last period",
    comparison: "1.2%",
    label: "Avg. time on page",
    trend: "down",
    value: "3m 42s",
  },
  {
    change: "vs last period",
    comparison: "3.5%",
    label: "Bounce rate",
    trend: "down",
    value: "42.8%",
  },
];

export function MetricsGrid() {
  return (
    <>
      <For each={METRIC_CARDS}>
        {(metric) => (
          <MetricCard
            metric={metric}
            class="col-span-full md:col-span-6 lg:col-span-3"
          />
        )}
      </For>
    </>
  );
}

function MetricCard(props: { metric: Metric; class: string }) {
  return (
    <Card class={cn("gap-0", props.class)}>
      <CardContent class="flex flex-col gap-2">
        <CardDescription class="text-xs uppercase">
          {props.metric.label}
        </CardDescription>
        <CardTitle class="text-5xl tracking-tight lowercase">
          {props.metric.value}
        </CardTitle>
        <CardDescription>
          {props.metric.trend === "up" ? (
            <TrendingUpIcon class="text-muted-foreground inline-block size-2.5" />
          ) : (
            <TrendingDownIcon class="text-muted-foreground inline-block size-2.5" />
          )}{" "}
          <span class="text-foreground">{props.metric.comparison}</span>{" "}
          <span>{props.metric.change}</span>
        </CardDescription>
      </CardContent>
    </Card>
  );
}
