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
 * Derived from Adobe React Spectrum: packages/react-aria/src/calendar/useRangeCalendar.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { RangeCalendarProps } from "@solid2-aria/stately/calendar/create-range-calendar-state";
import type { RangeCalendarState } from "@solid2-aria/stately/calendar/types";
import type { DateValue } from "@solid2-aria/stately/datepicker/types";
import type {
  AriaLabelingProps,
  DOMProps,
  FocusableElement,
} from "@solid2-aria/types-shared";
import { omit, merge } from "solid-js";
import type { Accessor } from "solid-js";

import { createEvent } from "../utils/create-event";
import { requireElement } from "../utils/dom-value";
import {
  getEventTarget,
  isFocusWithin,
  nodeContains,
} from "../utils/shadowdom/dom-functions";
import { createCalendarBase } from "./create-calendar-base";
import type { CalendarAria } from "./create-calendar-base";

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

/**
 * Provides the behavior and accessibility implementation for a range calendar component. A range
 * calendar displays one or more date grids and allows users to select a contiguous range of dates.
 */
const windowRef = () => (typeof window === "undefined" ? null : window);

export function createRangeCalendar<T extends DateValue>(
  props: AriaRangeCalendarProps<T>,
  state: RangeCalendarState,
  ref: Accessor<FocusableElement | null>
): CalendarAria {
  const _result0 = props;
  const res = createCalendarBase(omit(_result0, "commitBehavior"), state);
  // We need to ignore virtual pointer events from VoiceOver due to these bugs.
  // https://bugs.webkit.org/show_bug.cgi?id=222627
  // https://bugs.webkit.org/show_bug.cgi?id=223202
  // usePress also does this and waits for the following click event before firing.
  // We need to match that here otherwise this will fire before the press event in
  // useCalendarCell, causing range selection to not work properly.
  let isVirtualClick = false;

  createEvent(windowRef, "pointerdown", (e) => {
    isVirtualClick = e.width === 0 && e.height === 0;
  });

  const commitBehaviorMapping = {
    clear: () => {
      state.clearSelection();
    },
    reset: () => {
      state.setAnchorDate(null);
    },
    select: () => {
      state.commitSelection();
    },
  };

  // Execute method corresponding to `commitBehavior` when pressing or releasing a pointer outside the calendar body,
  // except when pressing the next or previous buttons to switch months.
  const endDragging = (e: PointerEvent) => {
    if (isVirtualClick) {
      isVirtualClick = false;

      return;
    }

    state.setDragging(false);

    if (!state.anchorDate) {
      return;
    }

    const target = requireElement(getEventTarget(e));

    if (
      ref() &&
      isFocusWithin(ref()) &&
      (!nodeContains(ref(), target) ||
        !target.closest('button, [role="button"]'))
    ) {
      commitBehaviorMapping[_result0.commitBehavior ?? "select"]();
    }
  };

  createEvent(windowRef, "pointerup", endDragging);
  // Also execute method corresponding to `commitBehavior` on blur,
  // e.g. tabbing away from the calendar.

  const onFocusOut: NonNullable<CalendarAria["calendarProps"]["onFocusOut"]> = (
    e
  ) => {
    if (!ref()) {
      return;
    }

    if (
      (!e.relatedTarget ||
        !nodeContains(
          ref(),
          e.relatedTarget instanceof Node ? e.relatedTarget : null
        )) &&
      state.anchorDate
    ) {
      commitBehaviorMapping[_result0.commitBehavior ?? "select"]();
    }
  };

  // Prevent touch scrolling while dragging
  createEvent(
    ref,
    "touchmove",
    (e) => {
      if (state.isDragging) {
        e.preventDefault();
      }
    },
    {
      get capture() {
        return true;
      },
      get passive() {
        return false;
      },
    }
  );

  return merge(res, {
    get calendarProps() {
      return merge(res.calendarProps, { onFocusOut });
    },
  });
}
