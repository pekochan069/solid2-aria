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
 * Derived from Adobe React Spectrum: packages/react-stately/src/datepicker/useDateFieldState.ts.
 * Modified for Solid Aria: adapted reactive state, getters, imports, and APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import {
  DateFormatter,
  GregorianCalendar,
  isEqualCalendar,
  toCalendar,
} from "@internationalized/date";
import type { Calendar, CalendarIdentifier } from "@internationalized/date";
import { NumberFormatter } from "@internationalized/number";
import type { ValidationState } from "@solid2-aria/types-shared";
import {
  createMemo,
  createSignal,
  createRenderEffect,
  untrack,
  merge,
} from "solid-js";

import { createFormValidationState } from "../form/create-form-validation-state";
import type { FormValidationState } from "../form/create-form-validation-state";
import { createControlledSignal } from "../utils/create-controlled-signal";
import { getLegacyValidationState } from "../utils/legacy-props";
import { parseCalendarIdentifier } from "../utils/parse-calendar-identifier";
import { requireValue } from "../utils/require-value";
import { IncompleteDate } from "./incomplete-date";
import { getPlaceholder } from "./placeholders";
import type {
  DatePickerProps,
  DateValue,
  Granularity,
  MappedDateValue,
} from "./types";
import {
  convertValue,
  createPlaceholderDate,
  getFormatOptions,
  getValidationResult,
  createDefaultProps,
} from "./utils";
import type { FieldOptions, FormatterOptions } from "./utils";

export type DateSegmentType =
  | "era"
  | "year"
  | "month"
  | "day"
  | "hour"
  | "minute"
  | "second"
  | "dayPeriod"
  | "literal"
  | "timeZoneName";

export interface DateSegment {
  /** The type of segment. */
  type: DateSegmentType;
  /** The formatted text for the segment. */
  text: string;
  /** The numeric value for the segment, if applicable. */
  value?: number | null;
  /** The minimum numeric value for the segment, if applicable. */
  minValue?: number;
  /** The maximum numeric value for the segment, if applicable. */
  maxValue?: number;
  /** Whether the value is a placeholder. */
  isPlaceholder: boolean;
  /** A placeholder string for the segment. */
  placeholder: string;
  /** Whether the segment is editable. */
  isEditable: boolean;
}

export interface DateFieldState extends FormValidationState {
  /** The current field value. */
  value: DateValue | null;
  /** The default field value. */
  defaultValue: DateValue | null;
  /** The current value, converted to a native JavaScript `Date` object. */
  dateValue: Date;
  /** The calendar system currently in use. */
  calendar: Calendar;
  /** Sets the field's value. */
  setValue: (value: DateValue | null) => void;
  /** A list of segments for the current value. */
  segments: DateSegment[];
  /** A date formatter configured for the current locale and format. */
  dateFormatter: DateFormatter;
  /**
   * The current validation state of the date field, based on the `validationState`, `minValue`, and
   * `maxValue` props.
   *
   * @deprecated Use `isInvalid` instead.
   */
  validationState: ValidationState | null;
  /** Whether the date field is invalid, based on the `isInvalid`, `minValue`, and `maxValue` props. */
  isInvalid: boolean;
  /** The granularity for the field, based on the `granularity` prop and current value. */
  granularity: Granularity;
  /** The maximum date or time unit that is displayed in the field. */
  maxGranularity: "year" | "month" | Granularity;
  /** Whether the field is disabled. */
  isDisabled: boolean;
  /** Whether the field is read only. */
  isReadOnly: boolean;
  /** Whether the field is required. */
  isRequired: boolean;
  /**
   * Increments the given segment. Upon reaching the minimum or maximum value, the value wraps
   * around to the opposite limit.
   */
  increment: (type: DateSegmentType) => void;
  /**
   * Decrements the given segment. Upon reaching the minimum or maximum value, the value wraps
   * around to the opposite limit.
   */
  decrement: (type: DateSegmentType) => void;
  /**
   * Increments the given segment by a larger amount, rounding it to the nearest increment.
   * The amount to increment by depends on the field, for example 15 minutes, 7 days, and 5 years.
   * Upon reaching the minimum or maximum value, the value wraps around to the opposite limit.
   */
  incrementPage: (type: DateSegmentType) => void;
  /**
   * Decrements the given segment by a larger amount, rounding it to the nearest increment.
   * The amount to decrement by depends on the field, for example 15 minutes, 7 days, and 5 years.
   * Upon reaching the minimum or maximum value, the value wraps around to the opposite limit.
   */
  decrementPage: (type: DateSegmentType) => void;
  /** Increments the given segment to its maxiumum value. */
  incrementToMax: (type: DateSegmentType) => void;
  /** Decrements the given segment to its minimum value. */
  decrementToMin: (type: DateSegmentType) => void;
  /** Sets the value of the given segment. */
  setSegment: {
    (type: "era", value: string): void;
    (type: DateSegmentType, value: number): void;
  };
  /** Updates the remaining unfilled segments with the placeholder value. */
  confirmPlaceholder: () => void;
  /** Clears the value of the given segment, reverting it to the placeholder. */
  clearSegment: (type: DateSegmentType) => void;
  /** Formats the current date value using the given options. */
  formatValue: (fieldOptions: FieldOptions) => string;
  /** Gets a formatter based on state's props. */
  getDateFormatter: (
    locale: string,
    formatOptions: FormatterOptions
  ) => DateFormatter;
}

const EDITABLE_SEGMENTS = {
  day: true,
  dayPeriod: true,
  era: true,
  hour: true,
  minute: true,
  month: true,
  second: true,
  year: true,
};

const PAGE_STEP: Partial<Record<DateSegmentType, number>> = {
  day: 7,
  hour: 2,
  minute: 15,
  month: 2,
  second: 15,
  year: 5,
};

export interface DateFieldStateOptions<
  T extends DateValue = DateValue,
> extends DatePickerProps<T> {
  /**
   * The maximum unit to display in the date field.
   *
   * @default 'year'
   */
  maxGranularity?: "year" | "month" | Granularity;
  /** The locale to display and edit the value according to. */
  locale: string;
  /**
   * A function that creates a [Calendar](../internationalized/date/Calendar.html)
   * object for a given calendar identifier. Such a function may be imported from the
   * `@internationalized/date` package, or manually implemented to include support for
   * only certain calendars.
   */
  createCalendar: (name: CalendarIdentifier) => Calendar;
}

/**
 * Provides state management for a date field component.
 * A date field allows users to enter and edit date and time values using a keyboard.
 * Each part of a date value is displayed in an individually editable segment.
 */
export function createDateFieldState<T extends DateValue = DateValue>(
  props: DateFieldStateOptions<T>
): DateFieldState {
  const locale = createMemo(() => props.locale);
  const createCalendar = createMemo(() => props.createCalendar);
  const hideTimeZone = createMemo(() => props.hideTimeZone);
  const isDisabled = createMemo(() => props.isDisabled ?? false);
  const isReadOnly = createMemo(() => props.isReadOnly ?? false);
  const isRequired = createMemo(() => props.isRequired ?? false);
  const minValue = createMemo(() => props.minValue);
  const maxValue = createMemo(() => props.maxValue);
  const isDateUnavailable = createMemo(() => props.isDateUnavailable);

  const v = createMemo(
    () => props.value ?? props.defaultValue ?? props.placeholderValue ?? null
  );

  const derived1 = createDefaultProps(v, () => props.granularity);

  const granularity = createMemo(() => {
    const [currentGranularity] = derived1();
    const currentValue = v();

    if (currentValue && !(currentGranularity in currentValue)) {
      throw new Error(
        `Invalid granularity ${currentGranularity} for value ${currentValue.toString()}`
      );
    }

    return currentGranularity;
  });

  const defaultTimeZone = createMemo(() => {
    const currentDerived1 = derived1();

    return currentDerived1[1];
  });

  const timeZone = createMemo(() => {
    const currentDefaultTimeZone = defaultTimeZone();

    return currentDefaultTimeZone ?? "UTC";
  });

  // Resolve default hour cycle and calendar system.
  const derived2 = createMemo(() => {
    const currentLocale = locale();
    const currentCreateCalendar = createCalendar();

    const formatter = new DateFormatter(currentLocale, {
      dateStyle: "short",
      hour12:
        props.hourCycle !== null && props.hourCycle !== undefined
          ? props.hourCycle === 12
          : undefined,
      timeStyle: "short",
    });

    const opts = formatter.resolvedOptions();

    const calendar = currentCreateCalendar(
      parseCalendarIdentifier(opts.calendar)
    );

    return [calendar, opts.hourCycle] as const;
  });

  // Resolve default hour cycle and calendar system.
  const calendar = createMemo(() => {
    const currentDerived2 = derived2();

    return currentDerived2[0];
  });

  // Resolve default hour cycle and calendar system.
  const hourCycle = createMemo(() => {
    const currentDerived2 = derived2();

    return currentDerived2[1];
  });

  const [value, setDate] = createControlledSignal<DateValue | null>(
    () => props.value,
    untrack(() => props.defaultValue ?? null),
    // SAFETY: Date edits preserve the input date/time class; the mapped generic callback widens subclasses to that class.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    (localValue) => props.onChange?.(localValue as MappedDateValue<T> | null)
  );

  const initialValue = untrack(() => value());

  const calendarValue = createMemo(() => {
    const currentValue = value();
    const currentCalendar = calendar();

    return convertValue(currentValue, currentCalendar) ?? null;
  });

  const [displayValue, setDisplayValue] = createSignal(
    untrack(() =>
      (() => {
        const currentCalendar = calendar();
        const currentHourCycle = hourCycle();
        const currentCalendarValue = calendarValue();

        return new IncompleteDate(
          currentCalendar,
          currentHourCycle ?? "h23",
          currentCalendarValue
        );
      })()
    ),
    { ownedWrite: true }
  );

  const showEra = createMemo(() => {
    const currentCalendar = calendar();
    const currentDisplayValue = displayValue();

    return (
      currentCalendar.identifier === "gregory" &&
      currentDisplayValue.era === "BC"
    );
  });

  const formatOpts = createMemo(() => {
    const currentGranularity = granularity();
    const currentDefaultTimeZone = defaultTimeZone();
    const currentHideTimeZone = hideTimeZone();
    const currentShowEra = showEra();

    return {
      granularity: currentGranularity,
      hideTimeZone: currentHideTimeZone,
      hourCycle: props.hourCycle,
      maxGranularity: props.maxGranularity ?? "year",
      shouldForceLeadingZeros: props.shouldForceLeadingZeros,
      showEra: currentShowEra,
      timeZone: currentDefaultTimeZone,
    };
  });

  const opts = createMemo(() => {
    const currentFormatOpts = formatOpts();

    return getFormatOptions({}, currentFormatOpts);
  });

  const dateFormatter = createMemo(() => {
    const currentLocale = locale();
    const currentOpts = opts();

    return new DateFormatter(currentLocale, currentOpts);
  });

  const resolvedOptions = createMemo(() => {
    const currentDateFormatter = dateFormatter();

    return currentDateFormatter.resolvedOptions();
  });

  const placeholder = createMemo(() => {
    const currentGranularity = granularity();
    const currentCalendar = calendar();
    const currentDefaultTimeZone = defaultTimeZone();

    return createPlaceholderDate(
      props.placeholderValue,
      currentGranularity,
      currentCalendar,
      currentDefaultTimeZone
    );
  });

  const displaySegments = createMemo(() => {
    const currentHourCycle = hourCycle();
    const currentGranularity = granularity();

    const is12HourClock =
      currentHourCycle === "h11" || currentHourCycle === "h12";

    const segments: DateSegmentType[] = [
      "era",
      "year",
      "month",
      "day",
      "hour",
      ...(is12HourClock ? ["dayPeriod" as const] : []),
      "minute",
      "second",
    ];

    const minIndex = segments.indexOf(props.maxGranularity ?? "era");

    const maxIndex = segments.indexOf(
      currentGranularity === "hour" && is12HourClock
        ? "dayPeriod"
        : currentGranularity
    );

    return segments.slice(minIndex, maxIndex + 1);
  });

  const [lastValue, setLastValue] = createSignal(
    untrack(() => calendarValue()),
    { ownedWrite: true }
  );

  const [lastCalendar, setLastCalendar] = createSignal(
    untrack(() => calendar()),
    { ownedWrite: true }
  );

  const [lastHourCycle, setLastHourCycle] = createSignal(
    untrack(() => hourCycle()),
    { ownedWrite: true }
  );

  createRenderEffect(
    () => ({
      currentCalendar: calendar(),
      currentCalendarValue: calendarValue(),
      currentHourCycle: hourCycle(),
      currentLastCalendar: lastCalendar(),
      currentLastHourCycle: lastHourCycle(),
      currentLastValue: lastValue(),
    }),
    ({
      currentCalendarValue,
      currentLastValue,
      currentHourCycle,
      currentLastHourCycle,
      currentCalendar,
      currentLastCalendar,
    }) => {
      if (
        currentCalendarValue !== currentLastValue ||
        currentHourCycle !== currentLastHourCycle ||
        !isEqualCalendar(currentCalendar, currentLastCalendar)
      ) {
        setDisplayValue(
          new IncompleteDate(
            currentCalendar,
            currentHourCycle ?? "h23",
            currentCalendarValue
          )
        );
        setLastValue(currentCalendarValue);
        setLastCalendar(currentCalendar);
        setLastHourCycle(currentHourCycle);
      }
    }
  );

  const setValue = (initialNewValue: DateValue | IncompleteDate | null) => {
    let newValue = initialNewValue;

    const currentDisplaySegments = displaySegments();
    const currentCalendar = calendar();
    const currentHourCycle = hourCycle();
    const currentCalendarValue = calendarValue();
    const currentV = v();
    const currentPlaceholder = placeholder();
    const currentValue = value();

    if (props.isDisabled === true || props.isReadOnly === true) {
      return;
    }

    if (
      newValue === null ||
      newValue === undefined ||
      (newValue instanceof IncompleteDate &&
        newValue.isCleared(currentDisplaySegments))
    ) {
      setDisplayValue(
        new IncompleteDate(
          currentCalendar,
          currentHourCycle ?? "h23",
          currentCalendarValue
        )
      );
      setDate(null);
    } else if (newValue instanceof IncompleteDate) {
      // If the new value is complete and valid, trigger onChange eagerly.
      // If it represents an incomplete or invalid value (e.g. February 30th),
      // wait until the field is blurred to trigger onChange.
      if (newValue.isComplete(currentDisplaySegments)) {
        const dateValue = newValue.toValue(
          currentCalendarValue ?? currentPlaceholder
        );

        if (newValue.validate(dateValue, currentDisplaySegments)) {
          const newDateValue = toCalendar(
            dateValue,
            currentV?.calendar ?? new GregorianCalendar()
          );

          if (!currentValue || newDateValue.compare(currentValue) !== 0) {
            setDisplayValue(
              new IncompleteDate(
                currentCalendar,
                currentHourCycle ?? "h23",
                currentCalendarValue
              )
              // reset in case prop isn't updated
            );
            setDate(newDateValue);

            return;
          }
        }
      }

      // Incomplete/invalid value. Set temporary display override.
      setDisplayValue(newValue);
    } else {
      // The display calendar should not have any effect on the emitted value.
      // Emit dates in the same calendar as the original value, if any, otherwise gregorian.
      newValue = toCalendar(
        newValue,
        currentV?.calendar ?? new GregorianCalendar()
      );
      setDisplayValue(
        new IncompleteDate(
          currentCalendar,
          currentHourCycle ?? "h23",
          currentCalendarValue
        )
      );
      setDate(newValue);
    }
  };

  const dateValue = createMemo(() => {
    const currentDisplayValue = displayValue();
    const currentCalendarValue = calendarValue();
    const currentPlaceholder = placeholder();
    const currentTimeZone = timeZone();

    const localV = currentDisplayValue.toValue(
      currentCalendarValue ?? currentPlaceholder
    );

    return localV.toDate(currentTimeZone);
  });

  const segments = createMemo(() => {
    const currentDateValue = dateValue();
    const currentDisplayValue = displayValue();
    const currentDateFormatter = dateFormatter();
    const currentResolvedOptions = resolvedOptions();
    const currentCalendar = calendar();
    const currentLocale = locale();
    const currentGranularity = granularity();

    return processSegments(
      currentDateValue,
      currentDisplayValue,
      currentDateFormatter,
      currentResolvedOptions,
      currentCalendar,
      currentLocale,
      currentGranularity
    );
  });

  const adjustSegment = (type: DateSegmentType, amount: number) => {
    const currentDisplayValue = displayValue();
    const currentPlaceholder = placeholder();
    const currentDisplaySegments = displaySegments();
    setValue(
      currentDisplayValue.cycle(
        type,
        amount,
        currentPlaceholder,
        currentDisplaySegments
      )
    );
  };

  const builtinValidation = createMemo(() => {
    const currentValue = value();
    const currentMinValue = minValue();
    const currentMaxValue = maxValue();
    const currentIsDateUnavailable = isDateUnavailable();
    const currentFormatOpts = formatOpts();

    return getValidationResult(
      currentValue,
      currentMinValue,
      currentMaxValue,
      currentIsDateUnavailable,
      currentFormatOpts
    );
  });

  const validation = createFormValidationState<DateValue>(
    merge(props, {
      get builtinValidation() {
        return builtinValidation();
      },
      validate: (localValue: DateValue) =>
        // SAFETY: Date edits preserve the input date/time class; the mapped generic callback widens subclasses to that class.
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion
        props.validate?.(localValue as MappedDateValue<T>),
      get value() {
        return value();
      },
    })
  );

  const isValueInvalid = createMemo(
    () => validation.displayValidation.isInvalid
  );

  const validationState = createMemo(() => {
    const currentIsValueInvalid = isValueInvalid();

    return (
      getLegacyValidationState(props) ??
      (currentIsValueInvalid ? "invalid" : null)
    );
  });

  return merge(validation, {
    get calendar() {
      return calendar();
    },
    clearSegment(part) {
      const currentDisplayValue = displayValue();
      let localValue = currentDisplayValue;

      if (part !== "timeZoneName" && part !== "literal") {
        localValue = currentDisplayValue.clear(part);
      }

      setValue(localValue);
    },
    confirmPlaceholder() {
      const currentDisplayValue = displayValue();
      const currentDisplaySegments = displaySegments();
      const currentCalendarValue = calendarValue();
      const currentPlaceholder = placeholder();
      const currentV = v();
      const currentValue = value();
      const currentCalendar = calendar();
      const currentHourCycle = hourCycle();

      if (props.isDisabled === true || props.isReadOnly === true) {
        return;
      }

      // If the display value is complete but invalid, we need to constrain it and emit onChange on blur.
      if (currentDisplayValue.isComplete(currentDisplaySegments)) {
        const localDateValue = currentDisplayValue.toValue(
          currentCalendarValue ?? currentPlaceholder
        );

        const newDateValue = toCalendar(
          localDateValue,
          currentV?.calendar ?? new GregorianCalendar()
        );

        if (!currentValue || newDateValue.compare(currentValue) !== 0) {
          setDate(newDateValue);
        }

        setDisplayValue(
          new IncompleteDate(
            currentCalendar,
            currentHourCycle ?? "h23",
            currentCalendarValue
          )
        );
      }
    },
    get dateFormatter() {
      return dateFormatter();
    },
    get dateValue() {
      return dateValue();
    },
    decrement(part) {
      adjustSegment(part, -1);
    },
    decrementPage(part) {
      adjustSegment(part, -(PAGE_STEP[part] ?? 1));
    },
    decrementToMin(part) {
      const currentHourCycle = hourCycle();
      const currentDisplayValue = displayValue();
      const currentPlaceholder = placeholder();

      const localMinValue =
        part === "hour" && currentHourCycle === "h12"
          ? 12
          : requireValue(
              currentDisplayValue.getSegmentLimits(part),
              "Expected currentDisplayValue.getSegmentLimits(part) to exist."
            ).minValue;

      setValue(
        currentDisplayValue.set(part, localMinValue, currentPlaceholder)
      );
    },
    get defaultValue() {
      return props.defaultValue ?? initialValue;
    },
    formatValue(fieldOptions: FieldOptions) {
      const currentCalendarValue = calendarValue();
      const currentFormatOpts = formatOpts();
      const currentLocale = locale();
      const currentDateValue = dateValue();

      if (!currentCalendarValue) {
        return "";
      }

      const formatOptions = getFormatOptions(fieldOptions, currentFormatOpts);
      const formatter = new DateFormatter(currentLocale, formatOptions);

      return formatter.format(currentDateValue);
    },
    getDateFormatter(localLocale, formatOptions: FormatterOptions) {
      const currentFormatOpts = formatOpts();
      const newOptions = { ...currentFormatOpts, ...formatOptions };
      const newFormatOptions = getFormatOptions({}, newOptions);

      return new DateFormatter(localLocale, newFormatOptions);
    },
    get granularity() {
      return granularity();
    },
    increment(part) {
      adjustSegment(part, 1);
    },
    incrementPage(part) {
      adjustSegment(part, PAGE_STEP[part] ?? 1);
    },
    incrementToMax(part) {
      const currentHourCycle = hourCycle();
      const currentDisplayValue = displayValue();
      const currentPlaceholder = placeholder();

      const localMaxValue =
        part === "hour" && currentHourCycle === "h12"
          ? 11
          : requireValue(
              currentDisplayValue.getSegmentLimits(part),
              "Expected currentDisplayValue.getSegmentLimits(part) to exist."
            ).maxValue;

      setValue(
        currentDisplayValue.set(part, localMaxValue, currentPlaceholder)
      );
    },
    get isDisabled() {
      return isDisabled();
    },
    get isInvalid() {
      return isValueInvalid();
    },
    get isReadOnly() {
      return isReadOnly();
    },
    get isRequired() {
      return isRequired();
    },
    get maxGranularity() {
      return props.maxGranularity ?? "year";
    },
    get segments() {
      return segments();
    },
    setSegment(part, localV: string | number) {
      const currentDisplayValue = displayValue();
      const currentPlaceholder = placeholder();
      setValue(currentDisplayValue.set(part, localV, currentPlaceholder));
    },
    setValue,
    // oxlint-disable-next-line typescript/no-deprecated -- Expose the legacy output alias for existing consumers; internal state uses its modern replacement.
    get validationState() {
      return validationState();
    },
    get value() {
      return calendarValue();
    },
  } satisfies Partial<DateFieldState>);
}

function processSegments(
  dateValue: Date,
  displayValue: IncompleteDate,
  dateFormatter: Intl.DateTimeFormat,
  resolvedOptions: Intl.ResolvedDateTimeFormatOptions,
  calendar: Calendar,
  locale: string,
  granularity: Granularity
): DateSegment[] {
  const timeValue = new Set(["hour", "minute", "second"]);
  const segments = dateFormatter.formatToParts(dateValue);
  formatNumericSegments(segments, displayValue, resolvedOptions, locale);
  const processedSegments: DateSegment[] = [];

  for (const segment of segments) {
    const mapped = mapDateSegmentType(segment.type);

    const type = isDateSegmentType(mapped) ? mapped : "literal";
    let isEditable = type in EDITABLE_SEGMENTS;

    if (type === "era" && calendar.getEras().length === 1) {
      isEditable = false;
    }

    const isPlaceholder =
      type !== "literal" &&
      type !== "timeZoneName" &&
      (displayValue[type] === null || displayValue[type] === undefined);

    const placeholder =
      type in EDITABLE_SEGMENTS
        ? getPlaceholder(type, segment.value, locale)
        : null;

    const dateSegment: DateSegment = {
      text: isPlaceholder ? (placeholder ?? "") : segment.value,
      type,
      ...displayValue.getSegmentLimits(type),
      isEditable,
      isPlaceholder,
      placeholder: placeholder ?? "",
    };

    // There is an issue in RTL languages where time fields render (minute:hour) instead of (hour:minute).
    // To force an LTR direction on the time field since, we wrap the time segments in LRI (left-to-right) isolate unicode. See https://www.w3.org/International/questions/qa-bidi-unicode-controls.
    // These unicode characters will be added to the array of processed segments as literals and will mark the start and end of the embedded direction change.
    if (type === "hour") {
      // This marks the start of the embedded direction change.
      processedSegments.push(
        {
          isEditable: false,
          isPlaceholder: false,
          placeholder: "",
          text: "\u2066",
          type: "literal",
        },
        dateSegment
      );

      // This marks the end of the embedded direction change in the case that the granularity it set to "hour".
      if (type === granularity) {
        processedSegments.push({
          isEditable: false,
          isPlaceholder: false,
          placeholder: "",
          text: "\u2069",
          type: "literal",
        });
      }
    } else if (timeValue.has(type) && type === granularity) {
      // This marks the end of the embedded direction change.
      processedSegments.push(dateSegment, {
        isEditable: false,
        isPlaceholder: false,
        placeholder: "",
        text: "\u2069",
        type: "literal",
      });
    } else {
      // We only want to "wrap" the unicode around segments that are hour, minute, or second. If they aren't, just process as normal.
      processedSegments.push(dateSegment);
    }
  }

  return processedSegments;
}

function isDateSegmentType(value: string): value is DateSegmentType {
  return [
    "era",
    "year",
    "month",
    "day",
    "hour",
    "minute",
    "second",
    "dayPeriod",
    "timeZoneName",
    "literal",
  ].includes(value);
}

function mapDateSegmentType(type: string): string {
  switch (type) {
    case "dayperiod": {
      return "dayPeriod";
    }

    case "relatedYear":
    case "yearName": {
      return "year";
    }

    case "unknown": {
      return "literal";
    }

    default: {
      return type;
    }
  }
}

function formatNumericSegments(
  segments: Intl.DateTimeFormatPart[],
  displayValue: IncompleteDate,
  resolvedOptions: Intl.ResolvedDateTimeFormatOptions,
  locale: string
): void {
  // In order to allow formatting temporarily invalid dates during editing (e.g. February 30th),
  // use a NumberFormatter to manually format segments directly from raw numbers.
  // When the user blurs the date field, the invalid segments will be constrained.
  const numberFormatter = new NumberFormatter(locale, { useGrouping: false });

  const twoDigitFormatter = new NumberFormatter(locale, {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });

  for (const segment of segments) {
    if (
      segment.type === "year" ||
      segment.type === "month" ||
      segment.type === "day" ||
      segment.type === "hour"
    ) {
      const value = displayValue[segment.type] ?? 0;

      segment.value =
        resolvedOptions[segment.type] === "2-digit"
          ? twoDigitFormatter.format(value)
          : numberFormatter.format(value);
    }
  }
}
