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
 * Derived from Adobe React Spectrum: packages/react-stately/src/table/TableHeader.ts.
 * Modified for Solid Aria: adapted imports, collection descriptors, and reactive state APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { Key } from "@solid2-aria/types-shared";
import type { Element as SolidElement } from "solid-js";

import type { PartialNode, CollectionContext } from "../collections/types";
import { collectionChildren } from "../collections/types";
import { isTableCollectionContext } from "./collection-context";
import type { ColumnElement, ColumnRenderer } from "./column";

export interface TableHeaderProps<T> {
  key?: Key;
  "aria-label"?: string;
  /** A list of table columns. */
  columns?: readonly T[];
  /**
   * A list of `Column(s)` or a function. If the latter, a list of columns must be provided using
   * the `columns` prop.
   */
  children: ColumnElement<T> | ColumnElement<T>[] | ColumnRenderer<T>;
}

function TableHeader<T>(props: TableHeaderProps<T>): SolidElement {
  return Object.assign([], {
    getCollectionNode: (context: CollectionContext) =>
      TableHeader.getCollectionNode(props, context),
    get key() {
      return props.key;
    },
    props,
    type: TableHeader,
  });
}

TableHeader.getCollectionNode = function* getCollectionNode<T>(
  props: TableHeaderProps<T>,
  context: CollectionContext
): Generator<PartialNode<T>, void> {
  if (!isTableCollectionContext<T>(context)) {
    throw new Error("Table collection context is required.");
  }

  const { children, columns } = props;
  // Clear columns so they aren't double added in strict mode.
  context.columns = [];

  if (typeof children === "function") {
    if (!columns) {
      throw new Error(
        "props.children was a function but props.columns is missing"
      );
    }

    for (const column of columns) {
      yield {
        renderer: children,
        type: "column",
        value: column,
      };
    }
  } else {
    const localColumns: PartialNode<T>[] = [];

    for (const column of collectionChildren(children)) {
      localColumns.push({
        element: column,
        type: "column",
      });
    }

    yield* localColumns;
  }
};

/**
 * A TableHeader is a container for the Column elements in a Table. Columns can be statically
 * defined as children, or generated dynamically using a function based on the data passed to the
 * `columns` prop.
 */
// We don't want getCollectionNode to show up in the type definition
export { TableHeader };
