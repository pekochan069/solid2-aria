/*
 * Derived from Adobe React Spectrum: packages/react-aria/src/dnd/DropTargetKeyboardNavigation.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { getChildNodes } from "@solid2-aria/stately/collections/get-child-nodes";
import type {
  Collection,
  DropTarget,
  Key,
  KeyboardDelegate,
  Node,
} from "@solid2-aria/types-shared";

import { isPresent } from "../utils/is-present";
import { requireValue } from "../utils/require-value";
import { getTruthyValue } from "../utils/truthy";

export function navigate(
  keyboardDelegate: KeyboardDelegate,
  collection: Collection<Node<unknown>>,
  target: DropTarget | null | undefined,
  direction: "left" | "right" | "up" | "down",
  rtl = false,
  wrap = false
): DropTarget | null {
  switch (direction) {
    case "left": {
      return rtl
        ? nextDropTarget(keyboardDelegate, collection, target, wrap, "left")
        : previousDropTarget(
            keyboardDelegate,
            collection,
            target,
            wrap,
            "left"
          );
    }

    case "right": {
      return rtl
        ? previousDropTarget(
            keyboardDelegate,
            collection,
            target,
            wrap,
            "right"
          )
        : nextDropTarget(keyboardDelegate, collection, target, wrap, "right");
    }

    case "up": {
      return previousDropTarget(keyboardDelegate, collection, target, wrap);
    }

    case "down": {
      return nextDropTarget(keyboardDelegate, collection, target, wrap);
    }

    default: {
      break;
    }
  }

  return null;
}

function nextDropTarget(
  keyboardDelegate: KeyboardDelegate,
  collection: Collection<Node<unknown>>,
  target: DropTarget | null | undefined,
  wrap = false,
  horizontal: "left" | "right" | null = null
): DropTarget | null {
  if (!target) {
    return {
      type: "root",
    };
  }

  if (target.type === "root") {
    const nextKey = keyboardDelegate.getFirstKey?.() ?? null;

    if (isPresent(nextKey)) {
      return {
        dropPosition: "before",
        key: nextKey,
        type: "item",
      };
    }

    return null;
  }

  if (target.type === "item") {
    const nextKey = adjacentDropKey(
      keyboardDelegate,
      target.key,
      horizontal,
      "below"
    );

    const nextCollectionKey = getNextItem(collection, target.key, (key) =>
      collection.getKeyAfter(key)
    );

    // If the keyboard delegate did not move to the next key in the collection,
    // jump to that key with the same drop position. Otherwise, try the other
    // drop positions on the current key first.
    if (isPresent(nextKey) && nextKey !== nextCollectionKey) {
      return {
        dropPosition: target.dropPosition,
        key: nextKey,
        type: "item",
      };
    }

    switch (target.dropPosition) {
      case "before": {
        return {
          dropPosition: "on",
          key: target.key,
          type: "item",
        };
      }

      case "on": {
        // If there are nested items, traverse to them prior to the "after" position of this target.
        // If the next key is on the same level, then its "before" position is equivalent to this item's "after" position.
        const targetNode = collection.getItem(target.key);

        const nextNode = isPresent(nextKey)
          ? collection.getItem(nextKey)
          : null;

        if (targetNode && nextNode && nextNode.level >= targetNode.level) {
          return {
            dropPosition: "before",
            key: nextNode.key,
            type: "item",
          };
        }

        return {
          dropPosition: "after",
          key: target.key,
          type: "item",
        };
      }

      case "after": {
        const siblingTarget = nextSiblingDropTarget(collection, target);

        if (siblingTarget) {
          return siblingTarget;
        }

        break;
      }

      default: {
        break;
      }
    }
  }

  if (wrap) {
    return {
      type: "root",
    };
  }

  return null;
}

function previousDropTarget(
  keyboardDelegate: KeyboardDelegate,
  collection: Collection<Node<unknown>>,
  target: DropTarget | null | undefined,
  wrap = false,
  horizontal: "left" | "right" | null = null
): DropTarget | null {
  // Start after the last root-level item.
  if (!target || (wrap && target.type === "root")) {
    return lastRootDropTarget(keyboardDelegate, collection);
  }

  if (target.type === "item") {
    const prevKey = adjacentDropKey(
      keyboardDelegate,
      target.key,
      horizontal,
      "above"
    );

    const prevCollectionKey = getNextItem(collection, target.key, (key) =>
      collection.getKeyBefore(key)
    );

    // If the keyboard delegate did not move to the next key in the collection,
    // jump to that key with the same drop position. Otherwise, try the other
    // drop positions on the current key first.
    if (isPresent(prevKey) && prevKey !== prevCollectionKey) {
      return {
        dropPosition: target.dropPosition,
        key: prevKey,
        type: "item",
      };
    }

    switch (target.dropPosition) {
      case "before": {
        // Move after the last child of the previous item.
        const targetNode = collection.getItem(target.key);

        if (
          targetNode &&
          targetNode.prevKey !== null &&
          targetNode.prevKey !== undefined
        ) {
          const lastChild = getLastChild(collection, targetNode.prevKey);

          if (lastChild) {
            return lastChild;
          }
        }

        if (isPresent(prevKey)) {
          return {
            dropPosition: "on",
            key: prevKey,
            type: "item",
          };
        }

        return {
          type: "root",
        };
      }

      case "on": {
        return {
          dropPosition: "before",
          key: target.key,
          type: "item",
        };
      }

      case "after": {
        // Move after the last child of this item.
        const lastChild = getLastChild(collection, target.key);

        if (lastChild) {
          return lastChild;
        }

        return {
          dropPosition: "on",
          key: target.key,
          type: "item",
        };
      }

      default: {
        break;
      }
    }
  }

  if (target.type !== "root") {
    return {
      type: "root",
    };
  }

  return null;
}

function getLastChild(
  collection: Collection<Node<unknown>>,
  key: Key
): DropTarget | null {
  // getChildNodes still returns child tree items even when the item is collapsed.
  // Checking if the next item has a greater level is a silly way to determine if the item is expanded.
  const targetNode = collection.getItem(key);

  const nextKey = getNextItem(collection, key, (keyValue) =>
    collection.getKeyAfter(keyValue)
  );

  const nextNode = isPresent(nextKey) ? collection.getItem(nextKey) : null;

  if (targetNode && nextNode && nextNode.level > targetNode.level) {
    let lastChild: Node<unknown> | null = null;

    if ("lastChildKey" in targetNode) {
      lastChild = isPresent(targetNode.lastChildKey)
        ? collection.getItem(targetNode.lastChildKey)
        : null;

      while (
        lastChild &&
        lastChild.type !== "item" &&
        lastChild.prevKey !== null &&
        lastChild.prevKey !== undefined
      ) {
        lastChild = requireValue(
          collection.getItem(lastChild.prevKey),
          "Expected collection.getItem(lastChild.prevKey)"
        );
      }
    } else {
      lastChild =
        getTruthyValue(
          [...getChildNodes(targetNode, collection)].findLast(
            (item) => item.type === "item"
          )
        ) ?? null;
    }

    if (lastChild) {
      return {
        dropPosition: "after",
        key: lastChild.key,
        type: "item",
      };
    }
  }

  return null;
}

// Find the next or previous item in a collection, skipping over other types of nodes (e.g. content).
function getNextItem(
  collection: Collection<Node<unknown>>,
  key: Key,
  getNextKey: (key: Key) => Key | null
): Key | null {
  let nextCollectionKey = getNextKey(key);

  let nextCollectionNode = isPresent(nextCollectionKey)
    ? collection.getItem(nextCollectionKey)
    : null;

  while (nextCollectionNode && nextCollectionNode.type !== "item") {
    nextCollectionKey = getNextKey(nextCollectionNode.key);
    nextCollectionNode = isPresent(nextCollectionKey)
      ? collection.getItem(nextCollectionKey)
      : null;
  }

  return nextCollectionKey;
}

function nextSiblingDropTarget(
  collection: Collection<Node<unknown>>,
  target: Extract<DropTarget, { type: "item" }>
): DropTarget | null {
  // If this is the last sibling in a level, traverse to the parent.
  const targetNode = collection.getItem(target.key);

  let nextItemInSameLevel = isPresent(targetNode?.nextKey)
    ? collection.getItem(targetNode.nextKey)
    : null;

  while (
    isPresent(nextItemInSameLevel) &&
    nextItemInSameLevel.type !== "item"
  ) {
    nextItemInSameLevel = isPresent(nextItemInSameLevel.nextKey)
      ? collection.getItem(nextItemInSameLevel.nextKey)
      : null;
  }

  if (
    targetNode &&
    !isPresent(nextItemInSameLevel) &&
    targetNode.parentKey !== null &&
    targetNode.parentKey !== undefined
  ) {
    // If the parent item has an item after it, use the "before" position.
    const parentNode = collection.getItem(targetNode.parentKey);

    const nextNode = isPresent(parentNode?.nextKey)
      ? collection.getItem(parentNode.nextKey)
      : null;

    if (nextNode?.type === "item") {
      return {
        dropPosition: "before",
        key: nextNode.key,
        type: "item",
      };
    }

    if (parentNode?.type === "item") {
      return {
        dropPosition: "after",
        key: parentNode.key,
        type: "item",
      };
    }
  }

  if (nextItemInSameLevel) {
    return {
      dropPosition: "on",
      key: nextItemInSameLevel.key,
      type: "item",
    };
  }

  return null;
}

function lastRootDropTarget(
  keyboardDelegate: KeyboardDelegate,
  collection: Collection<Node<unknown>>
): DropTarget | null {
  // Keyboard delegate gets the deepest item but we want the shallowest.
  let prevKey: Key | null = null;
  let lastKey = keyboardDelegate.getLastKey?.();

  while (isPresent(lastKey)) {
    const node = collection.getItem(lastKey);

    if (node?.type !== "item") {
      break;
    }

    prevKey = lastKey;
    lastKey = node?.parentKey;
  }

  if (isPresent(prevKey)) {
    return {
      dropPosition: "after",
      key: prevKey,
      type: "item",
    };
  }

  return null;
}

function adjacentDropKey(
  delegate: KeyboardDelegate,
  key: Key,
  horizontal: "left" | "right" | null,
  vertical: "above" | "below"
): Key | null | undefined {
  switch (horizontal) {
    case "left": {
      return delegate.getKeyLeftOf?.(key, { includeDisabled: true });
    }

    case "right": {
      return delegate.getKeyRightOf?.(key, { includeDisabled: true });
    }

    case null: {
      return vertical === "above"
        ? delegate.getKeyAbove?.(key, { includeDisabled: true })
        : delegate.getKeyBelow?.(key, { includeDisabled: true });
    }

    default: {
      return undefined;
    }
  }
}
