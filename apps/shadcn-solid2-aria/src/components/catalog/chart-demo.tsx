import { createMemo, createSignal, For, Show } from "solid-js";

import { Button } from "../../registry/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../registry/ui/card";
import { ChartContainer } from "../../registry/ui/chart";
import type { ChartConfig } from "../../registry/ui/chart";
import { DataChart } from "../chart/data-chart";
import {
  chartCategory as label,
  chartColor as color,
  chartSeries,
} from "../chart/definition";
import type { ChartKind, ChartRow } from "../chart/definition";

interface ChartDemoProps {
  name: string;
  type: string;
  title: string;
  description: string;
  data: ChartRow[];
}

export function ChartDemo(props: ChartDemoProps) {
  const [days, setDays] = createSignal(90);
  const [series, setSeries] = createSignal("all");
  const data = createMemo(() => props.data.slice(-days()));
  const allSeries = createMemo(() => chartSeries(data()));
  const keys = () => allSeries().map((item) => item.key);

  const visible = () =>
    allSeries().filter((item) => series() === "all" || item.key === series());

  const kind = (): ChartKind => {
    switch (props.type) {
      case "area":
      case "line":
      case "pie":
      case "radar":
      case "radial": {
        return props.type;
      }

      default: {
        return "bar";
      }
    }
  };

  const config = createMemo(() => {
    const configured: ChartConfig = {};

    for (const item of allSeries()) {
      configured[item.key] = { color: item.color, label: item.label };
    }

    for (const [index, row] of data().entries()) {
      configured[label(row)] = { color: color(index), label: label(row) };
    }

    return configured;
  });

  const total = () =>
    data().reduce((sum, row) => sum + Number(row[keys()[0] ?? ""] ?? 0), 0);

  return (
    <Card class="h-full">
      <CardHeader class="flex-row items-start justify-between gap-3">
        <div class="space-y-1.5">
          <CardTitle>{props.title}</CardTitle>
          <CardDescription>{props.description}</CardDescription>
        </div>
        <Show when={props.name.includes("interactive")}>
          <label class="text-xs">
            <span class="sr-only">Chart time range</span>
            <select
              aria-label="Chart time range"
              class="bg-background rounded-md border p-2 text-sm"
              value={days()}
              onChange={(event) => {
                setDays(Number(event.currentTarget.value));
              }}
            >
              <option value="90">Last 3 months</option>
              <option value="30">Last 30 days</option>
              <option value="7">Last 7 days</option>
            </select>
          </label>
        </Show>
      </CardHeader>
      <CardContent class="relative">
        <ChartContainer config={config()} class="h-67.5 w-full">
          <DataChart
            data={data()}
            kind={kind()}
            series={visible()}
            variant={props.name}
            label={props.title}
            stacked={props.name.includes("stacked")}
            expanded={props.name.includes("expand")}
            gradient={props.name.includes("gradient")}
            horizontal={props.name.includes("horizontal")}
            valueAxis={props.name.includes("axes")}
            tooltipOptions={{
              hideIndicator: props.name.includes("indicator-none"),
              hideLabel: props.name.includes("label-none"),
              indicator: props.name.includes("indicator-line") ? "line" : "dot",
            }}
          >
            <Show
              when={
                props.name.includes("text") ||
                props.name.includes("donut-active")
              }
            >
              <text
                x="150"
                y="140"
                text-anchor="middle"
                class="fill-foreground text-2xl font-bold"
              >
                {total().toLocaleString()}
              </text>
              <text
                x="150"
                y="163"
                text-anchor="middle"
                class="fill-muted-foreground text-xs"
              >
                Visitors
              </text>
            </Show>
          </DataChart>
        </ChartContainer>
      </CardContent>
      <CardFooter class="flex-col items-start gap-2 text-sm">
        <Show when={props.name.includes("legend") && props.type === "pie"}>
          <div class="flex flex-wrap gap-3">
            <For each={data()}>
              {(row, index) => (
                <span class="inline-flex items-center gap-1.5">
                  <span
                    class="size-2 rounded-sm"
                    style={{ background: color(index()) }}
                  />
                  {label(row)}
                </span>
              )}
            </For>
          </div>
        </Show>
        <Show
          when={
            props.name.includes("interactive") ||
            props.name.includes("legend") ||
            props.name.includes("multiple")
          }
        >
          <div class="flex flex-wrap gap-2">
            <Button
              size="xs"
              variant={series() === "all" ? "secondary" : "ghost"}
              onClick={() => {
                setSeries("all");
              }}
            >
              All
            </Button>
            <For each={keys()}>
              {(key, index) => (
                <Button
                  size="xs"
                  variant={series() === key ? "secondary" : "ghost"}
                  onClick={() => {
                    setSeries(key);
                  }}
                >
                  <span
                    class="size-2 rounded-sm"
                    style={{ background: color(index()) }}
                  />
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Button>
              )}
            </For>
          </div>
        </Show>
        <p class="font-medium">Trending up by 5.2% this month ↗</p>
        <p class="text-muted-foreground">
          Showing total visitors for the last{" "}
          {Math.min(days(), props.data.length)} periods
        </p>
      </CardFooter>
    </Card>
  );
}
