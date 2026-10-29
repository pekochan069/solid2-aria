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
 * Derived from Adobe React Spectrum: packages/react-aria/src/datepicker/useDateSegment.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { CalendarDate, toCalendar } from "@internationalized/date";
import { NumberParser } from "@internationalized/number";
import type {
  DateFieldState,
  DateSegment,
} from "@solid2-aria/stately/datepicker/create-date-field-state";
import { untrack, createMemo, createEffect } from "solid-js";
import type { Accessor } from "solid-js";

import { createDateFormatter } from "../i18n/create-date-formatter";
import { createFilter } from "../i18n/create-filter";
import { createLocale } from "../i18n/i18n-provider";
import { createKeyboard } from "../interactions/create-keyboard";
import { createSpinButton } from "../spinbutton/create-spin-button";
import type {
  HTMLAttributes as NativeHTMLAttributes,
  CSSProperties,
} from "../types";
import { ariaValue } from "../utils/aria-value";
import { createEvent } from "../utils/create-event";
import { createId } from "../utils/create-id";
import { createLabels } from "../utils/create-labels";
import { getScrollParent } from "../utils/get-scroll-parent";
import { isPresent } from "../utils/is-present";
import { mergeProps } from "../utils/merge-props";
import { noop } from "../utils/noop";
import { isIOS } from "../utils/platform";
import { requireValue } from "../utils/require-value";
import { scrollIntoViewport } from "../utils/scroll-into-view";
import {
  getActiveElement,
  nodeContains,
} from "../utils/shadowdom/dom-functions";
import { isTruthy } from "../utils/truthy";
import { hookData } from "./create-date-field";
import { createDisplayNames } from "./create-display-names";

export interface DateSegmentAria {
  /** Props for the segment element. */
  segmentProps: NativeHTMLAttributes<HTMLDivElement>;
}

/**
 * Provides the behavior and accessibility implementation for a segment in a date field.
 * A date segment displays an individual unit of a date and time, and allows users to edit
 * the value by typing or using the arrow keys to increment and decrement.
 */
const documentRef = () => (typeof document === "undefined" ? null : document);

export function createDateSegment(
  segmentInput: DateSegment | (() => DateSegment),
  state: DateFieldState,
  ref: Accessor<HTMLElement | null>
): DateSegmentAria {
  const segment = () =>
    typeof segmentInput === "function" ? segmentInput() : segmentInput;

  let enteredKeys = "";
  const _result0 = createLocale();
  const displayNames = createDisplayNames();

  const fieldData = requireValue(
    hookData.get(state),
    "Expected hookData.get(state)"
  );

  const options = createMemo(() => state.dateFormatter.resolvedOptions());

  const monthDateFormatter = createDateFormatter({
    get month() {
      return "long" as const;
    },
    get timeZone() {
      return options().timeZone;
    },
  });

  const hourDateFormatter = createDateFormatter({
    get hour() {
      return "numeric" as const;
    },
    get hour12() {
      return options().hour12;
    },
    get timeZone() {
      return options().timeZone;
    },
  });

  const textValue = createMemo(() => {
    let value = segment().isPlaceholder ? "" : segment().text;

    if (segment().type === "month" && !segment().isPlaceholder) {
      const month = monthDateFormatter.format(state.dateValue);
      value = month === value ? month : `${value} – ${month}`;
    } else if (segment().type === "hour" && !segment().isPlaceholder) {
      value = hourDateFormatter.format(state.dateValue);
    }

    return value;
  });

  const _result1 = createSpinButton({
    get isDisabled() {
      return state.isDisabled;
    },
    get isReadOnly() {
      return state.isReadOnly || !segment().isEditable;
    },
    get isRequired() {
      return state.isRequired;
    },
    get maxValue() {
      return segment().maxValue;
    },
    get minValue() {
      return segment().minValue;
    },
    get onDecrement() {
      return () => {
        enteredKeys = "";
        state.decrement(segment().type);
      };
    },
    get onDecrementPage() {
      return () => {
        enteredKeys = "";
        state.decrementPage(segment().type);
      };
    },
    get onDecrementToMin() {
      return () => {
        enteredKeys = "";
        state.decrementToMin(segment().type);
      };
    },
    get onIncrement() {
      return () => {
        enteredKeys = "";
        state.increment(segment().type);
      };
    },
    get onIncrementPage() {
      return () => {
        enteredKeys = "";
        state.incrementPage(segment().type);
      };
    },
    get onIncrementToMax() {
      return () => {
        enteredKeys = "";
        state.incrementToMax(segment().type);
      };
    },
    get textValue() {
      return textValue();
    },
    // The ARIA spec says aria-valuenow is optional if there's no value, but aXe seems to require it.
    // This doesn't seem to have any negative effects with real AT since we also use aria-valuetext.
    // https://github.com/dequelabs/axe-core/issues/3505
    get value() {
      return segment().value ?? undefined;
    },
  });

  const parser = createMemo(
    () => new NumberParser(_result0.locale, { maximumFractionDigits: 0 })
  );

  const backspace = () => {
    if (segment().text === segment().placeholder) {
      fieldData.focusManager.focusPrevious();
    }

    if (
      parser().isValidPartialNumber(segment().text) &&
      !state.isReadOnly &&
      !segment().isPlaceholder
    ) {
      let newValue = segment().text.slice(0, -1);
      const parsed = parser().parse(newValue);
      newValue = parsed === 0 ? "" : newValue;

      if (newValue.length === 0 || parsed === 0) {
        state.clearSegment(segment().type);
      } else {
        state.setSegment(segment().type, parsed);
      }

      enteredKeys = newValue;
    } else if (segment().type === "dayPeriod" || segment().type === "era") {
      state.clearSegment(segment().type);
    }
  };

  const _result2 = createKeyboard({
    get allowRepeats() {
      return true;
    },
    get shortcuts() {
      return {
        get Backspace() {
          return () => {
            backspace();
          };
        },
        get Delete() {
          return () => {
            backspace();
          };
        },
        get "Mod+a"() {
          return noop;
        },
      };
    },
  });

  // Safari dayPeriod option doesn't work...
  const _result3 = createFilter({
    get sensitivity() {
      return "base" as const;
    },
  });

  const amPmFormatter = createDateFormatter({
    get hour() {
      return "numeric" as const;
    },
    get hour12() {
      return true;
    },
  });

  const am = createMemo(() => {
    const date = new Date();
    date.setHours(0);

    return requireValue(
      amPmFormatter
        .formatToParts(date)
        .find((part) => part.type === "dayPeriod"),
      'Expected amPmFormatter .formatToParts(date) .find((part) => part.type === "dayP'
    ).value;
  });

  const pm = createMemo(() => {
    const date = new Date();
    date.setHours(12);

    return requireValue(
      amPmFormatter
        .formatToParts(date)
        .find((part) => part.type === "dayPeriod"),
      'Expected amPmFormatter .formatToParts(date) .find((part) => part.type === "dayP'
    ).value;
  });

  // Get a list of formatted era names so users can type the first character to choose one.
  const eraFormatter = createDateFormatter({
    get era() {
      return "narrow" as const;
    },
    get timeZone() {
      return "UTC" as const;
    },
    get year() {
      return "numeric" as const;
    },
  });

  const eras = createMemo(() => {
    if (segment().type !== "era") {
      return [];
    }

    const date = toCalendar(new CalendarDate(1, 1, 1), state.calendar);

    const erasValue = state.calendar.getEras().map((era) => {
      const eraDate = date
        .set({ day: 1, era, month: 1, year: 1 })
        .toDate("UTC");

      const parts = eraFormatter.formatToParts(eraDate);
      // Some eras have no localized name in CLDR (e.g. the Coptic 'BCE' era), in which case
      // Intl omits the era part entirely. Fall back to the era identifier so it stays typeable.
      const formatted = parts.find((p) => p.type === "era")?.value ?? era;

      return { era, formatted };
    });

    // Remove the common prefix from formatted values. This is so that in calendars with eras like
    // ERA0 and ERA1 (e.g. Ethiopic), users can press "0" and "1" to select an era. In other cases,
    // the first letter is used.
    const prefixLength = commonPrefixLength(
      erasValue.map((era) => era.formatted)
    );

    if (prefixLength) {
      for (const era of erasValue) {
        era.formatted = era.formatted.slice(prefixLength);
      }
    }

    return erasValue;
  });

  const onInput = (key: string) => {
    if (state.isDisabled || state.isReadOnly) {
      return;
    }

    const newValue = enteredKeys + key;

    switch (segment().type) {
      case "dayPeriod": {
        if (_result3.startsWith(am(), key)) {
          state.setSegment("dayPeriod", 0);
        } else if (_result3.startsWith(pm(), key)) {
          state.setSegment("dayPeriod", 1);
        } else {
          break;
        }

        fieldData.focusManager.focusNext();
        break;
      }

      case "era": {
        const matched = eras().find((e) =>
          _result3.startsWith(e.formatted, key)
        );

        if (matched) {
          state.setSegment("era", matched.era);
          fieldData.focusManager.focusNext();
        }

        break;
      }

      case "day":
      case "hour":
      case "minute":
      case "second":
      case "month":
      case "year": {
        if (!parser().isValidPartialNumber(newValue)) {
          return;
        }

        const numberValue = parser().parse(newValue);
        let segmentValue = numberValue;
        const { maxValue } = segment();

        if (maxValue !== undefined && numberValue > maxValue) {
          segmentValue = parser().parse(key);
        }

        if (Number.isNaN(numberValue)) {
          return;
        }

        state.setSegment(segment().type, segmentValue);

        if (
          maxValue !== undefined &&
          (Number(`${numberValue}0`) > maxValue ||
            newValue.length >= String(maxValue).length)
        ) {
          enteredKeys = "";
          fieldData.focusManager.focusNext();
        } else {
          enteredKeys = newValue;
        }

        break;
      }

      case "literal": {
        throw new Error('Not implemented yet: "literal" case');
      }

      case "timeZoneName": {
        throw new Error('Not implemented yet: "timeZoneName" case');
      }

      default: {
        break;
      }
    }
  };

  const onFocus = () => {
    const refElement = ref();
    enteredKeys = "";

    if (refElement) {
      scrollIntoViewport(refElement, {
        containingElement: getScrollParent(refElement),
      });
    }

    // Collapse selection to start or Chrome won't fire input events.
    const selection = window.getSelection();
    selection?.collapse(refElement);
  };

  createEvent(documentRef, "selectionchange", () => {
    // Enforce that the selection is collapsed when inside a date segment().
    // Otherwise, when tapping on a segment() in Android Chrome and then entering text,
    // composition events will be fired that break the DOM structure and crash the page.
    const selection = window.getSelection();

    // Only collapse while focused, otherwise a stale anchor left in the segment (e.g. on Firefox)
    // steals focus back into it on selectionchange. See #10259.
    if (
      selection?.anchorNode &&
      nodeContains(ref(), selection?.anchorNode) &&
      getActiveElement() === ref()
    ) {
      selection.collapse(ref());
    }
  });
  let compositionRef: string | null = "";
  createEvent(ref, "beforeinput", (e) => {
    const refElement = ref();

    if (!refElement) {
      return;
    }

    e.preventDefault();

    switch (e.inputType) {
      case "deleteContentBackward":
      case "deleteContentForward": {
        if (
          parser().isValidPartialNumber(segment().text) &&
          !state.isReadOnly
        ) {
          backspace();
        }

        break;
      }

      case "insertCompositionText": {
        // insertCompositionText cannot be canceled.
        // Record the current state of the element so we can restore it in the `input` event below.
        compositionRef = refElement.textContent;
        // Safari gets stuck in a composition state unless we also assign to the value here.
        // eslint-disable-next-line no-self-assign
        refElement.textContent = refElement.textContent;
        break;
      }

      default: {
        if (isPresent(e.data)) {
          onInput(e.data);
        }

        break;
      }
    }
  });
  createEvent(ref, "input", (e) => {
    const refElement = ref();
    const { inputType, data } = e;

    switch (inputType) {
      case "insertCompositionText": {
        // Reset the DOM to how it was in the beforeinput event.
        if (refElement) {
          refElement.textContent = compositionRef;
        }

        // Android sometimes fires key presses of letters as composition events. Need to handle am/pm keys here too.
        // Can also happen e.g. with Pinyin keyboard on iOS.
        if (
          isPresent(data) &&
          (_result3.startsWith(am(), data) || _result3.startsWith(pm(), data))
        ) {
          onInput(data);
        }

        break;
      }

      default: {
        break;
      }
    }
  });
  createEffect(
    () => ({ input1: fieldData.focusManager, observedElement: ref() }),
    ({ observedElement }) => {
      const element = observedElement;

      return () => {
        // If the focused segment() is removed, focus the previous one, or the next one if there was no previous one.
        if (getActiveElement() === element) {
          const prev = fieldData.focusManager.focusPrevious();

          if (!prev) {
            fieldData.focusManager.focusNext();
          }
        }
      };
    },
    { ssrSource: "client" }
  );

  // spinbuttons cannot be focused with VoiceOver on iOS.
  const touchPropOverrides = createMemo(() =>
    isIOS() || segment().type === "timeZoneName"
      ? {
          "aria-valuemax": ariaValue(null),
          "aria-valuemin": ariaValue(null),
          "aria-valuenow": ariaValue(null),
          "aria-valuetext": ariaValue(null),
          role: "textbox",
        }
      : {}
  );

  // Only apply aria-describedby to the first segment(), unless the field is invalid. This avoids it being
  // read every time the user navigates to a new segment().
  const firstSegment = createMemo(() =>
    state.segments.find((s) => s.isEditable)
  );

  const ariaDescribedBy = createMemo(() =>
    segment() !== firstSegment() && !state.isInvalid
      ? undefined
      : fieldData.ariaDescribedBy
  );

  const id = createId();

  const isEditable = createMemo(
    () => !state.isDisabled && !state.isReadOnly && segment().isEditable
  );

  // Prepend the label passed from the field to each segment() name.
  // This is needed because VoiceOver on iOS does not announce groups.
  const name = createMemo(() => {
    const { type } = segment();

    return type === "literal" ? "" : displayNames.of(type);
  });

  const labelProps = createLabels({
    get "aria-label"() {
      return ariaValue(
        ariaValue(
          `${name()}${isTruthy(fieldData.ariaLabel) ? `, ${fieldData.ariaLabel}` : ""}${isTruthy(fieldData.ariaLabelledBy) ? ", " : ""}`
        )
      );
    },
    get "aria-labelledby"() {
      return ariaValue(ariaValue(fieldData.ariaLabelledBy));
    },
  });

  // Literal segments should not be visible to screen readers. We don't really need any of the above,
  // but the rules of hooks mean hooks cannot be conditional so we have to put this condition here.
  if (untrack(() => segment().type === "literal")) {
    return {
      get segmentProps() {
        return {
          get "aria-hidden"() {
            return ariaValue(ariaValue(true));
          },
        };
      },
    };
  }

  const segmentStyle = createMemo(() => {
    const style: CSSProperties = { "caret-color": "transparent" };

    if (_result0.direction === "rtl") {
      // While the bidirectional algorithm seems to work properly on inline elements with actual values, it returns different results for placeholder strings.
      // To ensure placeholder render in correct format, we apply the CSS equivalent of LRE (left-to-right embedding). See https://www.unicode.org/reports/tr9/#Explicit_Directional_Embeddings.
      // However, we apply this to both placeholders and date segments with an actual value because the date segments will shift around when deleting otherwise.
      style["unicode-bidi"] = "embed";
      const { type } = segment();
      const format = type === "literal" ? undefined : options()[type];

      if (format === "numeric" || format === "2-digit") {
        style.direction = "ltr";
      }
    }

    return style;
  });

  return {
    get segmentProps() {
      return mergeProps(_result1.spinButtonProps, labelProps, {
        id: id(),
        ...touchPropOverrides(),
        ..._result2.keyboardProps,
        "aria-describedby": ariaValue(ariaDescribedBy()),
        "aria-invalid": ariaValue(state.isInvalid ? "true" : undefined),
        "aria-readonly": ariaValue(
          state.isReadOnly || !segment().isEditable ? "true" : undefined
        ),
        autocorrect: isEditable() ? ("off" as const) : undefined,
        contenteditable: isEditable(),
        "data-placeholder": segment().isPlaceholder || undefined,
        enterkeyhint: isEditable() ? ("next" as const) : undefined,
        inputmode:
          state.isDisabled ||
          segment().type === "dayPeriod" ||
          segment().type === "era" ||
          !isEditable()
            ? undefined
            : ("numeric" as const),
        onFocus,
        onMouseDown(e: MouseEvent) {
          e.stopPropagation();
        },
        // Prevent pointer events from reaching useDatePickerGroup, and allow native browser behavior to focus the segment().
        onPointerDown(e: PointerEvent) {
          e.stopPropagation();
        },
        spellcheck: isEditable() ? ("false" as const) : undefined,
        style: segmentStyle(),
        tabindex: state.isDisabled ? undefined : 0,
      });
    },
  };
}

function commonPrefixLength(strings: string[]): number {
  // Sort the strings, and compare the characters in the first and last to find the common prefix.
  strings.sort();
  const first = strings[0] ?? "";
  const last = strings.at(-1) ?? "";

  for (let i = 0; i < first.length; i += 1) {
    if (first[i] !== last[i]) {
      return i;
    }
  }

  return 0;
}
