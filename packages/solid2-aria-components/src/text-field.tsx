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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/TextField.tsx.
 * Modified for Solid Aria: adapted components, contexts, refs, and reactive properties for Solid 2; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createIsHidden } from "@solid2-aria/core/collections/hidden";
import { createTextField } from "@solid2-aria/core/textfield/create-text-field";
import type { AriaTextFieldProps } from "@solid2-aria/core/textfield/create-text-field";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { isTruthy } from "@solid2-aria/core/utils/truthy";
import type { JSX } from "@solidjs/web";
import {
  untrack,
  createSignal,
  merge,
  createContext,
  createMemo,
  omit,
} from "solid-js";

import { FieldInputContext } from "./autocomplete";
import { FieldErrorContext } from "./field-error";
import { FormContext } from "./form";
import { GroupContext } from "./group";
import { InputContext } from "./input";
import { LabelContext } from "./label";
import { TextContext } from "./text";
import { TextAreaContext } from "./text-area";
import {
  assignRef,
  dom,
  createContextProps,
  createRenderProps,
  createSlot,
  createSlottedContext,
} from "./utils";
import type { Ref, ContextValue, SlotProps, RenderProps } from "./utils";

export interface TextFieldRenderProps {
  isDisabled: boolean;
  isInvalid: boolean;
  isReadOnly: boolean;
  isRequired: boolean;
}

export interface TextFieldProps
  extends
    Omit<
      AriaTextFieldProps<HTMLInputElement | HTMLTextAreaElement>,
      "label" | "description" | "errorMessage" | "children"
    >,
    SlotProps,
    RenderProps<TextFieldRenderProps> {
  ref?: Ref<HTMLDivElement>;
}

export const TextFieldContext =
  createContext<ContextValue<TextFieldProps, HTMLDivElement>>(null);

export function TextField(input: TextFieldProps): JSX.Element {
  if (createIsHidden()) {
    // oxlint-disable-next-line solid/components-return-once -- Static collection traversal and context registration are fixed when the owner is created.
    return null;
  }

  const [ownProps, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    TextFieldContext
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

  const [inputRef, setInputRef] = createSignal<
    HTMLInputElement | HTMLTextAreaElement | null
  >(null, { ownedWrite: true });

  const [inputType, setInputType] = createSignal<"input" | "textarea">(
    "input",
    { ownedWrite: true }
  );

  const [registerLabel, label] = createSlot(
    () => !isTruthy(props["aria-label"]) && !isTruthy(props["aria-labelledby"])
  );

  const aria = createTextField(
    mergeProps(props, {
      get inputElementType() {
        return inputType();
      },
      get label() {
        return label();
      },
      get validationBehavior() {
        return props.validationBehavior ?? form?.validationBehavior ?? "native";
      },
    }),
    inputRef
  );

  const values: TextFieldRenderProps = {
    get isDisabled() {
      return props.isDisabled === true;
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
  };

  const render = createRenderProps(
    mergeProps(props, { defaultClass: "solid2-aria-TextField", values })
  );

  const labelProps = mergeProps(
    merge(() => aria.labelProps),
    { registerSlot: registerLabel }
  );

  const readInput = createMemo(() => aria.inputProps);

  const inputProps = mergeProps(merge(readInput), {
    ref: (el: HTMLInputElement | HTMLTextAreaElement | null) => {
      setInputRef(el);
      assignRef(
        untrack(() => fieldInput?.ref),
        el
      );

      if (el) {
        setInputType(el.localName === "textarea" ? "textarea" : "input");
      }
    },
  });

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
      data-disabled={props.isDisabled ?? undefined}
      data-invalid={aria.isInvalid || undefined}
      data-readonly={props.isReadOnly ?? undefined}
      data-required={props.isRequired ?? undefined}
    >
      <LabelContext value={labelProps}>
        <InputContext value={inputProps}>
          <TextAreaContext value={inputProps}>
            <GroupContext
              value={{
                get isDisabled() {
                  return props.isDisabled === true;
                },
                get isInvalid() {
                  return aria.isInvalid;
                },
                role: "presentation",
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
          </TextAreaContext>
        </InputContext>
      </LabelContext>
    </dom.div>
  );
}
