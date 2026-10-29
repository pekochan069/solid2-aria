/*
 * Copyright 2022 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/Collection.tsx.
 * Modified for Solid Aria: adapted collection ownership, contexts, accessibility primitives, and reactive properties for Solid 2; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createBranchComponent } from "@solid2-aria/core/collections/collection-builder";
import { createCachedChildren } from "@solid2-aria/core/collections/create-cached-children";
import type {
  CollectionBase,
  DropTargetDelegate,
  ItemDropTarget,
  Key,
  LayoutDelegate,
  Collection as ICollection,
  Node,
  SelectionBehavior,
  SelectionMode,
  SectionProps as SharedSectionProps,
} from "@solid2-aria/types-shared";
import type { GlobalDOMAttributes } from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";
import { untrack, createContext, useContext } from "solid-js";
import type { Accessor, Component } from "solid-js";

import { assignRef } from "./utils";
import type { Ref, StyleProps } from "./utils";

export const SectionContext = createContext<SectionContextValue | null>(null);

export interface CollectionProps<T> extends Omit<
  CollectionBase<T>,
  "children"
> {
  /** The contents of the collection. */
  children?: JSX.Element | ((item: T) => JSX.Element);
  /** Values that should invalidate the item cache when using dynamic collections. */
  // oxlint-disable-next-line typescript/no-explicit-any -- Collection contexts erase item types; each typed factory restores its owner's item contract.
  dependencies?: readonly any[];
}

export interface ItemRenderProps {
  /**
   * Whether the item is currently hovered with a mouse.
   *
   * @selector [data-hovered]
   */
  isHovered: boolean;
  /**
   * Whether the item is currently in a pressed state.
   *
   * @selector [data-pressed]
   */
  isPressed: boolean;
  /**
   * Whether the item is currently selected.
   *
   * @selector [data-selected]
   */
  isSelected: boolean;
  /**
   * Whether the item is currently focused.
   *
   * @selector [data-focused]
   */
  isFocused: boolean;
  /**
   * Whether the item is currently keyboard focused.
   *
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean;
  /**
   * Whether the item is non-interactive, i.e. both selection and actions are disabled and the item
   * may not be focused. Dependent on `disabledKeys` and `disabledBehavior`.
   *
   * @selector [data-disabled]
   */
  isDisabled: boolean;
  /**
   * The type of selection that is allowed in the collection.
   *
   * @selector [data-selection-mode="single | multiple"]
   */
  selectionMode: SelectionMode;
  /** The selection behavior for the collection. */
  selectionBehavior: SelectionBehavior;
  /**
   * Whether the item allows dragging.
   *
   * Note: This property is only available in collection components that support drag and drop.
   * @selector [data-allows-dragging]
   */
  allowsDragging?: boolean;
  /**
   * Whether the item is currently being dragged.
   *
   * Note: This property is only available in collection components that support drag and drop.
   * @selector [data-dragging]
   */
  isDragging?: boolean;
  /**
   * Whether the item is currently an active drop target.
   *
   * Note: This property is only available in collection components that support drag and drop.
   * @selector [data-drop-target]
   */
  isDropTarget?: boolean;
}

export interface SectionProps<T>
  extends
    Omit<SharedSectionProps<T>, "children" | "title">,
    StyleProps,
    GlobalDOMAttributes<HTMLElement> {
  /** The unique id of the section. */
  id?: Key;
  /**
   * The object value that this section represents. When using dynamic collections, this is set
   * automatically.
   */
  value?: T;
  /** Static child items or a function to render children. */
  children?: JSX.Element | ((item: T) => JSX.Element);
  /** Values that should invalidate the item cache when using dynamic collections. */
  // oxlint-disable-next-line typescript/no-explicit-any -- Collection contexts erase item types; each typed factory restores its owner's item contract.
  dependencies?: readonly any[];
}

export interface CollectionBranchProps {
  /** The collection of items to render. */
  collection: ICollection<Node<unknown>>;
  /** The parent node of the items to render. */
  parent: Node<unknown>;
  /** A function that renders a drop indicator between items. */
  renderDropIndicator?: (target: ItemDropTarget) => JSX.Element;
}

export interface CollectionRootProps extends JSX.HTMLAttributes<HTMLElement> {
  /** The collection of items to render. */
  collection: ICollection<Node<unknown>>;
  /** A set of keys for items that should always be persisted in the DOM. */
  persistedKeys?: Set<Key> | null;
  /** A ref to the scroll container for the collection. */
  scrollRef?: Accessor<HTMLElement | null>;
  /** A function that renders a drop indicator between items. */
  renderDropIndicator?: (target: ItemDropTarget) => JSX.Element;
}

export interface CollectionRenderer {
  /** Whether this is a virtualized collection. */
  isVirtualized?: boolean;
  /** A delegate object that provides layout information for items in the collection. */
  layoutDelegate?: LayoutDelegate;
  /** A delegate object that provides drop targets for pointer coordinates within the collection. */
  dropTargetDelegate?: DropTargetDelegate;
  /** A component that renders the root collection items. */
  CollectionRoot: Component<CollectionRootProps>;
  /** A component that renders the child collection items. */
  CollectionBranch: Component<CollectionBranchProps>;
}

export interface SectionContextValue {
  name: string;
  render: (
    // oxlint-disable-next-line typescript/no-explicit-any -- Collection contexts erase item types; each typed factory restores its owner's item contract.
    props: SectionProps<any>,
    ref: Ref<HTMLElement>,
    node: Node<unknown>,
    defaultClass?: string
  ) => JSX.Element;
}

const SectionCollection = createBranchComponent(
  "section",
  // oxlint-disable-next-line typescript/no-explicit-any -- Collection contexts erase item types; each typed factory restores its owner's item contract.
  (props: SectionProps<any>, ref: Ref<HTMLElement>, section: Node<any>) => {
    const context = useContext(SectionContext);

    if (!context) {
      throw new Error("Section must be rendered in a collection.");
    }

    return context.render(props, ref, section, "solid2-aria-Section");
  }
);

function CollectionNodes(props: {
  collection: ICollection<Node<unknown>>;
  parent?: Node<unknown>;
  renderDropIndicator?: CollectionBranchProps["renderDropIndicator"];
}): JSX.Element {
  const content = createCachedChildren({
    children(node: Node<unknown>) {
      if (node.type === "content") {
        // oxlint-disable-next-line solid/components-return-once -- Static collection traversal and context registration are fixed when the owner is created.
        return null;
      }

      const rendered = node.render?.(node) ?? node.rendered;

      return (
        <>
          {props.renderDropIndicator && node.type === "item"
            ? props.renderDropIndicator({
                dropPosition: "before",
                key: node.key,
                type: "item",
              })
            : null}
          {rendered}
          {props.renderDropIndicator && node.type === "item"
            ? renderAfterDropIndicators(
                props.collection,
                node,
                props.renderDropIndicator
              )
            : null}
        </>
      );
    },
    get dependencies() {
      return [props.collection, props.parent, props.renderDropIndicator];
    },
    get items() {
      return props.parent
        ? props.collection.getChildren?.(props.parent.key)
        : props.collection;
    },
  });

  return <>{content()}</>;
}

export const DefaultCollectionRenderer: CollectionRenderer = {
  CollectionBranch: (props) => <CollectionNodes {...props} />,
  CollectionRoot: (props) => <CollectionNodes {...props} />,
};

export const CollectionRendererContext = createContext<CollectionRenderer>(
  DefaultCollectionRenderer
);

function shouldRenderAfter(
  node: Node<unknown>,
  next: Node<unknown> | null
): boolean {
  return (
    next === null ||
    (node.parentKey !== next.parentKey && next.level < node.level)
  );
}

export function renderAfterDropIndicators(
  collection: ICollection<Node<unknown>>,
  node: Node<unknown>,
  renderDropIndicator: (target: ItemDropTarget) => JSX.Element
): JSX.Element {
  let keyAfter = collection.getKeyAfter(node.key);

  let next =
    keyAfter === null || keyAfter === undefined
      ? null
      : collection.getItem(keyAfter);

  while (next && next.type !== "item") {
    keyAfter = collection.getKeyAfter(next.key);
    next =
      keyAfter === null || keyAfter === undefined
        ? null
        : collection.getItem(keyAfter);
  }

  let sibling =
    node.nextKey === null || node.nextKey === undefined
      ? null
      : collection.getItem(node.nextKey);

  while (sibling && sibling.type !== "item") {
    sibling =
      sibling.nextKey === null || sibling.nextKey === undefined
        ? null
        : collection.getItem(sibling.nextKey);
  }

  const result: JSX.Element[] = [];

  if (!sibling) {
    let current: Node<unknown> | null = node;

    while (current?.type === "item" && shouldRenderAfter(current, next)) {
      result.push(
        renderDropIndicator({
          dropPosition: "after",
          key: current.key,
          type: "item",
        })
      );
      current =
        current.parentKey === null || current.parentKey === undefined
          ? null
          : collection.getItem(current.parentKey);
    }
  }

  return result;
}

export function createPersistedKeys(focusedKey: Key | null): Set<Key> | null {
  return focusedKey === null || focusedKey === undefined
    ? null
    : new Set([focusedKey]);
}

export { Collection } from "@solid2-aria/core/collections/collection-builder";

export function Section<T>(
  props: SectionProps<T> & { ref?: Ref<HTMLElement> }
): JSX.Element {
  return (
    <SectionCollection
      {...props}
      ref={(element: HTMLElement) => {
        assignRef(
          untrack(() => props.ref),
          element
        );
      }}
    />
  );
}
