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
 * Derived from Adobe React Spectrum: packages/react-aria/src/tabs/useTab.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { TabListState } from "@solid2-aria/stately/tabs/create-tab-list-state";
import type {
  AriaLabelingProps,
  FocusableElement,
  Key,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { untrack, merge, createMemo } from "solid-js";
import type { Accessor } from "solid-js";

import { createFocusable } from "../interactions/create-focusable";
import { createSelectableItem } from "../selection/create-selectable-item";
import { ariaValue } from "../utils/aria-value";
import { filterDOMProps } from "../utils/filter-dom-props";
import { getCollectionNodeProps } from "../utils/get-collection-node-props";
import { isPresent } from "../utils/is-present";
import { mergeProps } from "../utils/merge-props";
import { createLinkProps } from "../utils/open-link";
import { getTruthyValue } from "../utils/truthy";
import { generateId } from "./utils";

export interface AriaTabProps extends AriaLabelingProps {
  /** The key of the tab. */
  key: Key;
  /** Whether the tab should be disabled. */
  isDisabled?: boolean;
  /** Whether the tab selection should occur on press up instead of press down. */
  shouldSelectOnPressUp?: boolean;
}

export interface TabAria {
  /** Props for the tab element. */
  tabProps: DOMAttributes;
  /** Whether the tab is currently selected. */
  isSelected: boolean;
  /** Whether the tab is disabled. */
  isDisabled: boolean;
  /** Whether the tab is currently in a pressed state. */
  isPressed: boolean;
}

/**
 * Provides the behavior and accessibility implementation for a tab.
 * When selected, the associated tab panel is shown.
 */
export function createTab<T>(
  props: AriaTabProps,
  state: TabListState<T>,
  ref: Accessor<FocusableElement | null>
): TabAria {
  const _result0 = props;
  const _result1 = state;

  const isSelected = createMemo(() => _result0.key === _result1.selectedKey);

  const isDisabled = createMemo(
    () =>
      getTruthyValue(getTruthyValue(_result0.isDisabled) ?? state.isDisabled) ??
      state.selectionManager.isDisabled(_result0.key)
  );

  const item = createMemo(() => state.collection.getItem(_result0.key));

  // This avoids reopening beforeunload dialogs when browsers replay
  // queued pointer enter/leave events after cancellation.
  const _result2 = createSelectableItem({
    get isDisabled() {
      return isDisabled();
    },
    get key() {
      return _result0.key;
    },
    get linkBehavior(): "selection" {
      return "selection";
    },
    get ref() {
      return ref;
    },
    get selectionManager() {
      return _result1.selectionManager;
    },
    // Link tabs should behave like native anchors (navigate on press up)
    get shouldSelectOnPressUp() {
      return (
        _result0.shouldSelectOnPressUp ??
        isPresent(getCollectionNodeProps(item()).href)
      );
    },
  });

  const tabId = createMemo(() => generateId(state, _result0.key, "tab"));

  const tabPanelId = createMemo(() =>
    generateId(state, _result0.key, "tabpanel")
  );

  const _result3 = _result2.itemProps;

  const domProps = createMemo(() =>
    filterDOMProps(getCollectionNodeProps(item()), { labelable: true })
  );

  delete untrack(domProps).id;
  const linkProps = createLinkProps(getCollectionNodeProps(item()));

  const _result4 = createFocusable(
    merge(item()?.props, {
      get isDisabled() {
        return isDisabled();
      },
    }),
    ref
  );

  return {
    get isDisabled() {
      return isDisabled();
    },
    get isPressed() {
      return _result2.isPressed;
    },
    get isSelected() {
      return isSelected();
    },
    get tabProps() {
      return mergeProps(
        domProps(),
        _result4.focusableProps,
        linkProps,
        _result2.itemProps,
        {
          "aria-controls": ariaValue(isSelected() ? tabPanelId() : undefined),
          "aria-disabled": ariaValue(isDisabled() || undefined),
          "aria-selected": ariaValue(isSelected()),
          id: tabId(),
          role: "tab",
          tabindex: isDisabled() ? undefined : _result3.tabindex,
        }
      );
    },
  };
}
