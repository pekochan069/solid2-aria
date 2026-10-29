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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/DateField.tsx.
 * Modified for Solid Aria: composed Solid Aria and Stately primitives with Solid 2 contexts, reactive getters, and DOM refs; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createCalendar } from "@internationalized/date";
import {
  createDateField,
  createTimeField,
} from "@solid2-aria/core/datepicker/create-date-field";
import type {
  AriaDateFieldProps,
  AriaTimeFieldProps,
} from "@solid2-aria/core/datepicker/create-date-field";
import { createDateSegment } from "@solid2-aria/core/datepicker/create-date-segment";
import { createFocusRing } from "@solid2-aria/core/focus/create-focus-ring";
import { createLocale } from "@solid2-aria/core/i18n/i18n-provider";
import { createHover } from "@solid2-aria/core/interactions/create-hover";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { requireValue } from "@solid2-aria/core/utils/require-value";
import { createDateFieldState } from "@solid2-aria/stately/datepicker/create-date-field-state";
import type {
  DateFieldState,
  DateSegment as IDateSegment,
  DateSegmentType,
} from "@solid2-aria/stately/datepicker/create-date-field-state";
import { createTimeFieldState } from "@solid2-aria/stately/datepicker/create-time-field-state";
import type { TimeFieldState } from "@solid2-aria/stately/datepicker/create-time-field-state";
import type {
  DateValue,
  TimeValue,
} from "@solid2-aria/stately/datepicker/types";
import type { HoverEvents } from "@solid2-aria/types-shared";
import type { GlobalDOMAttributes } from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";
import {
  untrack,
  createSignal,
  merge,
  createContext,
  Repeat,
  omit,
  useContext,
} from "solid-js";

import { FieldErrorContext } from "./field-error";
import { FormContext } from "./form";
import { GroupContext } from "./group";
import { HiddenDateInput } from "./hidden-date-input";
import { Input, InputContext } from "./input";
import { LabelContext } from "./label";
import { TextContext } from "./text";
import {
  assignRef,
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
  StyleRenderProps,
  SlotProps,
  Ref,
  RACValidation,
} from "./utils";

export interface DateFieldRenderProps {
  state: DateFieldState;
  isInvalid: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
  isRequired: boolean;
}

export interface DateFieldProps<T extends DateValue>
  extends
    Omit<
      AriaDateFieldProps<T>,
      | "label"
      | "description"
      | "errorMessage"
      | "validationState"
      | "validationBehavior"
    >,
    RACValidation,
    RenderProps<DateFieldRenderProps>,
    SlotProps,
    GlobalDOMAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export interface TimeFieldProps<T extends TimeValue>
  extends
    Omit<
      AriaTimeFieldProps<T>,
      | "label"
      | "description"
      | "errorMessage"
      | "validationState"
      | "validationBehavior"
    >,
    RACValidation,
    RenderProps<DateFieldRenderProps>,
    SlotProps,
    GlobalDOMAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export const DateFieldContext =
  createContext<ContextValue<DateFieldProps<DateValue>, HTMLDivElement>>(null);

export const TimeFieldContext =
  createContext<ContextValue<TimeFieldProps<TimeValue>, HTMLDivElement>>(null);

export const DateFieldStateContext = createContext<DateFieldState | null>(null);
export const TimeFieldStateContext = createContext<TimeFieldState | null>(null);

export function DateField<T extends DateValue>(
  input: DateFieldProps<T>
): JSX.Element {
  const [inputRef, setInputRef] = createSignal<HTMLInputElement | null>(null, {
    ownedWrite: true,
  });

  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    DateFieldContext
  );

  const form = createSlottedContext(FormContext);
  const locale = createLocale();

  const options = mergeProps(props, {
    createCalendar,
    get locale() {
      return locale.locale;
    },
    get validationBehavior() {
      return props.validationBehavior ?? form?.validationBehavior ?? "native";
    },
  });

  const state = createDateFieldState(options);

  const [fieldRef, setFieldRef] = createSignal<HTMLDivElement | null>(null, {
    ownedWrite: true,
  });

  const [registerLabel, label] = createSlot(
    () =>
      (props["aria-label"]?.length ?? 0) === 0 &&
      (props["aria-labelledby"]?.length ?? 0) === 0
  );

  const aria = createDateField(
    mergeProps(removeDataAttributes(options), {
      inputRef,
      get label() {
        return label();
      },
    }),
    state,
    fieldRef
  );

  const values: DateFieldRenderProps = {
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
      return props.isRequired ?? false;
    },
    state,
  };

  const render = createRenderProps(
    mergeProps(props, { defaultClass: "solid2-aria-DateField", values })
  );

  return (
    <DateFieldStateContext value={state}>
      <GroupContext
        value={mergeProps(
          merge(() => aria.fieldProps),
          {
            get isDisabled() {
              return state.isDisabled;
            },
            get isInvalid() {
              return state.isInvalid;
            },
            ref: (element: HTMLDivElement) => {
              setFieldRef(element);
            },
          }
        )}
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
              { elementType: "span" as const, registerSlot: registerLabel }
            )}
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
                  data-invalid={state.isInvalid || undefined}
                  data-disabled={state.isDisabled || undefined}
                  data-readonly={state.isReadOnly || undefined}
                  data-required={props.isRequired === true ? true : undefined}
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
          </LabelContext>
        </InputContext>
      </GroupContext>
    </DateFieldStateContext>
  );
}

export function TimeField<T extends TimeValue>(
  input: TimeFieldProps<T>
): JSX.Element {
  const [inputRef, setInputRef] = createSignal<HTMLInputElement | null>(null, {
    ownedWrite: true,
  });

  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    TimeFieldContext
  );

  const form = createSlottedContext(FormContext);
  const locale = createLocale();

  const options = mergeProps(props, {
    createCalendar,
    get locale() {
      return locale.locale;
    },
    get validationBehavior() {
      return props.validationBehavior ?? form?.validationBehavior ?? "native";
    },
  });

  const state = createTimeFieldState(options);

  const [fieldRef, setFieldRef] = createSignal<HTMLDivElement | null>(null, {
    ownedWrite: true,
  });

  const [registerLabel, label] = createSlot(
    () =>
      (props["aria-label"]?.length ?? 0) === 0 &&
      (props["aria-labelledby"]?.length ?? 0) === 0
  );

  const aria = createTimeField(
    mergeProps(removeDataAttributes(options), {
      inputRef,
      get label() {
        return label();
      },
    }),
    state,
    fieldRef
  );

  const values: DateFieldRenderProps = {
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
      return props.isRequired ?? false;
    },
    state,
  };

  const render = createRenderProps(
    mergeProps(props, { defaultClass: "solid2-aria-TimeField", values })
  );

  return (
    <TimeFieldStateContext value={state}>
      <GroupContext
        value={mergeProps(
          merge(() => aria.fieldProps),
          {
            get isDisabled() {
              return state.isDisabled;
            },
            get isInvalid() {
              return state.isInvalid;
            },
            ref: (element: HTMLDivElement) => {
              setFieldRef(element);
            },
          }
        )}
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
              { elementType: "span" as const, registerSlot: registerLabel }
            )}
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
                  data-invalid={state.isInvalid || undefined}
                  data-disabled={state.isDisabled || undefined}
                  data-readonly={state.isReadOnly || undefined}
                  data-required={props.isRequired === true ? true : undefined}
                >
                  {render.children}
                </dom.div>
              </FieldErrorContext>
            </TextContext>
          </LabelContext>
        </InputContext>
      </GroupContext>
    </TimeFieldStateContext>
  );
}

export interface DateInputRenderProps {
  isHovered: boolean;
  isFocusWithin: boolean;
  isFocusVisible: boolean;
  isDisabled: boolean;
  isInvalid: boolean;
}

export interface DateInputProps
  extends
    SlotProps,
    StyleRenderProps<DateInputRenderProps>,
    GlobalDOMAttributes<HTMLDivElement> {
  children: (segment: IDateSegment) => JSX.Element;
  ref?: Ref<HTMLDivElement>;
}

export function DateInput(props: DateInputProps): JSX.Element {
  const state =
    useContext(DateFieldStateContext) ?? useContext(TimeFieldStateContext);

  return (
    <>
      {state ? (
        <DateInputInner {...props} />
      ) : (
        <DateInputStandalone {...props} />
      )}
    </>
  );
}

function DateInputStandalone(props: DateInputProps): JSX.Element {
  const [inputRef, setInputRef] = createSignal<HTMLInputElement | null>(null, {
    ownedWrite: true,
  });

  const input: DateFieldProps<DateValue> = {
    get slot() {
      return props.slot;
    },
  };

  const [fieldProps, fieldRef, setFieldRef] = createContextProps(
    input,
    untrack(() => props.ref),
    DateFieldContext
  );

  const locale = createLocale();

  const state = createDateFieldState(
    mergeProps(fieldProps, {
      createCalendar,
      get locale() {
        return locale.locale;
      },
    })
  );

  const aria = createDateField(
    mergeProps(fieldProps, { inputRef }),
    state,
    fieldRef
  );

  return (
    <DateFieldStateContext value={state}>
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
        <GroupContext
          value={mergeProps(
            merge(() => aria.fieldProps),
            {
              get isDisabled() {
                return state.isDisabled;
              },
              get isInvalid() {
                return state.isInvalid;
              },
              ref: (element: HTMLDivElement) => {
                setFieldRef(element);
              },
            }
          )}
        >
          <DateInputInner
            {
              // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
              ...omit(props, "ref")
              // oxlint-enable solid/reactivity
            }
          />
        </GroupContext>
      </InputContext>
    </DateFieldStateContext>
  );
}

function DateInputInner(input: DateInputProps): JSX.Element {
  const state =
    useContext(DateFieldStateContext) ??
    requireValue(
      useContext(TimeFieldStateContext),
      "Expected useContext(TimeFieldStateContext)"
    );

  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    GroupContext
  );

  const focus = createFocusRing({ within: true });

  const hover = createHover(
    mergeProps(props, {
      get isDisabled() {
        return state.isDisabled;
      },
    })
  );

  const values: DateInputRenderProps = {
    get isDisabled() {
      return state.isDisabled;
    },
    get isFocusVisible() {
      return focus.isFocusVisible;
    },
    get isFocusWithin() {
      return focus.isFocused;
    },
    get isHovered() {
      return hover.isHovered;
    },
    get isInvalid() {
      return state.isInvalid;
    },
  };

  const render = createRenderProps(
    mergeProps(omit(props, "children"), {
      defaultClass: "solid2-aria-DateInput",
      values,
    })
  );

  return (
    <>
      <dom.div
        {...mergeProps(
          filterDOMProps(props, { global: true, labelable: true }),
          merge(() => focus.focusProps ?? {}),
          merge(() => hover.hoverProps ?? {}),
          render
        )}
        ref={(element: HTMLDivElement) => {
          setRef(element);
        }}
        role="group"
        slot={
          typeof props.slot === "string" && props.slot.length > 0
            ? props.slot
            : undefined
        }
        data-focus-within={focus.isFocused || undefined}
        data-focus-visible={focus.isFocusVisible || undefined}
        data-hovered={hover.isHovered || undefined}
        data-disabled={state.isDisabled || undefined}
        data-invalid={state.isInvalid || undefined}
        data-readonly={state.isReadOnly || undefined}
      >
        <Repeat count={state.segments.length}>
          {(index) => (
            <>
              {props.children(
                merge(() =>
                  requireValue(
                    state.segments[index],
                    "Expected state.segments[index]"
                  )
                )
              )}
            </>
          )}
        </Repeat>
      </dom.div>
      <Input class="" />
    </>
  );
}

export interface DateSegmentRenderProps extends Omit<
  IDateSegment,
  "isEditable"
> {
  isHovered: boolean;
  isFocused: boolean;
  isFocusVisible: boolean;
  isPlaceholder: boolean;
  isReadOnly: boolean;
  isDisabled: boolean;
  isInvalid: boolean;
  type: DateSegmentType;
}

export interface DateSegmentProps
  extends
    RenderProps<DateSegmentRenderProps, "span">,
    HoverEvents,
    GlobalDOMAttributes<HTMLSpanElement> {
  segment: IDateSegment;
  ref?: Ref<HTMLSpanElement>;
}

export function DateSegment(props: DateSegmentProps): JSX.Element {
  const state =
    useContext(DateFieldStateContext) ??
    requireValue(
      useContext(TimeFieldStateContext),
      "Expected useContext(TimeFieldStateContext)"
    );

  const [ref, setRef] = createSignal<HTMLSpanElement | null>(null, {
    ownedWrite: true,
  });

  const aria = createDateSegment(() => props.segment, state, ref);
  const focus = createFocusRing();

  const hover = createHover(
    mergeProps(props, {
      get isDisabled() {
        return state.isDisabled || props.segment.type === "literal";
      },
    })
  );

  const values: DateSegmentRenderProps = mergeProps(
    merge(() => props.segment),
    {
      get isDisabled() {
        return state.isDisabled;
      },
      get isFocusVisible() {
        return focus.isFocusVisible;
      },
      get isFocused() {
        return focus.isFocused;
      },
      get isHovered() {
        return hover.isHovered;
      },
      get isInvalid() {
        return state.isInvalid;
      },
      get isReadOnly() {
        return state.isReadOnly;
      },
    }
  );

  const render = createRenderProps(
    mergeProps(props, {
      get defaultChildren() {
        return props.segment.text;
      },
      defaultClass: "solid2-aria-DateSegment",
      values,
    })
  );

  return (
    <dom.span
      {...mergeProps(
        filterDOMProps(props, { global: true }),
        merge(() => aria.segmentProps),
        merge(() => focus.focusProps ?? {}),
        merge(() => hover.hoverProps ?? {}),
        render
      )}
      style={aria.segmentProps.style}
      ref={[
        (element: HTMLSpanElement) => {
          setRef(element);
        },
        (element: HTMLSpanElement) => {
          assignRef(
            untrack(() => props.ref),
            element
          );
        },
      ]}
      data-placeholder={props.segment.isPlaceholder || undefined}
      data-invalid={state.isInvalid || undefined}
      data-readonly={state.isReadOnly || undefined}
      data-disabled={state.isDisabled || undefined}
      data-type={props.segment.type}
      data-hovered={hover.isHovered || undefined}
      data-focused={focus.isFocused || undefined}
      data-focus-visible={focus.isFocusVisible || undefined}
    >
      {render.children}
    </dom.span>
  );
}
