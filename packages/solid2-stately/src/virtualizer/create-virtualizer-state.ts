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
 * Derived from Adobe React Spectrum: packages/react-stately/src/virtualizer/useVirtualizerState.ts.
 * Modified for Solid Aria: adapted imports, collection descriptors, and reactive state APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { Collection, Key } from "@solid2-aria/types-shared";
import { createEffect, createMemo, createSignal, untrack } from "solid-js";

import type { Layout } from "./layout";
import { Rect } from "./rect";
import type { ReusableView } from "./reusable-view";
import { Size } from "./size";
import type { InvalidationContext } from "./types";
import { Virtualizer } from "./virtualizer";

export interface VirtualizerProps<T extends object, V, O> {
  renderView: (type: string, content: T | null) => V;
  layout: Layout<T>;
  collection: Collection<T>;
  onVisibleRectChange: (rect: Rect) => void;
  persistedKeys?: Set<Key> | null;
  layoutOptions?: O;
  allowsWindowScrolling?: boolean;
}

export interface VirtualizerState<T extends object, V> {
  visibleViews: ReusableView<T, V>[];
  setVisibleRect: (rect: Rect) => void;
  size: Size;
  setSize: (size: Size) => void;
  contentSize: Size;
  virtualizer: Virtualizer<T, V>;
  isScrolling: boolean;
  startScrolling: () => void;
  endScrolling: () => void;
}

export function createVirtualizerState<T extends object, V, O = unknown>(
  opts: VirtualizerProps<T, V, O>
): VirtualizerState<T, V> {
  const [visibleRect, setVisibleRect] = createSignal(new Rect(0, 0, 0, 0), {
    ownedWrite: true,
  });

  const [size, setSize] = createSignal(new Size(), { ownedWrite: true });
  const [isScrolling, setScrolling] = createSignal(false, { ownedWrite: true });

  const [invalidationContext, setInvalidationContext] =
    createSignal<InvalidationContext>({}, { ownedWrite: true });

  let visibleRectChanged = false;

  const virtualizer = untrack(
    () =>
      new Virtualizer<T, V>({
        collection: opts.collection,
        delegate: {
          invalidate: (context) => {
            setInvalidationContext(context);
          },
          renderView: (type, content) => opts.renderView(type, content),
          setVisibleRect(rect) {
            visibleRectChanged = true;
            setVisibleRect(rect);
          },
        },
        layout: opts.layout,
      })
  );

  createEffect(
    () => visibleRect(),
    (rect) => {
      if (visibleRectChanged) {
        visibleRectChanged = false;
        opts.onVisibleRectChange(rect);
      }
    }
  );

  const visibleViews = createMemo(() =>
    virtualizer.render({
      collection: opts.collection,
      invalidationContext: {
        ...invalidationContext(),
        layoutOptions: opts.layoutOptions,
      },
      isScrolling: isScrolling(),
      layout: opts.layout,
      layoutOptions: opts.layoutOptions,
      persistedKeys: opts.persistedKeys,
      size: opts.allowsWindowScrolling === true ? size() : visibleRect(),
      visibleRect: visibleRect(),
    })
  );

  return {
    get contentSize() {
      visibleViews();

      return virtualizer.contentSize;
    },
    endScrolling: () => {
      setScrolling(false);
    },
    get isScrolling() {
      return isScrolling();
    },
    setSize(next: Size) {
      setSize(next);
    },
    setVisibleRect(next: Rect) {
      setVisibleRect(next);
    },
    get size() {
      return size();
    },
    startScrolling: () => {
      setScrolling(true);
    },
    virtualizer,
    get visibleViews() {
      return visibleViews();
    },
  };
}
