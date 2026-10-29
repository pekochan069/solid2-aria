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
 * Derived from Adobe React Spectrum: packages/react-stately/src/datepicker/useDateRangePickerState.ts.
 * Modified for Solid Aria: adapted reactive state, getters, imports, and APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import {
  DateFormatter,
  toCalendarDate,
  toCalendarDateTime,
} from "@internationalized/date";
import type { RangeValue, ValidationState } from "@solid2-aria/types-shared";
import {
  createMemo,
  createSignal,
  createRenderEffect,
  untrack,
  merge,
} from "solid-js";

import { createFormValidationState } from "../form/create-form-validation-state";
import type { FormValidationState } from "../form/create-form-validation-state";
import { createOverlayTriggerState } from "../overlays/create-overlay-trigger-state";
import type { OverlayTriggerState } from "../overlays/create-overlay-trigger-state";
import { createControlledSignal } from "../utils/create-controlled-signal";
import { getLegacyValidationState } from "../utils/legacy-props";
import type {
  DateRange,
  DateRangePickerProps,
  DateValue,
  Granularity,
  MappedDateValue,
  TimeValue,
} from "./types";
import {
  getFormatOptions,
  getPlaceholderTime,
  getRangeValidationResult,
  createDefaultProps,
} from "./utils";
import type { FieldOptions, FormatterOptions } from "./utils";

export interface DateRangePickerStateOptions<
  T extends DateValue = DateValue,
> extends DateRangePickerProps<T> {
  /**
   * Determines whether the date picker popover should close automatically when a date is selected.
   *
   * @default true
   */
  shouldCloseOnSelect?: boolean | (() => boolean);
}

type TimeRange = RangeValue<TimeValue>;

export interface DateRangePickerState
  extends OverlayTriggerState, FormValidationState {
  /** The currently selected date range. */
  value: RangeValue<DateValue | null>;
  /** The default selected date range. */
  defaultValue: DateRange | null;
  /** Sets the selected date range. */
  setValue: (value: DateRange | null) => void;
  /**
   * The date portion of the selected range. This may be set prior to `value` if the user has
   * selected a date range but has not yet selected a time range.
   */
  dateRange: RangeValue<DateValue | null> | null;
  /** Sets the date portion of the selected range. */
  setDateRange: (value: DateRange) => void;
  /**
   * The time portion of the selected range. This may be set prior to `value` if the user has
   * selected a time range but has not yet selected a date range.
   */
  timeRange: RangeValue<TimeValue | null> | null;
  /** Sets the time portion of the selected range. */
  setTimeRange: (value: TimeRange) => void;
  /** Sets the date portion of either the start or end of the selected range. */
  setDate: (part: "start" | "end", value: DateValue | null) => void;
  /** Sets the time portion of either the start or end of the selected range. */
  setTime: (part: "start" | "end", value: TimeValue | null) => void;
  /** Sets the date and time of either the start or end of the selected range. */
  setDateTime: (part: "start" | "end", value: DateValue | null) => void;
  /** The granularity for the field, based on the `granularity` prop and current value. */
  granularity: Granularity;
  /**
   * Whether the date range picker supports selecting times, according to the `granularity` prop and
   * current value.
   */
  hasTime: boolean;
  /** Whether the calendar popover is currently open. */
  isOpen: boolean;
  /** Sets whether the calendar popover is open. */
  setOpen: (isOpen: boolean) => void;
  /**
   * The current validation state of the date range picker, based on the `validationState`,
   * `minValue`, and `maxValue` props.
   *
   * @deprecated Use `isInvalid` instead.
   */
  validationState: ValidationState | null;
  /**
   * Whether the date range picker is invalid, based on the `isInvalid`, `minValue`, and `maxValue`
   * props.
   */
  isInvalid: boolean;
  /** Formats the selected range using the given options. */
  formatValue: (
    locale: string,
    fieldOptions: FieldOptions
  ) => {
    start: string;
    end: string;
  } | null;
  /** Gets a formatter based on state's props. */
  getDateFormatter: (
    locale: string,
    formatOptions: FormatterOptions
  ) => DateFormatter;
}

/**
 * Provides state management for a date range picker component.
 * A date range picker combines two DateFields and a RangeCalendar popover to allow
 * users to enter or select a date and time range.
 */
export function createDateRangePickerState<T extends DateValue = DateValue>(
  props: DateRangePickerStateOptions<T>
): DateRangePickerState {
  const overlayState = createOverlayTriggerState(props);

  const [controlledValue, setControlledValue] =
    createControlledSignal<DateRange | null>(
      () => props.value,
      untrack(() => props.defaultValue ?? null),
      (value) =>
        // SAFETY: Date edits preserve the input date/time class; the mapped generic callback widens subclasses to that class.
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion
        props.onChange?.(value as RangeValue<MappedDateValue<T>> | null)
    );

  const initialValue = untrack(() => controlledValue());

  const [placeholderValue, setPlaceholderValue] = createSignal<
    RangeValue<DateValue | null>
  >(
    untrack(() =>
      (() => {
        const currentControlledValue = controlledValue();

        return currentControlledValue ?? { end: null, start: null };
      })()
    ),
    { ownedWrite: true }
  );

  createRenderEffect(
    () => ({
      controlled: controlledValue(),
      placeholder: placeholderValue(),
    }),
    ({ controlled, placeholder }) => {
      if (!controlled && placeholder.start && placeholder.end) {
        setPlaceholderValue({ end: null, start: null });
      }
    }
  );

  const value = createMemo(() => {
    const currentControlledValue = controlledValue();
    const currentPlaceholderValue = placeholderValue();

    return currentControlledValue ?? currentPlaceholderValue;
  });

  const setValue = (newValue: RangeValue<DateValue | null> | null) => {
    const currentValue = newValue ?? { end: null, start: null };
    setPlaceholderValue(currentValue);

    if (isCompleteRange(currentValue)) {
      setControlledValue(currentValue);
    } else {
      setControlledValue(null);
    }
  };

  const v = createMemo(() => {
    const currentValue = value();

    return (
      currentValue?.start ?? currentValue?.end ?? props.placeholderValue ?? null
    );
  });

  const derived0 = createDefaultProps(v, () => props.granularity);

  const granularity = createMemo(() => {
    const currentDerived0 = derived0();

    return currentDerived0[0];
  });

  const defaultTimeZone = createMemo(() => {
    const currentDerived0 = derived0();

    return currentDerived0[1];
  });

  const hasTime = createMemo(() => {
    const currentGranularity = granularity();

    return (
      currentGranularity === "hour" ||
      currentGranularity === "minute" ||
      currentGranularity === "second"
    );
  });

  const shouldCloseOnSelect = createMemo(
    () => props.shouldCloseOnSelect ?? true
  );

  const [dateRange, setSelectedDateRange] =
    createSignal<RangeValue<DateValue | null> | null>(null, {
      ownedWrite: true,
    });

  const [timeRange, setSelectedTimeRange] =
    createSignal<RangeValue<TimeValue | null> | null>(null, {
      ownedWrite: true,
    });

  createRenderEffect(value, (currentValue) => {
    if (isCompleteRange(currentValue)) {
      setSelectedDateRange(currentValue);

      if ("hour" in currentValue.start && "hour" in currentValue.end) {
        setSelectedTimeRange({
          end: currentValue.end,
          start: currentValue.start,
        });
      }
    }
  });

  const showEra = createMemo(() => {
    const currentValue = value();

    return (
      (currentValue?.start?.calendar.identifier === "gregory" &&
        currentValue.start.era === "BC") ||
      (currentValue?.end?.calendar.identifier === "gregory" &&
        currentValue.end.era === "BC")
    );
  });

  const formatOpts = createMemo(() => {
    const currentGranularity = granularity();
    const currentDefaultTimeZone = defaultTimeZone();
    const currentShowEra = showEra();

    return {
      granularity: currentGranularity,
      hideTimeZone: props.hideTimeZone,
      hourCycle: props.hourCycle,
      shouldForceLeadingZeros: props.shouldForceLeadingZeros,
      showEra: currentShowEra,
      timeZone: currentDefaultTimeZone,
    };
  });

  const minValue = createMemo(() => props.minValue);
  const maxValue = createMemo(() => props.maxValue);
  const isDateUnavailable = createMemo(() => props.isDateUnavailable);

  const builtinValidation = createMemo(() => {
    const currentValue = value();
    const currentMinValue = minValue();
    const currentMaxValue = maxValue();
    const currentIsDateUnavailable = isDateUnavailable();
    const currentFormatOpts = formatOpts();

    return getRangeValidationResult(
      currentValue,
      currentMinValue,
      currentMaxValue,
      currentIsDateUnavailable
        ? (date) => currentIsDateUnavailable(date, null)
        : undefined,
      currentFormatOpts
    );
  });

  const derivedProperty0 = createMemo(() =>
    [props.startName, props.endName].filter(
      (n) => n !== null && n !== undefined
    )
  );

  const validation = createFormValidationState<DateRange>(
    merge(props, {
      get builtinValidation() {
        return builtinValidation();
      },
      get name() {
        return derivedProperty0();
      },
      validate: (localValue: DateRange) =>
        // SAFETY: Date edits preserve the input date/time class; the mapped generic callback widens subclasses to that class.
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion
        props.validate?.(localValue as RangeValue<MappedDateValue<T>>),
      get value() {
        // SAFETY: Date edits preserve the input date/time class; the mapped generic callback widens subclasses to that class.
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion
        return controlledValue() as RangeValue<MappedDateValue<T>> | null;
      },
    })
  );

  const commitValue = (
    localDateRange: DateRange,
    localTimeRange: TimeRange
  ) => {
    setValue({
      end:
        "timeZone" in localTimeRange.end
          ? localTimeRange.end.set(toCalendarDate(localDateRange.end))
          : toCalendarDateTime(localDateRange.end, localTimeRange.end),
      start:
        "timeZone" in localTimeRange.start
          ? localTimeRange.start.set(toCalendarDate(localDateRange.start))
          : toCalendarDateTime(localDateRange.start, localTimeRange.start),
    });
    setSelectedDateRange(null);
    setSelectedTimeRange(null);
    validation.commitValidation();
  };

  // Intercept setValue to make sure the Time section is not changed by date selection in Calendar
  const setDateRange = (range: RangeValue<DateValue | null>) => {
    const currentShouldCloseOnSelect = shouldCloseOnSelect();
    const currentHasTime = hasTime();
    const currentTimeRange = timeRange();

    const shouldClose =
      typeof currentShouldCloseOnSelect === "function"
        ? currentShouldCloseOnSelect()
        : currentShouldCloseOnSelect;

    if (currentHasTime) {
      // Set a placeholder time if the popover is closing so we don't leave the field in an incomplete state.
      if (
        isCompleteRange(range) &&
        (shouldClose || (currentTimeRange?.start && currentTimeRange?.end))
      ) {
        commitValue(range, {
          end:
            currentTimeRange?.end ?? getPlaceholderTime(props.placeholderValue),
          start:
            currentTimeRange?.start ??
            getPlaceholderTime(props.placeholderValue),
        });
      } else {
        setSelectedDateRange(range);
      }
    } else if (isCompleteRange(range)) {
      setValue(range);
      validation.commitValidation();
    } else {
      setSelectedDateRange(range);
    }

    if (shouldClose) {
      overlayState.setOpen(false);
    }
  };

  const setTimeRange = (range: RangeValue<TimeValue | null>) => {
    const currentDateRange = dateRange();

    if (isCompleteRange(currentDateRange) && isCompleteRange(range)) {
      commitValue(currentDateRange, range);
    } else {
      setSelectedTimeRange(range);
    }
  };

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

  return merge(
    validation,
    {
      get dateRange() {
        return dateRange();
      },
      get defaultValue() {
        return props.defaultValue ?? initialValue;
      },
      get granularity() {
        return granularity();
      },
      get hasTime() {
        return hasTime();
      },
      setDate(part, date) {
        const currentDateRange = dateRange();

        if (part === "start") {
          setDateRange({ end: currentDateRange?.end ?? null, start: date });
        } else {
          setDateRange({ end: date, start: currentDateRange?.start ?? null });
        }
      },
      setDateRange,
      setDateTime(part, dateTime) {
        const currentValue = value();

        if (part === "start") {
          setValue({ end: currentValue?.end ?? null, start: dateTime });
        } else {
          setValue({ end: dateTime, start: currentValue?.start ?? null });
        }
      },
      setTime(part, time) {
        const currentTimeRange = timeRange();

        if (part === "start") {
          setTimeRange({ end: currentTimeRange?.end ?? null, start: time });
        } else {
          setTimeRange({ end: time, start: currentTimeRange?.start ?? null });
        }
      },
      setTimeRange,
      setValue,
      get timeRange() {
        return timeRange();
      },
      get value() {
        return value();
      },
    } satisfies Partial<DateRangePickerState>,
    overlayState,
    {
      formatValue(locale, fieldOptions) {
        const currentValue = value();

        if (!currentValue.start || !currentValue.end) {
          return null;
        }

        const startTimeZone =
          "timeZone" in currentValue.start
            ? currentValue.start.timeZone
            : undefined;

        const startGranularity =
          props.granularity ??
          (Boolean(currentValue.start) && "minute" in currentValue.start
            ? "minute"
            : "day");

        const endTimeZone =
          "timeZone" in currentValue.end
            ? currentValue.end.timeZone
            : undefined;

        const endGranularity =
          props.granularity ??
          (Boolean(currentValue.end) && "minute" in currentValue.end
            ? "minute"
            : "day");

        const startOptions = getFormatOptions(fieldOptions, {
          granularity: startGranularity,
          hideTimeZone: props.hideTimeZone,
          hourCycle: props.hourCycle,
          showEra:
            (currentValue.start.calendar.identifier === "gregory" &&
              currentValue.start.era === "BC") ||
            (currentValue.end.calendar.identifier === "gregory" &&
              currentValue.end.era === "BC"),
          timeZone: startTimeZone,
        });

        const startDate = currentValue.start.toDate(startTimeZone ?? "UTC");
        const endDate = currentValue.end.toDate(endTimeZone ?? "UTC");
        const startFormatter = new DateFormatter(locale, startOptions);
        let endFormatter: Intl.DateTimeFormat;

        if (
          startTimeZone === endTimeZone &&
          startGranularity === endGranularity &&
          currentValue.start.compare(currentValue.end) !== 0
        ) {
          // Use formatRange, as it results in shorter output when some of the fields
          // are shared between the start and end dates (e.g. the same month).
          // Formatting will fail if the end date is before the start date. Fall back below when that happens.
          try {
            return splitDateRangeParts(
              startFormatter.formatRangeToParts(startDate, endDate)
            );
          } catch {
            // ignore
          }

          endFormatter = startFormatter;
        } else {
          const endOptions = getFormatOptions(fieldOptions, {
            granularity: endGranularity,
            hideTimeZone: props.hideTimeZone,
            hourCycle: props.hourCycle,
            timeZone: endTimeZone,
          });

          endFormatter = new DateFormatter(locale, endOptions);
        }

        return {
          end: endFormatter.format(endDate),
          start: startFormatter.format(startDate),
        };
      },
      getDateFormatter(locale, formatOptions: FormatterOptions) {
        const currentFormatOpts = formatOpts();
        const newOptions = { ...currentFormatOpts, ...formatOptions };
        const newFormatOptions = getFormatOptions({}, newOptions);

        return new DateFormatter(locale, newFormatOptions);
      },
      get isInvalid() {
        return isValueInvalid();
      },
      setOpen(isOpen) {
        const currentValue = value();
        const currentDateRange = dateRange();
        const currentHasTime = hasTime();
        const currentTimeRange = timeRange();

        // Commit the selected date range when the calendar is closed. Use a placeholder time if one wasn't set.
        // If only the time range was set and not the date range, don't commit. The state will be preserved until
        // the user opens the popover again.
        if (
          !isOpen &&
          (!currentValue?.start || !currentValue?.end) &&
          isCompleteRange(currentDateRange) &&
          currentHasTime
        ) {
          commitValue(currentDateRange, {
            end:
              currentTimeRange?.end ??
              getPlaceholderTime(props.placeholderValue),
            start:
              currentTimeRange?.start ??
              getPlaceholderTime(props.placeholderValue),
          });
        }

        overlayState.setOpen(isOpen);
      },
      // oxlint-disable-next-line typescript/no-deprecated -- Expose the legacy output alias for existing consumers; internal state uses its modern replacement.
      get validationState() {
        return validationState();
      },
    } satisfies Partial<DateRangePickerState>
  );
}

function isCompleteRange<T>(
  value: RangeValue<T | null> | null
): value is RangeValue<T> {
  return (
    value?.start !== null &&
    value?.start !== undefined &&
    value.end !== null &&
    value.end !== undefined
  );
}

function splitDateRangeParts(
  parts: ReturnType<Intl.DateTimeFormat["formatRangeToParts"]>
) {
  let separatorIndex = -1;

  for (const [index, part] of parts.entries()) {
    if (part.source === "shared" && part.type === "literal") {
      separatorIndex = index;
    } else if (part.source === "endRange") {
      break;
    }
  }

  let start = "";
  let end = "";

  for (const [index, part] of parts.entries()) {
    if (index < separatorIndex) {
      start += part.value;
    } else if (index > separatorIndex) {
      end += part.value;
    }
  }

  return { end, start };
}
