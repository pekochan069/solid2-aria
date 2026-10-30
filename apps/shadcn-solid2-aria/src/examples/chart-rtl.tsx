/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/chart-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive data, and TanStack Charts through @solid2-aria/tanstack-charts.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { DataChart } from "../components/chart/data-chart";
import { hasKey } from "../lib/has-key";
import { ChartContainer } from "../registry/ui/chart";
import type { ChartConfig } from "../registry/ui/chart";
import { useTranslation } from "./_support";
import type { Translations } from "./_support";

const translations = {
  ar: {
    dir: "rtl",
    values: {
      april: "أبريل",
      desktop: "سطح المكتب",
      february: "فبراير",
      january: "يناير",
      june: "يونيو",
      march: "مارس",
      may: "مايو",
      mobile: "الجوال",
    },
  },
  en: {
    dir: "ltr",
    values: {
      april: "April",
      desktop: "Desktop",
      february: "February",
      january: "January",
      june: "June",
      march: "March",
      may: "May",
      mobile: "Mobile",
    },
  },
  he: {
    dir: "rtl",
    values: {
      april: "אפריל",
      desktop: "מחשב",
      february: "פברואר",
      january: "ינואר",
      june: "יוני",
      march: "מרץ",
      may: "מאי",
      mobile: "נייד",
    },
  },
} satisfies Translations;

const chartData = [
  { desktop: 186, mobile: 80, month: "january" },
  { desktop: 305, mobile: 200, month: "february" },
  { desktop: 237, mobile: 120, month: "march" },
  { desktop: 73, mobile: 190, month: "april" },
  { desktop: 209, mobile: 130, month: "may" },
  { desktop: 214, mobile: 140, month: "june" },
];

export function ChartRtl() {
  const { t, dir } = useTranslation(translations, "ar");

  const chartConfig = {
    desktop: {
      color: "var(--chart-2)",
      label: t.desktop,
    },
    mobile: {
      color: "var(--chart-1)",
      label: t.mobile,
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig} class="min-h-[200px] w-full">
      <DataChart
        kind="bar"
        label="Visitor statistics"
        data={chartData}
        series={[
          { color: "var(--color-desktop)", key: "desktop", radius: 4 },
          { color: "var(--color-mobile)", key: "mobile", radius: 4 },
        ]}
        grid={true}
        axis={true}
        tooltip={true}
        category={"month"}
        formatCategory={(value) =>
          (hasKey(t, value) ? t[value] : value).slice(0, 3)
        }
        reversed={dir === "rtl"}
        legend
        tooltipOptions={{
          labelFormatter: (value) => (hasKey(t, value) ? t[value] : value),
        }}
      />
    </ChartContainer>
  );
}

export default ChartRtl;
