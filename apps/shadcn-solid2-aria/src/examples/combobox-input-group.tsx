/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/combobox-input-group.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { GlobeIcon } from "@lucide/solid";
import { For } from "solid-js";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
} from "../registry/ui/combobox";
import { InputGroupAddon } from "../registry/ui/input-group";

const timezones = [
  {
    items: [
      "(GMT-5) New York",
      "(GMT-8) Los Angeles",
      "(GMT-6) Chicago",
      "(GMT-5) Toronto",
      "(GMT-8) Vancouver",
      "(GMT-3) São Paulo",
    ],
    value: "Americas",
  },
  {
    items: [
      "(GMT+0) London",
      "(GMT+1) Paris",
      "(GMT+1) Berlin",
      "(GMT+1) Rome",
      "(GMT+1) Madrid",
      "(GMT+1) Amsterdam",
    ],
    value: "Europe",
  },
  {
    items: [
      "(GMT+9) Tokyo",
      "(GMT+8) Shanghai",
      "(GMT+8) Singapore",
      "(GMT+4) Dubai",
      "(GMT+11) Sydney",
      "(GMT+9) Seoul",
    ],
    value: "Asia/Pacific",
  },
] as const;

export function ComboxboxInputGroup() {
  return (
    <Combobox allowsEmptyCollection aria-label="Timezone">
      <ComboboxInput placeholder="Select a timezone">
        <InputGroupAddon>
          <GlobeIcon />
        </InputGroupAddon>
      </ComboboxInput>
      <ComboboxContent crossOffset={-28} class="w-60">
        <ComboboxList
          items={timezones}
          renderEmptyState={() => (
            <ComboboxEmpty>No timezones found.</ComboboxEmpty>
          )}
        >
          {(group) => (
            <ComboboxGroup id={group.value}>
              <ComboboxLabel>{group.value}</ComboboxLabel>
              {
                <For each={group.items}>
                  {(item) => <ComboboxItem id={item}>{item}</ComboboxItem>}
                </For>
              }
            </ComboboxGroup>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export default ComboxboxInputGroup;
