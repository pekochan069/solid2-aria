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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/TagGroup.tsx.
 * Modified for Solid Aria: adapted collection ownership, contexts, accessibility primitives, and reactive properties for Solid 2; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import {
  BaseCollection,
  ItemNode,
} from "@solid2-aria/core/collections/base-collection";
import {
  Collection,
  CollectionBuilder,
  createLeafComponent,
} from "@solid2-aria/core/collections/collection-builder";
import { createFocusRing } from "@solid2-aria/core/focus/create-focus-ring";
import { createHover } from "@solid2-aria/core/interactions/create-hover";
import { createTag } from "@solid2-aria/core/tag/create-tag";
import { createTagGroup } from "@solid2-aria/core/tag/create-tag-group";
import type { AriaTagGroupProps } from "@solid2-aria/core/tag/create-tag-group";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { isTruthy } from "@solid2-aria/core/utils/truthy";
import { createListState } from "@solid2-aria/stately/list/create-list-state";
import type { ListState } from "@solid2-aria/stately/list/create-list-state";
import type {
  FocusEvents,
  HoverEvents,
  Key,
  LinkDOMProps,
  PressEvents,
  Node,
} from "@solid2-aria/types-shared";
import type {
  DOMAttributes,
  GlobalDOMAttributes,
} from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";
import {
  merge,
  untrack,
  createSignal,
  createContext,
  useContext,
  omit,
} from "solid-js";

import { SelectableCollectionContext } from "./autocomplete";
import type { SelectableCollectionContextValue } from "./autocomplete";
import { ButtonContext } from "./button";
import { CollectionRendererContext } from "./collection";
import type { CollectionProps, ItemRenderProps } from "./collection";
import { LabelContext } from "./label";
import { ListStateContext } from "./list-box";
import { SelectionIndicatorContext } from "./selection-indicator";
import { TextContext } from "./text";
import {
  dom,
  createContextProps,
  createRenderProps,
  createSlot,
  createSlottedContext,
  assignRef,
} from "./utils";
import type {
  Ref,
  ClassOrFunction,
  DOMProps,
  DOMRenderProps,
  RenderProps,
  SlotProps,
  StyleRenderProps,
  ContextValue,
} from "./utils";

export const TagGroupContext =
  createContext<ContextValue<TagGroupProps, HTMLElement>>(null);

export const TagListContext = createContext<
  ContextValue<
    TagListProps<unknown> & {
      gridProps?: DOMAttributes;
    },
    HTMLElement
  >
>(null);

export interface TagGroupProps
  extends
    Omit<
      AriaTagGroupProps<unknown>,
      | "children"
      | "items"
      | "label"
      | "description"
      | "errorMessage"
      | "keyboardDelegate"
    >,
    DOMProps,
    SlotProps,
    DOMRenderProps<"div", undefined>,
    GlobalDOMAttributes<HTMLDivElement> {
  /**
   * The CSS [class](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/class) for the
   * element.
   *
   * @default 'react-aria-TagGroup'
   */
  class?: JSX.ClassValue;
}

export interface TagListRenderProps {
  /**
   * Whether the tag list has no items and should display its empty state.
   *
   * @selector [data-empty]
   */
  isEmpty: boolean;
  /**
   * Whether the tag list is currently focused.
   *
   * @selector [data-focused]
   */
  isFocused: boolean;
  /**
   * Whether the tag list is currently keyboard focused.
   *
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean;
  /**
   * State of the TagGroup.
   */
  state: ListState<unknown>;
}

export interface TagListProps<T>
  extends
    Omit<CollectionProps<T>, "disabledKeys">,
    StyleRenderProps<TagListRenderProps>,
    GlobalDOMAttributes<HTMLDivElement> {
  /**
   * The CSS [class](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/class) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-TagList'
   */
  class?: ClassOrFunction<TagListRenderProps>;
  /** Provides content to display when there are no items in the tag list. */
  renderEmptyState?: (props: TagListRenderProps) => JSX.Element;
}

export interface TagRenderProps extends Omit<
  ItemRenderProps,
  "allowsDragging" | "isDragging" | "isDropTarget"
> {
  /**
   * Whether the tag group allows items to be removed.
   *
   * @selector [data-allows-removing]
   */
  allowsRemoving: boolean;
}

export interface TagProps
  extends
    RenderProps<TagRenderProps>,
    LinkDOMProps,
    HoverEvents,
    FocusEvents,
    PressEvents,
    Omit<GlobalDOMAttributes<HTMLDivElement>, "onClick"> {
  /**
   * The CSS [class](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/class) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-Tag'
   */
  class?: ClassOrFunction<TagRenderProps>;
  /** A unique id for the tag. */
  id?: Key;
  /**
   * A string representation of the tags's contents, used for accessibility.
   * Required if children is not a plain text string.
   */
  textValue?: string;
  /** Whether the tag is disabled. */
  isDisabled?: boolean;
  /**
   * Handler that is called when a user performs an action on the item. The exact user event depends
   * on the collection's `selectionBehavior` prop and the interaction modality.
   */
  onAction?: () => void;
}

const TagCollection = createLeafComponent(
  ItemNode,
  (
    props: TagProps,
    forwardedRef: Ref<HTMLDivElement>,
    item: Node<unknown>
  ): JSX.Element => {
    const state = useContext(ListStateContext);

    if (!state) {
      throw new Error("Tag must be rendered in a TagGroup.");
    }

    const [ref, setRef] = createSignal<HTMLDivElement | null>(null, {
      ownedWrite: true,
    });

    const aria = createTag({ item }, state, ref);
    const focus = createFocusRing();

    const hover = createHover(
      mergeProps(props, {
        get isDisabled() {
          return aria.isDisabled;
        },
      })
    );

    const values: TagRenderProps = {
      get allowsRemoving() {
        return aria.allowsRemoving;
      },
      get isDisabled() {
        return aria.isDisabled;
      },
      get isFocusVisible() {
        return focus.isFocusVisible;
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
      mergeProps(props, { defaultClass: "solid2-aria-Tag", values })
    );

    return (
      <dom.div
        {...mergeProps(
          omit(filterDOMProps(props, { global: true }), "id", "onClick"),
          render,
          merge(() => aria.rowProps ?? {}),
          merge(() => focus.focusProps ?? {}),
          merge(() => hover.hoverProps ?? {})
        )}
        ref={[
          (element: HTMLDivElement) => {
            setRef(element);
          },
          (element: HTMLDivElement) => {
            assignRef(forwardedRef, element);
          },
        ]}
        data-selected={aria.isSelected || undefined}
        data-disabled={aria.isDisabled || undefined}
        data-hovered={hover.isHovered || undefined}
        data-focused={aria.isFocused || undefined}
        data-focus-visible={focus.isFocusVisible || undefined}
        data-pressed={aria.isPressed || undefined}
        data-allows-removing={aria.allowsRemoving || undefined}
        data-selection-mode={
          state.selectionManager.selectionMode === "none"
            ? undefined
            : state.selectionManager.selectionMode
        }
      >
        <dom.div {...aria.gridCellProps}>
          <ButtonContext
            value={{
              slots: {
                get remove() {
                  return aria.removeButtonProps;
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
          </ButtonContext>
        </dom.div>
      </dom.div>
    );
  }
);

export function Tag(
  props: TagProps & { ref?: Ref<HTMLDivElement> }
): JSX.Element {
  return (
    <TagCollection
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

export function TagGroup(
  input: TagGroupProps & { ref?: Ref<HTMLDivElement> }
): JSX.Element {
  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    TagGroupContext
  );

  return (
    <ListStateContext value={null}>
      <CollectionBuilder
        createCollection={() => new BaseCollection<object>()}
        content={props.children}
      >
        {(collection) => (
          <TagGroupInner
            props={props}
            collection={collection}
            groupRef={setRef}
          />
        )}
      </CollectionBuilder>
    </ListStateContext>
  );
}

function TagGroupInner(input: {
  props: TagGroupProps & SelectableCollectionContextValue<object>;
  collection: BaseCollection<object>;
  groupRef: (element: HTMLDivElement) => void;
}): JSX.Element {
  const [props, listRef, setListRef] = createContextProps(
    untrack(() => input.props),
    undefined,
    SelectableCollectionContext
  );

  const [registerLabel, label] = createSlot(
    () => !isTruthy(props["aria-label"]) && !isTruthy(props["aria-labelledby"])
  );

  const state = createListState(
    mergeProps(omit(props, "filter"), {
      children: undefined,
      get collection() {
        return props.filter
          ? input.collection.filter(props.filter)
          : input.collection;
      },
    })
  );

  const aria = createTagGroup(
    mergeProps(props, {
      get label() {
        return label();
      },
    }),
    state,
    listRef
  );

  return (
    <dom.div
      {...filterDOMProps(input.props, { global: true })}
      ref={input.groupRef}
      render={props.render}
      class={props.class ?? "solid2-aria-TagGroup"}
      style={props.style}
      slot={props.slot ?? undefined}
    >
      <LabelContext
        value={mergeProps(
          merge(() => aria.labelProps ?? {}),
          {
            get elementType(): "span" {
              return "span";
            },
            registerSlot: registerLabel,
          }
        )}
      >
        <TagListContext
          value={{
            get gridProps() {
              return aria.gridProps;
            },
            ref: (element: HTMLElement) => {
              setListRef(element);
            },
          }}
        >
          <ListStateContext value={state}>
            <TextContext
              value={{
                slots: {
                  get description() {
                    return aria.descriptionProps;
                  },
                  get errorMessage() {
                    return aria.errorMessageProps;
                  },
                },
              }}
            >
              {props.children}
            </TextContext>
          </ListStateContext>
        </TagListContext>
      </LabelContext>
    </dom.div>
  );
}

export function TagList<T>(
  input: TagListProps<T> & { ref?: Ref<HTMLDivElement> }
): JSX.Element {
  const state = useContext(ListStateContext);

  if (!state) {
    // oxlint-disable-next-line solid/components-return-once -- Static collection traversal and context registration are fixed when the owner is created.
    return <Collection {...input} />;
  }

  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    TagListContext
  );

  const context = createSlottedContext(TagListContext);
  const renderer = useContext(CollectionRendererContext);
  const Root = renderer.CollectionRoot;
  const focus = createFocusRing();

  const values: TagListRenderProps = {
    get isEmpty() {
      return state.collection.size === 0;
    },
    get isFocusVisible() {
      return focus.isFocusVisible;
    },
    get isFocused() {
      return focus.isFocused;
    },
    state,
  };

  const render = createRenderProps(
    mergeProps(props, {
      children: undefined,
      defaultClass: "solid2-aria-TagList",
      values,
    })
  );

  return (
    <dom.div
      {...mergeProps(
        filterDOMProps(props, { global: true }),
        merge(() => context?.gridProps ?? {}),
        merge(() => focus.focusProps ?? {}),
        render
      )}
      ref={(element: HTMLDivElement) => {
        setRef(element);
      }}
      data-empty={values.isEmpty || undefined}
      data-focused={focus.isFocused || undefined}
      data-focus-visible={focus.isFocusVisible || undefined}
    >
      <Root collection={state.collection} />
      {values.isEmpty && props.renderEmptyState
        ? props.renderEmptyState(values)
        : null}
    </dom.div>
  );
}
