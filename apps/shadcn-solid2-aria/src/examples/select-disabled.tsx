/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/select-disabled.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { For } from "solid-js";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../registry/ui/select";

export function SelectDisabled() {
  const items = [
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
    { label: "Blueberry", value: "blueberry" },
    { disabled: true, label: "Grapes", value: "grapes" },
    { label: "Pineapple", value: "pineapple" },
  ];

  return (
    <Select
      aria-label="Fruit"
      isDisabled
      placeholder="Select a fruit"
      class="w-full max-w-48"
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {
            <For each={items}>
              {(item) => (
                <SelectItem id={item.value} isDisabled={item.disabled}>
                  {item.label}
                </SelectItem>
              )}
            </For>
          }
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export default SelectDisabled;
