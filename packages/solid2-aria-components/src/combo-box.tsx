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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/ComboBox.tsx.
 * Modified for Solid Aria: adapted collection ownership, contexts, accessibility primitives, and reactive properties for Solid 2; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { InputProps } from "@solid2-aria/core/autocomplete/create-autocomplete";
import { BaseCollection } from "@solid2-aria/core/collections/base-collection";
import { CollectionBuilder } from "@solid2-aria/core/collections/collection-builder";
import { createIsHidden } from "@solid2-aria/core/collections/hidden";
import { createComboBox } from "@solid2-aria/core/combobox/create-combo-box";
import type { AriaComboBoxProps } from "@solid2-aria/core/combobox/create-combo-box";
import { createFilter } from "@solid2-aria/core/i18n/create-filter";
import { createListFormatter } from "@solid2-aria/core/i18n/create-list-formatter";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { isTruthy } from "@solid2-aria/core/utils/truthy";
import { createComboBoxState } from "@solid2-aria/stately/combobox/create-combo-box-state";
import type { ComboBoxState } from "@solid2-aria/stately/combobox/create-combo-box-state";
import type { GlobalDOMAttributes } from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";
import {
  merge,
  untrack,
  createSignal,
  createContext,
  createMemo,
  useContext,
  omit,
  For,
} from "solid-js";

import { FieldInputContext } from "./autocomplete";
import { ButtonContext } from "./button";
import { OverlayTriggerStateContext } from "./dialog";
import { FieldErrorContext } from "./field-error";
import { FormContext } from "./form";
import { GroupContext } from "./group";
import { InputContext } from "./input";
import { LabelContext } from "./label";
import { ListBoxContext, ListStateContext } from "./list-box";
import { PopoverContext } from "./popover";
import { TextContext } from "./text";
import {
  dom,
  createContextProps,
  createRenderProps,
  createSlot,
  createSlottedContext,
} from "./utils";
import type {
  Ref,
  ClassOrFunction,
  RACValidation,
  RenderProps,
  SlotProps,
  ContextValue,
} from "./utils";

export const ComboBoxContext = createContext<
  // oxlint-disable-next-line typescript/no-explicit-any -- Collection contexts erase item types; each typed factory restores its owner's item contract.
  ContextValue<ComboBoxProps<any, SelectionMode>, HTMLDivElement>
>(null);

export const ComboBoxStateContext = createContext<ComboBoxState<
  unknown,
  SelectionMode
> | null>(null);

export const ComboBoxValueContext =
  // oxlint-disable-next-line typescript/no-explicit-any -- Collection contexts erase item types; each typed factory restores its owner's item contract.
  createContext<ContextValue<ComboBoxValueProps<any>, HTMLDivElement>>(null);

type SelectionMode = "single" | "multiple";

export interface ComboBoxRenderProps {
  /**
   * Whether the combobox is currently open.
   *
   * @selector [data-open]
   */
  isOpen: boolean;
  /**
   * Whether the combobox is disabled.
   *
   * @selector [data-disabled]
   */
  isDisabled: boolean;
  /**
   * Whether the combobox is invalid.
   *
   * @selector [data-invalid]
   */
  isInvalid: boolean;
  /**
   * Whether the combobox is required.
   *
   * @selector [data-required]
   */
  isRequired: boolean;
  /**
   * Whether the combobox is read only.
   *
   * @selector [data-readonly]
   */
  isReadOnly: boolean;
}

export interface ComboBoxProps<T, M extends SelectionMode = "single">
  extends
    Omit<
      AriaComboBoxProps<T, M>,
      | "children"
      | "placeholder"
      | "label"
      | "description"
      | "errorMessage"
      | "validationState"
      | "validationBehavior"
    >,
    RACValidation,
    RenderProps<ComboBoxRenderProps>,
    SlotProps,
    GlobalDOMAttributes<HTMLDivElement> {
  /**
   * The CSS [class](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/class) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-ComboBox'
   */
  class?: ClassOrFunction<ComboBoxRenderProps>;
  /**
   * The filter function used to determine if an option should be included in the combo box list.
   * By default, a language-sensitive "contains" filter from `createFilter` is used.
   */
  defaultFilter?: (textValue: string, inputValue: string) => boolean;
  /**
   * Whether the text or key of the selected item is submitted as part of an HTML form. When
   * `allowsCustomValue` is `true`, this option does not apply and the text is always submitted.
   *
   * @default 'key'
   */
  formValue?: "text" | "key";
  /** Whether the combo box allows the menu to be open when the collection is empty. */
  allowsEmptyCollection?: boolean;
}

export interface ComboBoxValueRenderProps<T> {
  /**
   * Whether the value is a placeholder.
   *
   * @selector [data-placeholder]
   */
  isPlaceholder: boolean;
  /** The object values of the currently selected items. */
  selectedItems: (T | null)[];
  /** The textValue of the currently selected items. */
  selectedText: string;
  /** The state of the ComboBox. */
  state: ComboBoxState<T, "single" | "multiple">;
}

export interface ComboBoxValueProps<T>
  extends
    Omit<JSX.HTMLAttributes<HTMLElement>, keyof RenderProps<unknown> | "ref">,
    RenderProps<ComboBoxValueRenderProps<T>> {
  /**
   * The CSS [class](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/class) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-ComboBoxValue'
   */
  class?: ClassOrFunction<ComboBoxValueRenderProps<T>>;
  /** A value to display when no items are selected. */
  placeholder?: JSX.Element;
}

export function ComboBox<T extends object, M extends SelectionMode = "single">(
  input: ComboBoxProps<T, M> & { ref?: Ref<HTMLDivElement> }
): JSX.Element {
  if (createIsHidden()) {
    // oxlint-disable-next-line solid/components-return-once -- Static collection traversal and context registration are fixed when the owner is created.
    return null;
  }

  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    ComboBoxContext
  );

  const values: ComboBoxRenderProps = {
    get isDisabled() {
      return props.isDisabled === true;
    },
    get isInvalid() {
      return props.isInvalid === true;
    },
    isOpen: false,
    get isReadOnly() {
      return props.isReadOnly === true;
    },
    get isRequired() {
      return props.isRequired === true;
    },
  };

  const content = () => {
    const child = props.children;

    return typeof child === "function"
      ? child({ ...values, defaultChildren: undefined })
      : child;
  };

  return (
    <ListStateContext value={null}>
      <CollectionBuilder
        createCollection={() => new BaseCollection<T>()}
        content={
          <ListBoxContext
            value={{
              get items() {
                return props.items ?? props.defaultItems;
              },
            }}
          >
            {content()}
          </ListBoxContext>
        }
      >
        {(collection) => (
          <ComboBoxInner
            props={props}
            collection={collection}
            comboRef={setRef}
          />
        )}
      </CollectionBuilder>
    </ListStateContext>
  );
}

function ComboBoxInner<T extends object, M extends SelectionMode>(input: {
  props: ComboBoxProps<T, M>;
  collection: BaseCollection<T>;
  comboRef: (element: HTMLDivElement) => void;
}): JSX.Element {
  const [buttonRef, setButtonRef] = createSignal<HTMLButtonElement | null>(
    null,
    { ownedWrite: true }
  );

  const [popoverRef, setPopoverRef] = createSignal<HTMLElement | null>(null, {
    ownedWrite: true,
  });

  const { props } = untrack(() => input);
  const form = createSlottedContext(FormContext);
  const filter = createFilter({ sensitivity: "base" });

  const state = createComboBoxState(
    mergeProps(props, {
      children: undefined,
      get collection() {
        return input.collection;
      },
      get defaultFilter() {
        return props.defaultFilter ?? filter.contains;
      },
      get validationBehavior() {
        return props.validationBehavior ?? form?.validationBehavior ?? "native";
      },
    })
  );

  const [inputRef, setInputRef] = createSignal<HTMLInputElement | null>(null, {
    ownedWrite: true,
  });

  const [groupRef, setGroupRef] = createSignal<HTMLDivElement | null>(null, {
    ownedWrite: true,
  });

  const [listBoxRef, setListBoxRef] = createSignal<HTMLDivElement | null>(
    null,
    { ownedWrite: true }
  );

  const [registerLabel, label] = createSlot(
    () => !isTruthy(props["aria-label"]) && !isTruthy(props["aria-labelledby"])
  );

  const textFormValue = () =>
    props.allowsCustomValue ?? props.formValue === "text";

  const aria = createComboBox(
    mergeProps(props, {
      buttonRef,
      inputRef,
      get label() {
        return label();
      },
      listBoxRef,
      get name() {
        return textFormValue() ? props.name : undefined;
      },
      popoverRef,
      get validationBehavior() {
        return props.validationBehavior ?? form?.validationBehavior ?? "native";
      },
    }),
    state
  );

  const triggerRef = () => groupRef() ?? inputRef();

  const values: ComboBoxRenderProps = {
    get isDisabled() {
      return props.isDisabled === true;
    },
    get isInvalid() {
      return aria.isInvalid;
    },
    get isOpen() {
      return state.isOpen;
    },
    get isReadOnly() {
      return props.isReadOnly === true;
    },
    get isRequired() {
      return props.isRequired === true;
    },
  };

  const render = createRenderProps(
    mergeProps(props, { defaultClass: "solid2-aria-ComboBox", values })
  );

  const hiddenValues = () => {
    if (Array.isArray(state.value)) {
      return state.value.length > 0 ? state.value : [null];
    }

    return [state.value];
  };

  return (
    <ComboBoxStateContext value={state}>
      <LabelContext
        value={mergeProps(
          merge(() => aria.labelProps ?? {}),
          {
            get elementType(): "label" {
              return "label";
            },
            registerSlot: registerLabel,
          }
        )}
      >
        <ButtonContext
          value={mergeProps(
            merge(() => aria.buttonProps ?? {}),
            {
              get isPressed() {
                return state.isOpen;
              },
              ref: (element: HTMLButtonElement) => {
                setButtonRef(element);
              },
            }
          )}
        >
          <InputContext
            value={mergeProps(
              merge(() => aria.inputProps ?? {}),
              {
                ref: (element: HTMLInputElement) => {
                  setInputRef(element);
                },
              }
            )}
          >
            <FieldInputContext
              value={
                // SAFETY: These props target the same native input; the text callback and ref replace the DOM-facing value handlers.
                // oxlint-disable-next-line typescript/no-unsafe-type-assertion, anti-slop/no-chained-type-assertions -- The autocomplete field context uses a renderer-neutral input contract.
                mergeProps(
                  omit(
                    merge(() => aria.inputProps),
                    "value",
                    "onChange",
                    "id",
                    "onFocus",
                    "onBlur"
                  ),
                  {
                    onChange: (value: string) => {
                      state.setInputValue(value);
                    },
                    ref: (element: HTMLInputElement) => {
                      setInputRef(element);
                    },
                    get value() {
                      return state.inputValue;
                    },
                  }
                ) as unknown as ContextValue<InputProps, HTMLElement>
              }
            >
              <OverlayTriggerStateContext value={state}>
                <PopoverContext
                  value={{
                    clearContexts: [
                      LabelContext,
                      ButtonContext,
                      InputContext,
                      FieldInputContext,
                      GroupContext,
                      TextContext,
                    ],
                    isNonModal: true,
                    get placement(): "bottom start" {
                      return "bottom start";
                    },
                    ref: (element: HTMLElement) => {
                      setPopoverRef(element);
                    },
                    scrollRef: listBoxRef,
                    trigger: "ComboBox",
                    triggerRef,
                  }}
                >
                  <ListBoxContext
                    value={mergeProps(
                      merge(() => aria.listBoxProps ?? {}),
                      {
                        ref: (element: HTMLDivElement) => {
                          setListBoxRef(element);
                        },
                      }
                    )}
                  >
                    <ListStateContext value={state}>
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
                        <GroupContext
                          value={{
                            get isDisabled() {
                              return props.isDisabled === true;
                            },
                            get isInvalid() {
                              return aria.isInvalid;
                            },
                            ref: (element: HTMLDivElement) => {
                              setGroupRef(element);
                            },
                          }}
                        >
                          <FieldErrorContext value={aria}>
                            <ComboBoxValueContext value={aria.valueProps}>
                              <dom.div
                                {
                                  // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
                                  ...omit(
                                    filterDOMProps(props, { global: true }),
                                    "id"
                                  )
                                  // oxlint-enable solid/reactivity
                                }
                                {...render}
                                ref={input.comboRef}
                                slot={props.slot ?? undefined}
                                data-focused={state.isFocused || undefined}
                                data-open={state.isOpen || undefined}
                                data-disabled={props.isDisabled ?? undefined}
                                data-invalid={aria.isInvalid || undefined}
                                data-required={props.isRequired ?? undefined}
                                data-readonly={props.isReadOnly ?? undefined}
                              >
                                {render.children}
                                {Boolean(props.name) && !textFormValue() ? (
                                  <For each={hiddenValues()}>
                                    {(value) => (
                                      <input
                                        type="hidden"
                                        name={props.name}
                                        form={props.form}
                                        value={value ?? ""}
                                      />
                                    )}
                                  </For>
                                ) : null}
                              </dom.div>
                            </ComboBoxValueContext>
                          </FieldErrorContext>
                        </GroupContext>
                      </TextContext>
                    </ListStateContext>
                  </ListBoxContext>
                </PopoverContext>
              </OverlayTriggerStateContext>
            </FieldInputContext>
          </InputContext>
        </ButtonContext>
      </LabelContext>
    </ComboBoxStateContext>
  );
}

export function ComboBoxValue<T>(
  input: ComboBoxValueProps<T> & { ref?: Ref<HTMLDivElement> }
): JSX.Element {
  if (createIsHidden()) {
    // oxlint-disable-next-line solid/components-return-once -- Static collection traversal and context registration are fixed when the owner is created.
    return null;
  }

  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    ComboBoxValueContext
  );

  const context = useContext(ComboBoxStateContext);

  if (!context) {
    throw new Error("ComboBoxValue must be rendered in a ComboBox.");
  }

  // The item type is erased only by the shared context and restored for the owner's render function.
  // SAFETY: The ComboBox owner provides the same T items consumed by this render callback.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The context erases the owner's generic item type.
  const state = context as ComboBoxState<T, SelectionMode>;
  const formatter = createListFormatter();

  const selectedText = createMemo(() =>
    formatter.format(
      state.selectedItems.map((item) => item.textValue).filter(Boolean)
    )
  );

  const values: ComboBoxValueRenderProps<T> = {
    get isPlaceholder() {
      return state.selectedItems.length === 0;
    },
    get selectedItems() {
      return state.selectedItems.map((item) => item.value);
    },
    get selectedText() {
      return selectedText();
    },
    state,
  };

  const render = createRenderProps(
    mergeProps(props, {
      get defaultChildren() {
        return selectedText() || props.placeholder;
      },
      defaultClass: "solid2-aria-ComboBoxValue",
      values,
    })
  );

  return (
    <dom.div
      {...filterDOMProps(props, { global: true })}
      {...render}
      ref={(element: HTMLDivElement) => {
        setRef(element);
      }}
      data-placeholder={values.isPlaceholder || undefined}
    />
  );
}
