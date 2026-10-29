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
 * Derived from Adobe React Spectrum: packages/react-aria/src/table/useTableCell.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { GridNode } from "@solid2-aria/stately/grid/grid-collection";
import type { TableState } from "@solid2-aria/stately/table/create-table-state";
import type { FocusableElement } from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { merge } from "solid-js";
import type { Accessor } from "solid-js";

import { createGridCell } from "../grid/create-grid-cell";
import { isPresent } from "../utils/is-present";
import { getCellId } from "./utils";

export interface AriaTableCellProps {
  /**
   * An object representing the table cell. Contains all the relevant information that makes up the
   * row header.
   */
  node: GridNode<unknown>;
  /** Whether the cell is contained in a virtual scroller. */
  isVirtualized?: boolean;
  /** Whether selection should occur on press up instead of press down. */
  shouldSelectOnPressUp?: boolean;
  /**
   * Handler that is called when a user performs an action on the cell.
   * Please use onCellAction at the collection level instead.
   *
   * @deprecated
   */
  onAction?: () => void;
  /**
   * Whether the cell or its first focusable child element should be focused when the cell is
   * focused. Defaults to 'child' in arrow keyboard navigation mode and 'cell' in
   * tab keyboard navigation mode.
   */
  focusMode?: "child" | "cell";
  /**
   * Whether the cell should support arrow key navigation even when the containing table uses
   * tab keyboard navigation.Allows users to navigate between rows and cells with arrow keys while
   * focus is on an interactive child element within the cell.
   */
  allowsArrowNavigation?: boolean;
}

export interface TableCellAria {
  /** Props for the table cell element. */
  gridCellProps: DOMAttributes;
  /** Whether the cell is currently in a pressed state. */
  isPressed: boolean;
}

/**
 * Provides the behavior and accessibility implementation for a cell in a table.
 *
 * @param props - Props for the cell.
 * @param state - State of the table, as returned by `useTableState`.
 * @param ref - The ref attached to the cell element.
 */
export function createTableCell<T>(
  props: AriaTableCellProps,
  state: TableState<T>,
  ref: Accessor<FocusableElement | null>
): TableCellAria {
  const _result0 = createGridCell(props, state, ref);

  return {
    get gridCellProps() {
      return merge(_result0.gridCellProps, {
        get id() {
          const key = props.node.column?.key;
          const row = props.node.parentKey;

          return isPresent(key) &&
            row !== null &&
            row !== undefined &&
            state.collection.rowHeaderColumnKeys.has(key)
            ? getCellId(state, row, key)
            : _result0.gridCellProps.id;
        },
        get role() {
          const key = props.node.column?.key;

          return isPresent(key) && state.collection.rowHeaderColumnKeys.has(key)
            ? ("rowheader" as const)
            : _result0.gridCellProps.role;
        },
      });
    },
    get isPressed() {
      return _result0.isPressed;
    },
  };
}
