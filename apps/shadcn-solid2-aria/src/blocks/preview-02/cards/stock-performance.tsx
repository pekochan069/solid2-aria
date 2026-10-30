/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview-02/cards/stock-performance.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive data, and TanStack Charts through @solid2-aria/tanstack-charts.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { createSignal, For, createMemo } from "solid-js";

import { DataChart } from "../../../components/chart/data-chart";
import { hasKey } from "../../../lib/has-key";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../registry/ui/card";
import { ChartContainer } from "../../../registry/ui/chart";
import type { ChartConfig } from "../../../registry/ui/chart";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "../../../registry/ui/combobox";
import { Field, FieldGroup, FieldLabel } from "../../../registry/ui/field";
import { Separator } from "../../../registry/ui/separator";

const TICKERS = ["VOO", "VIG", "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"];

const CHART_DATA = {
  AAPL: [
    { month: "Jan", price: 185 },
    { month: "Feb", price: 210 },
    { month: "Mar", price: 172 },
    { month: "Apr", price: 198 },
    { month: "May", price: 178 },
    { month: "Jun", price: 215 },
  ],
  VOO: [
    { month: "Jan", price: 412 },
    { month: "Feb", price: 438 },
    { month: "Mar", price: 395 },
    { month: "Apr", price: 450 },
    { month: "May", price: 420 },
    { month: "Jun", price: 462 },
  ],
} satisfies Record<string, { month: string; price: number }[]>;

const DEFAULT_DATA = [
  { month: "Jan", price: 100 },
  { month: "Feb", price: 118 },
  { month: "Mar", price: 95 },
  { month: "Apr", price: 125 },
  { month: "May", price: 108 },
  { month: "Jun", price: 130 },
];

const chartConfig = {
  price: {
    color: "var(--chart-1)",
    label: "Price",
  },
} satisfies ChartConfig;

export function StockPerformance() {
  const [ticker, setTicker] = createSignal("VOO");

  const data = createMemo(() => {
    const key = ticker();

    return hasKey(CHART_DATA, key) ? CHART_DATA[key] : DEFAULT_DATA;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Performance</CardTitle>
        <CardDescription>6-month price history.</CardDescription>
      </CardHeader>
      <CardContent class="flex flex-col gap-4">
        <FieldGroup>
          <Field>
            <FieldLabel for="ticker-select">Ticker</FieldLabel>
            <Combobox
              value={ticker()}
              onChange={(key) => {
                if (key !== null) {
                  setTicker(String(key));
                }
              }}
            >
              <ComboboxInput
                id="ticker-select"
                placeholder="Search ticker..."
              />
              <ComboboxContent>
                <ComboboxEmpty>No tickers found.</ComboboxEmpty>
                <ComboboxList>
                  {
                    <For each={TICKERS}>
                      {(item) => <ComboboxItem id={item}>{item}</ComboboxItem>}
                    </For>
                  }
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </Field>
        </FieldGroup>
        <Separator class="style-sera:hidden" />
        <ChartContainer config={chartConfig} class="h-[200px] w-full">
          <DataChart
            kind="area"
            label="Visitor statistics"
            data={data()}
            series={[
              { color: "var(--color-price)", key: "price", strokeWidth: 2 },
            ]}
            grid={true}
            axis={false}
            tooltip={true}
            curve={"monotone"}
            tooltipOptions={{ hideLabel: true }}
          />
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default StockPerformance;
