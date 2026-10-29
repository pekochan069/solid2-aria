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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/Breadcrumbs.tsx.
 * Modified for Solid Aria: adapted collection ownership, contexts, accessibility primitives, and reactive properties for Solid 2; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createBreadcrumbs } from "@solid2-aria/core/breadcrumbs/create-breadcrumbs";
import type { AriaBreadcrumbsProps } from "@solid2-aria/core/breadcrumbs/create-breadcrumbs";
import { ItemNode } from "@solid2-aria/core/collections/base-collection";
import {
  Collection,
  CollectionBuilder,
  createLeafComponent,
} from "@solid2-aria/core/collections/collection-builder";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import type { AriaLabelingProps, Key, Node } from "@solid2-aria/types-shared";
import type { GlobalDOMAttributes } from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";
import { merge, untrack, createContext, useContext, omit } from "solid-js";

import { CollectionRendererContext } from "./collection";
import type { CollectionProps } from "./collection";
import { LinkContext } from "./link";
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
  RenderProps,
  SlotProps,
  StyleProps,
  ContextValue,
} from "./utils";

export const BreadcrumbsContext =
  // oxlint-disable-next-line typescript/no-explicit-any -- Collection contexts erase item types; each typed factory restores its owner's item contract.
  createContext<ContextValue<BreadcrumbsProps<any>, HTMLOListElement>>(null);

export interface BreadcrumbsProps<T>
  extends
    Omit<CollectionProps<T>, "disabledKeys">,
    AriaBreadcrumbsProps,
    StyleProps,
    SlotProps,
    AriaLabelingProps,
    DOMRenderProps<"ol", undefined>,
    GlobalDOMAttributes<HTMLOListElement> {
  /**
   * The CSS [class](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/class) for the
   * element.
   *
   * @default 'react-aria-Breadcrumbs'
   */
  class?: JSX.ClassValue;
  /** Whether the breadcrumbs are disabled. */
  isDisabled?: boolean;
  /** Handler that is called when a breadcrumb is clicked. */
  onAction?: (key: Key) => void;
}

export interface BreadcrumbRenderProps {
  /**
   * Whether the breadcrumb is for the current page.
   *
   * @selector [data-current]
   */
  isCurrent: boolean;
  /**
   * Whether the breadcrumb is disabled.
   *
   * @selector [data-disabled]
   */
  isDisabled: boolean;
}

export interface BreadcrumbProps
  extends
    RenderProps<BreadcrumbRenderProps, "li">,
    AriaLabelingProps,
    GlobalDOMAttributes<HTMLLIElement> {
  /**
   * The CSS [class](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/class) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-Breadcrumb'
   */
  class?: ClassOrFunction<BreadcrumbRenderProps>;
  /**
   * A unique id for the breadcrumb, which will be passed to `onAction` when the breadcrumb is
   * pressed.
   */
  id?: Key;
}

const BreadcrumbCollection = createLeafComponent(
  ItemNode,
  (
    props: BreadcrumbProps,
    forwardedRef: Ref<HTMLLIElement>,
    node: Node<unknown>
  ): JSX.Element => {
    const context = createSlottedContext(BreadcrumbsContext);

    const values: BreadcrumbRenderProps = {
      get isCurrent() {
        return node.nextKey === null || node.nextKey === undefined;
      },
      get isDisabled() {
        return (
          context?.isDisabled === true ||
          node.nextKey === null ||
          node.nextKey === undefined
        );
      },
    };

    const render = createRenderProps(
      mergeProps(props, { defaultClass: "solid2-aria-Breadcrumb", values })
    );

    return (
      <dom.li
        {
          // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
          ...omit(filterDOMProps(props, { global: true }), "id")
          // oxlint-enable solid/reactivity
        }
        {...render}
        ref={forwardedRef}
        data-current={values.isCurrent || undefined}
        data-disabled={values.isDisabled || undefined}
      >
        <LinkContext
          value={{
            get "aria-current"() {
              return values.isCurrent ? "page" : undefined;
            },
            get isDisabled() {
              return values.isDisabled;
            },
            onPress: () => context?.onAction?.(node.key),
          }}
        >
          {render.children}
        </LinkContext>
      </dom.li>
    );
  }
);

export function Breadcrumb(
  props: BreadcrumbProps & { ref?: Ref<HTMLLIElement> }
): JSX.Element {
  return (
    <BreadcrumbCollection
      {...props}
      ref={(element: HTMLLIElement) => {
        assignRef(
          untrack(() => props.ref),
          element
        );
      }}
    />
  );
}

export function Breadcrumbs<T>(
  input: BreadcrumbsProps<T> & { ref?: Ref<HTMLOListElement> }
): JSX.Element {
  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    BreadcrumbsContext
  );

  const aria = createBreadcrumbs(props);
  const renderer = useContext(CollectionRendererContext);
  const Root = renderer.CollectionRoot;

  return (
    <CollectionBuilder content={<Collection {...props} />}>
      {(collection) => (
        <dom.ol
          {...mergeProps(
            filterDOMProps(props, { global: true, labelable: true }),
            merge(() => aria.navProps ?? {})
          )}
          ref={(element: HTMLOListElement) => {
            setRef(element);
          }}
          render={props.render}
          class={props.class ?? "solid2-aria-Breadcrumbs"}
          style={props.style}
          slot={props.slot ?? undefined}
        >
          <BreadcrumbsContext value={props}>
            <Root collection={collection} />
          </BreadcrumbsContext>
        </dom.ol>
      )}
    </CollectionBuilder>
  );
}
