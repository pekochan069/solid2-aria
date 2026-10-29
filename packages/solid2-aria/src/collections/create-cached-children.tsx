/*
 * Copyright 2024 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria/src/collections/useCachedChildren.ts.
 * Modified for Solid Aria: adapted components, imports, and reactive lifecycle for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { Key } from "@solid2-aria/types-shared";
import { createContext, createMemo, For, untrack } from "solid-js";
import type { Element as SolidElement } from "solid-js";

import { isPresent } from "../utils/is-present";

export interface CachedChildrenOptions<T> {
  items?: Iterable<T>;
  children?: SolidElement | ((item: T) => SolidElement);
  dependencies?: readonly unknown[];
  idScope?: Key;
  addIdAndValue?: boolean;
}

export const CollectionItemContext = createContext<{
  id?: Key;
  value: unknown;
} | null>(null);

function parseItemKey(
  // oxlint-disable-next-line anti-slop/no-unknown-parameters -- Generic collection items may be primitives or objects; their keys are validated here.
  item: unknown
): Key | undefined {
  if (!isPresent(item) || typeof item !== "object") {
    return undefined;
  }

  let key: unknown;

  if ("key" in item) {
    ({ key } = item);
  } else if ("id" in item) {
    key = item.id;
  }

  return typeof key === "string" || typeof key === "number" ? key : undefined;
}

/** Each item has its own Solid owner, retaining DOM and focus while sibling items update. */
export function createCachedChildren<T>(
  props: CachedChildrenOptions<T>
): () => SolidElement {
  const supplied = createMemo(() => props.children);

  const items = createMemo(() => {
    for (const dependency of props.dependencies ?? []) {
      void dependency;
    }

    return props.items ? [...props.items] : [];
  });

  const content = (
    <For each={items()}>
      {(item) => {
        const key = parseItemKey(item);

        const value = {
          get id() {
            return key !== undefined && isPresent(props.idScope)
              ? `${props.idScope}:${key}`
              : key;
          },
          value: item,
        };

        return (
          <CollectionItemContext value={value}>
            {untrack(() => {
              const render = supplied();

              return typeof render === "function" ? render(item) : undefined;
            })}
          </CollectionItemContext>
        );
      }}
    </For>
  );

  return () => {
    const value = supplied();

    if (typeof value === "function") {
      if (props.items !== undefined) {
        return content;
      }

      // SAFETY: Without an item source, the function is a renderer child thunk rather than an item renderer.
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion, anti-slop/no-chained-type-assertions -- The web renderer resolves child thunks lazily, while core Element omits their function type.
      return value as unknown as SolidElement;
    }

    return value;
  };
}
