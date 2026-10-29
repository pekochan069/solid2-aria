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
 * Derived from Adobe React Spectrum: packages/react-stately/src/calendar/utils.ts.
 * Modified for Solid Aria: adapted state, collection descriptors, imports, and APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import {
  maxDate,
  minDate,
  startOfMonth,
  startOfWeek,
  startOfYear,
  toCalendarDate,
} from "@internationalized/date";
import type { CalendarDate, DateDuration } from "@internationalized/date";

import type { DateValue } from "./types";

export function isInvalid(
  date: DateValue,
  minValue?: DateValue | null,
  maxValue?: DateValue | null
): boolean {
  return (
    (minValue !== null &&
      minValue !== undefined &&
      date.compare(minValue) < 0) ||
    (maxValue !== null && maxValue !== undefined && date.compare(maxValue) > 0)
  );
}

export function alignCenter(
  date: CalendarDate,
  duration: DateDuration,
  locale: string,
  minValue?: DateValue | null,
  maxValue?: DateValue | null
): CalendarDate {
  const halfDuration: DateDuration = {};

  for (const key of ["years", "months", "weeks", "days"] as const) {
    halfDuration[key] = Math.floor((duration[key] ?? 0) / 2);

    if (halfDuration[key] > 0 && (duration[key] ?? 0) % 2 === 0) {
      halfDuration[key] -= 1;
    }
  }

  const aligned = alignStart(date, duration, locale).subtract(halfDuration);

  return constrainStart(date, aligned, duration, locale, minValue, maxValue);
}

export function alignStart(
  date: CalendarDate,
  duration: DateDuration,
  locale: string,
  minValue?: DateValue | null,
  maxValue?: DateValue | null
): CalendarDate {
  // align to the start of the largest unit
  let aligned = date;

  if (
    duration.years !== undefined &&
    duration.years !== 0 &&
    !Number.isNaN(duration.years)
  ) {
    aligned = startOfYear(date);
  } else if (
    duration.months !== undefined &&
    duration.months !== 0 &&
    !Number.isNaN(duration.months)
  ) {
    aligned = startOfMonth(date);
  } else if (
    (duration.weeks !== undefined &&
      duration.weeks !== 0 &&
      !Number.isNaN(duration.weeks)) ||
    (duration.days !== undefined &&
      duration.days !== 0 &&
      !Number.isNaN(duration.days) &&
      duration.days > 7)
  ) {
    aligned = startOfWeek(date, locale);
  }

  return constrainStart(date, aligned, duration, locale, minValue, maxValue);
}

export function alignEnd(
  date: CalendarDate,
  duration: DateDuration,
  locale: string,
  minValue?: DateValue | null,
  maxValue?: DateValue | null
): CalendarDate {
  const d = { ...duration };

  // subtract 1 from the smallest unit
  if (d.days !== undefined && d.days !== 0 && !Number.isNaN(d.days)) {
    d.days -= 1;
  } else if (d.weeks !== undefined && d.weeks !== 0 && !Number.isNaN(d.weeks)) {
    d.weeks -= 1;
  } else if (
    d.months !== undefined &&
    d.months !== 0 &&
    !Number.isNaN(d.months)
  ) {
    d.months -= 1;
  } else if (d.years !== undefined && d.years !== 0 && !Number.isNaN(d.years)) {
    d.years -= 1;
  }

  const aligned = alignStart(date, duration, locale).subtract(d);

  return constrainStart(date, aligned, duration, locale, minValue, maxValue);
}

export function constrainStart(
  date: CalendarDate,
  initialAligned: CalendarDate,
  duration: DateDuration,
  locale: string,
  minValue?: DateValue | null,
  maxValue?: DateValue | null
): CalendarDate {
  let aligned = initialAligned;

  if (minValue && date.compare(minValue) >= 0) {
    const newDate = maxDate(
      aligned,
      alignStart(toCalendarDate(minValue), duration, locale)
    );

    if (newDate) {
      aligned = newDate;
    }
  }

  if (maxValue && date.compare(maxValue) <= 0) {
    const newDate = minDate(
      aligned,
      alignEnd(toCalendarDate(maxValue), duration, locale)
    );

    aligned = newDate;
  }

  return aligned;
}

export function constrainValue(
  initialDate: CalendarDate,
  minValue?: DateValue | null,
  maxValue?: DateValue | null
): CalendarDate {
  let date = initialDate;

  if (minValue) {
    const newDate = maxDate(date, toCalendarDate(minValue));

    if (newDate) {
      date = newDate;
    }
  }

  if (maxValue) {
    const newDate = minDate(date, toCalendarDate(maxValue));

    date = newDate;
  }

  return date;
}

export function previousAvailableDate(
  initialDate: CalendarDate,
  minValue: DateValue,
  isDateUnavailable?: (date: CalendarDate) => boolean
): CalendarDate | null {
  let date = initialDate;

  if (!isDateUnavailable) {
    return date;
  }

  while (date.compare(minValue) >= 0 && isDateUnavailable(date)) {
    date = date.subtract({ days: 1 });
  }

  if (date.compare(minValue) >= 0) {
    return date;
  }

  return null;
}

export function isEqualDuration(a: DateDuration, b: DateDuration): boolean {
  if (a === b) {
    return true;
  }

  return (
    a.days === b.days &&
    a.weeks === b.weeks &&
    a.months === b.months &&
    a.years === b.years
  );
}
