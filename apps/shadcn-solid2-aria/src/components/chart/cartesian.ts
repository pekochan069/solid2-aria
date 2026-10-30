import {
  areaY,
  barX,
  barY,
  d3Curve,
  dot,
  group,
  lineY,
  stack,
  text,
} from "@tanstack/charts";
import type {
  ChartMark,
  ChartValue,
  ChartAxisPresentationOptions,
} from "@tanstack/charts";
import { decorative } from "@tanstack/charts/mark/decorative";
import { scaleBand } from "@tanstack/charts/scales/band";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { scalePoint } from "@tanstack/charts/scales/point";
import { curveLinear, curveNatural, curveStep } from "d3-shape";

import { chartTheme as theme } from "./data";
import type { DataChartOptions, PlotDatum } from "./data";

function chartCurve(options: DataChartOptions) {
  const variant = options.variant ?? "";

  if (options.curve === "linear" || variant.includes("linear")) {
    return curveLinear;
  }

  if (options.curve === "step" || variant.includes("step")) {
    return curveStep;
  }

  return curveNatural;
}

function barMark(options: DataChartOptions, rows: PlotDatum[]) {
  const radius = options.series[0]?.radius;

  const common = {
    color: (d: PlotDatum) => d.series,
    fill: (d: PlotDatum) => d.color,
    layout: options.stacked === true ? stack() : group(),
    maxThickness: options.series[0]?.maxThickness,
    radius: typeof radius === "number" ? radius : (radius?.[0] ?? 4),
    z: (d: PlotDatum) => d.series,
  };

  return options.horizontal === true
    ? barX(rows, { ...common, x: "value", y: "category" })
    : barY(rows, { ...common, x: "category", y: "value" });
}

function pathMarks(options: DataChartOptions, rows: PlotDatum[]) {
  const marks: ChartMark<PlotDatum>[] = [];
  const variant = options.variant ?? "";

  const curve = chartCurve(options);

  for (const series of options.series) {
    const data = rows.filter((d) => d.series === series.key);

    const common = {
      color: (d: PlotDatum) => d.series,
      curve: d3Curve(curve),
      x: (d: PlotDatum) => d.category,
      y: (d: PlotDatum) => d.upper,
      z: (d: PlotDatum) => d.series,
    };

    if (options.kind === "area") {
      marks.push(
        areaY(data, {
          ...common,
          fill:
            options.gradient === true
              ? `url(#area-${series.key})`
              : (series.fill ?? series.color),
          fillOpacity:
            options.gradient === true ? 1 : (series.fillOpacity ?? 0.3),
          y1: (d) => d.lower,
        })
      );
    }

    const line = lineY(data, {
      ...common,
      stroke: series.color,
      strokeDasharray: series.strokeDasharray,
      strokeWidth: series.strokeWidth ?? 2,
    });

    marks.push(options.kind === "area" ? decorative(line) : line);
  }

  if (variant.includes("dots") || variant.includes("label")) {
    marks.push(
      decorative(
        dot(rows, {
          color: (d) => (variant.includes("colors") ? d.category : d.series),
          r: variant.includes("custom") ? 5 : 3,
          x: "category",
          y: "upper",
        })
      )
    );
  }

  return marks;
}

export function cartesianMarks(options: DataChartOptions, rows: PlotDatum[]) {
  const variant = options.variant ?? "";

  const marks =
    options.kind === "bar"
      ? [barMark(options, rows)]
      : pathMarks(options, rows);

  if (variant.includes("label")) {
    marks.push(
      decorative(
        text(rows, {
          dy: -10,
          fill: theme.foreground,
          fontSize: 11,
          text: (d) =>
            variant.includes("custom") ? `${d.category} ${d.value}` : d.value,
          x: (d) => (options.horizontal === true ? d.upper : d.category),
          y: (d) => (options.horizontal === true ? d.category : d.upper),
        })
      )
    );
  }

  return marks;
}

export function cartesianScales(options: DataChartOptions, rows: PlotDatum[]) {
  const axis: false | ChartAxisPresentationOptions<ChartValue> =
    options.axis === false
      ? false
      : {
          line: false,
          ticks: {
            format: (value: ChartValue) =>
              options.formatCategory?.(String(value)) ??
              String(value).slice(0, 3),
            line: false as const,
            size: 0,
            spacing: 70,
          },
        };

  const categoryScale = {
    axis,
    reverse: options.reversed,
    scale:
      options.kind === "bar"
        ? () => scaleBand().padding(0.2)
        : () => scalePoint().padding(0.15),
  };

  const values = rows.flatMap((d) => [d.lower, d.upper]);

  const valueScale = {
    axis:
      options.valueAxis === true
        ? { line: false, ticks: false as const }
        : (false as const),
    grid: options.grid !== false,
    nice: !(options.expanded === true),
    scale: () =>
      scaleLinear().domain([Math.min(0, ...values), Math.max(1, ...values)]),
  };

  return options.horizontal === true
    ? { x: valueScale, y: categoryScale }
    : { x: categoryScale, y: valueScale };
}
