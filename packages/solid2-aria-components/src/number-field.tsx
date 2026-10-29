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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/NumberField.tsx.
 * Modified for Solid Aria: composed Solid Aria and Stately primitives with Solid 2 contexts, reactive getters, and DOM refs; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createLocale } from "@solid2-aria/core/i18n/i18n-provider";
import { createNumberField } from "@solid2-aria/core/numberfield/create-number-field";
import type { AriaNumberFieldProps } from "@solid2-aria/core/numberfield/create-number-field";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { createNumberFieldState } from "@solid2-aria/stately/numberfield/create-number-field-state";
import type { NumberFieldState } from "@solid2-aria/stately/numberfield/create-number-field-state";
import type { InputDOMProps } from "@solid2-aria/types-shared";
import type { GlobalDOMAttributes } from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";
import { untrack, createSignal, merge, createContext, omit } from "solid-js";

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
  removeDataAttributes,
} from "./utils";
import type {
  ContextValue,
  RenderProps,
  SlotProps,
  Ref,
  RACValidation,
} from "./utils";

export interface NumberFieldRenderProps {
  isDisabled: boolean;
  isInvalid: boolean;
  isReadOnly: boolean;
  isRequired: boolean;
  state: NumberFieldState;
}

export interface NumberFieldProps
  extends
    Omit<
      AriaNumberFieldProps,
      | "label"
      | "placeholder"
      | "description"
      | "errorMessage"
      | "validationState"
      | "validationBehavior"
    >,
    RACValidation,
    InputDOMProps,
    RenderProps<NumberFieldRenderProps>,
    SlotProps,
    GlobalDOMAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export const NumberFieldContext =
  createContext<ContextValue<NumberFieldProps, HTMLDivElement>>(null);

export const NumberFieldStateContext = createContext<NumberFieldState | null>(
  null
);

export function NumberField(input: NumberFieldProps): JSX.Element {
  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    NumberFieldContext
  );

  const locale = createLocale();
  const form = createSlottedContext(FormContext);

  const options = mergeProps(props, {
    get locale() {
      return locale.locale;
    },
    get validationBehavior() {
      return props.validationBehavior ?? form?.validationBehavior ?? "native";
    },
  });

  const state = createNumberFieldState(options);

  const [inputRef, setInputRef] = createSignal<HTMLInputElement | null>(null, {
    ownedWrite: true,
  });

  const [registerLabel, label] = createSlot(
    () =>
      (props["aria-label"]?.length ?? 0) === 0 &&
      (props["aria-labelledby"]?.length ?? 0) === 0
  );

  const aria = createNumberField(
    mergeProps(removeDataAttributes(options), {
      get label() {
        return label();
      },
    }),
    state,
    inputRef
  );

  const values: NumberFieldRenderProps = {
    get isDisabled() {
      return props.isDisabled ?? false;
    },
    get isInvalid() {
      return aria.isInvalid;
    },
    get isReadOnly() {
      return props.isReadOnly ?? false;
    },
    get isRequired() {
      return props.isRequired ?? false;
    },
    state,
  };

  const render = createRenderProps(
    mergeProps(props, { defaultClass: "solid2-aria-NumberField", values })
  );

  return (
    <NumberFieldStateContext value={state}>
      <GroupContext
        value={
          // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
          merge(() => aria.groupProps)
          // oxlint-enable solid/reactivity
        }
      >
        <InputContext
          value={mergeProps(
            merge(() => aria.inputProps),
            {
              ref: (element: HTMLInputElement) => {
                setInputRef(element);
              },
            }
          )}
        >
          <LabelContext
            value={mergeProps(
              merge(() => aria.labelProps),
              { registerSlot: registerLabel }
            )}
          >
            <ButtonContext
              value={{
                slots: {
                  get decrement() {
                    return aria.decrementButtonProps;
                  },
                  get increment() {
                    return aria.incrementButtonProps;
                  },
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
                    slot={
                      typeof props.slot === "string" && props.slot.length > 0
                        ? props.slot
                        : undefined
                    }
                    data-disabled={props.isDisabled === true ? true : undefined}
                    data-readonly={props.isReadOnly === true ? true : undefined}
                    data-required={props.isRequired === true ? true : undefined}
                    data-invalid={aria.isInvalid || undefined}
                  >
                    {render.children}
                  </dom.div>
                  {(props.name?.length ?? 0) > 0 && (
                    <input
                      type="hidden"
                      name={props.name}
                      form={props.form}
                      value={
                        Number.isNaN(state.numberValue) ? "" : state.numberValue
                      }
                      disabled={props.isDisabled}
                    />
                  )}
                </FieldErrorContext>
              </TextContext>
            </ButtonContext>
          </LabelContext>
        </InputContext>
      </GroupContext>
    </NumberFieldStateContext>
  );
}
