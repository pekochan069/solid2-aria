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
 * Derived from Adobe React Spectrum: packages/react-stately/src/calendar/useCalendarState.ts.
 * Modified for Solid Aria: adapted state, collection descriptors, imports, and APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import {
  CalendarDate,
  DateFormatter,
  endOfMonth,
  endOfWeek,
  getDayOfWeek,
  getWeeksInMonth,
  GregorianCalendar,
  isEqualCalendar,
  isSameDay,
  minDate,
  startOfMonth,
  startOfWeek,
  toCalendar,
  toCalendarDate,
  today,
} from "@internationalized/date";
import type {
  Calendar,
  CalendarIdentifier,
  DateDuration,
} from "@internationalized/date";
import type { ValueBase } from "@solid2-aria/types-shared";
import {
  createMemo,
  createSignal,
  createRenderEffect,
  untrack,
} from "solid-js";

import { createControlledSignal } from "../utils/create-controlled-signal";
import { getLegacyValidationState } from "../utils/legacy-props";
import { parseCalendarIdentifier } from "../utils/parse-calendar-identifier";
import type {
  CalendarPropsBase,
  CalendarSelectionMode,
  CalendarState,
  CalendarValueType,
  DateValue,
  MappedDateValue,
} from "./types";
import {
  alignCenter,
  alignEnd,
  alignStart,
  constrainStart,
  constrainValue,
  isEqualDuration,
  isInvalid,
  previousAvailableDate,
} from "./utils";

export interface CalendarProps<
  T extends DateValue,
  M extends CalendarSelectionMode = "single",
>
  extends
    CalendarPropsBase,
    ValueBase<
      CalendarValueType<T | null, M>,
      CalendarValueType<MappedDateValue<T>, M>
    > {
  /**
   * Whether single or multiple selection is enabled.
   *
   * @default 'single'
   */
  selectionMode?: M;
  /**
   * Callback that is called for each date of the calendar. If it returns true, then the date is
   * unavailable.
   */
  isDateUnavailable?: (date: DateValue) => boolean;
}

export interface CalendarStateOptions<
  T extends DateValue = DateValue,
  M extends CalendarSelectionMode = "single",
> extends CalendarProps<T, M> {
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
 * Provides state management for a calendar component.
 * A calendar displays one or more date grids and allows users to select a single date.
 */
export function createCalendarState<
  T extends DateValue = DateValue,
  M extends CalendarSelectionMode = "single",
>(props: CalendarStateOptions<T, M>): CalendarState<M> {
  const defaultFormatter = createMemo(() => new DateFormatter(props.locale));

  const resolvedOptions = createMemo(() =>
    defaultFormatter().resolvedOptions()
  );

  const locale = createMemo(() => props.locale);
  const createCalendar = createMemo(() => props.createCalendar);

  const visibleDuration = createMemo(
    () => props.visibleDuration ?? { months: 1 }
  );

  const minValue = createMemo(() => props.minValue);
  const maxValue = createMemo(() => props.maxValue);

  const selectionAlignment = createMemo(
    () => props.selectionAlignment ?? "center"
  );

  const isDateUnavailable = createMemo(() => props.isDateUnavailable);
  const pageBehavior = createMemo(() => props.pageBehavior ?? "visible");

  const selectionMode = createMemo(
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- SAFETY: the default mode is single; explicit modes retain their M parameter.
    () => props.selectionMode ?? ("single" as M)
  );

  const firstDayOfWeek = createMemo(() => props.firstDayOfWeek);
  const weeksInMonth = createMemo(() => props.weeksInMonth);

  const calendar = createMemo(() =>
    createCalendar()(parseCalendarIdentifier(resolvedOptions().calendar))
  );

  const [value, setControlledValue] = createControlledSignal<T | T[] | null>(
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- SAFETY: selectionMode determines whether these typed props hold one date or an array; the array is never mutated.
    () => props.value as T | T[] | null | undefined,
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- SAFETY: selectionMode determines whether these typed props hold one date or an array; the array is never mutated.
    untrack(() => props.defaultValue as T | T[] | null) ?? null,
    (v) =>
      // oxlint-disable-next-line anti-slop/no-chained-type-assertions, typescript/no-unsafe-type-assertion -- SAFETY: values retain the input date class and selection shape; preserve the upstream mapped callback contract when clearing.
      props.onChange?.(v as unknown as CalendarValueType<MappedDateValue<T>, M>)
  );

  const calendarDateValue = createMemo(() => {
    const currentValue = value();

    if (Array.isArray(currentValue)) {
      return currentValue.map((localValue) =>
        toCalendar(toCalendarDate(localValue), calendar())
      );
    }

    return currentValue
      ? toCalendar(toCalendarDate(currentValue), calendar())
      : null;
  });

  const timeZone = createMemo(() => {
    const currentValue = value();
    const val = Array.isArray(currentValue) ? currentValue[0] : currentValue;

    return val && "timeZone" in val ? val.timeZone : resolvedOptions().timeZone;
  });

  const focusedCalendarDate = createMemo(() =>
    props.focusedValue
      ? constrainValue(
          toCalendar(toCalendarDate(props.focusedValue), calendar()),
          minValue(),
          maxValue()
        )
      : undefined
  );

  const defaultFocusedCalendarDate = createMemo(() => {
    const currentCalendarDateValue = calendarDateValue();

    if (props.defaultFocusedValue) {
      return constrainValue(
        toCalendar(toCalendarDate(props.defaultFocusedValue), calendar()),
        minValue(),
        maxValue()
      );
    }

    if (
      currentCalendarDateValue &&
      (!Array.isArray(currentCalendarDateValue) ||
        currentCalendarDateValue.length > 0)
    ) {
      return constrainValue(
        (Array.isArray(currentCalendarDateValue)
          ? currentCalendarDateValue[0]
          : currentCalendarDateValue) ??
          toCalendar(today(timeZone()), calendar()),
        minValue(),
        maxValue()
      );
    }

    return constrainValue(
      toCalendar(today(timeZone()), calendar()),
      minValue(),
      maxValue()
    );
  });

  const [focusedDate, setFocusedDate] = createControlledSignal(
    focusedCalendarDate,
    untrack(defaultFocusedCalendarDate),
    (v) => props.onFocusChange?.(v)
  );

  const getStartDate = () => {
    const alignment = selectionAlignment();
    let align = alignCenter;

    if (alignment === "start") {
      align = alignStart;
    }

    if (alignment === "end") {
      align = alignEnd;
    }

    return align(
      focusedDate(),
      visibleDuration(),
      locale(),
      minValue(),
      maxValue()
    );
  };

  const [startDate, setStartDate] = createSignal(untrack(getStartDate));

  const [isFocused, setFocused] = createSignal(
    untrack(() => props.autoFocus === true)
  );

  const endDate = createMemo(() => {
    const currentVisibleDuration = visibleDuration();
    const duration = { ...currentVisibleDuration };

    if (
      duration.days !== undefined &&
      duration.days !== 0 &&
      !Number.isNaN(duration.days)
    ) {
      duration.days -= 1;
    } else {
      duration.days = -1;
    }

    return startDate().add(duration);
  });

  let lastVisibleDuration = untrack(visibleDuration);
  let lastCalendar = untrack(calendar);
  createRenderEffect(
    () => {
      const duration = visibleDuration();
      const currentCalendar = calendar();
      const originalFocus = focusedDate();

      const focus = constrainValue(
        toCalendar(originalFocus, currentCalendar),
        minValue(),
        maxValue()
      );

      let start = startDate();

      if (!isEqualDuration(duration, lastVisibleDuration)) {
        start = getStartDate();
      }

      if (!isEqualCalendar(currentCalendar, lastCalendar)) {
        start = alignCenter(focus, duration, locale(), minValue(), maxValue());
      }

      const end = start.add({ ...duration, days: (duration.days ?? 0) - 1 });

      if (focus.compare(start) < 0) {
        start = alignEnd(focus, duration, locale(), minValue(), maxValue());
      } else if (focus.compare(end) > 0) {
        start = alignStart(focus, duration, locale(), minValue(), maxValue());
      }

      return {
        currentCalendar,
        duration,
        focus,
        start,
        updateFocus:
          !isSameDay(focus, originalFocus) ||
          !isEqualCalendar(focus.calendar, originalFocus.calendar),
        updateStart:
          !isSameDay(start, startDate()) ||
          !isEqualCalendar(start.calendar, startDate().calendar),
      };
    },
    (next) => {
      lastVisibleDuration = next.duration;
      lastCalendar = next.currentCalendar;

      if (next.updateFocus) {
        setFocusedDate(next.focus);
      }

      if (next.updateStart) {
        setStartDate(next.start);
      }
    }
  );

  // Sets focus to a specific cell date
  function focusCell(initialDate: CalendarDate) {
    let date = initialDate;
    date = constrainValue(date, minValue(), maxValue());
    setFocusedDate(date);
  }

  function normalizeValue(newValue: CalendarDate) {
    const currentIsDateUnavailable = isDateUnavailable();
    const currentValue = value();
    const constrained = constrainValue(newValue, minValue(), maxValue());
    const lowerBound = minValue() ?? minDate(constrained, startDate());

    const prev = previousAvailableDate(
      constrained,
      lowerBound,
      currentIsDateUnavailable
    );

    if (!prev) {
      return null;
    }

    // The display calendar should not have any effect on the emitted value.
    // Emit dates in the same calendar as the original value, if any, otherwise gregorian.
    const baseValue = Array.isArray(currentValue)
      ? currentValue[0]
      : currentValue;

    const calendarValue = toCalendar(
      prev,
      baseValue?.calendar ?? new GregorianCalendar()
    );

    // Preserve time if the input value had one.
    if (baseValue && "hour" in baseValue) {
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- SAFETY: conversion preserves the input calendar and date class, including time and time zone.
      return baseValue.set(calendarValue) as T;
    }

    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- SAFETY: conversion preserves the input calendar and date class, including time and time zone.
    return calendarValue as T;
  }

  function setValue(
    newValue: CalendarDate | readonly (CalendarDate | null)[] | null
  ) {
    if (!(props.isDisabled === true) && !(props.isReadOnly === true)) {
      if (newValue === null) {
        setControlledValue(selectionMode() === "multiple" ? [] : null);

        return;
      }

      if (newValue instanceof CalendarDate) {
        const localValue = normalizeValue(newValue);

        if (localValue) {
          setControlledValue(localValue);
        }
      } else {
        setControlledValue(
          newValue
            .filter((date): date is CalendarDate => date !== null)
            .map(normalizeValue)
            .filter((date): date is T => date !== null)
        );
      }
    }
  }

  const isUnavailable = createMemo(() => {
    const currentCalendarDateValue = calendarDateValue();
    const currentIsDateUnavailable = isDateUnavailable();

    if (!currentCalendarDateValue) {
      return false;
    }

    if (Array.isArray(currentCalendarDateValue)) {
      return currentCalendarDateValue.some((date) => {
        const localCurrentIsDateUnavailable = isDateUnavailable();

        return (
          localCurrentIsDateUnavailable?.(date) === true ||
          isInvalid(date, minValue(), maxValue())
        );
      });
    }

    return (
      currentIsDateUnavailable?.(currentCalendarDateValue) === true ||
      isInvalid(currentCalendarDateValue, minValue(), maxValue())
    );
  });

  const isValueInvalid = createMemo(
    () =>
      props.isInvalid === true ||
      getLegacyValidationState(props) === "invalid" ||
      isUnavailable()
  );

  const validationState = createMemo(() =>
    isValueInvalid() ? "invalid" : null
  );

  const pageDuration = createMemo(() => {
    const currentVisibleDuration = visibleDuration();

    if (pageBehavior() === "visible") {
      return currentVisibleDuration;
    }

    return unitDuration(currentVisibleDuration);
  });

  return {
    focusNextDay() {
      const currentFocusedDate = focusedDate();
      focusCell(currentFocusedDate.add({ days: 1 }));
    },
    focusNextPage() {
      const currentFocusedDate = focusedDate();
      const start = startDate().add(pageDuration());
      setFocusedDate(
        constrainValue(
          currentFocusedDate.add(pageDuration()),
          minValue(),
          maxValue()
        )
      );
      setStartDate(
        alignStart(
          constrainStart(
            currentFocusedDate,
            start,
            pageDuration(),
            locale(),
            minValue(),
            maxValue()
          ),
          pageDuration(),
          locale()
        )
      );
    },
    focusNextRow() {
      const currentVisibleDuration = visibleDuration();
      const currentFocusedDate = focusedDate();

      if (
        currentVisibleDuration.days !== undefined &&
        currentVisibleDuration.days !== 0 &&
        !Number.isNaN(currentVisibleDuration.days)
      ) {
        this.focusNextPage();
      } else if (
        (currentVisibleDuration.weeks !== undefined &&
          currentVisibleDuration.weeks !== 0 &&
          !Number.isNaN(currentVisibleDuration.weeks)) ||
        (currentVisibleDuration.months !== undefined &&
          currentVisibleDuration.months !== 0 &&
          !Number.isNaN(currentVisibleDuration.months)) ||
        (currentVisibleDuration.years !== undefined &&
          currentVisibleDuration.years !== 0 &&
          !Number.isNaN(currentVisibleDuration.years))
      ) {
        focusCell(currentFocusedDate.add({ weeks: 1 }));
      }
    },
    focusNextSection(larger) {
      const currentVisibleDuration = visibleDuration();
      const currentFocusedDate = focusedDate();

      if (
        !(larger === true) &&
        (currentVisibleDuration.days === undefined ||
          currentVisibleDuration.days === 0 ||
          Number.isNaN(currentVisibleDuration.days))
      ) {
        focusCell(currentFocusedDate.add(unitDuration(currentVisibleDuration)));

        return;
      }

      if (
        currentVisibleDuration.days !== undefined &&
        currentVisibleDuration.days !== 0 &&
        !Number.isNaN(currentVisibleDuration.days)
      ) {
        this.focusNextPage();
      } else if (
        currentVisibleDuration.weeks !== undefined &&
        currentVisibleDuration.weeks !== 0 &&
        !Number.isNaN(currentVisibleDuration.weeks)
      ) {
        focusCell(currentFocusedDate.add({ months: 1 }));
      } else if (
        (currentVisibleDuration.months !== undefined &&
          currentVisibleDuration.months !== 0 &&
          !Number.isNaN(currentVisibleDuration.months)) ||
        (currentVisibleDuration.years !== undefined &&
          currentVisibleDuration.years !== 0 &&
          !Number.isNaN(currentVisibleDuration.years))
      ) {
        focusCell(currentFocusedDate.add({ years: 1 }));
      }
    },
    focusPreviousDay() {
      const currentFocusedDate = focusedDate();
      focusCell(currentFocusedDate.subtract({ days: 1 }));
    },
    focusPreviousPage() {
      const currentFocusedDate = focusedDate();
      const start = startDate().subtract(pageDuration());
      setFocusedDate(
        constrainValue(
          currentFocusedDate.subtract(pageDuration()),
          minValue(),
          maxValue()
        )
      );
      setStartDate(
        alignStart(
          constrainStart(
            currentFocusedDate,
            start,
            pageDuration(),
            locale(),
            minValue(),
            maxValue()
          ),
          pageDuration(),
          locale()
        )
      );
    },
    focusPreviousRow() {
      const currentVisibleDuration = visibleDuration();
      const currentFocusedDate = focusedDate();

      if (
        currentVisibleDuration.days !== undefined &&
        currentVisibleDuration.days !== 0 &&
        !Number.isNaN(currentVisibleDuration.days)
      ) {
        this.focusPreviousPage();
      } else if (
        (currentVisibleDuration.weeks !== undefined &&
          currentVisibleDuration.weeks !== 0 &&
          !Number.isNaN(currentVisibleDuration.weeks)) ||
        (currentVisibleDuration.months !== undefined &&
          currentVisibleDuration.months !== 0 &&
          !Number.isNaN(currentVisibleDuration.months)) ||
        (currentVisibleDuration.years !== undefined &&
          currentVisibleDuration.years !== 0 &&
          !Number.isNaN(currentVisibleDuration.years))
      ) {
        focusCell(currentFocusedDate.subtract({ weeks: 1 }));
      }
    },
    focusPreviousSection(larger) {
      const currentVisibleDuration = visibleDuration();
      const currentFocusedDate = focusedDate();

      if (
        !(larger === true) &&
        (currentVisibleDuration.days === undefined ||
          currentVisibleDuration.days === 0 ||
          Number.isNaN(currentVisibleDuration.days))
      ) {
        focusCell(
          currentFocusedDate.subtract(unitDuration(currentVisibleDuration))
        );

        return;
      }

      if (
        currentVisibleDuration.days !== undefined &&
        currentVisibleDuration.days !== 0 &&
        !Number.isNaN(currentVisibleDuration.days)
      ) {
        this.focusPreviousPage();
      } else if (
        currentVisibleDuration.weeks !== undefined &&
        currentVisibleDuration.weeks !== 0 &&
        !Number.isNaN(currentVisibleDuration.weeks)
      ) {
        focusCell(currentFocusedDate.subtract({ months: 1 }));
      } else if (
        (currentVisibleDuration.months !== undefined &&
          currentVisibleDuration.months !== 0 &&
          !Number.isNaN(currentVisibleDuration.months)) ||
        (currentVisibleDuration.years !== undefined &&
          currentVisibleDuration.years !== 0 &&
          !Number.isNaN(currentVisibleDuration.years))
      ) {
        focusCell(currentFocusedDate.subtract({ years: 1 }));
      }
    },
    focusSectionEnd() {
      const currentVisibleDuration = visibleDuration();
      const currentFocusedDate = focusedDate();

      if (
        currentVisibleDuration.days !== undefined &&
        currentVisibleDuration.days !== 0 &&
        !Number.isNaN(currentVisibleDuration.days)
      ) {
        focusCell(endDate());
      } else if (
        currentVisibleDuration.weeks !== undefined &&
        currentVisibleDuration.weeks !== 0 &&
        !Number.isNaN(currentVisibleDuration.weeks)
      ) {
        focusCell(endOfWeek(currentFocusedDate, locale()));
      } else if (
        (currentVisibleDuration.months !== undefined &&
          currentVisibleDuration.months !== 0 &&
          !Number.isNaN(currentVisibleDuration.months)) ||
        (currentVisibleDuration.years !== undefined &&
          currentVisibleDuration.years !== 0 &&
          !Number.isNaN(currentVisibleDuration.years))
      ) {
        focusCell(endOfMonth(currentFocusedDate));
      }
    },
    focusSectionStart() {
      const currentVisibleDuration = visibleDuration();
      const currentFocusedDate = focusedDate();

      if (
        currentVisibleDuration.days !== undefined &&
        currentVisibleDuration.days !== 0 &&
        !Number.isNaN(currentVisibleDuration.days)
      ) {
        focusCell(startDate());
      } else if (
        currentVisibleDuration.weeks !== undefined &&
        currentVisibleDuration.weeks !== 0 &&
        !Number.isNaN(currentVisibleDuration.weeks)
      ) {
        focusCell(startOfWeek(currentFocusedDate, locale()));
      } else if (
        (currentVisibleDuration.months !== undefined &&
          currentVisibleDuration.months !== 0 &&
          !Number.isNaN(currentVisibleDuration.months)) ||
        (currentVisibleDuration.years !== undefined &&
          currentVisibleDuration.years !== 0 &&
          !Number.isNaN(currentVisibleDuration.years))
      ) {
        focusCell(startOfMonth(currentFocusedDate));
      }
    },
    get focusedDate() {
      const currentFocusedDate = focusedDate();

      return currentFocusedDate;
    },
    getDatesInWeek(weekIndex, from = startDate()) {
      const currentVisibleDuration = visibleDuration();
      let date = from.add({ weeks: weekIndex });
      const dates: (CalendarDate | null)[] = [];

      const days =
        currentVisibleDuration.days !== undefined &&
        currentVisibleDuration.days !== 0 &&
        !Number.isNaN(currentVisibleDuration.days) &&
        currentVisibleDuration.days < 7
          ? currentVisibleDuration.days
          : 7;

      if (days === 7) {
        date = startOfWeek(date, locale(), firstDayOfWeek());
        // startOfWeek will clamp dates within the calendar system's valid range, which may
        // start in the middle of a week. In this case, add null placeholders.
        const dayOfWeek = getDayOfWeek(date, locale(), firstDayOfWeek());

        for (let i = 0; i < dayOfWeek; i += 1) {
          dates.push(null);
        }
      }

      while (dates.length < days) {
        dates.push(date);
        const nextDate = date.add({ days: 1 });

        if (isSameDay(date, nextDate)) {
          // If the next day is the same, we have hit the end of the calendar system.
          break;
        }

        date = nextDate;
      }

      // Add null placeholders if at the end of the calendar system.
      while (dates.length < days) {
        dates.push(null);
      }

      return dates;
    },
    getWeeksInMonth(date = startDate()) {
      const currentVisibleDuration = visibleDuration();

      let weeks =
        weeksInMonth() ?? getWeeksInMonth(date, locale(), firstDayOfWeek());

      if (
        (currentVisibleDuration.weeks !== undefined &&
          currentVisibleDuration.weeks !== 0 &&
          !Number.isNaN(currentVisibleDuration.weeks)) ||
        (currentVisibleDuration.days !== undefined &&
          currentVisibleDuration.days !== 0 &&
          !Number.isNaN(currentVisibleDuration.days))
      ) {
        weeks = currentVisibleDuration.weeks ?? 0;

        if (
          currentVisibleDuration.days !== undefined &&
          currentVisibleDuration.days !== 0 &&
          !Number.isNaN(currentVisibleDuration.days)
        ) {
          weeks += Math.ceil(currentVisibleDuration.days / 7);
        }
      }

      return weeks;
    },
    isCellDisabled(date) {
      return (
        props.isDisabled === true ||
        date.compare(startDate()) < 0 ||
        date.compare(endDate()) > 0 ||
        this.isInvalid(date)
      );
    },
    isCellFocused(date) {
      const currentFocusedDate = focusedDate();

      return (
        isFocused() &&
        Boolean(currentFocusedDate) &&
        isSameDay(date, currentFocusedDate)
      );
    },
    isCellUnavailable(date) {
      return props.isDateUnavailable ? props.isDateUnavailable(date) : false;
    },
    get isDisabled() {
      return props.isDisabled ?? false;
    },
    get isFocused() {
      return isFocused();
    },
    isInvalid(date) {
      return isInvalid(date, minValue(), maxValue());
    },
    isNextVisibleRangeInvalid() {
      // Adding may return the same date if we reached the end of time
      // according to the calendar system (e.g. 9999-12-31).
      const next = endDate().add({ days: 1 });

      return isSameDay(next, endDate()) || this.isInvalid(next);
    },
    isPreviousVisibleRangeInvalid() {
      const prev = startDate().subtract({ days: 1 });

      return isSameDay(prev, startDate()) || this.isInvalid(prev);
    },
    get isReadOnly() {
      return props.isReadOnly ?? false;
    },
    isSelected(date) {
      const currentCalendarDateValue = calendarDateValue();

      if (
        !currentCalendarDateValue ||
        this.isCellDisabled(date) ||
        this.isCellUnavailable(date)
      ) {
        return false;
      }

      return Array.isArray(currentCalendarDateValue)
        ? currentCalendarDateValue.some((localValue) =>
            isSameDay(localValue, date)
          )
        : isSameDay(date, currentCalendarDateValue);
    },
    get isValueInvalid() {
      return isValueInvalid();
    },
    get maxValue() {
      return maxValue();
    },
    get minValue() {
      return minValue();
    },
    selectDate(date) {
      const currentValue = value();

      if (props.isDisabled === true || props.isReadOnly === true) {
        return;
      }

      if (
        selectionMode() === "multiple" &&
        date !== null &&
        date !== undefined
      ) {
        const newDate = normalizeValue(date);

        if (!newDate) {
          return;
        }

        let baseValue: T[] = [];

        if (Array.isArray(currentValue)) {
          baseValue = currentValue;
        } else if (currentValue !== null && currentValue !== undefined) {
          baseValue = [currentValue];
        }

        const index = baseValue.findIndex((localValue) =>
          isSameDay(localValue, newDate)
        );

        const newValue =
          index === -1
            ? [...baseValue, newDate]
            : [...baseValue.slice(0, index), ...baseValue.slice(index + 1)];

        setControlledValue(newValue);
      } else {
        setValue(date);
      }
    },
    selectFocusedDate() {
      const currentIsDateUnavailable = isDateUnavailable();
      const currentFocusedDate = focusedDate();

      if (
        !currentIsDateUnavailable ||
        !currentIsDateUnavailable(currentFocusedDate)
      ) {
        this.selectDate(currentFocusedDate);
      }
    },
    get selectionMode() {
      return selectionMode();
    },
    setFocused(focused: boolean) {
      setFocused(focused);
    },
    setFocusedDate(date) {
      focusCell(date);
    },
    get setValue() {
      return setValue;
    },
    get timeZone() {
      return timeZone();
    },
    // oxlint-disable-next-line typescript/no-deprecated -- Preserve and test the upstream compatibility API.
    get validationState() {
      return validationState();
    },
    get value() {
      const currentCalendarDateValue = calendarDateValue();

      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- SAFETY: the display value preserves the selection shape specified by M.
      return currentCalendarDateValue as CalendarValueType<
        CalendarDate | null,
        M
      >;
    },
    get visibleDuration() {
      const currentVisibleDuration = visibleDuration();

      return currentVisibleDuration;
    },
    get visibleRange() {
      return {
        end: endDate(),
        start: startDate(),
      };
    },
  };
}

function unitDuration(duration: DateDuration) {
  const unit = { ...duration };

  for (const key of ["years", "months", "weeks", "days"] as const) {
    if (duration[key] !== undefined) {
      unit[key] = 1;
    }
  }

  return unit;
}
