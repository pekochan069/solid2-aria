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
 * Derived from Adobe React Spectrum: packages/@react-types/calendar/src/index.d.ts.
 * Modified for Solid Aria: adapted type declarations, imports, and formatting for Solid.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  CalendarDate,
  CalendarDateTime,
  ZonedDateTime,
  CalendarIdentifier,
  Calendar as ICalendar,
} from "@internationalized/date";
import type {
  ValidationState,
  ValueBase,
  RangeValue,
  DOMProps,
  AriaLabelingProps,
} from "@solid2-aria/types-shared";
import type { StyleProps } from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";

export type DateValue = CalendarDate | CalendarDateTime | ZonedDateTime;

export interface CalendarPropsBase {
  /** The minimum allowed date that a user may select. */
  minValue?: DateValue | null;
  /** The maximum allowed date that a user may select. */
  maxValue?: DateValue | null;
  /**
   * Whether the calendar is disabled.
   *
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether the calendar value is immutable.
   *
   * @default false
   */
  isReadOnly?: boolean;
  /**
   * Whether to automatically focus the calendar when it mounts.
   *
   * @default false
   */
  autoFocus?: boolean;
  /** Controls the currently focused date within the calendar. */
  focusedValue?: DateValue | null;
  /** The date that is focused when the calendar first mounts (uncontrolled). */
  defaultFocusedValue?: DateValue | null;
  /** Handler that is called when the focused date changes. */
  onFocusChange?: (date: CalendarDate) => void;
  /**
   * Whether the current selection is valid or invalid according to application logic.
   *
   * @deprecated Use `isInvalid` instead.
   */
  validationState?: ValidationState;
  /** Whether the current selection is invalid according to application logic. */
  isInvalid?: boolean;
  /** An error message to display when the selected value is invalid. */
  errorMessage?: JSX.Element;
  /**
   * Controls the behavior of paging. Pagination either works by advancing the visible page by
   * visibleDuration (default) or one unit of visibleDuration.
   *
   * @default visible
   */
  pageBehavior?: PageBehavior;
  /**
   * The day that starts the week.
   */
  firstDayOfWeek?: "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";
  /**
   * Determines the alignment of the visible months on initial render based on the current selection
   * or current date if there is no selection.
   *
   * @default 'center'
   */
  selectionAlignment?: "start" | "center" | "end";
  /**
   * The number of weeks in a month. This overrides the default set by the locale.
   */
  weeksInMonth?: number;
}

export type PageBehavior = "single" | "visible";

export interface CalendarProps<
  T extends DateValue,
  M extends CalendarSelectionMode = "single",
>
  extends
    CalendarPropsBase,
    ValueBase<
      CalendarValueType<T | null, M>,
      CalendarValueType<MappedDateValue<T>, M>
    > {
  /**
   * Whether single or multiple selection is enabled.
   *
   * @default 'single'
   */
  selectionMode?: M;
  /**
   * Callback that is called for each date of the calendar. If it returns true, then the date is
   * unavailable.
   */
  isDateUnavailable?: (date: DateValue) => boolean;
}

type CalendarSelectionMode = "single" | "multiple";

type CalendarValueType<T, M extends CalendarSelectionMode> = M extends "single"
  ? T
  : readonly T[];

type MappedDateValue<T> = T extends ZonedDateTime
  ? ZonedDateTime
  : T extends CalendarDateTime
    ? CalendarDateTime
    : T extends CalendarDate
      ? CalendarDate
      : never;

export type DateRange = RangeValue<DateValue> | null;

export interface RangeCalendarProps<T extends DateValue>
  extends
    CalendarPropsBase,
    ValueBase<RangeValue<T> | null, RangeValue<MappedDateValue<T>>> {
  /**
   * When combined with `isDateUnavailable`, determines whether non-contiguous ranges,
   * i.e. ranges containing unavailable dates, may be selected.
   */
  allowsNonContiguousRanges?: boolean;
  /**
   * Callback that is called for each date of the calendar. If it returns true, then the date is
   * unavailable. The second argument provides the current selection anchor date, if any. This can
   * be used to adjust the available dates based on the user's first selected date.
   */
  isDateUnavailable?: (
    date: DateValue,
    anchorDate: CalendarDate | null
  ) => boolean;
}

export interface AriaCalendarProps<
  T extends DateValue,
  M extends CalendarSelectionMode = "single",
>
  extends CalendarProps<T, M>, DOMProps, AriaLabelingProps {}

export interface AriaRangeCalendarProps<T extends DateValue>
  extends RangeCalendarProps<T>, DOMProps, AriaLabelingProps {
  /**
   * Controls the behavior when a pointer is released outside the calendar or a blur occurs mid
   * selection:
   *
   * - `clear`: clear the currently selected range of dates.
   * - `reset`: reset the selection to the previously selected range of dates.
   * - `select`: select the currently hovered range of dates.
   *
   * @default 'select'
   */
  commitBehavior?: "clear" | "reset" | "select";
}

export interface SpectrumCalendarProps<T extends DateValue>
  extends
    Omit<AriaCalendarProps<T>, "selectionMode" | "weeksInMonth">,
    StyleProps {
  /**
   * The number of months to display at once. Up to 3 months are supported.
   *
   * @default 1
   */
  visibleMonths?: number;

  /**
   * A function to create a new
   * [Calendar](https://react-spectrum.adobe.com/internationalized/date/Calendar.html) object for a
   * given calendar identifier. If not provided, the `createCalendar` function from
   * `@internationalized/date` will be used.
   */
  createCalendar?: (identifier: CalendarIdentifier) => ICalendar;
}

export interface SpectrumRangeCalendarProps<T extends DateValue>
  extends Omit<AriaRangeCalendarProps<T>, "weeksInMonth">, StyleProps {
  /**
   * The number of months to display at once. Up to 3 months are supported.
   *
   * @default 1
   */
  visibleMonths?: number;

  /**
   * A function to create a new
   * [Calendar](https://react-spectrum.adobe.com/internationalized/date/Calendar.html) object for a
   * given calendar identifier. If not provided, the `createCalendar` function from
   * `@internationalized/date` will be used.
   */
  createCalendar?: (identifier: CalendarIdentifier) => ICalendar;
}
