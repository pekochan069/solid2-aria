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
 * Derived from Adobe React Spectrum: packages/react-stately/src/table/TableBody.ts.
 * Modified for Solid Aria: adapted imports, collection descriptors, and reactive state APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  AsyncLoadable,
  Key,
  LoadingState,
} from "@solid2-aria/types-shared";
import { untrack } from "solid-js";
import type { Element as SolidElement } from "solid-js";

import type { PartialNode, CollectionContext } from "../collections/types";
import { collectionChildren } from "../collections/types";
import type { RowElement } from "./row";

export interface TableBodyProps<T> extends Omit<AsyncLoadable, "isLoading"> {
  key?: Key;
  "aria-label"?: string;
  /** The contents of the table body. Supports static items or a function for dynamic rendering. */
  children: RowElement<T> | RowElement<T>[] | ((item: T) => RowElement<T>);
  /** A list of row objects in the table body used when dynamically rendering rows. */
  items?: Iterable<T>;
  /** The current loading state of the table. */
  loadingState?: LoadingState;
}

function TableBody<T>(props: TableBodyProps<T>): SolidElement {
  return Object.assign([], {
    getCollectionNode: (_context: CollectionContext) =>
      TableBody.getCollectionNode(props),
    get key() {
      return props.key;
    },
    props,
    type: TableBody,
  });
}

TableBody.getCollectionNode = function* getCollectionNode<T>(
  props: TableBodyProps<T>
): Generator<PartialNode<T>> {
  const { children, items } = untrack(() => props);
  yield {
    *childNodes() {
      if (typeof children === "function") {
        if (!items) {
          throw new Error(
            "props.children was a function but props.items is missing"
          );
        }

        for (const item of items) {
          yield {
            renderer: children,
            type: "item",
            value: item,
          };
        }
      } else {
        const localItems: PartialNode<T>[] = [];

        for (const item of collectionChildren(children)) {
          localItems.push({
            element: item,
            type: "item",
          });
        }

        yield* localItems;
      }
    },
    hasChildNodes: true,
    props,
    type: "body",
  };
};

/**
 * A TableBody is a container for the Row elements of a Table. Rows can be statically defined as
 * children, or generated dynamically using a function based on the data passed to the `items`
 * prop.
 */
// We don't want getCollectionNode to show up in the type definition
export { TableBody };
