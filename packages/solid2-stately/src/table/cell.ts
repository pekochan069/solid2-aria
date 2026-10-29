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
 * Derived from Adobe React Spectrum: packages/react-stately/src/table/Cell.ts.
 * Modified for Solid Aria: adapted imports, collection descriptors, and reactive state APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { Key } from "@solid2-aria/types-shared";
import { untrack } from "solid-js";
import type { Element as SolidElement } from "solid-js";

import type { CollectionContext, PartialNode } from "../collections/types";

export interface CellProps {
  key?: Key;
  "aria-label"?: string;
  /** The contents of the cell. */
  children: SolidElement;
  /** A string representation of the cell's contents, used for features like typeahead. */
  textValue?: string;
  /** Indicates how many columns the data cell spans. */
  colSpan?: number;
}

export type CellElement = SolidElement;

export type CellRenderer = (columnKey: Key) => CellElement;

function Cell(props: CellProps): SolidElement {
  return Object.assign([], {
    getCollectionNode: (_context: CollectionContext) =>
      Cell.getCollectionNode(props),
    get key() {
      return props.key;
    },
    props,
    type: Cell,
  });
}

Cell.getCollectionNode = function* getCollectionNode<T>(
  props: CellProps
): Generator<PartialNode<T>> {
  const { children } = untrack(() => props);

  let textValue = untrack(() => props["aria-label"]) ?? "";

  if (typeof children === "string" && children !== "") {
    textValue = children;
  }

  if (
    untrack(() => props.textValue) !== undefined &&
    untrack(() => props.textValue) !== ""
  ) {
    textValue = untrack(() => props.textValue) ?? "";
  }

  yield {
    get "aria-label"() {
      return props["aria-label"];
    },
    hasChildNodes: false,
    props,
    rendered: children,
    textValue,
    type: "cell",
  };
};

/**
 * A Cell represents the value of a single Column within a Table Row.
 */
// We don't want getCollectionNode to show up in the type definition
export { Cell };
