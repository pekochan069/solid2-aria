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
 * Derived from Adobe React Spectrum: packages/react-aria/src/calendar/useCalendarGrid.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { startOfWeek, today } from "@internationalized/date";
import type { CalendarDate } from "@internationalized/date";
import type {
  CalendarSelectionMode,
  CalendarState,
  RangeCalendarState,
} from "@solid2-aria/stately/calendar/types";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { createMemo } from "solid-js";

import { createDateFormatter } from "../i18n/create-date-formatter";
import { createLocale } from "../i18n/i18n-provider";
import { createKeyboard } from "../interactions/create-keyboard";
import { ariaValue } from "../utils/aria-value";
import { createLabels } from "../utils/create-labels";
import { mergeProps } from "../utils/merge-props";
import { requireValue } from "../utils/require-value";
import { getTruthyValue, isTruthy, whenTruthy } from "../utils/truthy";
import { hookData, createVisibleRangeDescription } from "./utils";

export interface AriaCalendarGridProps {
  /**
   * The first date displayed in the calendar grid.
   * Defaults to the first visible date in the calendar.
   * Override this to display multiple date grids in a calendar.
   */
  startDate?: CalendarDate;
  /**
   * The last date displayed in the calendar grid.
   * Defaults to the last visible date in the calendar.
   * Override this to display multiple date grids in a calendar.
   */
  endDate?: CalendarDate;
  /**
   * The style of weekday names to display in the calendar grid header,
   * e.g. single letter, abbreviation, or full day name.
   *
   * @default 'narrow'
   */
  weekdayStyle?: "narrow" | "short" | "long";
  /**
   * The day that starts the week.
   */
  firstDayOfWeek?: "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";
}

export interface CalendarGridAria {
  /** Props for the date grid element (e.g. `<table>`). */
  gridProps: DOMAttributes;
  /** Props for the grid header element (e.g. `<thead>`). */
  headerProps: DOMAttributes;
  /**
   * A list of week day abbreviations formatted for the current locale, typically used in column
   * headers.
   */
  weekDays: string[];
  /** The number of weeks in the month. */
  weeksInMonth: number;
}

/**
 * Provides the behavior and accessibility implementation for a calendar grid component.
 * A calendar grid displays a single grid of days within a calendar or range calendar which
 * can be keyboard navigated and selected by the user.
 */
export function createCalendarGrid(
  props: AriaCalendarGridProps,
  state: CalendarState<CalendarSelectionMode> | RangeCalendarState
): CalendarGridAria {
  const _result0 = props;
  const _result1 = createLocale();

  const _result2 = createKeyboard({
    get shortcuts() {
      return {
        get End() {
          return () => {
            state.focusSectionEnd();
          };
        },
        get Escape() {
          return () => {
            // Cancel the selection.
            if ("setAnchorDate" in state) {
              state.setAnchorDate(null);
            }

            // Follow-up: is this really correct? or should it return true when we cancel and only propagate if there's nothing to do
            return false;
          };
        },
        get Home() {
          return () => {
            state.focusSectionStart();
          };
        },
      };
    },
  });

  const _result3 = createKeyboard({
    get allowRepeats() {
      return true;
    },
    get shortcuts() {
      return {
        get " "() {
          return () => {
            state.selectFocusedDate();
          };
        },
        get ArrowDown() {
          return () => {
            state.focusNextRow();
          };
        },
        get ArrowLeft() {
          return () => {
            if (_result1.direction === "rtl") {
              state.focusNextDay();
            } else {
              state.focusPreviousDay();
            }
          };
        },
        get ArrowRight() {
          return () => {
            if (_result1.direction === "rtl") {
              state.focusPreviousDay();
            } else {
              state.focusNextDay();
            }
          };
        },
        get ArrowUp() {
          return () => {
            state.focusPreviousRow();
          };
        },
        get Enter() {
          return () => {
            state.selectFocusedDate();
          };
        },
        get PageDown() {
          return () => {
            state.focusNextSection();
          };
        },
        get PageUp() {
          return () => {
            state.focusPreviousSection();
          };
        },
        get "Shift+PageDown"() {
          return () => {
            state.focusNextSection(true);
          };
        },
        get "Shift+PageUp"() {
          return () => {
            state.focusPreviousSection(true);
          };
        },
      };
    },
  });

  const visibleRangeDescription = createVisibleRangeDescription(
    () => _result0.startDate ?? state.visibleRange.start,
    () => _result0.endDate ?? state.visibleRange.end,
    () => state.timeZone,
    true
  );

  const _result4 = requireValue(
    hookData.get(state),
    "Expected hookData.get(state)"
  );

  const labelProps = createLabels({
    get "aria-label"() {
      return ariaValue(
        ariaValue(
          [_result4.ariaLabel, visibleRangeDescription()]
            .filter(Boolean)
            .join(", ")
        )
      );
    },
    get "aria-labelledby"() {
      return ariaValue(ariaValue(_result4.ariaLabelledBy));
    },
  });

  const dayFormatter = createDateFormatter({
    get timeZone() {
      return state.timeZone;
    },
    get weekday() {
      return getTruthyValue(props.weekdayStyle) ?? "narrow";
    },
  });

  const _result5 = createLocale();

  const weekDays = createMemo(() => {
    const isDayView = whenTruthy(
      state.visibleDuration.days,
      (truthyValue0) => truthyValue0 < 7
    );

    const weekStart = isTruthy(isDayView)
      ? (_result0.startDate ?? state.visibleRange.start)
      : startOfWeek(
          today(state.timeZone),
          _result5.locale,
          _result0.firstDayOfWeek
        );

    const days = isTruthy(isDayView)
      ? requireValue(
          state.visibleDuration.days,
          "Expected state.visibleDuration.days"
        )
      : 7;

    return Array.from({ length: days }, (_, index) => {
      const date = weekStart.add({ days: index });
      const dateDay = date.toDate(state.timeZone);

      return dayFormatter.format(dateDay);
    });
  });

  const weeksInMonth = createMemo(() =>
    state.getWeeksInMonth(_result0.startDate ?? state.visibleRange.start)
  );

  return {
    get gridProps() {
      return mergeProps(
        labelProps,
        {
          "aria-disabled": ariaValue(state.isDisabled || undefined),
          "aria-multiselectable": ariaValue(
            "highlightedRange" in state ||
              state.selectionMode === "multiple" ||
              undefined
          ),
          "aria-readonly": ariaValue(state.isReadOnly || undefined),
          onFocusIn: () => {
            state.setFocused(true);
          },
          onFocusOut: () => {
            state.setFocused(false);
          },
          role: "grid",
        },
        _result2.keyboardProps,
        _result3.keyboardProps
      );
    },
    get headerProps() {
      return {
        get "aria-hidden"() {
          // Column headers are hidden to screen readers to make navigating with a touch screen reader easier.
          // The day names are already included in the label of each cell, so there's no need to announce them twice.
          return ariaValue(ariaValue(true));
        },
      };
    },
    get weekDays() {
      return weekDays();
    },
    get weeksInMonth() {
      return weeksInMonth();
    },
  };
}
