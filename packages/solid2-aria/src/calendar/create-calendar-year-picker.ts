/*
 * Copyright 2026 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria/src/calendar/useCalendarYearPicker.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { isSameYear, toCalendarDate } from "@internationalized/date";
import type { CalendarDate } from "@internationalized/date";
import type {
  CalendarSelectionMode,
  CalendarState,
  RangeCalendarState,
} from "@solid2-aria/stately/calendar/types";
import type { Key } from "@solid2-aria/types-shared";
import { createMemo } from "solid-js";

import { createDateFormatter } from "../i18n/create-date-formatter";
import { createLocale } from "../i18n/i18n-provider";
import { ariaValue } from "../utils/aria-value";
import { isPresent } from "../utils/is-present";
import { requireValue } from "../utils/require-value";
import { getTruthyValue } from "../utils/truthy";

export interface CalendarYearPickerFormatOptions {
  year?: "numeric" | "2-digit";
  era?: "long" | "short" | "narrow";
}

export interface CalendarYearPickerProps {
  /**
   * The number of years to display.
   *
   * @default 20
   */
  visibleYears?: number;
  /**
   * The format to display.
   */
  format?: CalendarYearPickerFormatOptions;
}

export interface CalendarYearPickerAria {
  "aria-label": string;
  value: Key;
  onChange: (key: Key | null) => void;
  items: CalendarYearPickerItem[];
}

export interface CalendarYearPickerItem {
  id: number;
  date: CalendarDate;
  formatted: string;
}

export function createCalendarYearPicker(
  props: CalendarYearPickerProps,
  state: CalendarState<CalendarSelectionMode> | RangeCalendarState
): CalendarYearPickerAria {
  const formatter = createDateFormatter({
    get calendar() {
      return state.focusedDate.calendar.identifier;
    },
    get era() {
      return (
        getTruthyValue(props.format?.era) ??
        (state.focusedDate.calendar.identifier === "gregory" &&
        state.focusedDate.era === "BC"
          ? "short"
          : undefined)
      );
    },
    get timeZone() {
      return state.timeZone;
    },
    get year() {
      return getTruthyValue(props.format?.year) ?? "numeric";
    },
  });

  // Determine the minimum and maximum date. By default, show an equal number of years on each side of the current year.
  // However, this can be constrained by the calendar's minimum and maximum date.
  const visibleYears = createMemo(
    () => getTruthyValue(props.visibleYears) ?? 20
  );

  const years = createMemo(() => {
    let minDate = state.focusedDate.subtract({
      years: Math.floor(visibleYears() / 2),
    });

    let maxDate = state.focusedDate.add({
      years: Math.ceil(visibleYears() / 2) - 1,
    });

    if (state.maxValue && maxDate.compare(state.maxValue) > 0) {
      maxDate = toCalendarDate(state.maxValue);
      minDate = maxDate.subtract({ years: visibleYears() - 1 });
    }

    if (state.minValue && minDate.compare(state.minValue) < 0) {
      minDate = toCalendarDate(state.minValue);
      maxDate = minDate.add({ years: visibleYears() - 1 });

      if (state.maxValue && maxDate.compare(state.maxValue) > 0) {
        maxDate = toCalendarDate(state.maxValue);
      }
    }

    const result: CalendarYearPickerItem[] = [];
    let date = minDate;
    let value = 0;

    while (date.compare(maxDate) <= 0 || isSameYear(date, maxDate)) {
      const itemDate = date.compare(maxDate) > 0 ? maxDate : date;

      if (isSameYear(itemDate, state.focusedDate)) {
        value = result.length;
      }

      result.push({
        date: itemDate,
        formatted: formatter.format(itemDate.toDate(state.timeZone)),
        // Use the index as the id so we can retrieve the full
        // date object from the list in onChange. We cannot only
        // store the year number, because in some calendars, such
        // as the Japanese, the era may also change.
        id: result.length,
      });
      date = date.add({ years: 1 });
    }

    return { items: result, value };
  });

  const items = createMemo(
    () =>
      years().items.map((item) => ({
        get date() {
          return years().items[item.id]?.date ?? item.date;
        },
        formatted: item.formatted,
        id: item.id,
      })),
    {
      equals: (previous, next) =>
        previous.length === next.length &&
        previous.every(
          (item, index) =>
            item.id === next[index]?.id &&
            item.formatted === next[index]?.formatted
        ),
    }
  );

  const _result0 = createLocale();

  const ariaLabel = createMemo(() =>
    requireValue(
      new Intl.DisplayNames(_result0.locale, { type: "dateTimeField" }).of(
        "year"
      ),
      'Expected new Intl.DisplayNames(_result0.locale, { type: "dateTimeField" }).of( '
    )
  );

  return {
    get "aria-label"() {
      return ariaValue(ariaValue(ariaLabel()));
    },
    get items() {
      return items();
    },
    get onChange() {
      return (key: Key | null) => {
        if (isPresent(key)) {
          const item = years().items.find(
            (itemValue) => itemValue.id === Number(key)
          );

          if (item) {
            state.setFocusedDate(item.date);
          }
        }
      };
    },
    get value() {
      return years().value;
    },
  };
}
