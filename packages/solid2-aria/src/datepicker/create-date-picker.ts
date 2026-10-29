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
 * Derived from Adobe React Spectrum: packages/react-aria/src/datepicker/useDatePicker.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { CalendarProps } from "@solid2-aria/stately/calendar/create-calendar-state";
import type { DatePickerState } from "@solid2-aria/stately/datepicker/create-date-picker-state";
import type {
  DatePickerProps,
  DateValue,
} from "@solid2-aria/stately/datepicker/types";
import { privateValidationStateProp } from "@solid2-aria/stately/form/create-form-validation-state";
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
import { merge, createMemo } from "solid-js";
import type { Accessor } from "solid-js";

import intlMessages from "../../intl/datepicker/index";
import type { AriaButtonProps } from "../button/create-button";
import type { AriaDialogProps } from "../dialog/create-dialog";
import { createFocusManager } from "../focus/focus-scope";
import { createLocalizedStringFormatter } from "../i18n/create-localized-string-formatter";
import { createLocale } from "../i18n/i18n-provider";
import { createFocusWithin } from "../interactions/create-focus-within";
import { createKeyboard } from "../interactions/create-keyboard";
import { createField } from "../label/create-field";
import type { FocusEvent as DOMFocusEvent } from "../types";
import { ariaValue } from "../utils/aria-value";
import { createDescription } from "../utils/create-description";
import { createId } from "../utils/create-id";
import { filterDOMProps } from "../utils/filter-dom-props";
import { isCallable } from "../utils/is-callable";
import { mergeProps } from "../utils/merge-props";
import { nodeContains } from "../utils/shadowdom/dom-functions";
import { getTruthyValue } from "../utils/truthy";
import { roleSymbol } from "./create-date-field";
import { createDatePickerGroup } from "./create-date-picker-group";

export interface AriaDatePickerProps<T extends DateValue>
  extends
    DatePickerProps<T>,
    AriaLabelingProps,
    InputDOMProps,
    DOMProps,
    InputDOMProps {
  /**
   * Describes the type of autocomplete functionality the input should provide if any. See
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefautocomplete).
   */
  autoComplete?: string;
}

export interface DatePickerAria extends ValidationResult {
  /** Props for the date picker's visible label element, if any. */
  labelProps: DOMAttributes;
  /** Props for the grouping element containing the date field and button. */
  groupProps: GroupDOMAttributes;
  /** Props for the date field. */
  fieldProps: AriaDatePickerProps<DateValue>;
  /** Props for the popover trigger button. */
  buttonProps: AriaButtonProps;
  /** Props for the description element, if any. */
  descriptionProps: DOMAttributes;
  /** Props for the error message element, if any. */
  errorMessageProps: DOMAttributes;
  /** Props for the popover dialog. */
  dialogProps: AriaDialogProps;
  /** Props for the calendar within the popover dialog. */
  calendarProps: CalendarProps<DateValue>;
}

/**
 * Provides the behavior and accessibility implementation for a date picker component. A date picker
 * combines a DateField and a Calendar popover to allow users to enter or select a date and time
 * value.
 */
export function createDatePicker<T extends DateValue>(
  props: AriaDatePickerProps<T>,
  state: DatePickerState,
  ref: Accessor<Element | null>
): DatePickerAria {
  const buttonId = createId();
  const dialogId = createId();
  const fieldId = createId();

  const stringFormatter = createLocalizedStringFormatter(
    intlMessages,
    "@react-aria/datepicker"
  );

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

  const groupProps = createDatePickerGroup(state, ref);

  const labelledBy = createMemo(
    () =>
      getTruthyValue(_result1.fieldProps["aria-labelledby"]) ??
      _result1.fieldProps.id
  );

  const _result2 = createLocale();

  const date = createMemo(() =>
    state.formatValue(_result2.locale, { month: "long" })
  );

  const description = createMemo(() =>
    date()
      ? stringFormatter.format("selectedDateDescription", { date: date() })
      : ""
  );

  const descProps = createDescription(() => description());

  const ariaDescribedBy = createMemo(
    () =>
      [descProps["aria-describedby"], _result1.fieldProps["aria-describedby"]]
        .filter(Boolean)
        .join(" ") || undefined
  );

  const domProps = createMemo(() => filterDOMProps(props));

  const focusManager = createMemo(() => createFocusManager(ref));

  let isFocused = false;

  const _result3 = createFocusWithin(
    merge(props, {
      get isDisabled() {
        return state.isOpen;
      },
      get onBlurWithin() {
        return (e: DOMFocusEvent) => {
          // Ignore when focus moves into the popover.
          const dialog = document.getElementById(dialogId());

          if (
            !nodeContains(
              dialog,
              e.relatedTarget instanceof Node ? e.relatedTarget : null
            )
          ) {
            isFocused = false;
            props.onBlur?.(e);
            props.onFocusChange?.(false);
          }
        };
      },
      get onFocusWithin() {
        return (e: DOMFocusEvent) => {
          if (!isFocused) {
            isFocused = true;
            props.onFocus?.(e);
            props.onFocusChange?.(true);
          }
        };
      },
    })
  );

  const _result4 = createKeyboard({
    get onKeyDown() {
      return props.onKeyDown;
    },
    get onKeyUp() {
      return props.onKeyUp;
    },
  });

  return {
    get buttonProps() {
      return merge(descProps, {
        get "aria-describedby"() {
          return ariaValue(ariaValue(ariaDescribedBy()));
        },
        get "aria-expanded"() {
          return ariaValue(ariaValue(state.isOpen));
        },
        get "aria-haspopup"() {
          return "dialog" as const;
        },
        get "aria-label"() {
          return ariaValue(ariaValue(stringFormatter.format("calendar")));
        },
        get "aria-labelledby"() {
          return ariaValue(ariaValue(`${buttonId()} ${labelledBy()}`));
        },
        get id() {
          return buttonId();
        },
        get isDisabled() {
          return getTruthyValue(props.isDisabled) ?? props.isReadOnly;
        },
        get onPress() {
          return () => {
            state.setOpen(true);
          };
        },
      });
    },
    get calendarProps() {
      return {
        get autoFocus() {
          return true;
        },
        get defaultFocusedValue() {
          return state.dateValue ? undefined : props.placeholderValue;
        },
        get errorMessage() {
          return typeof props.errorMessage === "function"
            ? props.errorMessage(state.displayValidation)
            : (getTruthyValue(props.errorMessage) ??
                state.displayValidation.validationErrors.join(" "));
        },
        get firstDayOfWeek() {
          return props.firstDayOfWeek;
        },
        get isDateUnavailable() {
          return props.isDateUnavailable;
        },
        get isDisabled() {
          return props.isDisabled;
        },
        get isInvalid() {
          return state.isInvalid;
        },
        get isReadOnly() {
          return props.isReadOnly;
        },
        get maxValue() {
          return props.maxValue;
        },
        get minValue() {
          return props.minValue;
        },
        get onChange() {
          return state.setDateValue;
        },
        get pageBehavior() {
          return props.pageBehavior;
        },
        get value() {
          return state.dateValue;
        },
      };
    },
    get descriptionProps() {
      return _result1.descriptionProps;
    },
    get dialogProps() {
      return {
        get "aria-labelledby"() {
          return ariaValue(ariaValue(`${buttonId()} ${labelledBy()}`));
        },
        get id() {
          return dialogId();
        },
      };
    },
    get errorMessageProps() {
      return _result1.errorMessageProps;
    },
    get fieldProps() {
      // DatePicker owns the validation state for the date field.
      return merge(_result1.fieldProps, {
        get "aria-describedby"() {
          return ariaValue(ariaValue(ariaDescribedBy()));
        },
        get autoFocus() {
          return props.autoFocus;
        },
        get defaultValue() {
          return state.defaultValue;
        },
        get form() {
          return props.form;
        },
        get granularity() {
          return props.granularity;
        },
        get hideTimeZone() {
          return props.hideTimeZone;
        },
        get hourCycle() {
          return props.hourCycle;
        },
        get id() {
          return fieldId();
        },
        get isDisabled() {
          return props.isDisabled;
        },
        get isReadOnly() {
          return props.isReadOnly;
        },
        get isRequired() {
          return props.isRequired;
        },
        get name() {
          return props.name;
        },
        get onChange() {
          return state.setValue;
        },
        get placeholderValue() {
          return props.placeholderValue;
        },
        get [privateValidationStateProp]() {
          return state;
        },
        get [roleSymbol]() {
          return "presentation" as const;
        },
        get shouldForceLeadingZeros() {
          return props.shouldForceLeadingZeros;
        },
        get validationBehavior() {
          return props.validationBehavior;
        },
        get value() {
          return state.value;
        },
      });
    },
    get groupProps() {
      return mergeProps(
        domProps(),
        groupProps,
        _result1.fieldProps,
        descProps,
        _result3.focusWithinProps,
        {
          "aria-describedby": ariaValue(ariaDescribedBy()),
          "aria-disabled": ariaValue(getTruthyValue(props.isDisabled) ?? null),
          "aria-labelledby": ariaValue(labelledBy()),
          onKeyDown(e: Parameters<NonNullable<DOMAttributes["onKeyDown"]>>[0]) {
            if (state.isOpen) {
              return;
            }

            const handler = _result4.keyboardProps.onKeyDown;

            if (isCallable(handler)) {
              handler(e);
            }
          },
          onKeyUp(e: Parameters<NonNullable<DOMAttributes["onKeyUp"]>>[0]) {
            if (state.isOpen) {
              return;
            }

            const handler = _result4.keyboardProps.onKeyUp;

            if (isCallable(handler)) {
              handler(e);
            }
          },
          role: "group" as const,
        }
      );
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
