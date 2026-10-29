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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/Switch.tsx.
 * Modified for Solid Aria: adapted components, contexts, refs, and reactive properties for Solid 2; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createFocusRing } from "@solid2-aria/core/focus/create-focus-ring";
import { createHover } from "@solid2-aria/core/interactions/create-hover";
import { createSwitch } from "@solid2-aria/core/switch/create-switch";
import type {
  AriaSwitchProps,
  SwitchAria,
} from "@solid2-aria/core/switch/create-switch";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { VisuallyHidden } from "@solid2-aria/core/visually-hidden/visually-hidden";
import { createToggleState } from "@solid2-aria/stately/toggle/create-toggle-state";
import type { ToggleState } from "@solid2-aria/stately/toggle/create-toggle-state";
import type { HoverEvents } from "@solid2-aria/types-shared";
import type { JSX } from "@solidjs/web";
import {
  merge,
  untrack,
  createSignal,
  createContext,
  useContext,
  omit,
} from "solid-js";
import type { Accessor } from "solid-js";

import { FormContext } from "./form";
import { SelectionIndicatorContext } from "./selection-indicator";
import { TextContext } from "./text";
import {
  dom,
  createContextProps,
  createRenderProps,
  createSlottedContext,
} from "./utils";
import type { Ref, ContextValue, SlotProps, RenderProps } from "./utils";

export interface SwitchRenderProps {
  isSelected: boolean;
  isHovered: boolean;
  isPressed: boolean;
  isFocused: boolean;
  isFocusVisible: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
  isInvalid: boolean;
  isRequired: boolean;
  state: ToggleState;
}

export type SwitchFieldRenderProps = Omit<
  SwitchRenderProps,
  "isHovered" | "isPressed" | "isFocused" | "isFocusVisible"
>;

export type SwitchButtonRenderProps = SwitchRenderProps;

export interface SwitchProps
  extends
    Omit<AriaSwitchProps, "children">,
    SlotProps,
    HoverEvents,
    RenderProps<SwitchRenderProps, "label"> {
  inputRef?: Ref<HTMLInputElement>;
  ref?: Ref<HTMLLabelElement>;
}

export interface SwitchFieldProps
  extends
    Omit<AriaSwitchProps, "children">,
    SlotProps,
    HoverEvents,
    RenderProps<SwitchFieldRenderProps> {
  inputRef?: Ref<HTMLInputElement>;
  ref?: Ref<HTMLDivElement>;
}

export interface SwitchButtonProps
  extends
    SlotProps,
    HoverEvents,
    RenderProps<SwitchButtonRenderProps, "label"> {
  id?: string;
  ref?: Ref<HTMLLabelElement>;
}

export const SwitchContext =
  createContext<ContextValue<SwitchProps, HTMLLabelElement>>(null);

export const SwitchFieldContext =
  createContext<ContextValue<SwitchFieldProps, HTMLDivElement>>(null);

interface InternalValue {
  aria: SwitchAria;
  inputRef: Accessor<HTMLInputElement | null>;
  setInputRef: (element: HTMLInputElement) => void;
  state: ToggleState;
  props: Omit<AriaSwitchProps, "children">;
  defaultClass: string;
}

const InternalContext = createContext<InternalValue | null>(null);
export const ToggleStateContext = createContext<ToggleState | null>(null);

function createAria(props: SwitchProps | SwitchFieldProps): InternalValue {
  const [inputRef, setInputRef] = createSignal<HTMLInputElement | null>(null, {
    ownedWrite: true,
  });

  const form = createSlottedContext(FormContext);

  const options = mergeProps(omit(props, "children"), {
    children: true,
    get validationBehavior() {
      return props.validationBehavior ?? form?.validationBehavior ?? "native";
    },
  });

  const state = createToggleState(props);
  const aria = createSwitch(options, state, inputRef);

  return {
    aria,
    defaultClass: "solid2-aria-Switch",
    inputRef,
    props,
    setInputRef: (element: HTMLInputElement) => {
      setInputRef(element);
    },
    state,
  };
}

function fieldValues(ctx: InternalValue): SwitchFieldRenderProps {
  return {
    get isDisabled() {
      return ctx.aria.isDisabled;
    },
    get isInvalid() {
      return ctx.aria.isInvalid;
    },
    get isReadOnly() {
      return ctx.aria.isReadOnly;
    },
    get isRequired() {
      return ctx.props.isRequired === true;
    },
    get isSelected() {
      return ctx.aria.isSelected;
    },
    state: ctx.state,
  };
}

export function Switch(input: SwitchProps): JSX.Element {
  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    SwitchContext
  );

  const ctx = createAria(props);

  return (
    <InternalContext value={ctx}>
      <SwitchButton
        {...props}
        ref={(element: HTMLLabelElement) => {
          setRef(element);
        }}
      />
    </InternalContext>
  );
}

export function SwitchField(input: SwitchFieldProps): JSX.Element {
  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    SwitchFieldContext
  );

  const ctx = createAria(props);
  ctx.defaultClass = "solid2-aria-SwitchButton";
  const values = fieldValues(ctx);

  const render = createRenderProps(
    mergeProps(props, { defaultClass: "solid2-aria-SwitchField", values })
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
                get errorMessage() {
                  return ctx.aria.errorMessageProps;
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

export function SwitchButton(props: SwitchButtonProps): JSX.Element {
  const ctx = useContext(InternalContext);

  if (!ctx) {
    throw new Error("SwitchButton must be inside SwitchField.");
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

  const values: SwitchButtonRenderProps = mergeProps(fields, {
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
