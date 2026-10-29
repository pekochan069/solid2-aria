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
 * Derived from Adobe React Spectrum: packages/react-aria/src/calendar/useCalendarCell.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { isSameDay, isToday } from "@internationalized/date";
import type { CalendarDate } from "@internationalized/date";
import type {
  CalendarSelectionMode,
  CalendarState,
  RangeCalendarState,
} from "@solid2-aria/stately/calendar/types";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { createEffect, createMemo, untrack } from "solid-js";
import type { Accessor } from "solid-js";

import intlMessages from "../../intl/calendar/index";
import { createDateFormatter } from "../i18n/create-date-formatter";
import { createLocalizedStringFormatter } from "../i18n/create-localized-string-formatter";
import { getInteractionModality } from "../interactions/create-focus-visible";
import { createPress } from "../interactions/create-press";
import { ariaValue } from "../utils/aria-value";
import { createDescription } from "../utils/create-description";
import { requireHTMLElement } from "../utils/dom-value";
import { focusWithoutScrolling } from "../utils/focus-without-scrolling";
import { getScrollParent } from "../utils/get-scroll-parent";
import { mergeProps } from "../utils/merge-props";
import { requireValue } from "../utils/require-value";
import { scrollIntoViewport } from "../utils/scroll-into-view";
import {
  getActiveElement,
  getEventTarget,
} from "../utils/shadowdom/dom-functions";
import { isTruthy } from "../utils/truthy";
import { getEraFormat, hookData } from "./utils";

export interface AriaCalendarCellProps {
  /** The date that this cell represents. */
  date: CalendarDate;
  /**
   * Whether the cell is disabled. By default, this is determined by the
   * Calendar's `minValue`, `maxValue`, and `isDisabled` props.
   */
  isDisabled?: boolean;
  /**
   * Whether the cell is outside of the current month.
   */
  isOutsideMonth?: boolean;
}

export interface CalendarCellAria {
  /** Props for the grid cell element (e.g. `<td>`). */
  cellProps: DOMAttributes;
  /** Props for the button element within the cell. */
  buttonProps: DOMAttributes;
  /** Whether the cell is currently being pressed. */
  isPressed: boolean;
  /** Whether the cell is selected. */
  isSelected: boolean;
  /** Whether the cell is focused. */
  isFocused: boolean;
  /**
   * Whether the cell is disabled, according to the calendar's `minValue`, `maxValue`, and
   * `isDisabled` props. Disabled dates are not focusable, and cannot be selected by the user. They
   * are typically displayed with a dimmed appearance.
   */
  isDisabled: boolean;
  /**
   * Whether the cell is unavailable, according to the calendar's `isDateUnavailable` prop.
   * Unavailable dates remain focusable, but cannot be selected by the user. They should be
   * displayed with a visual affordance to indicate they are unavailable, such as a different color
   * or a strikethrough.
   *
   * Note that because they are focusable, unavailable dates must meet a 4.5:1 color contrast ratio,
   * [as defined by WCAG](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html).
   */
  isUnavailable: boolean;
  /**
   * Whether the cell is outside the visible range of the calendar.
   * For example, dates before the first day of a month in the same week.
   */
  isOutsideVisibleRange: boolean;
  /** Whether the cell is part of an invalid selection. */
  isInvalid: boolean;
  /** The day number formatted according to the current locale. */
  formattedDate: string;
}

/**
 * Provides the behavior and accessibility implementation for a calendar cell component.
 * A calendar cell displays a date cell within a calendar grid which can be selected by the user.
 */
export function createCalendarCell(
  props: AriaCalendarCellProps,
  state: CalendarState<CalendarSelectionMode> | RangeCalendarState,
  ref: Accessor<HTMLElement | null>
): CalendarCellAria {
  const date = createMemo(() => props.date);

  const _result0 = requireValue(
    hookData.get(state),
    "Expected hookData.get(state)"
  );

  const stringFormatter = createLocalizedStringFormatter(
    intlMessages,
    "@react-aria/calendar"
  );

  const dateFormatter = createDateFormatter({
    get day() {
      return "numeric" as const;
    },
    get era() {
      return getEraFormat(date());
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

  const isFocused = createMemo(
    () => state.isCellFocused(date()) && !isTruthy(props.isOutsideMonth)
  );

  const isDisabled = createMemo(
    () =>
      isTruthy(props.isDisabled) ||
      state.isCellDisabled(date()) ||
      isTruthy(props.isOutsideMonth)
  );

  const isUnavailable = createMemo(() => state.isCellUnavailable(date()));
  const isSelectable = createMemo(() => !isDisabled() && !isUnavailable());

  const isInvalid = createMemo(() => {
    if (!state.isValueInvalid) {
      return false;
    }

    if ("highlightedRange" in state) {
      return (
        !state.anchorDate &&
        state.highlightedRange !== null &&
        state.highlightedRange !== undefined &&
        date().compare(state.highlightedRange.start) >= 0 &&
        date().compare(state.highlightedRange.end) <= 0
      );
    }

    if (isDateArray(state.value)) {
      return state.value.some(
        (value) => value !== null && isSameDay(value, date())
      );
    }

    return !!state.value && isSameDay(state.value, date());
  });

  const isSelected = createMemo(
    () =>
      (isInvalid() && !isDisabled()) ||
      (state.isSelected(date()) && isSelectable())
  );

  const nativeDate = createMemo(() => date().toDate(state.timeZone));

  // aria-label should be localize Day of week, Month, Day and Year without Time.
  const isDateToday = createMemo(() => isToday(date(), state.timeZone));

  const label = createMemo(() => {
    let labelValue = "";

    // If this is a range calendar, add a description of the full selected range
    // to the first and last selected date().
    if (
      "highlightedRange" in state &&
      state.value &&
      !state.anchorDate &&
      (isSameDay(date(), state.value.start) ||
        isSameDay(date(), state.value.end))
    ) {
      labelValue = `${_result0.selectedDateDescription}, `;
    }

    labelValue += dateFormatter.format(nativeDate());

    if (isDateToday()) {
      // If date() is today, set appropriate string depending on selected state:
      labelValue = stringFormatter.format(
        isSelected() ? "todayDateSelected" : "todayDate",
        {
          date: labelValue,
        }
      );
    } else if (isSelected()) {
      // If date() is selected but not today:
      labelValue = stringFormatter.format("dateSelected", {
        date: labelValue,
      });
    }

    if (state.minValue && isSameDay(date(), state.minValue)) {
      labelValue += `, ${stringFormatter.format("minimumDate")}`;
    } else if (state.maxValue && isSameDay(date(), state.maxValue)) {
      labelValue += `, ${stringFormatter.format("maximumDate")}`;
    }

    return labelValue;
  });

  // When a cell is focused and this is a range calendar, add a prompt to help
  // screenreader users know that they are in a range selection mode.
  const rangeSelectionPrompt = createMemo(() => {
    if (
      "anchorDate" in state &&
      isFocused() &&
      !state.isReadOnly &&
      isSelectable()
    ) {
      return stringFormatter.format(
        state.anchorDate
          ? "finishRangeSelectionPrompt"
          : "startRangeSelectionPrompt"
      );
    }

    return "";
  });

  const descriptionProps = createDescription(() => rangeSelectionPrompt());
  let isAnchorPressed = false;
  let isRangeBoundaryPressed = false;

  let touchDragTimerRef: ReturnType<typeof setTimeout> | undefined = undefined;

  // When dragging to select a range, we don't want dragging over the original anchor
  // again to trigger onPressStart. Cancel presses immediately when the pointer exits.
  const _result1 = createPress({
    get isDisabled() {
      return !isSelectable() || state.isReadOnly;
    },
    onPress() {
      // For non-range selection, always select on press up.
      if (!("anchorDate" in state) && !state.isReadOnly) {
        state.selectDate(date());
        state.setFocusedDate(date());
        state.setFocused(true);
      }
    },
    onPressEnd() {
      isRangeBoundaryPressed = false;
      isAnchorPressed = false;
      clearTimeout(touchDragTimerRef);
      touchDragTimerRef = undefined;
    },
    onPressStart(e) {
      if (state.isReadOnly) {
        state.setFocusedDate(date());
        state.setFocused(true);

        return;
      }

      if (
        "highlightedRange" in state &&
        !state.anchorDate &&
        (e.pointerType === "mouse" || e.pointerType === "touch")
      ) {
        // Allow dragging the start or end date() of a range to modify it
        // rather than starting a new selection.
        // Don't allow dragging when invalid, or weird jumping behavior may occur as date() ranges
        // are constrained to available dates. The user will need to select a new range in this case.
        if (state.highlightedRange && !isInvalid()) {
          if (isSameDay(date(), state.highlightedRange.start)) {
            state.setAnchorDate(state.highlightedRange.end);
            state.setFocusedDate(date());
            state.setFocused(true);
            state.setDragging(true);
            isRangeBoundaryPressed = true;

            return;
          } else if (isSameDay(date(), state.highlightedRange.end)) {
            state.setAnchorDate(state.highlightedRange.start);
            state.setFocusedDate(date());
            state.setFocused(true);
            state.setDragging(true);
            isRangeBoundaryPressed = true;

            return;
          }
        }

        const startDragging = () => {
          state.setDragging(true);
          touchDragTimerRef = undefined;
          state.selectDate(date());
          state.setFocusedDate(date());
          state.setFocused(true);
          isAnchorPressed = true;
        };

        // Start selection on mouse/touch down so users can drag to select a range.
        // On touch, delay dragging to determine if the user really meant to scroll.
        if (e.pointerType === "touch") {
          touchDragTimerRef = setTimeout(startDragging, 200);
        } else {
          startDragging();
        }
      }
    },
    onPressUp(e) {
      if (state.isReadOnly) {
        return;
      }

      // If the user tapped quickly, the date() won't be selected yet and the
      // timer will still be in progress. In this case, select the date() on touch up.
      // Timer is cleared in onPressEnd.
      if ("anchorDate" in state && touchDragTimerRef) {
        state.selectDate(date());
        state.setFocusedDate(date());
        state.setFocused(true);
      }

      if ("anchorDate" in state) {
        if (isRangeBoundaryPressed) {
          // When clicking on the start or end date() of an already selected range,
          // start a new selection on press up to also allow dragging the date() to
          // change the existing range.
          state.setAnchorDate(date());
        } else if (state.anchorDate && !isAnchorPressed) {
          // When releasing a drag or pressing the end date() of a range, select it.
          state.selectDate(date());
          state.setFocusedDate(date());
          state.setFocused(true);
        } else if (e.pointerType === "keyboard" && !state.anchorDate) {
          // For range selection, auto-advance the focused date() by one if using keyboard.
          // This gives an indication that you're selecting a range rather than a single date().
          // For mouse, this is unnecessary because users will see the indication on hover. For screen readers,
          // there will be an announcement to "click to finish selecting range" (above).
          state.selectDate(date());
          state.focusNearestAvailableDate(date());
        } else if (e.pointerType === "virtual") {
          // For screen readers, just select the date() on click.
          state.selectDate(date());
          state.setFocusedDate(date());
          state.setFocused(true);
        }
      }
    },
    get preventFocusOnPress() {
      return true;
    },
    get shouldCancelOnPointerExit() {
      return "anchorDate" in state && !!state.anchorDate;
    },
  });

  const tabIndex = createMemo((): number | undefined => {
    if (isDisabled()) {
      return undefined;
    }

    if (isSameDay(date(), state.focusedDate)) {
      return 0;
    }

    return -1;
  });

  // Focus the button in the DOM when the state updates.
  createEffect(
    () => ({ element: ref(), isFocused: isFocused() }),
    ({ isFocused: currentIsFocused, element }) => {
      const refElement = element;

      if (currentIsFocused && refElement) {
        untrack(() => {
          focusWithoutScrolling(refElement);
        });

        // Scroll into view if navigating with a keyboard, otherwise
        // try not to shift the view under the user's mouse/finger.
        // If in a overlay, scrollIntoViewport will only cause scrolling
        // up to the overlay scroll body to prevent overlay shifting.
        // Also only scroll into view if the cell actually got focused.
        // There are some cases where the cell might be disabled or inside,
        // an inert container and we don't want to scroll then.
        if (
          getInteractionModality() !== "pointer" &&
          getActiveElement() === refElement
        ) {
          scrollIntoViewport(refElement, {
            containingElement: getScrollParent(refElement),
          });
        }
      }
    },
    { ssrSource: "client" }
  );

  const cellDateFormatter = createDateFormatter({
    get calendar() {
      return date().calendar.identifier;
    },
    get day() {
      return "numeric" as const;
    },
    get timeZone() {
      return state.timeZone;
    },
  });

  const formattedDate = createMemo(
    () =>
      requireValue(
        cellDateFormatter
          .formatToParts(nativeDate())
          .find((part) => part.type === "day"),
        "Expected cellDateFormatter .formatToParts(nativeDate()) .find((part) => part.ty"
      ).value
  );

  return {
    get buttonProps() {
      return mergeProps(_result1.pressProps, {
        "aria-describedby": ariaValue(
          [
            isInvalid() ? _result0.errorMessageId : undefined,
            descriptionProps["aria-describedby"],
          ]
            .filter(Boolean)
            .join(" ") || undefined
        ),
        "aria-disabled": ariaValue(!isSelectable() || undefined),
        "aria-invalid": ariaValue(isInvalid() || undefined),
        "aria-label": ariaValue(label()),
        onContextMenu(e: MouseEvent) {
          // Prevent context menu on long press.
          e.preventDefault();
        },
        onFocus() {
          if (!isDisabled()) {
            state.setFocusedDate(date());
            state.setFocused(true);
          }
        },
        onPointerDown(e: PointerEvent) {
          // This is necessary on touch devices to allow dragging
          // outside the original pressed element.
          // (JSDOM does not support this)
          const target = getEventTarget(e);

          if (
            target instanceof HTMLElement &&
            "releasePointerCapture" in target
          ) {
            if ("hasPointerCapture" in target) {
              if (target.hasPointerCapture(e.pointerId)) {
                target.releasePointerCapture(e.pointerId);
              }
            } else {
              requireHTMLElement(target).releasePointerCapture(e.pointerId);
            }
          }
        },
        onPointerEnter(e: PointerEvent) {
          // Highlight the date() on hover or drag over a date() when selecting a range.
          if (
            "highlightDate" in state &&
            (e.pointerType !== "touch" || state.isDragging) &&
            isSelectable()
          ) {
            state.highlightDate(date());
          }
        },
        role: "button" as const,
        tabindex: tabIndex(),
      });
    },
    get cellProps() {
      return {
        get "aria-disabled"() {
          return ariaValue(ariaValue(!isSelectable() || undefined));
        },
        get "aria-invalid"() {
          return ariaValue(ariaValue(isInvalid() || undefined));
        },
        get "aria-selected"() {
          return ariaValue(ariaValue(isSelected() || undefined));
        },
        get role() {
          return "gridcell" as const;
        },
      };
    },
    get formattedDate() {
      return formattedDate();
    },
    get isDisabled() {
      return isDisabled();
    },
    get isFocused() {
      return isFocused();
    },
    get isInvalid() {
      return isInvalid();
    },
    get isOutsideVisibleRange() {
      return (
        date().compare(state.visibleRange.start) < 0 ||
        date().compare(state.visibleRange.end) > 0
      );
    },
    get isPressed() {
      return _result1.isPressed;
    },
    get isSelected() {
      return isSelected();
    },
    get isUnavailable() {
      return isUnavailable();
    },
  };
}

function isDateArray(
  value: CalendarState<CalendarSelectionMode>["value"]
): value is Extract<
  CalendarState<CalendarSelectionMode>["value"],
  readonly unknown[]
> {
  return Array.isArray(value);
}
