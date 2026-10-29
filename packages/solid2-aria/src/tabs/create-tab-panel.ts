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
 * Derived from Adobe React Spectrum: packages/react-aria/src/tabs/useTabPanel.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { TabListState } from "@solid2-aria/stately/tabs/create-tab-list-state";
import type {
  AriaLabelingProps,
  DOMProps,
  Key,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { merge, createMemo } from "solid-js";
import type { Accessor } from "solid-js";

import { createHasTabbableChild } from "../focus/create-has-tabbable-child";
import { ariaValue } from "../utils/aria-value";
import { createLabels } from "../utils/create-labels";
import { mergeProps } from "../utils/merge-props";
import { generateId } from "./utils";

export interface AriaTabPanelProps
  extends Omit<DOMProps, "id">, AriaLabelingProps {
  /** The unique id of the tab. */
  id?: Key;
}

export interface TabPanelAria {
  /** Props for the tab panel element. */
  tabPanelProps: DOMAttributes;
}

/**
 * Provides the behavior and accessibility implementation for a tab panel. A tab panel is a
 * container for the contents of a tab, and is shown when the tab is selected.
 */
export function createTabPanel<T>(
  props: AriaTabPanelProps,
  state: TabListState<T> | null,
  ref: Accessor<Element | null>
): TabPanelAria {
  // The tabpanel should have tabIndex=0 when there are no tabbable elements within it.
  // Otherwise, tabbing from the focused tab should go directly to the first tabbable element
  // within the tabpanel.
  const hasTabbableChild = createHasTabbableChild(ref);
  const tabIndex = createMemo(() => (hasTabbableChild() ? undefined : 0));

  const id = createMemo(() =>
    generateId(state, props.id ?? state?.selectedKey, "tabpanel")
  );

  const tabPanelProps = createLabels(
    merge(props, {
      get "aria-labelledby"() {
        return ariaValue(
          ariaValue(generateId(state, state?.selectedKey, "tab"))
        );
      },
      get id() {
        return id();
      },
    })
  );

  return {
    get tabPanelProps() {
      return mergeProps(tabPanelProps, {
        "aria-describedby": ariaValue(props["aria-describedby"]),
        "aria-details": ariaValue(props["aria-details"]),
        role: "tabpanel" as const,
        tabindex: tabIndex(),
      });
    },
  };
}
