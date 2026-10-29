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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/ListBox.tsx.
 * Modified for Solid Aria: adapted collection ownership, contexts, accessibility primitives, and reactive properties for Solid 2; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import {
  ItemNode,
  SectionNode,
  LoaderNode,
  BaseCollection,
} from "@solid2-aria/core/collections/base-collection";
import {
  Collection,
  CollectionBuilder,
  createLeafComponent,
  createBranchComponent,
} from "@solid2-aria/core/collections/collection-builder";
import { createFocusRing } from "@solid2-aria/core/focus/create-focus-ring";
import { createCollator } from "@solid2-aria/core/i18n/create-collator";
import { createLocale } from "@solid2-aria/core/i18n/i18n-provider";
import { createFocus } from "@solid2-aria/core/interactions/create-focus";
import { createHover } from "@solid2-aria/core/interactions/create-hover";
import { createKeyboard } from "@solid2-aria/core/interactions/create-keyboard";
import { createListBox } from "@solid2-aria/core/listbox/create-list-box";
import type { AriaListBoxProps } from "@solid2-aria/core/listbox/create-list-box";
import { createListBoxSection } from "@solid2-aria/core/listbox/create-list-box-section";
import { createOption } from "@solid2-aria/core/listbox/create-option";
import { ListKeyboardDelegate } from "@solid2-aria/core/selection/list-keyboard-delegate";
import { createLoadMoreSentinel } from "@solid2-aria/core/utils/create-load-more-sentinel";
import type { LoadMoreSentinelProps } from "@solid2-aria/core/utils/create-load-more-sentinel";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { isTruthy } from "@solid2-aria/core/utils/truthy";
import { createListState } from "@solid2-aria/stately/list/create-list-state";
import type { ListState } from "@solid2-aria/stately/list/create-list-state";
import type {
  Collection as SharedCollection,
  FocusEvents,
  HoverEvents,
  Key,
  KeyboardEvents,
  LinkDOMProps,
  PressEvents,
  Orientation,
  SelectionBehavior,
  Node,
} from "@solid2-aria/types-shared";
import type { GlobalDOMAttributes } from "@solid2-aria/types-shared-web";
import { dynamic } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import {
  merge,
  untrack,
  createSignal,
  createContext,
  createMemo,
  useContext,
  omit,
  Show,
} from "solid-js";

import { SelectableCollectionContext } from "./autocomplete";
import type { SelectableCollectionContextValue } from "./autocomplete";
import { CollectionRendererContext, SectionContext } from "./collection";
import type {
  CollectionProps,
  ItemRenderProps,
  SectionProps,
} from "./collection";
import { createCollectionDragAndDrop } from "./collection-dnd";
import type { DragAndDropHooks } from "./create-drag-and-drop";
import {
  DragAndDropContext,
  DropIndicatorContext,
  createRenderDropIndicator,
  createDndPersistedKeys,
} from "./drag-and-drop";
import type { DropIndicatorProps } from "./drag-and-drop";
import { HeaderContext } from "./header";
import { SelectionIndicatorContext } from "./selection-indicator";
import { TextContext } from "./text";
import {
  dom,
  createContextProps,
  createRenderProps,
  createSlot,
  DEFAULT_SLOT,
  assignRef,
} from "./utils";
import type {
  Ref,
  ClassOrFunction,
  DOMRenderProps,
  PossibleLinkDOMRenderProps,
  RenderProps,
  SlotProps,
  StyleProps,
  StyleRenderProps,
  ContextValue,
} from "./utils";

export const ListBoxContext =
  // oxlint-disable-next-line typescript/no-explicit-any -- Collection contexts erase item types; each typed factory restores its owner's item contract.
  createContext<ContextValue<ListBoxProps<any>, HTMLDivElement>>(null);

export const ListStateContext = createContext<ListState<unknown> | null>(null);

export interface ListBoxRenderProps {
  /**
   * Whether the listbox has no items and should display its empty state.
   *
   * @selector [data-empty]
   */
  isEmpty: boolean;
  /**
   * Whether the listbox is currently focused.
   *
   * @selector [data-focused]
   */
  isFocused: boolean;
  /**
   * Whether the listbox is currently keyboard focused.
   *
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean;
  /**
   * Whether the listbox is currently the active drop target.
   *
   * @selector [data-drop-target]
   */
  isDropTarget: boolean;
  /**
   * Whether the items are arranged in a stack or grid.
   *
   * @selector [data-layout="stack | grid"]
   */
  layout: "stack" | "grid";
  /**
   * The primary orientation of the items.
   *
   * @selector [data-orientation="vertical | horizontal"]
   */
  orientation: Orientation;
  /**
   * State of the listbox.
   */
  state: ListState<unknown>;
}

export interface ListBoxProps<T>
  extends
    Omit<AriaListBoxProps<T>, "children" | "label">,
    CollectionProps<T>,
    StyleRenderProps<ListBoxRenderProps>,
    SlotProps,
    GlobalDOMAttributes<HTMLDivElement> {
  /**
   * The CSS [class](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/class) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-ListBox'
   */
  class?: ClassOrFunction<ListBoxRenderProps>;
  /**
   * How multiple selection should behave in the collection.
   *
   * @default 'toggle'
   */
  selectionBehavior?: SelectionBehavior;
  /**
   * The drag and drop hooks returned by `createDragAndDrop` used to enable drag and drop behavior for
   * the ListBox.
   */
  dragAndDropHooks?: DragAndDropHooks<NoInfer<T>>;
  /** Provides content to display when there are no items in the list. */
  renderEmptyState?: (props: ListBoxRenderProps) => JSX.Element;
  /**
   * Whether the items are arranged in a stack or grid.
   *
   * @default 'stack'
   */
  layout?: "stack" | "grid";
  /**
   * The primary orientation of the items. Usually this is the
   * direction that the collection scrolls.
   *
   * @default 'vertical'
   */
  orientation?: Orientation;
}

export interface ListBoxSectionProps<T>
  extends SectionProps<T>, DOMRenderProps<"section", undefined> {
  /**
   * The CSS [class](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/class) for the
   * element.
   *
   * @default 'react-aria-ListBoxSection'
   */
  class?: JSX.ClassValue;
}

export type ListBoxItemRenderProps = ItemRenderProps;

export interface ListBoxItemProps<T = object>
  extends
    Omit<RenderProps<ListBoxItemRenderProps>, "render">,
    PossibleLinkDOMRenderProps<"div", ListBoxItemRenderProps>,
    LinkDOMProps,
    HoverEvents,
    PressEvents,
    KeyboardEvents,
    FocusEvents<HTMLDivElement>,
    Omit<GlobalDOMAttributes<HTMLDivElement>, "onClick"> {
  /**
   * The CSS [class](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/class) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-ListBoxItem'
   */
  class?: ClassOrFunction<ListBoxItemRenderProps>;
  /** The unique id of the item. */
  id?: Key;
  /**
   * The object value that this item represents. When using dynamic collections, this is set
   * automatically.
   */
  value?: T;
  /** A string representation of the item's contents, used for features like typeahead. */
  textValue?: string;
  /** An accessibility label for this item. */
  "aria-label"?: string;
  /** Whether the item is disabled. */
  isDisabled?: boolean;
  /**
   * Handler that is called when a user performs an action on the item. The exact user event depends
   * on the collection's `selectionBehavior` prop and the interaction modality.
   */
  onAction?: () => void;
}

export interface ListBoxLoadMoreItemProps
  extends
    Omit<LoadMoreSentinelProps, "collection" | "direction">,
    StyleProps,
    DOMRenderProps<"div", undefined>,
    GlobalDOMAttributes<HTMLDivElement> {
  /**
   * The CSS [class](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/class) for the
   * element.
   *
   * @default 'react-aria-ListBoxLoadingIndicator'
   */
  class?: JSX.ClassValue;
  /**
   * The load more spinner to render when loading additional items.
   */
  children?: JSX.Element;
  /**
   * Whether or not the loading spinner should be rendered or not.
   */
  isLoading?: boolean;
}

export function ListBox<T extends object>(
  input: ListBoxProps<T> & { ref?: Ref<HTMLDivElement> }
): JSX.Element {
  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    ListBoxContext
  );

  const state = useContext(ListStateContext);

  if (state) {
    // oxlint-disable-next-line solid/components-return-once -- Static collection traversal and context registration are fixed when the owner is created.
    return <ListBoxInner props={props} state={state} listRef={setRef} />;
  }

  return (
    <CollectionBuilder
      createCollection={() => new BaseCollection<object>()}
      content={<Collection {...props} />}
    >
      {(collection) => (
        <StandaloneListBox
          props={props}
          collection={collection}
          listRef={setRef}
        />
      )}
    </CollectionBuilder>
  );
}

function StandaloneListBox<T extends object>(input: {
  props: ListBoxProps<T>;
  collection: BaseCollection<object>;
  listRef: (element: HTMLDivElement) => void;
}): JSX.Element {
  const state = createListState(
    mergeProps(
      merge(() => input.props ?? {}),
      {
        children: null,
        get collection() {
          return input.collection;
        },
        items: undefined,
      }
    )
  );

  return (
    <ListBoxInner props={input.props} state={state} listRef={input.listRef} />
  );
}

function ListBoxInner<T>(input: {
  props: ListBoxProps<T> & SelectableCollectionContextValue<unknown>;
  state: ListState<unknown>;
  listRef: (element: HTMLDivElement) => void;
}): JSX.Element {
  const [props, ref, setRef] = createContextProps(
    untrack(() => input.props),
    untrack(() => input.listRef),
    SelectableCollectionContext
  );

  const renderer = useContext(CollectionRendererContext);

  const filtered = createMemo(() =>
    props.filter && input.state.collection.filter
      ? input.state.collection.filter(props.filter)
      : input.state.collection
  );

  const state: ListState<unknown> = {
    get collection() {
      return filtered();
    },
    get disabledKeys() {
      return input.state.disabledKeys;
    },
    get selectionManager() {
      return input.state.selectionManager.withCollection(filtered());
    },
  };

  const locale = createLocale();
  const collator = createCollator({ sensitivity: "base", usage: "search" });

  const keyboardDelegate = createMemo(
    () =>
      new ListKeyboardDelegate({
        collator,
        collection: state.collection,
        direction: locale.direction,
        disabledBehavior: state.selectionManager.disabledBehavior,
        disabledKeys: state.disabledKeys,
        layout: props.layout ?? "stack",
        layoutDelegate: renderer.layoutDelegate,
        orientation: props.orientation ?? "vertical",
        ref,
      })
  );

  const dnd = createCollectionDragAndDrop<T>({
    get collection() {
      // SAFETY: This state was constructed from the same ListBox<T> collection passed to the drag adapter.
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The shared selection context erases T between the owner and its descendants.
      return state.collection as SharedCollection<Node<T>>;
    },
    get direction() {
      return locale.direction;
    },
    get dropTargetDelegate() {
      return renderer.dropTargetDelegate;
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
    ref,
    get selectionManager() {
      return state.selectionManager;
    },
  });

  const aria = createListBox(
    mergeProps(props, {
      get isVirtualized() {
        return renderer.isVirtualized;
      },
      get keyboardDelegate() {
        return keyboardDelegate();
      },
    }),
    state,
    ref
  );

  const focus = createFocusRing();

  const values: ListBoxRenderProps = {
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
      defaultClass: "solid2-aria-ListBox",
      values,
    })
  );

  const Root = renderer.CollectionRoot;

  return (
    <dom.div
      {...mergeProps(
        filterDOMProps(props, { global: true }),
        merge(() => aria.listBoxProps ?? {}),
        merge(() => dnd.collectionProps ?? {}),
        merge(() => focus.focusProps ?? {}),
        render
      )}
      ref={(element: HTMLDivElement) => {
        setRef(element);
      }}
      slot={props.slot ?? undefined}
      data-drop-target={values.isDropTarget || undefined}
      data-empty={values.isEmpty || undefined}
      data-focused={focus.isFocused || undefined}
      data-focus-visible={focus.isFocusVisible || undefined}
      data-layout={values.layout}
      data-orientation={values.orientation}
    >
      <ListBoxContext value={props}>
        <ListStateContext value={state}>
          <SectionContext
            value={{
              name: "ListBoxSection",
              render: (sectionProps, sectionRef, sectionNode, defaultClass) => (
                <ListBoxSectionContent
                  props={sectionProps}
                  sectionRef={sectionRef}
                  node={sectionNode}
                  defaultClass={defaultClass}
                />
              ),
            }}
          >
            <DragAndDropContext value={dnd}>
              <DropIndicatorContext
                value={{
                  render: (indicatorProps, indicatorRef) => (
                    <ListBoxDropIndicator
                      {...indicatorProps}
                      ref={indicatorRef}
                    />
                  ),
                }}
              >
                <Root
                  collection={state.collection}
                  scrollRef={ref}
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
          </SectionContext>
        </ListStateContext>
      </ListBoxContext>
      {dnd.preview}
      {values.isEmpty && props.renderEmptyState ? (
        <div role="option" style={{ display: "contents" }}>
          {props.renderEmptyState(values)}
        </div>
      ) : null}
    </dom.div>
  );
}

function ListBoxSectionInner(
  // oxlint-disable-next-line typescript/no-explicit-any -- Collection contexts erase item types; each typed factory restores its owner's item contract.
  props: ListBoxSectionProps<any>,
  ref: Ref<HTMLElement>,
  section: Node<unknown>,
  defaultClass = "solid2-aria-ListBoxSection"
): JSX.Element {
  const state = useContext(ListStateContext);

  if (!state) {
    throw new Error("ListBoxSection must be rendered in a ListBox.");
  }

  const renderer = useContext(CollectionRendererContext);
  const Branch = renderer.CollectionBranch;
  const [registerHeading, heading] = createSlot();

  const aria = createListBoxSection({
    get "aria-label"() {
      return props["aria-label"] ?? undefined;
    },
    get heading() {
      return heading();
    },
  });

  return (
    <dom.section
      {...mergeProps(
        omit(filterDOMProps(props, { global: true }), "id"),
        merge(() => aria.groupProps ?? {})
      )}
      class={props.class ?? defaultClass}
      style={props.style}
      render={props.render}
      ref={ref}
    >
      <HeaderContext
        value={mergeProps(
          merge(() => aria.headingProps ?? {}),
          { registerSlot: registerHeading }
        )}
      >
        <Branch collection={state.collection} parent={section} />
      </HeaderContext>
    </dom.section>
  );
}

const ListBoxSectionCollection = createBranchComponent(
  SectionNode,
  ListBoxSectionInner
);

const ListBoxItemCollection = createLeafComponent(
  ItemNode,
  <T,>(
    props: ListBoxItemProps<T>,
    forwardedRef: Ref<HTMLDivElement>,
    item: Node<T>
  ): JSX.Element => {
    const state = useContext(ListStateContext);

    if (!state) {
      throw new Error("ListBoxItem must be rendered in a ListBox.");
    }

    const [ref, setRef] = createSignal<HTMLDivElement | null>(null, {
      ownedWrite: true,
    });

    const aria = createOption(
      {
        get "aria-label"() {
          return props["aria-label"];
        },
        key: item.key,
      },
      state,
      ref
    );

    const hover = createHover(
      mergeProps(props, {
        get isDisabled() {
          return aria.isDisabled;
        },
      })
    );

    const dnd = useContext(DragAndDropContext);

    const drag = dnd.dragState
      ? dnd.dragAndDropHooks?.createDraggableItem?.(
          { hasAction: aria.hasAction, key: item.key },
          dnd.dragState
        )
      : undefined;

    const drop = dnd.dropState
      ? dnd.dragAndDropHooks?.createDroppableItem?.(
          { target: { dropPosition: "on", key: item.key, type: "item" } },
          dnd.dropState,
          ref
        )
      : undefined;

    const keyboard = createKeyboard(props);
    const focus = createFocus(props);

    const values: ListBoxItemRenderProps = {
      get allowsDragging() {
        return !!dnd.dragState;
      },
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
        return aria.isFocusVisible;
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
    };

    const render = createRenderProps(
      mergeProps(props, { defaultClass: "solid2-aria-ListBoxItem", values })
    );

    const Element = dynamic(() => (isTruthy(props.href) ? dom.a : dom.div));

    return (
      <Element
        {...mergeProps(
          omit(filterDOMProps(props, { global: true }), "id", "onClick"),
          render,
          merge(() => aria.optionProps ?? {}),
          merge(() => hover.hoverProps ?? {}),
          merge(() => keyboard.keyboardProps ?? {}),
          merge(() => focus.focusProps ?? {}),
          merge(() => drag?.dragProps ?? {}),
          merge(() => drop?.dropProps ?? {})
        )}
        ref={[
          (element: HTMLDivElement) => {
            setRef(element);
          },
          (element: HTMLDivElement) => {
            assignRef(forwardedRef, element);
          },
        ]}
        data-allows-dragging={values.allowsDragging ?? undefined}
        data-dragging={values.isDragging ?? undefined}
        data-drop-target={values.isDropTarget ?? undefined}
        data-selected={aria.isSelected || undefined}
        data-disabled={aria.isDisabled || undefined}
        data-hovered={hover.isHovered || undefined}
        data-focused={aria.isFocused || undefined}
        data-focus-visible={aria.isFocusVisible || undefined}
        data-pressed={aria.isPressed || undefined}
        data-selection-mode={
          state.selectionManager.selectionMode === "none"
            ? undefined
            : state.selectionManager.selectionMode
        }
      >
        <TextContext
          value={{
            slots: {
              get [DEFAULT_SLOT]() {
                return aria.labelProps;
              },
              get description() {
                return aria.descriptionProps;
              },
              get label() {
                return aria.labelProps;
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
            {render.children}
          </SelectionIndicatorContext>
        </TextContext>
      </Element>
    );
  }
);

const ListBoxLoadMoreItemCollection = createLeafComponent(
  LoaderNode,
  (
    props: ListBoxLoadMoreItemProps,
    forwardedRef: Ref<HTMLDivElement>,
    _node: Node<unknown>
  ): JSX.Element => {
    const state = useContext(ListStateContext);

    if (!state) {
      throw new Error("ListBoxLoadMoreItem must be rendered in a ListBox.");
    }

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
        defaultClass: "solid2-aria-ListBoxLoadingIndicator",
        values: undefined,
      })
    );

    return (
      <>
        <div style={{ height: 0, position: "relative", width: 0 }} inert>
          <div
            data-testid="loadMoreSentinel"
            ref={(element: HTMLDivElement) => {
              setSentinel(element);
            }}
            style={{ height: "1px", position: "absolute", width: "1px" }}
          />
        </div>
        <Show when={props.isLoading}>
          <dom.div
            {...filterDOMProps(props, { global: true })}
            {...render}
            role="option"
            tabindex={-1}
            ref={(element: HTMLDivElement) => {
              assignRef(forwardedRef, element);
            }}
          >
            {render.children}
          </dom.div>
        </Show>
      </>
    );
  }
);

function ListBoxSectionContent(input: {
  props: SectionProps<unknown>;
  sectionRef: Ref<HTMLElement>;
  node: Node<unknown>;
  defaultClass?: string;
}): JSX.Element {
  return ListBoxSectionInner(
    input.props,
    input.sectionRef,
    input.node,
    input.defaultClass
  );
}

export function ListBoxItem<T>(
  props: ListBoxItemProps<T> & { ref?: Ref<HTMLDivElement> }
): JSX.Element {
  return (
    <ListBoxItemCollection
      {...props}
      ref={(element: HTMLDivElement) => {
        assignRef(
          untrack(() => props.ref),
          element
        );
      }}
    />
  );
}

export function ListBoxSection<T>(
  props: ListBoxSectionProps<T> & { ref?: Ref<HTMLElement> }
): JSX.Element {
  return (
    <ListBoxSectionCollection
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

export function ListBoxLoadMoreItem(
  props: ListBoxLoadMoreItemProps & { ref?: Ref<HTMLDivElement> }
): JSX.Element {
  return (
    <ListBoxLoadMoreItemCollection
      {...props}
      ref={(element: HTMLDivElement) => {
        assignRef(
          untrack(() => props.ref),
          element
        );
      }}
    />
  );
}

function ListBoxDropIndicator(props: DropIndicatorProps): JSX.Element {
  const context = useContext(DragAndDropContext);

  const [ref, setRef] = createSignal<HTMLElement | null>(null, {
    ownedWrite: true,
  });

  if (!context.dragAndDropHooks?.createDropIndicator || !context.dropState) {
    // oxlint-disable-next-line solid/components-return-once -- Static collection traversal and context registration are fixed when the owner is created.
    return null;
  }

  const aria = context.dragAndDropHooks.createDropIndicator(
    props,
    context.dropState,
    ref
  );

  const render = createRenderProps(
    mergeProps(props, {
      defaultClass: "solid2-aria-DropIndicator",
      values: {
        get isDropTarget() {
          return aria.isDropTarget;
        },
      },
    })
  );

  return (
    <Show when={!aria.isHidden}>
      <dom.div
        {...aria.dropIndicatorProps}
        {...render}
        role="option"
        ref={[
          (element: HTMLElement) => {
            setRef(element);
          },
          (element: HTMLElement) => {
            assignRef(
              untrack(() => props.ref),
              element
            );
          },
        ]}
        data-drop-target={aria.isDropTarget || undefined}
      />
    </Show>
  );
}
