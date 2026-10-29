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
 * Derived from Adobe React Spectrum: packages/react-stately/src/collections/CollectionBuilder.ts.
 * Modified for Solid Aria: adapted state, collection descriptors, imports, and APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { CollectionBase, Key, Node } from "@solid2-aria/types-shared";
import { untrack } from "solid-js";
import type { Element as SolidElement } from "solid-js";

import { hasContent } from "../utils/has-content";
import type {
  CollectionContext,
  PartialNode,
  CollectionElement,
} from "./types";
import { collectionChildren, isCollectionElement } from "./types";

interface CollectionBuilderState<T> {
  renderer?: (value: T) => SolidElement | null;
}

export class CollectionBuilder<T extends object> {
  private context?: CollectionContext;
  private readonly cache = new WeakMap<T, Node<T>>();
  build(
    props: Partial<CollectionBase<T>>,
    context?: CollectionContext
  ): Iterable<Node<T>> {
    this.context = context;

    return iterable(() => this.iterateCollection(props));
  }
  private *iterateCollection(
    props: Partial<CollectionBase<T>>
  ): Generator<Node<T>> {
    const { children, items } = untrack(() => props);

    if (typeof children === "function") {
      if (!items) {
        throw new Error(
          "props.children was a function but props.items is missing"
        );
      }

      let index = 0;

      for (const item of items) {
        yield* this.getFullNode(
          {
            index,
            value: item,
          },
          { renderer: children }
        );
        index += 1;
      }
    } else {
      const localItems = collectionChildren(children);
      let index = 0;

      for (const item of localItems) {
        const nodes = this.getFullNode(
          {
            element: item,
            index,
          },
          {}
        );

        for (const node of nodes) {
          index += 1;
          yield node;
        }
      }
    }
  }
  private static getKey<T extends object>(
    item: CollectionElement<T>,
    partialNode: PartialNode<T>,
    state: CollectionBuilderState<T>,
    parentKey?: Key | null
  ): Key {
    if (item.key !== null && item.key !== undefined) {
      return item.key;
    }

    if (
      partialNode.type === "cell" &&
      partialNode.key !== null &&
      partialNode.key !== undefined
    ) {
      return `${parentKey}${partialNode.key}`;
    }

    const v = partialNode.value;

    if (v !== null && v !== undefined) {
      const key =
        ("key" in v ? v.key : undefined) ?? ("id" in v ? v.id : undefined);

      if (typeof key !== "string" && typeof key !== "number") {
        throw new TypeError("No key found for item");
      }

      return key;
    }

    return parentKey !== null && parentKey !== undefined
      ? `${parentKey}.${partialNode.index}`
      : `$.${partialNode.index}`;
  }
  private static getChildState<T>(
    state: CollectionBuilderState<T>,
    partialNode: PartialNode<T>
  ) {
    return {
      renderer: partialNode.renderer ?? state.renderer,
    };
  }
  // oxlint-disable-next-line eslint/complexity -- Retain the upstream recursive generator protocol and its node caching together.
  private *getFullNode(
    partialNode: PartialNode<T> & {
      index: number;
    },
    state: CollectionBuilderState<T>,
    parentKey?: Key | null,
    parentNode?: Node<T>
  ): Generator<Node<T>> {
    // If there's a value instead of an element on the node, and a parent renderer function is available,
    // use it to render an element for the value.
    let { element } = partialNode;

    if (
      !hasContent(element) &&
      partialNode.value !== undefined &&
      state.renderer
    ) {
      const cached = this.cache.get(partialNode.value);

      if (
        cached &&
        (!cached.shouldInvalidate || !cached.shouldInvalidate(this.context))
      ) {
        cached.index = partialNode.index;
        cached.parentKey = parentNode ? parentNode.key : null;
        yield cached;

        return;
      }

      element = state.renderer(partialNode.value);
    }

    // If there's an element with a getCollectionNode function on its type, then it's a supported component.
    // Call this function to get a partial node, and recursively build a full node from there.
    if (isCollectionElement<T>(element)) {
      const childNodes = element.getCollectionNode(this.context);
      let index = partialNode.index ?? 0;
      let result = childNodes.next();

      while (!(result.done === true) && Boolean(result.value)) {
        const childNode = result.value;
        partialNode.index = index;
        let nodeKey = childNode.key ?? null;

        nodeKey ??= hasContent(childNode.element)
          ? null
          : CollectionBuilder.getKey(element, partialNode, state, parentKey);

        const nodes = this.getFullNode(
          {
            ...childNode,
            index,
            key: nodeKey,
            wrapper: compose(partialNode.wrapper, childNode.wrapper),
          },
          CollectionBuilder.getChildState(state, childNode),
          parentKey !== null && parentKey !== undefined
            ? `${parentKey}${element.key ?? ""}`
            : element.key,
          parentNode
        );

        const children = [...nodes];

        for (const node of children) {
          // Cache the node based on its value
          node.value = childNode.value ?? partialNode.value ?? null;

          if (node.value) {
            this.cache.set(node.value, node);
          }

          // The partial node may have specified a type for the child in order to specify a constraint.
          // Verify that the full node that was built recursively matches this type.
          if (
            partialNode.type !== undefined &&
            partialNode.type !== "" &&
            node.type !== partialNode.type
          ) {
            throw new Error(
              `Unsupported type <${capitalize(node.type)}> in <${capitalize(parentNode?.type ?? "unknown parent type")}>. Only <${capitalize(partialNode.type)}> is supported.`
            );
          }

          index += 1;
          yield node;
        }

        result = childNodes.next(children);
      }

      return;
    }

    // Ignore invalid elements
    if (
      partialNode.key === null ||
      partialNode.key === undefined ||
      partialNode.type === null ||
      partialNode.type === undefined
    ) {
      return;
    }

    // Create full node
    const buildChild = this.getFullNode.bind(this);

    const node: Node<T> = {
      "aria-label": partialNode["aria-label"],
      // oxlint-disable-next-line typescript/no-deprecated -- Preserve and test the upstream compatibility API.
      childNodes: iterable(function* childNodes() {
        if (!(partialNode.hasChildNodes === true) || !partialNode.childNodes) {
          return;
        }

        let index = 0;

        for (const child of partialNode.childNodes()) {
          // Ensure child keys are globally unique by prepending the parent node's key
          if (child.key !== null && child.key !== undefined) {
            // Upstream plans to remove this line and enforce that users always provide unique keys.
            // Currently this line will have issues when a parent has a key `a` and a child with key `bc`
            // but another parent has key `ab` and its child has a key `c`. The combined keys would result in both
            // children having a key of `abc`.
            child.key = `${node.key}${child.key}`;
          }

          const nodes = buildChild(
            { ...child, index },
            CollectionBuilder.getChildState(state, child),
            node.key,
            node
          );

          for (const localNode of nodes) {
            index += 1;
            yield localNode;
          }
        }
      }),
      hasChildNodes: partialNode.hasChildNodes === true || false,
      index: partialNode.index,
      key: partialNode.key,
      level: (parentNode?.level ?? 0) + (parentNode?.type === "item" ? 1 : 0),
      parentKey: parentNode ? parentNode.key : null,
      props: partialNode.props,
      rendered: partialNode.rendered,
      shouldInvalidate: partialNode.shouldInvalidate,
      textValue: partialNode.textValue ?? "",
      type: partialNode.type,
      value: partialNode.value ?? null,
      wrapper: partialNode.wrapper,
    };

    yield node;
  }
}

// Wraps an iterator function as an iterable object, and caches the results.
function iterable<T>(
  iterator: () => IterableIterator<Node<T>>
): Iterable<Node<T>> {
  const cache: Node<T>[] = [];
  let localIterable: null | IterableIterator<Node<T>> = null;

  return {
    *[Symbol.iterator]() {
      for (const item of cache) {
        yield item;
      }

      localIterable ??= iterator();

      for (const item of localIterable) {
        cache.push(item);
        yield item;
      }
    },
  };
}

type Wrapper = (element: SolidElement) => SolidElement;

function compose(
  outer: Wrapper | undefined,
  inner: Wrapper | undefined
): Wrapper | undefined {
  if (outer && inner) {
    return (element) => outer(inner(element));
  }

  if (outer) {
    return outer;
  }

  if (inner) {
    return inner;
  }

  return undefined;
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
