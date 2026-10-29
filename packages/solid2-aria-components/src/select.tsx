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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/Select.tsx.
 * Modified for Solid Aria: adapted collection ownership, contexts, accessibility primitives, and reactive properties for Solid 2; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { BaseCollection } from "@solid2-aria/core/collections/base-collection";
import { CollectionBuilder } from "@solid2-aria/core/collections/collection-builder";
import { createIsHidden } from "@solid2-aria/core/collections/hidden";
import { createFocusRing } from "@solid2-aria/core/focus/create-focus-ring";
import { createListFormatter } from "@solid2-aria/core/i18n/create-list-formatter";
import { createLocalizedStringFormatter } from "@solid2-aria/core/i18n/create-localized-string-formatter";
import { createSelect } from "@solid2-aria/core/select/create-select";
import type { AriaSelectProps } from "@solid2-aria/core/select/create-select";
import { HiddenSelect } from "@solid2-aria/core/select/hidden-select";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { isTruthy } from "@solid2-aria/core/utils/truthy";
import { createSelectState } from "@solid2-aria/stately/select/create-select-state";
import type { SelectState } from "@solid2-aria/stately/select/create-select-state";
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
} from "solid-js";

import intlMessages from "../intl/index";
import { ButtonContext } from "./button";
import { OverlayTriggerStateContext } from "./dialog";
import { FieldErrorContext } from "./field-error";
import { FormContext } from "./form";
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

export const SelectContext = createContext<
  ContextValue<
    // oxlint-disable-next-line typescript/no-explicit-any -- Collection contexts erase item types; each typed factory restores its owner's item contract.
    Omit<SelectProps<any, SelectionMode>, "validate" | "onChange">,
    HTMLDivElement
  >
>(null);

export const SelectStateContext = createContext<SelectState<
  unknown,
  SelectionMode
> | null>(null);

export const SelectValueContext =
  // oxlint-disable-next-line typescript/no-explicit-any -- Collection contexts erase item types; each typed factory restores its owner's item contract.
  createContext<ContextValue<SelectValueProps<any>, HTMLSpanElement>>(null);

type SelectionMode = "single" | "multiple";

export interface SelectRenderProps {
  /**
   * Whether the select is focused, either via a mouse or keyboard.
   *
   * @selector [data-focused]
   */
  isFocused: boolean;
  /**
   * Whether the select is keyboard focused.
   *
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean;
  /**
   * Whether the select is disabled.
   *
   * @selector [data-disabled]
   */
  isDisabled: boolean;
  /**
   * Whether the select is currently open.
   *
   * @selector [data-open]
   */
  isOpen: boolean;
  /**
   * Whether the select is invalid.
   *
   * @selector [data-invalid]
   */
  isInvalid: boolean;
  /**
   * Whether the select is required.
   *
   * @selector [data-required]
   */
  isRequired: boolean;
}

export interface SelectProps<T = object, M extends SelectionMode = "single">
  extends
    Omit<
      AriaSelectProps<T, M>,
      | "children"
      | "label"
      | "description"
      | "errorMessage"
      | "validationState"
      | "validationBehavior"
      | "items"
    >,
    RACValidation,
    RenderProps<SelectRenderProps>,
    SlotProps,
    GlobalDOMAttributes<HTMLDivElement> {
  /**
   * The CSS [class](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/class) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-Select'
   */
  class?: ClassOrFunction<SelectRenderProps>;
  /**
   * Temporary text that occupies the select when it is empty.
   *
   * @default 'Select an item' (localized)
   */
  placeholder?: string;
}

export interface SelectValueRenderProps<T> {
  /**
   * Whether the value is a placeholder.
   *
   * @selector [data-placeholder]
   */
  isPlaceholder: boolean;
  /**
   * The object value of the first selected item.
   *
   * @deprecated
   */
  selectedItem: T | null;
  /** The object values of the currently selected items. */
  selectedItems: (T | null)[];
  /** The textValue of the currently selected items. */
  selectedText: string;
  /** The state of the select. */
  state: SelectState<T, "single" | "multiple">;
}

export interface SelectValueProps<T>
  extends
    Omit<JSX.HTMLAttributes<HTMLElement>, keyof RenderProps<unknown>>,
    RenderProps<SelectValueRenderProps<T>, "span"> {
  /**
   * The CSS [class](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/class) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-SelectValue'
   */
  class?: ClassOrFunction<SelectValueRenderProps<T>>;
}

export function Select<T extends object, M extends SelectionMode = "single">(
  input: SelectProps<T, M> & { ref?: Ref<HTMLDivElement> }
): JSX.Element {
  if (createIsHidden()) {
    // oxlint-disable-next-line solid/components-return-once -- Static collection traversal and context registration are fixed when the owner is created.
    return null;
  }

  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    SelectContext
  );

  const contentValues: SelectRenderProps = {
    get isDisabled() {
      return props.isDisabled === true;
    },
    isFocusVisible: false,
    isFocused: false,
    get isInvalid() {
      return props.isInvalid === true;
    },
    isOpen: false,
    get isRequired() {
      return props.isRequired === true;
    },
  };

  const content = () => {
    const child = props.children;

    return typeof child === "function"
      ? child({ ...contentValues, defaultChildren: undefined })
      : child;
  };

  return (
    <ListStateContext value={null}>
      <CollectionBuilder
        createCollection={() => new BaseCollection<T>()}
        content={content()}
      >
        {(collection) => (
          <SelectInner
            props={props}
            collection={collection}
            selectRef={setRef}
          />
        )}
      </CollectionBuilder>
    </ListStateContext>
  );
}

function SelectInner<T extends object, M extends SelectionMode>(input: {
  props: SelectProps<T, M>;
  collection: BaseCollection<T>;
  selectRef: (element: HTMLDivElement) => void;
}): JSX.Element {
  const [scrollRef, setScrollRef] = createSignal<HTMLDivElement | null>(null, {
    ownedWrite: true,
  });

  const { props } = untrack(() => input);
  const form = createSlottedContext(FormContext);

  const validationBehavior = () =>
    props.validationBehavior ?? form?.validationBehavior ?? "native";

  const state = createSelectState(
    mergeProps(props, {
      children: undefined,
      get collection() {
        return input.collection;
      },
      get validationBehavior() {
        return validationBehavior();
      },
    })
  );

  const focus = createFocusRing({ within: true });

  const [buttonRef, setButtonRef] = createSignal<HTMLButtonElement | null>(
    null,
    { ownedWrite: true }
  );

  const [registerLabel, label] = createSlot(
    () => !isTruthy(props["aria-label"]) && !isTruthy(props["aria-labelledby"])
  );

  const aria = createSelect(
    mergeProps(props, {
      get label() {
        return label();
      },
      get validationBehavior() {
        return validationBehavior();
      },
    }),
    state,
    buttonRef
  );

  const values: SelectRenderProps = {
    get isDisabled() {
      return props.isDisabled === true;
    },
    get isFocusVisible() {
      return focus.isFocusVisible;
    },
    get isFocused() {
      return state.isFocused;
    },
    get isInvalid() {
      return aria.isInvalid;
    },
    get isOpen() {
      return state.isOpen;
    },
    get isRequired() {
      return props.isRequired === true;
    },
  };

  const render = createRenderProps(
    mergeProps(props, { defaultClass: "solid2-aria-Select", values })
  );

  return (
    <SelectContext value={props}>
      <SelectStateContext value={state}>
        <SelectValueContext value={aria.valueProps}>
          <LabelContext
            value={mergeProps(
              merge(() => aria.labelProps ?? {}),
              {
                get elementType(): "span" {
                  return "span";
                },
                registerSlot: registerLabel,
              }
            )}
          >
            <ButtonContext
              value={mergeProps(
                merge(() => aria.triggerProps ?? {}),
                {
                  get autoFocus() {
                    return props.autoFocus;
                  },
                  get isPressed() {
                    return state.isOpen;
                  },
                  ref: (element: HTMLButtonElement) => {
                    setButtonRef(element);
                  },
                }
              )}
            >
              <OverlayTriggerStateContext value={state}>
                <PopoverContext
                  value={mergeProps(
                    {
                      clearContexts: [LabelContext, ButtonContext, TextContext],
                      get placement(): "bottom start" {
                        return "bottom start";
                      },
                      scrollRef,
                      trigger: "Select",
                      triggerRef: buttonRef,
                    },
                    {
                      get "aria-labelledby"() {
                        return aria.menuProps["aria-labelledby"];
                      },
                    }
                  )}
                >
                  <ListBoxContext
                    value={mergeProps(
                      merge(() => aria.menuProps ?? {}),
                      {
                        ref: (element: HTMLDivElement) => {
                          setScrollRef(element);
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
                        <FieldErrorContext value={aria}>
                          <dom.div
                            {...mergeProps(
                              omit(
                                filterDOMProps(props, { global: true }),
                                "id"
                              ),
                              render,
                              merge(() => focus.focusProps ?? {})
                            )}
                            ref={input.selectRef}
                            slot={props.slot ?? undefined}
                            data-focused={state.isFocused || undefined}
                            data-focus-visible={
                              focus.isFocusVisible || undefined
                            }
                            data-open={state.isOpen || undefined}
                            data-disabled={props.isDisabled ?? undefined}
                            data-invalid={aria.isInvalid || undefined}
                            data-required={props.isRequired ?? undefined}
                          >
                            {render.children}
                            <HiddenSelect
                              {...aria.hiddenSelectProps}
                              autoComplete={props.autoComplete}
                            />
                          </dom.div>
                        </FieldErrorContext>
                      </TextContext>
                    </ListStateContext>
                  </ListBoxContext>
                </PopoverContext>
              </OverlayTriggerStateContext>
            </ButtonContext>
          </LabelContext>
        </SelectValueContext>
      </SelectStateContext>
    </SelectContext>
  );
}

export function SelectValue<T>(
  input: SelectValueProps<T> & { ref?: Ref<HTMLSpanElement> }
): JSX.Element {
  if (createIsHidden()) {
    // oxlint-disable-next-line solid/components-return-once -- Static collection traversal and context registration are fixed when the owner is created.
    return null;
  }

  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    SelectValueContext
  );

  const current = useContext(SelectStateContext);

  if (!current) {
    throw new Error("SelectValue must be rendered in a Select.");
  }

  // The context erases the item type; it comes from the same Select owner as these render props.
  // SAFETY: The Select owner provides the same T items consumed by this render callback.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The context erases the owner's generic item type.
  const state = current as SelectState<T, SelectionMode>;
  const context = createSlottedContext(SelectContext);
  const formatter = createListFormatter();

  const strings = createLocalizedStringFormatter(
    intlMessages,
    "@solid2-aria/components"
  );

  const text = createMemo(() =>
    state.selectedItems.map((item) => item.textValue)
  );

  const selectedText = createMemo(() =>
    state.selectionManager.selectionMode === "single"
      ? (text()[0] ?? "")
      : formatter.format(text())
  );

  const defaults = createMemo(() => {
    const rendered = state.selectedItems.map((item) => {
      const content: unknown = item.rendered;

      if (typeof content === "function") {
        // SAFETY: Item render functions are stored by the typed collection factory and return Solid children.
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Collection storage erases the render callback signature.
        const render = content as (...values: unknown[]) => JSX.Element;

        return render({
          defaultChildren: undefined,
          isDisabled: false,
          isFocusVisible: false,
          isFocused: false,
          isHovered: false,
          isPressed: false,
          isSelected: false,
          selectionBehavior: "toggle",
          selectionMode: "single",
        });
      }

      return item.rendered;
    });

    if (!rendered.length) {
      return context?.placeholder ?? strings.format("selectPlaceholder");
    }

    if (state.selectionManager.selectionMode === "single") {
      return rendered[0];
    }

    let index = 0;

    return formatter
      .formatToParts(text())
      .map((part) =>
        part.type === "element" ? rendered[(index += 1)] : part.value
      );
  });

  const values: SelectValueRenderProps<T> = {
    get isPlaceholder() {
      return state.selectedItems.length === 0;
    },
    // oxlint-disable-next-line typescript/no-deprecated -- Preserve the upstream public getter while selectedItems remains the preferred API.
    get selectedItem() {
      return state.selectedItems[0]?.value ?? null;
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
        return defaults();
      },
      defaultClass: "solid2-aria-SelectValue",
      values,
    })
  );

  return (
    <dom.span
      {...filterDOMProps(props, { global: true })}
      {...render}
      ref={(element: HTMLElement) => {
        setRef(element);
      }}
      data-placeholder={values.isPlaceholder || undefined}
    >
      <TextContext value={null}>{render.children}</TextContext>
    </dom.span>
  );
}
