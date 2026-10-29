/*
 * Copyright 2021 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria/src/textfield/useFormattedTextField.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { omit, merge, createEffect } from "solid-js";
import type { Accessor } from "solid-js";

import type { InputEventHandler } from "../types";
import { isPresent } from "../utils/is-present";
import { mergeProps } from "../utils/merge-props";
import { requireValue } from "../utils/require-value";
import { whenTruthy } from "../utils/truthy";
import { createTextField } from "./create-text-field";
import type { AriaTextFieldProps, TextFieldAria } from "./create-text-field";

interface FormattedTextFieldState {
  validate: (val: string) => boolean;
  setInputValue: (val: string) => void;
}

function supportsNativeBeforeInputEvent() {
  return whenTruthy(
    whenTruthy(typeof window !== "undefined", () => window.InputEvent),
    () => typeof InputEvent.prototype.getTargetRanges === "function"
  );
}

export function createFormattedTextField(
  props: AriaTextFieldProps,
  state: FormattedTextFieldState,
  inputRef: Accessor<HTMLInputElement | null>
): TextFieldAria {
  // Native beforeinput can reject invalid edits before the browser changes the value.
  // Platforms without it validate the resulting input value instead.
  const onBeforeInputFallback = (e: InputEvent) => {
    const input = inputRef();

    if (!input) {
      return;
    }

    // Compute the next value of the input if the event is allowed to proceed.
    // See https://www.w3.org/TR/input-events-2/#interface-InputEvent-Attributes for a full list of input types.
    let nextValue: string | null = null;

    switch (e.inputType) {
      case "historyUndo":
      case "historyRedo": {
        // Explicitly allow undo/redo. e.data is null in this case, but there's no need to validate,
        // because presumably the input would have already been validated previously.
        return;
      }

      case "insertLineBreak": {
        // Explicitly allow "insertLineBreak" event, to allow onSubmit for "enter" key. e.data is null in this case.
        return;
      }

      case "deleteContent":
      case "deleteByCut":
      case "deleteByDrag": {
        nextValue =
          input.value.slice(
            0,
            requireValue(input.selectionStart, "Expected input.selectionStart")
          ) +
          input.value.slice(
            requireValue(input.selectionEnd, "Expected input.selectionEnd")
          );
        break;
      }

      case "deleteContentForward": {
        // This is potentially incorrect, since the browser may actually delete more than a single UTF-16
        // character. In reality, a full Unicode grapheme cluster consisting of multiple UTF-16 characters
        // or code points may be deleted. However, in our currently supported locales, there are no such cases.
        // If we support additional locales in the future, this may need to change.
        nextValue =
          input.selectionEnd === input.selectionStart
            ? input.value.slice(
                0,
                requireValue(
                  input.selectionStart,
                  "Expected input.selectionStart"
                )
              ) +
              input.value.slice(
                requireValue(
                  input.selectionEnd,
                  "Expected input.selectionEnd"
                ) + 1
              )
            : input.value.slice(
                0,
                requireValue(
                  input.selectionStart,
                  "Expected input.selectionStart"
                )
              ) +
              input.value.slice(
                requireValue(input.selectionEnd, "Expected input.selectionEnd")
              );
        break;
      }

      case "deleteContentBackward": {
        nextValue =
          input.selectionEnd === input.selectionStart
            ? input.value.slice(
                0,
                requireValue(
                  input.selectionStart,
                  "Expected input.selectionStart"
                ) - 1
              ) +
              input.value.slice(
                requireValue(
                  input.selectionStart,
                  "Expected input.selectionStart"
                )
              )
            : input.value.slice(
                0,
                requireValue(
                  input.selectionStart,
                  "Expected input.selectionStart"
                )
              ) +
              input.value.slice(
                requireValue(input.selectionEnd, "Expected input.selectionEnd")
              );
        break;
      }

      case "deleteSoftLineBackward":
      case "deleteHardLineBackward": {
        nextValue = input.value.slice(
          requireValue(input.selectionStart, "Expected input.selectionStart")
        );
        break;
      }

      default: {
        if (isPresent(e.data)) {
          nextValue =
            input.value.slice(
              0,
              requireValue(
                input.selectionStart,
                "Expected input.selectionStart"
              )
            ) +
            e.data +
            input.value.slice(
              requireValue(input.selectionEnd, "Expected input.selectionEnd")
            );
        }

        break;
      }
    }

    // If we did not compute a value, or the new value is invalid, prevent the event
    // so that the browser does not update the input text, move the selection, or add to
    // the undo/redo stack.
    if (!isPresent(nextValue) || !state.validate(nextValue)) {
      e.preventDefault();
    }
  };

  createEffect(
    () => ({ inputElement: inputRef() }),
    ({ inputElement }): undefined | (() => void) => {
      const inputRefElement = inputElement;

      if (!supportsNativeBeforeInputEvent() || !inputRefElement) {
        return undefined;
      }

      const input = inputRefElement;
      input.addEventListener("beforeinput", onBeforeInputFallback, false);

      return () => {
        input.removeEventListener("beforeinput", onBeforeInputFallback, false);
      };
    },
    { ssrSource: "client" }
  );

  const onBeforeInput: InputEventHandler<HTMLInputElement> | undefined =
    supportsNativeBeforeInputEvent()
      ? undefined
      : (e) => {
          const nextValue =
            e.currentTarget.value.slice(
              0,
              requireValue(
                e.currentTarget.selectionStart,
                "Expected e.currentTarget.selectionStart"
              )
            ) +
            e.data +
            e.currentTarget.value.slice(
              requireValue(
                e.currentTarget.selectionEnd,
                "Expected e.currentTarget.selectionEnd"
              )
            );

          if (!state.validate(nextValue)) {
            e.preventDefault();
          }
        };

  const _result0 = createTextField(props, inputRef);

  let compositionStartState: {
    value: string;
    selectionStart: number | null;
    selectionEnd: number | null;
  } | null = null;

  return merge(
    {
      get descriptionProps() {
        return _result0.descriptionProps;
      },
      get errorMessageProps() {
        return _result0.errorMessageProps;
      },
      get inputProps() {
        return mergeProps(_result0.inputProps, {
          onBeforeInput,
          onCompositionEnd() {
            const inputRefElement = inputRef();

            if (inputRefElement && !state.validate(inputRefElement.value)) {
              // Restore the input value in the DOM immediately so we can synchronously update the selection position.
              // But also update the controlled value as well so it is correct for future updates.
              const { value, selectionStart, selectionEnd } = requireValue(
                compositionStartState,
                "Expected compositionStartState.current"
              );

              inputRefElement.value = value;
              inputRefElement.setSelectionRange(selectionStart, selectionEnd);
              state.setInputValue(value);
            }
          },
          onCompositionStart() {
            // Chrome does not implement Input Events Level 2, which specifies the insertFromComposition
            // and deleteByComposition inputType values for the beforeinput event. These are meant to occur
            // at the end of a composition (e.g. Pinyin IME, Android auto correct, etc.), and crucially, are
            // cancelable. The insertCompositionText and deleteCompositionText input types are not cancelable,
            // nor would we want to cancel them because the input from the user is incomplete at that point.
            // In Safari, insertFromComposition/deleteFromComposition will fire, however, allowing us to cancel
            // the final composition result if it is invalid. As a fallback for Chrome and Firefox, which either
            // don't support Input Events Level 2, or beforeinput at all, we store the state of the input when
            // the compositionstart event fires, and undo the changes in compositionend (below) if it is invalid.
            // Unfortunately, this messes up the undo/redo stack, but until insertFromComposition/deleteByComposition
            // are implemented, there is no other way to prevent composed input.
            // See https://bugs.chromium.org/p/chromium/issues/detail?id=1022204
            const { value, selectionStart, selectionEnd } = requireValue(
              inputRef(),
              "Expected inputRef.current"
            );

            compositionStartState = {
              selectionEnd,
              selectionStart,
              value,
            };
          },
        });
      },
      get labelProps() {
        return _result0.labelProps;
      },
    },
    omit(
      _result0,
      "labelProps",
      "inputProps",
      "descriptionProps",
      "errorMessageProps"
    )
  );
}
