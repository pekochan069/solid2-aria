import {
  angleGrid,
  pie,
  polar,
  radialArc,
  radialArea,
  radialDot,
  radialGrid,
  radialLine,
  radialText,
} from "@tanstack/charts/polar";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { scalePoint } from "@tanstack/charts/scales/point";
import { curveLinearClosed } from "d3-shape";

import { chartColor, chartTheme as theme } from "./data";
import type { DataChartOptions, PlotDatum } from "./data";

function radarMark(options: DataChartOptions, rows: PlotDatum[]) {
  const variant = options.variant ?? "";

  const path = {
    angle: (d: PlotDatum) => d.category,
    curve: curveLinearClosed,
    radius: (d: PlotDatum) => d.value,
    z: (d: PlotDatum) => d.series,
  };

  return polar({
    guides: [
      ...(variant.includes("grid-none")
        ? []
        : [
            radialGrid({
              fill: variant.includes("fill") ? "var(--muted)" : "none",
              // oxlint-disable-next-line anti-slop/no-shape-in-symbol-names -- TanStack radialGrid API.
              shape: variant.includes("circle") ? "circle" : "polygon",
              stroke: theme.grid,
              ticks: 4,
            }),
          ]),
      angleGrid({
        labelFill: theme.muted,
        labelFontSize: 11,
        stroke: variant.includes("no-lines") ? "none" : theme.grid,
      }),
    ],
    inset: 28,
    marks: [
      ...(variant.includes("lines-only")
        ? []
        : [
            radialArea(rows, {
              ...path,
              fill: (d) => d.color,
              fillOpacity: 0.2,
            }),
          ]),
      radialLine(rows, { ...path, stroke: (d) => d.color, strokeWidth: 2 }),
      ...(variant.includes("dots")
        ? [radialDot(rows, { ...path, fill: (d) => d.color, r: 4 })]
        : []),
    ],
    scales: {
      angle: { scale: scalePoint<string> },
      radius: { nice: true, scale: scaleLinear },
    },
  });
}

export function polarMark(options: DataChartOptions, rows: PlotDatum[]) {
  const variant = options.variant ?? "";
  const labels = variant.includes("label");

  if (options.kind === "radar") {
    return radarMark(options, rows);
  }

  const first = options.series[0]?.key;

  const selected =
    options.kind === "pie" && !(options.stacked === true)
      ? rows.filter((d) => d.series === first)
      : rows;

  const slices =
    options.kind === "pie"
      ? options.series
          .filter((s) => options.stacked === true || s.key === first)
          .flatMap((series) =>
            pie(
              selected.filter((d) => d.series === series.key),
              {
                endAngle: options.endAngle,
                startAngle: options.startAngle,
                value: "value",
              }
            ).map((d): PlotDatum => ({
              ...d,
              color: String(d.row.fill ?? chartColor(d.index)),
            }))
          )
      : selected.map((d): PlotDatum => {
          const maximum = Math.max(
            1,
            ...selected.map((item) =>
              options.stacked === true ? item.upper : item.value
            )
          );

          const end = options.stacked === true ? Math.PI : Math.PI * 1.5;

          return {
            ...d,
            color:
              options.stacked === true
                ? d.color
                : String(d.row.fill ?? chartColor(d.index)),
            endAngle:
              ((options.stacked === true ? d.upper : d.value) / maximum) * end,
            startAngle:
              (options.stacked === true ? d.lower / maximum : 0) * end,
          };
        });

  const ring = (d: PlotDatum) =>
    options.kind === "radial" && options.stacked !== true
      ? d.index
      : options.series.findIndex((series) => series.key === d.series);

  const arcs = [...new Set(slices.map(ring))].map((ringIndex) =>
    radialArc(
      slices.filter((d) => ring(d) === ringIndex),
      {
        endAngle: "endAngle",
        fill: (d) => d.color,
        innerRadius: (context) =>
          context.radius * ringRadii(options, ringIndex, slices.length).inner,
        outerRadius: (context) =>
          context.radius * ringRadii(options, ringIndex, slices.length).outer,
        startAngle: "startAngle",
        stroke: variant.includes("separator-none") ? "none" : theme.background,
        strokeWidth: 2,
      }
    )
  );

  const layout = {
    inset: labels ? 30 : 8,
    startAngle:
      options.kind === "radial" && options.stacked === true ? -Math.PI / 2 : 0,
  };

  if (labels) {
    return polar({
      ...layout,
      marks: [
        ...arcs,
        radialText(slices, {
          anchor: "middle",
          angle: (d) => (d.startAngle + d.endAngle) / 2,
          fill: theme.foreground,
          fontSize: 11,
          radius: () => 1,
          text: (d) =>
            variant.includes("custom")
              ? `${d.category} ${d.value}`
              : d.category,
        }),
      ],
      scales: {
        angle: { scale: () => scaleLinear().domain([0, Math.PI * 2]) },
        radius: { scale: () => scaleLinear().domain([0, 1]) },
      },
    });
  }

  return polar({
    ...layout,
    marks: arcs,
    scales: { angle: null, radius: null },
  });
}

function ringRadii(options: DataChartOptions, index: number, count: number) {
  if (options.kind === "pie" && options.stacked === true) {
    const width = 0.7 / Math.max(1, options.series.length);

    return {
      inner: 0.3 + index * width,
      outer: 0.3 + (index + 1) * width - 0.02,
    };
  }

  if (options.kind === "radial" && options.stacked !== true) {
    const width = 0.75 / Math.max(1, count);

    return {
      inner: 0.25 + index * width,
      outer: 0.25 + (index + 1) * width - 0.02,
    };
  }

  const donut =
    options.variant?.includes("donut") === true || options.kind === "radial";

  return {
    inner:
      (options.innerRadius ?? (donut ? 60 : 0)) / (options.outerRadius ?? 100),
    outer: 1,
  };
}
