/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/combobox-multiple.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { For } from "solid-js";

import {
  Combobox,
  ComboboxChip,
  ComboboxChipList,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
} from "../registry/ui/combobox";

const frameworks = [
  "SolidStart",
  "SvelteKit",
  "Nuxt.js",
  "Remix",
  "Astro",
] as const;

export function ComboboxMultiple() {
  return (
    <Combobox
      aria-label="Frameworks"
      selectionMode="multiple"
      defaultValue={[frameworks[0]]}
      allowsEmptyCollection
      class="w-[250px] max-w-full"
    >
      <ComboboxChips>
        <ComboboxChipList<{ name: string }>>
          {(value) => <ComboboxChip id={value.name}>{value.name}</ComboboxChip>}
        </ComboboxChipList>
        <ComboboxChipsInput />
      </ComboboxChips>
      <ComboboxContent>
        <ComboboxList
          renderEmptyState={() => (
            <ComboboxEmpty>No items found.</ComboboxEmpty>
          )}
        >
          {
            <For each={frameworks}>
              {(item) => (
                <ComboboxItem id={item} value={{ name: item }}>
                  {item}
                </ComboboxItem>
              )}
            </For>
          }
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export default ComboboxMultiple;
