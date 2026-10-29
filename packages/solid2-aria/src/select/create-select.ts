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
 * Derived from Adobe React Spectrum: packages/react-aria/src/select/useSelect.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  SelectionMode,
  SelectProps,
  SelectState,
} from "@solid2-aria/stately/select/create-select-state";
import type {
  AriaLabelingProps,
  DOMProps,
  FocusableDOMProps,
  KeyboardDelegate,
  ValidationResult,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { merge, omit, createMemo } from "solid-js";
import type { Accessor } from "solid-js";

import type { AriaButtonProps } from "../button/create-button";
import { createCollator } from "../i18n/create-collator";
import { setInteractionModality } from "../interactions/create-focus-visible";
import { createKeyboard } from "../interactions/create-keyboard";
import { createField } from "../label/create-field";
import type { AriaListBoxOptions } from "../listbox/create-list-box";
import { createMenuTrigger } from "../menu/create-menu-trigger";
import { createTypeSelect } from "../selection/create-type-select";
import { ListKeyboardDelegate } from "../selection/list-keyboard-delegate";
import type { FocusEvent } from "../types";
import { ariaValue } from "../utils/aria-value";
import { chain } from "../utils/chain";
import { createId } from "../utils/create-id";
import { isNode } from "../utils/dom-helpers";
import { filterDOMProps } from "../utils/filter-dom-props";
import { isPresent } from "../utils/is-present";
import { getLegacyOption } from "../utils/legacy-option";
import { mergeProps } from "../utils/merge-props";
import { nodeContains } from "../utils/shadowdom/dom-functions";
import { getTruthyValue, isTruthy } from "../utils/truthy";
import type { HiddenSelectProps } from "./hidden-select";

export interface AriaSelectProps<T, M extends SelectionMode = "single">
  extends
    SelectProps<T, M>,
    DOMProps,
    AriaLabelingProps,
    Omit<FocusableDOMProps, "excludeFromTabOrder"> {
  /**
   * Describes the type of autocomplete functionality the input should provide if any. See
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefautocomplete).
   */
  autoComplete?: string;
  /**
   * The name of the input, used when submitting an HTML form.
   */
  name?: string;
  /**
   * The `<form>` element to associate the input with.
   * The value of this attribute must be the id of a `<form>` in the same document.
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#form).
   */
  form?: string;
}

export interface AriaSelectOptions<
  T,
  M extends SelectionMode = "single",
> extends Omit<AriaSelectProps<T, M>, "children"> {
  /**
   * An optional keyboard delegate implementation for type to select,
   * to override the default.
   */
  keyboardDelegate?: KeyboardDelegate;
}

export interface SelectAria<
  T,
  M extends SelectionMode = "single",
> extends ValidationResult {
  /** Props for the label element. */
  labelProps: DOMAttributes;
  /** Props for the popup trigger element. */
  triggerProps: AriaButtonProps;
  /** Props for the element representing the selected value. */
  valueProps: DOMAttributes;
  /** Props for the popup. */
  menuProps: AriaListBoxOptions<T>;
  /** Props for the select's description element, if any. */
  descriptionProps: DOMAttributes;
  /** Props for the select's error message element, if any. */
  errorMessageProps: DOMAttributes;
  /** Props for the hidden select element. */
  hiddenSelectProps: HiddenSelectProps<T, M>;
}

interface SelectData {
  isDisabled?: boolean;
  isRequired?: boolean;
  name?: string;
  form?: string;
  validationBehavior?: "aria" | "native";
}

type SelectDataOwner = Pick<SelectState<unknown>, "selectionManager">;

export const selectData = new WeakMap<SelectDataOwner, SelectData>();

/**
 * Provides the behavior and accessibility implementation for a select component.
 * A select displays a collapsible list of options and allows a user to select one of them.
 *
 * @param props - Props for the select.
 * @param state - State for the select, as returned by `useListState`.
 */
export function createSelect<T, M extends SelectionMode = "single">(
  props: AriaSelectOptions<T, M>,
  state: SelectState<T, M>,
  ref: Accessor<HTMLElement | null>
): SelectAria<T, M> {
  const _result0 = props;

  // By default, a KeyboardDelegate is provided which uses the DOM to query layout information (e.g. for page up/page down).
  // When virtualized, the layout object will be passed in as a prop and override this.
  const collator = createCollator({
    get sensitivity(): "base" {
      return "base";
    },
    get usage(): "search" {
      return "search";
    },
  });

  const delegate = createMemo(
    () =>
      getTruthyValue(_result0.keyboardDelegate) ??
      new ListKeyboardDelegate(
        state.collection,
        state.disabledKeys,
        ref,
        collator
      )
  );

  const _result1 = createMenuTrigger<T>(
    {
      get isDisabled() {
        return _result0.isDisabled;
      },
      get type(): "listbox" {
        return "listbox";
      },
    },
    state,
    ref
  );

  const _result2 = createKeyboard({
    get allowRepeats(): true {
      return true;
    },
    get onKeyDown() {
      return props.onKeyDown;
    },
    get onKeyUp() {
      return props.onKeyUp;
    },
    get shortcuts() {
      return {
        ArrowLeft: (): undefined | false => {
          if (state.selectionManager.selectionMode === "multiple") {
            return false;
          }

          const selectedKey = getLegacyOption(state, "selectedKey");

          const key = isPresent(selectedKey)
            ? delegate().getKeyAbove?.(selectedKey)
            : delegate().getFirstKey?.();

          if (isPresent(key)) {
            getLegacyOption(state, "setSelectedKey").call(state, key);
          }

          return undefined;
        },
        ArrowRight: (): undefined | false => {
          if (state.selectionManager.selectionMode === "multiple") {
            return false;
          }

          const selectedKey = getLegacyOption(state, "selectedKey");

          const key = isPresent(selectedKey)
            ? delegate().getKeyBelow?.(selectedKey)
            : delegate().getFirstKey?.();

          if (isPresent(key)) {
            getLegacyOption(state, "setSelectedKey").call(state, key);
          }

          return undefined;
        },
      };
    },
  });

  const { typeSelectProps } = createTypeSelect(
    {
      get isDisabled() {
        return state.selectionManager.selectionMode === "multiple";
      },
      get keyboardDelegate() {
        return delegate();
      },
      onTypeSelect(key) {
        getLegacyOption(state, "setSelectedKey").call(state, key);
      },
      get selectionManager() {
        return state.selectionManager;
      },
    },
    ref
  );

  const _result4 = createField(
    merge(props, {
      get errorMessage() {
        return (
          getTruthyValue(props.errorMessage) ??
          state.displayValidation.validationErrors
        );
      },
      get isInvalid() {
        return state.displayValidation.isInvalid;
      },
      get labelElementType(): "span" {
        return "span";
      },
    })
  );

  const domProps = createMemo(() => filterDOMProps(props, { labelable: true }));

  const triggerProps = createMemo(() =>
    mergeProps(
      state.selectionManager.selectionMode === "multiple"
        ? {}
        : typeSelectProps,
      _result1.menuTriggerProps,
      _result4.fieldProps
    )
  );

  const valueId = createId();
  selectData.set(state, {
    get form() {
      return props.form;
    },
    get isDisabled() {
      return props.isDisabled;
    },
    get isRequired() {
      return props.isRequired;
    },
    get name() {
      return props.name;
    },
    get validationBehavior() {
      return props.validationBehavior ?? "aria";
    },
  });

  return {
    get descriptionProps() {
      return _result4.descriptionProps;
    },
    get errorMessageProps() {
      return _result4.errorMessageProps;
    },
    get hiddenSelectProps() {
      return {
        get form() {
          return _result0.form;
        },
        get isDisabled() {
          return _result0.isDisabled;
        },
        get label() {
          return props.label;
        },
        get name() {
          return _result0.name;
        },
        get state() {
          return state;
        },
        get triggerRef() {
          return ref;
        },
      };
    },
    get isInvalid() {
      return state.displayValidation.isInvalid;
    },
    get labelProps() {
      return merge(_result4.labelProps, {
        onClick: () => {
          if (!isTruthy(props.isDisabled)) {
            ref()?.focus();
            // Show the focus ring so the user knows where focus went
            setInteractionModality("keyboard");
          }
        },
      });
    },
    get menuProps() {
      return merge(omit(_result1.menuProps, "onAction"), {
        get "aria-labelledby"() {
          return ariaValue(
            ariaValue(
              [
                _result4.fieldProps["aria-labelledby"],
                isTruthy(triggerProps()["aria-label"]) &&
                !isTruthy(_result4.fieldProps["aria-labelledby"])
                  ? triggerProps().id
                  : null,
              ]
                .filter(Boolean)
                .join(" ")
            )
          );
        },
        get autoFocus() {
          return getTruthyValue(state.focusStrategy) ?? true;
        },
        get disallowEmptySelection(): true {
          return true;
        },
        get linkBehavior(): "selection" {
          return "selection";
        },
        onAction: undefined,
        onFocusOut: (e: FocusEvent) => {
          if (
            isNode(e.relatedTarget) &&
            nodeContains(e.currentTarget, e.relatedTarget)
          ) {
            return;
          }

          if (props.onBlur) {
            props.onBlur(e);
          }

          if (props.onFocusChange) {
            props.onFocusChange(false);
          }

          state.setFocused(false);
        },
        get shouldFocusOnHover(): true {
          return true;
        },
        get shouldSelectOnPressUp(): true {
          return true;
        },
      });
    },
    get triggerProps() {
      return mergeProps(domProps(), {
        ...triggerProps(),
        "aria-labelledby": ariaValue(
          [
            valueId(),
            triggerProps()["aria-labelledby"],
            isTruthy(triggerProps()["aria-label"]) &&
            !isTruthy(triggerProps()["aria-labelledby"])
              ? triggerProps().id
              : null,
          ]
            .filter(Boolean)
            .join(" ")
        ),
        isDisabled: _result0.isDisabled,
        onBlur(e: FocusEvent) {
          if (state.isOpen) {
            return;
          }

          if (props.onBlur) {
            props.onBlur(e);
          }

          if (props.onFocusChange) {
            props.onFocusChange(false);
          }

          state.setFocused(false);
        },
        onFocus(e: FocusEvent) {
          if (state.isFocused) {
            return;
          }

          if (props.onFocus) {
            props.onFocus(e);
          }

          if (props.onFocusChange) {
            props.onFocusChange(true);
          }

          state.setFocused(true);
        },
        onKeyDown: chain(
          triggerProps().onKeyDown,
          _result2.keyboardProps.onKeyDown
        ),
        onKeyUp: _result2.keyboardProps.onKeyUp,
      });
    },
    get validationDetails() {
      return state.displayValidation.validationDetails;
    },
    get validationErrors() {
      return state.displayValidation.validationErrors;
    },
    get valueProps() {
      return {
        get id() {
          return valueId();
        },
      };
    },
  };
}
