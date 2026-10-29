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
 * Derived from Adobe React Spectrum: packages/react-aria/src/tabs/useTabList.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  TabListProps,
  TabListState,
} from "@solid2-aria/stately/tabs/create-tab-list-state";
import type {
  AriaLabelingProps,
  DOMProps,
  Orientation,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { merge, createMemo, untrack } from "solid-js";
import type { Accessor } from "solid-js";

import { createLocale } from "../i18n/i18n-provider";
import { createSelectableCollection } from "../selection/create-selectable-collection";
import { ariaValue } from "../utils/aria-value";
import { createId } from "../utils/create-id";
import { createLabels } from "../utils/create-labels";
import { mergeProps } from "../utils/merge-props";
import { TabsKeyboardDelegate } from "./tabs-keyboard-delegate";
import { tabsIds } from "./utils";

export interface AriaTabListProps<T>
  extends TabListProps<T>, DOMProps, AriaLabelingProps {
  /**
   * Whether tabs are activated automatically on focus or manually.
   *
   * @default 'automatic'
   */
  keyboardActivation?: "automatic" | "manual";
  /**
   * The orientation of the tabs.
   *
   * @default 'horizontal'
   */
  orientation?: Orientation;
}

export type AriaTabListOptions<T> = Omit<AriaTabListProps<T>, "children">;

export interface TabListAria {
  /** Props for the tablist container. */
  tabListProps: DOMAttributes;
}

/**
 * Provides the behavior and accessibility implementation for a tab list.
 * Tabs organize content into multiple sections and allow users to navigate between them.
 */
export function createTabList<T>(
  props: AriaTabListOptions<T>,
  state: TabListState<T>,
  ref: Accessor<HTMLElement | null>
): TabListAria {
  const _result0 = props;
  const _result1 = state;
  const _result2 = createLocale();

  const delegate = createMemo(
    () =>
      new TabsKeyboardDelegate(
        _result1.collection,
        _result2.direction,
        _result0.orientation ?? "horizontal",
        _result1.disabledKeys
      )
  );

  const _result3 = createSelectableCollection({
    get disallowEmptySelection(): true {
      return true;
    },
    get keyboardDelegate() {
      return delegate();
    },
    get linkBehavior(): "selection" {
      return "selection";
    },
    get ref() {
      return ref;
    },
    get scrollRef() {
      return ref;
    },
    get selectOnFocus() {
      return (_result0.keyboardActivation ?? "automatic") === "automatic";
    },
    get selectionManager() {
      return _result1.selectionManager;
    },
  });

  // Compute base id for all tabs
  const tabsId = createId();
  tabsIds.set(state, untrack(tabsId));

  const tabListLabelProps = createLabels(
    merge(props, {
      get id() {
        return tabsId();
      },
    })
  );

  return {
    get tabListProps() {
      return merge(mergeProps(_result3.collectionProps, tabListLabelProps), {
        get "aria-orientation"() {
          return ariaValue(ariaValue(_result0.orientation ?? "horizontal"));
        },
        get role(): "tablist" {
          return "tablist";
        },
        tabindex: undefined,
      });
    },
  };
}
