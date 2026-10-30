/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(styles)/sera/media-library-table/components/filter-library.tsx.
 * Modified for Solid Aria: native Solid 2 state, internationalized date ranges, and Aria combobox, calendar, radio, checkbox, and slider controls.
 * Licensed under MIT. See ../../../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { today, getLocalTimeZone } from "@internationalized/date";
import { CalendarIcon } from "@lucide/solid";
import type { Key } from "@solid2-aria/components";
import { createSignal, For } from "solid-js";

import { Button } from "../../../../../registry/ui/button";
import { RangeCalendar } from "../../../../../registry/ui/calendar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../../../registry/ui/card";
import { Checkbox } from "../../../../../registry/ui/checkbox";
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
  useComboboxAnchor,
} from "../../../../../registry/ui/combobox";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "../../../../../registry/ui/field";
import { PopoverTrigger, Popover } from "../../../../../registry/ui/popover";
import {
  RadioGroup,
  RadioGroupItem,
} from "../../../../../registry/ui/radio-group";
import { Slider } from "../../../../../registry/ui/slider";

const FILE_TYPES = [
  {
    defaultChecked: true,
    id: "images",
    label: "Images (JPEG, PNG, WEBP)",
  },
  {
    defaultChecked: false,
    id: "video",
    label: "Video (MP4, MOV)",
  },
  {
    defaultChecked: false,
    id: "documents",
    label: "Documents (PDF)",
  },
  {
    defaultChecked: false,
    id: "audio",
    label: "Audio (MP3, WAV)",
  },
];

const DATE_OPTIONS = [
  { label: "Any time", value: "any" },
  { label: "Past 24 hours", value: "24h" },
  { label: "Past week", value: "week" },
  { label: "Past month", value: "month" },
];

const TAGS = [
  "architecture",
  "brutalism",
  "ceramics",
  "design-week",
  "editorial",
  "exterior",
  "film",
  "food",
  "furniture",
  "interior",
  "kyoto",
  "minimalism",
  "print",
  "sustainability",
  "summer-issue",
  "video",
] as const;

const TAG_OPTIONS = TAGS.map((name) => ({ id: name, name }));

const format = (dateValue: ReturnType<typeof today>) =>
  new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(dateValue.toDate("UTC"));

export function FilterLibrary() {
  const [tagAnchor, setTagAnchor] = useComboboxAnchor();

  const [selectedTags, setSelectedTags] = createSignal<readonly Key[]>([
    "architecture",
    "brutalism",
  ]);

  const [tagQuery, setTagQuery] = createSignal("");
  const date = today(getLocalTimeZone());

  const [range, setRange] = createSignal({
    end: date.set({ day: 22 }),
    start: date.set({ day: 1 }),
  });

  return (
    <Card>
      <CardHeader class="border-b">
        <CardTitle>Filter Library</CardTitle>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>File Type</FieldLegend>
            <Field>
              <For each={FILE_TYPES}>
                {(type) => (
                  <Field orientation="horizontal">
                    <Checkbox
                      id={type.id}
                      defaultSelected={type.defaultChecked}
                    />
                    <FieldLabel for={type.id}>{type.label}</FieldLabel>
                  </Field>
                )}
              </For>
            </Field>
          </FieldSet>
          <FieldSet>
            <FieldLegend>Date Uploaded</FieldLegend>
            <RadioGroup defaultValue="any">
              <For each={DATE_OPTIONS}>
                {(option) => (
                  <Field orientation="horizontal">
                    <RadioGroupItem
                      value={option.value}
                      id={`date-${option.value}`}
                    />
                    <FieldLabel for={`date-${option.value}`}>
                      {option.label}
                    </FieldLabel>
                  </Field>
                )}
              </For>
            </RadioGroup>
          </FieldSet>
          <Field>
            <FieldLabel for="custom-range">Custom Range</FieldLabel>
            <PopoverTrigger>
              <Button variant="outline" id="custom-range" class="w-full">
                <CalendarIcon data-icon="inline-start" />
                {format(range().start)} – {format(range().end)}
              </Button>
              <Popover class="w-auto p-0" placement="bottom end">
                <RangeCalendar
                  value={range()}
                  onChange={(value) => {
                    setRange(value);
                  }}
                  numberOfMonths={2}
                />
              </Popover>
            </PopoverTrigger>
          </Field>
          <FieldSet>
            <FieldLegend>File Size</FieldLegend>
            <div class="flex flex-col gap-3">
              <div class="text-muted-foreground flex items-center justify-between text-xs font-medium tracking-wider uppercase">
                <span>0 MB</span>
                <span>500+ MB</span>
              </div>
              <Slider
                aria-label="File size"
                defaultValue={[0, 60]}
                maxValue={100}
                step={1}
              />
              <div class="flex items-center justify-between text-xs font-medium">
                <span>Min: 0 MB</span>
                <span>Max: 300 MB</span>
              </div>
            </div>
          </FieldSet>
          <FieldSet>
            <FieldLegend>Tags</FieldLegend>
            <Field>
              <Combobox
                aria-label="Filter by tag"
                defaultItems={TAG_OPTIONS}
                selectionMode="multiple"
                value={selectedTags()}
                onChange={(tags) => {
                  const current = selectedTags();

                  if (
                    tags.length === current.length &&
                    tags.every((tag, index) => tag === current[index])
                  ) {
                    return;
                  }

                  setSelectedTags(tags);
                  setTagQuery("");
                }}
                inputValue={tagQuery()}
                onInputChange={(value) => {
                  setTagQuery(value);
                }}
                allowsEmptyCollection
              >
                <ComboboxChips
                  ref={(element) => {
                    setTagAnchor(element);
                  }}
                >
                  <ComboboxChipList<{ name: string }>>
                    {(value) => (
                      <ComboboxChip id={value.name}>{value.name}</ComboboxChip>
                    )}
                  </ComboboxChipList>
                  <ComboboxChipsInput placeholder="Filter by tag..." />
                </ComboboxChips>
                <ComboboxContent anchor={tagAnchor}>
                  <ComboboxList<(typeof TAG_OPTIONS)[number]>
                    renderEmptyState={() => (
                      <ComboboxEmpty>No tags found.</ComboboxEmpty>
                    )}
                  >
                    {(tag) => (
                      <ComboboxItem id={tag.id} value={tag}>
                        {tag.name}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </Field>
          </FieldSet>
        </FieldGroup>
      </CardContent>
      <CardFooter class="flex flex-col gap-2 border-t">
        <Button class="w-full">Apply Filters</Button>
        <Button variant="ghost" class="w-full">
          Reset
        </Button>
      </CardFooter>
    </Card>
  );
}
