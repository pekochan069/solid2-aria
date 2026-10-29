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
 * Derived from Adobe React Spectrum: packages/react-aria/src/calendar/utils.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { endOfMonth, isSameDay, startOfMonth } from "@internationalized/date";
import type { CalendarDate, DateFormatter } from "@internationalized/date";
import type { LocalizedStringFormatter } from "@internationalized/string";
import type {
  CalendarSelectionMode,
  CalendarState,
  RangeCalendarState,
} from "@solid2-aria/stately/calendar/types";
import { createMemo } from "solid-js";

import intlMessages from "../../intl/calendar/index";
import { createDateFormatter } from "../i18n/create-date-formatter";
import { createLocalizedStringFormatter } from "../i18n/create-localized-string-formatter";
import { createLocale } from "../i18n/i18n-provider";
import { requireValue } from "../utils/require-value";
import { getTruthyValue, isTruthy } from "../utils/truthy";

interface HookData {
  ariaLabel?: string;
  ariaLabelledBy?: string;
  errorMessageId?: string;
  selectedDateDescription: string;
}

export const hookData: WeakMap<
  CalendarState<CalendarSelectionMode> | RangeCalendarState,
  HookData
> = new WeakMap<
  CalendarState<CalendarSelectionMode> | RangeCalendarState,
  HookData
>();

function isDateArray(
  value: CalendarState<"single" | "multiple">["value"]
): value is Extract<
  CalendarState<"single" | "multiple">["value"],
  readonly unknown[]
> {
  return Array.isArray(value);
}

export function getEraFormat(
  date: CalendarDate | null | undefined
): "short" | undefined {
  return date?.calendar.identifier === "gregory" && date.era === "BC"
    ? "short"
    : undefined;
}

export function createSelectedDateDescription(
  state: CalendarState<"single" | "multiple"> | RangeCalendarState
): () => string {
  const stringFormatter = createLocalizedStringFormatter(
    intlMessages,
    "@react-aria/calendar"
  );

  const range = createMemo(() => {
    if ("highlightedRange" in state) {
      return state.highlightedRange ?? {};
    }

    return {
      end: isDateArray(state.value)
        ? state.value.at(-1)
        : (state.value ?? undefined),
      start: isDateArray(state.value)
        ? state.value[0]
        : (state.value ?? undefined),
    };
  });

  const start = () => range().start;
  const end = () => range().end;

  const dateFormatter = createDateFormatter({
    get day() {
      return "numeric" as const;
    },
    get era() {
      return getTruthyValue(getEraFormat(start())) ?? getEraFormat(end());
    },
    get month() {
      return "long" as const;
    },
    get timeZone() {
      return state.timeZone;
    },
    get weekday() {
      return "long" as const;
    },
    get year() {
      return "numeric" as const;
    },
  });

  const _result2 = createLocale();

  const listFormatter = createMemo(() => new Intl.ListFormat(_result2.locale));

  const anchorDate = createMemo(() =>
    "anchorDate" in state ? state.anchorDate : null
  );

  const _memo0 = createMemo(() => {
    const first = start();
    const last = end();

    // No message if currently selecting a range, or there is nothing highlighted.
    if (!anchorDate() && isTruthy(first) && isTruthy(last)) {
      // Use a single date message if the start() and end() dates are the same day,
      // otherwise include both dates.
      if (isSameDay(first, last)) {
        const date = dateFormatter.format(first.toDate(state.timeZone));

        return stringFormatter.format("selectedDateDescription", { date });
      } else if ("highlightedRange" in state) {
        const dateRange = formatRange(
          dateFormatter,
          stringFormatter,
          first,
          last,
          state.timeZone
        );

        return stringFormatter.format("selectedRangeDescription", {
          dateRange,
        });
      } else if (isDateArray(state.value)) {
        const dates = state.value
          .filter(isTruthy)
          .map((date) => dateFormatter.format(date.toDate(state.timeZone)));

        const formatted = listFormatter().format(dates);

        return stringFormatter.format("selectedDateDescription", {
          date: formatted,
        });
      }
    }

    return "";
  });

  return _memo0;
}

export function createVisibleRangeDescription(
  startDateInput: CalendarDate | (() => CalendarDate),
  endDateInput: CalendarDate | (() => CalendarDate),
  timeZoneInput: string | (() => string),
  isAria: boolean
): () => string {
  const startDate = () =>
    typeof startDateInput === "function" ? startDateInput() : startDateInput;

  const endDate = () =>
    typeof endDateInput === "function" ? endDateInput() : endDateInput;

  const timeZone = () =>
    typeof timeZoneInput === "function" ? timeZoneInput() : timeZoneInput;

  const stringFormatter = createLocalizedStringFormatter(
    intlMessages,
    "@react-aria/calendar"
  );

  const era = createMemo(
    () => getTruthyValue(getEraFormat(startDate())) ?? getEraFormat(endDate())
  );

  const monthFormatter = createDateFormatter({
    get calendar() {
      return startDate().calendar.identifier;
    },
    get era() {
      return era();
    },
    get month() {
      return "long" as const;
    },
    get timeZone() {
      return timeZone();
    },
    get year() {
      return "numeric" as const;
    },
  });

  const dateFormatter = createDateFormatter({
    get calendar() {
      return startDate().calendar.identifier;
    },
    get day() {
      return "numeric" as const;
    },
    get era() {
      return era();
    },
    get month() {
      return "long" as const;
    },
    get timeZone() {
      return timeZone();
    },
    get year() {
      return "numeric" as const;
    },
  });

  const _memo1 = createMemo(() => {
    // Special case for month granularity. Format as a single month if only a
    // single month is visible, otherwise format as a range of months.
    if (isSameDay(startDate(), startOfMonth(startDate()))) {
      let startMonth = startDate();
      let endMonth = endDate();

      if (startDate().calendar.getFormattableMonth) {
        startMonth =
          startDate().calendar.getFormattableMonth?.(startDate()) ??
          startDate();
      }

      if (endDate().calendar.getFormattableMonth) {
        endMonth =
          endDate().calendar.getFormattableMonth?.(endDate()) ?? endDate();
      }

      if (isSameDay(endDate(), endOfMonth(startDate()))) {
        return monthFormatter.format(startMonth.toDate(timeZone()));
      } else if (isSameDay(endDate(), endOfMonth(endDate()))) {
        return isAria
          ? formatRange(
              monthFormatter,
              stringFormatter,
              startMonth,
              endMonth,
              timeZone()
            )
          : monthFormatter.formatRange(
              startMonth.toDate(timeZone()),
              endMonth.toDate(timeZone())
            );
      }
    }

    return isAria
      ? formatRange(
          dateFormatter,
          stringFormatter,
          startDate(),
          endDate(),
          timeZone()
        )
      : dateFormatter.formatRange(
          startDate().toDate(timeZone()),
          endDate().toDate(timeZone())
        );
  });

  return _memo1;
}

function formatRange(
  dateFormatter: Pick<DateFormatter, keyof DateFormatter>,
  stringFormatter: Pick<LocalizedStringFormatter, "format">,
  start: CalendarDate,
  end: CalendarDate,
  timeZone: string
) {
  const parts = dateFormatter.formatRangeToParts(
    start.toDate(timeZone),
    end.toDate(timeZone)
  );

  // Find the separator between the start and end date. This is determined
  // by finding the last shared literal before the end range.
  let separatorIndex = -1;

  for (let i = 0; i < parts.length; i += 1) {
    const part = requireValue(parts[i], "Expected parts[i]");

    if (part.source === "shared" && part.type === "literal") {
      separatorIndex = i;
    } else if (part.source === "endRange") {
      break;
    }
  }

  // Now we can combine the parts into start and end strings.
  let startValue = "";
  let endValue = "";

  for (let i = 0; i < parts.length; i += 1) {
    if (i < separatorIndex) {
      startValue += requireValue(parts[i], "Expected parts[i]").value;
    } else if (i > separatorIndex) {
      endValue += requireValue(parts[i], "Expected parts[i]").value;
    }
  }

  return stringFormatter.format("dateRange", {
    endDate: endValue,
    startDate: startValue,
  });
}
