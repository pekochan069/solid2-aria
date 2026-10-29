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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/ColorField.tsx.
 * Modified for Solid Aria: composed Solid Aria and Stately primitives with Solid 2 contexts, reactive getters, and DOM refs; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createColorChannelField } from "@solid2-aria/core/color/create-color-channel-field";
import { createColorField } from "@solid2-aria/core/color/create-color-field";
import type {
  AriaColorFieldProps,
  ColorFieldAria,
} from "@solid2-aria/core/color/create-color-field";
import { createLocale } from "@solid2-aria/core/i18n/i18n-provider";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { createColorChannelFieldState } from "@solid2-aria/stately/color/create-color-channel-field-state";
import { createColorFieldState } from "@solid2-aria/stately/color/create-color-field-state";
import type { ColorFieldState } from "@solid2-aria/stately/color/create-color-field-state";
import type {
  ColorChannel,
  ColorSpace,
} from "@solid2-aria/stately/color/types";
import type { GlobalDOMAttributes } from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";
import {
  untrack,
  createSignal,
  merge,
  createContext,
  Show,
  omit,
} from "solid-js";

import { FieldErrorContext } from "./field-error";
import { GroupContext } from "./group";
import { InputContext } from "./input";
import { LabelContext } from "./label";
import { TextContext } from "./text";
import {
  dom,
  assignRef,
  createContextProps,
  createRenderProps,
  createSlot,
  removeDataAttributes,
} from "./utils";
import type {
  ContextValue,
  RenderProps,
  SlotProps,
  Ref,
  RACValidation,
} from "./utils";

export interface ColorFieldRenderProps {
  isDisabled: boolean;
  isInvalid: boolean;
  isReadOnly: boolean;
  isRequired: boolean;
  channel: ColorChannel | "hex";
  state: ColorFieldState;
}

export interface ColorFieldProps
  extends
    Omit<
      AriaColorFieldProps,
      | "label"
      | "placeholder"
      | "description"
      | "errorMessage"
      | "validationState"
      | "validationBehavior"
    >,
    RACValidation,
    RenderProps<ColorFieldRenderProps>,
    SlotProps,
    GlobalDOMAttributes<HTMLDivElement> {
  channel?: ColorChannel;
  colorSpace?: ColorSpace;
  ref?: Ref<HTMLDivElement>;
}

export const ColorFieldContext =
  createContext<ContextValue<ColorFieldProps, HTMLDivElement>>(null);

export const ColorFieldStateContext = createContext<ColorFieldState | null>(
  null
);

export function ColorField(input: ColorFieldProps): JSX.Element {
  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    ColorFieldContext
  );

  return (
    <Show
      when={props.channel}
      fallback={
        <HexColorField
          {...props}
          ref={(element: HTMLDivElement) => {
            setRef(element);
          }}
        />
      }
    >
      {(channel) => (
        <ColorChannelField
          {...props}
          ref={(element: HTMLDivElement) => {
            setRef(element);
          }}
          channel={channel()}
        />
      )}
    </Show>
  );
}

function HexColorField(props: ColorFieldProps): JSX.Element {
  const options = mergeProps(props, {
    get validationBehavior() {
      return props.validationBehavior ?? "native";
    },
  });

  const state = createColorFieldState(options);

  const [inputRef, setInputRef] = createSignal<HTMLInputElement | null>(null, {
    ownedWrite: true,
  });

  const [registerLabel, label] = createSlot(
    () =>
      (props["aria-label"]?.length ?? 0) === 0 &&
      (props["aria-labelledby"]?.length ?? 0) === 0
  );

  const aria = createColorField(
    mergeProps(removeDataAttributes(options), {
      get label() {
        return label();
      },
    }),
    state,
    inputRef
  );

  return (
    <ColorFieldChildren
      props={props}
      state={state}
      aria={aria}
      inputRef={(element: HTMLInputElement) => {
        setInputRef(element);
      }}
      registerLabel={registerLabel}
    />
  );
}

function ColorChannelField(
  props: ColorFieldProps & { channel: ColorChannel }
): JSX.Element {
  const locale = createLocale();

  const options = mergeProps(props, {
    get locale() {
      return locale.locale;
    },
    get validationBehavior() {
      return props.validationBehavior ?? "native";
    },
  });

  const state = createColorChannelFieldState(options);

  const [inputRef, setInputRef] = createSignal<HTMLInputElement | null>(null, {
    ownedWrite: true,
  });

  const [registerLabel, label] = createSlot(
    () =>
      (props["aria-label"]?.length ?? 0) === 0 &&
      (props["aria-labelledby"]?.length ?? 0) === 0
  );

  const aria = createColorChannelField(
    mergeProps(removeDataAttributes(options), {
      get label() {
        return label();
      },
    }),
    state,
    inputRef
  );

  return (
    <>
      <ColorFieldChildren
        props={props}
        state={state}
        aria={aria}
        inputRef={(element: HTMLInputElement) => {
          setInputRef(element);
        }}
        registerLabel={registerLabel}
      />
      {(props.name?.length ?? 0) > 0 && (
        <input
          type="hidden"
          name={props.name}
          form={props.form}
          value={Number.isNaN(state.numberValue) ? "" : state.numberValue}
        />
      )}
    </>
  );
}

function ColorFieldChildren(input: {
  props: ColorFieldProps;
  state: ColorFieldState;
  aria: ColorFieldAria | ReturnType<typeof createColorChannelField>;
  inputRef: (element: HTMLInputElement) => void;
  registerLabel: ReturnType<typeof createSlot>[0];
}): JSX.Element {
  const { props } = untrack(() => input);
  const { state } = untrack(() => input);
  const { aria } = untrack(() => input);

  const values: ColorFieldRenderProps = {
    get channel() {
      return props.channel ?? "hex";
    },
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
    mergeProps(props, { defaultClass: "solid2-aria-ColorField", values })
  );

  return (
    <ColorFieldStateContext value={state}>
      <InputContext
        value={mergeProps(
          merge(() => aria.inputProps),
          {
            get ref() {
              return input.inputRef;
            },
          }
        )}
      >
        <LabelContext
          value={mergeProps(
            merge(() => aria.labelProps),
            {
              get registerSlot() {
                return input.registerLabel;
              },
            }
          )}
        >
          <GroupContext
            value={{
              get isDisabled() {
                return props.isDisabled ?? false;
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
                <dom.div
                  {
                    // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
                    ...omit(filterDOMProps(props, { global: true }), "id")
                    // oxlint-enable solid/reactivity
                  }
                  {...render}
                  ref={(el: HTMLDivElement) => {
                    assignRef(
                      untrack(() => props.ref),
                      el
                    );
                  }}
                  slot={
                    typeof props.slot === "string" && props.slot.length > 0
                      ? props.slot
                      : undefined
                  }
                  data-channel={props.channel ?? "hex"}
                  data-disabled={props.isDisabled === true ? true : undefined}
                  data-invalid={aria.isInvalid || undefined}
                  data-readonly={props.isReadOnly === true ? true : undefined}
                  data-required={props.isRequired === true ? true : undefined}
                >
                  {render.children}
                </dom.div>
              </FieldErrorContext>
            </TextContext>
          </GroupContext>
        </LabelContext>
      </InputContext>
    </ColorFieldStateContext>
  );
}
