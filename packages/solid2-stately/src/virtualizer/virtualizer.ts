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
 * Derived from Adobe React Spectrum: packages/react-stately/src/virtualizer/Virtualizer.ts.
 * Modified for Solid Aria: adapted imports, collection descriptors, and reactive state APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { Collection, Key } from "@solid2-aria/types-shared";

import { requireValue } from "../utils/require-value";
import type { Layout } from "./layout";
import type { LayoutInfo } from "./layout-info";
import { OverscanManager } from "./overscan-manager";
import type { Point } from "./point";
import { Rect } from "./rect";
import type { ChildView, ReusableView } from "./reusable-view";
import { RootView } from "./reusable-view";
import { ScrollAnchorTracker } from "./scroll-anchor";
import type { ScrollAnchor } from "./scroll-anchor";
import { Size } from "./size";
import type {
  InvalidationContext,
  VirtualizerDelegate,
  VirtualizerRenderOptions,
} from "./types";
import { isSetEqual } from "./utils";

interface VirtualizerOptions<T extends object, V> {
  delegate: VirtualizerDelegate<T, V>;
  collection: Collection<T>;
  layout: Layout<T>;
}

/**
 * The Virtualizer class renders a scrollable collection of data using customizable layouts.
 * It supports very large collections by only rendering visible views to the DOM, reusing
 * them as you scroll. Virtualizer can present any type of view, including non-item views
 * such as section headers and footers.
 *
 * Virtualizer uses `Layout` objects to compute what views should be visible, and how
 * to position and style them. This means that virtualizer can have its items arranged in
 * a stack, a grid, a circle, or any other layout you can think of. The layout can be changed
 * dynamically at runtime as well.
 *
 * Layouts produce information on what views should appear in the virtualizer, but do not create the
 * views themselves directly. It is the responsibility of the `VirtualizerDelegate` object to render
 * elements for each layout info. The virtualizer manages a set of `ReusableView` objects, which are
 * reused as the user scrolls by swapping their content with cached elements returned by the
 * delegate.
 */
export class Virtualizer<T extends object, V> {
  /**
   * The virtualizer delegate. The delegate is used by the virtualizer
   * to create and configure views.
   */
  delegate: VirtualizerDelegate<T, V>;
  /** The current content of the virtualizer. */
  private _collection: Collection<T>;
  get collection(): Collection<T> {
    return this._collection;
  }
  /** The layout object that determines the visible views. */
  private _layout: Layout<T>;
  get layout(): Layout<T> {
    return this._layout;
  }
  /** The size of the scrollable content. */
  private _contentSize: Size;
  get contentSize(): Size {
    return this._contentSize;
  }
  /** The currently visible rectangle. */
  private _visibleRect: Rect;
  get visibleRect(): Rect {
    return this._visibleRect;
  }
  /** The size of the virtualizer scroll view. */
  private _size: Size;
  get size(): Size {
    return this._size;
  }
  /** The set of persisted keys that are always present in the DOM, even if not currently in view. */
  private _persistedKeys: Set<Key>;
  get persistedKeys(): Set<Key> {
    return this._persistedKeys;
  }
  private readonly _visibleViews: Map<Key, ChildView<T, V>>;
  private readonly _renderedContent: WeakMap<T, V>;
  private readonly _rootView: RootView<T, V>;
  private _isScrolling: boolean;
  private _invalidationContext: InvalidationContext;
  private readonly _overscanManager: OverscanManager;
  private readonly _scrollAnchor: ScrollAnchorTracker;
  constructor(options: VirtualizerOptions<T, V>) {
    this.delegate = options.delegate;
    this._collection = options.collection;
    this._layout = options.layout;
    this._contentSize = new Size();
    this._visibleRect = new Rect();
    this._size = new Size();
    this._persistedKeys = new Set();
    this._visibleViews = new Map();
    this._renderedContent = new WeakMap();
    this._rootView = new RootView(this);
    this._isScrolling = false;
    this._invalidationContext = {};
    this._overscanManager = new OverscanManager();
    this._scrollAnchor = new ScrollAnchorTracker();
  }
  /** Returns whether the given key, or an ancestor, is persisted. */
  isPersistedKey(key: Key): boolean {
    // Quick check if the key is directly in the set of persisted keys.
    if (this.persistedKeys.has(key)) {
      return true;
    }

    // If not, check if the key is an ancestor of any of the persisted keys.
    for (let k of this.persistedKeys) {
      while (k !== null && k !== undefined) {
        const layoutInfo = this.layout.getLayoutInfo(k);

        if (
          !layoutInfo ||
          layoutInfo.parentKey === null ||
          layoutInfo.parentKey === undefined
        ) {
          break;
        }

        k = layoutInfo.parentKey;

        if (k === key) {
          return true;
        }
      }
    }

    return false;
  }
  private getParentView(
    layoutInfo: LayoutInfo
  ): ReusableView<T, V> | undefined {
    return layoutInfo.parentKey === null || layoutInfo.parentKey === undefined
      ? this._rootView
      : this._visibleViews.get(layoutInfo.parentKey);
  }
  private getReusableView(layoutInfo: LayoutInfo): ChildView<T, V> {
    const parentView = this.getParentView(layoutInfo);

    const view = requireValue(
      parentView,
      "Expected parentView to exist."
    ).getReusableView(layoutInfo.type);

    view.layoutInfo = layoutInfo;
    this._renderView(view);

    return view;
  }
  private _renderView(reusableView: ReusableView<T, V>) {
    if (reusableView.layoutInfo) {
      const { type, key, content } = reusableView.layoutInfo;
      // SAFETY: layouts synthesize content with the attached collection's item type.
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion
      const generatedContent = content as T | null;
      reusableView.content = generatedContent ?? this.collection.getItem(key);
      reusableView.rendered = this._renderContent(type, reusableView.content);
    }
  }
  private _renderContent(type: string, content: T | null) {
    const cached =
      content === null || content === undefined
        ? null
        : this._renderedContent.get(content);

    if (cached !== null && cached !== undefined) {
      return cached;
    }

    const rendered = this.delegate.renderView(type, content);

    if (content) {
      this._renderedContent.set(content, rendered);
    }

    return rendered;
  }
  /**
   * Returns the key for the item view currently at the given point.
   */
  keyAtPoint(point: Point): Key | null {
    const rect = new Rect(point.x, point.y, 1, 1);

    const layoutInfos =
      rect.area === 0 ? [] : this.layout.getVisibleLayoutInfos(rect);

    // Layout may return multiple layout infos in the case of
    // persisted keys, so find the first one that actually intersects.
    for (const layoutInfo of layoutInfos) {
      if (layoutInfo.rect.intersects(rect)) {
        return layoutInfo.key;
      }
    }

    return null;
  }
  private relayout(context: InvalidationContext = {}) {
    const anchorInfo =
      this.layout.UNSTABLE_getScrollAnchorInfo?.(context.layoutOptions) ?? null;

    // Capture scroll anchor from current (pre-layout) view positions.
    // On first render _visibleViews is empty so no anchor will be found.
    let anchor: ScrollAnchor | null = null;

    if (anchorInfo) {
      const preLayoutInfos: [Key, LayoutInfo][] = [];

      for (const [key, view] of this._visibleViews) {
        const layoutInfo = this.layout.getLayoutInfo(key) ?? view.layoutInfo;

        if (layoutInfo) {
          preLayoutInfos.push([key, layoutInfo]);
        }
      }

      anchor = this._scrollAnchor.captureBeforeLayout(
        anchorInfo,
        preLayoutInfos,
        this.visibleRect
      );
    }

    const previousContentSize = this.contentSize;
    const previousVisibleRect = this.visibleRect;
    // Update the layout
    this.layout.update(context);
    const rawContentSize = this.layout.getContentSize();
    this._contentSize = new Size(rawContentSize.width, rawContentSize.height);

    const target = this._scrollAnchor.resolveAfterLayout({
      anchor,
      anchorInfo,
      contentSize: this.contentSize,
      getLayoutInfo: (key: Key) => this.layout.getLayoutInfo(key),
      isScrolling: this._isScrolling,
      itemSizeChanged: context.itemSizeChanged ?? false,
      postLayoutInfos: anchorInfo
        ? this.getVisibleLayoutInfos()
        : new Map<Key, LayoutInfo>(),
      previousContentSize,
      previousVisibleRect,
    });

    if (target) {
      // Queues a new render cycle. Return early to skip updateSubviews — running it now
      // would position views against the old visibleRect, causing a flash before the
      // incoming relayout corrects them.
      this.delegate.setVisibleRect(target);

      return;
    }

    // Constrain scroll position.
    // If the content changed, scroll to the top.
    const { visibleRect } = this;
    let contentOffsetX = context.contentChanged === true ? 0 : visibleRect.x;
    let contentOffsetY = context.contentChanged === true ? 0 : visibleRect.y;
    contentOffsetX = Math.max(
      0,
      Math.min(this.contentSize.width - visibleRect.width, contentOffsetX)
    );
    contentOffsetY = Math.max(
      0,
      Math.min(this.contentSize.height - visibleRect.height, contentOffsetY)
    );

    if (contentOffsetX !== visibleRect.x || contentOffsetY !== visibleRect.y) {
      // If the offset changed, trigger a new re-render.
      const rect = new Rect(
        contentOffsetX,
        contentOffsetY,
        visibleRect.width,
        visibleRect.height
      );

      this.delegate.setVisibleRect(rect);
    } else {
      this.updateSubviews();
    }
  }
  getVisibleLayoutInfos(): Map<Key, LayoutInfo> {
    const isTestEnv =
      process.env.NODE_ENV === "test" &&
      (process.env.VIRT_ON === undefined || process.env.VIRT_ON === "");

    const isClientWidthMocked =
      isTestEnv &&
      typeof HTMLElement !== "undefined" &&
      Object.getOwnPropertyNames(HTMLElement.prototype).includes("clientWidth");

    const isClientHeightMocked =
      isTestEnv &&
      typeof HTMLElement !== "undefined" &&
      Object.getOwnPropertyNames(HTMLElement.prototype).includes(
        "clientHeight"
      );

    const rect =
      isTestEnv && (!isClientWidthMocked || !isClientHeightMocked)
        ? new Rect(0, 0, this.contentSize.width, this.contentSize.height)
        : this._overscanManager.getOverscannedRect();

    const layoutInfos = this.layout.getVisibleLayoutInfos(rect);
    const map = new Map<Key, LayoutInfo>();

    for (const layoutInfo of layoutInfos) {
      map.set(layoutInfo.key, layoutInfo);
    }

    return map;
  }
  private updateSubviews() {
    const visibleLayoutInfos = this.getVisibleLayoutInfos();
    const removed = new Set<ChildView<T, V>>();

    for (const [key, view] of this._visibleViews) {
      const layoutInfo = visibleLayoutInfos.get(key);

      // If a view's parent changed, treat it as a delete and re-create in the new parent.
      if (!layoutInfo || view.parent !== this.getParentView(layoutInfo)) {
        this._visibleViews.delete(key);
        view.parent.reuseChild(view);
        // Defer removing in case we reuse this view.
        removed.add(view);
      }
    }

    for (const [key, layoutInfo] of visibleLayoutInfos) {
      let view = this._visibleViews.get(key);

      if (view) {
        view.layoutInfo = layoutInfo;
        const item = this.collection.getItem(layoutInfo.key);

        if (view.content !== item) {
          if (view.content !== null && view.content !== undefined) {
            this._renderedContent.delete(view.content);
          }

          this._renderView(view);
        }
      } else {
        view = this.getReusableView(layoutInfo);
        view.parent.children.add(view);
        this._visibleViews.set(key, view);
        removed.delete(view);
      }
    }

    // The remaining views in `removed` were not reused to render new items.
    // They should be removed from the DOM. We also clear the reusable view queue
    // here since there's no point holding onto views that have been removed.
    // Doing so hurts performance in the future when reusing elements due to FIFO order.
    for (const view of removed) {
      view.parent.children.delete(view);
      view.parent.reusableViews.clear();
    }

    // Reordering DOM nodes is costly, so we defer this until scrolling stops.
    // DOM order does not affect visual order (due to absolute positioning),
    // but does matter for assistive technology users.
    if (!this._isScrolling) {
      // Layout infos must be in topological order (parents before children).
      for (const key of visibleLayoutInfos.keys()) {
        const view = requireValue(
          this._visibleViews.get(key),
          "Visible layout keys must have rendered views."
        );

        view.parent.children.delete(view);
        view.parent.children.add(view);
      }
    }
  }
  /** Performs layout and updates visible views as needed. */
  render(opts: VirtualizerRenderOptions<T>): ReusableView<T, V>[] {
    let needsLayout = false;
    let offsetChanged = false;
    let sizeChanged = false;
    let widthChanged = false;
    let heightChanged = false;
    let itemSizeChanged = false;
    let layoutOptionsChanged = false;
    let needsUpdate = false;

    if (opts.collection !== this.collection) {
      this._collection = opts.collection;
      needsLayout = true;
    }

    if (opts.layout !== this.layout || this.layout.virtualizer !== this) {
      this.layout.virtualizer = null;

      opts.layout.virtualizer = this;
      this._layout = opts.layout;
      this._scrollAnchor.reset();
      needsLayout = true;
    }

    if (
      opts.persistedKeys &&
      !isSetEqual(opts.persistedKeys, this.persistedKeys)
    ) {
      this._persistedKeys = opts.persistedKeys;
      needsUpdate = true;
    }

    if (
      !this.visibleRect.equals(opts.visibleRect) ||
      !this.size.equals(opts.size)
    ) {
      this._overscanManager.setVisibleRect(opts.visibleRect);

      // Create a rectangle using the scroll position and layout size of the scroll view. This is not the same
      // as the visibleRect, whose width and height may change during window scrolling.
      const oldRect = new Rect(
        this.visibleRect.x,
        this.visibleRect.y,
        this.size.width,
        this.size.height
      );

      const newRect = new Rect(
        opts.visibleRect.x,
        opts.visibleRect.y,
        opts.size.width,
        opts.size.height
      );

      const shouldInvalidate = this.layout.shouldInvalidate(newRect, oldRect);

      if (shouldInvalidate) {
        offsetChanged = !opts.visibleRect.pointEquals(this.visibleRect);
        sizeChanged = !this.size.equals(opts.size);
        widthChanged = this.size.width !== opts.size.width;
        heightChanged = this.size.height !== opts.size.height;
        needsLayout = true;
      } else {
        needsUpdate = true;
      }

      this._visibleRect = opts.visibleRect;
      this._size = opts.size;
    }

    const applyInvalidationContext = () => {
      if (opts.invalidationContext !== this._invalidationContext) {
        sizeChanged ||= opts.invalidationContext.sizeChanged === true;
        widthChanged ||= opts.invalidationContext.widthChanged === true;
        heightChanged ||= opts.invalidationContext.heightChanged === true;
        offsetChanged ||= opts.invalidationContext.offsetChanged === true;
        itemSizeChanged ||= opts.invalidationContext.itemSizeChanged === true;
        layoutOptionsChanged ||=
          opts.invalidationContext.layoutOptions !== null &&
          opts.invalidationContext.layoutOptions !== undefined &&
          this._invalidationContext.layoutOptions !== null &&
          this._invalidationContext.layoutOptions !== undefined &&
          opts.invalidationContext.layoutOptions !==
            this._invalidationContext.layoutOptions &&
          this.layout.shouldInvalidateLayoutOptions(
            opts.invalidationContext.layoutOptions,
            this._invalidationContext.layoutOptions
          );
        needsLayout ||=
          itemSizeChanged ||
          sizeChanged ||
          offsetChanged ||
          layoutOptionsChanged;

        this._invalidationContext = opts.invalidationContext;
      }
    };

    applyInvalidationContext();

    if (opts.isScrolling !== this._isScrolling) {
      this._isScrolling = opts.isScrolling;

      if (!opts.isScrolling) {
        // Update to fix the DOM order after scrolling.
        needsUpdate = true;
      }
    }

    if (needsLayout) {
      this.relayout({
        heightChanged,
        itemSizeChanged,
        layoutOptions: this._invalidationContext.layoutOptions,
        layoutOptionsChanged,
        offsetChanged,
        sizeChanged,
        widthChanged,
      });
    } else if (needsUpdate) {
      this.updateSubviews();
    }

    return [...this._rootView.children];
  }
  getVisibleView(key: Key): ReusableView<T, V> | undefined {
    return this._visibleViews.get(key);
  }
  invalidate(context: InvalidationContext): void {
    this.delegate.invalidate(context);
  }
  updateItemSize(key: Key, size: Size): void {
    if (!this.layout.updateItemSize) {
      return;
    }

    const changed = this.layout.updateItemSize(key, size);

    if (changed) {
      this.invalidate({
        itemSizeChanged: true,
      });
    }
  }
}
