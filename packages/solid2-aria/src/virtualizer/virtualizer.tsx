/*
 * Copyright 2020 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria/src/virtualizer/Virtualizer.tsx.
 * Modified for Solid Aria: adapted components, imports, and reactive lifecycle for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createVirtualizerState } from "@solid2-aria/stately/virtualizer/create-virtualizer-state";
import type { Layout } from "@solid2-aria/stately/virtualizer/layout";
import type { ReusableView } from "@solid2-aria/stately/virtualizer/reusable-view";
import type { Collection, Key } from "@solid2-aria/types-shared";
import { omit, createSignal } from "solid-js";
import type { Element as SolidElement } from "solid-js";

import type { CSSProperties, HTMLAttributes, Ref } from "../types";
import { createLoadMore } from "../utils/create-load-more";
import { requireValue } from "../utils/require-value";
import { isTruthy } from "../utils/truthy";
import { ScrollView } from "./scroll-view";
import { VirtualizerItem } from "./virtualizer-item";

type RenderWrapper<T extends object, V> = (
  parent: ReusableView<T, V> | null,
  view: ReusableView<T, V>,
  children: ReusableView<T, V>[],
  renderChildren: (views: ReusableView<T, V>[]) => SolidElement[]
) => SolidElement;

export interface VirtualizerProps<T extends object, V, O> extends Omit<
  HTMLAttributes,
  "children" | "onScroll" | "ref" | "style"
> {
  style?: CSSProperties;
  children: (type: string, content: T | null) => V;
  renderWrapper?: RenderWrapper<T, V>;
  layout: Layout<T, O>;
  collection: Collection<T>;
  persistedKeys?: Set<Key> | null;
  scrollDirection?: "horizontal" | "vertical" | "both";
  isLoading?: boolean;
  onLoadMore?: () => void;
  layoutOptions?: O;
  onScroll?: (event: Event) => void;
  ref?: Ref<HTMLDivElement>;
}

export function Virtualizer<T extends object, V extends SolidElement, O>(
  props: VirtualizerProps<T, V, O>
): SolidElement {
  const [ref, setRef] = createSignal<HTMLDivElement | null>(null, {
    ownedWrite: true,
  });

  const state = createVirtualizerState({
    get collection() {
      return props.collection;
    },
    get layout() {
      return props.layout;
    },
    get layoutOptions() {
      return props.layoutOptions;
    },
    onVisibleRectChange(rect) {
      const refElement = ref();

      if (refElement) {
        refElement.scrollLeft = rect.x;
        refElement.scrollTop = rect.y;
      }
    },
    get persistedKeys() {
      return props.persistedKeys;
    },
    renderView: (type, content) => props.children(type, content),
  });

  createLoadMore(
    {
      get isLoading() {
        return props.isLoading;
      },
      onLoadMore: () => props.onLoadMore?.(),
      scrollOffset: 1,
    },
    ref
  );

  return (
    <ScrollView
      {
        // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
        ...omit(
          props,
          "children",
          "renderWrapper",
          "layout",
          "collection",
          "isLoading",
          "onLoadMore",
          "persistedKeys",
          "layoutOptions",
          "ref"
        )
        // oxlint-enable solid/reactivity
      }
      ref={[
        props.ref,
        (node) => {
          setRef(node);
        },
      ]}
      contentSize={state.contentSize}
      onScrollStart={state.startScrolling}
      onScrollEnd={state.endScrolling}
      onVisibleRectChange={(rect) => {
        state.setVisibleRect(rect);
      }}
    >
      {renderChildren(
        null,
        state.visibleViews,
        props.renderWrapper ?? defaultRenderWrapper
      )}
    </ScrollView>
  );
}

function renderChildren<T extends object, V extends SolidElement>(
  parent: ReusableView<T, V> | null,
  views: ReusableView<T, V>[],
  wrapper: RenderWrapper<T, V>
): SolidElement[] {
  return views.map((view) =>
    wrapper(
      parent,
      view,
      isTruthy(view.children) ? [...view.children] : [],
      (children) => renderChildren(view, children, wrapper)
    )
  );
}

function defaultRenderWrapper<T extends object, V extends SolidElement>(
  parent: ReusableView<T, V> | null,
  view: ReusableView<T, V>
): SolidElement {
  return (
    <VirtualizerItem
      layoutInfo={requireValue(view.layoutInfo, "Expected view.layoutInfo")}
      virtualizer={view.virtualizer}
      parent={parent?.layoutInfo}
    >
      {view.rendered}
    </VirtualizerItem>
  );
}
