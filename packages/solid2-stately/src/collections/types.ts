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
 * Derived from Adobe React Spectrum: packages/react-stately/src/collections/types.ts.
 * Modified for Solid Aria: adapted state, collection descriptors, imports, and APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { Node, Key } from "@solid2-aria/types-shared";
import type { Element as SolidElement } from "solid-js";

export interface PartialNode<T> {
  type?: string;
  key?: Key | null;
  value?: T;
  element?: SolidElement | null;
  wrapper?: (element: SolidElement) => SolidElement;
  rendered?: SolidElement;
  textValue?: string;
  "aria-label"?: string;
  index?: number;
  renderer?: (item: T) => SolidElement | null;
  hasChildNodes?: boolean;
  childNodes?: () => IterableIterator<PartialNode<T>>;
  props?: unknown;
  shouldInvalidate?: (context: CollectionContext) => boolean;
}

/** Context supplied to custom collection node builders. */
// oxlint-disable-next-line anti-slop/no-unknown-type-aliases -- Collection context is opaque extension data forwarded to node builders without interpretation.
export type CollectionContext = unknown;

/** Inert JSX arrays carry collection metadata without rendering DOM elements. */
export interface CollectionElement<T> extends Array<SolidElement> {
  getCollectionNode: (
    context: CollectionContext
  ) => Generator<PartialNode<T>, void, Node<T>[]>;
  props: unknown;
  key?: Key | null;
}

/** T is supplied by the collection's typed renderer contract. */
export function isCollectionElement<T>(
  value: SolidElement
): value is CollectionElement<T> {
  return (
    Array.isArray(value) &&
    "getCollectionNode" in value &&
    typeof value.getCollectionNode === "function"
  );
}

export function collectionChildren(value: SolidElement): SolidElement[] {
  if (isCollectionElement(value)) {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectionChildren);
  }

  return value === null || value === undefined || typeof value === "boolean"
    ? []
    : [value];
}
