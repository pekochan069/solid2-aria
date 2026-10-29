/*
 * Copyright 2022 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/SearchField.tsx.
 * Modified for Solid Aria: adapted components, contexts, refs, and reactive properties for Solid 2; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createIsHidden } from "@solid2-aria/core/collections/hidden";
import { createSearchField } from "@solid2-aria/core/searchfield/create-search-field";
import type { AriaSearchFieldProps } from "@solid2-aria/core/searchfield/create-search-field";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { isTruthy } from "@solid2-aria/core/utils/truthy";
import { createSearchFieldState } from "@solid2-aria/stately/searchfield/create-search-field-state";
import type { SearchFieldState } from "@solid2-aria/stately/searchfield/create-search-field-state";
import type { JSX } from "@solidjs/web";
import { untrack, createSignal, merge, createContext, omit } from "solid-js";

import { FieldInputContext } from "./autocomplete";
import { ButtonContext } from "./button";
import { FieldErrorContext } from "./field-error";
import { FormContext } from "./form";
import { GroupContext } from "./group";
import { InputContext } from "./input";
import { LabelContext } from "./label";
import { TextContext } from "./text";
import {
  dom,
  createContextProps,
  createRenderProps,
  createSlot,
  createSlottedContext,
} from "./utils";
import type { Ref, ContextValue, SlotProps, RenderProps } from "./utils";

export interface SearchFieldRenderProps {
  isEmpty: boolean;
  isDisabled: boolean;
  isInvalid: boolean;
  isReadOnly: boolean;
  isRequired: boolean;
  state: SearchFieldState;
}

export interface SearchFieldProps
  extends
    Omit<
      AriaSearchFieldProps,
      "label" | "description" | "errorMessage" | "children"
    >,
    SlotProps,
    RenderProps<SearchFieldRenderProps> {
  ref?: Ref<HTMLDivElement>;
}

export const SearchFieldContext =
  createContext<ContextValue<SearchFieldProps, HTMLDivElement>>(null);

export function SearchField(input: SearchFieldProps): JSX.Element {
  if (createIsHidden()) {
    // oxlint-disable-next-line solid/components-return-once -- Static collection traversal and context registration are fixed when the owner is created.
    return null;
  }

  const [ownProps, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    SearchFieldContext
  );

  const fieldInput = createSlottedContext(FieldInputContext);

  const props = mergeProps(
    fieldInput
      ? // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
        omit(fieldInput, "ref")
      : // oxlint-enable solid/reactivity
        {},
    ownProps
  );

  const form = createSlottedContext(FormContext);

  const [inputRef, setInputRef] = createSignal<HTMLInputElement | null>(null, {
    ownedWrite: true,
  });

  const [registerLabel, label] = createSlot(
    () => !isTruthy(props["aria-label"]) && !isTruthy(props["aria-labelledby"])
  );

  const options = mergeProps(props, {
    get label() {
      return label();
    },
    get validationBehavior() {
      return props.validationBehavior ?? form?.validationBehavior ?? "native";
    },
  });

  const state = createSearchFieldState(options);
  const aria = createSearchField(options, state, inputRef);

  const values: SearchFieldRenderProps = {
    get isDisabled() {
      return props.isDisabled === true;
    },
    get isEmpty() {
      return state.value === "";
    },
    get isInvalid() {
      return aria.isInvalid;
    },
    get isReadOnly() {
      return props.isReadOnly === true;
    },
    get isRequired() {
      return props.isRequired === true;
    },
    state,
  };

  const labelProps = mergeProps(
    merge(() => aria.labelProps),
    { registerSlot: registerLabel }
  );

  const inputProps = mergeProps(
    merge(() => aria.inputProps),
    {
      ref: (element: HTMLInputElement) => {
        setInputRef(element);
      },
    }
  );

  const clearProps = merge(() => aria.clearButtonProps);

  const render = createRenderProps(
    mergeProps(props, { defaultClass: "solid2-aria-SearchField", values })
  );

  return (
    <dom.div
      {
        // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
        ...omit(filterDOMProps(props, { global: true }), "id")
        // oxlint-enable solid/reactivity
      }
      {...render}
      ref={(element: HTMLDivElement) => {
        setRef(element);
      }}
      slot={props.slot ?? undefined}
      data-empty={values.isEmpty || undefined}
      data-disabled={props.isDisabled ?? undefined}
      data-invalid={aria.isInvalid || undefined}
      data-readonly={props.isReadOnly ?? undefined}
      data-required={props.isRequired ?? undefined}
    >
      <LabelContext value={labelProps}>
        <InputContext value={inputProps}>
          <ButtonContext value={clearProps}>
            <GroupContext
              value={{
                get isDisabled() {
                  return props.isDisabled === true;
                },
                get isInvalid() {
                  return aria.isInvalid;
                },
              }}
            >
              <TextContext
                value={{
                  slots: {
                    get description() {
                      return aria.descriptionProps;
                    },
                    get errorMessage() {
                      return aria.errorMessageProps;
                    },
                  },
                }}
              >
                <FieldErrorContext value={aria}>
                  {render.children}
                </FieldErrorContext>
              </TextContext>
            </GroupContext>
          </ButtonContext>
        </InputContext>
      </LabelContext>
    </dom.div>
  );
}
