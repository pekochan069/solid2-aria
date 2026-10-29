/*
 * Copyright 2020 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria/src/datepicker/useDateField.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { DateFieldState } from "@solid2-aria/stately/datepicker/create-date-field-state";
import type { TimeFieldState } from "@solid2-aria/stately/datepicker/create-time-field-state";
import type {
  DateFieldProps,
  DateValue,
  TimePickerProps,
  TimeValue,
} from "@solid2-aria/stately/datepicker/types";
import type {
  AriaLabelingProps,
  DOMProps,
  InputDOMProps,
  ValidationResult,
} from "@solid2-aria/types-shared";
import type {
  DOMAttributes,
  GroupDOMAttributes,
} from "@solid2-aria/types-shared-web";
import { untrack, merge, createEffect, createMemo } from "solid-js";
import type { Accessor } from "solid-js";

import intlMessages from "../../intl/datepicker/index";
import { createFocusManager } from "../focus/focus-scope";
import type { FocusManager } from "../focus/focus-scope";
import { createFormValidation } from "../form/create-form-validation";
import { createLocalizedStringFormatter } from "../i18n/create-localized-string-formatter";
import { createFocusWithin } from "../interactions/create-focus-within";
import { createKeyboard } from "../interactions/create-keyboard";
import { createField } from "../label/create-field";
import type {
  FocusEvent as DOMFocusEvent,
  InputHTMLAttributes,
} from "../types";
import { ariaValue } from "../utils/aria-value";
import { createDescription } from "../utils/create-description";
import { createFormReset } from "../utils/create-form-reset";
import { filterDOMProps } from "../utils/filter-dom-props";
import { mergeProps } from "../utils/merge-props";
import { getTruthyValue, isTruthy } from "../utils/truthy";
import { createDatePickerGroup } from "./create-date-picker-group";

export interface AriaDateFieldProps<T extends DateValue>
  extends DateFieldProps<T>, AriaLabelingProps, DOMProps, InputDOMProps {
  /**
   * Describes the type of autocomplete functionality the input should provide if any. See
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefautocomplete).
   */
  autoComplete?: string;
}

// Allows this hook to also be used with TimeField
export interface AriaDateFieldOptions<T extends DateValue> extends Omit<
  AriaDateFieldProps<T>,
  | "value"
  | "defaultValue"
  | "onChange"
  | "minValue"
  | "maxValue"
  | "placeholderValue"
  | "validate"
> {
  /** A ref for the hidden input element for HTML form submission. */
  inputRef?: Accessor<HTMLInputElement | null>;
  [roleSymbol]?: "presentation" | "group";
  [focusManagerSymbol]?: FocusManager;
}

export interface DateFieldAria extends ValidationResult {
  /** Props for the field's visible label element, if any. */
  labelProps: DOMAttributes;
  /** Props for the field grouping element. */
  fieldProps: GroupDOMAttributes;
  /** Props for the hidden input element for HTML form submission. */
  inputProps: InputHTMLAttributes;
  /** Props for the description element, if any. */
  descriptionProps: DOMAttributes;
  /** Props for the error message element, if any. */
  errorMessageProps: DOMAttributes;
}

// Data that is passed between useDateField and useDateSegment.
interface HookData {
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  focusManager: FocusManager;
}

export const hookData: WeakMap<DateFieldState, HookData> = new WeakMap<
  DateFieldState,
  HookData
>();

// Private metadata shared by date fields, date pickers, and date range pickers.
// These need to be stable across server and client module evaluation for SSR hydration.
export const roleSymbol = "__solid2AriaDateFieldRole";
export const focusManagerSymbol = "__solid2AriaDateFieldFocusManager";

/**
 * Provides the behavior and accessibility implementation for a date field component.
 * A date field allows users to enter and edit date and time values using a keyboard.
 * Each part of a date value is displayed in an individually editable segment.
 */
export function createDateField<T extends DateValue>(
  props: AriaDateFieldOptions<T>,
  state: DateFieldState,
  ref: Accessor<Element | null>
): DateFieldAria {
  const _result0 = createMemo(() => state.displayValidation);

  const _result1 = createField(
    merge(props, {
      get errorMessage() {
        return (
          getTruthyValue(props.errorMessage) ?? _result0().validationErrors
        );
      },
      get isInvalid() {
        return _result0().isInvalid;
      },
      get labelElementType() {
        return "span" as const;
      },
    })
  );

  let valueOnFocus: DateValue | null = null;

  const _result2 = createFocusWithin(
    merge(props, {
      get onBlurWithin() {
        return (e: DOMFocusEvent) => {
          state.confirmPlaceholder();

          if (state.value !== valueOnFocus) {
            state.commitValidation();
          }

          props.onBlur?.(e);
        };
      },
      onFocusWithin(e: DOMFocusEvent) {
        valueOnFocus = state.value;
        props.onFocus?.(e);
      },
      get onFocusWithinChange() {
        return props.onFocusChange;
      },
    })
  );

  const _result3 = createKeyboard({
    get onKeyDown() {
      return props.onKeyDown;
    },
    get onKeyUp() {
      return props.onKeyUp;
    },
  });

  const stringFormatter = createLocalizedStringFormatter(
    intlMessages,
    "@react-aria/datepicker"
  );

  const message = createMemo(() =>
    state.maxGranularity === "hour"
      ? "selectedTimeDescription"
      : "selectedDateDescription"
  );

  const field = createMemo(() =>
    state.maxGranularity === "hour" ? "time" : "date"
  );

  const description = createMemo(() =>
    state.value
      ? stringFormatter.format(message(), {
          [field()]: state.formatValue({ month: "long" }),
        })
      : ""
  );

  const descProps = createDescription(() => description());

  // If within a date picker or date range picker, the date field will have role="presentation" and an aria-describedby
  // will be passed in that references the value (e.g. entire range). Otherwise, add the field's value description.
  const describedBy = createMemo(() =>
    props[roleSymbol] === "presentation"
      ? _result1.fieldProps["aria-describedby"]
      : [descProps["aria-describedby"], _result1.fieldProps["aria-describedby"]]
          .filter(Boolean)
          .join(" ") || undefined
  );

  const propsFocusManager = createMemo(() => props[focusManagerSymbol]);

  const focusManager = createMemo(
    () => getTruthyValue(propsFocusManager()) ?? createFocusManager(ref)
  );

  const groupProps = createDatePickerGroup(
    state,
    ref,
    () => props[roleSymbol] === "presentation"
  );

  // Pass labels and other information to segments.
  hookData.set(state, {
    get ariaDescribedBy() {
      return describedBy();
    },
    get ariaLabel() {
      return props["aria-label"];
    },
    get ariaLabelledBy() {
      return (
        [_result1.labelProps.id, props["aria-labelledby"]]
          .filter(Boolean)
          .join(" ") || undefined
      );
    },
    get focusManager() {
      return focusManager();
    },
  });
  let autoFocusRef = untrack(() => props.autoFocus);

  // When used within a date picker or date range picker, the field gets role="presentation"
  // rather than role="group". Since the date picker/date range picker already has a role="group"
  // with a label and description, and the segments are already labeled by this as well, this
  // avoids very verbose duplicate announcements.
  const fieldDOMProps = createMemo<GroupDOMAttributes>(() =>
    props[roleSymbol] === "presentation"
      ? { role: "presentation" }
      : mergeProps(_result1.fieldProps, {
          "aria-describedby": ariaValue(describedBy()),
          "aria-disabled": ariaValue(
            getTruthyValue(props.isDisabled) ?? undefined
          ),
          role: "group" as const,
        })
  );

  createEffect(
    () => ({ focusManager: focusManager() }),
    ({ focusManager: currentFocusManager }) => {
      if (isTruthy(autoFocusRef)) {
        currentFocusManager.focusFirst();
      }

      autoFocusRef = false;
    },
    { ssrSource: "client" }
  );
  const inputRef = () => props.inputRef?.() ?? null;
  createFormReset(inputRef, () => state.defaultValue, state.setValue);
  createFormValidation(
    merge(props, {
      focus() {
        focusManager().focusFirst();
      },
    }),
    state,
    inputRef
  );

  const inputProps = createMemo(() => ({
    defaultValue: getTruthyValue(state.value?.toString()) ?? "",
    disabled: props.isDisabled,
    form: props.form,
    hidden: props.validationBehavior === "native" ? true : undefined,
    name: props.name,
    required:
      props.validationBehavior === "native" ? props.isRequired : undefined,
    type:
      props.validationBehavior === "native"
        ? ("text" as const)
        : ("hidden" as const),
    value: getTruthyValue(state.value?.toString()) ?? "",
  }));

  const domProps = createMemo(() => filterDOMProps(props));

  return {
    get descriptionProps() {
      return _result1.descriptionProps;
    },
    get errorMessageProps() {
      return _result1.errorMessageProps;
    },
    get fieldProps() {
      return mergeProps(
        domProps(),
        fieldDOMProps(),
        groupProps,
        _result2.focusWithinProps,
        _result3.keyboardProps,
        {
          style: {
            "unicode-bidi": "isolate",
          },
        }
      );
    },
    get inputProps() {
      return inputProps();
    },
    get isInvalid() {
      return _result0().isInvalid;
    },
    get labelProps() {
      return mergeProps(
        {
          get "aria-label"() {
            return _result1.labelProps["aria-label"];
          },
          get "aria-labelledby"() {
            return _result1.labelProps["aria-labelledby"];
          },
          get id() {
            const { id } = _result1.labelProps;

            return typeof id === "string" ? id : undefined;
          },
        },
        {
          get onClick() {
            return () => {
              focusManager().focusFirst();
            };
          },
        }
      );
    },
    get validationDetails() {
      return _result0().validationDetails;
    },
    get validationErrors() {
      return _result0().validationErrors;
    },
  };
}

export interface AriaTimeFieldProps<T extends TimeValue>
  extends TimePickerProps<T>, AriaLabelingProps, DOMProps, InputDOMProps {}

export interface AriaTimeFieldOptions<
  T extends TimeValue,
> extends AriaTimeFieldProps<T> {
  /** A ref for the hidden input element for HTML form submission. */
  inputRef?: Accessor<HTMLInputElement | null>;
  [roleSymbol]?: "presentation" | "group";
  [focusManagerSymbol]?: FocusManager;
}

/**
 * Provides the behavior and accessibility implementation for a time field component.
 * A time field allows users to enter and edit time values using a keyboard.
 * Each part of a time value is displayed in an individually editable segment.
 */
export function createTimeField<T extends TimeValue>(
  props: AriaTimeFieldOptions<T>,
  state: TimeFieldState,
  ref: Accessor<Element | null>
): DateFieldAria {
  const res = createDateField(props, state, ref);

  return merge(res, {
    get inputProps() {
      return merge(res.inputProps, {
        get defaultValue() {
          return state.timeValue?.toString() ?? "";
        },
        get value() {
          return state.timeValue?.toString() ?? "";
        },
      });
    },
  });
}
