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
 * Derived from Adobe React Spectrum: packages/react-aria/src/calendar/useCalendarHeading.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { DateDuration } from "@internationalized/date";
import type {
  CalendarSelectionMode,
  CalendarState,
  RangeCalendarState,
} from "@solid2-aria/stately/calendar/types";
import { createMemo } from "solid-js";

import { createDateFormatter } from "../i18n/create-date-formatter";
import { getTruthyValue, isTruthy } from "../utils/truthy";

export interface CalendarHeadingFormatOptions {
  day?: "numeric" | "2-digit";
  month?: "numeric" | "2-digit" | "long" | "short" | "narrow";
  year?: "numeric" | "2-digit";
  era?: "long" | "short" | "narrow";
}

export interface CalendarHeadingProps {
  /**
   * The number of months from the start of the visible range to display.
   *
   * @default 0
   */
  offset?: DateDuration;
  /**
   * The format of the month heading.
   */
  format?: CalendarHeadingFormatOptions;
}

export function createCalendarHeading(
  props: CalendarHeadingProps,
  state: CalendarState<CalendarSelectionMode> | RangeCalendarState
): () => string {
  const startDate = createMemo(() => {
    let currentMonth = state.visibleRange.start;

    if (props.offset) {
      currentMonth = currentMonth.add(props.offset);
    }

    return currentMonth;
  });

  const isDays = createMemo(
    () =>
      getTruthyValue(state.visibleDuration.days) ?? state.visibleDuration.weeks
  );

  const formatter = createDateFormatter({
    get calendar() {
      return state.visibleRange?.start.calendar.identifier;
    },
    get day() {
      return (
        getTruthyValue(props.format?.day) ??
        (isTruthy(isDays()) ? "numeric" : undefined)
      );
    },
    get era() {
      return props.format?.era ||
        (isTruthy(startDate()) &&
          startDate().calendar.identifier === "gregory" &&
          startDate().era === "BC")
        ? "short"
        : undefined;
    },
    get month() {
      return getTruthyValue(props.format?.month) ?? "long";
    },
    get timeZone() {
      return state.timeZone;
    },
    get year() {
      return getTruthyValue(props.format?.year) ?? "numeric";
    },
  });

  const _memo0 = createMemo(() => {
    if (isTruthy(isDays())) {
      return formatter.formatRange(
        startDate().toDate(state.timeZone),
        state.visibleRange.end.toDate(state.timeZone)
      );
    }

    // Custom calendars like the 4-5-4 fiscal calendar use getFormattableMonth to map
    // their internal month back to the Gregorian month that should be displayed.
    const displayDate = startDate().calendar.getFormattableMonth
      ? (startDate().calendar.getFormattableMonth?.(startDate()) ?? startDate())
      : startDate();

    return formatter.format(displayDate.toDate(state.timeZone));
  });

  return _memo0;
}
