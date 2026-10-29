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
 * Derived from Adobe React Spectrum: packages/react-aria/src/collections/Document.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { Key, Node } from "@solid2-aria/types-shared";
import type { Element as SolidElement } from "solid-js";

import type { CSSProperties, Ref } from "../types";
import { isPresent } from "../utils/is-present";
import { requireValue } from "../utils/require-value";
import { getTruthyValue, isTruthy } from "../utils/truthy";
import type {
  BaseCollection,
  CollectionNode,
  Mutable,
} from "./base-collection";
import type { CollectionNodeClass } from "./collection-builder";

// Mutable descriptor nodes collect item structure before the visible DOM renders.
// Updates copy affected nodes into immutable snapshots for selection, navigation, and virtualization.
// Subscriptions coalesce writes; readers finalize the pending snapshot after the tree update settles.
/**
 * A mutable node in the fake DOM tree. When mutated, it marks itself as dirty
 * and queues an update with the owner document.
 */
export class BaseNode<T> implements Pick<
  EventTarget,
  "addEventListener" | "removeEventListener"
> {
  private _firstChild: ElementNode<T> | null = null;
  private _lastChild: ElementNode<T> | null = null;
  private _previousSibling: ElementNode<T> | null = null;
  private _nextSibling: ElementNode<T> | null = null;
  private _parentNode: BaseNode<T> | null = null;
  private _minInvalidChildIndex: ElementNode<T> | null = null;
  ownerDocument: Document<T, BaseCollection<T>>;
  constructor(ownerDocument: Document<T, BaseCollection<T>>) {
    this.ownerDocument = ownerDocument;
  }
  *[Symbol.iterator](): Iterator<ElementNode<T>> {
    let node = this.firstChild;

    while (node) {
      yield node;
      node = node.nextSibling;
    }
  }
  get firstChild(): ElementNode<T> | null {
    return this._firstChild;
  }
  set firstChild(firstChild: ElementNode<T> | null) {
    this._firstChild = firstChild;
    this.ownerDocument.markDirty(this);
  }
  get lastChild(): ElementNode<T> | null {
    return this._lastChild;
  }
  set lastChild(lastChild: ElementNode<T> | null) {
    this._lastChild = lastChild;
    this.ownerDocument.markDirty(this);
  }
  get previousSibling(): ElementNode<T> | null {
    return this._previousSibling;
  }
  set previousSibling(previousSibling: ElementNode<T> | null) {
    this._previousSibling = previousSibling;
    this.ownerDocument.markDirty(this);
  }
  get nextSibling(): ElementNode<T> | null {
    return this._nextSibling;
  }
  set nextSibling(nextSibling: ElementNode<T> | null) {
    this._nextSibling = nextSibling;
    this.ownerDocument.markDirty(this);
  }
  get parentNode(): BaseNode<T> | null {
    return this._parentNode;
  }
  set parentNode(parentNode: BaseNode<T> | null) {
    this._parentNode = parentNode;
    this.ownerDocument.markDirty(this);
  }
  get isConnected(): boolean {
    return getTruthyValue(this.parentNode?.isConnected) ?? false;
  }
  private invalidateChildIndices(child: ElementNode<T>): void {
    if (
      !isPresent(this._minInvalidChildIndex) ||
      !this._minInvalidChildIndex.isConnected ||
      child.index < this._minInvalidChildIndex.index
    ) {
      this._minInvalidChildIndex = child;
      this.ownerDocument.markDirty(this);
    }
  }
  updateChildIndices(): void {
    let node = this._minInvalidChildIndex;

    while (node) {
      node.index = node.previousSibling ? node.previousSibling.index + 1 : 0;
      node = node.nextSibling;
    }

    this._minInvalidChildIndex = null;
  }
  appendChild(child: ElementNode<T>): void {
    if (child.parentNode) {
      // oxlint-disable-next-line unicorn/prefer-dom-node-remove -- Collection and focus-tree nodes implement their own parent/child protocol.
      child.parentNode.removeChild(child);
    }

    this.firstChild ??= child;

    if (this.lastChild) {
      this.lastChild.nextSibling = child;
      child.index = this.lastChild.index + 1;
      child.previousSibling = this.lastChild;
    } else {
      child.previousSibling = null;
      child.index = 0;
    }

    child.parentNode = this;
    child.nextSibling = null;
    this.lastChild = child;
    this.ownerDocument.markDirty(this);

    if (this.isConnected) {
      this.ownerDocument.queueUpdate();
    }
  }
  insertBefore(newNode: ElementNode<T>, referenceNode: ElementNode<T>): void {
    if (!isPresent(referenceNode)) {
      // oxlint-disable-next-line unicorn/prefer-dom-node-append -- Collection nodes implement the custom appendChild API.
      this.appendChild(newNode);

      return;
    }

    if (newNode.parentNode) {
      // oxlint-disable-next-line unicorn/prefer-dom-node-remove -- Collection and focus-tree nodes implement their own parent/child protocol.
      newNode.parentNode.removeChild(newNode);
    }

    newNode.nextSibling = referenceNode;
    newNode.previousSibling = referenceNode.previousSibling;
    // Ensure that the newNode's index is less than that of the reference node so that
    // invalidateChildIndices will properly use the newNode as the _minInvalidChildIndex, thus making sure
    // we will properly update the indexes of all sibiling nodes after the newNode. The value here doesn't matter
    // since updateChildIndices should calculate the proper indexes.
    newNode.index = referenceNode.index - 1;

    if (this.firstChild === referenceNode) {
      this.firstChild = newNode;
    } else if (referenceNode.previousSibling) {
      referenceNode.previousSibling.nextSibling = newNode;
    }

    referenceNode.previousSibling = newNode;
    newNode.parentNode = referenceNode.parentNode;
    this.invalidateChildIndices(newNode);

    if (this.isConnected) {
      this.ownerDocument.queueUpdate();
    }
  }
  removeChild(child: ElementNode<T>): void {
    if (child.parentNode !== this) {
      return;
    }

    if (this._minInvalidChildIndex === child) {
      this._minInvalidChildIndex = null;
    }

    if (child.nextSibling) {
      this.invalidateChildIndices(child.nextSibling);
      child.nextSibling.previousSibling = child.previousSibling;
    }

    if (child.previousSibling) {
      child.previousSibling.nextSibling = child.nextSibling;
    }

    if (this.firstChild === child) {
      this.firstChild = child.nextSibling;
    }

    if (this.lastChild === child) {
      this.lastChild = child.previousSibling;
    }

    child.parentNode = null;
    child.nextSibling = null;
    child.previousSibling = null;
    child.index = 0;
    this.ownerDocument.markDirty(child);

    if (this.isConnected) {
      this.ownerDocument.queueUpdate();
    }
  }
  addEventListener(): void {
    /* empty */
  }
  removeEventListener(): void {
    /* empty */
  }
  get previousVisibleSibling(): ElementNode<T> | null {
    let node = this.previousSibling;

    while (node && node.isHidden) {
      node = node.previousSibling;
    }

    return node;
  }
  get nextVisibleSibling(): ElementNode<T> | null {
    let node = this.nextSibling;

    while (node && node.isHidden) {
      node = node.nextSibling;
    }

    return node;
  }
  get firstVisibleChild(): ElementNode<T> | null {
    let node = this.firstChild;

    while (node && node.isHidden) {
      node = node.nextSibling;
    }

    return node;
  }
  get lastVisibleChild(): ElementNode<T> | null {
    let node = this.lastChild;

    while (node && node.isHidden) {
      node = node.previousSibling;
    }

    return node;
  }
}

/**
 * A mutable element node in the fake DOM tree. It owns an immutable
 * Collection Node which is copied on write.
 */
export class ElementNode<T>
  extends BaseNode<T>
  implements
    Pick<Element, "setAttribute" | "setAttributeNS" | "removeAttribute">
{
  // Collection descriptors are non-element nodes.
  nodeType = 8;
  node: CollectionNode<T> | null;
  isMutated = true;
  private _index = 0;
  isHidden = false;
  constructor(type: string, ownerDocument: Document<T, BaseCollection<T>>) {
    super(ownerDocument);
    this.node = null;
  }
  get index(): number {
    return this._index;
  }
  set index(index: number) {
    this._index = index;
    this.ownerDocument.markDirty(this);
  }
  get level(): number {
    if (this.parentNode instanceof ElementNode) {
      return (
        this.parentNode.level + (this.parentNode.node?.type === "item" ? 1 : 0)
      );
    }

    return 0;
  }
  /**
   * Lazily gets a mutable instance of a Node. If the node has already
   * been cloned during this update cycle, it just returns the existing one.
   */
  private getMutableNode(): Mutable<CollectionNode<T>> | null {
    if (!isPresent(this.node)) {
      return null;
    }

    if (!this.isMutated) {
      this.node = this.node.clone();
      this.isMutated = true;
    }

    this.ownerDocument.markDirty(this);

    return this.node;
  }
  updateNode(): void {
    const nextSibling = this.nextVisibleSibling;
    const node = this.getMutableNode();

    if (!isPresent(node)) {
      return;
    }

    node.index = this.index;
    node.level = this.level;
    node.parentKey =
      this.parentNode instanceof ElementNode
        ? (this.parentNode.node?.key ?? null)
        : null;
    node.prevKey = this.previousVisibleSibling?.node?.key ?? null;
    node.nextKey = nextSibling?.node?.key ?? null;
    node.hasChildNodes = !!this.firstChild;
    node.firstChildKey = this.firstVisibleChild?.node?.key ?? null;
    node.lastChildKey = this.lastVisibleChild?.node?.key ?? null;

    ElementNode.updateColumnIndex(node, nextSibling);
  }

  private static updateColumnIndex<ItemValue>(
    node: Mutable<CollectionNode<ItemValue>>,
    nextSibling: ElementNode<ItemValue> | null
  ): void {
    // Update the colIndex of sibling nodes if this node has a colSpan.
    if ((isPresent(node.colSpan) || isPresent(node.colIndex)) && nextSibling) {
      // This queues the next sibling for update, which means this happens recursively.
      const nextColIndex = (node.colIndex ?? node.index) + (node.colSpan ?? 1);

      if (
        isPresent(nextSibling.node) &&
        nextColIndex !== nextSibling.node.colIndex
      ) {
        const siblingNode = nextSibling.getMutableNode();
        requireValue(siblingNode, "Expected siblingNode").colIndex =
          nextColIndex;
      }
    }
  }

  // oxlint-disable-next-line typescript/no-unnecessary-type-parameters -- Preserve arbitrary component fields while validating collection metadata.
  setProps<E extends Element, Props extends object>(
    obj: Props & {
      children?: unknown;
      value?: T;
      id?: Key;
      textValue?: string;
      "aria-label"?: string;
      colSpan?: number;
    },
    ref: Ref<E>,
    CollectionNodeClass: CollectionNodeClass<T>,
    rendered?: SolidElement,
    render?: (node: Node<T>) => SolidElement
  ): void {
    let node: Mutable<CollectionNode<T>>;
    const { value, textValue, id, ...rest } = obj;
    const props = { ...rest, ref };

    if (isPresent(this.node)) {
      node = requireValue(
        this.getMutableNode(),
        "Expected this.getMutableNode()"
      );
    } else {
      const key = id ?? `react-aria-${this.ownerDocument.nodeId}`;

      if (!isPresent(id)) {
        this.ownerDocument.nodeId += 1;
      }

      node = new CollectionNodeClass(key);
      this.node = node;
    }

    node.props = props;
    node.rendered = rendered;
    node.render = render;
    node.value = value ?? null;

    if (isTruthy(obj["aria-label"])) {
      node["aria-label"] = obj["aria-label"];
    }

    node.textValue =
      getTruthyValue(
        getTruthyValue(
          getTruthyValue(textValue) ??
            (typeof props.children === "string" ? props.children : "")
        ) ?? obj["aria-label"]
      ) ?? "";

    if (isPresent(id) && id !== node.key) {
      throw new Error("Cannot change the id of an item");
    }

    if (isPresent(props.colSpan)) {
      node.colSpan = props.colSpan;
    }

    if (this.isConnected) {
      this.ownerDocument.queueUpdate();
    }
  }
  get style(): CSSProperties {
    // Hidden descriptor subtrees do not contribute visible collection items.
    // We'll handle this by setting the element to hidden and invalidating
    // its siblings/parent. Hidden elements remain in the Document, but
    // are removed from the Collection.
    // oxlint-disable-next-line typescript/no-this-alias, unicorn/no-this-assignment -- The style object accessors must retain the owning fake DOM element.
    const element = this;

    return {
      get display() {
        return element.isHidden ? "none" : "";
      },
      set display(value) {
        const isHidden = value === "none";

        if (element.isHidden !== isHidden) {
          // Mark parent node dirty if this element is currently the first or last visible child.
          if (
            element.parentNode?.firstVisibleChild === element ||
            element.parentNode?.lastVisibleChild === element
          ) {
            element.ownerDocument.markDirty(element.parentNode);
          }

          // Mark sibling visible elements dirty.
          const prev = element.previousVisibleSibling;
          const next = element.nextVisibleSibling;

          if (prev) {
            element.ownerDocument.markDirty(prev);
          }

          if (next) {
            element.ownerDocument.markDirty(next);
          }

          // Mark self dirty.
          element.isHidden = isHidden;
          element.ownerDocument.markDirty(element);
        }
      },
    };
  }
  hasAttribute(): void {
    /* empty */
  }
  setAttribute(): void {
    /* empty */
  }
  setAttributeNS(): void {
    /* empty */
  }
  removeAttribute(): void {
    /* empty */
  }
}

/**
 * A mutable Document in the fake DOM. It owns an immutable Collection instance,
 * which is lazily copied on write during updates.
 */
export class Document<
  T,
  C extends BaseCollection<T> = BaseCollection<T>,
> extends BaseNode<T> {
  // DOCUMENT_FRAGMENT_NODE
  nodeType = 11;
  override ownerDocument: Document<T, C> = this;
  dirtyNodes = new Set<BaseNode<T>>();
  isSSR = false;
  nodeId = 0;
  nodesByProps: WeakMap<object, ElementNode<T>> = new WeakMap<
    object,
    ElementNode<T>
  >();
  private readonly keyOwners = new Map<Key, ElementNode<T>>();
  private collection: C;
  private nextCollection: C | null = null;
  private readonly subscriptions = new Set<() => void>();
  private queuedRender = false;
  private inSubscription = false;
  constructor(collection: C) {
    // @ts-expect-error The root document initializes its self reference after the base constructor.
    super(null);
    this.collection = collection;
    this.nextCollection = collection;
  }
  override get isConnected(): boolean {
    return true;
  }
  createElement(type: string): ElementNode<T> {
    return new ElementNode(type, this);
  }
  private getMutableCollection() {
    this.nextCollection ??= this.collection.clone();

    return this.nextCollection;
  }
  markDirty(node: BaseNode<T>): void {
    this.dirtyNodes.add(node);
  }
  private addNode(element: ElementNode<T>): void {
    if (
      element.isHidden ||
      element.node === null ||
      element.node === undefined
    ) {
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      // Two elements with the same key would corrupt the linked list of sibling keys, which
      // silently drops items or makes key traversal loop forever. Removed and hidden elements
      // release their key in removeNode before unknown node is added, so a different owner here
      // is a live duplicate.
      const { key } = element.node;
      const owner = this.keyOwners.get(key);

      if (owner && owner !== element) {
        throw new Error(
          `Duplicate key "${String(key)}" found in collection. Every item in a collection must have a unique key.`
        );
      }

      this.keyOwners.set(key, element);
    }

    const collection = this.getMutableCollection();

    if (!collection.getItem(element.node.key)) {
      for (const child of element) {
        this.addNode(child);
      }
    }

    collection.addNode(element.node);
  }
  private removeNode(node: ElementNode<T>): void {
    for (const child of node) {
      this.removeNode(child);
    }

    if (node.node) {
      const collection = this.getMutableCollection();
      collection.removeNode(node.node.key);

      if (
        process.env.NODE_ENV !== "production" &&
        this.keyOwners.get(node.node.key) === node
      ) {
        this.keyOwners.delete(node.node.key);
      }
    }
  }
  /** Finalizes the collection update, updating all nodes and freezing the collection. */
  getCollection(): C {
    // If in a subscription update, return return the existing collection.
    // The next collection read finalizes the completed descriptor updates.
    if (this.inSubscription) {
      return this.collection;
    }

    // Reset queuedRender to false when getCollection is called during render.
    this.queuedRender = false;
    this.updateCollection();

    return this.collection;
  }
  updateCollection(): void {
    // First, remove disconnected nodes and update the indices of dirty element children.
    for (const element of this.dirtyNodes) {
      if (
        isElementNode(element) &&
        (!element.isConnected || element.isHidden)
      ) {
        this.removeNode(element);
      } else {
        element.updateChildIndices();
      }
    }

    // Next, update dirty collection nodes.
    for (const element of this.dirtyNodes) {
      if (isElementNode(element)) {
        if (element.isConnected && !element.isHidden) {
          element.updateNode();
          this.addNode(element);
        }

        if (element.node) {
          this.dirtyNodes.delete(element);
        }

        element.isMutated = false;
      } else {
        this.dirtyNodes.delete(element);
      }
    }

    // Finally, update the collection.
    if (this.nextCollection) {
      this.nextCollection.commit(
        this.firstVisibleChild?.node?.key ?? null,
        this.lastVisibleChild?.node?.key ?? null,
        this.isSSR
      );

      if (!this.isSSR) {
        this.collection = this.nextCollection;
        this.nextCollection = null;
      }
    }
  }
  queueUpdate(): void {
    if (this.dirtyNodes.size === 0 || this.queuedRender) {
      return;
    }

    // Only trigger subscriptions once during an update, when the first item changes.
    // A subscriber may read immediately; defer finalization until the descriptor update completes.
    // The first later read clears queuedRender and publishes the completed snapshot.
    this.queuedRender = true;
    this.inSubscription = true;

    // A new snapshot identity notifies reactive readers after the remaining node writes finish.
    if (!this.isSSR) {
      this.collection = this.collection.clone();
    }

    for (const fn of this.subscriptions) {
      fn();
    }

    this.inSubscription = false;
  }
  subscribe(fn: () => void) {
    this.subscriptions.add(fn);

    // A new subscriber must also observe updates queued while it was detached.
    if (this.queuedRender) {
      fn();
    }

    return () => {
      this.subscriptions.delete(fn);
    };
  }
  resetAfterSSR(): void {
    if (this.isSSR) {
      this.isSSR = false;
      this.firstChild = null;
      this.lastChild = null;
      this.nodeId = 0;
      this.keyOwners.clear();
    }
  }
}

function isElementNode<T>(node: BaseNode<T>): node is ElementNode<T> {
  return node instanceof ElementNode;
}
