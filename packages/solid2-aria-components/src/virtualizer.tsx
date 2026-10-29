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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/Virtualizer.tsx.
 * Modified for Solid Aria: collection virtualization, scroll measurement, view ownership and layout options use Solid primitives.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { requireValue } from "@solid2-aria/core/utils/require-value";
import { isTruthy } from "@solid2-aria/core/utils/truthy";
import { createScrollView } from "@solid2-aria/core/virtualizer/scroll-view";
import { VirtualizerItem } from "@solid2-aria/core/virtualizer/virtualizer-item";
import { createVirtualizerState } from "@solid2-aria/stately/virtualizer/create-virtualizer-state";
import type { VirtualizerState } from "@solid2-aria/stately/virtualizer/create-virtualizer-state";
import type { Layout } from "@solid2-aria/stately/virtualizer/layout";
import type { ReusableView } from "@solid2-aria/stately/virtualizer/reusable-view";
import type {
  DropTarget,
  Node,
  DropTargetDelegate,
  ItemDropTarget,
} from "@solid2-aria/types-shared";
import type { JSX } from "@solidjs/web";
import {
  For,
  createContext,
  useContext,
  createMemo,
  merge,
  untrack,
} from "solid-js";

import {
  CollectionRendererContext,
  renderAfterDropIndicators,
} from "./collection";
import type {
  CollectionRootProps,
  CollectionBranchProps,
  CollectionRenderer,
} from "./collection";

export interface LayoutOptionsDelegate<O> {
  createLayoutOptions?: () => O;
}

interface ILayout<O>
  extends
    Layout<Node<unknown>, O>,
    Partial<DropTargetDelegate>,
    LayoutOptionsDelegate<O> {}

type LayoutClass<O> = new () => ILayout<O>;

export interface VirtualizerProps<O> {
  children: JSX.Element;
  layout: LayoutClass<O> | ILayout<O>;
  layoutOptions?: O;
  shouldObserveItemSize?: boolean;
}

const VirtualizerOptionsContext = createContext<{
  layout: ILayout<unknown>;
  layoutOptions?: unknown;
  shouldObserveItemSize?: boolean;
} | null>(null);

const VirtualizerContext = createContext<VirtualizerState<
  Node<unknown>,
  JSX.Element
> | null>(null);

type View = ReusableView<Node<unknown>, JSX.Element>;

export function Virtualizer<O>(props: VirtualizerProps<O>) {
  const layout = createMemo(() =>
    typeof props.layout === "function" ? new props.layout() : props.layout
  );

  const renderer: CollectionRenderer = {
    CollectionBranch,
    CollectionRoot,
    get dropTargetDelegate() {
      const initialValue = layout();

      return initialValue.getDropTargetFromPoint
        ? {
            getDropTargetFromPoint: (
              x: number,
              y: number,
              valid: (target: DropTarget) => boolean
            ) => initialValue.getDropTargetFromPoint?.(x, y, valid) ?? null,
          }
        : undefined;
    },
    isVirtualized: true,
    get layoutDelegate() {
      return layout();
    },
  };

  const options = {
    get layout() {
      return layout();
    },
    get layoutOptions() {
      return props.layoutOptions;
    },
    get shouldObserveItemSize() {
      return props.shouldObserveItemSize;
    },
  };

  return (
    <CollectionRendererContext value={renderer}>
      <VirtualizerOptionsContext value={options}>
        {props.children}
      </VirtualizerOptionsContext>
    </CollectionRendererContext>
  );
}

function CollectionRoot(props: CollectionRootProps) {
  const options = requireValue(
    useContext(VirtualizerOptionsContext),
    "Expected useContext(VirtualizerOptionsContext)"
  );

  const layout = untrack(() => options.layout);
  const derivedOptions = layout.createLayoutOptions?.();

  const state = createVirtualizerState<Node<unknown>, JSX.Element>({
    allowsWindowScrolling: true,
    get collection() {
      return props.collection;
    },
    get layout() {
      return options.layout;
    },
    get layoutOptions() {
      return Boolean(derivedOptions) && Boolean(options.layoutOptions)
        ? // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
          merge(options.layoutOptions, derivedOptions)
        : // oxlint-enable solid/reactivity
          (derivedOptions ?? options.layoutOptions);
    },
    onVisibleRectChange(rect) {
      const element = props.scrollRef?.();

      if (element) {
        element.scrollLeft = rect.x;
        element.scrollTop = rect.y;
      }
    },
    get persistedKeys() {
      return props.persistedKeys;
    },
    renderView: (_type, item) => item?.render?.(item) ?? item?.rendered,
  });

  const scroll = createScrollView(
    {
      allowsWindowScrolling: true,
      get contentSize() {
        return state.contentSize;
      },
      onScrollEnd: state.endScrolling,
      onScrollStart: state.startScrolling,
      onSizeChange: state.setSize,
      onVisibleRectChange: state.setVisibleRect,
    },
    requireValue(
      untrack(() => props.scrollRef),
      "Expected props.scrollRef"
    )
  );

  return (
    <div {...scroll.contentProps}>
      <VirtualizerContext value={state}>
        {
          <For each={state.visibleViews}>
            {(view) =>
              renderView(
                null,
                view,
                props.renderDropIndicator,
                options.shouldObserveItemSize
              )
            }
          </For>
        }
      </VirtualizerContext>
    </div>
  );
}

function CollectionBranch(props: CollectionBranchProps) {
  const state = requireValue(
    useContext(VirtualizerContext),
    "Expected useContext(VirtualizerContext)"
  );

  const options = requireValue(
    useContext(VirtualizerOptionsContext),
    "Expected useContext(VirtualizerOptionsContext)"
  );

  const view = () => state.virtualizer.getVisibleView(props.parent.key);

  return (
    <>
      {view()
        ? [...requireValue(view(), "Expected view()").children].map((child) =>
            renderView(
              requireValue(view(), "Expected view()"),
              child,
              props.renderDropIndicator,
              options.shouldObserveItemSize
            )
          )
        : null}
    </>
  );
}

function renderView(
  parent: View | null,
  view: View,
  renderIndicator?: (target: ItemDropTarget) => JSX.Element,
  observe?: boolean
): JSX.Element {
  const node = view.content;

  const rendered = (
    <VirtualizerItem
      layoutInfo={requireValue(view.layoutInfo, "Expected view.layoutInfo")}
      virtualizer={view.virtualizer}
      parent={parent?.layoutInfo}
      shouldObserveItemSize={observe}
    >
      {view.rendered}
    </VirtualizerItem>
  );

  if (
    node?.type !== "item" ||
    !renderIndicator ||
    !view.virtualizer.layout.getDropTargetLayoutInfo
  ) {
    return rendered;
  }

  return (
    <>
      {renderIndicatorView(
        parent,
        view,
        { dropPosition: "before", key: node.key, type: "item" },
        renderIndicator
      )}
      {rendered}
      {renderAfterDropIndicators(view.virtualizer.collection, node, (target) =>
        renderIndicatorView(parent, view, target, renderIndicator)
      )}
    </>
  );
}

function renderIndicatorView(
  parent: View | null,
  view: View,
  target: ItemDropTarget,
  render: (target: ItemDropTarget) => JSX.Element
): JSX.Element {
  const indicator = render(target);

  if (!isTruthy(indicator)) {
    return null;
  }

  const info = requireValue(
    view.virtualizer.layout.getDropTargetLayoutInfo?.(target),
    "Expected a drop target layout"
  );

  return (
    <VirtualizerItem
      layoutInfo={info}
      virtualizer={view.virtualizer}
      parent={parent?.layoutInfo}
    >
      {indicator}
    </VirtualizerItem>
  );
}
