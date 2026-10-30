/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/button-group-select.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ArrowRightIcon } from "@lucide/solid";
import { createSignal, For } from "solid-js";

import { Button } from "../registry/ui/button";
import { ButtonGroup } from "../registry/ui/button-group";
import { Input } from "../registry/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "../registry/ui/select";

const CURRENCIES = [
  { label: "US Dollar", value: "$" },
  { label: "Euro", value: "€" },
  { label: "British Pound", value: "£" },
];

export default function ButtonGroupSelect() {
  const [currency, setCurrency] = createSignal("$");

  return (
    <ButtonGroup>
      <ButtonGroup>
        <Select
          value={currency()}
          onChange={(value) => {
            setCurrency(String(value ?? ""));
          }}
        >
          <SelectTrigger class="font-mono">{currency()}</SelectTrigger>
          <SelectContent placement="bottom start">
            <SelectGroup>
              {
                <For each={CURRENCIES}>
                  {(item) => (
                    <SelectItem id={item.value}>
                      {item.value}{" "}
                      <span class="text-muted-foreground">{item.label}</span>
                    </SelectItem>
                  )}
                </For>
              }
            </SelectGroup>
          </SelectContent>
        </Select>
        <Input placeholder="10.00" pattern="[0-9]*" />
      </ButtonGroup>
      <ButtonGroup>
        <Button aria-label="Send" size="icon" variant="outline">
          <ArrowRightIcon />
        </Button>
      </ButtonGroup>
    </ButtonGroup>
  );
}
