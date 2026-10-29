/*
 * Derived from Adobe React Spectrum: packages/react-aria/src/focus/useFocusRing.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { createSignal, untrack } from "solid-js";

import { createFocus } from "../interactions/create-focus";
import {
  isFocusVisible,
  createFocusVisibleListener,
} from "../interactions/create-focus-visible";
import { createFocusWithin } from "../interactions/create-focus-within";
import { isTruthy } from "../utils/truthy";

export interface AriaFocusRingProps {
  /**
   * Whether to show the focus ring when something
   * inside the container element has focus (true), or
   * only if the container itself has focus (false).
   *
   * @default 'false'
   */
  within?: boolean;
  /** Whether the element is a text input. */
  isTextInput?: boolean;
  /** Whether the element will be auto focused. */
  autoFocus?: boolean;
}

export interface FocusRingAria {
  /** Whether the element is currently focused. */
  isFocused: boolean;
  /** Whether keyboard focus should be visible. */
  isFocusVisible: boolean;
  /** Props to apply to the container element with the focus ring. */
  focusProps: DOMAttributes;
}

/**
 * Determines whether a focus ring should be shown to indicate keyboard focus.
 * Focus rings are visible only when the user is interacting with a keyboard,
 * not with a mouse, touch, or other input methods.
 */
export function createFocusRing(props: AriaFocusRingProps = {}): FocusRingAria {
  const _result0 = props;

  const state = {
    isFocusVisible: untrack(
      () => (_result0.autoFocus ?? false) || isFocusVisible()
    ),
    isFocused: false,
  };

  const [isFocused, setFocused] = createSignal(false, { ownedWrite: true });

  const [isFocusVisibleState, setFocusVisible] = createSignal(
    untrack(() => state.isFocused && state.isFocusVisible),
    { ownedWrite: true }
  );

  const updateState = () => {
    setFocusVisible(state.isFocused && state.isFocusVisible);
  };

  const onFocusChange = (isFocusedValue: boolean) => {
    state.isFocused = isFocusedValue;
    state.isFocusVisible = isFocusVisible();
    setFocused(isFocusedValue);
    updateState();
  };

  createFocusVisibleListener(
    (isFocusVisibleValue) => {
      state.isFocusVisible = isFocusVisibleValue;
      updateState();
    },
    {
      get enabled() {
        return isFocused();
      },
      get isTextInput() {
        return _result0.isTextInput;
      },
    }
  );

  const _result1 = createFocus({
    get isDisabled() {
      return _result0.within;
    },
    get onFocusChange() {
      return onFocusChange;
    },
  });

  const _result2 = createFocusWithin({
    get isDisabled() {
      return !isTruthy(_result0.within);
    },
    get onFocusWithinChange() {
      return onFocusChange;
    },
  });

  return {
    get focusProps() {
      return isTruthy(_result0.within)
        ? _result2.focusWithinProps
        : _result1.focusProps;
    },
    get isFocusVisible() {
      return isFocusVisibleState();
    },
    get isFocused() {
      return isFocused();
    },
  };
}
