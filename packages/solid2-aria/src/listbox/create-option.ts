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
 * Derived from Adobe React Spectrum: packages/react-aria/src/listbox/useOption.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { getItemCount } from "@solid2-aria/stately/collections/get-item-count";
import type { ListState } from "@solid2-aria/stately/list/create-list-state";
import type { FocusableElement, Key } from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { untrack, merge, createMemo } from "solid-js";
import type { Accessor } from "solid-js";

import { isFocusVisible } from "../interactions/create-focus-visible";
import { createHover } from "../interactions/create-hover";
import { createSelectableItem } from "../selection/create-selectable-item";
import type { SelectableItemStates } from "../selection/create-selectable-item";
import { ariaValue } from "../utils/aria-value";
import { chain } from "../utils/chain";
import { createSlotId } from "../utils/create-id";
import { filterDOMProps } from "../utils/filter-dom-props";
import { getCollectionNodeProps } from "../utils/get-collection-node-props";
import { getLegacyOption } from "../utils/legacy-option";
import { mergeProps } from "../utils/merge-props";
import { createLinkProps } from "../utils/open-link";
import { isTruthy, whenTruthy } from "../utils/truthy";
import { getItemId, listData } from "./utils";

export interface OptionAria extends SelectableItemStates {
  /** Props for the option element. */
  optionProps: DOMAttributes;
  /** Props for the main text element inside the option. */
  labelProps: DOMAttributes;
  /** Props for the description text element inside the option, if any. */
  descriptionProps: DOMAttributes;
  /** Whether the option is currently focused. */
  isFocused: boolean;
  /** Whether the option is keyboard focused. */
  isFocusVisible: boolean;
}

export interface AriaOptionProps {
  /**
   * Whether the option is disabled.
   *
   * @deprecated
   */
  isDisabled?: boolean;
  /**
   * Whether the option is selected.
   *
   * @deprecated
   */
  isSelected?: boolean;
  /** A screen reader only label for the option. */
  "aria-label"?: string;
  /** The unique key for the option. */
  key: Key;
  /**
   * Whether selection should occur on press up instead of press down.
   *
   * @deprecated
   */
  shouldSelectOnPressUp?: boolean;
  /**
   * Whether the option should be focused when the user hovers over it.
   *
   * @deprecated
   */
  shouldFocusOnHover?: boolean;
  /**
   * Whether the option is contained in a virtual scrolling listbox.
   *
   * @deprecated
   */
  isVirtualized?: boolean;
  /**
   * Whether the option should use virtual focus instead of being focused directly.
   *
   * @deprecated
   */
  shouldUseVirtualFocus?: boolean;
}

/**
 * Provides the behavior and accessibility implementation for an option in a listbox.
 * See `useListBox` for more details about listboxes.
 *
 * @param props - Props for the option.
 * @param state - State for the listbox, as returned by `useListState`.
 */
export function createOption<T>(
  props: AriaOptionProps,
  state: ListState<T>,
  ref: Accessor<FocusableElement | null>
): OptionAria {
  const _result0 = props;
  const data = createMemo(() => listData.get(state));

  const isDisabled = createMemo(
    () =>
      getLegacyOption(props, "isDisabled") ??
      state.selectionManager.isDisabled(_result0.key)
  );

  const isSelected = createMemo(
    () =>
      getLegacyOption(props, "isSelected") ??
      state.selectionManager.isSelected(_result0.key)
  );

  const shouldSelectOnPressUp = createMemo(
    () =>
      getLegacyOption(props, "shouldSelectOnPressUp") ??
      data()?.shouldSelectOnPressUp
  );

  const shouldFocusOnHover = createMemo(
    () =>
      getLegacyOption(props, "shouldFocusOnHover") ?? data()?.shouldFocusOnHover
  );

  const shouldUseVirtualFocus = createMemo(
    () =>
      getLegacyOption(props, "shouldUseVirtualFocus") ??
      data()?.shouldUseVirtualFocus
  );

  const isVirtualized = createMemo(
    () => getLegacyOption(props, "isVirtualized") ?? data()?.isVirtualized
  );

  const labelId = createSlotId();
  const descriptionId = createSlotId();

  const item = createMemo(() => state.collection.getItem(_result0.key));

  const optionProps = createMemo<DOMAttributes>(() => {
    const result: DOMAttributes = {
      "aria-describedby": ariaValue(descriptionId()),
      "aria-disabled": ariaValue(isDisabled() || undefined),
      "aria-label": ariaValue(props["aria-label"]),
      "aria-labelledby": ariaValue(labelId()),
      "aria-selected": ariaValue(
        state.selectionManager.selectionMode === "none"
          ? undefined
          : isSelected()
      ),
      role: "option",
    };

    if (isTruthy(isVirtualized())) {
      const index = Number(item()?.index);
      result["aria-posinset"] = Number.isNaN(index) ? undefined : index + 1;
      result["aria-setsize"] = getItemCount(state.collection);
    }

    return result;
  });

  const onAction = createMemo(() =>
    // oxlint-disable-next-line solid/reactivity -- The returned callback runs in its consumer's scope.
    data()?.onAction ? () => data()?.onAction?.(_result0.key) : undefined
  );

  const id = createMemo(() => getItemId(state, _result0.key));

  const _result1 = createSelectableItem({
    get UNSTABLE_itemBehavior() {
      return data()?.UNSTABLE_itemBehavior;
    },
    get allowsDifferentPressOrigin() {
      return whenTruthy(shouldSelectOnPressUp(), () => shouldFocusOnHover());
    },
    get id() {
      return id();
    },
    get isDisabled() {
      return isDisabled();
    },
    get isVirtualized() {
      return isVirtualized();
    },
    get key() {
      return _result0.key;
    },
    get linkBehavior() {
      return data()?.linkBehavior;
    },
    get onAction() {
      return onAction() || isTruthy(getCollectionNodeProps(item())?.onAction)
        ? chain(getCollectionNodeProps(item())?.onAction, onAction())
        : undefined;
    },
    get ref() {
      return ref;
    },
    get selectionManager() {
      return state.selectionManager;
    },
    get shouldSelectOnPressUp() {
      return shouldSelectOnPressUp();
    },
    get shouldUseVirtualFocus() {
      return shouldUseVirtualFocus();
    },
  });

  const _result2 = createHover({
    get isDisabled() {
      return isDisabled() || !isTruthy(shouldFocusOnHover());
    },
    onHoverStart() {
      if (!isFocusVisible()) {
        state.selectionManager.setFocused(true);
        state.selectionManager.setFocusedKey(_result0.key);
      }
    },
  });

  const domProps = createMemo(() =>
    filterDOMProps(getCollectionNodeProps(item()))
  );

  delete untrack(domProps).id;
  const linkProps = createLinkProps(getCollectionNodeProps(item()));

  return {
    get allowsSelection() {
      return _result1.allowsSelection;
    },
    get descriptionProps() {
      return {
        get id() {
          return descriptionId();
        },
      };
    },
    get hasAction() {
      return _result1.hasAction;
    },
    get isDisabled() {
      return isDisabled();
    },
    get isFocusVisible() {
      return (
        _result1.isFocused &&
        state.selectionManager.isFocused &&
        isFocusVisible()
      );
    },
    get isFocused() {
      return _result1.isFocused;
    },
    get isPressed() {
      return _result1.isPressed;
    },
    get isSelected() {
      return isSelected();
    },
    get labelProps() {
      return {
        get id() {
          return labelId();
        },
      };
    },
    get optionProps() {
      return merge(
        optionProps(),
        mergeProps(
          domProps(),
          _result1.itemProps,
          _result2.hoverProps,
          linkProps
        ),
        {
          get id() {
            return id();
          },
        }
      );
    },
  };
}
