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
 * Derived from Adobe React Spectrum: packages/react-stately/src/datepicker/IncompleteDate.ts.
 * Modified for Solid Aria: adapted reactive state, getters, imports, and APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { CalendarDate } from "@internationalized/date";
import type { AnyDateTime, Calendar } from "@internationalized/date";

import { requireValue } from "../utils/require-value";
import type { DateSegmentType } from "./create-date-field-state";
import type { DateValue, MappedDateValue } from "./types";

type HourCycle = "h12" | "h11" | "h23" | "h24";

/**
 * This class represents a date that is incomplete or otherwise invalid as a result of user editing.
 * For example, it can represent temporary dates such as February 31st if the user edits the day
 * before the month. Times are represented according to an hour cycle rather than always in 24 hour
 * time. This enables the user to adjust the day period (e.g. am/pm) independently from the hour.
 */
export class IncompleteDate {
  calendar: Calendar;
  era: string | null;
  year: number | null;
  month: number | null;
  day: number | null;
  hour: number | null;
  hourCycle: HourCycle;
  dayPeriod: number | null;
  minute: number | null;
  second: number | null;
  millisecond: number | null;
  offset: number | null;
  constructor(
    calendar: Calendar,
    hourCycle: HourCycle,
    dateValue?: Partial<Omit<AnyDateTime, "copy">> | null
  ) {
    this.era = dateValue?.era ?? null;
    this.calendar = calendar;
    this.year = dateValue?.year ?? null;
    this.month = dateValue?.month ?? null;
    this.day = dateValue?.day ?? null;
    this.hour = dateValue?.hour ?? null;
    this.hourCycle = hourCycle;
    this.dayPeriod = null;
    this.minute = dateValue?.minute ?? null;
    this.second = dateValue?.second ?? null;
    this.millisecond = dateValue?.millisecond ?? null;
    this.offset = getDateOffset(dateValue);

    // Convert the hour from 24 hour time to the given hour cycle.
    if (this.hour !== null && this.hour !== undefined) {
      const [dayPeriod, hour] = toHourCycle(this.hour, hourCycle);
      this.dayPeriod = dayPeriod;
      this.hour = hour;
    }
  }
  copy(): IncompleteDate {
    const res = new IncompleteDate(this.calendar, this.hourCycle);
    res.era = this.era;
    res.year = this.year;
    res.month = this.month;
    res.day = this.day;
    res.hour = this.hour;
    res.dayPeriod = this.dayPeriod;
    res.minute = this.minute;
    res.second = this.second;
    res.millisecond = this.millisecond;
    res.offset = this.offset;

    return res;
  }
  /** Checks whether all the specified segments have a value. */
  isComplete(segments: DateSegmentType[]) {
    return segments.every(
      (segment) =>
        isEditableSegment(segment) &&
        this[segment] !== null &&
        this[segment] !== undefined
    );
  }
  /** Checks whether the given date value matches this value for the specified segments. */
  validate(dt: DateValue, segments: DateSegmentType[]) {
    const fields: Partial<
      Pick<
        IncompleteDate,
        | "era"
        | "year"
        | "month"
        | "day"
        | "hour"
        | "dayPeriod"
        | "minute"
        | "second"
      >
    > = dt;

    return segments.every((segment) => {
      if ((segment === "hour" || segment === "dayPeriod") && "hour" in dt) {
        const [dayPeriod, hour] = toHourCycle(dt.hour, this.hourCycle);

        return this.dayPeriod === dayPeriod && this.hour === hour;
      }

      return (
        isEditableSegment(segment) &&
        segment in dt &&
        this[segment] === fields[segment]
      );
    });
  }
  /** Checks if the date is empty (i.e. all specified segments are null). */
  isCleared(segments: DateSegmentType[]): boolean {
    return segments.every(
      (segment) => isEditableSegment(segment) && this[segment] === null
    );
  }
  /** Sets the given field. */
  set(
    field: DateSegmentType,
    value: number | string,
    placeholder: DateValue
  ): IncompleteDate {
    const result = this.copy();

    if (field === "era" && typeof value === "string") {
      result.era = value;
    } else if (
      isEditableSegment(field) &&
      field !== "era" &&
      typeof value === "number"
    ) {
      result[field] = value;
    }

    if (
      field === "hour" &&
      (result.dayPeriod === null || result.dayPeriod === undefined) &&
      "hour" in placeholder
    ) {
      [result.dayPeriod] = toHourCycle(placeholder.hour, this.hourCycle);
    }

    if (field === "year" && (result.era === null || result.era === undefined)) {
      result.era = placeholder.era;
    }

    // clear offset when a date/time field changes since it may no longer be valid
    if (field !== "second" && field !== "literal" && field !== "timeZoneName") {
      result.offset = null;
    }

    return result;
  }
  /** Sets the given field to null. */
  clear(field: DateSegmentType): IncompleteDate {
    const result = this.copy();

    if (isEditableSegment(field)) {
      result[field] = null;
    }

    if (field === "year") {
      result.era = null;
    }

    // clear offset when a field is cleared since it may no longer be valid
    result.offset = null;

    return result;
  }
  /**
   * Increments or decrements the given field. If it is null, then it is set to the placeholder
   * value.
   */
  cycle(
    field: DateSegmentType,
    amount: number,
    placeholder: DateValue,
    displaySegments: DateSegmentType[]
  ): IncompleteDate {
    const res = this.copy();

    // If field is null, default to placeholder.
    if (!isEditableSegment(field)) {
      return res;
    }

    if (
      (res[field] === null || res[field] === undefined) &&
      field !== "dayPeriod" &&
      field !== "era"
    ) {
      this.initializeSegment(res, field, placeholder);

      return res;
    }

    switch (field) {
      case "era": {
        const eras = this.calendar.getEras();

        let index = eras.indexOf(
          requireValue(res.era, "Expected res.era to exist.")
        );

        index = cycleValue(index, amount, 0, eras.length - 1);
        res.era = eras[index] ?? null;
        break;
      }

      case "year": {
        // Use CalendarDate to cycle so that we update the era when going between 1 AD and 1 BC.
        let date = new CalendarDate(
          this.calendar,
          this.era ?? placeholder.era,
          this.year ?? placeholder.year,
          this.month ?? 1,
          this.day ?? 1
        );

        date = date.cycle(field, amount, { round: field === "year" });
        res.era = date.era;
        res.year = date.year;
        break;
      }

      case "month": {
        res.month = cycleValue(
          res.month ?? 1,
          amount,
          1,
          this.calendar.getMaximumMonthsInYear()
        );
        break;
      }

      case "day": {
        // Allow incrementing up to the maximum number of days in any month.
        res.day = cycleValue(
          res.day ?? 1,
          amount,
          1,
          this.calendar.getMaximumDaysInMonth()
        );
        break;
      }

      case "hour": {
        this.cycleHour(res, amount, placeholder, displaySegments);
        break;
      }

      case "dayPeriod": {
        res.dayPeriod = cycleValue(res.dayPeriod ?? 0, amount, 0, 1);
        break;
      }

      case "minute": {
        res.minute = cycleValue(res.minute ?? 0, amount, 0, 59, true);
        break;
      }

      case "second": {
        res.second = cycleValue(res.second ?? 0, amount, 0, 59, true);
        break;
      }

      default: {
        break;
      }
    }

    return res;
  }
  private initializeSegment(
    res: IncompleteDate,
    field: Exclude<
      DateSegmentType,
      "literal" | "timeZoneName" | "era" | "dayPeriod"
    >,
    placeholder: DateValue
  ): void {
    if (field === "hour" && "hour" in placeholder) {
      const [dayPeriod, hour] = toHourCycle(placeholder.hour, this.hourCycle);
      res.dayPeriod = dayPeriod;
      res.hour = hour;
    } else if (field in placeholder) {
      const fields: Partial<
        Pick<
          IncompleteDate,
          "year" | "month" | "day" | "hour" | "minute" | "second"
        >
      > = placeholder;

      res[field] = fields[field] ?? null;
    }

    if (field === "year" && (res.era === null || res.era === undefined)) {
      res.era = placeholder.era;
    }
  }
  private cycleHour(
    res: IncompleteDate,
    amount: number,
    placeholder: DateValue,
    displaySegments: DateSegmentType[]
  ): void {
    // if date is fully defined or it is just a time field, and we have a time zone, use toValue to get a ZonedDateTime to cycle
    // so DST fallback is properly handled
    const hasDateSegements = displaySegments.some((s) =>
      ["year", "month", "day"].includes(s)
    );

    if (
      "timeZone" in placeholder &&
      (!hasDateSegements ||
        (res.year !== null &&
          res.year !== undefined &&
          res.month !== null &&
          res.month !== undefined &&
          res.day !== null &&
          res.day !== undefined))
    ) {
      let date = this.toValue(placeholder);
      date = date.cycle("hour", amount, {
        hourCycle: this.hourCycle === "h12" ? 12 : 24,
        round: false,
      });

      const [dayPeriod, adjustedHour] = toHourCycle(date.hour, this.hourCycle);

      res.hour = adjustedHour;
      res.dayPeriod = dayPeriod;
      res.offset = date.offset;
    } else {
      const hours = res.hour ?? 0;

      const limits = requireValue(
        this.getSegmentLimits("hour"),
        "Hour segments must have limits."
      );

      res.hour = cycleValue(hours, amount, limits.minValue, limits.maxValue);

      if (
        (res.dayPeriod === null || res.dayPeriod === undefined) &&
        "hour" in placeholder
      ) {
        [res.dayPeriod] = toHourCycle(placeholder.hour, this.hourCycle);
      }
    }
  }

  /**
   * Converts the incomplete date to a full date value, using the provided value for any unset
   * fields.
   */
  toValue<T extends DateValue>(value: T): MappedDateValue<T>;
  toValue(value: DateValue): DateValue {
    const fields = {
      day: this.day ?? value.day,
      era: this.era ?? value.era,
      month: this.month ?? value.month,
      year: this.year ?? value.year,
    };

    if ("hour" in value) {
      let { hour } = this;

      if (hour !== null && hour !== undefined) {
        hour = fromHourCycle(hour, this.dayPeriod ?? 0, this.hourCycle);
      } else if (this.hourCycle === "h12" || this.hourCycle === "h11") {
        hour = this.dayPeriod === 1 ? 12 : 0;
      }

      let res = value.set({
        ...fields,
        hour: hour ?? value.hour,
        millisecond: this.millisecond ?? value.millisecond,
        minute: this.minute ?? value.minute,
        second: this.second ?? value.second,
      });

      if (
        "offset" in res &&
        this.offset !== null &&
        this.offset !== undefined &&
        res.offset !== this.offset
      ) {
        res = res.add({ milliseconds: res.offset - this.offset });
      }

      return res;
    }

    return value.set(fields);
  }
  getSegmentLimits(type: string):
    | {
        value: number | null;
        minValue: number;
        maxValue: number;
      }
    | undefined {
    switch (type) {
      case "era": {
        const eras = this.calendar.getEras();

        return {
          maxValue: eras.length - 1,
          minValue: 0,
          value:
            this.era === null || this.era === undefined
              ? eras.length - 1
              : eras.indexOf(this.era),
        };
      }

      case "year": {
        return {
          maxValue: 9999,
          minValue: 1,
          value: this.year,
        };
      }

      case "month": {
        return {
          maxValue: this.calendar.getMaximumMonthsInYear(),
          minValue: 1,
          value: this.month,
        };
      }

      case "day": {
        return {
          maxValue: this.calendar.getMaximumDaysInMonth(),
          minValue: 1,
          value: this.day,
        };
      }

      case "dayPeriod": {
        return {
          maxValue: 1,
          minValue: 0,
          value: this.dayPeriod,
        };
      }

      case "hour": {
        let minValue = 0;
        let maxValue = 23;

        if (this.hourCycle === "h12") {
          minValue = 1;
          maxValue = 12;
        } else if (this.hourCycle === "h11") {
          minValue = 0;
          maxValue = 11;
        }

        return {
          maxValue,
          minValue,
          value: this.hour,
        };
      }

      case "minute": {
        return {
          maxValue: 59,
          minValue: 0,
          value: this.minute,
        };
      }

      case "second": {
        return {
          maxValue: 59,
          minValue: 0,
          value: this.second,
        };
      }

      default: {
        break;
      }
    }

    return undefined;
  }
}

function cycleValue(
  initialValue: number,
  amount: number,
  min: number,
  max: number,
  round = false
) {
  let value = initialValue;

  if (round) {
    value += Math.sign(amount);

    if (value < min) {
      value = max;
    }

    const div = Math.abs(amount);

    value =
      amount > 0 ? Math.ceil(value / div) * div : Math.floor(value / div) * div;

    if (value > max) {
      value = min;
    }
  } else {
    value += amount;

    if (value < min) {
      value = max - (min - value - 1);
    } else if (value > max) {
      value = min + (value - max - 1);
    }
  }

  return value;
}

function toHourCycle(
  initialHour: number,
  hourCycle: HourCycle
): [number | null, number] {
  let hour = initialHour;

  let dayPeriod: number | null = hour >= 12 ? 1 : 0;

  switch (hourCycle) {
    case "h11": {
      // Hours are numbered from 0 to 11. Used in Japan.
      if (hour >= 12) {
        hour -= 12;
      }

      break;
    }

    case "h12": {
      // Hours are numbered from 12 (representing 0) to 11.
      if (hour === 0) {
        hour = 12;
      } else if (hour > 12) {
        hour -= 12;
      }

      break;
    }

    case "h23": {
      // 24 hour time, numbered 0 to 23.
      dayPeriod = null;
      break;
    }

    case "h24": {
      // 24 hour time numbered 24 to 23. Unused but supported by Intl.DateTimeFormat.
      hour += 1;
      dayPeriod = null;
      break;
    }

    default: {
      break;
    }
  }

  return [dayPeriod, hour];
}

function fromHourCycle(
  initialHour: number,
  dayPeriod: number,
  hourCycle: HourCycle
): number {
  let hour = initialHour;

  switch (hourCycle) {
    case "h11": {
      if (dayPeriod === 1) {
        hour += 12;
      }

      break;
    }

    case "h12": {
      if (hour === 12) {
        hour = 0;
      }

      if (dayPeriod === 1) {
        hour += 12;
      }

      break;
    }

    case "h24": {
      hour -= 1;
      break;
    }

    case "h23": {
      break;
    }

    default: {
      break;
    }
  }

  return hour;
}

function isEditableSegment(
  value: DateSegmentType
): value is Exclude<DateSegmentType, "literal" | "timeZoneName"> {
  return value !== "literal" && value !== "timeZoneName";
}

function getDateOffset(
  dateValue: Partial<Omit<AnyDateTime, "copy">> | null | undefined
): number | null {
  return dateValue &&
    "offset" in dateValue &&
    typeof dateValue.offset === "number"
    ? dateValue.offset
    : null;
}
