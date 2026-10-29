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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/Menu.tsx.
 * Modified for Solid Aria: adapted collection ownership, contexts, accessibility primitives, and reactive properties for Solid 2; uses Solid class props and press responders for custom triggers.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import {
  ItemNode,
  SectionNode,
  LoaderNode,
  CollectionNode,
  BaseCollection,
} from "@solid2-aria/core/collections/base-collection";
import {
  Collection,
  CollectionBuilder,
  createLeafComponent,
  createBranchComponent,
} from "@solid2-aria/core/collections/collection-builder";
import { createIsHidden } from "@solid2-aria/core/collections/hidden";
import { createHover } from "@solid2-aria/core/interactions/create-hover";
import { PressResponder } from "@solid2-aria/core/interactions/press-responder";
import { createMenu } from "@solid2-aria/core/menu/create-menu";
import type { AriaMenuProps } from "@solid2-aria/core/menu/create-menu";
import { createMenuItem } from "@solid2-aria/core/menu/create-menu-item";
import { createMenuSection } from "@solid2-aria/core/menu/create-menu-section";
import { createMenuTrigger } from "@solid2-aria/core/menu/create-menu-trigger";
import { createSubmenuTrigger } from "@solid2-aria/core/menu/create-submenu-trigger";
import { createLoadMoreSentinel } from "@solid2-aria/core/utils/create-load-more-sentinel";
import type { LoadMoreSentinelProps } from "@solid2-aria/core/utils/create-load-more-sentinel";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { isTruthy } from "@solid2-aria/core/utils/truthy";
import { createMenuTriggerState } from "@solid2-aria/stately/menu/create-menu-trigger-state";
import type {
  MenuTriggerProps as BaseMenuTriggerProps,
  RootMenuTriggerState,
} from "@solid2-aria/stately/menu/create-menu-trigger-state";
import { createSubmenuTriggerState } from "@solid2-aria/stately/menu/create-submenu-trigger-state";
import { createMultipleSelectionState } from "@solid2-aria/stately/selection/create-multiple-selection-state";
import { SelectionManager } from "@solid2-aria/stately/selection/selection-manager";
import type { MultipleSelectionState } from "@solid2-aria/stately/selection/types";
import { createTreeState } from "@solid2-aria/stately/tree/create-tree-state";
import type { TreeState } from "@solid2-aria/stately/tree/create-tree-state";
import type {
  FocusableElement,
  FocusEvents,
  HoverEvents,
  Key,
  LinkDOMProps,
  MultipleSelection,
  PressEvents,
  Node,
  FocusStrategy,
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
import type { Accessor } from "solid-js";

import { SelectableCollectionContext, FieldInputContext } from "./autocomplete";
import type { SelectableCollectionContextValue } from "./autocomplete";
import { CollectionRendererContext, SectionContext } from "./collection";
import type {
  CollectionProps,
  ItemRenderProps,
  SectionProps,
} from "./collection";
import { OverlayTriggerStateContext } from "./dialog";
import { HeaderContext } from "./header";
import { KeyboardContext } from "./keyboard";
import { PopoverContext } from "./popover";
import { SelectionIndicatorContext } from "./selection-indicator";
import { TextContext } from "./text";
import {
  dom,
  createContextProps,
  createRenderProps,
  createSlot,
  DEFAULT_SLOT,
  createSlottedContext,
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

export const MenuContext =
  createContext<ContextValue<MenuProps<unknown>, HTMLDivElement>>(null);

export const MenuStateContext = createContext<TreeState<unknown> | null>(null);

export const RootMenuTriggerStateContext =
  createContext<RootMenuTriggerState | null>(null);

const SelectionManagerContext = createContext<SelectionManager | null>(null);

const MenuItemContext = createContext<
  ContextValue<
    MenuItemProps<unknown> & {
      isOpen?: boolean;
      "aria-haspopup"?: "menu" | "dialog";
      "aria-expanded"?: boolean | "true" | "false";
      "aria-controls"?: string;
    },
    HTMLDivElement
  >
>(null);

const SubmenuContext = createContext<{
  parentMenuRef: Accessor<HTMLElement | null>;
  shouldUseVirtualFocus?: boolean;
} | null>(null);

const SubmenuCaptureContext = createContext(false);

export interface MenuTriggerProps extends BaseMenuTriggerProps {
  children: JSX.Element;
}

export interface SubmenuTriggerProps {
  /**
   * The contents of the SubmenuTrigger. The first child should be an Item (the trigger) and the
   * second child should be the Popover (for the submenu).
   */
  children: JSX.Element[];
  /**
   * The delay time in milliseconds for the submenu to appear after hovering over the trigger.
   *
   * @default 200
   */
  delay?: number;
}

export interface MenuRenderProps {
  /**
   * Whether the menu has no items and should display its empty state.
   *
   * @selector [data-empty]
   */
  isEmpty: boolean;
}

export interface MenuProps<T>
  extends
    Omit<AriaMenuProps<T>, "children">,
    CollectionProps<T>,
    StyleRenderProps<MenuRenderProps>,
    SlotProps,
    GlobalDOMAttributes<HTMLDivElement> {
  /**
   * The CSS [class](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/class) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-Menu'
   */
  class?: ClassOrFunction<MenuRenderProps>;
  /** Provides content to display when there are no items in the menu. */
  renderEmptyState?: () => JSX.Element;
  /** Whether the menu should close when the menu item is selected. */
  shouldCloseOnSelect?: boolean;
}

export interface MenuSectionProps<T>
  extends
    SectionProps<T>,
    Omit<MultipleSelection, "disabledKeys">,
    DOMRenderProps<"section", undefined> {
  /**
   * The CSS [class](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/class) for the
   * element.
   *
   * @default 'react-aria-MenuSection'
   */
  class?: JSX.ClassValue;
  /** Whether the menu should close when the menu item is selected. */
  shouldCloseOnSelect?: boolean;
}

export interface MenuItemRenderProps extends ItemRenderProps {
  /**
   * Whether the item has a submenu.
   *
   * @selector [data-has-submenu]
   */
  hasSubmenu: boolean;
  /**
   * Whether the item's submenu is open.
   *
   * @selector [data-open]
   */
  isOpen: boolean;
}

export interface MenuItemProps<T = object>
  extends
    Omit<RenderProps<MenuItemRenderProps>, "render">,
    PossibleLinkDOMRenderProps<"div", MenuItemRenderProps>,
    LinkDOMProps,
    HoverEvents,
    FocusEvents,
    PressEvents,
    Omit<GlobalDOMAttributes<HTMLDivElement>, "onClick"> {
  /**
   * The CSS [class](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/class) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-MenuItem'
   */
  class?: ClassOrFunction<MenuItemRenderProps>;
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
  /** Handler that is called when the item is selected. */
  onAction?: () => void;
  /** Whether the menu should close when the menu item is selected. */
  shouldCloseOnSelect?: boolean;
}

export interface MenuLoadMoreItemProps
  extends
    Omit<LoadMoreSentinelProps, "collection" | "direction">,
    StyleProps,
    DOMRenderProps<"div", undefined>,
    GlobalDOMAttributes<HTMLDivElement> {
  /**
   * The CSS [class](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/class) for the
   * element.
   *
   * @default 'react-aria-MenuLoadingIndicator'
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

export function MenuTrigger(props: MenuTriggerProps): JSX.Element {
  const [scrollRef, setScrollRef] = createSignal<HTMLDivElement | null>(null, {
    ownedWrite: true,
  });

  if (createIsHidden()) {
    // oxlint-disable-next-line solid/components-return-once -- Static collection traversal and context registration are fixed when the owner is created.
    return null;
  }

  const state = createMenuTriggerState(props);

  const [ref, setRef] = createSignal<FocusableElement | null>(null, {
    ownedWrite: true,
  });

  const aria = createMenuTrigger(
    mergeProps(props, {
      get type(): "menu" {
        return "menu";
      },
    }),
    state,
    ref
  );

  return (
    <MenuContext
      value={mergeProps(
        merge(() => aria.menuProps ?? {}),
        {
          ref: (element: HTMLDivElement) => {
            setScrollRef(element);
          },
        }
      )}
    >
      <OverlayTriggerStateContext value={state}>
        <RootMenuTriggerStateContext value={state}>
          <PopoverContext
            value={mergeProps(
              {
                get placement(): "bottom start" {
                  return "bottom start";
                },
                scrollRef,
                trigger: "MenuTrigger",
                triggerRef: ref,
              },
              {
                get "aria-labelledby"() {
                  return aria.menuProps["aria-labelledby"];
                },
                get offset() {
                  return props.trigger === "contextMenu" ? 0 : undefined;
                },
              }
            )}
          >
            <PressResponder
              {
                // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
                ...merge(() => aria.menuTriggerProps ?? {})
                // oxlint-enable solid/reactivity
              }
              isPressed={state.isOpen}
              ref={(element) => {
                setRef(element);
              }}
            >
              {props.children}
            </PressResponder>
          </PopoverContext>
        </RootMenuTriggerStateContext>
      </OverlayTriggerStateContext>
    </MenuContext>
  );
}

export function Menu<T extends object>(
  input: MenuProps<T> & { ref?: Ref<HTMLDivElement> }
): JSX.Element {
  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    MenuContext
  );

  return (
    <CollectionBuilder
      createCollection={() => new BaseCollection<T>()}
      content={<Collection {...props} />}
    >
      {(collection) => (
        <MenuInner props={props} collection={collection} menuRef={setRef} />
      )}
    </CollectionBuilder>
  );
}

function MenuInner<T extends object>(input: {
  props: MenuProps<T> & SelectableCollectionContextValue<T>;
  collection: BaseCollection<T>;
  menuRef: (element: HTMLDivElement) => void;
}): JSX.Element {
  const [props, ref, setRef] = createContextProps(
    untrack(() => input.props),
    untrack(() => input.menuRef),
    SelectableCollectionContext
  );

  const renderer = useContext(CollectionRendererContext);
  const Root = renderer.CollectionRoot;

  const state = createTreeState(
    mergeProps(omit(props, "items", "filter"), {
      children: undefined,
      get collection() {
        return props.filter
          ? input.collection.filter(props.filter)
          : input.collection;
      },
    })
  );

  const trigger =
    useContext(RootMenuTriggerStateContext) ?? createMenuTriggerState({});

  const aria = createMenu(
    mergeProps(omit(props, "items", "children"), {
      get isVirtualized() {
        return renderer.isVirtualized;
      },
      get onClose() {
        return props.onClose ?? trigger.close;
      },
    }),
    state,
    ref
  );

  const render = createRenderProps(
    mergeProps(props, {
      children: undefined,
      defaultClass: "solid2-aria-Menu",
      values: {
        get isEmpty() {
          return state.collection.size === 0;
        },
      },
    })
  );

  return (
    <dom.div
      {...mergeProps(
        filterDOMProps(props, { global: true }),
        render,
        merge(() => aria.menuProps ?? {})
      )}
      ref={(element: HTMLDivElement) => {
        setRef(element);
      }}
      slot={props.slot ?? undefined}
      data-empty={state.collection.size === 0 || undefined}
    >
      <MenuStateContext value={state}>
        <SelectionManagerContext value={untrack(() => state.selectionManager)}>
          <RootMenuTriggerStateContext value={trigger}>
            <SubmenuContext
              value={{
                parentMenuRef: ref,
                get shouldUseVirtualFocus() {
                  return props.shouldUseVirtualFocus;
                },
              }}
            >
              <MenuItemContext
                value={{
                  get shouldCloseOnSelect() {
                    return props.shouldCloseOnSelect;
                  },
                }}
              >
                <SelectableCollectionContext value={null}>
                  <FieldInputContext value={null}>
                    <SectionContext
                      value={{
                        name: "MenuSection",
                        render: (
                          sectionProps,
                          sectionRef,
                          node,
                          defaultClass
                        ) =>
                          MenuSectionInner(
                            sectionProps,
                            sectionRef,
                            node,
                            defaultClass
                          ),
                      }}
                    >
                      <Root collection={state.collection} scrollRef={ref} />
                    </SectionContext>
                  </FieldInputContext>
                </SelectableCollectionContext>
              </MenuItemContext>
            </SubmenuContext>
          </RootMenuTriggerStateContext>
        </SelectionManagerContext>
      </MenuStateContext>
      {state.collection.size === 0 && props.renderEmptyState ? (
        <div role="menuitem" style={{ display: "contents" }}>
          {props.renderEmptyState()}
        </div>
      ) : null}
    </dom.div>
  );
}

class GroupSelectionManager extends SelectionManager {
  private readonly parent: SelectionManager;
  constructor(parent: SelectionManager, state: MultipleSelectionState) {
    super(parent.collection, state);
    this.parent = parent;
  }
  override get focusedKey() {
    return this.parent.focusedKey;
  }
  override get isFocused() {
    return this.parent.isFocused;
  }
  override setFocusedKey(key: Key | null, strategy?: FocusStrategy) {
    this.parent.setFocusedKey(key, strategy);
  }
  override setFocused(value: boolean) {
    this.parent.setFocused(value);
  }
  override get childFocusStrategy() {
    return this.parent.childFocusStrategy;
  }
}

function MenuSectionInner(
  // oxlint-disable-next-line typescript/no-explicit-any -- Collection contexts erase item types; each typed factory restores its owner's item contract.
  props: MenuSectionProps<any>,
  ref: Ref<HTMLElement>,
  node: Node<unknown>,
  defaultClass = "solid2-aria-MenuSection"
): JSX.Element {
  const state = useContext(MenuStateContext);
  const parent = useContext(SelectionManagerContext);

  if (!state || !parent) {
    throw new Error("MenuSection must be rendered in a Menu.");
  }

  const renderer = useContext(CollectionRendererContext);
  const Branch = renderer.CollectionBranch;
  const [registerHeading, heading] = createSlot();

  const aria = createMenuSection({
    get "aria-label"() {
      return props["aria-label"] ?? undefined;
    },
    get heading() {
      return heading();
    },
  });

  const selection = createMultipleSelectionState(props);

  const manager = createMemo(() =>
    props.selectionMode === null || props.selectionMode === undefined
      ? parent
      : new GroupSelectionManager(parent, selection)
  );

  const context = createSlottedContext(MenuItemContext);

  return (
    <dom.section
      {...mergeProps(
        omit(filterDOMProps(props, { global: true }), "id"),
        merge(() => aria.groupProps ?? {})
      )}
      ref={ref}
      render={props.render}
      class={props.class ?? defaultClass}
      style={props.style}
    >
      <HeaderContext
        value={mergeProps(
          merge(() => aria.headingProps ?? {}),
          { registerSlot: registerHeading }
        )}
      >
        <SelectionManagerContext value={untrack(manager)}>
          <MenuItemContext
            value={{
              get shouldCloseOnSelect() {
                return (
                  props.shouldCloseOnSelect ?? context?.shouldCloseOnSelect
                );
              },
            }}
          >
            <Branch collection={state.collection} parent={node} />
          </MenuItemContext>
        </SelectionManagerContext>
      </HeaderContext>
    </dom.section>
  );
}

const MenuSectionCollection = createBranchComponent(
  SectionNode,
  MenuSectionInner
);

const MenuItemCollection = createLeafComponent(
  ItemNode,
  <T,>(
    input: MenuItemProps<T>,
    forwardedRef: Ref<HTMLDivElement>,
    node: Node<T>
  ): JSX.Element => {
    const [props, ref, setRef] = createContextProps(
      input,
      forwardedRef,
      MenuItemContext
    );

    const context = createSlottedContext(MenuItemContext);
    const state = useContext(MenuStateContext);

    if (!state) {
      throw new Error("MenuItem must be rendered in a Menu.");
    }

    const manager =
      useContext(SelectionManagerContext) ?? state.selectionManager;

    const renderer = useContext(CollectionRendererContext);

    const aria = createMenuItem(
      mergeProps(
        omit(props, "id", "onAction"),
        context
          ? // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
            omit(context, "id", "onAction")
          : // oxlint-enable solid/reactivity
            undefined,
        {
          get isVirtualized() {
            return renderer.isVirtualized;
          },
          get key() {
            return node.key;
          },
          selectionManager: manager,
        }
      ),
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

    const values: MenuItemRenderProps = {
      get hasSubmenu() {
        return !!context?.["aria-haspopup"];
      },
      get isDisabled() {
        return aria.isDisabled;
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
      get isOpen() {
        return context?.isOpen === true;
      },
      get isPressed() {
        return aria.isPressed;
      },
      get isSelected() {
        return aria.isSelected;
      },
      get selectionBehavior() {
        return manager.selectionBehavior;
      },
      get selectionMode() {
        return manager.selectionMode;
      },
    };

    const render = createRenderProps(
      mergeProps(props, { defaultClass: "solid2-aria-MenuItem", values })
    );

    const Element = dynamic(() => (isTruthy(props.href) ? dom.a : dom.div));

    return (
      <Element
        {...mergeProps(
          omit(filterDOMProps(props, { global: true }), "id", "onClick"),
          render,
          merge(() => aria.menuItemProps ?? {}),
          merge(() => hover.hoverProps ?? {})
        )}
        ref={(element: HTMLDivElement) => {
          setRef(element);
        }}
        data-selected={aria.isSelected || undefined}
        data-disabled={aria.isDisabled || undefined}
        data-hovered={hover.isHovered || undefined}
        data-focused={aria.isFocused || undefined}
        data-focus-visible={aria.isFocusVisible || undefined}
        data-pressed={aria.isPressed || undefined}
        data-has-submenu={values.hasSubmenu || undefined}
        data-open={values.isOpen || undefined}
        data-selection-mode={
          manager.selectionMode === "none" ? undefined : manager.selectionMode
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
          <KeyboardContext value={aria.keyboardShortcutProps}>
            <SelectionIndicatorContext
              value={{
                get isSelected() {
                  return aria.isSelected;
                },
              }}
            >
              {render.children}
            </SelectionIndicatorContext>
          </KeyboardContext>
        </TextContext>
      </Element>
    );
  }
);

class SubmenuTriggerNode extends CollectionNode<unknown> {
  static override readonly type = "submenutrigger";
  override filter(
    collection: BaseCollection<unknown>,
    target: BaseCollection<unknown>,
    filter: (text: string, node: Node<unknown>) => boolean
  ): this | null {
    const item =
      this.firstChildKey === null || this.firstChildKey === undefined
        ? null
        : collection.getItem(this.firstChildKey);

    if (item && filter(item.textValue, this)) {
      const clone = this.clone();
      target.addDescendants(clone, collection);

      return clone;
    }

    return null;
  }
}

const SubmenuTriggerCollection = createBranchComponent(
  SubmenuTriggerNode,
  (
    props: SubmenuTriggerProps & { renderPopover: () => JSX.Element },
    forwardedRef: Ref<HTMLDivElement>,
    item: Node<unknown>
  ): JSX.Element => {
    const [submenuRef, setSubmenuRef] = createSignal<HTMLDivElement | null>(
      null,
      { ownedWrite: true }
    );

    const state = useContext(MenuStateContext);
    const root = useContext(RootMenuTriggerStateContext);
    const parent = useContext(SubmenuContext);

    if (!state || !root || !parent) {
      throw new Error("SubmenuTrigger must be rendered in a Menu.");
    }

    const renderer = useContext(CollectionRendererContext);
    const Branch = renderer.CollectionBranch;
    const trigger = createSubmenuTriggerState({ triggerKey: item.key }, root);

    const [itemRef, setItemRef] = createSignal<HTMLDivElement | null>(null, {
      ownedWrite: true,
    });

    const aria = createSubmenuTrigger(
      mergeProps(props, parent, { submenuRef }),
      trigger,
      itemRef
    );

    return (
      <MenuItemContext
        value={mergeProps(
          merge(() => aria.submenuTriggerProps ?? {}),
          {
            onAction: undefined,
            ref: (element: HTMLDivElement) => {
              setItemRef(element);
            },
          }
        )}
      >
        <MenuContext
          value={mergeProps(
            merge(() => aria.submenuProps ?? {}),
            {
              ref: (element: HTMLDivElement) => {
                setSubmenuRef(element);
              },
            }
          )}
        >
          <OverlayTriggerStateContext value={trigger}>
            <PopoverContext
              value={mergeProps(
                merge(() => aria.popoverProps ?? {}),
                {
                  get "aria-labelledby"() {
                    return aria.submenuProps["aria-labelledby"];
                  },
                  get placement(): "end top" {
                    return "end top";
                  },
                  trigger: "SubmenuTrigger",
                  triggerRef: itemRef,
                }
              )}
            >
              <Branch collection={state.collection} parent={item} />
              <SubmenuCaptureContext value={true}>
                {props.renderPopover()}
              </SubmenuCaptureContext>
            </PopoverContext>
          </OverlayTriggerStateContext>
        </MenuContext>
      </MenuItemContext>
    );
  },
  (props) => untrack(() => props.children[0])
);

const MenuLoadMoreItemCollection = createLeafComponent(
  LoaderNode,
  (
    props: MenuLoadMoreItemProps,
    forwardedRef: Ref<HTMLDivElement>,
    _node: Node<unknown>
  ): JSX.Element => {
    const state = useContext(MenuStateContext);

    if (!state) {
      throw new Error("MenuLoadMoreItem must be rendered in a Menu.");
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
        defaultClass: "solid2-aria-MenuLoadingIndicator",
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
            ref={(element: HTMLDivElement) => {
              assignRef(forwardedRef, element);
            }}
            role="menuitem"
            tabindex={-1}
          >
            {render.children}
          </dom.div>
        </Show>
      </>
    );
  }
);

export function MenuSection<T>(
  props: MenuSectionProps<T> & { ref?: Ref<HTMLElement> }
): JSX.Element {
  return (
    <MenuSectionCollection
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

export function MenuItem<T>(
  props: MenuItemProps<T> & { ref?: Ref<HTMLDivElement> }
): JSX.Element {
  if (useContext(SubmenuCaptureContext) && !createIsHidden()) {
    // oxlint-disable-next-line solid/components-return-once -- Static collection traversal and context registration are fixed when the owner is created.
    return null;
  }

  return (
    <MenuItemCollection
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

export function SubmenuTrigger(
  props: SubmenuTriggerProps & { ref?: Ref<HTMLDivElement> }
): JSX.Element {
  return (
    <SubmenuTriggerCollection
      {...props}
      renderPopover={() => props.children[1]}
      ref={(element: HTMLDivElement) => {
        assignRef(
          untrack(() => props.ref),
          element
        );
      }}
    />
  );
}

export function MenuLoadMoreItem(
  props: MenuLoadMoreItemProps & { ref?: Ref<HTMLDivElement> }
): JSX.Element {
  return (
    <MenuLoadMoreItemCollection
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
