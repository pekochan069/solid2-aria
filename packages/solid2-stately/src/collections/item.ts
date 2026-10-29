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
 * Derived from Adobe React Spectrum: packages/react-stately/src/collections/Item.ts.
 * Modified for Solid Aria: adapted state, collection descriptors, imports, and APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { ItemProps } from "@solid2-aria/types-shared";
import { untrack } from "solid-js";
import type { Element as SolidElement } from "solid-js";

import { hasContent } from "../utils/has-content";
import type { CollectionContext, PartialNode } from "./types";
import { collectionChildren } from "./types";

function Item<T>(
  props: ItemProps<T> & {
    key?: string | number;
  }
): SolidElement {
  return Object.assign([], {
    getCollectionNode: (context: CollectionContext) =>
      Item.getCollectionNode(props, context),
    get key() {
      return props.key;
    },
    props,
  });
}

Item.getCollectionNode = function* getCollectionNode<T>(
  props: ItemProps<T> & {
    key?: string | number;
  },
  context: CollectionContext
): Generator<PartialNode<T>> {
  const { childItems, title, children } = props;
  const rendered = props.title ?? props.children;

  let textValue = props["aria-label"] ?? "";

  if (typeof rendered === "string" && rendered !== "") {
    textValue = rendered;
  }

  if (props.textValue !== undefined && props.textValue !== "") {
    ({ textValue } = props);
  }

  // suppressTextValueWarning is used in components like Tabs, which don't have type to select support.
  if (
    !textValue &&
    (typeof context !== "object" ||
      context === null ||
      !("suppressTextValueWarning" in context) ||
      context.suppressTextValueWarning !== true) &&
    process.env.NODE_ENV !== "production"
  ) {
    console.warn(
      "<Item> with non-plain text contents is unsupported by type to select for accessibility. Please add a `textValue` prop."
    );
  }

  yield {
    "aria-label": props["aria-label"],
    *childNodes() {
      if (childItems) {
        for (const child of childItems) {
          yield {
            type: "item",
            value: child,
          };
        }
      } else if (hasContent(title)) {
        const items: PartialNode<T>[] = [];

        for (const child of collectionChildren(children)) {
          items.push({
            element: child,
            type: "item",
          });
        }

        yield* items;
      }
    },
    hasChildNodes: hasChildItems(props),
    props,
    rendered,
    textValue,
    type: "item",
  };
};

function hasChildItems<T>(
  props: ItemProps<T> & {
    key?: string | number;
  }
) {
  if (
    untrack(() => props.hasChildItems) !== null &&
    untrack(() => props.hasChildItems) !== undefined
  ) {
    return untrack(() => props.hasChildItems);
  }

  if (untrack(() => props.childItems)) {
    return true;
  }

  if (
    Boolean(untrack(() => props.title)) &&
    collectionChildren(untrack(() => props.children)).length > 0
  ) {
    return true;
  }

  return false;
}

export { Item };
