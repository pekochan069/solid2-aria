export type ChartRow = Record<string, string | number>;

export type ChartKind = "bar" | "area" | "line" | "pie" | "radar" | "radial";

export interface ChartSeries {
  key: string;
  label?: string;
  color?: string;
  fill?: string;
  fillOpacity?: number;
  radius?: number | [number, number, number, number];
  maxThickness?: number;
  strokeWidth?: number;
  strokeDasharray?: string;
}

export interface DataChartOptions {
  data: ChartRow[];
  kind: ChartKind;
  series: ChartSeries[];
  category?: string;
  variant?: string;
  grid?: boolean;
  axis?: boolean;
  valueAxis?: boolean;
  stacked?: boolean;
  expanded?: boolean;
  horizontal?: boolean;
  reversed?: boolean;
  curve?: string;
  gradient?: boolean;
  formatCategory?: (value: string) => string;
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  tooltip?: boolean;
}

export interface PlotDatum {
  category: string;
  series: string;
  label: string;
  color: string;
  value: number;
  row: ChartRow;
  index: number;
  lower: number;
  upper: number;
  angle: number;
  startAngle: number;
  endAngle: number;
}

export const chartColor = (index: number) => `var(--chart-${(index % 5) + 1})`;

export const chartCategory = (row: ChartRow, key?: string) => {
  if (key === undefined) {
    return String(
      row.month ??
        row.date ??
        row.day ??
        row.browser ??
        row.name ??
        row.time ??
        row.hour ??
        ""
    );
  }

  return String(row[key] ?? "");
};

export function chartSeries(data: ChartRow[]): ChartSeries[] {
  return Object.keys(data[0] ?? {})
    .filter((key) => typeof data[0]?.[key] === "number")
    .map((key, index) => ({
      color: chartColor(index),
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
    }));
}

export function plotRows(options: DataChartOptions): PlotDatum[] {
  return options.data.flatMap((row, index) => {
    let positive = 0;
    let negative = 0;

    const total = options.series.reduce(
      (sum, series) => sum + Math.max(0, Number(row[series.key]) || 0),
      0
    );

    return options.series.map((series) => {
      const raw = Number(row[series.key]) || 0;

      const value =
        options.expanded === true ? Math.max(0, raw) / (total || 1) : raw;

      const baseline = value < 0 ? negative : positive;
      const lower = options.stacked === true ? baseline : 0;

      if (value < 0) {
        negative += value;
      } else {
        positive += value;
      }

      return {
        angle: 0,
        category: chartCategory(row, options.category),
        color:
          (options.kind === "bar" && options.series.length === 1
            ? String(row.fill ?? series.color ?? chartColor(0))
            : series.color) ?? chartColor(options.series.indexOf(series)),
        endAngle: 0,
        index,
        label: series.label ?? series.key,
        lower,
        row,
        series: series.key,
        startAngle: 0,
        upper: lower + value,
        value,
      };
    });
  });
}

export const chartTheme = {
  background: "var(--background)",
  foreground: "var(--foreground)",
  grid: "var(--border)",
  muted: "var(--muted-foreground)",
  palette: [0, 1, 2, 3, 4].map(chartColor),
};
