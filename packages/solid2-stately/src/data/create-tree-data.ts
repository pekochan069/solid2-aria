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
 * Derived from Adobe React Spectrum: packages/react-stately/src/data/useTreeData.ts.
 * Modified for Solid Aria: adapted reactive state, getters, imports, and APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { Key } from "@solid2-aria/types-shared";
import { createMemo, createSignal, untrack } from "solid-js";

import { getItemKey } from "../utils/get-item-key";

export interface TreeOptions<T extends object> {
  /** Initial root items in the tree. */
  initialItems?: T[];
  /** The keys for the initially selected items. */
  initialSelectedKeys?: Iterable<Key>;
  /** A function that returns a unique key for an item object. */
  getKey?: (item: T) => Key;
  /** A function that returns the children for an item object. */
  getChildren?: (item: T) => T[];
}

interface TreeNode<T extends object> {
  /** A unique key for the tree node. */
  key: Key;
  /** The key of the parent node. */
  parentKey?: Key | null;
  /** The value object for the tree node. */
  value: T;
  /** Children of the tree node. */
  children: TreeNode<T>[] | null;
}

export interface TreeData<T extends object> {
  /** The root nodes in the tree. */
  items: TreeNode<T>[];
  /** The keys of the currently selected items in the tree. */
  selectedKeys: Set<Key>;
  /** Sets the selected keys. */
  setSelectedKeys: (keys: Set<Key>) => void;
  /**
   * Gets a node from the tree by key.
   *
   * @param key - The key of the item to retrieve.
   */
  getItem: (key: Key) => TreeNode<T> | undefined;
  /**
   * Inserts an item into a parent node as a child.
   *
   * @param parentKey - The key of the parent item to insert into. `null` for the root.
   * @param index - The index within the parent to insert into.
   * @param value - The value to insert.
   */
  insert: (parentKey: Key | null, index: number, ...values: T[]) => void;
  /**
   * Inserts items into the list before the item at the given key.
   *
   * @param key - The key of the item to insert before.
   * @param values - The values to insert.
   */
  insertBefore: (key: Key, ...values: T[]) => void;
  /**
   * Inserts items into the list after the item at the given key.
   *
   * @param key - The key of the item to insert after.
   * @param values - The values to insert.
   */
  insertAfter: (key: Key, ...values: T[]) => void;
  /**
   * Appends an item into a parent node as a child.
   *
   * @param parentKey - The key of the parent item to insert into. `null` for the root.
   * @param value - The value to insert.
   */
  append: (parentKey: Key | null, ...values: T[]) => void;
  /**
   * Prepends an item into a parent node as a child.
   *
   * @param parentKey - The key of the parent item to insert into. `null` for the root.
   * @param value - The value to insert.
   */
  prepend: (parentKey: Key | null, ...value: T[]) => void;
  /**
   * Removes an item from the tree by its key.
   *
   * @param key - The key of the item to remove.
   */
  remove: (...keys: Key[]) => void;
  /**
   * Removes all items from the tree that are currently
   * in the set of selected items.
   */
  removeSelectedItems: () => void;
  /**
   * Moves an item within the tree.
   *
   * @param key - The key of the item to move.
   * @param toParentKey - The key of the new parent to insert into. `null` for the root.
   * @param index - The index within the new parent to insert at.
   */
  move: (key: Key, toParentKey: Key | null, index: number) => void;
  /**
   * Moves one or more items before a given key.
   *
   * @param key - The key of the item to move the items before.
   * @param keys - The keys of the items to move.
   */
  moveBefore: (key: Key, keys: Iterable<Key>) => void;
  /**
   * Moves one or more items after a given key.
   *
   * @param key - The key of the item to move the items after.
   * @param keys - The keys of the items to move.
   */
  moveAfter: (key: Key, keys: Iterable<Key>) => void;
  /**
   * Updates an item in the tree.
   *
   * @param key - The key of the item to update.
   * @param newValue - The new value for the item.
   */
  update: (key: Key, newValue: T) => void;
}

interface TreeDataState<T extends object> {
  items: TreeNode<T>[];
  nodeMap: Map<Key, TreeNode<T>>;
}

/**
 * Manages state for an immutable tree data structure, and provides convenience methods to
 * update the data over time.
 */
export function createTreeData<T extends object>(
  options: TreeOptions<T>
): TreeData<T> {
  const initialItems = createMemo(() => options.initialItems ?? []);
  const initialSelectedKeys = createMemo(() => options.initialSelectedKeys);
  const getKey = createMemo(() => options.getKey ?? getItemKey);

  const getChildren = createMemo(
    () =>
      options.getChildren ??
      ((item: T) => {
        const children = "children" in item ? item.children : undefined;

        // SAFETY: without getChildren, TreeOptions uses the conventional recursive children: T[] shape.
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion
        return Array.isArray(children) ? (children as T[]) : [];
      })
  );

  // We only want to compute this on initial render.
  const [tree, commitTree] = createSignal<TreeDataState<T>>(
    untrack(() =>
      (() => {
        const currentInitialItems = initialItems();

        return buildTree(currentInitialItems, new Map());
      })()
    ),
    { ownedWrite: true }
  );

  let pendingTree = untrack(tree);

  const setItems = (
    update: TreeDataState<T> | ((state: TreeDataState<T>) => TreeDataState<T>)
  ) => {
    pendingTree = typeof update === "function" ? update(pendingTree) : update;
    commitTree(pendingTree);
  };

  const derived1 = createMemo(() => tree());

  const items = createMemo(() => {
    const currentDerived1 = derived1();

    return currentDerived1.items;
  });

  const [selectedKeys, commitSelectedKeys] = createSignal(
    untrack(() => {
      const currentInitialSelectedKeys = initialSelectedKeys();

      return new Set<Key>(currentInitialSelectedKeys);
    }),
    { ownedWrite: true }
  );

  let pendingSelectedKeys = untrack(selectedKeys);

  const setSelectedKeys = (keys: Set<Key>) => {
    pendingSelectedKeys = keys;
    commitSelectedKeys(keys);
  };

  function buildTree(
    initialInitialItems: T[] | null | undefined,
    map: Map<Key, TreeNode<T>>,
    parentKey?: Key | null
  ) {
    let localInitialItems = initialInitialItems;

    localInitialItems ??= [];

    return {
      items: localInitialItems.map((item) => {
        const currentGetKey = getKey();
        const currentGetChildren = getChildren();

        const node: TreeNode<T> = {
          children: null,
          key: currentGetKey(item),
          parentKey: parentKey ?? null,
          value: item,
        };

        node.children = buildTree(
          currentGetChildren(item),
          map,
          node.key
        ).items;
        map.set(node.key, node);

        return node;
      }),
      nodeMap: map,
    };
  }

  function updateTree(
    localInitialItems: TreeNode<T>[],
    key: Key | null,
    update: (node: TreeNode<T>) => TreeNode<T> | null,
    originalMap: Map<Key, TreeNode<T>>
  ) {
    const localItems = localInitialItems;

    let node = key === null || key === undefined ? null : originalMap.get(key);

    if (node === null || node === undefined) {
      return { items: localItems, nodeMap: originalMap };
    }

    const map = new Map<Key, TreeNode<T>>(originalMap);
    // Create a new node. If null, then delete the node, otherwise replace.
    let newNode = update(node);

    if (newNode === null || newNode === undefined) {
      deleteNode(node, map);
    } else {
      addNode(newNode, map);
    }

    // Walk up the tree and update each parent to refer to the new children.
    while (node.parentKey !== null && node.parentKey !== undefined) {
      const nextParent = map.get(node.parentKey);

      if (!nextParent) {
        throw new Error(`Missing parent node: ${node.parentKey}`);
      }

      const copy: TreeNode<T> = {
        children: null,
        key: nextParent.key,
        parentKey: nextParent.parentKey,
        value: nextParent.value,
      };

      const previousNode = node;
      const replacement = newNode;
      copy.children =
        nextParent.children?.flatMap((child) => {
          if (child !== previousNode) {
            return [child];
          }

          return replacement === null ? [] : [replacement];
        }) ?? null;
      map.set(copy.key, copy);
      newNode = copy;
      node = nextParent;
    }

    const rootNode = node;
    const rootReplacement = newNode;

    return {
      items: localItems.flatMap((item) => {
        if (item !== rootNode) {
          return [item];
        }

        return rootReplacement === null ? [] : [rootReplacement];
      }),
      nodeMap: map,
    };
  }

  function addNode(node: TreeNode<T>, map: Map<Key, TreeNode<T>>) {
    map.set(node.key, node);

    if (node.children) {
      for (const child of node.children) {
        addNode(child, map);
      }
    }
  }

  function deleteNode(node: TreeNode<T>, map: Map<Key, TreeNode<T>>) {
    map.delete(node.key);

    if (node.children) {
      for (const child of node.children) {
        deleteNode(child, map);
      }
    }
  }

  return {
    append(parentKey: Key | null, ...values: T[]) {
      const currentItems = pendingTree.items;
      const currentNodeMap = pendingTree.nodeMap;

      if (parentKey === null || parentKey === undefined) {
        this.insert(null, currentItems.length, ...values);
      } else {
        const parentNode = currentNodeMap.get(parentKey);

        if (!parentNode) {
          return;
        }

        this.insert(parentKey, parentNode.children?.length ?? 0, ...values);
      }
    },
    getItem(key: Key) {
      const currentNodeMap = pendingTree.nodeMap;

      return currentNodeMap.get(key);
    },
    insert(parentKey: Key | null, index: number, ...values: T[]) {
      setItems(({ items: localItems, nodeMap: originalMap }) => {
        const { items: newNodes, nodeMap: newMap } = buildTree(
          values,
          new Map(originalMap),
          parentKey
        );

        // If parentKey is null, insert into the root.
        if (parentKey === null || parentKey === undefined) {
          return {
            items: [
              ...localItems.slice(0, index),
              ...newNodes,
              ...localItems.slice(index),
            ],
            nodeMap: newMap,
          };
        }

        // Otherwise, update the parent node and its ancestors.
        return updateTree(
          localItems,
          parentKey,
          (parentNode) => ({
            children: [
              ...(parentNode.children ?? []).slice(0, index),
              ...newNodes,
              ...(parentNode.children ?? []).slice(index),
            ],
            key: parentNode.key,
            parentKey: parentNode.parentKey,
            value: parentNode.value,
          }),
          newMap
        );
      });
    },
    insertAfter(key: Key, ...values: T[]): void {
      const currentNodeMap = pendingTree.nodeMap;
      const currentItems = pendingTree.items;
      const node = currentNodeMap.get(key);

      if (!node) {
        return;
      }

      const parentNode =
        node.parentKey === null || node.parentKey === undefined
          ? undefined
          : currentNodeMap.get(node.parentKey);

      const nodes = parentNode?.children ?? currentItems;
      const index = nodes.indexOf(node);
      this.insert(parentNode?.key ?? null, index + 1, ...values);
    },
    insertBefore(key: Key, ...values: T[]): void {
      const currentNodeMap = pendingTree.nodeMap;
      const currentItems = pendingTree.items;
      const node = currentNodeMap.get(key);

      if (!node) {
        return;
      }

      const parentNode =
        node.parentKey === null || node.parentKey === undefined
          ? undefined
          : currentNodeMap.get(node.parentKey);

      const nodes = parentNode?.children ?? currentItems;
      const index = nodes.indexOf(node);
      this.insert(parentNode?.key ?? null, index, ...values);
    },
    get items() {
      return items();
    },
    move(key: Key, toParentKey: Key | null, index: number) {
      setItems(({ items: localItems, nodeMap: originalMap }) => {
        let current = toParentKey;

        while (current !== null && current !== undefined) {
          if (current === key) {
            throw new Error("Cannot move an item to be a child of itself.");
          }

          current = originalMap.get(current)?.parentKey ?? null;
        }

        const node = originalMap.get(key);

        if (!node) {
          return { items: localItems, nodeMap: originalMap };
        }

        const { items: newItems, nodeMap: newMap } = updateTree(
          localItems,
          key,
          () => null,
          originalMap
        );

        const movedNode = {
          ...node,
          parentKey: toParentKey,
        };

        // If parentKey is null, insert into the root.
        if (toParentKey === null || toParentKey === undefined) {
          addNode(movedNode, newMap);

          return {
            items: [
              ...newItems.slice(0, index),
              movedNode,
              ...newItems.slice(index),
            ],
            nodeMap: newMap,
          };
        }

        // Otherwise, update the parent node and its ancestors.
        return updateTree(
          newItems,
          toParentKey,
          (parentNode) => ({
            children: [
              ...(parentNode.children ?? []).slice(0, index),
              movedNode,
              ...(parentNode.children ?? []).slice(index),
            ],
            key: parentNode.key,
            parentKey: parentNode.parentKey,
            value: parentNode.value,
          }),
          newMap
        );
      });
    },
    moveAfter(key: Key, keys: Iterable<Key>) {
      setItems((prevState) => {
        const { items: localItems, nodeMap } = prevState;
        const node = nodeMap.get(key);

        if (!node) {
          return prevState;
        }

        const toParentKey = node.parentKey ?? null;
        let parent: null | TreeNode<T> = null;

        if (toParentKey !== null && toParentKey !== undefined) {
          parent = nodeMap.get(toParentKey) ?? null;
        }

        let toIndex = parent?.children
          ? parent.children.indexOf(node)
          : localItems.indexOf(node);

        toIndex += 1;

        return moveItems(prevState, keys, parent, toIndex, updateTree, addNode);
      });
    },
    moveBefore(key: Key, keys: Iterable<Key>) {
      setItems((prevState) => {
        const { items: localItems, nodeMap } = prevState;
        const node = nodeMap.get(key);

        if (!node) {
          return prevState;
        }

        const toParentKey = node.parentKey ?? null;
        let parent: null | TreeNode<T> = null;

        if (toParentKey !== null && toParentKey !== undefined) {
          parent = nodeMap.get(toParentKey) ?? null;
        }

        const toIndex = parent?.children
          ? parent.children.indexOf(node)
          : localItems.indexOf(node);

        return moveItems(prevState, keys, parent, toIndex, updateTree, addNode);
      });
    },
    prepend(parentKey: Key | null, ...values: T[]) {
      this.insert(parentKey, 0, ...values);
    },
    remove(...keys: Key[]) {
      const currentItems = pendingTree.items;
      const currentNodeMap = pendingTree.nodeMap;
      const currentSelectedKeys = pendingSelectedKeys;

      if (keys.length === 0) {
        return;
      }

      let newItems = currentItems;
      let prevMap = currentNodeMap;
      let newTree: TreeDataState<T> = { items: newItems, nodeMap: prevMap };

      for (const key of keys) {
        newTree = updateTree(newItems, key, () => null, prevMap);
        prevMap = newTree.nodeMap;
        newItems = newTree.items;
      }

      setItems(newTree);
      const selection = new Set(currentSelectedKeys);

      for (const key of currentSelectedKeys) {
        if (!newTree.nodeMap.has(key)) {
          selection.delete(key);
        }
      }

      setSelectedKeys(selection);
    },
    removeSelectedItems() {
      const currentSelectedKeys = pendingSelectedKeys;
      this.remove(...currentSelectedKeys);
    },
    get selectedKeys() {
      return selectedKeys();
    },
    setSelectedKeys,
    update(oldKey: Key, newValue: T) {
      setItems(({ items: localItems, nodeMap: originalMap }) =>
        updateTree(
          localItems,
          oldKey,
          (oldNode) => {
            const currentGetChildren = getChildren();

            const node: TreeNode<T> = {
              children: null,
              key: oldNode.key,
              parentKey: oldNode.parentKey,
              value: newValue,
            };

            const localTree = buildTree(
              currentGetChildren(newValue),
              originalMap,
              node.key
            );

            node.children = localTree.items;

            return node;
          },
          originalMap
        )
      );
    },
  };
}

function moveItems<T extends object>(
  state: TreeDataState<T>,
  keys: Iterable<Key>,
  toParent: TreeNode<T> | null,
  initialToIndex: number,
  updateTree: (
    items: TreeNode<T>[],
    key: Key | null,
    update: (node: TreeNode<T>) => TreeNode<T> | null,
    originalMap: Map<Key, TreeNode<T>>
  ) => TreeDataState<T>,
  addNode: (node: TreeNode<T>, map: Map<Key, TreeNode<T>>) => void
): TreeDataState<T> {
  let toIndex = initialToIndex;

  const { items, nodeMap } = state;
  let parent = toParent;
  const removeKeys = new Set(keys);

  while (parent !== null && parent !== undefined) {
    if (removeKeys.has(parent.key)) {
      throw new Error("Cannot move an item to be a child of itself.");
    }

    parent =
      parent.parentKey === null || parent.parentKey === undefined
        ? null
        : (nodeMap.get(parent.parentKey) ?? null);
  }

  const originalToIndex = toIndex;
  const keyArray = new Set(keys);
  // depth first search to put keys in order
  const inOrderKeys = new Map<Key, number>();
  const removedItems: TreeNode<T>[] = [];
  let newItems = items;
  let newMap = nodeMap;
  let i = 0;

  function traversal(
    node:
      | TreeNode<T>
      | {
          children: TreeNode<T>[];
        }
      | null,
    {
      inorder: localInorder,
      postorder: localPostorder,
    }: {
      inorder?: (node: TreeNode<T> | null) => void;
      postorder?: (node: TreeNode<T>) => void;
    }
  ) {
    if (node === null || "key" in node) {
      localInorder?.(node);
    }

    if (node !== null && node !== undefined) {
      for (const child of node.children ?? []) {
        traversal(child, { inorder: localInorder, postorder: localPostorder });
        localPostorder?.(child);
      }
    }
  }

  function inorder(child: TreeNode<T> | null) {
    // in-order so we add items as we encounter them in the tree, then we can insert them in expected order later
    if (child && keyArray.has(child.key)) {
      inOrderKeys.set(child.key, i);
      i += 1;
    }
  }

  function postorder(child: TreeNode<T>) {
    // remove items and update the tree from the leaves and work upwards toward the root, this way
    // we don't copy child node references from parents inadvertently
    if (Boolean(child) && keyArray.has(child.key)) {
      removedItems.push({
        ...(newMap.get(child.key) ?? child),
        parentKey: toParent?.key ?? null,
      });

      const { items: nextItems, nodeMap: nextMap } = updateTree(
        newItems,
        child.key,
        () => null,
        newMap
      );

      newItems = nextItems;
      newMap = nextMap;
    }

    // decrement the index if the child being removed is in the target parent and before the target index
    // the root node is special, it is null, and will not have a key, however, a parentKey can still point to it
    if (
      (child.parentKey === toParent || child.parentKey === toParent?.key) &&
      keyArray.has(child.key) &&
      (toParent?.children
        ? toParent.children.indexOf(child)
        : items.indexOf(child)) < originalToIndex
    ) {
      toIndex -= 1;
    }
  }

  traversal({ children: items }, { inorder, postorder });

  const inOrderItems = removedItems.toSorted((a, b) =>
    (inOrderKeys.get(a.key) ?? 0) > (inOrderKeys.get(b.key) ?? 0) ? 1 : -1
  );

  // If parentKey is null, insert into the root.
  if (!toParent || toParent.key === null || toParent.key === undefined) {
    for (const movedNode of inOrderItems) {
      addNode(movedNode, newMap);
    }

    return {
      items: [
        ...newItems.slice(0, toIndex),
        ...inOrderItems,
        ...newItems.slice(toIndex),
      ],
      nodeMap: newMap,
    };
  }

  // Otherwise, update the parent node and its ancestors.
  return updateTree(
    newItems,
    toParent.key,
    (parentNode) => ({
      children: [
        ...(parentNode.children ?? []).slice(0, toIndex),
        ...inOrderItems,
        ...(parentNode.children ?? []).slice(toIndex),
      ],
      key: parentNode.key,
      parentKey: parentNode.parentKey,
      value: parentNode.value,
    }),
    newMap
  );
}
