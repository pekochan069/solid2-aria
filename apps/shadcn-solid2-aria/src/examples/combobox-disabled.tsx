/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/combobox-disabled.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { For } from "solid-js";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
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

export function ComboboxDisabled() {
  return (
    <Combobox allowsEmptyCollection aria-label="Framework">
      <ComboboxInput placeholder="Select a framework" disabled />
      <ComboboxContent>
        <ComboboxList
          renderEmptyState={() => (
            <ComboboxEmpty>No items found.</ComboboxEmpty>
          )}
        >
          {
            <For each={frameworks}>
              {(item) => <ComboboxItem id={item}>{item}</ComboboxItem>}
            </For>
          }
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export default ComboboxDisabled;
