/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview-02/cards/transfer-funds.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { XIcon } from "@lucide/solid";
import { For } from "solid-js";

import { Button } from "../../../registry/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../registry/ui/card";
import { Field, FieldGroup, FieldLabel } from "../../../registry/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "../../../registry/ui/input-group";
import { Item, ItemContent } from "../../../registry/ui/item";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../registry/ui/select";
import { Separator } from "../../../registry/ui/separator";

const FROM_ACCOUNTS = [
  { label: "Main Checking (··8402) — $12,450.00", value: "checking" },
  { label: "Business (··7731) — $8,920.00", value: "business" },
];

const TO_ACCOUNTS = [
  { label: "High Yield Savings (··1192) — $42,100.00", value: "savings" },
  { label: "Investment (··3349) — $18,200.00", value: "investment" },
];

export function TransferFunds() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transfer Funds</CardTitle>
        <CardDescription>
          Move money between your connected accounts.
        </CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon-sm" class="bg-muted">
            <XIcon />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel for="transfer-amount">Amount to Transfer</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>$</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput id="transfer-amount" defaultValue="1,200.00" />
            </InputGroup>
          </Field>
          <Field>
            <FieldLabel for="from-account">From Account</FieldLabel>
            <Select defaultValue="checking">
              <SelectTrigger id="from-account" class="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {
                    <For each={FROM_ACCOUNTS}>
                      {(item) => (
                        <SelectItem id={item.value}>{item.label}</SelectItem>
                      )}
                    </For>
                  }
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel for="to-account">To Account</FieldLabel>
            <Select defaultValue="savings">
              <SelectTrigger id="to-account" class="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {
                    <For each={TO_ACCOUNTS}>
                      {(item) => (
                        <SelectItem id={item.value}>{item.label}</SelectItem>
                      )}
                    </For>
                  }
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Item variant="muted" class="flex-col items-stretch">
            <ItemContent class="gap-3">
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground text-sm">
                  Estimated arrival
                </span>
                <span class="text-sm font-medium">Today, Apr 14</span>
              </div>
              <Separator />
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground text-sm">
                  Transaction fee
                </span>
                <span class="text-sm font-medium tabular-nums">$0.00</span>
              </div>
              <Separator />
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium">Total amount</span>
                <span class="text-sm font-semibold tabular-nums">
                  $1,200.00
                </span>
              </div>
            </ItemContent>
          </Item>
        </FieldGroup>
      </CardContent>
      <CardFooter>
        <Button class="w-full">Confirm Transfer</Button>
      </CardFooter>
    </Card>
  );
}

export default TransferFunds;
