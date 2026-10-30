/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview-02/cards/recent-transactions.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  MoreHorizontalIcon,
  TvIcon,
  CarIcon,
  WalletIcon,
  ShoppingCartIcon,
  CoffeeIcon,
} from "@lucide/solid";

import { Button } from "../../../registry/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../registry/ui/card";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../registry/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../registry/ui/table";

export function RecentTransactions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your latest account activity.</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableHead />
            <TableHead isRowHeader>Merchant</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead />
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell class="w-10">
                <div class="bg-muted flex size-10 items-center justify-center rounded-lg">
                  <CoffeeIcon class="size-4 shrink-0" />
                </div>
              </TableCell>
              <TableCell>
                <div class="flex flex-col">
                  <span class="font-medium">Blue Bottle Coffee</span>
                  <span class="text-muted-foreground text-sm">
                    Food & Drink
                  </span>
                </div>
              </TableCell>
              <TableCell class="text-muted-foreground text-sm">
                Today, 10:24 AM
              </TableCell>
              <TableCell class="text-right">
                <span class="text-sm font-semibold tabular-nums">-$6.50</span>
              </TableCell>
              <TableCell class="w-8">
                <DropdownMenuTrigger>
                  <Button variant="ghost" size="icon-sm">
                    <MoreHorizontalIcon />
                  </Button>
                  <DropdownMenu placement="bottom end">
                    <DropdownMenuItem>View details</DropdownMenuItem>
                    <DropdownMenuItem>Add note</DropdownMenuItem>
                    <DropdownMenuItem>Categorize</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Dispute</DropdownMenuItem>
                  </DropdownMenu>
                </DropdownMenuTrigger>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell class="w-10">
                <div class="bg-muted flex size-10 items-center justify-center rounded-lg">
                  <ShoppingCartIcon class="size-4 shrink-0" />
                </div>
              </TableCell>
              <TableCell>
                <div class="flex flex-col">
                  <span class="font-medium">Whole Foods Market</span>
                  <span class="text-muted-foreground text-sm">Groceries</span>
                </div>
              </TableCell>
              <TableCell class="text-muted-foreground text-sm">
                Yesterday
              </TableCell>
              <TableCell class="text-right">
                <span class="text-sm font-semibold tabular-nums">-$142.30</span>
              </TableCell>
              <TableCell class="w-8">
                <DropdownMenuTrigger>
                  <Button variant="ghost" size="icon-sm">
                    <MoreHorizontalIcon />
                  </Button>
                  <DropdownMenu placement="bottom end">
                    <DropdownMenuItem>View details</DropdownMenuItem>
                    <DropdownMenuItem>Add note</DropdownMenuItem>
                    <DropdownMenuItem>Categorize</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Dispute</DropdownMenuItem>
                  </DropdownMenu>
                </DropdownMenuTrigger>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell class="w-10">
                <div class="bg-muted flex size-10 items-center justify-center rounded-lg">
                  <WalletIcon class="size-4 shrink-0" />
                </div>
              </TableCell>
              <TableCell>
                <div class="flex flex-col">
                  <span class="font-medium">Stripe Payout</span>
                  <span class="text-muted-foreground text-sm">Income</span>
                </div>
              </TableCell>
              <TableCell class="text-muted-foreground text-sm">
                Oct 12
              </TableCell>
              <TableCell class="text-right">
                <span class="text-sm font-semibold text-emerald-500 tabular-nums">
                  +$4,200.00
                </span>
              </TableCell>
              <TableCell class="w-8">
                <DropdownMenuTrigger>
                  <Button variant="ghost" size="icon-sm">
                    <MoreHorizontalIcon />
                  </Button>
                  <DropdownMenu placement="bottom end">
                    <DropdownMenuItem>View details</DropdownMenuItem>
                    <DropdownMenuItem>Add note</DropdownMenuItem>
                    <DropdownMenuItem>Categorize</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Dispute</DropdownMenuItem>
                  </DropdownMenu>
                </DropdownMenuTrigger>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell class="w-10">
                <div class="bg-muted flex size-10 items-center justify-center rounded-lg">
                  <CarIcon class="size-4 shrink-0" />
                </div>
              </TableCell>
              <TableCell>
                <div class="flex flex-col">
                  <span class="font-medium">Uber Technologies</span>
                  <span class="text-muted-foreground text-sm">Transport</span>
                </div>
              </TableCell>
              <TableCell class="text-muted-foreground text-sm">
                Oct 11
              </TableCell>
              <TableCell class="text-right">
                <span class="text-sm font-semibold tabular-nums">-$24.10</span>
              </TableCell>
              <TableCell class="w-8">
                <DropdownMenuTrigger>
                  <Button variant="ghost" size="icon-sm">
                    <MoreHorizontalIcon />
                  </Button>
                  <DropdownMenu placement="bottom end">
                    <DropdownMenuItem>View details</DropdownMenuItem>
                    <DropdownMenuItem>Add note</DropdownMenuItem>
                    <DropdownMenuItem>Categorize</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Dispute</DropdownMenuItem>
                  </DropdownMenu>
                </DropdownMenuTrigger>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell class="w-10">
                <div class="bg-muted flex size-10 items-center justify-center rounded-lg">
                  <TvIcon class="size-4 shrink-0" />
                </div>
              </TableCell>
              <TableCell>
                <div class="flex flex-col">
                  <span class="font-medium">Netflix Subscription</span>
                  <span class="text-muted-foreground text-sm">
                    Entertainment
                  </span>
                </div>
              </TableCell>
              <TableCell class="text-muted-foreground text-sm">
                Oct 10
              </TableCell>
              <TableCell class="text-right">
                <span class="text-sm font-semibold tabular-nums">-$19.99</span>
              </TableCell>
              <TableCell class="w-8">
                <DropdownMenuTrigger>
                  <Button variant="ghost" size="icon-sm">
                    <MoreHorizontalIcon />
                  </Button>
                  <DropdownMenu placement="bottom end">
                    <DropdownMenuItem>View details</DropdownMenuItem>
                    <DropdownMenuItem>Add note</DropdownMenuItem>
                    <DropdownMenuItem>Categorize</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Dispute</DropdownMenuItem>
                  </DropdownMenu>
                </DropdownMenuTrigger>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default RecentTransactions;
