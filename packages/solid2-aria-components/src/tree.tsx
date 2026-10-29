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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/Tree.tsx.
 * Modified for Solid Aria: preserve flattened tree traversal with Solid collection nodes, controlled expansion, and reactive accessibility primitives; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import {
  BaseCollection,
  CollectionNode,
  LoaderNode,
  SectionNode,
} from "@solid2-aria/core/collections/base-collection";
import {
  Collection,
  CollectionBuilder,
  createBranchComponent,
  createLeafComponent,
} from "@solid2-aria/core/collections/collection-builder";
import { createCachedChildren } from "@solid2-aria/core/collections/create-cached-children";
import { createFocusRing } from "@solid2-aria/core/focus/create-focus-ring";
import { createGridListSection } from "@solid2-aria/core/gridlist/create-grid-list-section";
import { createGridListSelectionCheckbox } from "@solid2-aria/core/gridlist/create-grid-list-selection-checkbox";
import { createCollator } from "@solid2-aria/core/i18n/create-collator";
import { createLocale } from "@solid2-aria/core/i18n/i18n-provider";
import { createHover } from "@solid2-aria/core/interactions/create-hover";
import { ListKeyboardDelegate } from "@solid2-aria/core/selection/list-keyboard-delegate";
import { createTree } from "@solid2-aria/core/tree/create-tree";
import type { AriaTreeProps } from "@solid2-aria/core/tree/create-tree";
import { createTreeItem } from "@solid2-aria/core/tree/create-tree-item";
import type { AriaTreeItemOptions } from "@solid2-aria/core/tree/create-tree-item";
import { createLoadMoreSentinel } from "@solid2-aria/core/utils/create-load-more-sentinel";
import type { LoadMoreSentinelProps } from "@solid2-aria/core/utils/create-load-more-sentinel";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { isPresent } from "@solid2-aria/core/utils/is-present";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { requireValue } from "@solid2-aria/core/utils/require-value";
import { getTruthyValue, isTruthy } from "@solid2-aria/core/utils/truthy";
import { createVisuallyHidden } from "@solid2-aria/core/visually-hidden/visually-hidden";
import { createTreeState } from "@solid2-aria/stately/tree/create-tree-state";
import type { TreeState } from "@solid2-aria/stately/tree/create-tree-state";
import { createControlledSignal } from "@solid2-aria/stately/utils/create-controlled-signal";
import { getNodeProps } from "@solid2-aria/stately/utils/get-node-props";
import type {
  Key,
  Node,
  LinkDOMProps,
  HoverEvents,
  PressEvents,
  MultipleSelection,
  Expandable,
  SelectionMode,
  SelectionBehavior,
  DisabledBehavior,
} from "@solid2-aria/types-shared";
import type { GlobalDOMAttributes } from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";
import {
  merge,
  untrack,
  createSignal,
  createContext,
  useContext,
  createMemo,
  omit,
} from "solid-js";
import type { Accessor } from "solid-js";

import { ButtonContext } from "./button";
import { CheckboxContext, CheckboxFieldContext } from "./checkbox";
import {
  CollectionRendererContext,
  DefaultCollectionRenderer,
} from "./collection";
import type {
  CollectionProps,
  ItemRenderProps,
  SectionProps,
} from "./collection";
import { createCollectionItemDragAndDrop } from "./collection-dnd";
import type { DragAndDropHooks } from "./create-drag-and-drop";
import {
  DragAndDropContext,
  DropIndicatorContext,
  createDndPersistedKeys,
  createRenderDropIndicator,
} from "./drag-and-drop";
import {
  GridListHeader,
  GridListHeaderContext,
  GridListHeaderInnerContext,
  RootDropIndicator,
  createCollectionDragAndDrop,
  CollectionDropIndicator,
} from "./grid-list";
import type { GridListHeaderProps } from "./grid-list";
import { SelectionIndicatorContext } from "./selection-indicator";
import { TreeDropTargetDelegate } from "./tree-drop-target-delegate";
import {
  assignRef,
  dom,
  DEFAULT_SLOT,
  createContextProps,
  createRenderProps,
} from "./utils";
import type {
  ChildrenOrFunction,
  ClassOrFunction,
  ContextValue,
  RenderProps,
  StyleRenderProps,
  SlotProps,
  DOMRenderProps,
  Ref,
} from "./utils";

class TreeCollection<T> extends BaseCollection<T> {
  private expandedKeys = new Set<Key>();

  withExpandedKeys(lastExpandedKeys: Set<Key>, expandedKeys: Set<Key>) {
    const collection = this.clone();
    collection.expandedKeys = expandedKeys;

    // Clone ancestor section nodes so React knows to re-render since the same item won't cause a new render but a clone creating a new object with the same value will
    // Without this change, the items won't expand and collapse when virtualized inside a section
    TreeCollection.cloneAncestorSections(
      expandedKeys,
      lastExpandedKeys,
      collection
    );
    TreeCollection.cloneAncestorSections(
      lastExpandedKeys,
      expandedKeys,
      collection
    );

    collection.frozen = this.frozen;

    return collection;
  }

  // diff lastExpandedKeys and expandedKeys so we only clone what has changed
  private static cloneAncestorSections<T>(
    keys: Iterable<Key>,
    excludeSet: Set<Key>,
    collection: TreeCollection<T>
  ) {
    for (const key of keys) {
      if (!excludeSet.has(key)) {
        let currentKey: Key | null = key;

        while (isPresent(currentKey)) {
          const item: CollectionNode<T> = requireValue(
            collection.getItem(currentKey),
            "Expected collection.getItem(currentKey)"
          );

          if (item?.type === "section") {
            collection.keyMap.set(currentKey, item.clone());
            break;
          } else {
            currentKey = item?.parentKey ?? null;
          }
        }
      }
    }
  }

  override *[Symbol.iterator]() {
    const firstKey = this.getFirstKey();

    let node: Node<T> | null = isPresent(firstKey)
      ? this.getItem(firstKey)
      : null;

    while (node) {
      yield node;

      if (node.type === "section") {
        node = isPresent(node.nextKey) ? this.getItem(node.nextKey) : null;
      } else {
        // This will include both item and content nodes
        // We handle the content nodes in useCollectionRenderer and ListLayout
        const key = this.getKeyAfter(node.key);
        node = isPresent(key) ? this.getItem(key) : null;
      }
    }
  }

  override getLastKey() {
    // Find the deepest expanded child. We don't use collection.getLastKey() here
    // because that will return the deepest child regardless of expandedKeys.
    // Instead, start from the last top-level key and walk down.
    const key = this.lastKey;

    if (!isPresent(key)) {
      return null;
    }

    let node = requireValue(this.getItem(key), "Expected this.getItem(key)");

    while (
      isPresent(node?.lastChildKey) &&
      (node.type !== "item" || this.expandedKeys.has(node.key))
    ) {
      node = requireValue(
        this.getItem(node.lastChildKey),
        "Expected this.getItem(node.lastChildKey)"
      );
    }

    return node?.key;
  }

  override getKeyAfter(key: Key) {
    let node = requireValue(this.getItem(key), "Expected this.getItem(key)");

    if (!isTruthy(node)) {
      return null;
    }

    if (
      (this.expandedKeys.has(node.key) || node.type !== "item") &&
      isPresent(node.firstChildKey)
    ) {
      return node.firstChildKey;
    }

    while (isTruthy(node)) {
      if (isPresent(node.nextKey)) {
        return node.nextKey;
      }

      if (!isPresent(node.parentKey)) {
        return null;
      }

      node = requireValue(
        this.getItem(node.parentKey),
        "Expected this.getItem(node.parentKey)"
      );
    }

    return null;
  }

  override getKeyBefore(key: Key) {
    let node = requireValue(this.getItem(key), "Expected this.getItem(key)");

    if (!isTruthy(node)) {
      return null;
    }

    if (isPresent(node.prevKey)) {
      node = requireValue(
        this.getItem(node.prevKey),
        "Expected this.getItem(node.prevKey)"
      );

      // If the lastChildKey is expanded, check its lastChildKey
      while (
        Boolean(node) &&
        (node.type !== "item" || this.expandedKeys.has(node.key)) &&
        isPresent(node.lastChildKey)
      ) {
        node = requireValue(
          this.getItem(node.lastChildKey),
          "Expected this.getItem(node.lastChildKey)"
        );
      }

      return node?.key ?? null;
    }

    return node.parentKey;
  }

  override *getChildren(key: Key): IterableIterator<CollectionNode<T>> {
    const parent = this.getItem(key);

    let node = isPresent(parent?.firstChildKey)
      ? this.getItem(parent.firstChildKey)
      : null;

    if (parent?.type === "section") {
      while (node && node.key !== parent.nextKey) {
        yield node;
        const nextKey = this.getKeyAfter(node.key);
        node = isPresent(nextKey) ? this.getItem(nextKey) : null;
      }

      return;
    }

    while (node) {
      yield node;
      node = isPresent(node.nextKey) ? this.getItem(node.nextKey) : null;
    }
  }

  getTextValue(key: Key): string {
    const item = this.getItem(key);

    return item ? item.textValue : "";
  }
}

export interface TreeRenderProps {
  isEmpty: boolean;

  isFocused: boolean;

  isFocusVisible: boolean;

  selectionMode: SelectionMode;

  allowsDragging: boolean;

  isDropTarget: boolean;

  state: TreeState<unknown>;
}

export type TreeEmptyStateRenderProps = Omit<TreeRenderProps, "isEmpty">;

export interface TreeProps<T>
  extends
    Omit<AriaTreeProps<T>, "children">,
    MultipleSelection,
    CollectionProps<T>,
    StyleRenderProps<TreeRenderProps>,
    SlotProps,
    Expandable,
    GlobalDOMAttributes<HTMLDivElement> {
  class?: ClassOrFunction<TreeRenderProps>;

  selectionBehavior?: SelectionBehavior;

  renderEmptyState?: (props: TreeEmptyStateRenderProps) => JSX.Element;

  disabledBehavior?: DisabledBehavior;

  dragAndDropHooks?: DragAndDropHooks<NoInfer<T>>;
}

export interface TreeItemRenderProps extends ItemRenderProps {
  isExpanded: boolean;

  hasChildItems: boolean;

  level: number;

  isFocusVisibleWithin: boolean;

  state: TreeState<unknown>;

  id: Key;
}

export type TreeItemContentRenderProps = TreeItemRenderProps;

export interface TreeItemContentProps {
  children: ChildrenOrFunction<TreeItemContentRenderProps>;
}

export interface TreeItemProps<T = object>
  extends
    StyleRenderProps<TreeItemRenderProps>,
    LinkDOMProps,
    HoverEvents,
    PressEvents,
    Pick<
      AriaTreeItemOptions,
      "hasChildItems" | "focusMode" | "allowsArrowNavigation"
    >,
    Omit<GlobalDOMAttributes<HTMLDivElement>, "onClick"> {
  class?: ClassOrFunction<TreeItemRenderProps>;

  id?: Key;

  value?: T;

  textValue: string;

  "aria-label"?: string;

  children: JSX.Element;

  isDisabled?: boolean;

  onAction?: () => void;
}

export interface TreeLoadMoreItemRenderProps {
  level: number;
}

export interface TreeLoadMoreItemProps
  extends
    Omit<LoadMoreSentinelProps, "collection" | "direction">,
    RenderProps<TreeLoadMoreItemRenderProps> {
  class?: ClassOrFunction<TreeLoadMoreItemRenderProps>;

  children?: ChildrenOrFunction<TreeLoadMoreItemRenderProps>;

  isLoading?: boolean;
}

export interface TreeSectionProps<T>
  extends SectionProps<T>, DOMRenderProps<"div", undefined> {}

export type TreeHeaderProps = GridListHeaderProps;

export const TreeContext =
  // oxlint-disable-next-line typescript/no-explicit-any -- The collection owner and its descendants share one item type through this context.
  createContext<ContextValue<TreeProps<any>, HTMLDivElement>>(null);

// oxlint-disable-next-line typescript/no-explicit-any -- The collection owner and its descendants share one item type through this context.
export const TreeStateContext = createContext<TreeState<any> | null>(null);

export const TreeItemContentContext =
  createContext<TreeItemContentRenderProps | null>(null);

export function Tree<T>(input: TreeProps<T> & { ref?: Ref<HTMLDivElement> }) {
  const [props, ref, setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    TreeContext
  );

  return (
    <CollectionBuilder
      createCollection={() => new TreeCollection<T>()}
      content={<Collection {...props} />}
    >
      {(collection) => (
        <TreeInner
          props={props}
          collection={collection}
          elementRef={ref}
          setElementRef={(element: HTMLDivElement) => {
            setRef(element);
          }}
        />
      )}
    </CollectionBuilder>
  );
}

function TreeInner<T>(outer: {
  props: TreeProps<T>;
  collection: TreeCollection<T>;
  elementRef: Accessor<HTMLDivElement | null>;
  setElementRef: (element: HTMLDivElement) => void;
}) {
  const { props } = untrack(() => outer);
  const renderer = useContext(CollectionRendererContext);

  const [expanded, setExpanded] = createControlledSignal(
    () => (props.expandedKeys ? new Set(props.expandedKeys) : undefined),
    untrack(() => new Set(props.defaultExpandedKeys)),
    (keys) => {
      props.onExpandedChange?.(keys);
    }
  );

  const collection = createMemo(() =>
    outer.collection.withExpandedKeys(new Set(), expanded())
  );

  // oxlint-disable-next-line typescript/no-explicit-any -- The public collection accepts primitive items; this state adapter only reads their keyed nodes.
  const state = createTreeState<any>(
    mergeProps(props, {
      get collection() {
        return collection();
      },
      get expandedKeys() {
        return expanded();
      },
      onExpandedChange: setExpanded,
    })
  );

  const locale = createLocale();
  const collator = createCollator({ sensitivity: "base", usage: "search" });

  const delegate = createMemo(
    () =>
      new ListKeyboardDelegate({
        collator,
        get collection() {
          return state.collection;
        },
        get disabledBehavior() {
          return state.selectionManager.disabledBehavior;
        },
        get disabledKeys() {
          return state.disabledKeys;
        },
        layoutDelegate: renderer.layoutDelegate,
        ref: outer.elementRef,
      })
  );

  const aria = createTree(
    mergeProps(props, {
      get isVirtualized() {
        return renderer.isVirtualized;
      },
      get keyboardDelegate() {
        return delegate();
      },
    }),
    state,
    untrack(() => outer.elementRef)
  );

  const treeDelegate = new TreeDropTargetDelegate<T>();

  const hooks = untrack(() => props.dragAndDropHooks);

  if (hooks?.createDroppableCollectionState) {
    treeDelegate.setup(
      hooks.dropTargetDelegate ??
        renderer.dropTargetDelegate ??
        new hooks.ListDropTargetDelegate(
          {
            [Symbol.iterator]() {
              return state.collection[Symbol.iterator]();
            },
          },
          untrack(() => outer.elementRef)
        ),
      state,
      locale.direction
    );
  }

  const dnd = createCollectionDragAndDrop({
    get collection() {
      return state.collection;
    },
    dropTargetDelegate: treeDelegate,
    get hooks() {
      return props.dragAndDropHooks;
    },
    get keyboardDelegate() {
      return delegate();
    },
    onDropActivate: (event) => {
      if (event.target.type === "item") {
        const { key } = event.target;
        const item = state.collection.getItem(key);

        const expandable =
          isTruthy(getNodeProps(item).hasChildItems) ||
          [...(state.collection.getChildren?.(key) ?? [])].some(
            (child) => child.type === "item"
          );

        if (
          expandable &&
          (!state.expandedKeys.has(key) ||
            props.dragAndDropHooks?.isVirtualDragging?.() === true)
        ) {
          state.toggleKey(key);
        }
      }
    },
    onKeyDown: (event) => {
      const target = dnd.dropState?.target;

      if (target?.type !== "item" || target.dropPosition !== "on") {
        return;
      }

      const isExpanded = state.expandedKeys.has(target.key);

      if (
        (event.key ===
          (locale.direction === "rtl" ? "ArrowLeft" : "ArrowRight") &&
          !isExpanded) ||
        (event.key ===
          (locale.direction === "rtl" ? "ArrowRight" : "ArrowLeft") &&
          isExpanded)
      ) {
        state.toggleKey(target.key);
      }
    },
    get ref() {
      return outer.elementRef;
    },
    get selectionManager() {
      return state.selectionManager;
    },
  });

  const focus = createFocusRing();

  const values: TreeRenderProps = {
    get allowsDragging() {
      return !!dnd.dragState;
    },
    get isDropTarget() {
      return dnd.dropState?.isDropTarget({ type: "root" }) === true;
    },
    get isEmpty() {
      return ![...state.collection].some((node) => node.type === "item");
    },
    get isFocusVisible() {
      return focus.isFocusVisible;
    },
    get isFocused() {
      return focus.isFocused;
    },
    get selectionMode() {
      return state.selectionManager.selectionMode;
    },
    state,
  };

  const render = createRenderProps(
    mergeProps(props, {
      children: undefined,
      defaultClass: "solid2-aria-Tree",
      values,
    })
  );

  const Root = renderer.CollectionRoot;

  return (
    <dom.div
      {...mergeProps(
        filterDOMProps(props, { global: true }),
        render,
        merge(() => aria.gridProps ?? {}),
        merge(() => focus.focusProps ?? {}),
        merge(() => dnd.collectionProps ?? {})
      )}
      ref={(element: HTMLDivElement) => {
        outer.setElementRef(element);
      }}
      slot={props.slot ?? undefined}
      data-empty={values.isEmpty || undefined}
      data-focused={focus.isFocused || undefined}
      data-focus-visible={focus.isFocusVisible || undefined}
      data-drop-target={values.isDropTarget || undefined}
    >
      <TreeStateContext value={state}>
        <DragAndDropContext value={dnd}>
          <DropIndicatorContext
            value={{
              render: (indicatorProps, ref) => (
                <CollectionDropIndicator {...indicatorProps} ref={ref} />
              ),
            }}
          >
            {dnd.dropState && <RootDropIndicator />}
            <Root
              collection={state.collection}
              scrollRef={outer.elementRef}
              persistedKeys={createDndPersistedKeys(
                state.selectionManager,
                props.dragAndDropHooks,
                dnd.dropState
              )}
              renderDropIndicator={createRenderDropIndicator(
                props.dragAndDropHooks,
                dnd.dropState
              )}
            />
          </DropIndicatorContext>
        </DragAndDropContext>
      </TreeStateContext>
      {values.isEmpty && props.renderEmptyState && (
        <div role="row">
          <div role="gridcell">{props.renderEmptyState(values)}</div>
        </div>
      )}
      {dnd.preview}
    </dom.div>
  );
}

class TreeContentNode extends CollectionNode<unknown> {
  static override readonly type = "content";
}

class TreeItemNode extends CollectionNode<unknown> {
  static override readonly type = "item";
}

export const TreeItemContent = createLeafComponent(
  TreeContentNode,
  (props: TreeItemContentProps) => {
    const values = useContext(TreeItemContentContext);

    if (!values) {
      throw new Error("TreeItemContent must be rendered within TreeItem.");
    }

    const render = createRenderProps(mergeProps(props, { values }));

    return (
      <CollectionRendererContext value={DefaultCollectionRenderer}>
        {render.children}
      </CollectionRendererContext>
    );
  }
);

export const TreeItem = createBranchComponent(
  TreeItemNode,
  <T,>(
    props: TreeItemProps<T>,
    forwardedRef: Ref<HTMLDivElement>,
    item: Node<T>
  ) => {
    const state = requireValue(
      useContext(TreeStateContext),
      "Expected useContext(TreeStateContext)"
    );

    const dnd = useContext(DragAndDropContext);

    const [ref, setRef] = createSignal<HTMLDivElement | null>(null, {
      ownedWrite: true,
    });

    const aria = createTreeItem(
      {
        get allowsArrowNavigation() {
          return props.allowsArrowNavigation;
        },
        get focusMode() {
          return props.focusMode;
        },
        get hasChildItems() {
          return props.hasChildItems;
        },
        node: item,
        shouldSelectOnPressUp: !!dnd.dragState,
      },
      state,
      ref
    );

    const hover = createHover(
      mergeProps(props, {
        get isDisabled() {
          return !aria.allowsSelection && !aria.hasAction && !dnd.dragState;
        },
      })
    );

    const focus = createFocusRing();
    const within = createFocusRing({ within: true });
    const checkbox = createGridListSelectionCheckbox({ key: item.key }, state);

    const [dropRef, setDropRef] = createSignal<HTMLDivElement | null>(null, {
      ownedWrite: true,
    });

    const [activateRef, setActivateRef] = createSignal<HTMLDivElement | null>(
      null,
      { ownedWrite: true }
    );

    const { drag, drop } = createCollectionItemDragAndDrop(
      dnd,
      item.key,
      dropRef,
      activateRef
    );

    const values: TreeItemRenderProps = {
      get allowsDragging() {
        return !!dnd.dragState;
      },
      get hasChildItems() {
        return (
          props.hasChildItems === true ||
          [...(state.collection.getChildren?.(item.key) ?? [])].some(
            (node) => node.type === "item"
          )
        );
      },
      id: item.key,
      get isDisabled() {
        return aria.isDisabled;
      },
      get isDragging() {
        return dnd.dragState?.isDragging(item.key) === true;
      },
      get isDropTarget() {
        return drop?.isDropTarget === true;
      },
      get isExpanded() {
        return state.expandedKeys.has(item.key);
      },
      get isFocusVisible() {
        return focus.isFocusVisible;
      },
      get isFocusVisibleWithin() {
        return within.isFocusVisible;
      },
      get isFocused() {
        return aria.isFocused;
      },
      get isHovered() {
        return hover.isHovered;
      },
      get isPressed() {
        return aria.isPressed;
      },
      get isSelected() {
        return aria.isSelected;
      },
      get level() {
        return Number(aria.rowProps["aria-level"] ?? 1);
      },
      get selectionBehavior() {
        return state.selectionManager.selectionBehavior;
      },
      get selectionMode() {
        return state.selectionManager.selectionMode;
      },
      state,
    };

    const render = createRenderProps(
      mergeProps(props, {
        children: undefined,
        defaultClass: "solid2-aria-TreeItem",
        values,
      })
    );

    const hidden = createVisuallyHidden();

    return (
      <>
        {drop && !drop.isHidden && (
          <div role="row" style={{ position: "absolute" }}>
            <div role="gridcell">
              <div
                {...mergeProps(
                  merge(() => hidden.visuallyHiddenProps ?? {}),
                  merge(() => drop.dropIndicatorProps ?? {})
                )}
                role="button"
                ref={(element: HTMLDivElement) => {
                  setDropRef(element);
                }}
              />
              {values.hasChildItems && (
                <div
                  {...mergeProps(
                    merge(() => hidden.visuallyHiddenProps ?? {}),
                    merge(() => aria.expandButtonProps ?? {})
                  )}
                  role="button"
                  tabindex={-1}
                  ref={(element: HTMLDivElement) => {
                    setActivateRef(element);
                  }}
                />
              )}
            </div>
          </div>
        )}
        <dom.div
          {...mergeProps(
            omit(filterDOMProps(props, { global: true }), "id", "onClick"),
            render,
            merge(() => aria.rowProps ?? {}),
            merge(() => focus.focusProps ?? {}),
            merge(() => within.focusProps ?? {}),
            merge(() => hover.hoverProps ?? {}),
            merge(() => drag?.dragProps ?? {})
          )}
          ref={(element: HTMLDivElement) => {
            setRef(element);
          }}
          data-expanded={getTruthyValue(
            values.hasChildItems && values.isExpanded
          )}
          data-has-child-items={values.hasChildItems || undefined}
          data-level={values.level}
          data-selected={aria.isSelected || undefined}
          data-disabled={aria.isDisabled || undefined}
          data-hovered={hover.isHovered || undefined}
          data-focused={aria.isFocused || undefined}
          data-focus-visible={focus.isFocusVisible || undefined}
          data-focus-visible-within={within.isFocusVisible || undefined}
          data-pressed={aria.isPressed || undefined}
          data-allows-dragging={!!dnd.dragState || undefined}
          data-dragging={values.isDragging ?? undefined}
          data-drop-target={drop?.isDropTarget ?? undefined}
          data-selection-mode={
            state.selectionManager.selectionMode === "none"
              ? undefined
              : state.selectionManager.selectionMode
          }
        >
          <div {...aria.gridCellProps} style={{ display: "contents" }}>
            <CheckboxContext
              value={{
                slots: {
                  [DEFAULT_SLOT]: {},
                  get selection() {
                    return checkbox.checkboxProps;
                  },
                },
              }}
            >
              <CheckboxFieldContext
                value={{
                  slots: {
                    [DEFAULT_SLOT]: {},
                    get selection() {
                      return checkbox.checkboxProps;
                    },
                  },
                }}
              >
                <ButtonContext
                  value={{
                    slots: {
                      [DEFAULT_SLOT]: {},
                      chevron: mergeProps(
                        merge(() => aria.expandButtonProps ?? {}),
                        {}
                      ),
                      drag: mergeProps(
                        merge(() => drag?.dragButtonProps ?? {}),
                        {
                          style: { "pointer-events": "none" as const },
                        }
                      ),
                    },
                  }}
                >
                  <TreeItemContentContext value={values}>
                    <SelectionIndicatorContext
                      value={{
                        get isSelected() {
                          return aria.isSelected;
                        },
                      }}
                    >
                      <TreeItemChildren state={state} itemKey={item.key} />
                    </SelectionIndicatorContext>
                  </TreeItemContentContext>
                </ButtonContext>
              </CheckboxFieldContext>
            </CheckboxContext>
          </div>
        </dom.div>
      </>
    );
  },
  (props) => <>{props.children}</>
);

export const TreeLoadMoreItem = createLeafComponent(
  LoaderNode,
  (
    props: TreeLoadMoreItemProps,
    ref: Ref<HTMLDivElement>,
    item: Node<unknown>
  ) => {
    const state = requireValue(
      useContext(TreeStateContext),
      "Expected useContext(TreeStateContext)"
    );

    const [sentinel, setSentinel] = createSignal<HTMLDivElement | null>(null, {
      ownedWrite: true,
    });

    createLoadMoreSentinel(
      mergeProps(props, {
        get collection() {
          return state.collection;
        },
      }),
      sentinel
    );

    const render = createRenderProps(
      mergeProps(props, {
        get children() {
          return item.rendered;
        },
        defaultClass: "solid2-aria-TreeLoadingIndicator",
        values: { level: item.level + 1 },
      })
    );

    return (
      <>
        <div inert style={{ height: 0, position: "relative", width: 0 }}>
          <div
            ref={(element: HTMLDivElement) => {
              setSentinel(element);
            }}
            style={{ height: "1px", position: "absolute", width: "1px" }}
          />
        </div>
        {props.isLoading === true && (
          <dom.div {...render} role="row" ref={ref}>
            <div role="gridcell">{render.children}</div>
          </dom.div>
        )}
      </>
    );
  }
);

export const TreeSection = createBranchComponent(
  SectionNode,
  <T,>(
    props: TreeSectionProps<T>,
    forwardedRef: Ref<HTMLDivElement>,
    item: Node<T>
  ) => {
    const state = requireValue(
      useContext(TreeStateContext),
      "Expected useContext(TreeStateContext)"
    );

    const renderer = useContext(CollectionRendererContext);
    const Branch = renderer.CollectionBranch;

    const [ref, setRef] = createSignal<HTMLDivElement | null>(null, {
      ownedWrite: true,
    });

    const aria = createGridListSection(props, state, ref);

    return (
      <dom.div
        {...mergeProps(
          omit(filterDOMProps(props, { global: true }), "id"),
          merge(() => aria.rowGroupProps ?? {})
        )}
        render={props.render}
        class={props.class ?? "solid2-aria-TreeSection"}
        ref={(element: HTMLDivElement) => {
          setRef(element);
        }}
      >
        <GridListHeaderContext value={{ role: "row" }}>
          <GridListHeaderInnerContext value={aria.rowHeaderProps}>
            <Branch collection={state.collection} parent={item} />
          </GridListHeaderInnerContext>
        </GridListHeaderContext>
      </dom.div>
    );
  }
);

export function TreeHeader(
  props: TreeHeaderProps & { ref?: Ref<HTMLDivElement> }
) {
  return (
    <GridListHeader
      {
        // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
        ...omit(props, "ref")
        // oxlint-enable solid/reactivity
      }
      ref={(element: HTMLDivElement) => {
        assignRef(
          untrack(() => props.ref),
          element
        );
      }}
      class={props.class ?? "solid2-aria-TreeHeader"}
    />
  );
}

function TreeItemChildren(props: { state: TreeState<unknown>; itemKey: Key }) {
  const content = createCachedChildren({
    children: (node: Node<unknown>) =>
      node.type === "content" ? (node.render?.(node) ?? node.rendered) : null,
    get items() {
      return props.state.collection.getChildren?.(props.itemKey);
    },
  });

  return <>{content()}</>;
}
