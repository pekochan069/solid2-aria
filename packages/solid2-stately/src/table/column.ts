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
 * Derived from Adobe React Spectrum: packages/react-stately/src/table/Column.ts.
 * Modified for Solid Aria: adapted imports, collection descriptors, and reactive state APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { Key, Node } from "@solid2-aria/types-shared";
import type { Element as SolidElement } from "solid-js";

import type { PartialNode, CollectionContext } from "../collections/types";
import { collectionChildren } from "../collections/types";
import { hasContent } from "../utils/has-content";
import { isTableCollectionContext } from "./collection-context";
import type { CollectionBuilderContext } from "./create-table-state";

/** Widths that result in a constant pixel value for the same Table width. */
// match regex: /^(\d+)(?=%$)/
export type ColumnStaticSize = number | `${number}` | `${number}%`;

/**
 * Widths that change size in relation to the remaining space and in ratio to other dynamic columns.
 * All numbers must be integers and greater than 0.
 * FR units take up remaining, if any, space in the table.
 */
// match regex: /^(\d+)(?=fr$)/
export type ColumnDynamicSize = `${number}fr`;

/** All possible sizes a column can be assigned. */
export type ColumnSize = ColumnStaticSize | ColumnDynamicSize;

export type ColumnElement<_T> = SolidElement;

export type ColumnRenderer<T> = (item: T) => ColumnElement<T>;

export interface ColumnProps<T> {
  key?: Key;
  "aria-label"?: string;
  /** Rendered contents of the column if `children` contains child columns. */
  title?: SolidElement;
  /** Static child columns or content to render as the column header. */
  children: SolidElement | ColumnElement<T>[];
  /** A list of child columns used when dynamically rendering nested child columns. */
  childColumns?: T[];
  /** The width of the column. */
  width?: ColumnSize | null;
  /** The minimum width of the column. */
  minWidth?: ColumnStaticSize | null;
  /** The maximum width of the column. */
  maxWidth?: ColumnStaticSize | null;
  /** The default width of the column. */
  defaultWidth?: ColumnSize | null;
  /** Whether the column allows resizing. */
  allowsResizing?: boolean;
  /** Whether the column allows sorting. */
  allowsSorting?: boolean;
  /**
   * Whether a column is a [row header](https://www.w3.org/TR/wai-aria-1.1/#rowheader) and should be
   * announced by assistive technology during row navigation.
   */
  isRowHeader?: boolean;
  /** A string representation of the column's contents, used for accessibility announcements. */
  textValue?: string;
}

function Column<T>(props: ColumnProps<T>): SolidElement {
  return Object.assign([], {
    getCollectionNode: (context: CollectionContext) =>
      Column.getCollectionNode(props, context),
    get key() {
      return props.key;
    },
    props,
    type: Column,
  });
}

Column.getCollectionNode = function* getCollectionNode<T>(
  props: ColumnProps<T>,
  context: CollectionContext
): Generator<PartialNode<T>, void, Node<T>[]> {
  if (!isTableCollectionContext<T>(context)) {
    throw new Error("Table collection context is required.");
  }

  const { title, children, childColumns } = props;
  const rendered = title ?? children;

  let textValue = props["aria-label"] ?? "";

  if (typeof rendered === "string" && rendered !== "") {
    textValue = rendered;
  }

  if (props.textValue !== undefined && props.textValue !== "") {
    ({ textValue } = props);
  }

  const fullNodes = yield {
    *childNodes() {
      if (childColumns) {
        for (const child of childColumns) {
          yield {
            type: "column",
            value: child,
          };
        }
      } else if (hasContent(title)) {
        const localChildColumns: PartialNode<T>[] = [];

        for (const child of collectionChildren(children)) {
          localChildColumns.push({
            element: child,
            type: "column",
          });
        }

        yield* localChildColumns;
      }
    },
    hasChildNodes:
      !!childColumns ||
      (Boolean(title) && collectionChildren(children).length > 0),
    props,
    rendered,
    shouldInvalidate(newContext: CollectionContext) {
      if (!isTableCollectionContext<T>(newContext)) {
        return true;
      }

      // This is a bit of a hack, but it works.
      // If this method is called, then there's a cached version of this node available.
      // But, we need to keep the list of columns in the new context up to date.
      updateContext(newContext);

      return false;
    },
    textValue,
    type: "column",
  };

  function updateContext(localContext: CollectionBuilderContext<T>) {
    // register leaf columns on the context so that <Row> can access them
    for (const node of fullNodes) {
      if (!node.hasChildNodes) {
        localContext.columns.push(node);
      }
    }
  }

  updateContext(context);
};

/**
 * A Column represents a field of each item within a Table. Columns may also contain nested
 * Column elements to represent column groups. Nested columns can be statically defined as
 * children, or dynamically generated using a function based on the `childColumns` prop.
 */
// We don't want getCollectionNode to show up in the type definition
export { Column };
