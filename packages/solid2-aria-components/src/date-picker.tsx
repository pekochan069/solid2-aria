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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/DatePicker.tsx.
 * Modified for Solid Aria: composed Solid Aria and Stately primitives with Solid 2 contexts, reactive getters, and DOM refs; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createDatePicker } from "@solid2-aria/core/datepicker/create-date-picker";
import type { AriaDatePickerProps } from "@solid2-aria/core/datepicker/create-date-picker";
import { createDateRangePicker } from "@solid2-aria/core/datepicker/create-date-range-picker";
import type { AriaDateRangePickerProps } from "@solid2-aria/core/datepicker/create-date-range-picker";
import { createFocusRing } from "@solid2-aria/core/focus/create-focus-ring";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import type { CalendarSelectionMode } from "@solid2-aria/stately/calendar/types";
import { createDatePickerState } from "@solid2-aria/stately/datepicker/create-date-picker-state";
import type {
  DatePickerState,
  DatePickerStateOptions,
} from "@solid2-aria/stately/datepicker/create-date-picker-state";
import { createDateRangePickerState } from "@solid2-aria/stately/datepicker/create-date-range-picker-state";
import type {
  DateRangePickerState,
  DateRangePickerStateOptions,
} from "@solid2-aria/stately/datepicker/create-date-range-picker-state";
import type { DateValue } from "@solid2-aria/stately/datepicker/types";
import type { GlobalDOMAttributes } from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";
import { untrack, createSignal, merge, createContext, omit } from "solid-js";

import { ButtonContext } from "./button";
import { CalendarContext, RangeCalendarContext } from "./calendar";
import type { CalendarProps } from "./calendar";
import { DateFieldContext } from "./date-field";
import { DialogContext, OverlayTriggerStateContext } from "./dialog";
import { FieldErrorContext } from "./field-error";
import { FormContext } from "./form";
import { GroupContext } from "./group";
import { HiddenDateInput } from "./hidden-date-input";
import { LabelContext } from "./label";
import { PopoverContext } from "./popover";
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

export interface DatePickerRenderProps {
  isFocusWithin: boolean;
  isFocusVisible: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
  isInvalid: boolean;
  isRequired: boolean;
  isOpen: boolean;
  state: DatePickerState;
}

export interface DateRangePickerRenderProps extends Omit<
  DatePickerRenderProps,
  "state"
> {
  state: DateRangePickerState;
}

export interface DatePickerProps<T extends DateValue>
  extends
    Omit<
      AriaDatePickerProps<T>,
      | "label"
      | "description"
      | "errorMessage"
      | "validationState"
      | "validationBehavior"
    >,
    Pick<DatePickerStateOptions<T>, "shouldCloseOnSelect">,
    RACValidation,
    RenderProps<DatePickerRenderProps>,
    SlotProps,
    GlobalDOMAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export interface DateRangePickerProps<T extends DateValue>
  extends
    Omit<
      AriaDateRangePickerProps<T>,
      | "label"
      | "description"
      | "errorMessage"
      | "validationState"
      | "validationBehavior"
    >,
    Pick<DateRangePickerStateOptions<T>, "shouldCloseOnSelect">,
    RACValidation,
    RenderProps<DateRangePickerRenderProps>,
    SlotProps,
    GlobalDOMAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export const DatePickerContext =
  createContext<ContextValue<DatePickerProps<DateValue>, HTMLDivElement>>(null);

export const DateRangePickerContext =
  createContext<ContextValue<DateRangePickerProps<DateValue>, HTMLDivElement>>(
    null
  );

export const DatePickerStateContext = createContext<DatePickerState | null>(
  null
);

export const DateRangePickerStateContext =
  createContext<DateRangePickerState | null>(null);

const CLEAR_CONTEXTS = [GroupContext, ButtonContext, LabelContext, TextContext];

export function DatePicker<T extends DateValue>(
  input: DatePickerProps<T>
): JSX.Element {
  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    DatePickerContext
  );

  const form = createSlottedContext(FormContext);

  const options = mergeProps(props, {
    get validationBehavior() {
      return props.validationBehavior ?? form?.validationBehavior ?? "native";
    },
  });

  const state = createDatePickerState(options);

  const [groupRef, setGroupRef] = createSignal<HTMLDivElement | null>(null, {
    ownedWrite: true,
  });

  const [registerLabel, label] = createSlot(
    () =>
      (props["aria-label"]?.length ?? 0) === 0 &&
      (props["aria-labelledby"]?.length ?? 0) === 0
  );

  const aria = createDatePicker(
    mergeProps(removeDataAttributes(options), {
      get label() {
        return label();
      },
    }),
    state,
    groupRef
  );

  // SAFETY: DatePicker supplies a single-selection calendar; this context preserves the shared calendar API for either selection mode.
  // oxlint-disable-next-line anti-slop/no-chained-type-assertions, typescript/no-unsafe-type-assertion -- Widen the generic callback only when entering the shared calendar context.
  const calendarProps = merge(
    () => aria.calendarProps
  ) as unknown as CalendarProps<DateValue, CalendarSelectionMode>;

  const focus = createFocusRing({ within: true });

  const values: DatePickerRenderProps = {
    get isDisabled() {
      return props.isDisabled ?? false;
    },
    get isFocusVisible() {
      return focus.isFocusVisible;
    },
    get isFocusWithin() {
      return focus.isFocused;
    },
    get isInvalid() {
      return state.isInvalid;
    },
    get isOpen() {
      return state.isOpen;
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
    mergeProps(props, { defaultClass: "solid2-aria-DatePicker", values })
  );

  return (
    <DatePickerStateContext value={state}>
      <GroupContext
        value={mergeProps(
          merge(() => aria.groupProps),
          {
            get isInvalid() {
              return state.isInvalid;
            },
            ref: (element: HTMLDivElement) => {
              setGroupRef(element);
            },
          }
        )}
      >
        <DateFieldContext
          value={
            // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
            merge(() => aria.fieldProps)
            // oxlint-enable solid/reactivity
          }
        >
          <ButtonContext
            value={mergeProps(
              merge(() => aria.buttonProps),
              {
                get isPressed() {
                  return state.isOpen;
                },
              }
            )}
          >
            <LabelContext
              value={mergeProps(
                merge(() => aria.labelProps),
                { elementType: "span" as const, registerSlot: registerLabel }
              )}
            >
              <CalendarContext value={calendarProps}>
                <OverlayTriggerStateContext value={state}>
                  <PopoverContext
                    value={{
                      clearContexts: CLEAR_CONTEXTS,
                      placement: "bottom start",
                      trigger: "DatePicker",
                      triggerRef: groupRef,
                    }}
                  >
                    <DialogContext
                      value={
                        // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
                        merge(() => aria.dialogProps)
                        // oxlint-enable solid/reactivity
                      }
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
                            {...mergeProps(
                              omit(
                                filterDOMProps(props, { global: true }),
                                "id"
                              ),
                              render,
                              merge(() => focus.focusProps ?? {})
                            )}
                            ref={(element: HTMLDivElement) => {
                              setRef(element);
                            }}
                            slot={
                              typeof props.slot === "string" &&
                              props.slot.length > 0
                                ? props.slot
                                : undefined
                            }
                            data-focus-within={focus.isFocused || undefined}
                            data-invalid={state.isInvalid || undefined}
                            data-focus-visible={
                              focus.isFocusVisible || undefined
                            }
                            data-disabled={
                              props.isDisabled === true ? true : undefined
                            }
                            data-readonly={
                              props.isReadOnly === true ? true : undefined
                            }
                            data-required={
                              props.isRequired === true ? true : undefined
                            }
                            data-open={state.isOpen || undefined}
                          >
                            {render.children}
                          </dom.div>
                          <HiddenDateInput
                            autoComplete={props.autoComplete}
                            name={props.name}
                            isDisabled={props.isDisabled}
                            state={state}
                          />
                        </FieldErrorContext>
                      </TextContext>
                    </DialogContext>
                  </PopoverContext>
                </OverlayTriggerStateContext>
              </CalendarContext>
            </LabelContext>
          </ButtonContext>
        </DateFieldContext>
      </GroupContext>
    </DatePickerStateContext>
  );
}

export function DateRangePicker<T extends DateValue>(
  input: DateRangePickerProps<T>
): JSX.Element {
  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    DateRangePickerContext
  );

  const form = createSlottedContext(FormContext);

  const options = mergeProps(props, {
    get validationBehavior() {
      return props.validationBehavior ?? form?.validationBehavior ?? "native";
    },
  });

  const state = createDateRangePickerState(options);

  const [groupRef, setGroupRef] = createSignal<HTMLDivElement | null>(null, {
    ownedWrite: true,
  });

  const [registerLabel, label] = createSlot(
    () =>
      (props["aria-label"]?.length ?? 0) === 0 &&
      (props["aria-labelledby"]?.length ?? 0) === 0
  );

  const aria = createDateRangePicker(
    mergeProps(removeDataAttributes(options), {
      get label() {
        return label();
      },
    }),
    state,
    groupRef
  );

  const focus = createFocusRing({ within: true });

  const values: DateRangePickerRenderProps = {
    get isDisabled() {
      return props.isDisabled ?? false;
    },
    get isFocusVisible() {
      return focus.isFocusVisible;
    },
    get isFocusWithin() {
      return focus.isFocused;
    },
    get isInvalid() {
      return state.isInvalid;
    },
    get isOpen() {
      return state.isOpen;
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
    mergeProps(props, {
      defaultClass: "solid2-aria-DateRangePicker",
      values,
    })
  );

  return (
    <DateRangePickerStateContext value={state}>
      <GroupContext
        value={mergeProps(
          merge(() => aria.groupProps),
          {
            get isInvalid() {
              return state.isInvalid;
            },
            ref: (element: HTMLDivElement) => {
              setGroupRef(element);
            },
          }
        )}
      >
        <DateFieldContext
          value={{
            slots: {
              get end() {
                return aria.endFieldProps;
              },
              get start() {
                return aria.startFieldProps;
              },
            },
          }}
        >
          <ButtonContext
            value={mergeProps(
              merge(() => aria.buttonProps),
              {
                get isPressed() {
                  return state.isOpen;
                },
              }
            )}
          >
            <LabelContext
              value={mergeProps(
                merge(() => aria.labelProps),
                { elementType: "span" as const, registerSlot: registerLabel }
              )}
            >
              <RangeCalendarContext
                value={
                  // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
                  merge(() => aria.calendarProps)
                  // oxlint-enable solid/reactivity
                }
              >
                <OverlayTriggerStateContext value={state}>
                  <PopoverContext
                    value={{
                      clearContexts: CLEAR_CONTEXTS,
                      placement: "bottom start",
                      trigger: "DateRangePicker",
                      triggerRef: groupRef,
                    }}
                  >
                    <DialogContext
                      value={
                        // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
                        merge(() => aria.dialogProps)
                        // oxlint-enable solid/reactivity
                      }
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
                            {...mergeProps(
                              omit(
                                filterDOMProps(props, { global: true }),
                                "id"
                              ),
                              render,
                              merge(() => focus.focusProps ?? {})
                            )}
                            ref={(element: HTMLDivElement) => {
                              setRef(element);
                            }}
                            slot={
                              typeof props.slot === "string" &&
                              props.slot.length > 0
                                ? props.slot
                                : undefined
                            }
                            data-focus-within={focus.isFocused || undefined}
                            data-invalid={state.isInvalid || undefined}
                            data-focus-visible={
                              focus.isFocusVisible || undefined
                            }
                            data-disabled={
                              props.isDisabled === true ? true : undefined
                            }
                            data-readonly={
                              props.isReadOnly === true ? true : undefined
                            }
                            data-required={
                              props.isRequired === true ? true : undefined
                            }
                            data-open={state.isOpen || undefined}
                          >
                            {render.children}
                          </dom.div>
                        </FieldErrorContext>
                      </TextContext>
                    </DialogContext>
                  </PopoverContext>
                </OverlayTriggerStateContext>
              </RangeCalendarContext>
            </LabelContext>
          </ButtonContext>
        </DateFieldContext>
      </GroupContext>
    </DateRangePickerStateContext>
  );
}
