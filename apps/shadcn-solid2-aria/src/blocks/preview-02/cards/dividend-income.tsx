/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview-02/cards/dividend-income.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive data, and TanStack Charts through @solid2-aria/tanstack-charts.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { XIcon } from "@lucide/solid";
import { For } from "solid-js";

import { DataChart } from "../../../components/chart/data-chart";
import { Button } from "../../../registry/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../registry/ui/card";
import { ChartContainer } from "../../../registry/ui/chart";
import type { ChartConfig } from "../../../registry/ui/chart";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "../../../registry/ui/item";
import { useDesignSystemSearchParams } from "../../_config";

const HOLDINGS = [
  {
    amount: "$1,842.10",
    data: [
      { q: "Q1", value: 380 },
      { q: "Q2", value: 420 },
      { q: "Q3", value: 390 },
      { q: "Q4", value: 652 },
    ],
    name: "Vanguard VIG",
    shares: "450 Shares",
  },
  {
    amount: "$928.40",
    data: [
      { q: "Q1", value: 180 },
      { q: "Q2", value: 210 },
      { q: "Q3", value: 320 },
      { q: "Q4", value: 218 },
    ],
    name: "S&P 500 VOO",
    shares: "112 Shares",
  },
  {
    amount: "$340.00",
    data: [
      { q: "Q1", value: 60 },
      { q: "Q2", value: 70 },
      { q: "Q3", value: 120 },
      { q: "Q4", value: 90 },
    ],
    name: "Apple AAPL",
    shares: "85 Shares",
  },
  {
    amount: "$1,139.50",
    data: [
      { q: "Q1", value: 240 },
      { q: "Q2", value: 260 },
      { q: "Q3", value: 280 },
      { q: "Q4", value: 360 },
    ],
    name: "Realty Income",
    shares: "320 Shares",
  },
];

const miniChartConfig = {
  value: {
    color: "var(--chart-2)",
    label: "Dividend",
  },
} satisfies ChartConfig;

export function DividendIncome() {
  const [params] = useDesignSystemSearchParams();
  const isRounded = !["lyra", "sera"].includes(params.style);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Q2 Dividend Income</CardTitle>
        <CardDescription>
          Quarterly dividend payouts across your portfolio holdings.
        </CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon-sm" class="bg-muted">
            <XIcon />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ItemGroup>
          {
            <For each={HOLDINGS}>
              {(holding) => (
                <Item variant="muted">
                  <ItemContent>
                    <ItemTitle>{holding.name}</ItemTitle>
                    <ItemDescription>{holding.shares}</ItemDescription>
                  </ItemContent>
                  <ChartContainer
                    config={miniChartConfig}
                    class="hidden h-8 w-24 md:block"
                  >
                    <DataChart
                      kind="bar"
                      label="Visitor statistics"
                      data={holding.data}
                      series={[
                        {
                          color: "var(--color-value)",
                          key: "value",
                          radius: isRounded ? [3, 3, 0, 0] : 0,
                        },
                      ]}
                      grid={false}
                      axis={false}
                      tooltip={true}
                      tooltipOptions={{ hideLabel: true }}
                    />
                  </ChartContainer>
                  <span class="hidden text-sm font-semibold tabular-nums md:block">
                    {holding.amount}
                  </span>
                </Item>
              )}
            </For>
          }
        </ItemGroup>
      </CardContent>
    </Card>
  );
}

export default DividendIncome;
