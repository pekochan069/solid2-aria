/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(root)/cards/payout-threshold.tsx.
 * Modified for Solid Aria: Solid 2 form feedback and local Aria controls with native currency selection.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import Cancel01Icon from "@hugeicons/core-free-icons/Cancel01Icon";
import { createSignal, Show } from "solid-js";

import { Button } from "../../registry/ui/button";
import {
  Card,
  CardAction,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "../../registry/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "../../registry/ui/field";
import { Progress } from "../../registry/ui/progress";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../registry/ui/select";
import { Textarea } from "../../registry/ui/textarea";
import { HugeIcon } from "../huge-icon";

export function PayoutThreshold() {
  const [saved, setSaved] = createSignal(false);
  const [open, setOpen] = createSignal(true);

  return (
    <Show when={open()}>
      <Card>
        <CardHeader>
          <CardTitle>Payout Threshold</CardTitle>
          <CardDescription>
            Set the minimum balance required before a payout is triggered.
          </CardDescription>
          <CardAction>
            <Button
              variant="ghost"
              size="icon-sm"
              class="bg-muted"
              aria-label="Dismiss payout threshold"
              onPress={() => {
                setOpen(false);
              }}
            >
              <HugeIcon icon={Cancel01Icon} size={16} />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel for="preferred-currency">
                Preferred Currency
              </FieldLabel>
              <Select
                defaultValue="usd"
                class="w-full"
                aria-label="Preferred currency"
              >
                <SelectTrigger id="preferred-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem id="usd">USD — United States Dollar</SelectItem>
                    <SelectItem id="eur">EUR — Euro</SelectItem>
                    <SelectItem id="gbp">GBP — British Pound</SelectItem>
                    <SelectItem id="jpy">JPY — Japanese Yen</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <div class="flex items-baseline justify-between">
                <FieldLabel id="min-payout-label">
                  Minimum Payout Amount
                </FieldLabel>
                <span class="text-2xl font-semibold tabular-nums">
                  $2500.00
                </span>
              </div>
              <Progress
                aria-labelledby="min-payout-label"
                value={25}
                aria-valuetext="$2,500 of $10,000"
              />
              <div class="flex items-center justify-between">
                <FieldDescription>$50 (MIN)</FieldDescription>
                <FieldDescription>$10,000 (MAX)</FieldDescription>
              </div>
            </Field>
            <Field>
              <FieldLabel for="payout-notes">Notes</FieldLabel>
              <Textarea
                id="payout-notes"
                placeholder="Add any notes for this payout configuration..."
                class="min-h-25"
              />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter class="flex-col gap-2">
          <Button
            class="w-full"
            onPress={() => {
              setSaved(true);
            }}
          >
            Save Threshold
          </Button>
          <Show when={saved()}>
            <span role="status" class="text-muted-foreground text-xs">
              Threshold saved for this demo.
            </span>
          </Show>
        </CardFooter>
      </Card>
    </Show>
  );
}
