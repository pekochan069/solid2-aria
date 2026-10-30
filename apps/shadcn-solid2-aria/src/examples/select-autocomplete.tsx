/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/select-autocomplete.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  Autocomplete,
  createFilter as useFilter,
} from "@solid2-aria/components";

import {
  Select,
  SelectEmpty,
  SelectGroup,
  SelectInput,
  SelectItem,
  SelectList,
  SelectPopover,
  SelectTrigger,
  SelectValue,
} from "../registry/ui/select";

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

export function SelectAutocomplete() {
  const { contains } = useFilter({ sensitivity: "base" });

  return (
    <Select
      aria-label="Country"
      placeholder="Select country"
      class="w-full max-w-48"
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <Autocomplete filter={contains}>
        <SelectPopover>
          <SelectInput />
          <SelectList
            renderEmptyState={() => <SelectEmpty>No items found.</SelectEmpty>}
          >
            <SelectGroup items={countries}>
              {(item) => <SelectItem id={item.value}>{item.label}</SelectItem>}
            </SelectGroup>
          </SelectList>
        </SelectPopover>
      </Autocomplete>
    </Select>
  );
}

export default SelectAutocomplete;
