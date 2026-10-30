/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/combobox-custom.tsx.
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
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "../registry/ui/item";

const countries = [
  {
    code: "ar",
    continent: "South America",
    label: "Argentina",
    value: "argentina",
  },
  { code: "au", continent: "Oceania", label: "Australia", value: "australia" },
  { code: "br", continent: "South America", label: "Brazil", value: "brazil" },
  { code: "ca", continent: "North America", label: "Canada", value: "canada" },
  { code: "cn", continent: "Asia", label: "China", value: "china" },
  {
    code: "co",
    continent: "South America",
    label: "Colombia",
    value: "colombia",
  },
  { code: "eg", continent: "Africa", label: "Egypt", value: "egypt" },
  { code: "fr", continent: "Europe", label: "France", value: "france" },
  { code: "de", continent: "Europe", label: "Germany", value: "germany" },
  { code: "it", continent: "Europe", label: "Italy", value: "italy" },
  { code: "jp", continent: "Asia", label: "Japan", value: "japan" },
  { code: "ke", continent: "Africa", label: "Kenya", value: "kenya" },
  { code: "mx", continent: "North America", label: "Mexico", value: "mexico" },
  {
    code: "nz",
    continent: "Oceania",
    label: "New Zealand",
    value: "new-zealand",
  },
  { code: "ng", continent: "Africa", label: "Nigeria", value: "nigeria" },
  {
    code: "za",
    continent: "Africa",
    label: "South Africa",
    value: "south-africa",
  },
  { code: "kr", continent: "Asia", label: "South Korea", value: "south-korea" },
  {
    code: "gb",
    continent: "Europe",
    label: "United Kingdom",
    value: "united-kingdom",
  },
  {
    code: "us",
    continent: "North America",
    label: "United States",
    value: "united-states",
  },
];

export function ComboboxWithCustomItems() {
  return (
    <Combobox allowsEmptyCollection aria-label="Country">
      <ComboboxInput placeholder="Search countries..." />
      <ComboboxContent>
        <ComboboxList
          renderEmptyState={() => (
            <ComboboxEmpty>No countries found.</ComboboxEmpty>
          )}
        >
          {
            <For each={countries.filter((country) => country.code !== "")}>
              {(country) => (
                <ComboboxItem id={country.code} textValue={country.label}>
                  <Item size="xs" class="p-0">
                    <ItemContent>
                      <ItemTitle class="whitespace-nowrap">
                        {country.label}
                      </ItemTitle>
                      <ItemDescription>
                        {country.continent} ({country.code})
                      </ItemDescription>
                    </ItemContent>
                  </Item>
                </ComboboxItem>
              )}
            </For>
          }
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export default ComboboxWithCustomItems;
