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
 * Derived from Adobe React Spectrum: packages/react-aria/src/grid/useGridRow.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { GridState } from "@solid2-aria/stately/grid/create-grid-state";
import type {
  IGridCollection as GridCollection,
  GridNode,
} from "@solid2-aria/stately/grid/grid-collection";
import type { FocusableElement } from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { omit, merge, createMemo } from "solid-js";
import type { Accessor } from "solid-js";

import { createSelectableItem } from "../selection/create-selectable-item";
import type { SelectableItemStates } from "../selection/create-selectable-item";
import { ariaValue } from "../utils/aria-value";
import { chain } from "../utils/chain";
import { getCollectionNodeProps } from "../utils/get-collection-node-props";
import { getLegacyOption } from "../utils/legacy-option";
import { requireValue } from "../utils/require-value";
import { getTruthyValue, isTruthy } from "../utils/truthy";
import { gridMap } from "./utils";

export interface GridRowProps<T> {
  /**
   * An object representing the grid row. Contains all the relevant information that makes up the
   * grid row.
   */
  node: GridNode<T>;
  /** Whether the grid row is contained in a virtual scroller. */
  isVirtualized?: boolean;
  /** Whether selection should occur on press up instead of press down. */
  shouldSelectOnPressUp?: boolean;
  /**
   * Handler that is called when a user performs an action on the row.
   * Please use onCellAction at the collection level instead.
   *
   * @deprecated
   */
  onAction?: () => void;
}

export interface GridRowAria extends SelectableItemStates {
  /** Props for the grid row element. */
  rowProps: DOMAttributes;
  /** Whether the row is currently in a pressed state. */
  isPressed: boolean;
}

/**
 * Provides the behavior and accessibility implementation for a row in a grid.
 *
 * @param props - Props for the row.
 * @param state - State of the parent grid, as returned by `useGridState`.
 */
export function createGridRow<T, C extends GridCollection<T>>(
  props: GridRowProps<T>,
  state: GridState<T, C>,
  ref: Accessor<FocusableElement | null>
): GridRowAria {
  const _result0 = props;

  const _result1 = requireValue(
    gridMap.get(state),
    "Expected gridMap.get(state)"
  );

  const onRowAction = createMemo(() =>
    _result1.actions.onRowAction
      ? () => _result1.actions.onRowAction?.(_result0.node.key)
      : getLegacyOption(_result0, "onAction")
  );

  const _result2 = createSelectableItem({
    get isDisabled() {
      return state.collection.size === 0;
    },
    get isVirtualized() {
      return _result0.isVirtualized;
    },
    get key() {
      return _result0.node.key;
    },
    get onAction() {
      return onRowAction() ||
        isTruthy(getCollectionNodeProps(_result0.node)?.onAction)
        ? chain(getCollectionNodeProps(_result0.node)?.onAction, onRowAction())
        : undefined;
    },
    get ref() {
      return ref;
    },
    get selectionManager() {
      return state.selectionManager;
    },
    get shouldSelectOnPressUp() {
      return (
        getTruthyValue(_result1.shouldSelectOnPressUp) ??
        _result0.shouldSelectOnPressUp
      );
    },
  });

  const isSelected = createMemo(() =>
    state.selectionManager.isSelected(_result0.node.key)
  );

  const rowProps = createMemo(() => {
    const result = {
      get "aria-disabled"() {
        return ariaValue(
          // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
          omit(_result2, "itemProps")
            // oxlint-enable solid/reactivity
            .isDisabled || undefined
        );
      },
      "aria-selected": ariaValue(
        state.selectionManager.selectionMode === "none"
          ? undefined
          : isSelected()
      ),
      role: "row" as const,
      ..._result2.itemProps,
    };

    if (isTruthy(_result0.isVirtualized)) {
      // aria-rowindex is 1 based
      result["aria-rowindex"] = _result0.node.index + 1;
    }

    return result;
  });

  return merge(
    {
      get rowProps() {
        return rowProps();
      },
    },
    omit(_result2, "itemProps")
  );
}
