/*
 * Copyright 2024 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria/src/tree/useTreeItem.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { TreeState } from "@solid2-aria/stately/tree/create-tree-state";
import type { FocusableElement, Node } from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { merge, createMemo } from "solid-js";
import type { Accessor } from "solid-js";

import intlMessages from "../../intl/tree/index";
import type { AriaButtonProps } from "../button/create-button";
import { createGridListItem } from "../gridlist/create-grid-list-item";
import type {
  AriaGridListItemOptions,
  GridListItemAria,
} from "../gridlist/create-grid-list-item";
import { createLocalizedStringFormatter } from "../i18n/create-localized-string-formatter";
import { ariaValue } from "../utils/aria-value";
import { createLabels } from "../utils/create-labels";

export interface AriaTreeItemOptions extends Omit<
  AriaGridListItemOptions,
  "isVirtualized"
> {
  /**
   * An object representing the treegrid item. Contains all the relevant information that makes up
   * the treegrid row.
   */
  node: Node<unknown>;
}

export interface TreeItemAria extends GridListItemAria {
  /** Props for the tree grid row element. */
  rowProps: DOMAttributes;
  /** Props for the tree grid cell element within the tree grid list row. */
  gridCellProps: DOMAttributes;
  /** Props for the tree grid row description element, if any. */
  descriptionProps: DOMAttributes;
  /** Props for the tree grid row expand button. */
  expandButtonProps: AriaButtonProps;
}

/**
 * Provides the behavior and accessibility implementation for a row in a tree grid list.
 *
 * @param props - Props for the row.
 * @param state - State of the parent list, as returned by `useTreeState`.
 * @param ref - The ref attached to the row element.
 */
export function createTreeItem<T>(
  props: AriaTreeItemOptions,
  state: TreeState<T>,
  ref: Accessor<FocusableElement | null>
): TreeItemAria {
  const _result0 = props;
  const gridListAria = createGridListItem(props, state, ref);

  const isExpanded = createMemo(
    () => gridListAria.rowProps["aria-expanded"] === "true"
  );

  const stringFormatter = createLocalizedStringFormatter(
    intlMessages,
    "@react-aria/tree"
  );

  const labelProps = createLabels({
    get "aria-label"() {
      return ariaValue(
        ariaValue(
          isExpanded()
            ? stringFormatter.format("collapse")
            : stringFormatter.format("expand")
        )
      );
    },
    get "aria-labelledby"() {
      return ariaValue(ariaValue(gridListAria.rowProps.id));
    },
  });

  const expandButtonProps = createMemo(() => ({
    "data-react-aria-prevent-focus": true,
    excludeFromTabOrder: true,
    onPress: () => {
      if (!gridListAria.isDisabled) {
        state.toggleKey(_result0.node.key);
        state.selectionManager.setFocused(true);
        state.selectionManager.setFocusedKey(_result0.node.key);
      }
    },
    preventFocusOnPress: true,
    ...labelProps,
  }));

  // Follow-up: should it return a state specifically for isExpanded? Or is aria attribute sufficient?
  return merge(gridListAria, {
    get expandButtonProps() {
      return expandButtonProps();
    },
  });
}
