/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/*
 * Derived from Adobe React Spectrum: packages/react-stately/src/calendar/useRangeCalendarState.ts.
 * Modified for Solid Aria: adapted state, collection descriptors, imports, and APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import {
  GregorianCalendar,
  maxDate,
  minDate,
  toCalendar,
  toCalendarDate,
} from "@internationalized/date";
import type {
  CalendarDate,
  Calendar,
  CalendarIdentifier,
  DateDuration,
} from "@internationalized/date";
import type { RangeValue, ValueBase } from "@solid2-aria/types-shared";
import { createMemo, createSignal, untrack, merge, omit } from "solid-js";

import { createControlledSignal } from "../utils/create-controlled-signal";
import { getLegacyValidationState } from "../utils/legacy-props";
import { createCalendarState } from "./create-calendar-state";
import type {
  CalendarPropsBase,
  DateValue,
  MappedDateValue,
  RangeCalendarState,
} from "./types";
import {
  alignCenter,
  constrainValue,
  isInvalid,
  previousAvailableDate,
} from "./utils";

export type DateRange = RangeValue<DateValue> | null;

export interface RangeCalendarProps<T extends DateValue>
  extends
    CalendarPropsBase,
    ValueBase<RangeValue<T> | null, RangeValue<MappedDateValue<T>>> {
  /**
   * When combined with `isDateUnavailable`, determines whether non-contiguous ranges,
   * i.e. ranges containing unavailable dates, may be selected.
   */
  allowsNonContiguousRanges?: boolean;
  /**
   * Callback that is called for each date of the calendar. If it returns true, then the date is
   * unavailable. The second argument provides the current selection anchor date, if any. This can
   * be used to adjust the available dates based on the user's first selected date.
   */
  isDateUnavailable?: (
    date: DateValue,
    anchorDate: CalendarDate | null
  ) => boolean;
}

export interface RangeCalendarStateOptions<
  T extends DateValue = DateValue,
> extends RangeCalendarProps<T> {
  /** The locale to display and edit the value according to. */
  locale: string;
  /**
   * A function that creates a [Calendar](../internationalized/date/Calendar.html)
   * object for a given calendar identifier. Such a function may be imported from the
   * `@internationalized/date` package, or manually implemented to include support for
   * only certain calendars.
   */
  createCalendar: (name: CalendarIdentifier) => Calendar;
  /**
   * The amount of days that will be displayed at once. This affects how pagination works.
   *
   * @default { months: 1 }
   */
  visibleDuration?: DateDuration;
  /**
   * Determines the alignment of the visible months on initial render based on the current selection
   * or current date if there is no selection.
   *
   * @default 'center'
   */
  selectionAlignment?: "start" | "center" | "end";
}

/**
 * Provides state management for a range calendar component. A range calendar displays one or more
 * date grids and allows users to select a contiguous range of dates.
 */
export function createRangeCalendarState<T extends DateValue = DateValue>(
  props: RangeCalendarStateOptions<T>
): RangeCalendarState<T> {
  const locale = createMemo(() => props.locale);

  const visibleDuration = createMemo(
    () => props.visibleDuration ?? { months: 1 }
  );

  const minValue = createMemo(() => props.minValue);
  const maxValue = createMemo(() => props.maxValue);

  const [value, setValue] = createControlledSignal<RangeValue<T> | null>(
    () => props.value,
    untrack(() => props.defaultValue) ?? null,
    // oxlint-disable-next-line anti-slop/no-chained-type-assertions, typescript/no-unsafe-type-assertion -- SAFETY: values retain the input date class and selection shape; preserve the upstream mapped callback contract when clearing.
    (v) => props.onChange?.(v as unknown as RangeValue<MappedDateValue<T>>)
  );

  const [anchorDate, setAnchorDate] = createSignal<CalendarDate | null>(null);

  const alignment = createMemo(() => {
    const currentValue = value();
    const currentVisibleDuration = visibleDuration();
    let localAlignment: "center" | "start" = "center";

    if (
      currentValue &&
      Boolean(currentValue.start) &&
      Boolean(currentValue.end)
    ) {
      const start = alignCenter(
        toCalendarDate(currentValue.start),
        currentVisibleDuration,
        locale(),
        minValue(),
        maxValue()
      );

      const end = start.add(currentVisibleDuration).subtract({ days: 1 });

      if (currentValue.end.compare(end) > 0) {
        localAlignment = "start";
      }
    }

    return localAlignment;
  });

  const isDateUnavailable = createMemo<
    ((date: DateValue) => boolean) | undefined
  >(() => {
    const { isDateUnavailable: localIsDateUnavailable } = props;

    return localIsDateUnavailable
      ? // oxlint-disable-next-line solid/reactivity -- The returned callback runs in its consumer's scope.
        (date: DateValue) => localIsDateUnavailable(date, anchorDate())
      : undefined;
  });

  const getAvailableRange = (localAnchorDate: CalendarDate | null) => {
    const currentIsDateUnavailable = isDateUnavailable();
    const currentVisibleDuration = visibleDuration();

    if (
      localAnchorDate &&
      currentIsDateUnavailable &&
      !(props.allowsNonContiguousRanges === true)
    ) {
      const nextAvailableStartDate = nextUnavailableDate(
        localAnchorDate,
        currentIsDateUnavailable,
        currentVisibleDuration,
        -1
      );

      const nextAvailableEndDate = nextUnavailableDate(
        localAnchorDate,
        currentIsDateUnavailable,
        currentVisibleDuration,
        1
      );

      return {
        end: nextAvailableEndDate,
        start: nextAvailableStartDate,
      };
    }

    return null;
  };

  const availableRange = createMemo(() => {
    const currentAnchorDate = anchorDate();

    return getAvailableRange(currentAnchorDate);
  });

  const min = createMemo(() => maxDate(minValue(), availableRange()?.start));
  const max = createMemo(() => minDate(maxValue(), availableRange()?.end));

  const calendar = createCalendarState(
    merge(
      omit(props, "value", "defaultValue", "onChange", "isDateUnavailable"),
      {
        defaultValue: null,
        get isDateUnavailable() {
          const currentIsDateUnavailable = isDateUnavailable();

          return currentIsDateUnavailable;
        },
        get maxValue() {
          return max();
        },
        get minValue() {
          return min();
        },
        onChange: undefined,
        get selectionAlignment() {
          return props.selectionAlignment ?? alignment();
        },
        get value() {
          const currentValue = value();

          return currentValue && currentValue.start;
        },
      }
    )
  );

  const highlightedRange = createMemo(() => {
    const currentAnchorDate = anchorDate();
    const currentValue = value();

    return currentAnchorDate
      ? makeRange(currentAnchorDate, calendar.focusedDate)
      : currentValue && makeRange(currentValue.start, currentValue.end);
  });

  const selectDate = (date: CalendarDate) => {
    const currentIsDateUnavailable = isDateUnavailable();
    const currentAnchorDate = anchorDate();
    const currentValue = value();

    if (props.isReadOnly === true || props.isDisabled === true) {
      return;
    }

    const constrainedDate = constrainValue(date, min(), max());

    const previousAvailableConstrainedDate = previousAvailableDate(
      constrainedDate,
      calendar.visibleRange.start,
      currentIsDateUnavailable
    );

    if (!previousAvailableConstrainedDate) {
      return;
    }

    if (currentAnchorDate) {
      const range = makeRange(
        currentAnchorDate,
        previousAvailableConstrainedDate
      );

      if (range) {
        setValue({
          // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- SAFETY: conversion preserves the input calendar and date class, including time and time zone.
          end: convertValue(range.end, currentValue?.end) as T,
          // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- SAFETY: conversion preserves the input calendar and date class, including time and time zone.
          start: convertValue(range.start, currentValue?.start) as T,
        });
      }

      setAnchorDate(null);
    } else {
      setAnchorDate(previousAvailableConstrainedDate);
    }
  };

  const [isDragging, setDragging] = createSignal(false);

  const isInvalidSelection = createMemo(() => {
    const currentValue = value();
    const currentAnchorDate = anchorDate();
    const currentIsDateUnavailable = isDateUnavailable();

    if (!currentValue || currentAnchorDate) {
      return false;
    }

    if (
      currentIsDateUnavailable &&
      (currentIsDateUnavailable(currentValue.start) ||
        currentIsDateUnavailable(currentValue.end))
    ) {
      return true;
    }

    return (
      isInvalid(currentValue.start, minValue(), maxValue()) ||
      isInvalid(currentValue.end, minValue(), maxValue())
    );
  });

  const isValueInvalid = createMemo(
    () =>
      props.isInvalid === true ||
      getLegacyValidationState(props) === "invalid" ||
      isInvalidSelection()
  );

  const validationState = createMemo(() =>
    isValueInvalid() ? "invalid" : null
  );

  return merge(calendar, {
    get anchorDate() {
      const currentAnchorDate = anchorDate();

      return currentAnchorDate;
    },
    clearSelection() {
      setAnchorDate(null);
      setValue(null);
    },
    commitSelection() {
      selectDate(calendar.focusedDate);
    },
    focusNearestAvailableDate(localAnchorDate: CalendarDate) {
      const localAvailableRange = getAvailableRange(localAnchorDate);

      const isDateInvalid = (date: CalendarDate) =>
        this.isInvalid(date) ||
        isInvalid(date, localAvailableRange?.start, localAvailableRange?.end);

      let nextDay = localAnchorDate.add({ days: 1 });

      if (isDateInvalid(nextDay)) {
        nextDay = localAnchorDate.subtract({ days: 1 });
      }

      if (!isDateInvalid(nextDay)) {
        calendar.setFocusedDate(nextDay);
        calendar.setFocused(true);
      }
    },
    highlightDate(date: CalendarDate) {
      const currentAnchorDate = anchorDate();

      if (currentAnchorDate) {
        calendar.setFocusedDate(date);
      }
    },
    get highlightedRange() {
      const currentHighlightedRange = highlightedRange();

      return currentHighlightedRange;
    },
    get isDragging() {
      return isDragging();
    },
    isInvalid(date: CalendarDate) {
      return (
        calendar.isInvalid(date) ||
        isInvalid(date, availableRange()?.start, availableRange()?.end)
      );
    },
    isSelected(date: CalendarDate) {
      const currentHighlightedRange = highlightedRange();

      return Boolean(
        currentHighlightedRange &&
        date.compare(currentHighlightedRange.start) >= 0 &&
        date.compare(currentHighlightedRange.end) <= 0 &&
        !calendar.isCellDisabled(date) &&
        !calendar.isCellUnavailable(date)
      );
    },
    get isValueInvalid() {
      return isValueInvalid();
    },
    selectDate,
    selectFocusedDate() {
      if (!calendar.isCellUnavailable(calendar.focusedDate)) {
        selectDate(calendar.focusedDate);
      }
    },
    setAnchorDate,
    setDragging,
    setValue,
    get validationState() {
      return validationState();
    },
    get value() {
      const currentValue = value();

      return currentValue;
    },
  });
}

function makeRange(
  initialStart: DateValue,
  initialEnd: DateValue
): RangeValue<CalendarDate> | null {
  let start = initialStart;
  let end = initialEnd;

  if (end.compare(start) < 0) {
    [start, end] = [end, start];
  }

  return { end: toCalendarDate(end), start: toCalendarDate(start) };
}

function convertValue(
  initialNewValue: CalendarDate,
  oldValue?: DateValue
): DateValue {
  let newValue = initialNewValue;
  // The display calendar should not have any effect on the emitted value.
  // Emit dates in the same calendar as the original value, if any, otherwise gregorian.
  newValue = toCalendar(
    newValue,
    oldValue?.calendar ?? new GregorianCalendar()
  );

  // Preserve time if the input value had one.
  if (oldValue && "hour" in oldValue) {
    return oldValue.set(newValue);
  }

  return newValue;
}

function nextUnavailableDate(
  anchorDate: CalendarDate,
  isDateUnavailable: (date: CalendarDate) => boolean,
  visibleDuration: DateDuration,
  dir: number
): CalendarDate | undefined {
  let nextDate = anchorDate.add({ days: dir });
  const localMinDate = anchorDate.subtract(visibleDuration);
  const localMaxDate = anchorDate.add(visibleDuration);

  while (!isDateUnavailable(nextDate)) {
    if (
      dir < 0
        ? nextDate.compare(localMinDate) < 0
        : nextDate.compare(localMaxDate) > 0
    ) {
      break;
    }

    const following = nextDate.add({ days: dir });

    if (following.compare(nextDate) === 0) {
      return undefined;
    }

    nextDate = following;
  }

  if (isDateUnavailable(nextDate)) {
    return nextDate.add({ days: -dir });
  }

  return undefined;
}
