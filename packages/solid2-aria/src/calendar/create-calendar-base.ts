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
 * Derived from Adobe React Spectrum: packages/react-aria/src/calendar/useCalendarBase.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  CalendarPropsBase,
  CalendarSelectionMode,
  CalendarState,
  RangeCalendarState,
} from "@solid2-aria/stately/calendar/types";
import type { AriaLabelingProps, DOMProps } from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { createMemo, createEffect, createSignal } from "solid-js";

import intlMessages from "../../intl/calendar/index";
import type { AriaButtonProps } from "../button/create-button";
import { createLocalizedStringFormatter } from "../i18n/create-localized-string-formatter";
import { announce } from "../live-announcer/live-announcer";
import { ariaValue } from "../utils/aria-value";
import { createSlotId } from "../utils/create-id";
import { createLabels } from "../utils/create-labels";
import { filterDOMProps } from "../utils/filter-dom-props";
import { getLegacyOption } from "../utils/legacy-option";
import { mergeProps } from "../utils/merge-props";
import { getTruthyValue } from "../utils/truthy";
import {
  hookData,
  createSelectedDateDescription,
  createVisibleRangeDescription,
} from "./utils";

export interface CalendarAria {
  /** Props for the calendar grouping element. */
  calendarProps: DOMAttributes;
  /** Props for the next button. */
  nextButtonProps: AriaButtonProps;
  /** Props for the previous button. */
  prevButtonProps: AriaButtonProps;
  /** Props for the error message element, if any. */
  errorMessageProps: DOMAttributes;
  /** A description of the visible date range, for use in the calendar title. */
  title: string;
}

export function createCalendarBase(
  props: CalendarPropsBase & DOMProps & AriaLabelingProps,
  state: CalendarState<CalendarSelectionMode> | RangeCalendarState
): CalendarAria {
  const stringFormatter = createLocalizedStringFormatter(
    intlMessages,
    "@react-aria/calendar"
  );

  const domProps = createMemo(() => filterDOMProps(props));

  const title = createVisibleRangeDescription(
    () => state.visibleRange.start,
    () => state.visibleRange.end,
    () => state.timeZone,
    false
  );

  const visibleRangeDescription = createVisibleRangeDescription(
    () => state.visibleRange.start,
    () => state.visibleRange.end,
    () => state.timeZone,
    true
  );

  // Announce when the visible date range changes
  createEffect(
    () => ({
      isFocused: state.isFocused,
      visibleRangeDescription: visibleRangeDescription(),
    }),
    ({
      visibleRangeDescription: currentVisibleRangeDescription,
      isFocused,
    }) => {
      // only when pressing the Previous or Next button
      if (!isFocused) {
        announce(currentVisibleRangeDescription);
      }
    },
    { defer: true, ssrSource: "client" }
  );
  // Announce when the selected value changes
  const selectedDateDescription = createSelectedDateDescription(state);
  createEffect(
    () => ({ selectedDateDescription: selectedDateDescription() }),
    ({ selectedDateDescription: currentSelectedDateDescription }) => {
      if (currentSelectedDateDescription) {
        announce(currentSelectedDateDescription, "polite", 4000);
      }
      // handle an update to the caption that describes the currently selected range, to announce the new value
    },
    { defer: true, ssrSource: "client" }
  );

  const errorMessageId = createSlotId(() => [
    Boolean(props.errorMessage),
    props.isInvalid,
    getLegacyOption(props, "validationState"),
  ]);

  // Pass the label to the child grid elements.
  hookData.set(state, {
    get ariaLabel() {
      return props["aria-label"];
    },
    get ariaLabelledBy() {
      return props["aria-labelledby"];
    },
    get errorMessageId() {
      return errorMessageId();
    },
    get selectedDateDescription() {
      return selectedDateDescription();
    },
  });

  // If the next or previous buttons become disabled while they are focused, move focus to the calendar body.
  const [nextFocused, setNextFocused] = createSignal(false, {
    ownedWrite: true,
  });

  const nextDisabled = createMemo(
    () => getTruthyValue(props.isDisabled) ?? state.isNextVisibleRangeInvalid()
  );

  createEffect(
    () => ({ nextDisabled: nextDisabled(), nextFocused: nextFocused() }),
    ({
      nextFocused: currentNextFocused,
      nextDisabled: currentNextDisabled,
    }) => {
      if (currentNextDisabled && currentNextFocused) {
        setNextFocused(false);
        state.setFocused(true);
      }
    },
    { ssrSource: "client" }
  );

  const [previousFocused, setPreviousFocused] = createSignal(false, {
    ownedWrite: true,
  });

  const previousDisabled = createMemo(
    () =>
      getTruthyValue(props.isDisabled) ?? state.isPreviousVisibleRangeInvalid()
  );

  createEffect(
    () => ({
      previousDisabled: previousDisabled(),
      previousFocused: previousFocused(),
    }),
    ({
      previousFocused: currentPreviousFocused,
      previousDisabled: currentPreviousDisabled,
    }) => {
      if (currentPreviousDisabled && currentPreviousFocused) {
        setPreviousFocused(false);
        state.setFocused(true);
      }
    },
    { ssrSource: "client" }
  );

  const labelProps = createLabels({
    get "aria-label"() {
      return ariaValue(
        ariaValue(
          [props["aria-label"], visibleRangeDescription()]
            .filter(Boolean)
            .join(", ")
        )
      );
    },
    get "aria-labelledby"() {
      return ariaValue(ariaValue(props["aria-labelledby"]));
    },
    get id() {
      return props.id;
    },
  });

  return {
    get calendarProps() {
      return mergeProps(domProps(), labelProps, {
        "aria-describedby": ariaValue(
          getTruthyValue(props["aria-describedby"]) ?? undefined
        ),
        "aria-details": ariaValue(
          getTruthyValue(props["aria-details"]) ?? undefined
        ),
        role: "application" as const,
      });
    },
    get errorMessageProps() {
      return {
        get id() {
          return errorMessageId();
        },
      };
    },
    get nextButtonProps() {
      return {
        get "aria-label"() {
          return ariaValue(ariaValue(stringFormatter.format("next")));
        },
        get isDisabled() {
          return nextDisabled();
        },
        get onFocusChange() {
          return setNextFocused;
        },
        get onPress() {
          return () => {
            state.focusNextPage();
          };
        },
      };
    },
    get prevButtonProps() {
      return {
        get "aria-label"() {
          return ariaValue(ariaValue(stringFormatter.format("previous")));
        },
        get isDisabled() {
          return previousDisabled();
        },
        get onFocusChange() {
          return setPreviousFocused;
        },
        get onPress() {
          return () => {
            state.focusPreviousPage();
          };
        },
      };
    },
    get title() {
      return title();
    },
  };
}
