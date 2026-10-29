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
 * Derived from Adobe React Spectrum: packages/react-aria/src/actiongroup/useActionGroupItem.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { ListState } from "@solid2-aria/stately/list/create-list-state";
import type { FocusableElement, Key } from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { createMemo, onSettled } from "solid-js";
import type { Accessor } from "solid-js";

import type { PressProps } from "../interactions/create-press";
import { ariaValue } from "../utils/aria-value";
import { mergeProps } from "../utils/merge-props";

export interface AriaActionGroupItemProps {
  key: Key;
}

export interface ActionGroupItemAria {
  buttonProps: DOMAttributes & PressProps;
}

const BUTTON_ROLES = {
  multiple: "checkbox",
  none: undefined,
  single: "radio",
} as const;

export function createActionGroupItem<T>(
  props: AriaActionGroupItemProps,
  state: ListState<T>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ref?: Accessor<FocusableElement | null>
): ActionGroupItemAria {
  const selectionMode = createMemo(() => state.selectionManager.selectionMode);

  const buttonProps = createMemo<DOMAttributes>(() => ({
    "aria-checked":
      selectionMode() === "none"
        ? undefined
        : ariaValue(state.selectionManager.isSelected(props.key)),
    role: BUTTON_ROLES[selectionMode()],
  }));

  const isFocused = createMemo(
    () => props.key === state.selectionManager.focusedKey
  );

  const onRemovedWithFocus = () => {
    if (isFocused()) {
      state.selectionManager.setFocusedKey(null);
    }
  };

  // If the focused item is removed from the DOM, reset the focused key to null.
  onSettled(() => () => {
    onRemovedWithFocus();
  });

  return {
    get buttonProps() {
      return mergeProps(buttonProps(), {
        onFocus() {
          state.selectionManager.setFocusedKey(props.key);
        },
        onPress() {
          state.selectionManager.select(props.key);
        },
        tabindex:
          isFocused() ||
          state.selectionManager.focusedKey === null ||
          state.selectionManager.focusedKey === undefined
            ? 0
            : -1,
      });
    },
  };
}
