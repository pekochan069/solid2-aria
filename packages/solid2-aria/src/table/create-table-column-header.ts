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
 * Derived from Adobe React Spectrum: packages/react-aria/src/table/useTableColumnHeader.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { GridNode } from "@solid2-aria/stately/grid/grid-collection";
import type { TableState } from "@solid2-aria/stately/table/create-table-state";
import type { FocusableElement } from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { merge, createMemo, createEffect } from "solid-js";
import type { Accessor } from "solid-js";

import intlMessages from "../../intl/table/index";
import { createGridCell } from "../grid/create-grid-cell";
import { createLocalizedStringFormatter } from "../i18n/create-localized-string-formatter";
import { createFocusable } from "../interactions/create-focusable";
import { createPress } from "../interactions/create-press";
import { ariaValue } from "../utils/aria-value";
import { createDescription } from "../utils/create-description";
import { getCollectionNodeProps } from "../utils/get-collection-node-props";
import { mergeProps } from "../utils/merge-props";
import { isAndroid } from "../utils/platform";
import { isTruthy, whenTruthy } from "../utils/truthy";
import { getColumnHeaderId } from "./utils";

export interface AriaTableColumnHeaderProps<T> {
  /**
   * An object representing the [column header](https://www.w3.org/TR/wai-aria-1.1/#columnheader).
   * Contains all the relevant information that makes up the column header.
   */
  node: GridNode<T>;
  /**
   * Whether the [column header](https://www.w3.org/TR/wai-aria-1.1/#columnheader) is contained in a
   * virtual scroller.
   */
  isVirtualized?: boolean;
  /**
   * Whether the column header or its first focusable child element should be focused when the
   * column header is focused. Defaults to 'child' in arrow keyboard navigation mode and 'cell' in
   * tab keyboard navigation mode.
   */
  focusMode?: "child" | "cell";
  /**
   * Whether the column header should support arrow key navigation even when the containing table
   * uses tab keyboard navigation. Allows users to navigate between columns with arrow keys while
   * focus is on an interactive child element within the cell.
   */
  allowsArrowNavigation?: boolean;
}

export interface TableColumnHeaderAria {
  /** Props for the [column header](https://www.w3.org/TR/wai-aria-1.1/#columnheader) element. */
  columnHeaderProps: DOMAttributes;
  /** Whether the column is currently in a pressed state. */
  isPressed: boolean;
}

/**
 * Provides the behavior and accessibility implementation for a column header in a table.
 *
 * @param props - Props for the column header.
 * @param state - State of the table, as returned by `useTableState`.
 * @param ref - The ref attached to the column header element.
 */
export function createTableColumnHeader<T>(
  props: AriaTableColumnHeaderProps<T>,
  state: TableState<T>,
  ref: Accessor<FocusableElement | null>
): TableColumnHeaderAria {
  const _result0 = props;

  const allowsSorting = createMemo(
    () => getCollectionNodeProps(_result0.node).allowsSorting
  );

  const _result1 = createGridCell(
    merge(
      {
        get focusMode() {
          return "child" as const;
        },
      },
      props
    ),
    state,
    ref
  );

  const isSelectionCellDisabled = createMemo(() =>
    whenTruthy(
      getCollectionNodeProps(_result0.node).isSelectionCell,
      () => state.selectionManager.selectionMode === "single"
    )
  );

  const _result2 = createPress({
    get isDisabled() {
      return !isTruthy(allowsSorting()) || isSelectionCellDisabled();
    },
    onPress() {
      state.sort(_result0.node.key);
    },
    get ref() {
      return ref;
    },
  });

  // Needed to pick up the focusable context, enabling things like Tooltips for example
  const _result3 = createFocusable({}, ref);

  const isSortedColumn = createMemo(
    () => state.sortDescriptor?.column === _result0.node.key
  );

  const sortDirection = createMemo(() => state.sortDescriptor?.direction);

  const ariaSort = createMemo<DOMAttributes["aria-sort"]>(
    (): undefined | "none" | "ascending" | "descending" => {
      if (
        !isTruthy(getCollectionNodeProps(_result0.node).allowsSorting) ||
        isAndroid()
      ) {
        return undefined;
      }

      return isSortedColumn() ? sortDirection() : "none";
    }
  );

  const stringFormatter = createLocalizedStringFormatter(
    intlMessages,
    "@react-aria/table"
  );

  const sortDescription = createMemo((): undefined | string => {
    if (!isTruthy(allowsSorting())) {
      return undefined;
    }

    const sortable = stringFormatter.format("sortable");
    const direction = sortDirection();

    return isSortedColumn() && direction && isAndroid()
      ? `${sortable}, ${stringFormatter.format(direction)}`
      : sortable;
  });

  const descriptionProps = createDescription(sortDescription);
  const shouldDisableFocus = createMemo(() => state.collection.size === 0);
  createEffect(
    () => ({
      key: _result0.node.key,
      selectionManager: state.selectionManager,
      shouldDisableFocus: shouldDisableFocus(),
    }),
    ({
      selectionManager,
      key,
      shouldDisableFocus: currentShouldDisableFocus,
    }) => {
      if (currentShouldDisableFocus && selectionManager.focusedKey === key) {
        selectionManager.setFocusedKey(null);
      }
    },
    { ssrSource: "client" }
  );

  return {
    get columnHeaderProps() {
      return merge(
        mergeProps(
          _result3.focusableProps,
          _result1.gridCellProps,
          _result2.pressProps,
          descriptionProps,
          // If the table is empty, make all column headers untabbable
          shouldDisableFocus() ? { tabindex: -1 } : null
        ),
        {
          get "aria-colspan"() {
            return ariaValue(
              ariaValue(
                isTruthy(_result0.node.colSpan) && _result0.node.colSpan > 1
                  ? _result0.node.colSpan
                  : undefined
              )
            );
          },
          get "aria-sort"() {
            return ariaSort();
          },
          get id() {
            return getColumnHeaderId(state, _result0.node.key);
          },
          get role() {
            return "columnheader" as const;
          },
        }
      );
    },
    get isPressed() {
      return _result2.isPressed;
    },
  };
}
