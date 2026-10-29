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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/RadioGroup.tsx.
 * Modified for Solid Aria: adapted components, contexts, refs, and reactive properties for Solid 2; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createFocusRing } from "@solid2-aria/core/focus/create-focus-ring";
import { createHover } from "@solid2-aria/core/interactions/create-hover";
import { createRadio } from "@solid2-aria/core/radio/create-radio";
import type {
  AriaRadioProps,
  RadioAria,
} from "@solid2-aria/core/radio/create-radio";
import { createRadioGroup } from "@solid2-aria/core/radio/create-radio-group";
import type { AriaRadioGroupProps } from "@solid2-aria/core/radio/create-radio-group";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { isTruthy } from "@solid2-aria/core/utils/truthy";
import { VisuallyHidden } from "@solid2-aria/core/visually-hidden/visually-hidden";
import { createRadioGroupState } from "@solid2-aria/stately/radio/create-radio-group-state";
import type { RadioGroupState } from "@solid2-aria/stately/radio/create-radio-group-state";
import type { HoverEvents } from "@solid2-aria/types-shared";
import type { JSX } from "@solidjs/web";
import {
  untrack,
  createSignal,
  merge,
  createContext,
  useContext,
  omit,
} from "solid-js";
import type { Accessor } from "solid-js";

import { FieldErrorContext } from "./field-error";
import { FormContext } from "./form";
import { LabelContext } from "./label";
import { SelectionIndicatorContext } from "./selection-indicator";
import { TextContext } from "./text";
import {
  dom,
  createContextProps,
  createRenderProps,
  createSlottedContext,
  createSlot,
} from "./utils";
import type { Ref, ContextValue, SlotProps, RenderProps } from "./utils";

export interface RadioRenderProps {
  isSelected: boolean;
  isHovered: boolean;
  isPressed: boolean;
  isFocused: boolean;
  isFocusVisible: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
  isInvalid: boolean;
  isRequired: boolean;
}

export type RadioFieldRenderProps = Omit<
  RadioRenderProps,
  "isHovered" | "isPressed" | "isFocused" | "isFocusVisible"
>;

export type RadioButtonRenderProps = RadioRenderProps;

export interface RadioProps
  extends
    Omit<AriaRadioProps, "children">,
    SlotProps,
    HoverEvents,
    RenderProps<RadioRenderProps, "label"> {
  inputRef?: Ref<HTMLInputElement>;
  ref?: Ref<HTMLLabelElement>;
}

export interface RadioFieldProps
  extends
    Omit<AriaRadioProps, "children">,
    SlotProps,
    HoverEvents,
    RenderProps<RadioFieldRenderProps> {
  inputRef?: Ref<HTMLInputElement>;
  ref?: Ref<HTMLDivElement>;
}

export interface RadioButtonProps
  extends SlotProps, HoverEvents, RenderProps<RadioButtonRenderProps, "label"> {
  id?: string;
  ref?: Ref<HTMLLabelElement>;
}

export const RadioContext =
  createContext<ContextValue<RadioProps, HTMLLabelElement>>(null);

export const RadioFieldContext =
  createContext<ContextValue<RadioFieldProps, HTMLDivElement>>(null);

interface InternalValue {
  aria: RadioAria;
  inputRef: Accessor<HTMLInputElement | null>;
  setInputRef: (element: HTMLInputElement) => void;
  state: RadioGroupState;
  props: Omit<AriaRadioProps, "children">;
  defaultClass: string;
}

const InternalContext = createContext<InternalValue | null>(null);

export const RadioGroupStateContext = createContext<RadioGroupState | null>(
  null
);

function createAria(props: RadioProps | RadioFieldProps): InternalValue {
  const [inputRef, setInputRef] = createSignal<HTMLInputElement | null>(null, {
    ownedWrite: true,
  });

  const form = createSlottedContext(FormContext);

  const options = mergeProps(omit(props, "children"), {
    children: true,
    get validationBehavior() {
      return form?.validationBehavior ?? "native";
    },
  });

  const state = useContext(RadioGroupStateContext);

  if (!state) {
    throw new Error("Radio must be inside RadioGroup.");
  }

  const aria = createRadio(options, state, inputRef);

  return {
    aria,
    defaultClass: "solid2-aria-Radio",
    inputRef,
    props,
    setInputRef: (element: HTMLInputElement) => {
      setInputRef(element);
    },
    state,
  };
}

function fieldValues(ctx: InternalValue): RadioFieldRenderProps {
  return {
    get isDisabled() {
      return ctx.aria.isDisabled;
    },
    get isInvalid() {
      return ctx.state.isInvalid;
    },
    get isReadOnly() {
      return ctx.state.isReadOnly;
    },
    get isRequired() {
      return ctx.state.isRequired;
    },
    get isSelected() {
      return ctx.aria.isSelected;
    },
  };
}

export function Radio(input: RadioProps): JSX.Element {
  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    RadioContext
  );

  const ctx = createAria(props);

  return (
    <InternalContext value={ctx}>
      <RadioButton
        {...props}
        ref={(element: HTMLLabelElement) => {
          setRef(element);
        }}
      />
    </InternalContext>
  );
}

export function RadioField(input: RadioFieldProps): JSX.Element {
  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    RadioFieldContext
  );

  const ctx = createAria(props);
  ctx.defaultClass = "solid2-aria-RadioButton";
  const values = fieldValues(ctx);

  const render = createRenderProps(
    mergeProps(props, { defaultClass: "solid2-aria-RadioField", values })
  );

  return (
    <dom.div
      {
        // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
        ...omit(filterDOMProps(props, { global: true }), "id", "onClick")
        // oxlint-enable solid/reactivity
      }
      {...render}
      ref={(element: HTMLDivElement) => {
        setRef(element);
      }}
      slot={props.slot ?? undefined}
      data-selected={values.isSelected || undefined}
      data-disabled={values.isDisabled || undefined}
      data-invalid={values.isInvalid || undefined}
      data-readonly={values.isReadOnly || undefined}
      data-required={values.isRequired || undefined}
    >
      <InternalContext value={ctx}>
        <SelectionIndicatorContext
          value={{
            get isSelected() {
              return values.isSelected;
            },
          }}
        >
          <TextContext
            value={{
              slots: {
                get description() {
                  return ctx.aria.descriptionProps;
                },
              },
            }}
          >
            {render.children}
          </TextContext>
        </SelectionIndicatorContext>
      </InternalContext>
    </dom.div>
  );
}

export function RadioButton(props: RadioButtonProps): JSX.Element {
  const ctx = useContext(InternalContext);

  if (!ctx) {
    throw new Error("RadioButton must be inside RadioField.");
  }

  const focus = createFocusRing();
  const fields = fieldValues(ctx);

  const hover = createHover(
    mergeProps(props, {
      get isDisabled() {
        return fields.isDisabled || fields.isReadOnly;
      },
    })
  );

  const values: RadioButtonRenderProps = mergeProps(fields, {
    get isFocusVisible() {
      return focus.isFocusVisible;
    },
    get isFocused() {
      return focus.isFocused;
    },
    get isHovered() {
      return hover.isHovered;
    },
    get isPressed() {
      return ctx.aria.isPressed;
    },
  });

  const render = createRenderProps(
    mergeProps(props, {
      get defaultClass() {
        return ctx.defaultClass;
      },
      values,
    })
  );

  return (
    <dom.label
      {...mergeProps(
        omit(filterDOMProps(props, { global: true }), "id", "onClick"),
        merge(() => ctx.aria.labelProps ?? {}),
        merge(() => hover.hoverProps ?? {}),
        render
      )}
      ref={props.ref}
      slot={props.slot ?? undefined}
      data-selected={fields.isSelected || undefined}
      data-disabled={fields.isDisabled || undefined}
      data-readonly={fields.isReadOnly || undefined}
      data-invalid={fields.isInvalid || undefined}
      data-required={fields.isRequired || undefined}
      data-pressed={ctx.aria.isPressed || undefined}
      data-hovered={hover.isHovered || undefined}
      data-focused={focus.isFocused || undefined}
      data-focus-visible={focus.isFocusVisible || undefined}
    >
      <VisuallyHidden elementType="span">
        <input
          {...mergeProps(
            merge(() => ctx.aria.inputProps ?? {}),
            merge(() => focus.focusProps ?? {})
          )}
          ref={(element: HTMLInputElement) => {
            ctx.setInputRef(element);
          }}
        />
      </VisuallyHidden>
      {render.children}
    </dom.label>
  );
}

export interface RadioGroupRenderProps {
  isDisabled: boolean;
  isReadOnly: boolean;
  isRequired: boolean;
  isInvalid: boolean;
  state: RadioGroupState;
  orientation: "horizontal" | "vertical";
}

export interface RadioGroupProps
  extends
    Omit<
      AriaRadioGroupProps,
      "children" | "label" | "description" | "errorMessage"
    >,
    SlotProps,
    RenderProps<RadioGroupRenderProps> {
  ref?: Ref<HTMLDivElement>;
}

export const RadioGroupContext =
  createContext<ContextValue<RadioGroupProps, HTMLDivElement>>(null);

export function RadioGroup(input: RadioGroupProps): JSX.Element {
  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    RadioGroupContext
  );

  const form = createSlottedContext(FormContext);

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

  const state = createRadioGroupState(options);
  const aria = createRadioGroup(options, state);

  const values: RadioGroupRenderProps = {
    get isDisabled() {
      return state.isDisabled;
    },
    get isInvalid() {
      return state.isInvalid;
    },
    get isReadOnly() {
      return state.isReadOnly;
    },
    get isRequired() {
      return props.isRequired === true;
    },
    get orientation() {
      return props.orientation ?? "vertical";
    },
    state,
  };

  const labelProps = mergeProps(
    merge(() => aria.labelProps),
    { elementType: "span" as const, registerSlot: registerLabel }
  );

  const render = createRenderProps(
    mergeProps(props, { defaultClass: "solid2-aria-RadioGroup", values })
  );

  return (
    <dom.div
      {...mergeProps(
        filterDOMProps(props, { global: true }),
        merge(() => aria.radioGroupProps ?? {}),
        render
      )}
      ref={(element: HTMLDivElement) => {
        setRef(element);
      }}
      slot={props.slot ?? undefined}
      data-disabled={values.isDisabled || undefined}
      data-readonly={values.isReadOnly || undefined}
      data-required={values.isRequired || undefined}
      data-invalid={values.isInvalid || undefined}
      data-orientation={values.orientation}
    >
      <RadioGroupStateContext value={state}>
        <LabelContext value={labelProps}>
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
        </LabelContext>
      </RadioGroupStateContext>
    </dom.div>
  );
}
