/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/*
 * Derived from Adobe React Spectrum: packages/react-stately/src/datepicker/useTimeFieldState.ts.
 * Modified for Solid Aria: adapted reactive state, getters, imports, and APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import {
  getLocalTimeZone,
  GregorianCalendar,
  Time,
  toCalendarDateTime,
  today,
  toTime,
  toZoned,
} from "@internationalized/date";
import { createMemo, untrack, merge, omit } from "solid-js";

import { createControlledSignal } from "../utils/create-controlled-signal";
import { requireValue } from "../utils/require-value";
import { createDateFieldState } from "./create-date-field-state";
import type { DateFieldState } from "./create-date-field-state";
import type {
  DateValue,
  MappedTimeValue,
  TimePickerProps,
  TimeValue,
} from "./types";

export interface TimeFieldStateOptions<
  T extends TimeValue = TimeValue,
> extends TimePickerProps<T> {
  /** The locale to display and edit the value according to. */
  locale: string;
}

export interface TimeFieldState extends DateFieldState {
  /** The current time value. */
  timeValue: Time;
}

/**
 * Provides state management for a time field component.
 * A time field allows users to enter and edit time values using a keyboard.
 * Each part of a time value is displayed in an individually editable segment.
 */
export function createTimeFieldState<T extends TimeValue = TimeValue>(
  props: TimeFieldStateOptions<T>
): TimeFieldState {
  const placeholderValue = createMemo(
    () => props.placeholderValue ?? new Time()
  );

  const minValue = createMemo(() => props.minValue);
  const maxValue = createMemo(() => props.maxValue);
  const defaultValue = createMemo(() => props.defaultValue);
  const granularity = createMemo(() => props.granularity);
  const validate = createMemo(() => props.validate);

  const [value, setValue] = createControlledSignal<TimeValue | null>(
    () => props.value,
    untrack(() => {
      const currentDefaultValue = defaultValue();

      return currentDefaultValue ?? null;
    }),
    // SAFETY: Date edits preserve the input date/time class; the mapped generic callback widens subclasses to that class.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    (localValue) => props.onChange?.(localValue as MappedTimeValue<T> | null)
  );

  const v = createMemo(() => {
    const currentValue = value();
    const currentPlaceholderValue = placeholderValue();

    return currentValue ?? currentPlaceholderValue;
  });

  const day = createMemo(() => {
    const currentV = v();

    return Boolean(currentV) && "day" in currentV ? currentV : undefined;
  });

  const defaultValueTimeZone = createMemo(() => {
    const currentDefaultValue = defaultValue();

    return currentDefaultValue && "timeZone" in currentDefaultValue
      ? currentDefaultValue.timeZone
      : undefined;
  });

  const placeholderDate = createMemo(() => {
    const currentV = v();
    const currentDefaultValueTimeZone = defaultValueTimeZone();
    const currentPlaceholderValue = placeholderValue();

    const valueTimeZone =
      Boolean(currentV) && "timeZone" in currentV
        ? currentV.timeZone
        : undefined;

    return ((valueTimeZone !== undefined && valueTimeZone !== "") ||
      (currentDefaultValueTimeZone !== undefined &&
        currentDefaultValueTimeZone !== "")) &&
      Boolean(currentPlaceholderValue)
      ? toZoned(
          requireValue(
            convertValue(currentPlaceholderValue),
            "Expected convertValue(currentPlaceholderValue) to exist."
          ),
          requireValue(
            valueTimeZone ?? currentDefaultValueTimeZone,
            "Zoned placeholders require a time zone."
          )
        )
      : convertValue(currentPlaceholderValue);
  });

  const minDate = createMemo(() => {
    const currentMinValue = minValue();
    const currentDay = day();

    return convertValue(currentMinValue, currentDay);
  });

  const maxDate = createMemo(() => {
    const currentMaxValue = maxValue();
    const currentDay = day();

    return convertValue(currentMaxValue, currentDay);
  });

  const timeValue = createMemo(() => {
    const currentValue = value();

    return currentValue && "day" in currentValue
      ? toTime(currentValue)
      : currentValue;
  });

  const dateTime = createMemo(() => {
    const currentValue = value();

    return currentValue === null || currentValue === undefined
      ? null
      : convertValue(currentValue);
  });

  const defaultDateTime = createMemo(() => {
    const currentDefaultValue = defaultValue();

    return currentDefaultValue === null || currentDefaultValue === undefined
      ? null
      : convertValue(currentDefaultValue);
  });

  const onChange = (newValue: DateValue | null) => {
    const currentDay = day();
    const currentDefaultValueTimeZone = defaultValueTimeZone();

    if (newValue === null || newValue === undefined) {
      setValue(null);
    } else if ("hour" in newValue) {
      setValue(
        currentDay ||
          (currentDefaultValueTimeZone !== undefined &&
            currentDefaultValueTimeZone !== "")
          ? newValue
          : toTime(newValue)
      );
    }
  };

  const state = createDateFieldState(
    merge(
      omit(
        props,
        "value",
        "defaultValue",
        "minValue",
        "maxValue",
        "placeholderValue",
        "onChange",
        "validate"
      ),
      {
        // Calendar should not matter for time fields.
        get createCalendar() {
          return () => new GregorianCalendar();
        },
        get defaultValue() {
          return defaultDateTime();
        },
        get granularity(): "hour" | "minute" | "second" {
          return granularity() ?? "minute";
        },
        get maxGranularity() {
          return "hour" as const;
        },
        get maxValue() {
          return maxDate();
        },
        get minValue() {
          return minDate();
        },
        onChange,
        get placeholderValue(): DateValue | undefined {
          const date = placeholderDate();

          return date && "day" in date ? date : undefined;
        },
        get validate() {
          return () => {
            const currentValidate = validate();
            const currentValue = value();

            // SAFETY: Date edits preserve the input date/time class; the mapped generic callback widens subclasses to that class.
            // oxlint-disable-next-line typescript/no-unsafe-type-assertion
            return currentValidate?.(currentValue as MappedTimeValue<T>);
          };
        },
        get value() {
          return dateTime();
        },
      }
    )
  );

  return merge(state, {
    get timeValue() {
      return requireValue(
        timeValue(),
        "Time fields require a placeholder time."
      );
    },
  } satisfies Partial<TimeFieldState>);
}

function convertValue(
  value: TimeValue | null | undefined,
  date: DateValue = today(getLocalTimeZone())
) {
  if (!value) {
    return null;
  }

  if ("day" in value) {
    return value;
  }

  return toCalendarDateTime(date, value);
}
