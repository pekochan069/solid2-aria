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
 * Derived from Adobe React Spectrum: packages/react-aria/src/spinbutton/useSpinButton.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  PressEvent,
  InputBase,
  RangeInputBase,
  Validation,
  ValueBase,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import {
  merge,
  createMemo,
  createEffect,
  createSignal,
  onSettled,
} from "solid-js";

import intlMessages from "../../intl/spinbutton/index";
import type { AriaButtonProps } from "../button/create-button";
import { createLocalizedStringFormatter } from "../i18n/create-localized-string-formatter";
import { createKeyboard } from "../interactions/create-keyboard";
import { announce, clearAnnouncer } from "../live-announcer/live-announcer";
import { ariaValue } from "../utils/aria-value";
import { createGlobalListeners } from "../utils/create-global-listeners";
import { getTruthyValue } from "../utils/truthy";

export interface SpinButtonProps
  extends
    InputBase,
    Validation<number>,
    ValueBase<number>,
    RangeInputBase<number> {
  textValue?: string;
  onIncrement?: () => void;
  onIncrementPage?: () => void;
  onDecrement?: () => void;
  onDecrementPage?: () => void;
  onDecrementToMin?: () => void;
  onIncrementToMax?: () => void;
}

export interface SpinbuttonAria {
  spinButtonProps: DOMAttributes;
  incrementButtonProps: AriaButtonProps;
  decrementButtonProps: AriaButtonProps;
}

const cancelContextMenu = (e: Event) => {
  e.preventDefault();
};

export function createSpinButton(props: SpinButtonProps): SpinbuttonAria {
  let _async: number | undefined = undefined;

  const stringFormatter = createLocalizedStringFormatter(
    intlMessages,
    "@react-aria/spinbutton"
  );

  let isSpinning = false;

  const clearAsync = () => {
    clearTimeout(_async);
    isSpinning = false;
  };

  const clearAsyncEvent = () => {
    clearAsync();
  };

  onSettled(() => () => {
    clearAsyncEvent();
  });

  const _result1 = createKeyboard({
    get allowRepeats(): true {
      return true;
    },
    get isDisabled() {
      return getTruthyValue(props.isDisabled) ?? props.isReadOnly;
    },
    get shortcuts() {
      return {
        ArrowDown: (): undefined | false => {
          if (props.onDecrement) {
            props.onDecrement();

            return undefined;
          }

          return false;
        },
        ArrowUp: (): undefined | false => {
          if (props.onIncrement) {
            props.onIncrement();

            return undefined;
          }

          return false;
        },
        End: (): undefined | false => {
          if (props.onIncrementToMax) {
            props.onIncrementToMax();

            return undefined;
          }

          return false;
        },
        Home: (): undefined | false => {
          if (props.onDecrementToMin) {
            props.onDecrementToMin();

            return undefined;
          }

          return false;
        },
        PageDown: (): undefined | false => {
          if (props.onDecrementPage) {
            props.onDecrementPage();

            return undefined;
          }

          if (props.onDecrement) {
            props.onDecrement();

            return undefined;
          }

          return false;
        },
        PageUp: (): undefined | false => {
          if (props.onIncrementPage) {
            props.onIncrementPage();

            return undefined;
          }

          if (props.onIncrement) {
            props.onIncrement();

            return undefined;
          }

          return false;
        },
      };
    },
  });

  let isFocused = false;

  const onFocus = () => {
    isFocused = true;
  };

  const onBlur = () => {
    isFocused = false;
  };

  // Replace Unicode hyphen-minus (U+002D) with minus sign (U+2212).
  // This ensures that macOS VoiceOver announces it as "minus" even with other characters between the minus sign
  // and the number (e.g. currency symbol). Otherwise it announces nothing because it assumes the character is a hyphen.
  // In addition, replace the empty string with the word "Empty" so that iOS VoiceOver does not read "50%" for an empty field.
  const ariaTextValue = createMemo(() =>
    props.textValue === ""
      ? stringFormatter.format("Empty")
      : (getTruthyValue(props.textValue) ?? `${props.value}`).replace(
          "-",
          "\u2212"
        )
  );

  createEffect(
    () => ({ ariaTextValue: ariaTextValue() }),
    ({ ariaTextValue: currentAriaTextValue }) => {
      if (isFocused) {
        clearAnnouncer("assertive");
        announce(currentAriaTextValue, "assertive");
      }
    },
    { ssrSource: "client" }
  );

  // For touch users, if they move their finger like they're scrolling, we don't want to trigger a spin.
  const onPointerCancel = () => {
    clearAsync();
  };

  const onIncrementEvent = () => props.onIncrement?.();
  const onDecrementEvent = () => props.onDecrement?.();

  const onIncrementPressStartEvent = (initialStepDelay: number) => {
    clearAsyncEvent();
    isSpinning = true;
    // Start spinning after initial delay
    _async = window.setTimeout(stepUpEvent, initialStepDelay);
  };

  function stepUpEvent(): void {
    if (
      props.maxValue === undefined ||
      Number.isNaN(props.maxValue) ||
      props.value === undefined ||
      Number.isNaN(props.value) ||
      props.value < props.maxValue
    ) {
      onIncrementEvent();

      onIncrementPressStartEvent(60);
    }
  }

  const onDecrementPressStartEvent = (initialStepDelay: number) => {
    clearAsyncEvent();
    isSpinning = true;
    // Start spinning after initial delay
    _async = window.setTimeout(stepDownEvent, initialStepDelay);
  };

  function stepDownEvent(): void {
    if (
      props.minValue === undefined ||
      Number.isNaN(props.minValue) ||
      props.value === undefined ||
      Number.isNaN(props.value) ||
      props.value > props.minValue
    ) {
      onDecrementEvent();

      onDecrementPressStartEvent(60);
    }
  }

  const _result2 = createGlobalListeners();
  // Tracks in touch if the press end event was preceded by a press up.
  // If it wasn't, then we know the finger left the button while still in contact with the screen.
  // This means that the user is trying to scroll or interact in some way that shouldn't trigger
  // an increment or decrement.
  let isUp = false;

  const [isIncrementPressed, setIsIncrementPressed] = createSignal<
    "touch" | "mouse" | null
  >(null, { ownedWrite: true });

  createEffect(
    () => ({ isIncrementPressed: isIncrementPressed() }),
    ({ isIncrementPressed: currentIsIncrementPressed }) => {
      if (currentIsIncrementPressed === "touch") {
        onIncrementPressStartEvent(600);
      } else if (currentIsIncrementPressed) {
        onIncrementPressStartEvent(400);
      } else {
        clearAsyncEvent();
      }
    },
    { ssrSource: "client" }
  );

  const [isDecrementPressed, setIsDecrementPressed] = createSignal<
    "touch" | "mouse" | null
  >(null, { ownedWrite: true });

  createEffect(
    () => ({ isDecrementPressed: isDecrementPressed() }),
    ({ isDecrementPressed: currentIsDecrementPressed }) => {
      if (currentIsDecrementPressed === "touch") {
        onDecrementPressStartEvent(600);
      } else if (currentIsDecrementPressed) {
        onDecrementPressStartEvent(400);
      } else {
        clearAsyncEvent();
      }
    },
    { ssrSource: "client" }
  );

  return {
    get decrementButtonProps() {
      return {
        get onBlur() {
          return onBlur;
        },
        get onFocus() {
          return onFocus;
        },
        onPressEnd: (e: PressEvent) => {
          clearAsync();

          if (e.pointerType === "touch" && !isSpinning && isUp) {
            props.onDecrement?.();
          }

          isUp = false;
          setIsDecrementPressed(null);
        },
        onPressStart: (e: PressEvent) => {
          clearAsync();

          if (e.pointerType === "touch") {
            _result2.addGlobalListener(
              window,
              "pointercancel",
              onPointerCancel,
              { capture: true }
            );
            isUp = false;
            // For touch users, don't trigger a decrement on press start, we'll wait for the press end to trigger it if
            // the control isn't spinning.
            setIsDecrementPressed("touch");
          } else {
            props.onDecrement?.();
            setIsDecrementPressed("mouse");
          }
        },
        onPressUp: (e: PressEvent) => {
          clearAsync();

          if (e.pointerType === "touch") {
            isUp = true;
          }

          _result2.removeAllGlobalListeners();
          setIsDecrementPressed(null);
        },
      };
    },
    get incrementButtonProps() {
      return {
        get onBlur() {
          return onBlur;
        },
        get onFocus() {
          return onFocus;
        },
        onPressEnd: (e: PressEvent) => {
          clearAsync();

          if (e.pointerType === "touch" && !isSpinning && isUp) {
            props.onIncrement?.();
          }

          isUp = false;
          setIsIncrementPressed(null);
        },
        onPressStart: (e: PressEvent) => {
          clearAsync();

          if (e.pointerType === "touch") {
            _result2.addGlobalListener(
              window,
              "pointercancel",
              onPointerCancel,
              { capture: true }
            );
            isUp = false;
            // For touch users, don't trigger a decrement on press start, we'll wait for the press end to trigger it if
            // the control isn't spinning.
            setIsIncrementPressed("touch");
          } else {
            props.onIncrement?.();
            setIsIncrementPressed("mouse");
          }

          _result2.addGlobalListener(window, "contextmenu", cancelContextMenu);
        },
        onPressUp: (e: PressEvent) => {
          clearAsync();

          if (e.pointerType === "touch") {
            isUp = true;
          }

          _result2.removeAllGlobalListeners();
          setIsIncrementPressed(null);
        },
      };
    },
    get spinButtonProps() {
      return merge(
        {
          get "aria-disabled"() {
            return ariaValue(
              ariaValue(getTruthyValue(props.isDisabled) ?? undefined)
            );
          },
          get "aria-readonly"() {
            return ariaValue(
              ariaValue(getTruthyValue(props.isReadOnly) ?? undefined)
            );
          },
          get "aria-required"() {
            return ariaValue(
              ariaValue(getTruthyValue(props.isRequired) ?? undefined)
            );
          },
          get "aria-valuemax"() {
            return ariaValue(ariaValue(props.maxValue));
          },
          get "aria-valuemin"() {
            return ariaValue(ariaValue(props.minValue));
          },
          get "aria-valuenow"() {
            return ariaValue(
              ariaValue(
                props.value !== undefined && !Number.isNaN(props.value)
                  ? props.value
                  : undefined
              )
            );
          },
          get "aria-valuetext"() {
            return ariaValue(ariaValue(ariaTextValue()));
          },
          get role(): "spinbutton" {
            return "spinbutton" as const;
          },
        },
        _result1.keyboardProps,
        {
          get onBlur() {
            return onBlur;
          },
          get onFocus() {
            return onFocus;
          },
        }
      );
    },
  };
}
