/*
 * Copyright 2022 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria/src/gridlist/useGridList.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { ListState } from "@solid2-aria/stately/list/create-list-state";
import type {
  AriaLabelingProps,
  CollectionBase,
  DisabledBehavior,
  DOMProps,
  FocusStrategy,
  Key,
  KeyboardDelegate,
  LayoutDelegate,
  MultipleSelection,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { createMemo, createEffect } from "solid-js";
import type { Accessor } from "solid-js";

import { createHasTabbableChild } from "../focus/create-has-tabbable-child";
import { createGridSelectionAnnouncement } from "../grid/create-grid-selection-announcement";
import { createHighlightSelectionDescription } from "../grid/create-highlight-selection-description";
import { createSelectableList } from "../selection/create-selectable-list";
import { ariaValue } from "../utils/aria-value";
import { createId } from "../utils/create-id";
import { filterDOMProps } from "../utils/filter-dom-props";
import { mergeProps } from "../utils/merge-props";
import { isTruthy } from "../utils/truthy";
import { listMap } from "./utils";

export interface GridListProps<T> extends CollectionBase<T>, MultipleSelection {
  /** Whether to auto focus the gridlist or an option. */
  autoFocus?: boolean | FocusStrategy;
  /**
   * Handler that is called when a user performs an action on an item. The exact user event depends
   * on the collection's `selectionBehavior` prop and the interaction modality.
   */
  onAction?: (key: Key) => void;
  /**
   * Whether `disabledKeys` applies to all interactions, or only selection.
   *
   * @default 'all'
   */
  disabledBehavior?: DisabledBehavior;
  /** Whether selection should occur on press up instead of press down. */
  shouldSelectOnPressUp?: boolean;
}

export interface AriaGridListProps<T>
  extends GridListProps<T>, DOMProps, AriaLabelingProps {
  /**
   * Whether keyboard navigation to focusable elements within grid list items is
   * via the left/right arrow keys or the tab key.
   *
   * @default 'arrow'
   */
  keyboardNavigationBehavior?: "arrow" | "tab";
  /**
   * Whether pressing the escape key should clear selection in the grid list or not.
   *
   * Most experiences should not modify this option as it eliminates a keyboard user's ability to
   * easily clear selection. Only use if the escape key is being handled externally or should not
   * trigger selection clearing contextually.
   *
   * @default 'clearSelection'
   */
  escapeKeyBehavior?: "clearSelection" | "none";
}

export interface AriaGridListOptions<T> extends Omit<
  AriaGridListProps<T>,
  "children"
> {
  /** Whether the list uses virtual scrolling. */
  isVirtualized?: boolean;
  /**
   * Whether typeahead navigation is disabled.
   *
   * @default false
   */
  disallowTypeAhead?: boolean;
  /**
   * An optional keyboard delegate implementation for type to select,
   * to override the default.
   */
  keyboardDelegate?: KeyboardDelegate;
  /**
   * A delegate object that provides layout information for items in the collection.
   * By default this uses the DOM, but this can be overridden to implement things like
   * virtualized scrolling.
   */
  layoutDelegate?: LayoutDelegate;
  /**
   * Whether focus should wrap around when the end/start is reached.
   *
   * @default false
   */
  shouldFocusWrap?: boolean;
  /**
   * The behavior of links in the collection.
   * - 'action': link behaves like onAction.
   * - 'selection': link follows selection interactions (e.g. if URL drives selection).
   * - 'override': links override all other interactions (link items are not selectable).
   *
   * @default 'action'
   */
  linkBehavior?: "action" | "selection" | "override";
  /**
   * Which item in the collection to focus when tabbing into the collection. Overrides default
   * roving tab index like behavior.
   *
   * @private
   */
  UNSTABLE_focusOnEntry?: "first" | "last";
}

export interface GridListAria {
  /** Props for the grid element. */
  gridProps: DOMAttributes;
}

/**
 * Provides the behavior and accessibility implementation for a list component with interactive
 * children. A grid list displays data in a single column and enables a user to navigate its
 * contents via directional navigation keys.
 *
 * @param props - Props for the list.
 * @param state - State for the list, as returned by `useListState`.
 * @param ref - The ref attached to the list element.
 */
export function createGridList<T>(
  props: AriaGridListOptions<T>,
  state: ListState<T>,
  ref: Accessor<HTMLElement | null>
): GridListAria {
  const _result0 = props;

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

  const _result1 = createSelectableList({
    get UNSTABLE_focusOnEntry() {
      return props.UNSTABLE_focusOnEntry;
    },
    get allowsTabNavigation() {
      return state.collection.size === 0;
    },
    get autoFocus() {
      return props.autoFocus;
    },
    get collection() {
      return state.collection;
    },
    get disabledKeys() {
      return state.disabledKeys;
    },
    get disallowSelectAll() {
      return state.collection.size === 0;
    },
    get disallowTypeAhead() {
      return _result0.disallowTypeAhead;
    },
    get escapeKeyBehavior() {
      return _result0.escapeKeyBehavior ?? "clearSelection";
    },
    get isVirtualized() {
      return _result0.isVirtualized;
    },
    get keyboardDelegate() {
      return _result0.keyboardDelegate;
    },
    get layoutDelegate() {
      return _result0.layoutDelegate;
    },
    get linkBehavior() {
      return _result0.linkBehavior ?? "action";
    },
    get ref() {
      return ref;
    },
    get selectOnFocus() {
      return state.selectionManager.selectionBehavior === "replace";
    },
    get selectionManager() {
      return state.selectionManager;
    },
    get shouldFocusWrap() {
      return props.shouldFocusWrap;
    },
  });

  const id = createId(() => props.id);
  listMap.set(state, {
    get id() {
      return id();
    },
    get keyboardNavigationBehavior() {
      return _result0.keyboardNavigationBehavior ?? "arrow";
    },
    get linkBehavior() {
      return _result0.linkBehavior ?? "action";
    },
    get onAction() {
      return _result0.onAction;
    },
    get shouldSelectOnPressUp() {
      return _result0.shouldSelectOnPressUp;
    },
  });

  const descriptionProps = createHighlightSelectionDescription({
    get hasItemActions() {
      return !!_result0.onAction;
    },
    get selectionManager() {
      return state.selectionManager;
    },
  });

  const hasTabbableChild = createHasTabbableChild(ref, {
    get isDisabled() {
      return state.collection.size !== 0;
    },
  });

  const domProps = createMemo(() => filterDOMProps(props, { labelable: true }));

  const gridProps = createMemo(() => {
    const result = mergeProps(
      domProps(),
      {
        "aria-multiselectable": ariaValue(
          state.selectionManager.selectionMode === "multiple"
            ? "true"
            : undefined
        ),
        id: id(),
        role: "grid",
      },
      _result1.listProps,
      // Keep the collection's focus handlers when empty so arriving items can receive keyboard focus.
      // Make the grid tabbable unless the empty state contains a tabbable element.
      state.collection.size === 0
        ? { tabindex: hasTabbableChild() ? -1 : 0 }
        : undefined,
      descriptionProps
    );

    if (isTruthy(_result0.isVirtualized)) {
      result["aria-rowcount"] = state.collection.size;
      result["aria-colcount"] = 1;
    }

    return result;
  });

  createGridSelectionAnnouncement({}, state);

  return {
    get gridProps() {
      return gridProps();
    },
  };
}
