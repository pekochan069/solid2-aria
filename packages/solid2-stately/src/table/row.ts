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
 * Derived from Adobe React Spectrum: packages/react-stately/src/table/Row.ts.
 * Modified for Solid Aria: adapted imports, collection descriptors, and reactive state APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { Key, LinkDOMProps } from "@solid2-aria/types-shared";
import type { Element as SolidElement } from "solid-js";

import type { PartialNode, CollectionContext } from "../collections/types";
import { collectionChildren, isCollectionElement } from "../collections/types";
import type { CellElement, CellRenderer } from "./cell";
import { isTableCollectionContext } from "./collection-context";

export type RowElement<_T> = SolidElement;

export interface RowProps<T> extends LinkDOMProps {
  key?: Key;
  "aria-label"?: string;
  /**
   * A list of child item objects used when dynamically rendering row children. Requires the feature
   * flag to be enabled along with UNSTABLE_allowsExpandableRows, see
   * https://react-spectrum.adobe.com/react-spectrum/TableView.html#expandable-rows.
   *
   * @private
   * @version alpha
   */
  UNSTABLE_childItems?: Iterable<T>;
  // update when async loading is supported for expandable rows
  // /** Whether this row has children, even if not loaded yet. */
  // hasChildItems?: boolean,
  /** Rendered contents of the row or row child items. */
  children: CellElement | CellElement[] | CellRenderer;
  /** A string representation of the row's contents, used for features like typeahead. */
  // ???
  textValue?: string;
}

function Row<T>(props: RowProps<T>): SolidElement {
  return Object.assign([], {
    getCollectionNode: (context: CollectionContext) =>
      Row.getCollectionNode(props, context),
    get key() {
      return props.key;
    },
    props,
    type: Row,
  });
}

Row.getCollectionNode = function* getCollectionNode<T>(
  props: RowProps<T>,
  context: CollectionContext
): Generator<PartialNode<T>> {
  if (!isTableCollectionContext<T>(context)) {
    throw new Error("Table collection context is required.");
  }

  const { children, textValue, UNSTABLE_childItems } = props;
  yield {
    "aria-label": props["aria-label"],
    *childNodes() {
      // Process cells first
      if (context.showDragButtons) {
        yield {
          // this is combined with the row key by CollectionBuilder
          key: "header-drag",
          props: {
            isDragButtonCell: true,
          },
          type: "cell",
        };
      }

      if (context.showSelectionCheckboxes && context.selectionMode !== "none") {
        yield {
          // this is combined with the row key by CollectionBuilder
          key: "header",
          props: {
            isSelectionCell: true,
          },
          type: "cell",
        };
      }

      if (typeof children === "function") {
        for (const column of context.columns) {
          yield {
            element: children(column.key),
            // this is combined with the row key by CollectionBuilder
            key: column.key,
            type: "cell",
          };
        }

        if (UNSTABLE_childItems) {
          for (const child of UNSTABLE_childItems) {
            // Note: in order to reuse the render function of TableBody for our child rows, we just need to yield a type and a value here. CollectionBuilder will then look up
            // the parent renderer and use that to build the full node of this child row, using the value provided here to generate the cells
            yield {
              type: "item",
              value: child,
            };
          }
        }
      } else {
        const cells: PartialNode<T>[] = [];
        const childRows: PartialNode<T>[] = [];
        let columnCount = 0;

        for (const node of collectionChildren(children)) {
          if (
            isCollectionElement(node) &&
            "type" in node &&
            node.type === Row
          ) {
            if (cells.length < context.columns.length) {
              throw new Error(
                "All of a Row's child Cells must be positioned before any child Rows."
              );
            }

            childRows.push({
              element: node,
              type: "item",
            });
          } else {
            cells.push({
              element: node,
              type: "cell",
            });
            const cellProps = isCollectionElement(node) ? node.props : null;
            columnCount +=
              typeof cellProps === "object" &&
              cellProps !== null &&
              "colSpan" in cellProps &&
              typeof cellProps.colSpan === "number"
                ? cellProps.colSpan
                : 1;
          }
        }

        if (columnCount !== context.columns.length) {
          throw new Error(
            `Cell count must match column count. Found ${columnCount} cells and ${context.columns.length} columns.`
          );
        }

        yield* cells;
        yield* childRows;
      }
    },
    hasChildNodes: true,
    props,
    shouldInvalidate(newContext: CollectionContext) {
      if (!isTableCollectionContext<T>(newContext)) {
        return true;
      }

      // Invalidate all rows if the columns changed.
      return (
        newContext.columns.length !== context.columns.length ||
        newContext.columns.some((c, i) => c.key !== context.columns[i]?.key) ||
        newContext.showSelectionCheckboxes !==
          context.showSelectionCheckboxes ||
        newContext.showDragButtons !== context.showDragButtons ||
        newContext.selectionMode !== context.selectionMode
      );
    },
    textValue,
    type: "item",
  };
};

/**
 * A Row represents a single item in a Table and contains Cell elements for each column.
 * Cells can be statically defined as children, or generated dynamically using a function
 * based on the columns defined in the TableHeader.
 */
// We don't want getCollectionNode to show up in the type definition
export { Row };
