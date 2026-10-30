/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview-02/cards/payments.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  ChevronRightIcon,
  RefreshCwIcon,
  RepeatIcon,
  CalendarIcon,
  GaugeIcon,
  MoreHorizontalIcon,
} from "@lucide/solid";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "../../../registry/ui/breadcrumb";
import { Button } from "../../../registry/ui/button";
import { Card, CardContent, CardHeader } from "../../../registry/ui/card";
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../registry/ui/dropdown-menu";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "../../../registry/ui/item";

export function Payments() {
  return (
    <Card>
      <CardHeader class="flex flex-col gap-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <DropdownMenuTrigger>
                <Button size="icon-sm" variant="ghost">
                  <MoreHorizontalIcon />
                  <span class="sr-only">Account options</span>
                </Button>
                <DropdownMenu placement="bottom start">
                  <DropdownMenuGroup>
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Statements</DropdownMenuItem>
                    <DropdownMenuItem>Documents</DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenu>
              </DropdownMenuTrigger>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbPage>Payments</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </CardHeader>
      <CardContent>
        <ItemGroup>
          <Item variant="muted" href="#">
            <ItemMedia variant="icon">
              <GaugeIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Change transfer limit</ItemTitle>
              <ItemDescription>
                Adjust how much you can send from your balance.
              </ItemDescription>
            </ItemContent>
            <ChevronRightIcon class="text-muted-foreground size-4 shrink-0" />
          </Item>
          <Item variant="muted" href="#">
            <ItemMedia variant="icon">
              <CalendarIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Scheduled transfers</ItemTitle>
              <ItemDescription>
                Set up a transfer to send at a later date.
              </ItemDescription>
            </ItemContent>
            <ChevronRightIcon class="text-muted-foreground size-4 shrink-0" />
          </Item>
          <Item variant="muted" href="#">
            <ItemMedia variant="icon">
              <RepeatIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Direct Debits</ItemTitle>
              <ItemDescription>
                Set up and manage regular payments.
              </ItemDescription>
            </ItemContent>
            <ChevronRightIcon class="text-muted-foreground size-4 shrink-0" />
          </Item>
          <Item variant="muted" href="#">
            <ItemMedia variant="icon">
              <RefreshCwIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Recurring card payments</ItemTitle>
              <ItemDescription>
                Manage your repeated card transactions.
              </ItemDescription>
            </ItemContent>
            <ChevronRightIcon class="text-muted-foreground size-4 shrink-0" />
          </Item>
        </ItemGroup>
      </CardContent>
    </Card>
  );
}

export default Payments;
