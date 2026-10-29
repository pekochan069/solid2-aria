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
 * Derived from Adobe React Spectrum: packages/react-stately/src/collections/Section.ts.
 * Modified for Solid Aria: adapted state, collection descriptors, imports, and APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { SectionProps } from "@solid2-aria/types-shared";
import { untrack } from "solid-js";
import type { Element as SolidElement } from "solid-js";

import type { CollectionContext, PartialNode } from "./types";
import { collectionChildren } from "./types";

function Section<T>(
  props: SectionProps<T> & {
    key?: string | number;
  }
): SolidElement {
  return Object.assign([], {
    getCollectionNode: (_context: CollectionContext) =>
      Section.getCollectionNode(props),
    get key() {
      return props.key;
    },
    props,
  });
}

Section.getCollectionNode = function* getCollectionNode<T>(
  props: SectionProps<T> & {
    key?: string | number;
  }
): Generator<PartialNode<T>> {
  const { children, title, items } = untrack(() => props);
  yield {
    get "aria-label"() {
      return props["aria-label"];
    },
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

        for (const child of collectionChildren(children)) {
          localItems.push({
            element: child,
            type: "item",
          });
        }

        yield* localItems;
      }
    },
    hasChildNodes: true,
    props,
    rendered: title,
    type: "section",
  };
};

export { Section };
