/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(root)/cards/dividend-income.tsx.
 * Modified for Solid Aria: Solid 2 JSX, local Solid2 Aria components, native attributes, and upstream Hugeicons SVGs.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import Cancel01Icon from "@hugeicons/core-free-icons/Cancel01Icon";
import { For } from "solid-js";

import { Button } from "../../registry/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../registry/ui/card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "../../registry/ui/item";
import { HugeIcon } from "../huge-icon";

const HOLDINGS = [
  {
    amount: "$1,842.10",
    data: [
      { q: "Q1", value: 380 },
      { q: "Q2", value: 420 },
      { q: "Q3", value: 390 },
      { q: "Q4", value: 652 },
    ],
    name: "Vanguard",
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

export function DividendIncome() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Q2 Dividend Income</CardTitle>
        <CardDescription>
          Quarterly dividend payouts across your portfolio holdings.
        </CardDescription>
        <CardAction>
          <Button
            variant="ghost"
            size="icon-sm"
            class="bg-muted"
            aria-label="Dismiss dividend income"
          >
            <HugeIcon icon={Cancel01Icon} stroke-width={2} />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ItemGroup>
          <For each={HOLDINGS}>
            {(holding) => (
              <Item role="listitem" variant="muted">
                <ItemContent>
                  <ItemTitle>{holding.name}</ItemTitle>
                  <ItemDescription>{holding.shares}</ItemDescription>
                </ItemContent>
                <div
                  class="hidden h-8 w-24 items-end gap-1 md:flex"
                  role="img"
                  aria-label={`${holding.name} quarterly dividends`}
                >
                  <For each={holding.data}>
                    {(item) => (
                      <div
                        class="bg-chart-2 min-h-1 flex-1 rounded-t-sm"
                        style={{
                          height: `${(item.value / Math.max(...holding.data.map((point) => point.value))) * 100}%`,
                        }}
                      />
                    )}
                  </For>
                </div>
              </Item>
            )}
          </For>
        </ItemGroup>
      </CardContent>
    </Card>
  );
}
