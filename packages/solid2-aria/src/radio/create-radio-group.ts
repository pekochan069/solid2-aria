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
 * Derived from Adobe React Spectrum: packages/react-aria/src/radio/useRadioGroup.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  RadioGroupProps,
  RadioGroupState,
} from "@solid2-aria/stately/radio/create-radio-group-state";
import type {
  KeyboardEvent,
  AriaLabelingProps,
  AriaValidationProps,
  DOMProps,
  InputDOMProps,
  ValidationResult,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { merge, createMemo } from "solid-js";

import { getFocusableTreeWalker } from "../focus/focus-scope";
import { createLocale } from "../i18n/i18n-provider";
import { createFocusWithin } from "../interactions/create-focus-within";
import { createKeyboard } from "../interactions/create-keyboard";
import { createField } from "../label/create-field";
import type { FieldAria } from "../label/create-field";
import { ariaValue } from "../utils/aria-value";
import { createId } from "../utils/create-id";
import { getOwnerWindow } from "../utils/dom-helpers";
import { requireElement } from "../utils/dom-value";
import { filterDOMProps } from "../utils/filter-dom-props";
import { mergeProps } from "../utils/merge-props";
import { getEventTarget } from "../utils/shadowdom/dom-functions";
import { getTruthyValue, isTruthy } from "../utils/truthy";
import { radioGroupData } from "./utils";

export interface AriaRadioGroupProps
  extends
    RadioGroupProps,
    InputDOMProps,
    DOMProps,
    AriaLabelingProps,
    AriaValidationProps {}

export interface RadioGroupAria extends ValidationResult {
  /** Props for the radio group wrapper element. */
  radioGroupProps: DOMAttributes;
  /** Props for the radio group's visible label (if any). */
  labelProps: FieldAria["labelProps"];
  /** Props for the radio group description element, if any. */
  descriptionProps: DOMAttributes;
  /** Props for the radio group error message element, if any. */
  errorMessageProps: DOMAttributes;
}

/**
 * Provides the behavior and accessibility implementation for a radio group component.
 * Radio groups allow users to select a single item from a list of mutually exclusive options.
 *
 * @param props - Props for the radio group.
 * @param state - State for the radio group, as returned by `useRadioGroupState`.
 */
export function createRadioGroup(
  props: AriaRadioGroupProps,
  state: RadioGroupState
): RadioGroupAria {
  const _result0 = props;
  const _result1 = createLocale();
  const _result2 = createMemo(() => state.displayValidation);

  // shouldn't be labeled by a <label> element.
  const _result3 = createField(
    merge(props, {
      get errorMessage() {
        return (
          getTruthyValue(props.errorMessage) ?? _result2().validationErrors
        );
      },
      get isInvalid() {
        return state.isInvalid;
      },
      // Radio group is not an HTML input element so it
      get labelElementType(): "span" {
        return "span" as const;
      },
    })
  );

  const domProps = createMemo(() => filterDOMProps(props, { labelable: true }));

  // When the radio group loses focus, reset the focusable radio to null if
  // there is no selection. This allows tabbing into the group from either
  // direction to go to the first or last radio.
  const _result4 = createFocusWithin({
    onBlurWithin(e) {
      props.onBlur?.(e);

      if (!isTruthy(state.selectedValue)) {
        state.setLastFocusedValue(null);
      }
    },
    get onFocusWithin() {
      return props.onFocus;
    },
    get onFocusWithinChange() {
      return props.onFocusChange;
    },
  });

  function getNextElement(nextDir: "next" | "prev", e: KeyboardEvent) {
    const currentTarget = requireElement(e.currentTarget);

    const walker = getFocusableTreeWalker(currentTarget, {
      accept: (node) =>
        node instanceof getOwnerWindow(node).HTMLInputElement &&
        node.type === "radio",
      from: requireElement(getEventTarget(e)),
    });

    let nextElem;

    if (nextDir === "next") {
      nextElem = walker.nextNode();

      if (!nextElem) {
        walker.currentNode = currentTarget;
        nextElem = walker.firstChild();
      }
    } else {
      nextElem = walker.previousNode();

      if (!nextElem) {
        walker.currentNode = currentTarget;
        nextElem = walker.lastChild();
      }
    }

    if (nextElem instanceof getOwnerWindow(nextElem).HTMLInputElement) {
      // Call focus on nextElem so that keyboard navigation scrolls the radio into view
      nextElem.focus();
      state.setSelectedValue(nextElem.value);

      return true;
    }

    return false;
  }

  const _result5 = createKeyboard({
    get allowRepeats(): true {
      return true;
    },
    get shortcuts() {
      return {
        ArrowDown: (e: KeyboardEvent) => getNextElement("next", e),
        ArrowLeft: (e: KeyboardEvent) => {
          const nextDir: "next" | "prev" =
            _result1.direction === "rtl" &&
            (_result0.orientation ?? "vertical") !== "vertical"
              ? "next"
              : "prev";

          return getNextElement(nextDir, e);
        },
        ArrowRight: (e: KeyboardEvent) => {
          const nextDir: "next" | "prev" =
            _result1.direction === "rtl" &&
            (_result0.orientation ?? "vertical") !== "vertical"
              ? "prev"
              : "next";

          return getNextElement(nextDir, e);
        },
        ArrowUp: (e: KeyboardEvent) => getNextElement("prev", e),
      };
    },
  });

  const groupName = createId(() => _result0.name);
  radioGroupData.set(state, {
    get descriptionId() {
      const { id } = _result3.descriptionProps;

      return typeof id === "string" ? id : undefined;
    },
    get errorMessageId() {
      const { id } = _result3.errorMessageProps;

      return typeof id === "string" ? id : undefined;
    },
    get form() {
      return _result0.form;
    },
    get name() {
      return groupName();
    },
    get validationBehavior() {
      return _result0.validationBehavior ?? "aria";
    },
  });

  return {
    get descriptionProps() {
      return _result3.descriptionProps;
    },
    get errorMessageProps() {
      return _result3.errorMessageProps;
    },
    get isInvalid() {
      return _result2().isInvalid;
    },
    get labelProps() {
      return _result3.labelProps;
    },
    get radioGroupProps() {
      return mergeProps(domProps(), {
        // https://www.w3.org/TR/wai-aria-1.2/#radiogroup
        role: "radiogroup" as const,
        ..._result5.keyboardProps,
        "aria-disabled": ariaValue(
          getTruthyValue(_result0.isDisabled) ?? undefined
        ),
        "aria-errormessage": ariaValue(props["aria-errormessage"]),
        "aria-invalid": ariaValue(state.isInvalid || undefined),
        "aria-orientation": ariaValue(_result0.orientation ?? "vertical"),
        "aria-readonly": ariaValue(
          getTruthyValue(_result0.isReadOnly) ?? undefined
        ),
        "aria-required": ariaValue(
          getTruthyValue(_result0.isRequired) ?? undefined
        ),

        ..._result3.fieldProps,
        ..._result4.focusWithinProps,
      });
    },
    get validationDetails() {
      return _result2().validationDetails;
    },
    get validationErrors() {
      return _result2().validationErrors;
    },
  };
}
