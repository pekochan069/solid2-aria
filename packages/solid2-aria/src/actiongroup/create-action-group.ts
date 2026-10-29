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
 * Derived from Adobe React Spectrum: packages/react-aria/src/actiongroup/useActionGroup.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { ListState } from "@solid2-aria/stately/list/create-list-state";
import type {
  AriaLabelingProps,
  DOMProps,
  FocusableElement,
  ItemElement,
  ItemRenderer,
  Key,
  MultipleSelection,
  Orientation,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { merge, omit, createMemo, createSignal, createEffect } from "solid-js";
import type { Accessor } from "solid-js";

import { createFocusManager } from "../focus/focus-scope";
import { createLocale } from "../i18n/i18n-provider";
import { createKeyboard } from "../interactions/create-keyboard";
import { ariaValue } from "../utils/aria-value";
import { filterDOMProps } from "../utils/filter-dom-props";
import { getTruthyValue } from "../utils/truthy";

const BUTTON_GROUP_ROLES = {
  multiple: "toolbar",
  none: "toolbar",
  single: "radiogroup",
} as const;

// Not extending CollectionBase to avoid async loading props
export interface ActionGroupProps<T> extends MultipleSelection {
  /**
   * The axis the ActionGroup should align with.
   *
   * @default 'horizontal'
   */
  orientation?: Orientation;
  /**
   * An list of `Item` elements or a function. If the latter, a list of items must be provided using
   * the `items` prop.
   */
  children: ItemElement<T> | ItemElement<T>[] | ItemRenderer<T>;
  /** A list of items to display as children. Must be used with a function as the sole child. */
  items?: Iterable<T>;
  /** A list of keys to disable. */
  disabledKeys?: Iterable<Key>;
  /**
   * Whether the ActionGroup is disabled.
   * Shows that a selection exists, but is not available in that circumstance.
   */
  isDisabled?: boolean;
  /**
   * Invoked when an action is taken on a child. Especially useful when `selectionMode` is none.
   * The sole argument `key` is the key for the item.
   */
  onAction?: (key: Key) => void;
}

export interface AriaActionGroupProps<T>
  extends ActionGroupProps<T>, DOMProps, AriaLabelingProps {}

export interface ActionGroupAria {
  actionGroupProps: DOMAttributes;
}

export function createActionGroup<T>(
  props: AriaActionGroupProps<T>,
  state: ListState<T>,
  ref: Accessor<FocusableElement | null>
): ActionGroupAria {
  const [isInToolbar, setInToolbar] = createSignal(false, { ownedWrite: true });
  createEffect(
    () => ({ element: ref() }),
    ({ element }) => {
      const refElement = element;
      setInToolbar(
        !!(refElement && refElement.parentElement?.closest('[role="toolbar"]'))
      );
    },
    { ssrSource: "client" }
  );

  const isDisabled = createMemo(
    () =>
      getTruthyValue(props.isDisabled) ??
      ![...state.collection.getKeys()].some(
        (key) => !state.disabledKeys.has(key)
      )
  );

  const _result0 = createLocale();

  const focusManager = createFocusManager(ref);
  // ArrowLeft/ArrowRight follow the locale's text direction regardless of orientation, so
  // ArrowLeft always moves to the next item in RTL. ArrowUp/ArrowDown are never flipped.
  const flipDirection = createMemo(() => _result0.direction === "rtl");

  const _result1 = createKeyboard({
    get allowRepeats(): true {
      return true;
    },
    get shortcuts() {
      return {
        ArrowDown: () => {
          focusManager.focusNext({ wrap: true });
        },
        ArrowLeft: () => {
          if (flipDirection()) {
            focusManager.focusNext({ wrap: true });
          } else {
            focusManager.focusPrevious({ wrap: true });
          }
        },
        ArrowRight: () => {
          if (flipDirection()) {
            focusManager.focusPrevious({ wrap: true });
          } else {
            focusManager.focusNext({ wrap: true });
          }
        },
        ArrowUp: () => {
          focusManager.focusPrevious({ wrap: true });
        },
      };
    },
  });

  const role = createMemo(() => {
    const value = BUTTON_GROUP_ROLES[state.selectionManager.selectionMode];

    return isInToolbar() && value === "toolbar" ? ("group" as const) : value;
  });

  return {
    get actionGroupProps() {
      return merge(
        filterDOMProps(props, { labelable: true }),
        omit(_result1.keyboardProps, "role"),
        {
          get "aria-disabled"() {
            return ariaValue(isDisabled());
          },
          get "aria-orientation"() {
            return role() === "toolbar"
              ? (props.orientation ?? "horizontal")
              : undefined;
          },
          get role() {
            return role();
          },
        }
      );
    },
  };
}
