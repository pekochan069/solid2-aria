/*
 * Derived from Adobe React Spectrum: packages/react-aria/src/datepicker/useDatePickerGroup.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { DateFieldState } from "@solid2-aria/stately/datepicker/create-date-field-state";
import type { DatePickerState } from "@solid2-aria/stately/datepicker/create-date-picker-state";
import type { DateRangePickerState } from "@solid2-aria/stately/datepicker/create-date-range-picker-state";
import type { FocusableElement } from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { createMemo } from "solid-js";
import type { Accessor } from "solid-js";

import {
  createFocusManager,
  getFocusableTreeWalker,
} from "../focus/focus-scope";
import { createLocale } from "../i18n/i18n-provider";
import { createKeyboard } from "../interactions/create-keyboard";
import { createPress } from "../interactions/create-press";
import { getCurrentBrowserEvent } from "../utils/current-browser-event";
import {
  requireElement,
  requireFocusableElement,
  focusableElementOrNull,
} from "../utils/dom-value";
import { mergeProps } from "../utils/merge-props";
import { getEventTarget } from "../utils/shadowdom/dom-functions";
import { isTruthy } from "../utils/truthy";

export function createDatePickerGroup(
  state: DatePickerState | DateRangePickerState | DateFieldState,
  ref: Accessor<Element | null>,
  disableArrowNavigation?: Accessor<boolean>
): DOMAttributes {
  const _result0 = createLocale();

  const focusManager = createMemo(() => createFocusManager(ref));

  const _result1 = createKeyboard({
    get allowRepeats() {
      return true;
    },
    get shortcuts() {
      return {
        get "Alt+ArrowDown"() {
          return (): undefined | false => {
            if ("setOpen" in state) {
              state.setOpen(true);

              return undefined;
            }

            return false;
          };
        },
        get "Alt+ArrowUp"() {
          return (): undefined | false => {
            if ("setOpen" in state) {
              state.setOpen(true);

              return undefined;
            }

            return false;
          };
        },
        get ArrowLeft() {
          return (e: KeyboardEvent): undefined | false => {
            const refElement = ref();

            if (disableArrowNavigation?.() === true) {
              return false;
            }

            if (_result0.direction === "rtl") {
              if (refElement) {
                const target = requireFocusableElement(getEventTarget(e));

                const prev = findNextSegment(
                  refElement,
                  target.getBoundingClientRect().left,
                  -1
                );

                if (prev) {
                  prev.focus();
                }
              }
            } else {
              focusManager().focusPrevious();
            }

            return undefined;
          };
        },
        get ArrowRight() {
          return (e: KeyboardEvent): undefined | false => {
            const refElement = ref();

            if (disableArrowNavigation?.() === true) {
              return false;
            }

            if (_result0.direction === "rtl") {
              if (refElement) {
                const target = requireFocusableElement(getEventTarget(e));

                const next = findNextSegment(
                  refElement,
                  target.getBoundingClientRect().left,
                  1
                );

                if (next) {
                  next.focus();
                }
              }
            } else {
              focusManager().focusNext();
            }

            return undefined;
          };
        },
      };
    },
  });

  // Focus the first placeholder segment from the end on mouse down/touch up in the field.
  const focusLast = () => {
    const refElement = ref();

    if (!refElement) {
      return;
    }

    // Try to find the segment prior to the element that was clicked on.
    const event = getCurrentBrowserEvent();
    let target = event ? requireFocusableElement(getEventTarget(event)) : null;

    const walker = getFocusableTreeWalker(refElement, { tabbable: true });

    if (target) {
      walker.currentNode = target;
      target = focusableElementOrNull(walker.previousNode());
    }

    // If no target found, find the last element from the end.
    if (!target) {
      let last: FocusableElement | null;

      do {
        last = focusableElementOrNull(walker.lastChild());

        if (isTruthy(last)) {
          target = last;
        }
      } while (isTruthy(last));
    }

    // Now go backwards until we find an element that is not a placeholder.
    while (isTruthy(target) && Object.hasOwn(target.dataset, "placeholder")) {
      const prev = focusableElementOrNull(walker.previousNode());

      if (isTruthy(prev) && Object.hasOwn(prev.dataset, "placeholder")) {
        target = prev;
      } else {
        break;
      }
    }

    if (target) {
      target.focus();
    }
  };

  const _result2 = createPress({
    get allowTextSelectionOnPress() {
      return true;
    },
    onPress(e) {
      if (e.pointerType === "touch" || e.pointerType === "pen") {
        focusLast();
      }
    },
    onPressStart(e) {
      if (e.pointerType === "mouse") {
        focusLast();
      }
    },
    get preventFocusOnPress() {
      return true;
    },
  });

  return mergeProps(_result2.pressProps, _result1.keyboardProps);
}

function findNextSegment(group: Element, fromX: number, direction: number) {
  const walker = getFocusableTreeWalker(group, { tabbable: true });
  let node = walker.nextNode();
  let closest: FocusableElement | null = null;
  let closestDistance = Infinity;

  while (node) {
    const x = requireElement(node).getBoundingClientRect().left;
    const distance = x - fromX;
    const absoluteDistance = Math.abs(distance);

    if (
      Math.sign(distance) === direction &&
      absoluteDistance < closestDistance
    ) {
      closest = requireFocusableElement(node);
      closestDistance = absoluteDistance;
    }

    node = walker.nextNode();
  }

  return closest;
}
