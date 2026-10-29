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
 * Derived from Adobe React Spectrum: packages/react-aria/src/calendar/useCalendarMonthPicker.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { CalendarDate } from "@internationalized/date";
import type {
  CalendarSelectionMode,
  CalendarState,
  RangeCalendarState,
} from "@solid2-aria/stately/calendar/types";
import type { Key } from "@solid2-aria/types-shared";
import { untrack, createMemo } from "solid-js";

import { createDateFormatter } from "../i18n/create-date-formatter";
import { createLocale } from "../i18n/i18n-provider";
import { ariaValue } from "../utils/aria-value";
import { isPresent } from "../utils/is-present";
import { requireValue } from "../utils/require-value";
import { getTruthyValue } from "../utils/truthy";

export interface CalendarMonthPickerProps {
  /**
   * The format of the month.
   */
  format?: "numeric" | "2-digit" | "long" | "short" | "narrow";
}

export interface CalendarMonthPickerAria {
  "aria-label": string;
  value: Key;
  onChange: (key: Key | null) => void;
  items: CalendarMonthPickerItem[];
}

export interface CalendarMonthPickerItem {
  id: number;
  date: CalendarDate;
  formatted: string;
}

export function createCalendarMonthPicker(
  props: CalendarMonthPickerProps,
  state: CalendarState<CalendarSelectionMode> | RangeCalendarState
): CalendarMonthPickerAria {
  const formatter = createDateFormatter({
    get calendar() {
      return state.focusedDate.calendar.identifier;
    },
    get month() {
      return getTruthyValue(props.format) ?? "short";
    },
    get timeZone() {
      return state.timeZone;
    },
  });

  // Format the name of each month in the year according to the
  // current locale and calendar system. Note that in some calendar
  // systems, such as the Hebrew, the number of months may differ
  // between years.
  const months = createMemo(() => {
    const result: CalendarMonthPickerItem[] = [];

    const numMonths = createMemo(() =>
      state.focusedDate.calendar.getMonthsInYear(state.focusedDate)
    );

    for (let i = 1; i <= untrack(() => numMonths()); i += 1) {
      const date = state.focusedDate.set({ month: i });

      // Calendars like the 4-5-4 fiscal calendar use getFormattableMonth to map
      // their internal month back to the Gregorian month that should be displayed.
      const displayDate = date.calendar.getFormattableMonth
        ? date.calendar.getFormattableMonth(date)
        : date;

      result.push({
        date,
        formatted: formatter.format(displayDate.toDate(state.timeZone)),
        id: i,
      });
    }

    return result;
  });

  const items = createMemo(
    () =>
      months().map((item, index) => ({
        get date() {
          return months()[index]?.date ?? item.date;
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
        "month"
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
          const item = months().find(
            (itemValue) => itemValue.id === Number(key)
          );

          if (item) {
            state.setFocusedDate(item.date);
          }
        }
      };
    },
    get value() {
      return state.focusedDate.month;
    },
  };
}
