import { defineChart } from "@tanstack/charts";
import type { ChartPoint, ChartFocusPreset } from "@tanstack/charts";
import { tooltip } from "@tanstack/charts/tooltip";

import { cartesianMarks, cartesianScales } from "./cartesian";
import { chartColor, chartTheme as theme, plotRows } from "./data";
import type { DataChartOptions, PlotDatum } from "./data";
import { polarMark } from "./polar";

export { chartColor, chartCategory, chartSeries } from "./data";

export type {
  ChartRow,
  ChartKind,
  ChartSeries,
  DataChartOptions,
} from "./data";

function chartGradients(options: DataChartOptions) {
  return options.gradient === true
    ? options.series.map((series, index) => ({
        id: `area-${series.key}`,
        stops: [
          {
            color: series.color ?? chartColor(index),
            offset: 0.05,
            opacity: series.fillOpacity ?? 0.8,
          },
          {
            color: series.color ?? chartColor(index),
            offset: 0.95,
            opacity: 0.1,
          },
        ],
        x1: 0,
        x2: 0,
        y1: 0,
        y2: 1,
      }))
    : undefined;
}

export function createDataChartDefinition(options: DataChartOptions) {
  const rows = plotRows(options);

  const polarChart =
    options.kind === "pie" ||
    options.kind === "radial" ||
    options.kind === "radar";

  let focus: ChartFocusPreset = "nearest";

  if (!polarChart) {
    focus = options.horizontal === true ? "group-y" : "group-x";
  }

  const definition = {
    color: {
      domain: options.series.map((s) => s.key),
      range: options.series.map((s, i) => s.color ?? chartColor(i)),
    },
    focus,
    gradients: chartGradients(options),
    margin: polarChart
      ? 8
      : {
          bottom: options.axis === false ? 8 : 32,
          left:
            options.valueAxis === true || options.horizontal === true ? 50 : 12,
          right: 16,
          top: 20,
        },
    theme,
    tooltip:
      options.tooltip === false
        ? (false as const)
        : {
            className: "data-chart-tooltip",
            content: (points: readonly ChartPoint<PlotDatum>[]) => ({
              rows: points.map((point) => ({
                color: point.datum.color,
                label: point.datum.label,
                value: Number(
                  point.datum.row[point.datum.series] ?? point.datum.value
                ).toLocaleString(),
              })),
              title: points[0]?.datum.category,
            }),
            use: tooltip,
          },
  };

  if (polarChart) {
    return defineChart({
      ...definition,
      marks: [polarMark(options, rows)],
      scales: { x: null, y: null },
    });
  }

  return defineChart({
    ...definition,
    marks: cartesianMarks(options, rows),
    scales: cartesianScales(options, rows),
  });
}
