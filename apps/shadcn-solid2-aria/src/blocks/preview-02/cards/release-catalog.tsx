/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview-02/cards/release-catalog.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { SearchIcon } from "@lucide/solid";
import { For } from "solid-js";

import { Badge } from "../../../registry/ui/badge";
import { Card, CardContent, CardHeader } from "../../../registry/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../../../registry/ui/input-group";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "../../../registry/ui/item";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "../../../registry/ui/toggle-group";

const HOLDINGS = [
  {
    added: "Jan 2021",
    name: "Vanguard S&P 500 ETF",
    shares: "112",
    ticker: "VOO",
    type: "ETF",
    value: "$48,230.40",
  },
  {
    added: "Mar 2022",
    name: "Vanguard Dividend Appreciation",
    shares: "450",
    ticker: "VIG",
    type: "ETF",
    value: "$26,033.79",
  },
  {
    added: "Nov 2020",
    name: "Apple Inc.",
    shares: "85",
    ticker: "AAPL",
    type: "Stock",
    value: "$18,488.90",
  },
  {
    added: "Jun 2023",
    name: "Realty Income Corp",
    shares: "320",
    ticker: "O",
    type: "REIT",
    value: "$15,136.59",
  },
];

export function ReleaseCatalog() {
  return (
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between gap-3">
          <InputGroup class="max-w-sm">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput placeholder="Search holdings or tickers..." />
          </InputGroup>
          <ToggleGroup
            defaultSelectedKeys={["etfs"]}
            variant="outline"
            spacing={1}
          >
            <ToggleGroupItem id="stocks">Stocks</ToggleGroupItem>
            <ToggleGroupItem id="etfs">ETFs</ToggleGroupItem>
            <ToggleGroupItem id="reits">REITs</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent>
        <ItemGroup>
          {
            <For each={HOLDINGS}>
              {(holding) => (
                <Item variant="muted">
                  <ItemMedia>
                    <div class="flex size-12 items-center justify-center rounded-lg border text-sm font-semibold">
                      {holding.ticker}
                    </div>
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{holding.name}</ItemTitle>
                    <ItemDescription class="text-xs tracking-wider uppercase">
                      {holding.shares} Shares · {holding.added}
                    </ItemDescription>
                  </ItemContent>
                  <div class="flex shrink-0 items-center gap-6">
                    <Badge variant="outline">{holding.type}</Badge>
                    <div class="flex flex-col items-end gap-0.5">
                      <span class="text-muted-foreground text-xs tracking-wider uppercase">
                        Value
                      </span>
                      <span class="font-medium tabular-nums">
                        {holding.value}
                      </span>
                    </div>
                  </div>
                </Item>
              )}
            </For>
          }
        </ItemGroup>
      </CardContent>
    </Card>
  );
}

export default ReleaseCatalog;
