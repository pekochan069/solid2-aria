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
 * Derived from Adobe React Spectrum: packages/react-aria/src/selection/useTypeSelect.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { MultipleSelectionManager } from "@solid2-aria/stately/selection/types";
import type { Key, KeyboardDelegate } from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { createEffect, onSettled } from "solid-js";
import type { Accessor } from "solid-js";

import type { KeyboardEvent } from "../types";
import { createEvent } from "../utils/create-event";
import { isPresent } from "../utils/is-present";
import { isPropagationStopped } from "../utils/is-propagation-stopped";
import { getEventTarget, nodeContains } from "../utils/shadowdom/dom-functions";

/**
 * Controls how long to wait before clearing the typeahead buffer.
 */
// 1 second
const TYPEAHEAD_DEBOUNCE_WAIT_MS = 1000;

export interface AriaTypeSelectOptions {
  /** Whether typeahead is disabled. */
  isDisabled?: boolean;
  /**
   * A delegate that returns collection item keys with respect to visual layout.
   */
  keyboardDelegate: KeyboardDelegate;
  /**
   * An interface for reading and updating multiple selection state.
   */
  selectionManager: MultipleSelectionManager;
  /**
   * Called when an item is focused by typing.
   */
  onTypeSelect?: (key: Key) => void;
}

export interface TypeSelectAria {
  /**
   * Props to be spread on the owner of the options.
   */
  typeSelectProps: DOMAttributes;
}

/**
 * Handles typeahead interactions with collections.
 */
export function createTypeSelect(
  options: AriaTypeSelectOptions,
  ref: Accessor<HTMLElement | null>
): TypeSelectAria {
  const _result0 = options;

  let search = "";
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const handleCaptureKeyDown = (e: KeyboardEvent) => {
    // if we're in the middle of a search, then a spacebar should be treated as a search and we should not propagate the event
    // since we handle this one in a capture phase, we should ignore it in the bubble phase
    if (search.length > 0 && e.key === " ") {
      e.preventDefault();

      if (
        !("continuePropagation" in e) ||
        ("continuePropagation" in e && !isPropagationStopped(e))
      ) {
        e.stopPropagation();
      }

      search += " ";

      if (typeof _result0.keyboardDelegate.getKeyForSearch === "function") {
        // Use the delegate to find a key to focus.
        // Prioritize items after the currently focused item, falling back to searching the whole list.
        let key = _result0.keyboardDelegate.getKeyForSearch(
          search,
          _result0.selectionManager.focusedKey
        );

        // If no key found, search from the top.
        key ??= _result0.keyboardDelegate.getKeyForSearch(search);

        if (isPresent(key)) {
          _result0.selectionManager.setFocusedKey(key);

          if (_result0.onTypeSelect) {
            _result0.onTypeSelect(key);
          }
        }
      }

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        search = "";
      }, TYPEAHEAD_DEBOUNCE_WAIT_MS);
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const character = getStringForKey(e.key);

    if (
      !character ||
      e.ctrlKey ||
      e.metaKey ||
      e.altKey ||
      !nodeContains(e.currentTarget, getEventTarget(e)) ||
      (search.length === 0 && character === " ")
    ) {
      return;
    }

    search += character;

    if (typeof _result0.keyboardDelegate.getKeyForSearch === "function") {
      // Use the delegate to find a key to focus.
      // Prioritize items after the currently focused item, falling back to searching the whole list.
      let key = _result0.keyboardDelegate.getKeyForSearch(
        search,
        _result0.selectionManager.focusedKey
      );

      key ??= _result0.keyboardDelegate.getKeyForSearch(search);

      if (!isPresent(key)) {
        // if still nothing then the type to select is done and everything is reset
        search = "";
        clearTimeout(timeout);
        timeout = undefined;

        return;
      }

      _result0.selectionManager.setFocusedKey(key);

      if (_result0.onTypeSelect) {
        _result0.onTypeSelect(key);
      }

      e.preventDefault();

      if (!("continuePropagation" in e)) {
        e.stopPropagation();
      }
    }

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      search = "";
    }, TYPEAHEAD_DEBOUNCE_WAIT_MS);
  };

  createEffect(
    () => options.isDisabled === true,
    (disabled) => {
      if (disabled) {
        search = "";
        clearTimeout(timeout);
        timeout = undefined;
      }
    }
  );

  onSettled(() => () => {
    clearTimeout(timeout);
  });

  createEvent(
    ref,
    "keydown",
    (event) => {
      if (
        _result0.isDisabled !== true &&
        _result0.keyboardDelegate.getKeyForSearch
      ) {
        handleCaptureKeyDown(event);
      }
    },
    { capture: true }
  );

  return {
    get typeSelectProps() {
      // other hooks in order to handle the Spacebar event.
      return {
        get onKeyDown() {
          return _result0.isDisabled !== true &&
            _result0.keyboardDelegate.getKeyForSearch
            ? onKeyDown
            : undefined;
        },
      };
    },
  };
}

function getStringForKey(key: string) {
  // If the key is of length 1, it is an ASCII value.
  // Otherwise, if there are no ASCII characters in the key name,
  // it is a Unicode character.
  // See https://www.w3.org/TR/uievents-key/
  if (key.length === 1 || !/^[A-Z]/iu.test(key)) {
    return key;
  }

  return "";
}
