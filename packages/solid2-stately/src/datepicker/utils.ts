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
 * Derived from Adobe React Spectrum: packages/react-stately/src/datepicker/utils.ts.
 * Modified for Solid Aria: adapted reactive state, getters, imports, and APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import {
  DateFormatter,
  getLocalTimeZone,
  now,
  Time,
  toCalendar,
  toCalendarDate,
  toCalendarDateTime,
} from "@internationalized/date";
import type { Calendar } from "@internationalized/date";
import {
  LocalizedStringDictionary,
  LocalizedStringFormatter,
} from "@internationalized/string";
import type { RangeValue, ValidationResult } from "@solid2-aria/types-shared";
import { createMemo } from "solid-js";

import i18nMessages from "../../intl/datepicker/index";
import {
  mergeValidation,
  VALID_VALIDITY_STATE,
} from "../form/create-form-validation-state";
import type {
  DatePickerProps,
  DateValue,
  Granularity,
  TimeValue,
} from "./types";

const dictionary = new LocalizedStringDictionary(i18nMessages);

function getLocale() {
  // Match browser language setting here, NOT react-aria's I18nProvider, so that we match other browser-provided
  // validation messages, which to not respect our provider's language.
  let locale =
    (typeof navigator !== "undefined" &&
      (navigator.language ||
        ("userLanguage" in navigator ? String(navigator.userLanguage) : ""))) ||
    "en-US";

  try {
    Intl.DateTimeFormat.supportedLocalesOf([locale]);
  } catch {
    locale = "en-US";
  }

  return locale;
}

export function getValidationResult(
  value: DateValue | null,
  minValue: DateValue | null | undefined,
  maxValue: DateValue | null | undefined,
  isDateUnavailable: ((v: DateValue) => boolean) | undefined,
  options: FormatterOptions
): ValidationResult {
  const maximumComparison = compareDateBoundary(value, maxValue);
  const minimumComparison = compareDateBoundary(value, minValue);
  const rangeOverflow = maximumComparison !== null && maximumComparison > 0;
  const rangeUnderflow = minimumComparison !== null && minimumComparison < 0;

  const isUnavailable = (value !== null && isDateUnavailable?.(value)) ?? false;

  const isInvalid = rangeOverflow || rangeUnderflow || isUnavailable;
  const errors: string[] = [];

  if (isInvalid) {
    const locale = getLocale();

    const strings =
      LocalizedStringDictionary.getGlobalDictionaryForPackage(
        "@react-stately/datepicker"
      ) ?? dictionary;

    const formatter = new LocalizedStringFormatter(locale, strings);

    const dateFormatter = new DateFormatter(
      locale,
      getFormatOptions({}, options)
    );

    const { timeZone } = dateFormatter.resolvedOptions();

    if (rangeUnderflow && minValue !== null && minValue !== undefined) {
      errors.push(
        formatter.format("rangeUnderflow", {
          minValue: dateFormatter.format(minValue.toDate(timeZone)),
        })
      );
    }

    if (rangeOverflow && maxValue !== null && maxValue !== undefined) {
      errors.push(
        formatter.format("rangeOverflow", {
          maxValue: dateFormatter.format(maxValue.toDate(timeZone)),
        })
      );
    }

    if (isUnavailable) {
      errors.push(formatter.format("unavailableDate"));
    }
  }

  return {
    isInvalid,
    validationDetails: {
      badInput: isUnavailable,
      customError: false,
      patternMismatch: false,
      rangeOverflow,
      rangeUnderflow,
      stepMismatch: false,
      tooLong: false,
      tooShort: false,
      typeMismatch: false,
      valid: !isInvalid,
      valueMissing: false,
    },
    validationErrors: errors,
  };
}

export function getRangeValidationResult(
  value: RangeValue<DateValue | null> | null,
  minValue: DateValue | null | undefined,
  maxValue: DateValue | null | undefined,
  isDateUnavailable: ((v: DateValue) => boolean) | undefined,
  options: FormatterOptions
): ValidationResult {
  const startValidation = getValidationResult(
    value?.start ?? null,
    minValue,
    maxValue,
    isDateUnavailable,
    options
  );

  const endValidation = getValidationResult(
    value?.end ?? null,
    minValue,
    maxValue,
    isDateUnavailable,
    options
  );

  let result = mergeValidation(startValidation, endValidation);

  if (
    value?.end !== null &&
    value?.end !== undefined &&
    value.start !== null &&
    value.start !== undefined &&
    value.end.compare(value.start) < 0
  ) {
    const strings =
      LocalizedStringDictionary.getGlobalDictionaryForPackage(
        "@react-stately/datepicker"
      ) ?? dictionary;

    result = mergeValidation(result, {
      isInvalid: true,
      validationDetails: {
        // oxlint-disable-next-line typescript/no-misused-spread -- The DOM interface describes a plain object of validation flags here.
        ...VALID_VALIDITY_STATE,
        rangeOverflow: true,
        rangeUnderflow: true,
        valid: false,
      },
      validationErrors: [
        strings.getStringForLocale("rangeReversed", getLocale()),
      ],
    });
  }

  return result;
}

export type FieldOptions = Pick<
  Intl.DateTimeFormatOptions,
  "year" | "month" | "day" | "hour" | "minute" | "second"
>;

export interface FormatterOptions {
  timeZone?: string;
  hideTimeZone?: boolean;
  granularity?: DatePickerProps<DateValue>["granularity"];
  maxGranularity?: "year" | "month" | DatePickerProps<DateValue>["granularity"];
  hourCycle?: 12 | 24;
  showEra?: boolean;
  shouldForceLeadingZeros?: boolean;
}

const DEFAULT_FIELD_OPTIONS: FieldOptions = {
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  month: "numeric",
  second: "2-digit",
  year: "numeric",
};

const TWO_DIGIT_FIELD_OPTIONS: FieldOptions = {
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  month: "2-digit",
  second: "2-digit",
  year: "numeric",
};

export function getFormatOptions(
  initialFieldOptions: FieldOptions,
  options: FormatterOptions
): Intl.DateTimeFormatOptions {
  let fieldOptions = initialFieldOptions;

  const defaultFieldOptions =
    options.shouldForceLeadingZeros === true
      ? TWO_DIGIT_FIELD_OPTIONS
      : DEFAULT_FIELD_OPTIONS;

  fieldOptions = { ...defaultFieldOptions, ...fieldOptions };
  const granularity = options.granularity ?? "minute";

  const keys: (keyof FieldOptions)[] = [
    "year",
    "month",
    "day",
    "hour",
    "minute",
    "second",
  ];

  let startIdx = keys.indexOf(options.maxGranularity ?? "year");

  if (startIdx < 0) {
    startIdx = 0;
  }

  let endIdx = keys.indexOf(granularity);

  if (endIdx < 0) {
    endIdx = 2;
  }

  if (startIdx > endIdx) {
    throw new Error("maxGranularity must be greater than granularity");
  }

  const opts: Intl.DateTimeFormatOptions = {};

  for (const key of keys.slice(startIdx, endIdx + 1)) {
    Object.assign(opts, { [key]: fieldOptions[key] });
  }

  if (options.hourCycle !== null && options.hourCycle !== undefined) {
    opts.hour12 = options.hourCycle === 12;
  }

  opts.timeZone = options.timeZone ?? "UTC";

  const hasTime =
    granularity === "hour" ||
    granularity === "minute" ||
    granularity === "second";

  if (
    hasTime &&
    options.timeZone !== undefined &&
    options.timeZone !== "" &&
    !(options.hideTimeZone === true)
  ) {
    opts.timeZoneName = "short";
  }

  if (options.showEra === true && startIdx === 0) {
    opts.era = "short";
  }

  return opts;
}

export function getPlaceholderTime(
  placeholderValue: DateValue | null | undefined
): TimeValue {
  if (placeholderValue && "hour" in placeholderValue) {
    return placeholderValue;
  }

  return new Time();
}

export function convertValue(
  value: DateValue | null | undefined,
  calendar: Calendar
): DateValue | null | undefined {
  if (value === null) {
    return null;
  }

  if (!value) {
    return undefined;
  }

  return toCalendar(value, calendar);
}

export function createPlaceholderDate(
  placeholderValue: DateValue | null | undefined,
  granularity: string,
  calendar: Calendar,
  timeZone: string | undefined
): DateValue {
  if (placeholderValue) {
    return toCalendar(placeholderValue, calendar);
  }

  const date = toCalendar(
    now(timeZone ?? getLocalTimeZone()).set({
      hour: 0,
      millisecond: 0,
      minute: 0,
      second: 0,
    }),
    calendar
  );

  if (
    granularity === "year" ||
    granularity === "month" ||
    granularity === "day"
  ) {
    return toCalendarDate(date);
  }

  if (timeZone === undefined || timeZone === "") {
    return toCalendarDateTime(date);
  }

  return date;
}

export function createDefaultProps(
  value: () => DateValue | null,
  granularity: () => Granularity | undefined
): () => [Granularity, string | undefined] {
  let last: [Granularity, string | undefined] = ["day", undefined];

  return createMemo(() => {
    const v = value();
    const requested = granularity();

    if (v && requested && !(requested in v)) {
      throw new Error(
        `Invalid granularity ${requested} for value ${v.toString()}`
      );
    }

    if (v) {
      last = [
        "minute" in v ? "minute" : "day",
        "timeZone" in v ? v.timeZone : undefined,
      ];
    }

    return [requested ?? last[0], last[1]];
  });
}

function compareDateBoundary(
  value: DateValue | null,
  boundary: DateValue | null | undefined
): number | null {
  return value !== null && boundary !== null && boundary !== undefined
    ? value.compare(boundary)
    : null;
}
