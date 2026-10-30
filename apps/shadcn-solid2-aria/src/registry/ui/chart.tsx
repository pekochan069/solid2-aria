/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/chart.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, and TanStack Charts through @solid2-aria/tanstack-charts.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import type { ComponentProps, JSX } from "@solidjs/web";
import { dynamic } from "@solidjs/web";
import { cn } from "cn";
import type { Component } from "solid-js";
import {
  createContext,
  useContext,
  createUniqueId,
  For,
  Show,
  omit,
} from "solid-js";

export { Chart } from "@solid2-aria/tanstack-charts";

export type {
  ChartProps,
  ChartDefinition,
  ChartPoint,
  ChartTooltipBodyRenderContext,
} from "@solid2-aria/tanstack-charts";

export type ChartConfig = Record<
  string,
  {
    label?: JSX.Element;
    icon?: Component;
  } & (
    | {
        color?: string;
        theme?: never;
      }
    | {
        color?: never;
        theme: {
          light: string;
          dark: string;
        };
      }
  )
>;

export interface ChartPayload {
  dataKey?: string | number;
  name?: string | number;
  value?: string | number;
  color?: string;
  type?: string;
  // oxlint-disable-next-line anti-slop/no-unsafe-dictionary-type -- Renderer-owned payloads are passed through to formatter callbacks without interpretation.
  payload?: Record<string, unknown>;
}

const ChartContext = createContext<{
  config: ChartConfig;
}>();

function useChart() {
  return useContext(ChartContext);
}

function ChartContainer(
  props: ComponentProps<"div"> & {
    config: ChartConfig;
    initialDimension?: {
      width: number;
      height: number;
    };
  }
) {
  const id = createUniqueId();

  const chartId = () =>
    `chart-${(typeof props.id === "string" ? props.id : id).replaceAll(/[^a-zA-Z0-9_-]/gu, "_")}`;

  const rest = omit(props, "config", "initialDimension", "children", "class");

  return (
    <ChartContext value={props}>
      <div
        {...rest}
        data-slot="chart"
        data-chart={chartId()}
        class={cn(
          "cn-chart flex aspect-video min-w-0 justify-center text-xs [&_svg]:h-full [&_svg]:w-full",
          props.class
        )}
      >
        <ChartStyle config={props.config} id={chartId()} />
        {props.children}
      </div>
    </ChartContext>
  );
}

// Escape selectors and reject declaration delimiters because configuration becomes CSS text.
const token = (value: string) => value.replaceAll(/[^a-zA-Z0-9_-]/gu, "_");

const color = (value: string | undefined) =>
  value !== undefined && value !== "" && !/[;{}<>]/u.test(value)
    ? value
    : "initial";

function ChartStyle(props: { id: string; config: ChartConfig }) {
  const css = () =>
    (["light", "dark"] as const)
      .map(
        (theme) =>
          `${theme === "dark" ? ".dark " : ""}[data-chart="${props.id.replaceAll(/["\\<>]/gu, "_")}"] { ${Object.entries(
            props.config
          )
            .map(
              ([key, item]) =>
                `--color-${token(key)}: ${color(item.theme?.[theme] ?? item.color)};`
            )
            .join(" ")} }`
      )
      .join("\n");

  return <style>{css()}</style>;
}

type ChartTooltipProps = ComponentProps<"div"> & {
  active?: boolean;
  payload?: ChartPayload[];
  label?: JSX.Element;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: "line" | "dot" | "dashed";
  nameKey?: string;
  labelKey?: string;
  labelFormatter?: (label: JSX.Element, payload: ChartPayload[]) => JSX.Element;
  formatter?: (
    value: string | number | undefined,
    name: string | number | undefined,
    item: ChartPayload,
    index: number
  ) => JSX.Element;
};

function ChartTooltipContent(props: ChartTooltipProps) {
  const chart = useChart();

  const config = (item: ChartPayload) =>
    chart.config[String(item.dataKey ?? item.name ?? "value")];

  return (
    <Show when={(props.active ?? false) && (props.payload?.length ?? 0) > 0}>
      <div
        data-slot="chart-tooltip"
        class={cn(
          "cn-chart-tooltip bg-background grid min-w-32 items-start gap-1.5 rounded-lg border p-2.5 text-xs shadow-xl",
          props.class
        )}
      >
        {!(props.hideLabel ?? false) && (
          <div class="font-medium">
            {props.labelFormatter
              ? props.labelFormatter(props.label, props.payload ?? [])
              : props.label}
          </div>
        )}
        <For each={props.payload?.filter((item) => item.type !== "none")}>
          {(item, index) => {
            const Icon = dynamic(() => config(item)?.icon);

            return (
              <div class="flex items-center gap-2">
                {!(props.hideIndicator ?? false) && (
                  <span
                    class={cn(
                      "h-2.5 w-2.5 shrink-0 rounded-xs",
                      props.indicator === "line" && "w-1",
                      props.indicator === "dashed" &&
                        "border border-dashed bg-transparent"
                    )}
                    style={{ "background-color": item.color }}
                  />
                )}
                <Icon />
                {props.formatter ? (
                  props.formatter(item.value, item.name, item, index())
                ) : (
                  <>
                    <span class="text-muted-foreground">
                      {config(item)?.label ?? item.name}
                    </span>
                    <span class="ml-auto font-mono font-medium tabular-nums">
                      {typeof item.value === "number"
                        ? item.value.toLocaleString()
                        : item.value}
                    </span>
                  </>
                )}
              </div>
            );
          }}
        </For>
      </div>
    </Show>
  );
}

function ChartLegendContent(
  props: ComponentProps<"div"> & {
    payload?: ChartPayload[];
    hideIcon?: boolean;
    nameKey?: string;
    verticalAlign?: "top" | "bottom";
  }
) {
  const chart = useChart();

  return (
    <div
      data-slot="chart-legend"
      class={cn(
        "cn-chart-legend flex items-center justify-center gap-4",
        props.verticalAlign === "top" ? "pb-3" : "pt-3",
        props.class
      )}
    >
      <For each={props.payload}>
        {(item) => (
          <div class="flex items-center gap-1.5">
            {!(props.hideIcon ?? false) && (
              <span
                class="size-2 rounded-xs"
                style={{ "background-color": item.color }}
              />
            )}
            {chart.config[String(item.dataKey ?? item.name)]?.label ??
              item.name}
          </div>
        )}
      </For>
    </div>
  );
}

const ChartTooltip = ChartTooltipContent;
const ChartLegend = ChartLegendContent;

export {
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
};
