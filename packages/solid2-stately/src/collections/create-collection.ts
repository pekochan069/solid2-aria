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
 * Derived from Adobe React Spectrum: packages/react-stately/src/collections/useCollection.ts.
 * Modified for Solid Aria: adapted state, collection descriptors, imports, and APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  Collection,
  CollectionStateBase,
  Node,
} from "@solid2-aria/types-shared";
import { createMemo } from "solid-js";
import type { Accessor } from "solid-js";

import { CollectionBuilder } from "./collection-builder";
import type { CollectionContext } from "./types";

export type CollectionOptions<
  T,
  C extends Collection<Node<T>>,
> = CollectionStateBase<T, C>;

export type CollectionFactory<T, C extends Collection<Node<T>>> = (
  nodes: Iterable<Node<T>>
) => C;

function isContextProvider(
  context: CollectionContext
): context is Accessor<CollectionContext> {
  return typeof context === "function";
}

/** Returns an accessor so collection replacement remains reactive. */
export function createCollection<
  T extends object,
  C extends Collection<Node<T>> = Collection<Node<T>>,
>(
  props: CollectionOptions<T, C>,
  factory: CollectionFactory<T, C>,
  context?: CollectionContext
): Accessor<C> {
  return createMemo(() => {
    if (props.collection) {
      return props.collection;
    }

    // Each snapshot owns its lazy iterators and cache. Retained snapshots never observe a later build.
    const builder = new CollectionBuilder<T>();

    return factory(
      builder.build(
        { children: props.children, items: props.items },
        isContextProvider(context) ? context() : context
      )
    );
  });
}
