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
 * Derived from Adobe React Spectrum: packages/react-stately/src/datepicker/useDatePickerState.ts.
 * Modified for Solid Aria: adapted reactive state, getters, imports, and APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import {
  DateFormatter,
  toCalendarDate,
  toCalendarDateTime,
} from "@internationalized/date";
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
import { createOverlayTriggerState } from "../overlays/create-overlay-trigger-state";
import type { OverlayTriggerState } from "../overlays/create-overlay-trigger-state";
import { createControlledSignal } from "../utils/create-controlled-signal";
import { getLegacyValidationState } from "../utils/legacy-props";
import type {
  DatePickerProps,
  DateValue,
  Granularity,
  MappedDateValue,
  TimeValue,
} from "./types";
import {
  getFormatOptions,
  getPlaceholderTime,
  getValidationResult,
  createDefaultProps,
} from "./utils";
import type { FieldOptions, FormatterOptions } from "./utils";

export interface DatePickerStateOptions<
  T extends DateValue,
> extends DatePickerProps<T> {
  /**
   * Determines whether the date picker popover should close automatically when a date is selected.
   *
   * @default true
   */
  shouldCloseOnSelect?: boolean | (() => boolean);
}

export interface DatePickerState
  extends OverlayTriggerState, FormValidationState {
  /** The currently selected date. */
  value: DateValue | null;
  /** The default date. */
  defaultValue: DateValue | null;
  /** Sets the selected date. */
  setValue: (value: DateValue | null) => void;
  /**
   * The date portion of the value. This may be set prior to `value` if the user has
   * selected a date but has not yet selected a time.
   */
  dateValue: DateValue | null;
  /** Sets the date portion of the value. */
  setDateValue: (value: DateValue) => void;
  /**
   * The time portion of the value. This may be set prior to `value` if the user has
   * selected a time but has not yet selected a date.
   */
  timeValue: TimeValue | null;
  /** Sets the time portion of the value. */
  setTimeValue: (value: TimeValue) => void;
  /** The granularity for the field, based on the `granularity` prop and current value. */
  granularity: Granularity;
  /**
   * Whether the date picker supports selecting a time, according to the `granularity` prop and
   * current value.
   */
  hasTime: boolean;
  /** Whether the calendar popover is currently open. */
  isOpen: boolean;
  /** Sets whether the calendar popover is open. */
  setOpen: (isOpen: boolean) => void;
  /**
   * The current validation state of the date picker, based on the `validationState`, `minValue`,
   * and `maxValue` props.
   *
   * @deprecated Use `isInvalid` instead.
   */
  validationState: ValidationState | null;
  /** Whether the date picker is invalid, based on the `isInvalid`, `minValue`, and `maxValue` props. */
  isInvalid: boolean;
  /** Formats the selected value using the given options. */
  formatValue: (locale: string, fieldOptions: FieldOptions) => string;
  /** Gets a formatter based on state's props. */
  getDateFormatter: (
    locale: string,
    formatOptions: FormatterOptions
  ) => DateFormatter;
}

/**
 * Provides state management for a date picker component. A date picker combines a DateField and a
 * Calendar popover to allow users to enter or select a date and time value.
 */
export function createDatePickerState<T extends DateValue = DateValue>(
  props: DatePickerStateOptions<T>
): DatePickerState {
  const overlayState = createOverlayTriggerState(props);

  const [value, setValue] = createControlledSignal<DateValue | null>(
    () => props.value,
    untrack(() => props.defaultValue ?? null),
    // SAFETY: Date edits preserve the input date/time class; the mapped generic callback widens subclasses to that class.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    (localValue) => props.onChange?.(localValue as MappedDateValue<T> | null)
  );

  const initialValue = untrack(() => value());

  const v = createMemo(() => {
    const currentValue = value();

    return currentValue ?? props.placeholderValue ?? null;
  });

  const derived0 = createDefaultProps(v, () => props.granularity);

  const granularity = createMemo(() => {
    const [currentGranularity] = derived0();
    const currentValue = v();

    if (currentValue && !(currentGranularity in currentValue)) {
      throw new Error(
        `Invalid granularity ${currentGranularity} for value ${currentValue.toString()}`
      );
    }

    return currentGranularity;
  });

  const defaultTimeZone = createMemo(() => {
    const currentDerived0 = derived0();

    return currentDerived0[1];
  });

  const dateValue = createMemo(() => {
    const currentValue = value();
    const currentDefaultTimeZone = defaultTimeZone();

    return currentValue === null || currentValue === undefined
      ? null
      : currentValue.toDate(currentDefaultTimeZone ?? "UTC");
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

  const [selectedDate, setSelectedDate] = createSignal<DateValue | null>(null, {
    ownedWrite: true,
  });

  const [selectedTime, setSelectedTime] = createSignal<TimeValue | null>(null, {
    ownedWrite: true,
  });

  createRenderEffect(value, (currentValue) => {
    if (currentValue) {
      setSelectedDate(currentValue);

      if ("hour" in currentValue) {
        setSelectedTime(currentValue);
      }
    }
  });

  const showEra = createMemo(() => {
    const currentValue = value();

    return (
      currentValue?.calendar.identifier === "gregory" &&
      currentValue.era === "BC"
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

  const commitValue = (date: DateValue, time: TimeValue) => {
    setValue(
      "timeZone" in time
        ? time.set(toCalendarDate(date))
        : toCalendarDateTime(date, time)
    );
    setSelectedDate(null);
    setSelectedTime(null);
    validation.commitValidation();
  };

  // Intercept setValue to make sure the Time section is not changed by date selection in Calendar
  const selectDate = (newValue: DateValue) => {
    const currentShouldCloseOnSelect = shouldCloseOnSelect();
    const currentHasTime = hasTime();
    const currentSelectedTime = selectedTime();

    const shouldClose =
      typeof currentShouldCloseOnSelect === "function"
        ? currentShouldCloseOnSelect()
        : currentShouldCloseOnSelect;

    if (currentHasTime) {
      if (currentSelectedTime || shouldClose) {
        commitValue(
          newValue,
          currentSelectedTime ??
            getPlaceholderTime(props.defaultValue ?? props.placeholderValue)
        );
      } else {
        setSelectedDate(newValue);
      }
    } else {
      setValue(newValue);
      validation.commitValidation();
    }

    if (shouldClose) {
      overlayState.setOpen(false);
    }
  };

  const selectTime = (newValue: TimeValue) => {
    const currentSelectedDate = selectedDate();

    if (currentSelectedDate && Boolean(newValue)) {
      commitValue(currentSelectedDate, newValue);
    } else {
      setSelectedTime(newValue);
    }
  };

  return merge(
    validation,
    {
      get dateValue() {
        return selectedDate();
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
      get setDateValue() {
        return selectDate;
      },
      get setTimeValue() {
        return selectTime;
      },
      setValue,
      get timeValue() {
        return selectedTime();
      },
      get value() {
        return value();
      },
    } satisfies Partial<DatePickerState>,
    overlayState,
    {
      formatValue(locale, fieldOptions) {
        const currentDateValue = dateValue();
        const currentFormatOpts = formatOpts();

        if (!currentDateValue) {
          return "";
        }

        const formatOptions = getFormatOptions(fieldOptions, currentFormatOpts);
        const formatter = new DateFormatter(locale, formatOptions);

        return formatter.format(currentDateValue);
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
        const currentSelectedDate = selectedDate();
        const currentHasTime = hasTime();
        const currentSelectedTime = selectedTime();

        // Commit the selected date when the calendar is closed. Use a placeholder time if one wasn't set.
        // If only the time was set and not the date, don't commit. The state will be preserved until
        // the user opens the popover again.
        if (!isOpen && !currentValue && currentSelectedDate && currentHasTime) {
          commitValue(
            currentSelectedDate,
            currentSelectedTime ??
              getPlaceholderTime(props.defaultValue ?? props.placeholderValue)
          );
        }

        overlayState.setOpen(isOpen);
      },
      // oxlint-disable-next-line typescript/no-deprecated -- Expose the legacy output alias for existing consumers; internal state uses its modern replacement.
      get validationState() {
        return validationState();
      },
    } satisfies Partial<DatePickerState>
  );
}
