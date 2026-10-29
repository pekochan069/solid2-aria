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
 * Derived from Adobe React Spectrum: packages/react-aria/src/listbox/useListBox.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { ListState } from "@solid2-aria/stately/list/create-list-state";
import type {
  AriaLabelingProps,
  CollectionBase,
  DOMProps,
  FocusEvents,
  FocusStrategy,
  Key,
  KeyboardDelegate,
  LayoutDelegate,
  MultipleSelection,
  Orientation,
  SelectionBehavior,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { merge, createMemo } from "solid-js";
import type { Accessor, Element as SolidElement } from "solid-js";

import { createFocusWithin } from "../interactions/create-focus-within";
import { createLabel } from "../label/create-label";
import { createSelectableList } from "../selection/create-selectable-list";
import { ariaValue } from "../utils/aria-value";
import { createId } from "../utils/create-id";
import { filterDOMProps } from "../utils/filter-dom-props";
import { mergeProps } from "../utils/merge-props";
import { getTruthyValue } from "../utils/truthy";
import { listData } from "./utils";

export interface ListBoxProps<T>
  extends CollectionBase<T>, MultipleSelection, FocusEvents {
  /** Whether to auto focus the listbox or an option. */
  autoFocus?: boolean | FocusStrategy;
  /** Whether focus should wrap around when the end/start is reached. */
  shouldFocusWrap?: boolean;
}

export interface AriaListBoxPropsBase<T>
  extends ListBoxProps<T>, DOMProps, AriaLabelingProps {
  /**
   * Whether pressing the escape key should clear selection in the listbox or not.
   *
   * Most experiences should not modify this option as it eliminates a keyboard user's ability to
   * easily clear selection. Only use if the escape key is being handled externally or should not
   * trigger selection clearing contextually.
   *
   * @default 'clearSelection'
   */
  escapeKeyBehavior?: "clearSelection" | "none";
}

export interface AriaListBoxProps<T> extends AriaListBoxPropsBase<T> {
  /**
   * An optional visual label for the listbox.
   */
  label?: SolidElement;
  /** How multiple selection should behave in the collection. */
  selectionBehavior?: SelectionBehavior;
  /** Whether selection should occur on press up instead of press down. */
  shouldSelectOnPressUp?: boolean;
  /** Whether options should be focused when the user hovers over them. */
  shouldFocusOnHover?: boolean;
  /**
   * Handler that is called when a user performs an action on an item. The exact user event depends
   * on the collection's `selectionBehavior` prop and the interaction modality.
   */
  onAction?: (key: Key) => void;
}

export interface ListBoxAria {
  /** Props for the listbox element. */
  listBoxProps: DOMAttributes;
  /** Props for the listbox's visual label element (if any). */
  labelProps: DOMAttributes;
}

export interface AriaListBoxOptions<T> extends Omit<
  AriaListBoxProps<T>,
  "children"
> {
  UNSTABLE_itemBehavior?: "action";
  /** Whether the listbox uses virtual scrolling. */
  isVirtualized?: boolean;
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
   * Whether the listbox items should use virtual focus instead of being focused directly.
   */
  shouldUseVirtualFocus?: boolean;
  /**
   * The behavior of links in the collection.
   * - 'action': link behaves like onAction.
   * - 'selection': link follows selection interactions (e.g. if URL drives selection).
   * - 'override': links override all other interactions (link items are not selectable).
   *
   * @default 'override'
   */
  linkBehavior?: "action" | "selection" | "override";
  /**
   * The primary orientation of the items. Usually this is the direction that the collection
   * scrolls.
   *
   * @default 'vertical'
   */
  orientation?: Orientation;
}

/**
 * Provides the behavior and accessibility implementation for a listbox component.
 * A listbox displays a list of options and allows a user to select one or more of them.
 *
 * @param props - Props for the listbox.
 * @param state - State for the listbox, as returned by `useListState`.
 */
export function createListBox<T>(
  props: AriaListBoxOptions<T>,
  state: ListState<T>,
  ref: Accessor<HTMLElement | null>
): ListBoxAria {
  const domProps = createMemo(() => filterDOMProps(props, { labelable: true }));

  // Use props instead of state here. We don't want this to change due to long press.
  const selectionBehavior = createMemo(
    () => getTruthyValue(props.selectionBehavior) ?? "toggle"
  );

  const orientation = createMemo(
    () => getTruthyValue(props.orientation) ?? "vertical"
  );

  const linkBehavior = createMemo(() => {
    const behavior =
      props.linkBehavior ??
      (selectionBehavior() === "replace" ? "action" : "override");

    return selectionBehavior() === "toggle" && behavior === "action"
      ? "override"
      : behavior;
  });

  const _result0 = createSelectableList(
    merge(props, {
      get collection() {
        return state.collection;
      },
      get disabledKeys() {
        return state.disabledKeys;
      },
      get linkBehavior() {
        return linkBehavior();
      },
      get ref() {
        return ref;
      },
      get selectionManager() {
        return state.selectionManager;
      },
    })
  );

  const _result1 = createFocusWithin({
    get onBlurWithin() {
      return props.onBlur;
    },
    get onFocusWithin() {
      return props.onFocus;
    },
    get onFocusWithinChange() {
      return props.onFocusChange;
    },
  });

  // Share list id and some props with child options.
  const id = createId(() => props.id);
  listData.set(state, {
    get UNSTABLE_itemBehavior() {
      return props.UNSTABLE_itemBehavior;
    },
    get id() {
      return id();
    },
    get isVirtualized() {
      return props.isVirtualized;
    },
    get linkBehavior() {
      return linkBehavior();
    },
    get onAction() {
      return props.onAction;
    },
    get shouldFocusOnHover() {
      return props.shouldFocusOnHover;
    },
    get shouldSelectOnPressUp() {
      return props.shouldSelectOnPressUp;
    },
    get shouldUseVirtualFocus() {
      return props.shouldUseVirtualFocus;
    },
  });

  // shouldn't be labeled by a <label> element.
  const _result2 = createLabel(
    merge(props, {
      get id() {
        return id();
      },
      // listbox is not an HTML input element so it
      get labelElementType(): "span" {
        return "span";
      },
    })
  );

  return {
    get labelProps() {
      return _result2.labelProps;
    },
    get listBoxProps() {
      return mergeProps(
        domProps(),
        _result1.focusWithinProps,
        state.selectionManager.selectionMode === "multiple"
          ? {
              "aria-multiselectable": ariaValue("true"),
            }
          : {},
        {
          "aria-orientation": ariaValue(orientation()),
          role: "listbox",
          ...mergeProps(_result2.fieldProps, _result0.listProps),
        }
      );
    },
  };
}
