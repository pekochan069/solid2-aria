/*
 * Copyright 2026 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/NavigationTree.tsx.
 * Modified for Solid Aria: route synchronization, link slots and render values use Solid contexts and reactive getters; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { isPresent } from "@solid2-aria/core/utils/is-present";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { isTruthy } from "@solid2-aria/core/utils/truthy";
import type { TreeState } from "@solid2-aria/stately/tree/create-tree-state";
import { getNodeProps } from "@solid2-aria/stately/utils/get-node-props";
import type { Key, LinkDOMProps } from "@solid2-aria/types-shared";
import type { JSX } from "@solidjs/web";
import {
  merge,
  untrack,
  createContext,
  useContext,
  createSignal,
  createEffect,
  omit,
} from "solid-js";

import { LinkContext } from "./link";
import {
  Tree,
  TreeItem,
  TreeItemContent,
  TreeSection,
  TreeHeader,
} from "./tree";
import type {
  TreeProps,
  TreeItemProps,
  TreeItemRenderProps,
  TreeRenderProps,
  TreeSectionProps,
  TreeHeaderProps,
} from "./tree";
import { assignRef, dom, createContextProps } from "./utils";
import type {
  Ref,
  ContextValue,
  ClassOrFunction,
  StyleRenderProps,
  ChildrenOrFunction,
} from "./utils";

export type NavigationTreeRenderProps = Pick<
  TreeRenderProps,
  "isEmpty" | "isFocused" | "isFocusVisible" | "state"
>;

export interface NavigationTreeProps<T>
  extends
    Omit<
      TreeProps<T>,
      | "selectionMode"
      | "selectionBehavior"
      | "selectedKeys"
      | "defaultSelectedKeys"
      | "onSelectionChange"
      | "disallowEmptySelection"
      | "disabledBehavior"
      | "keyboardNavigationBehavior"
      | "escapeKeyBehavior"
      | "shouldSelectOnPressUp"
      | "dragAndDropHooks"
      | "renderEmptyState"
      | "onAction"
      | "class"
      | "style"
      | "render"
    >,
    StyleRenderProps<NavigationTreeRenderProps> {
  class?: ClassOrFunction<NavigationTreeRenderProps>;

  selectedRoute?: string | null;
}

export interface NavigationTreeItemRenderProps extends TreeItemRenderProps {
  isCurrent: boolean;

  isCurrentAncestor: boolean;
}

export interface NavigationTreeItemProps<T = object>
  extends
    Omit<
      TreeItemProps<T>,
      | "class"
      | "style"
      | "render"
      | "onAction"
      | "allowsArrowNavigation"
      | "value"
    >,
    StyleRenderProps<NavigationTreeItemRenderProps> {
  class?: ClassOrFunction<NavigationTreeItemRenderProps>;

  children: JSX.Element;
}

export type NavigationTreeItemContentRenderProps =
  NavigationTreeItemRenderProps;

export interface NavigationTreeItemContentProps {
  children: ChildrenOrFunction<NavigationTreeItemContentRenderProps>;
}

export type NavigationTreeSectionProps<T> = Omit<TreeSectionProps<T>, "value">;

export type NavigationTreeHeaderProps = TreeHeaderProps;

export const NavigationTreeContext =
  // oxlint-disable-next-line typescript/no-explicit-any -- The collection owner and its descendants share one item type through this context.
  createContext<ContextValue<NavigationTreeProps<any>, HTMLDivElement>>(null);

export const NavigationTreeItemStateContext = createContext<{
  isCurrentAncestor: boolean;
}>({ isCurrentAncestor: false });

interface NavigationRoute {
  selectedRoute?: string | null;
  syncedRoute?: string;
}

const RouteContext = createContext<NavigationRoute>({});

const ItemLinkContext = createContext<
  LinkDOMProps & {
    isCurrent: boolean;
    isLinkFocused: boolean;
    setLinkFocused: (value: boolean) => void;
  }
>({
  isCurrent: false,
  isLinkFocused: false,
  setLinkFocused: () => {
    /* empty */
  },
});

export function NavigationTree<T>(
  input: NavigationTreeProps<T> & { ref?: Ref<HTMLDivElement> }
) {
  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    NavigationTreeContext
  );

  const route: NavigationRoute = {
    get selectedRoute() {
      return props.selectedRoute;
    },
    syncedRoute: undefined,
  };

  return (
    <RouteContext value={route}>
      <Tree
        {
          // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
          ...omit(props, "selectedRoute")
          // oxlint-enable solid/reactivity
        }
        ref={(element: HTMLDivElement) => {
          setRef(element);
        }}
        class={props.class ?? "solid2-aria-NavigationTree"}
        selectionMode="none"
        keyboardNavigationBehavior="tab"
      />
    </RouteContext>
  );
}

function selectedAncestors(
  state: TreeState<unknown>,
  route: string | null | undefined
): Set<Key> {
  const result = new Set<Key>();

  if (!isPresent(route)) {
    return result;
  }

  for (const key of state.collection.getKeys()) {
    if (getNodeProps(state.collection.getItem(key)).href === route) {
      let node = state.collection.getItem(key);

      while (isPresent(node?.parentKey) && !result.has(node.parentKey)) {
        result.add(node.parentKey);
        node = state.collection.getItem(node.parentKey);
      }

      break;
    }
  }

  return result;
}

export function NavigationTreeItem<T>(
  props: NavigationTreeItemProps<T> & { ref?: Ref<HTMLDivElement> }
) {
  const route = useContext(RouteContext);
  const [focused, setFocused] = createSignal(false);

  const link = mergeProps(props, {
    get isCurrent() {
      return isTruthy(props.href) && props.href === route.selectedRoute;
    },
    get isLinkFocused() {
      return focused();
    },
    setLinkFocused: setFocused,
  });

  const values = (tree: TreeItemRenderProps): NavigationTreeItemRenderProps =>
    mergeProps(tree, {
      get isCurrent() {
        return link.isCurrent;
      },
      get isCurrentAncestor() {
        return selectedAncestors(tree.state, route.selectedRoute).has(tree.id);
      },
      get isFocusVisible() {
        return tree.isFocusVisible || (tree.isFocusVisibleWithin && focused());
      },
    });

  return (
    <ItemLinkContext value={link}>
      <TreeItem
        {
          // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
          ...omit(props, "class", "style", "render", "ref")
          // oxlint-enable solid/reactivity
        }
        ref={(element: HTMLDivElement) => {
          assignRef(
            untrack(() => props.ref),
            element
          );
        }}
        focusMode={isTruthy(props.href) ? "child" : undefined}
        allowsArrowNavigation
        data-current={link.isCurrent || undefined}
        class={(state) => {
          const classValue = props.class;

          return typeof classValue === "function"
            ? classValue(
                mergeProps(values(state), {
                  get defaultClass() {
                    return state.defaultClass;
                  },
                })
              )
            : (classValue ?? "solid2-aria-NavigationTreeItem");
        }}
        style={(state) => {
          if (typeof props.style === "function") {
            return props.style(
              mergeProps(values(state), {
                get defaultStyle() {
                  return state.defaultStyle;
                },
              })
            );
          }

          return typeof props.style === "object" ? props.style : undefined;
        }}
        render={(domProps, state) => {
          const value = values(state);

          const content = (
            <NavigationTreeItemStateContext value={value}>
              {domProps.children}
            </NavigationTreeItemStateContext>
          );

          const forwarded = mergeProps(domProps, {
            children: content,
            "data-current": value.isCurrent || undefined,
            "data-current-ancestor": value.isCurrentAncestor || undefined,
            "data-focus-visible": value.isFocusVisible || undefined,
          });

          return props.render ? (
            props.render(forwarded, value)
          ) : (
            <dom.div {...forwarded} />
          );
        }}
      />
    </ItemLinkContext>
  );
}

export function NavigationTreeItemContent(
  props: NavigationTreeItemContentProps
) {
  const link = useContext(ItemLinkContext);
  const route = useContext(RouteContext);

  return (
    <TreeItemContent>
      {(tree) => (
        <NavigationTreeContentInner tree={tree} link={link} route={route}>
          {props.children}
        </NavigationTreeContentInner>
      )}
    </TreeItemContent>
  );
}

function NavigationTreeContentInner(props: {
  tree: TreeItemRenderProps;
  link: LinkDOMProps & {
    isCurrent: boolean;
    isLinkFocused: boolean;
    setLinkFocused: (value: boolean) => void;
  };
  route: { selectedRoute?: string | null; syncedRoute?: string };
  children: ChildrenOrFunction<NavigationTreeItemContentRenderProps>;
}) {
  const ancestor = useContext(NavigationTreeItemStateContext);
  createEffect(
    () => {
      const routeContext = props.route;
      const route = routeContext.selectedRoute;
      const { state } = props.tree;
      const manager = state.selectionManager;
      let target: Key | undefined;

      if (isPresent(route) && routeContext.syncedRoute !== route) {
        for (const key of state.collection.getKeys()) {
          if (getNodeProps(state.collection.getItem(key)).href === route) {
            target = key;
            let node = state.collection.getItem(key);

            while (isPresent(node?.parentKey)) {
              const parent = state.collection.getItem(node.parentKey);

              if (
                parent?.type === "item" &&
                !state.expandedKeys.has(node.parentKey)
              ) {
                target = node.parentKey;
              }

              node = parent;
            }

            break;
          }
        }
      }

      return { manager, route, routeContext, target };
    },
    (next) => {
      if (next.target !== undefined && isPresent(next.route)) {
        next.routeContext.syncedRoute = next.route;
        next.manager.setFocusedKey(next.target);
      }
    }
  );

  const values = mergeProps(
    merge(() => props.tree ?? {}),
    {
      defaultChildren: undefined,
      get isCurrent() {
        return props.link.isCurrent;
      },
      get isCurrentAncestor() {
        return ancestor.isCurrentAncestor;
      },
      get isFocusVisible() {
        return (
          props.tree.isFocusVisible ||
          (props.tree.isFocusVisibleWithin && props.link.isLinkFocused)
        );
      },
    }
  );

  return (
    <LinkContext
      value={mergeProps(
        omit(props.link, "isCurrent", "isLinkFocused", "setLinkFocused"),
        {
          get "aria-current"() {
            return props.link.isCurrent ? "page" : undefined;
          },
          get onFocusChange() {
            return props.link.setLinkFocused;
          },
          onPress: () => {
            if (!isTruthy(props.link.href) && props.tree.hasChildItems) {
              props.tree.state.toggleKey(props.tree.id);
            }
          },
        }
      )}
    >
      {typeof props.children === "function"
        ? props.children(values)
        : props.children}
    </LinkContext>
  );
}

export function NavigationTreeSection<T>(props: NavigationTreeSectionProps<T>) {
  return <TreeSection {...props} />;
}

export function NavigationTreeHeader(
  props: NavigationTreeHeaderProps & { ref?: Ref<HTMLDivElement> }
) {
  return (
    <TreeHeader
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
    />
  );
}
