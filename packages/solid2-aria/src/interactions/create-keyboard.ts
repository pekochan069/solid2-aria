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
 * Derived from Adobe React Spectrum: packages/react-aria/src/interactions/useKeyboard.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  FocusableElement,
  KeyboardEvents,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";

import type { KeyboardEvent as TargetedKeyboardEvent } from "../types";
import { requireValue } from "../utils/require-value";
import { getEventTarget, nodeContains } from "../utils/shadowdom/dom-functions";
import { isTruthy } from "../utils/truthy";
import { createEventHandler } from "./create-event-handler";
import { createKeyboardShortcutHandler } from "./create-keyboard-shortcut-handler";
import type { KeyboardShortcutBindings } from "./create-keyboard-shortcut-handler";

export interface KeyboardProps extends KeyboardEvents {
  /** Whether the keyboard events should be disabled. */
  isDisabled?: boolean;
  /** Keyboard shortcuts to handle. */
  shortcuts?: KeyboardShortcutBindings;
  /** Whether to allow repeating keys. Only affects shortcuts. */
  allowRepeats?: boolean;
  /** Whether to allow composing keys. Only affects shortcuts. */
  allowComposing?: boolean;
}

export interface KeyboardResult {
  /** Props to spread onto the target element. */
  keyboardProps: DOMAttributes;
}

/**
 * Handles keyboard interactions for a focusable element.
 */
export function createKeyboard(props: KeyboardProps): KeyboardResult {
  const ownDown = requireValue(
    createEventHandler<TargetedKeyboardEvent<FocusableElement>>((e) =>
      props.onKeyDown?.(e)
    ),
    "Expected createEventHandler<TargetedKeyboardEvent<FocusableElement>>((e) => props.onKeyDown?.(e"
  );

  const ownUp = requireValue(
    createEventHandler<TargetedKeyboardEvent<FocusableElement>>((e) =>
      props.onKeyUp?.(e)
    ),
    "Expected createEventHandler<TargetedKeyboardEvent<FocusableElement>>((e) => props.onKeyUp?.(e) "
  );

  const shortcutDown = requireValue(
    createEventHandler<TargetedKeyboardEvent<FocusableElement>>((e) => {
      if (
        !nodeContains(e.currentTarget, getEventTarget(e)) ||
        (e.repeat && !isTruthy(props.allowRepeats)) ||
        (e.isComposing && !isTruthy(props.allowComposing))
      ) {
        e.continuePropagation();

        return;
      }

      if (props.shortcuts) {
        createKeyboardShortcutHandler(props.shortcuts)(e);
      }
    }),
    "Expected createEventHandler<TargetedKeyboardEvent<FocusableElement>>((e) => { if ( !nodeContain"
  );

  const shortcutUp = requireValue(
    createEventHandler<TargetedKeyboardEvent<FocusableElement>>((e) => {
      e.continuePropagation();
    }),
    "Expected createEventHandler<TargetedKeyboardEvent<FocusableElement>>((e) => { e.continuePropaga"
  );

  const onKeyDown = (e: TargetedKeyboardEvent<FocusableElement>) => {
    if (props.onKeyDown) {
      ownDown(e);
    }

    if (props.shortcuts) {
      shortcutDown(e);
    }
  };

  const onKeyUp = (e: TargetedKeyboardEvent<FocusableElement>) => {
    if (props.onKeyUp) {
      ownUp(e);
    }

    if (props.shortcuts) {
      shortcutUp(e);
    }
  };

  return {
    get keyboardProps() {
      return isTruthy(props.isDisabled)
        ? {}
        : {
            onKeyDown:
              props.onKeyDown || props.shortcuts ? onKeyDown : undefined,
            onKeyUp: props.onKeyUp || props.shortcuts ? onKeyUp : undefined,
          };
    },
  };
}
