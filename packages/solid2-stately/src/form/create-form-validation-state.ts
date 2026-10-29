/*
 * Copyright 2023 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-stately/src/form/useFormValidationState.ts.
 * Modified for Solid Aria: adapted state handling, APIs, or formatting for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  Validation,
  ValidationErrors,
  ValidationResult,
} from "@solid2-aria/types-shared";
import {
  createContext,
  createMemo,
  untrack,
  createSignal,
  createEffect,
  useContext,
} from "solid-js";

import { getLegacyValidationState } from "../utils/legacy-props";

export const VALID_VALIDITY_STATE: ValidationResult["validationDetails"] = {
  badInput: false,
  customError: false,
  patternMismatch: false,
  rangeOverflow: false,
  rangeUnderflow: false,
  stepMismatch: false,
  tooLong: false,
  tooShort: false,
  typeMismatch: false,
  valid: true,
  valueMissing: false,
};

const CUSTOM_VALIDITY_STATE: ValidationResult["validationDetails"] = {
  badInput: false,
  customError: true,
  patternMismatch: false,
  rangeOverflow: false,
  rangeUnderflow: false,
  stepMismatch: false,
  tooLong: false,
  tooShort: false,
  typeMismatch: false,
  valid: false,
  valueMissing: false,
};

export const DEFAULT_VALIDATION_RESULT: ValidationResult = {
  isInvalid: false,
  validationDetails: VALID_VALIDITY_STATE,
  validationErrors: [],
};

export const FormValidationContext = createContext<ValidationErrors>({});
export const privateValidationStateProp = "__solid2AriaFormValidationState";

export interface FormValidationProps<T> extends Validation<T> {
  builtinValidation?: ValidationResult;
  name?: string | string[];
  value: T | null;
  __solid2AriaFormValidationState?: FormValidationState;
}

export interface FormValidationState {
  readonly realtimeValidation: ValidationResult;
  readonly displayValidation: ValidationResult;
  updateValidation: (result: ValidationResult) => void;
  resetValidation: () => void;
  commitValidation: () => void;
}

function result(errors: string[]): ValidationResult | null {
  return errors.length
    ? {
        isInvalid: true,
        validationDetails: CUSTOM_VALIDITY_STATE,
        validationErrors: errors,
      }
    : null;
}

export function createFormValidationState<T>(
  props: FormValidationProps<T>
): FormValidationState {
  const inherited = untrack(() => props.__solid2AriaFormValidationState);

  if (inherited) {
    return inherited;
  }

  const serverErrors = useContext(FormValidationContext);

  const [clearedErrors, setClearedErrors] =
    createSignal<ValidationErrors | null>(null);

  const [current, setCurrent] = createSignal(DEFAULT_VALIDATION_RESULT);
  const [queued, setQueued] = createSignal(false);
  let next = DEFAULT_VALIDATION_RESULT;

  const controlled = createMemo(() => {
    const legacyState = getLegacyValidationState(props);

    const invalid =
      props.isInvalid ??
      (legacyState === undefined ? undefined : legacyState === "invalid");

    return invalid === undefined
      ? null
      : {
          isInvalid: invalid,
          validationDetails: CUSTOM_VALIDITY_STATE,
          validationErrors: [],
        };
  });

  const client = createMemo(() => {
    const error = props.value === null ? null : props.validate?.(props.value);

    if (typeof error === "string") {
      return result([error]);
    }

    return result(Array.isArray(error) ? error : []);
  });

  const builtin = () =>
    props.builtinValidation?.validationDetails.valid === true
      ? undefined
      : props.builtinValidation;

  const server = createMemo(() => {
    if (props.name === undefined || clearedErrors() === serverErrors) {
      return null;
    }

    const names = Array.isArray(props.name) ? props.name : [props.name];

    return result(
      names.flatMap((name) => {
        const e = serverErrors[name];

        if (e === undefined) {
          return [];
        }

        return Array.isArray(e) ? e : [e];
      })
    );
  });

  createEffect(
    () => ({ error: client() ?? builtin() ?? next, queued: queued() }),
    ({ queued: shouldCommit, error }) => {
      if (shouldCommit) {
        setQueued(false);
        setCurrent(error);
      }
    }
  );

  return {
    commitValidation() {
      if (props.validationBehavior === "native") {
        setQueued(true);
      }

      setClearedErrors(serverErrors);
    },
    get displayValidation() {
      return (
        controlled() ??
        server() ??
        (props.validationBehavior === "native"
          ? current()
          : (client() ?? builtin() ?? current()))
      );
    },
    get realtimeValidation() {
      return (
        controlled() ??
        server() ??
        client() ??
        builtin() ??
        DEFAULT_VALIDATION_RESULT
      );
    },
    resetValidation() {
      setCurrent(DEFAULT_VALIDATION_RESULT);
      setQueued(false);
      setClearedErrors(serverErrors);
    },
    updateValidation(v) {
      if (props.validationBehavior === "native") {
        next = v;
      } else {
        setCurrent(v);
      }
    },
  };
}

export function mergeValidation(
  ...results: ValidationResult[]
): ValidationResult {
  const errors = new Set<string>();
  let isInvalid = false;

  const validationDetails = {
    // oxlint-disable-next-line typescript/no-misused-spread -- The validation defaults are plain object literals, not native ValidityState instances.
    ...VALID_VALIDITY_STATE,
  };

  for (const v of results) {
    for (const e of v.validationErrors) {
      errors.add(e);
    }

    // Only these properties apply for checkboxes.
    isInvalid ||= v.isInvalid;

    for (const key of [
      "badInput",
      "customError",
      "patternMismatch",
      "rangeOverflow",
      "rangeUnderflow",
      "stepMismatch",
      "tooLong",
      "tooShort",
      "typeMismatch",
      "valid",
      "valueMissing",
    ] as const) {
      validationDetails[key] ||= v.validationDetails[key];
    }
  }

  validationDetails.valid = !isInvalid;

  return {
    isInvalid,
    validationDetails,
    validationErrors: [...errors],
  };
}
