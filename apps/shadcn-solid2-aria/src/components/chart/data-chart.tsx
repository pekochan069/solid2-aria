import { Chart } from "@solid2-aria/tanstack-charts";
import type { ComponentProps, JSX } from "@solidjs/web";
import { createMemo, Show } from "solid-js";

import {
  ChartLegendContent,
  ChartTooltipContent,
} from "../../registry/ui/chart";
import {
  chartCategory,
  chartColor,
  createDataChartDefinition,
} from "./definition";
import type { DataChartOptions } from "./definition";

export interface DataChartProps extends DataChartOptions {
  label: string;
  height?: number;
  legend?: boolean;
  tooltipOptions?: Omit<
    ComponentProps<typeof ChartTooltipContent>,
    "labelFormatter"
  > & {
    labelFormatter?: (value: string) => JSX.Element;
  };
  children?: JSX.Element;
}

export function DataChart(props: DataChartProps) {
  const definition = createMemo(() => createDataChartDefinition(props));
  const polar = () => props.kind === "pie" || props.kind === "radial";

  const legend = () =>
    polar()
      ? props.data.map((row, index) => ({
          color: String(row.fill ?? chartColor(index)),
          name: chartCategory(row, props.category),
        }))
      : props.series.map((series, index) => ({
          color: series.color ?? chartColor(index),
          dataKey: series.key,
          name: series.label ?? series.key,
        }));

  return (
    <div
      class="data-chart relative flex h-full min-h-0 w-full flex-col"
      role="group"
      aria-label={props.label}
    >
      <Chart
        ariaLabel={props.label}
        definition={definition()}
        height={props.height}
        style={{ flex: "1 1 auto", height: "100%", "min-height": "0" }}
        renderTooltipBody={(context) => (
          <ChartTooltipContent
            {...props.tooltipOptions}
            labelFormatter={
              props.tooltipOptions?.labelFormatter
                ? () =>
                    props.tooltipOptions?.labelFormatter?.(
                      context.primaryPoint?.datum.category ?? ""
                    )
                : undefined
            }
            active
            label={context.primaryPoint?.datum.category}
            payload={context.points.map((point) => ({
              color: point.datum.color,
              dataKey: point.datum.series,
              name: polar() ? point.datum.category : point.datum.label,
              payload: point.datum.row,
              value: Number(
                point.datum.row[point.datum.series] ?? point.datum.value
              ),
            }))}
          />
        )}
      />
      <Show when={props.children}>
        <svg
          class="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 300 300"
          aria-hidden="true"
        >
          {props.children}
        </svg>
      </Show>
      <Show when={props.legend}>
        <ChartLegendContent payload={legend()} />
      </Show>
    </div>
  );
}

export function ChartCenterLabel(props: {
  value?: string | number;
  children?: JSX.Element;
  content?: (props: { viewBox: { cx: number; cy: number } }) => JSX.Element;
}) {
  return (
    <>
      {props.content?.({ viewBox: { cx: 150, cy: 140 } }) ?? (
        <text x="150" y="140" text-anchor="middle">
          {props.value ?? props.children}
        </text>
      )}
    </>
  );
}
