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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/Tabs.tsx.
 * Modified for Solid Aria: adapted collection ownership, contexts, accessibility primitives, and reactive properties for Solid 2; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import {
  ItemNode,
  BaseCollection,
} from "@solid2-aria/core/collections/base-collection";
import {
  Collection,
  CollectionBuilder,
  createLeafComponent,
} from "@solid2-aria/core/collections/collection-builder";
import { createIsHidden } from "@solid2-aria/core/collections/hidden";
import { createFocusRing } from "@solid2-aria/core/focus/create-focus-ring";
import { createHover } from "@solid2-aria/core/interactions/create-hover";
import { createTab } from "@solid2-aria/core/tabs/create-tab";
import { createTabList } from "@solid2-aria/core/tabs/create-tab-list";
import type { AriaTabListProps } from "@solid2-aria/core/tabs/create-tab-list";
import { createTabPanel } from "@solid2-aria/core/tabs/create-tab-panel";
import type { AriaTabPanelProps } from "@solid2-aria/core/tabs/create-tab-panel";
import {
  createEnterAnimation,
  createExitAnimation,
} from "@solid2-aria/core/utils/animation";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { isTruthy } from "@solid2-aria/core/utils/truthy";
import { createTabListState } from "@solid2-aria/stately/tabs/create-tab-list-state";
import type { TabListState } from "@solid2-aria/stately/tabs/create-tab-list-state";
import type {
  AriaLabelingProps,
  FocusEvents,
  HoverEvents,
  Key,
  LinkDOMProps,
  PressEvents,
  Orientation,
  Node,
} from "@solid2-aria/types-shared";
import type { GlobalDOMAttributes } from "@solid2-aria/types-shared-web";
import { dynamic } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import {
  merge,
  createSignal,
  createContext,
  useContext,
  omit,
  Show,
  untrack,
} from "solid-js";
import type { Accessor } from "solid-js";

import {
  CollectionRendererContext,
  DefaultCollectionRenderer,
} from "./collection";
import type { CollectionProps } from "./collection";
import { SelectionIndicatorContext } from "./selection-indicator";
import {
  dom,
  createContextProps,
  createRenderProps,
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

export const TabsContext =
  createContext<ContextValue<TabsProps, HTMLDivElement>>(null);

export const TabListStateContext = createContext<TabListState<unknown> | null>(
  null
);

export interface TabsProps
  // oxlint-disable-next-line typescript/no-explicit-any -- Collection contexts erase item types; each typed factory restores its owner's item contract.
  extends
    Omit<AriaTabListProps<unknown>, "items" | "children">,
    RenderProps<TabsRenderProps>,
    SlotProps,
    GlobalDOMAttributes<HTMLDivElement> {
  /**
   * The CSS [class](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/class) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-Tabs'
   */
  class?: ClassOrFunction<TabsRenderProps>;
}

export interface TabsRenderProps {
  /**
   * The orientation of the tabs.
   *
   * @selector [data-orientation="horizontal | vertical"]
   */
  orientation: Orientation;
}

export interface TabListProps<T>
  extends
    StyleRenderProps<TabListRenderProps>,
    AriaLabelingProps,
    Omit<CollectionProps<T>, "disabledKeys">,
    GlobalDOMAttributes<HTMLDivElement> {
  /**
   * The CSS [class](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/class) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-TabList'
   */
  class?: ClassOrFunction<TabListRenderProps>;
}

export interface TabListRenderProps {
  /**
   * The orientation of the tab list.
   *
   * @selector [data-orientation="horizontal | vertical"]
   */
  orientation: Orientation;
  /**
   * State of the tab list.
   */
  state: TabListState<unknown>;
}

export interface TabProps
  extends
    Omit<RenderProps<TabRenderProps>, "render">,
    PossibleLinkDOMRenderProps<"div", TabRenderProps>,
    AriaLabelingProps,
    LinkDOMProps,
    HoverEvents,
    FocusEvents,
    PressEvents,
    Omit<GlobalDOMAttributes<HTMLDivElement>, "onClick"> {
  /**
   * The CSS [class](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/class) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-Tab'
   */
  class?: ClassOrFunction<TabRenderProps>;
  /** The unique id of the tab. */
  id?: Key;
  /** Whether the tab is disabled. */
  isDisabled?: boolean;
}

export interface TabRenderProps {
  /**
   * Whether the tab is currently hovered with a mouse.
   *
   * @selector [data-hovered]
   */
  isHovered: boolean;
  /**
   * Whether the tab is currently in a pressed state.
   *
   * @selector [data-pressed]
   */
  isPressed: boolean;
  /**
   * Whether the tab is currently selected.
   *
   * @selector [data-selected]
   */
  isSelected: boolean;
  /**
   * Whether the tab is currently focused.
   *
   * @selector [data-focused]
   */
  isFocused: boolean;
  /**
   * Whether the tab is currently keyboard focused.
   *
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean;
  /**
   * Whether the tab is disabled.
   *
   * @selector [data-disabled]
   */
  isDisabled: boolean;
}

export interface TabPanelProps
  extends
    AriaTabPanelProps,
    RenderProps<TabPanelRenderProps>,
    GlobalDOMAttributes<HTMLDivElement> {
  /**
   * The CSS [class](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/class) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-TabPanel'
   */
  class?: ClassOrFunction<TabPanelRenderProps>;
  /**
   * Whether to mount the tab panel in the DOM even when it is not currently selected. Inactive tab
   * panels are inert and cannot be interacted with. They must be styled appropriately so this is
   * clear to the user visually.
   *
   * @default false
   */
  shouldForceMount?: boolean;
}

export interface TabPanelRenderProps {
  /**
   * Whether the tab panel is currently focused.
   *
   * @selector [data-focused]
   */
  isFocused: boolean;
  /**
   * Whether the tab panel is currently keyboard focused.
   *
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean;
  /**
   * Whether the tab panel is currently non-interactive. This occurs when the
   * `shouldForceMount` prop is true, and the corresponding tab is not selected.
   *
   * @selector [data-inert]
   */
  isInert: boolean;
  /**
   * Whether the tab panel is currently entering. Use this to apply animations.
   *
   * @selector [data-entering]
   */
  isEntering: boolean;
  /**
   * Whether the tab panel is currently exiting. Use this to apply animations.
   *
   * @selector [data-exiting]
   */
  isExiting: boolean;
  /**
   * State of the tab list.
   */
  state: TabListState<unknown>;
}

export interface TabPanelsProps<T>
  extends
    Omit<CollectionProps<T>, "disabledKeys">,
    StyleProps,
    DOMRenderProps<"div", undefined>,
    GlobalDOMAttributes<HTMLDivElement> {
  /**
   * The CSS [class](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/class) for the
   * element.
   *
   * @default 'react-aria-TabPanels'
   */
  class?: JSX.ClassValue;
}

const TabCollection = createLeafComponent(
  ItemNode,
  (
    props: TabProps,
    forwardedRef: Ref<HTMLDivElement>,
    node: Node<unknown>
  ): JSX.Element => {
    const state = useContext(TabListStateContext);

    if (!state) {
      throw new Error("Tab must be rendered in Tabs.");
    }

    const [ref, setRef] = createSignal<HTMLDivElement | null>(null, {
      ownedWrite: true,
    });

    const aria = createTab(
      mergeProps(props, {
        get key() {
          return node.key;
        },
      }),
      state,
      ref
    );

    const focus = createFocusRing();

    const hover = createHover(
      mergeProps(props, {
        get isDisabled() {
          return aria.isDisabled;
        },
      })
    );

    const values: TabRenderProps = {
      get isDisabled() {
        return aria.isDisabled;
      },
      get isFocusVisible() {
        return focus.isFocusVisible;
      },
      get isFocused() {
        return focus.isFocused;
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
    };

    const render = createRenderProps(
      mergeProps(props, { defaultClass: "solid2-aria-Tab", values })
    );

    const Element = dynamic(() => (isTruthy(props.href) ? dom.a : dom.div));

    return (
      <Element
        {...mergeProps(
          omit(filterDOMProps(props, { global: true }), "id", "onClick"),
          merge(() => aria.tabProps ?? {}),
          merge(() => focus.focusProps ?? {}),
          merge(() => hover.hoverProps ?? {}),
          render
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
        data-pressed={aria.isPressed || undefined}
        data-focused={focus.isFocused || undefined}
        data-focus-visible={focus.isFocusVisible || undefined}
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
      </Element>
    );
  }
);

export function TabPanels<T>(
  props: TabPanelsProps<T> & { ref?: Ref<HTMLDivElement> }
): JSX.Element {
  if (createIsHidden()) {
    // oxlint-disable-next-line solid/components-return-once -- Static collection traversal and context registration are fixed when the owner is created.
    return null;
  }

  return (
    <dom.div
      {
        // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
        ...omit(filterDOMProps(props, { global: true, labelable: true }), "id")
        // oxlint-enable solid/reactivity
      }
      ref={props.ref}
      render={props.render}
      class={props.class ?? "solid2-aria-TabPanels"}
      style={props.style}
    >
      <Collection {...props} />
    </dom.div>
  );
}

export function TabPanel(
  props: TabPanelProps & { ref?: Ref<HTMLDivElement> }
): JSX.Element {
  if (createIsHidden()) {
    // oxlint-disable-next-line solid/components-return-once -- Static collection traversal and context registration are fixed when the owner is created.
    return null;
  }

  const state = useContext(TabListStateContext);

  if (!state) {
    throw new Error("TabPanel must be rendered in Tabs.");
  }

  const [panelRef, setPanelRef] = createSignal<HTMLDivElement | null>(null, {
    ownedWrite: true,
  });

  const initiallySelected = untrack(() => state.selectedKey === props.id);

  const exiting = createExitAnimation(
    panelRef,
    () => state.selectedKey === props.id
  );

  return (
    <Show
      when={
        (state.selectedKey === props.id || props.shouldForceMount) ?? exiting()
      }
    >
      <TabPanelInner
        props={props}
        state={state}
        panelRef={panelRef}
        setPanelRef={(element: HTMLDivElement) => {
          setPanelRef(element);
        }}
        initiallySelected={initiallySelected}
        exiting={exiting}
      />
    </Show>
  );
}

function TabPanelInner(input: {
  props: TabPanelProps & { ref?: Ref<HTMLDivElement> };
  state: TabListState<unknown>;
  panelRef: Accessor<HTMLDivElement | null>;
  setPanelRef: (element: HTMLDivElement) => void;
  initiallySelected: boolean;
  exiting: () => boolean;
}): JSX.Element {
  const ref = untrack(() => input.panelRef);

  const aria = createTabPanel(
    untrack(() => input.props),
    untrack(() => input.state),
    ref
  );

  const focus = createFocusRing();
  const selected = () => input.state.selectedKey === input.props.id;
  const entering = createEnterAnimation(ref);

  const values: TabPanelRenderProps = {
    get isEntering() {
      return !input.initiallySelected && entering();
    },
    get isExiting() {
      return input.exiting();
    },
    get isFocusVisible() {
      return focus.isFocusVisible;
    },
    get isFocused() {
      return focus.isFocused;
    },
    get isInert() {
      return !selected();
    },
    get state() {
      return input.state;
    },
  };

  const render = createRenderProps(
    mergeProps(
      merge(() => input.props ?? {}),
      { defaultClass: "solid2-aria-TabPanel", values }
    )
  );

  return (
    <dom.div
      {...mergeProps(
        omit(filterDOMProps(input.props, { global: true }), "id"),
        merge(() => aria.tabPanelProps ?? {}),
        merge(() => focus.focusProps ?? {}),
        render
      )}
      ref={[
        (element: HTMLDivElement) => {
          input.setPanelRef(element);
        },
        (element: HTMLDivElement) => {
          assignRef(
            untrack(() => input.props.ref),
            element
          );
        },
      ]}
      inert={!selected() || input.props.inert}
      data-entering={values.isEntering || undefined}
      data-exiting={values.isExiting || undefined}
      data-inert={!selected() || undefined}
      data-focused={focus.isFocused || undefined}
      data-focus-visible={focus.isFocusVisible || undefined}
    >
      <TabsContext value={null}>
        <TabListStateContext value={null}>
          <CollectionRendererContext value={DefaultCollectionRenderer}>
            {render.children}
          </CollectionRendererContext>
        </TabListStateContext>
      </TabsContext>
    </dom.div>
  );
}

export function Tab(
  props: TabProps & { ref?: Ref<HTMLDivElement> }
): JSX.Element {
  return (
    <TabCollection
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

export function Tabs(
  input: TabsProps & { ref?: Ref<HTMLDivElement> }
): JSX.Element {
  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    TabsContext
  );

  const values: TabsRenderProps = {
    get orientation() {
      return props.orientation ?? "horizontal";
    },
  };

  const content = () => {
    const child = props.children;

    return typeof child === "function"
      ? child({ ...values, defaultChildren: undefined })
      : child;
  };

  return (
    <TabListStateContext value={null}>
      <CollectionBuilder
        createCollection={() => new BaseCollection<object>()}
        content={content()}
      >
        {(collection) => (
          <TabsInner props={props} collection={collection} tabsRef={setRef} />
        )}
      </CollectionBuilder>
    </TabListStateContext>
  );
}

function TabsInner(input: {
  props: TabsProps;
  collection: BaseCollection<object>;
  tabsRef: (element: HTMLDivElement) => void;
}): JSX.Element {
  const state = createTabListState(
    mergeProps(
      merge(() => input.props ?? {}),
      {
        children: undefined,
        get collection() {
          return input.collection;
        },
      }
    )
  );

  const focus = createFocusRing({ within: true });

  const values: TabsRenderProps = {
    get orientation() {
      return input.props.orientation ?? "horizontal";
    },
  };

  const render = createRenderProps(
    mergeProps(
      merge(() => input.props ?? {}),
      { defaultClass: "solid2-aria-Tabs", values }
    )
  );

  const tabProps = merge(() => input.props);

  return (
    <dom.div
      {...mergeProps(
        filterDOMProps(input.props, { global: true }),
        merge(() => focus.focusProps ?? {}),
        render
      )}
      ref={input.tabsRef}
      slot={input.props.slot ?? undefined}
      data-orientation={values.orientation}
      data-focused={focus.isFocused || undefined}
      data-focus-visible={focus.isFocusVisible || undefined}
      data-disabled={state.isDisabled || undefined}
    >
      <TabsContext value={tabProps}>
        <TabListStateContext value={state}>
          {render.children}
        </TabListStateContext>
      </TabsContext>
    </dom.div>
  );
}

export function TabList<T>(
  props: TabListProps<T> & { ref?: Ref<HTMLDivElement> }
): JSX.Element {
  const state = useContext(TabListStateContext);

  if (!state) {
    // oxlint-disable-next-line solid/components-return-once -- Static collection traversal and context registration are fixed when the owner is created.
    return <Collection {...props} />;
  }

  return <TabListInner props={props} state={state} />;
}

function TabListInner<T>(input: {
  props: TabListProps<T> & { ref?: Ref<HTMLDivElement> };
  state: TabListState<unknown>;
}): JSX.Element {
  const context = createSlottedContext(TabsContext);

  const [ref, setRef] = createSignal<HTMLDivElement | null>(null, {
    ownedWrite: true,
  });

  const renderer = useContext(CollectionRendererContext);
  const Root = renderer.CollectionRoot;

  const aria = createTabList(
    mergeProps(
      merge(() => input.props ?? {}),
      {
        get keyboardActivation() {
          return context?.keyboardActivation;
        },
        get orientation() {
          return context?.orientation;
        },
      }
    ),
    untrack(() => input.state),
    ref
  );

  const values: TabListRenderProps = {
    get orientation() {
      return context?.orientation ?? "horizontal";
    },
    get state() {
      return input.state;
    },
  };

  const render = createRenderProps(
    mergeProps(
      merge(() => input.props ?? {}),
      {
        children: undefined,
        defaultClass: "solid2-aria-TabList",
        values,
      }
    )
  );

  return (
    <dom.div
      {...mergeProps(
        omit(filterDOMProps(input.props, { global: true }), "id"),
        merge(() => aria.tabListProps ?? {}),
        render
      )}
      ref={[
        (element: HTMLDivElement) => {
          setRef(element);
        },
        (element: HTMLDivElement) => {
          assignRef(
            untrack(() => input.props.ref),
            element
          );
        },
      ]}
      data-orientation={values.orientation}
    >
      <Root collection={input.state.collection} />
    </dom.div>
  );
}
