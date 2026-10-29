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
 * Derived from Adobe React Spectrum: packages/react-aria/src/form/useFormValidation.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2; commit native change validation after controlled input handlers.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { FormValidationState } from "@solid2-aria/stately/form/create-form-validation-state";
import type { Validation, ValidationResult } from "@solid2-aria/types-shared";
import { untrack, createEffect } from "solid-js";
import type { Accessor } from "solid-js";

import { setInteractionModality } from "../interactions/create-focus-visible";

type ValidatableElement =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;

interface FormValidationProps<T> extends Validation<T> {
  focus?: () => void;
}

export function createFormValidation<T>(
  props: FormValidationProps<T>,
  state: FormValidationState,
  ref: Accessor<ValidatableElement | null> | undefined
): void {
  const _result0 = props;
  createEffect(
    () => ({
      element: ref?.(),
      isInvalid: state.realtimeValidation.isInvalid,
      validationBehavior: _result0.validationBehavior,
      validationErrors: state.realtimeValidation.validationErrors,
    }),
    ({ isInvalid, validationErrors, validationBehavior, element }) => {
      const refElement = element;

      if (
        validationBehavior === "native" &&
        refElement &&
        "setCustomValidity" in refElement &&
        !refElement.disabled
      ) {
        const errorMessage = isInvalid
          ? validationErrors.join(" ") || "Invalid value."
          : "";

        refElement.setCustomValidity(errorMessage);

        // Prevent default tooltip for validation message.
        // https://bugzilla.mozilla.org/show_bug.cgi?id=605277
        if (!refElement.hasAttribute("title")) {
          refElement.title = "";
        }

        if (!isInvalid) {
          untrack(() => {
            state.updateValidation(getNativeValidity(refElement));
          });
        }
      }
    },
    { ssrSource: "client" }
  );

  let validationTimer: ReturnType<typeof setTimeout> | undefined;

  const onReset = (event: Event) => {
    if (!event.defaultPrevented) {
      clearTimeout(validationTimer);
      validationTimer = undefined;
      state.resetValidation();
    }
  };

  const onInvalid = (e: Event) => {
    // Only commit validation if we are not already displaying one.
    // This avoids clearing server errors that the user didn't actually fix.
    if (!state.displayValidation.isInvalid) {
      state.commitValidation();
    }

    // Auto focus the first invalid input in a form, unless the error already had its default prevented.
    const form = ref?.()?.form;

    if (
      !e.defaultPrevented &&
      ref &&
      form &&
      getFirstInvalidInput(form) === ref()
    ) {
      if (_result0.focus) {
        _result0.focus();
      } else {
        ref()?.focus();
      }

      // Always show focus ring.
      setInteractionModality("keyboard");
    }

    // Prevent default browser error UI from appearing.
    e.preventDefault();
  };

  const onChange = () => {
    clearTimeout(validationTimer);
    validationTimer = setTimeout(() => {
      validationTimer = undefined;
      state.commitValidation();
    }, 0);
  };

  createEffect(
    () => ref?.(),
    (input): undefined | (() => void) => {
      if (!input) {
        return undefined;
      }

      const { form } = input;
      // 'change' and 'reset' do not compose across shadow DOM boundaries, but these listeners are
      // intentionally scoped to this specific input/form element (not a global target), so shadow
      // root propagation does not apply here.
      input.addEventListener("invalid", onInvalid);

      input.addEventListener("change", onChange);

      form?.addEventListener("reset", onReset);

      return () => {
        clearTimeout(validationTimer);
        input.removeEventListener("invalid", onInvalid);
        input.removeEventListener("change", onChange);
        form?.removeEventListener("reset", onReset);
      };
    },
    { ssrSource: "client" }
  );
}

function getValidity(input: ValidatableElement) {
  // The native ValidityState object is live, meaning each property is a getter that returns the current state.
  // We need to create a snapshot of the validity state at the time this function is called across reactive updates.
  const { validity } = input;

  return {
    badInput: validity.badInput,
    customError: validity.customError,
    patternMismatch: validity.patternMismatch,
    rangeOverflow: validity.rangeOverflow,
    rangeUnderflow: validity.rangeUnderflow,
    stepMismatch: validity.stepMismatch,
    tooLong: validity.tooLong,
    tooShort: validity.tooShort,
    typeMismatch: validity.typeMismatch,
    valid: validity.valid,
    valueMissing: validity.valueMissing,
  };
}

function getNativeValidity(input: ValidatableElement): ValidationResult {
  return {
    isInvalid: !input.validity.valid,
    validationDetails: getValidity(input),
    validationErrors: input.validationMessage ? [input.validationMessage] : [],
  };
}

function getFirstInvalidInput(
  form: HTMLFormElement
): ValidatableElement | null {
  for (const element of form.elements) {
    const owner = form.ownerDocument.defaultView;

    if (
      !owner ||
      (!(element instanceof owner.HTMLInputElement) &&
        !(element instanceof owner.HTMLTextAreaElement) &&
        !(element instanceof owner.HTMLSelectElement))
    ) {
      continue;
    }

    if (!element.validity?.valid) {
      return element;
    }
  }

  return null;
}
