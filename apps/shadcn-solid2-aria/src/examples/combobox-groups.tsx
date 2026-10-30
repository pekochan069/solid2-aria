/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/combobox-groups.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

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
  ComboboxSeparator,
} from "../registry/ui/combobox";

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

export function ComboboxWithGroupsAndSeparator() {
  return (
    <Combobox allowsEmptyCollection aria-label="Timezone">
      <ComboboxInput placeholder="Select a timezone" />
      <ComboboxContent>
        <ComboboxList
          renderEmptyState={() => (
            <ComboboxEmpty>No timezones found.</ComboboxEmpty>
          )}
        >
          {
            <For each={timezones}>
              {(group, index) => (
                <ComboboxGroup id={group.value}>
                  <ComboboxLabel>{group.value}</ComboboxLabel>
                  {
                    <For each={group.items}>
                      {(item) => <ComboboxItem id={item}>{item}</ComboboxItem>}
                    </For>
                  }
                  {index() < timezones.length - 1 && <ComboboxSeparator />}
                </ComboboxGroup>
              )}
            </For>
          }
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export default ComboboxWithGroupsAndSeparator;
