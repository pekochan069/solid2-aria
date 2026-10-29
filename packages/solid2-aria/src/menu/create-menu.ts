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
 * Derived from Adobe React Spectrum: packages/react-aria/src/menu/useMenu.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { TreeState } from "@solid2-aria/stately/tree/create-tree-state";
import type {
  Node,
  KeyboardEvent,
  AriaLabelingProps,
  CollectionBase,
  DOMProps,
  FocusStrategy,
  Key,
  KeyboardDelegate,
  KeyboardEvents,
  MultipleSelection,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { omit, merge, createMemo, createEffect } from "solid-js";
import type { Accessor } from "solid-js";

import { createKeyboard } from "../interactions/create-keyboard";
import { createSelectableList } from "../selection/create-selectable-list";
import { filterDOMProps } from "../utils/filter-dom-props";
import { mergeProps } from "../utils/merge-props";
import { isTruthy } from "../utils/truthy";
import { menuData } from "./utils";

export interface MenuProps<T> extends CollectionBase<T>, MultipleSelection {
  /** Where the focus should be set. */
  autoFocus?: boolean | FocusStrategy;
  /** Whether keyboard navigation is circular. */
  shouldFocusWrap?: boolean;
  /** Handler that is called when an item is selected. */
  onAction?: (key: Key, value: T) => void;
  /** Handler that is called when the menu should close after selecting an item. */
  onClose?: () => void;
}

export interface AriaMenuProps<T>
  extends MenuProps<T>, DOMProps, AriaLabelingProps {
  /**
   * Whether pressing the escape key should clear selection in the menu or not.
   *
   * Most experiences should not modify this option as it eliminates a keyboard user's ability to
   * easily clear selection. Only use if the escape key is being handled externally or should not
   * trigger selection clearing contextually.
   *
   * @default 'clearSelection'
   */
  escapeKeyBehavior?: "clearSelection" | "none";
}

export interface MenuAria {
  /** Props for the menu element. */
  menuProps: DOMAttributes;
}

export interface AriaMenuOptions<T>
  extends Omit<AriaMenuProps<T>, "children">, KeyboardEvents {
  /** Whether the menu uses virtual scrolling. */
  isVirtualized?: boolean;
  /**
   * An optional keyboard delegate implementation for type to select,
   * to override the default.
   */
  keyboardDelegate?: KeyboardDelegate;
  /**
   * Whether the menu items should use virtual focus instead of being focused directly.
   */
  shouldUseVirtualFocus?: boolean;
}

/**
 * Provides the behavior and accessibility implementation for a menu component.
 * A menu displays a list of actions or options that a user can choose.
 *
 * @param props - Props for the menu.
 * @param state - State for the menu, as returned by `useListState`.
 */
export function createMenu<T>(
  props: AriaMenuOptions<T>,
  state: TreeState<T>,
  ref: Accessor<HTMLElement | null>
): MenuAria {
  const _result0 = props;

  const _result1 = createKeyboard({
    get onKeyDown() {
      return _result0.onKeyDown;
    },
    get onKeyUp() {
      return _result0.onKeyUp;
    },
  });

  createEffect(
    () => ({
      label: props["aria-label"],
      labelledBy: props["aria-labelledby"],
    }),
    ({ label, labelledBy }) => {
      if (
        !isTruthy(label) &&
        !isTruthy(labelledBy) &&
        process.env.NODE_ENV !== "production"
      ) {
        console.warn(
          "An aria-label or aria-labelledby prop is required for accessibility."
        );
      }
    }
  );

  const domProps = createMemo(() => filterDOMProps(props, { labelable: true }));

  const _result2 = createSelectableList(
    merge(omit(_result0, "shouldFocusWrap", "onKeyDown", "onKeyUp"), {
      get collection() {
        return state.collection;
      },
      get disabledKeys() {
        return state.disabledKeys;
      },
      get linkBehavior(): "override" {
        return "override" as const;
      },
      get ref() {
        return ref;
      },
      get selectionManager() {
        return state.selectionManager;
      },
      get shouldFocusWrap() {
        return _result0.shouldFocusWrap ?? true;
      },
    })
  );

  menuData.set(state, {
    get onAction() {
      const action = props.onAction;

      return action
        ? (key: Key, value: Node<unknown>["value"]) => {
            // oxlint-disable-next-line anti-slop/no-reflect-apply -- The callback and value share the menu collection type erased by the heterogeneous menu registry.
            Reflect.apply(action, undefined, [key, value]);
          }
        : undefined;
    },
    get onClose() {
      return props.onClose;
    },
    get shouldUseVirtualFocus() {
      return props.shouldUseVirtualFocus;
    },
  });

  return {
    get menuProps() {
      return mergeProps(domProps(), _result1.keyboardProps, {
        role: "menu",
        ..._result2.listProps,
        onKeyDown: (e: KeyboardEvent) => {
          // don't clear the menu selected keys if the user is presses escape since escape closes the menu
          if (e.key !== "Escape" || isTruthy(props.shouldUseVirtualFocus)) {
            _result2.listProps.onKeyDown?.(e);
          }
        },
      });
    },
  };
}
