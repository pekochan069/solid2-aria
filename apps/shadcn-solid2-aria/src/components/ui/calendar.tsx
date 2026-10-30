/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/calendar.tsx.
 * Modified for Solid Aria: Solid boolean data selectors, Solid 2 reactive props, stable keyed picker items, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Regenerate with bun run generate:ui; local edits are replaced.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ChevronLeftIcon, ChevronRightIcon } from "@lucide/solid";
import {
  Calendar as AriaCalendar,
  CalendarGridHeader as AriaCalendarGridHeader,
  RangeCalendar as AriaRangeCalendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarHeaderCell,
  CalendarHeading,
  CalendarMonthPicker,
  CalendarYearPicker,
} from "@solid2-aria/components";
import type {
  CalendarCellRenderProps,
  CalendarProps,
  DateValue,
  RangeCalendarProps,
} from "@solid2-aria/components";
import type { JSX, ComponentProps } from "@solidjs/web";
import { cva } from "class-variance-authority";
import { cn } from "cn";
import { For, merge } from "solid-js";

import { Button, buttonVariants } from "./button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

const cellVariants = cva(
  "group/day relative mt-2 aspect-square h-full w-full cursor-default rounded-(--cell-radius) p-0 text-center select-none [&:is(:last-child>[data-[selected]=true])>div]:rounded-r-(--cell-radius)",
  {
    variants: {
      isDisabled: {
        true: "text-muted-foreground opacity-50",
      },
      isOutsideMonth: {
        true: "text-muted-foreground aria-selected:text-muted-foreground",
      },
      isSelectionEnd: {
        true: "bg-muted after:bg-muted relative isolate z-0 rounded-r-(--cell-radius) after:absolute after:inset-y-0 after:left-0 after:w-4",
      },
      isSelectionStart: {
        true: "bg-muted after:bg-muted relative isolate z-0 rounded-l-(--cell-radius) after:absolute after:inset-y-0 after:right-0 after:w-4",
      },
      isToday: {
        true: "bg-muted text-foreground rounded-(--cell-radius) data-[selected]:rounded-none",
      },
      isUnavailable: {
        true: "text-muted-foreground opacity-50 [&>div]:line-through",
      },
      showWeekNumber: {
        false:
          "[&:is(:first-child>[data-[selected]=true])>div]:rounded-l-(--cell-radius)",
        true: "[&:is(:nth-child(2)>[data-[selected]=true])>div]:rounded-l-(--cell-radius)",
      },
    },
  }
);

function Calendar<
  T extends DateValue,
  M extends "single" | "multiple" = "single",
>(
  props: Omit<CalendarProps<T, M>, "visibleDuration"> & {
    buttonVariant?: ComponentProps<typeof Button>["variant"];
    captionLayout?: "label" | "dropdown";
    numberOfMonths?: number;
    showWeekNumber?: boolean;
    headerFormat?: Intl.DateTimeFormatOptions;
    renderCell?: (
      renderProps: CalendarCellRenderProps & {
        defaultChildren: JSX.Element;
      }
    ) => JSX.Element;
  }
) {
  return (
    <AriaCalendar
      {...props}
      data-slot="calendar"
      visibleDuration={{ months: props.numberOfMonths ?? 1 }}
      class={cn(
        "group/calendar bg-background w-fit p-2 [--cell-radius:var(--radius-md)] [--cell-size:--spacing(7)] in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent",
        props.class
      )}
    >
      <CalendarInner {...props} />
    </AriaCalendar>
  );
}

function RangeCalendar<T extends DateValue>(
  props: RangeCalendarProps<T> & {
    buttonVariant?: ComponentProps<typeof Button>["variant"];
    captionLayout?: "label" | "dropdown";
    headerFormat?: Intl.DateTimeFormatOptions;
    numberOfMonths?: number;
    showWeekNumber?: boolean;
    renderCell?: (
      renderProps: CalendarCellRenderProps & {
        defaultChildren: JSX.Element;
      }
    ) => JSX.Element;
  }
) {
  return (
    <AriaRangeCalendar
      {...props}
      data-slot="calendar"
      visibleDuration={{ months: props.numberOfMonths ?? 1 }}
      class={cn(
        "group/calendar bg-background w-fit p-2 [--cell-radius:var(--radius-md)] [--cell-size:--spacing(7)] in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent",
        props.class
      )}
    >
      <CalendarInner {...props} isRange />
    </AriaRangeCalendar>
  );
}

function CalendarInner(props: {
  buttonVariant?: ComponentProps<typeof Button>["variant"];
  captionLayout?: "label" | "dropdown";
  numberOfMonths?: number;
  showWeekNumber?: boolean;
  headerFormat?: Intl.DateTimeFormatOptions;
  renderCell?: (
    renderProps: CalendarCellRenderProps & {
      defaultChildren: JSX.Element;
    }
  ) => JSX.Element;
  isRange?: boolean;
}) {
  const merged = merge(
    {
      buttonVariant: "ghost",
      captionLayout: "label",
      numberOfMonths: 1,
      showWeekNumber: false,
    } as const,
    props
  );

  return (
    <div class="relative flex flex-col gap-4 md:flex-row">
      <header class="absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1">
        <Button
          variant={merged.buttonVariant}
          slot="previous"
          class="size-(--cell-size) p-0 select-none aria-disabled:opacity-50"
        >
          <ChevronLeftIcon class="size-4 rtl:rotate-180" />
        </Button>
        <Button
          variant={merged.buttonVariant}
          slot="next"
          class="size-(--cell-size) p-0 select-none aria-disabled:opacity-50"
        >
          <ChevronRightIcon class="size-4 rtl:rotate-180" />
        </Button>
      </header>
      {Array.from({ length: merged.numberOfMonths }, (_, i) => (
        <div class="flex w-full flex-col gap-4">
          <div class="flex h-(--cell-size) w-full items-center justify-center gap-1 px-(--cell-size)">
            {merged.captionLayout === "dropdown" ? (
              <>
                <MonthDropdown format={merged.headerFormat} />
                <YearDropdown format={merged.headerFormat} />
              </>
            ) : (
              <CalendarHeading
                offset={{ months: i }}
                format={merged.headerFormat}
                class="text-sm font-medium select-none"
              />
            )}
          </div>
          <CalendarGrid class="w-full border-collapse" offset={{ months: i }}>
            <AriaCalendarGridHeader>
              {(day) => (
                <CalendarHeaderCell class="text-muted-foreground rounded-(--cell-radius) text-[0.8rem] font-normal select-none">
                  {day}
                </CalendarHeaderCell>
              )}
            </AriaCalendarGridHeader>
            <CalendarGridBody>
              {(date) => (
                <CalendarCell
                  date={date}
                  class={(renderProps) =>
                    cellVariants({
                      ...renderProps,
                      showWeekNumber: merged.showWeekNumber,
                    })
                  }
                >
                  {(renderProps) => (
                    <div
                      data-selected-single={
                        renderProps.isSelected && !(merged.isRange ?? false)
                      }
                      data-range-start={
                        renderProps.isSelectionStart && merged.isRange
                      }
                      data-range-end={
                        renderProps.isSelectionEnd && merged.isRange
                      }
                      data-range-middle={
                        renderProps.isSelected &&
                        !renderProps.isSelectionStart &&
                        !renderProps.isSelectionEnd &&
                        merged.isRange
                      }
                      class={cn(
                        buttonVariants({ size: "icon", variant: "ghost" }),
                        "group-data-[focused]/day:border-ring group-data-[focused]/day:ring-ring/50 data-[range-end]:bg-primary data-[range-end]:text-primary-foreground data-[range-middle]:bg-muted data-[range-middle]:text-foreground data-[range-start]:bg-primary data-[range-start]:text-primary-foreground data-[selected-single]:bg-primary data-[selected-single]:text-primary-foreground dark:hover:text-foreground relative isolate z-10 flex aspect-square h-full w-full min-w-(--cell-size) flex-col gap-1 border-0 leading-none font-normal group-data-[focused]/day:relative group-data-[focused]/day:z-10 group-data-[focused]/day:ring-[3px] data-[range-end]:rounded-(--cell-radius) data-[range-end]:rounded-r-(--cell-radius) data-[range-middle]:rounded-none data-[range-start]:rounded-(--cell-radius) data-[range-start]:rounded-l-(--cell-radius) [&>span]:text-xs [&>span]:opacity-70"
                      )}
                    >
                      {merged.renderCell
                        ? merged.renderCell(renderProps)
                        : renderProps.defaultChildren}
                    </div>
                  )}
                </CalendarCell>
              )}
            </CalendarGridBody>
          </CalendarGrid>
        </div>
      ))}
    </div>
  );
}

function MonthDropdown(props: { format?: Intl.DateTimeFormatOptions }) {
  return (
    <CalendarMonthPicker format={props.format?.month}>
      {(pickerProps) => (
        <Select {...pickerProps} class="relative">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent class="min-w-0">
            <SelectGroup>
              <For each={pickerProps.items} keyed={(item) => item.id}>
                {(item) => (
                  <SelectItem id={item().id}>{item().formatted}</SelectItem>
                )}
              </For>
            </SelectGroup>
          </SelectContent>
        </Select>
      )}
    </CalendarMonthPicker>
  );
}

function YearDropdown(props: { format?: Intl.DateTimeFormatOptions }) {
  return (
    <CalendarYearPicker format={props.format}>
      {(pickerProps) => (
        <Select {...pickerProps} class="relative">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent class="min-w-0">
            <For each={pickerProps.items} keyed={(item) => item.id}>
              {(item) => (
                <SelectItem id={item().id}>{item().formatted}</SelectItem>
              )}
            </For>
          </SelectContent>
        </Select>
      )}
    </CalendarYearPicker>
  );
}

export { Calendar, RangeCalendar };
