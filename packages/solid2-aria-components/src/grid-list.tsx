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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/GridList.tsx.
 * Modified for Solid Aria: collections, selection, drag and drop, and DOM rendering use Solid 2 ownership and reactive getters; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import {
  BaseCollection,
  ItemNode,
  LoaderNode,
  SectionNode,
  HeaderNode,
} from "@solid2-aria/core/collections/base-collection";
import {
  Collection,
  CollectionBuilder,
  createLeafComponent,
  createBranchComponent,
} from "@solid2-aria/core/collections/collection-builder";
import { createFocusRing } from "@solid2-aria/core/focus/create-focus-ring";
import { createGridList } from "@solid2-aria/core/gridlist/create-grid-list";
import type { AriaGridListProps } from "@solid2-aria/core/gridlist/create-grid-list";
import { createGridListItem } from "@solid2-aria/core/gridlist/create-grid-list-item";
import { createGridListSection } from "@solid2-aria/core/gridlist/create-grid-list-section";
import { createGridListSelectionCheckbox } from "@solid2-aria/core/gridlist/create-grid-list-selection-checkbox";
import { createCollator } from "@solid2-aria/core/i18n/create-collator";
import { createLocale } from "@solid2-aria/core/i18n/i18n-provider";
import { createHover } from "@solid2-aria/core/interactions/create-hover";
import { ListKeyboardDelegate } from "@solid2-aria/core/selection/list-keyboard-delegate";
import { createLoadMoreSentinel } from "@solid2-aria/core/utils/create-load-more-sentinel";
import type { LoadMoreSentinelProps } from "@solid2-aria/core/utils/create-load-more-sentinel";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { requireValue } from "@solid2-aria/core/utils/require-value";
import { createVisuallyHidden } from "@solid2-aria/core/visually-hidden/visually-hidden";
import { createListState } from "@solid2-aria/stately/list/create-list-state";
import type { ListState } from "@solid2-aria/stately/list/create-list-state";
import type {
  Key,
  LinkDOMProps,
  HoverEvents,
  PressEvents,
  Orientation,
  Node,
  SelectionBehavior,
  Collection as ICollection,
} from "@solid2-aria/types-shared";
import type {
  GlobalDOMAttributes,
  HTMLAttributes,
} from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";
import {
  merge,
  untrack,
  createSignal,
  createMemo,
  createContext,
  useContext,
  omit,
  Show,
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
import {
  createCollectionItemDragAndDrop,
  createCollectionDragAndDrop,
  CollectionDropIndicator,
} from "./collection-dnd";
import type { DragAndDropHooks } from "./create-drag-and-drop";
import {
  DragAndDropContext,
  DropIndicatorContext,
  createDndPersistedKeys,
  createRenderDropIndicator,
} from "./drag-and-drop";
import { ListStateContext } from "./list-box";
import { SelectionIndicatorContext } from "./selection-indicator";
import { TextContext } from "./text";
import {
  dom,
  DEFAULT_SLOT,
  createContextProps,
  createRenderProps,
} from "./utils";
import type {
  ClassOrFunction,
  ContextValue,
  RenderProps,
  StyleRenderProps,
  StyleProps,
  SlotProps,
  DOMProps,
  DOMRenderProps,
  Ref,
} from "./utils";

export {
  createCollectionDragAndDrop,
  CollectionDropIndicator,
} from "./collection-dnd";

export type { CollectionDragAndDrop } from "./collection-dnd";

export interface GridListRenderProps {
  isEmpty: boolean;

  isFocused: boolean;

  isFocusVisible: boolean;

  isDropTarget: boolean;

  layout: "stack" | "grid";

  orientation: Orientation;

  state: ListState<unknown>;
}

export interface GridListProps<T>
  extends
    Omit<AriaGridListProps<T>, "children">,
    CollectionProps<T>,
    StyleRenderProps<GridListRenderProps>,
    SlotProps,
    GlobalDOMAttributes<HTMLDivElement> {
  class?: ClassOrFunction<GridListRenderProps>;

  disallowTypeAhead?: boolean;

  selectionBehavior?: SelectionBehavior;

  dragAndDropHooks?: DragAndDropHooks<NoInfer<T>>;

  renderEmptyState?: (props: GridListRenderProps) => JSX.Element;

  layout?: "stack" | "grid";

  orientation?: Orientation;

  UNSTABLE_focusOnEntry?: "first" | "last";
}

export interface GridListItemRenderProps extends ItemRenderProps {
  id?: Key;

  isFocusVisibleWithin: boolean;

  state: ListState<unknown>;
}

export interface GridListItemProps<T = object>
  extends
    RenderProps<GridListItemRenderProps>,
    LinkDOMProps,
    HoverEvents,
    PressEvents,
    Omit<GlobalDOMAttributes<HTMLDivElement>, "onClick"> {
  class?: ClassOrFunction<GridListItemRenderProps>;

  id?: Key;

  value?: T;

  textValue?: string;

  isDisabled?: boolean;

  onAction?: () => void;

  focusMode?: "child" | "row";

  allowsArrowNavigation?: boolean;
}

export interface GridListLoadMoreItemProps
  extends
    Omit<LoadMoreSentinelProps, "collection" | "direction">,
    StyleProps,
    DOMRenderProps<"div", undefined>,
    GlobalDOMAttributes<HTMLDivElement> {
  class?: JSX.ClassValue;

  children?: JSX.Element;

  isLoading?: boolean;
}

export interface GridListSectionProps<T>
  extends SectionProps<T>, DOMRenderProps<"div", undefined> {
  class?: JSX.ClassValue;
}

export interface GridListHeaderProps
  extends
    DOMRenderProps<"div", undefined>,
    Omit<DOMProps, "ref">,
    GlobalDOMAttributes<HTMLElement> {
  role?: "row";
}

export const GridListContext =
  // oxlint-disable-next-line typescript/no-explicit-any -- The collection owner and its descendants share one item type through this context.
  createContext<ContextValue<GridListProps<any>, HTMLDivElement>>(null);

export function GridList<T>(
  input: GridListProps<T> & { ref?: Ref<HTMLDivElement> }
): JSX.Element {
  const [props, ref, setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    GridListContext
  );

  return (
    <CollectionBuilder
      createCollection={() => new BaseCollection<T>()}
      content={<Collection {...props} />}
    >
      {(collection) => (
        <GridListInner
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

function GridListInner<T>(outer: {
  props: GridListProps<T>;
  collection: ICollection<Node<T>>;
  elementRef: Accessor<HTMLDivElement | null>;
  setElementRef: (element: HTMLDivElement) => void;
}) {
  const { props } = untrack(() => outer);
  const renderer = useContext(CollectionRendererContext);

  // oxlint-disable-next-line typescript/no-explicit-any -- The public collection accepts primitive items; this state adapter only reads their keyed nodes.
  const state = createListState<any>(
    mergeProps(props, {
      children: undefined,
      get collection() {
        return outer.collection;
      },
    })
  );

  const locale = createLocale();
  const collator = createCollator({ sensitivity: "base", usage: "search" });

  const keyboardDelegate = createMemo(
    () =>
      new ListKeyboardDelegate({
        collator,
        get collection() {
          return state.collection;
        },
        get direction() {
          return locale.direction;
        },
        get disabledBehavior() {
          return state.selectionManager.disabledBehavior;
        },
        get disabledKeys() {
          return state.disabledKeys;
        },
        get layout() {
          return props.layout ?? "stack";
        },
        layoutDelegate: renderer.layoutDelegate,
        get orientation() {
          return props.orientation ?? "vertical";
        },
        ref: outer.elementRef,
      })
  );

  const aria = createGridList(
    mergeProps(props, {
      get isVirtualized() {
        return renderer.isVirtualized;
      },
      get keyboardDelegate() {
        return keyboardDelegate();
      },
      get keyboardNavigationBehavior() {
        return props.layout === "grid"
          ? "tab"
          : props.keyboardNavigationBehavior;
      },
    }),
    state,
    untrack(() => outer.elementRef)
  );

  const dnd = createCollectionDragAndDrop({
    get collection() {
      return state.collection;
    },
    get direction() {
      return locale.direction;
    },
    get dropTargetDelegate() {
      return (
        props.dragAndDropHooks?.dropTargetDelegate ??
        renderer.dropTargetDelegate
      );
    },
    get hooks() {
      return props.dragAndDropHooks;
    },
    get keyboardDelegate() {
      return keyboardDelegate();
    },
    get layout() {
      return props.layout;
    },
    get orientation() {
      return props.orientation;
    },
    get ref() {
      return outer.elementRef;
    },
    get selectionManager() {
      return state.selectionManager;
    },
  });

  const focus = createFocusRing();

  const values: GridListRenderProps = {
    get isDropTarget() {
      return dnd.dropState?.isDropTarget({ type: "root" }) === true;
    },
    get isEmpty() {
      return state.collection.size === 0;
    },
    get isFocusVisible() {
      return focus.isFocusVisible;
    },
    get isFocused() {
      return focus.isFocused;
    },
    get layout() {
      return props.layout ?? "stack";
    },
    get orientation() {
      return props.orientation ?? "vertical";
    },
    state,
  };

  const render = createRenderProps(
    mergeProps(props, {
      children: undefined,
      defaultClass: "solid2-aria-GridList",
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
      data-layout={values.layout}
      data-orientation={values.orientation}
    >
      <ListStateContext value={state}>
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
      </ListStateContext>
      {values.isEmpty && props.renderEmptyState && (
        <div role="row">
          <div role="gridcell">{props.renderEmptyState(values)}</div>
        </div>
      )}
      {dnd.preview}
    </dom.div>
  );
}

export const GridListItem = createLeafComponent(
  ItemNode,
  <T,>(
    props: GridListItemProps<T>,
    forwardedRef: Ref<HTMLDivElement>,
    item: Node<T>
  ) => {
    const state = requireValue(
      useContext(ListStateContext),
      "Expected useContext(ListStateContext)"
    );

    const renderer = useContext(CollectionRendererContext);
    const dnd = useContext(DragAndDropContext);

    const [ref, setRef] = createSignal<HTMLDivElement | null>(null, {
      ownedWrite: true,
    });

    const aria = createGridListItem(
      {
        get allowsArrowNavigation() {
          return props.allowsArrowNavigation;
        },
        get focusMode() {
          return props.focusMode;
        },
        isVirtualized: renderer.isVirtualized,
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

    const { drag, drop } = createCollectionItemDragAndDrop(
      dnd,
      item.key,
      dropRef
    );

    const values: GridListItemRenderProps = {
      get allowsDragging() {
        return !!dnd.dragState;
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
        get children() {
          return item.rendered;
        },
        defaultClass: "solid2-aria-GridListItem",
        id: undefined,
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
                      [DEFAULT_SLOT]: {
                        get isDisabled() {
                          return (
                            aria.isDisabled &&
                            state.selectionManager.disabledBehavior === "all"
                          );
                        },
                      },
                      drag: mergeProps(
                        merge(() => drag?.dragButtonProps ?? {}),
                        {
                          style: { "pointer-events": "none" as const },
                        }
                      ),
                    },
                  }}
                >
                  <TextContext
                    value={{
                      slots: {
                        [DEFAULT_SLOT]: {},
                        get description() {
                          return aria.descriptionProps;
                        },
                      },
                    }}
                  >
                    <SelectionIndicatorContext
                      value={{
                        get isSelected() {
                          return aria.isSelected;
                        },
                      }}
                    >
                      <CollectionRendererContext
                        value={DefaultCollectionRenderer}
                      >
                        <ListStateContext value={null}>
                          {render.children}
                        </ListStateContext>
                      </CollectionRendererContext>
                    </SelectionIndicatorContext>
                  </TextContext>
                </ButtonContext>
              </CheckboxFieldContext>
            </CheckboxContext>
          </div>
        </dom.div>
      </>
    );
  }
);

export const GridListLoadMoreItem = createLeafComponent(
  LoaderNode,
  (
    props: GridListLoadMoreItemProps,
    ref: Ref<HTMLDivElement>,
    item: Node<object>
  ) => {
    const state = requireValue(
      useContext(ListStateContext),
      "Expected useContext(ListStateContext)"
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

    return (
      <>
        <div style={{ height: 0, position: "relative", width: 0 }} inert>
          <div
            ref={(element: HTMLDivElement) => {
              setSentinel(element);
            }}
            style={{ height: "1px", position: "absolute", width: "1px" }}
          />
        </div>
        {props.isLoading === true && (
          <dom.div
            {...filterDOMProps(props, { global: true })}
            render={props.render}
            class={props.class ?? "solid2-aria-GridListLoadingIndicator"}
            ref={ref}
            role="row"
          >
            <div role="gridcell">{item.rendered}</div>
          </dom.div>
        )}
      </>
    );
  }
);

export const GridListHeaderContext = createContext<
  ContextValue<GridListHeaderProps, HTMLDivElement>
>({});

export const GridListHeaderInnerContext =
  createContext<HTMLAttributes<HTMLElement> | null>(null);

export const GridListHeader = createLeafComponent(
  HeaderNode,
  (input: GridListHeaderProps, forwardedRef: Ref<HTMLDivElement>) => {
    const [props, , setRef] = createContextProps(
      input,
      forwardedRef,
      GridListHeaderContext
    );

    const inner = useContext(GridListHeaderInnerContext);

    return (
      <dom.div
        {...props}
        class={props.class ?? "solid2-aria-GridListHeader"}
        ref={(element: HTMLDivElement) => {
          setRef(element);
        }}
      >
        <div
          {...(inner
            ? // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
              omit(inner, "ref")
            : // oxlint-enable solid/reactivity
              {})}
          style={{ display: "contents" }}
        >
          {props.children}
        </div>
      </dom.div>
    );
  }
);

export const GridListSection = createBranchComponent(
  SectionNode,
  <T,>(
    props: GridListSectionProps<T>,
    forwardedRef: Ref<HTMLDivElement>,
    item: Node<T>
  ) => {
    const state = requireValue(
      useContext(ListStateContext),
      "Expected useContext(ListStateContext)"
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
        class={props.class ?? "solid2-aria-GridListSection"}
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

export function RootDropIndicator(
  props: { table?: boolean; columnCount?: number } = {}
) {
  const context = useContext(DragAndDropContext);

  const [ref, setRef] = createSignal<HTMLDivElement | null>(null, {
    ownedWrite: true,
  });

  const aria = untrack(() =>
    requireValue(
      requireValue(
        context.dragAndDropHooks,
        "Expected context.dragAndDropHooks"
      ).createDropIndicator,
      "Expected context.dragAndDropHooks!.createDropIndicator"
    )(
      { target: { type: "root" } },
      requireValue(context.dropState, "Expected context.dropState"),
      ref
    )
  );

  const hidden = createVisuallyHidden();

  const button = (
    <div
      {...mergeProps(
        merge(() => hidden.visuallyHiddenProps ?? {}),
        merge(() => aria.dropIndicatorProps ?? {})
      )}
      role="button"
      ref={(element: HTMLDivElement) => {
        setRef(element);
      }}
    />
  );

  return (
    <Show when={!aria.isHidden}>
      {props.table === true ? (
        <tr role="row" style={{ position: "absolute" }}>
          <td role="gridcell" colspan={props.columnCount}>
            {button}
          </td>
        </tr>
      ) : (
        <div role="row" style={{ position: "absolute" }}>
          <div role="gridcell">{button}</div>
        </div>
      )}
    </Show>
  );
}
