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
 * Derived from Adobe React Spectrum: packages/react-stately/src/virtualizer/Layout.ts.
 * Modified for Solid Aria: adapted imports, collection descriptors, and reactive state APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  ItemDropTarget,
  Key,
  LayoutDelegate,
  Node,
} from "@solid2-aria/types-shared";

import type { LayoutInfo } from "./layout-info";
import type { Rect } from "./rect";
import type { ScrollAnchorInfo } from "./scroll-anchor";
import type { Size } from "./size";
import type { InvalidationContext } from "./types";
import type { Virtualizer } from "./virtualizer";

/**
 * Virtualizer supports arbitrary layout objects, which compute what items are visible, and how
 * to position and style them. However, layouts do not render items directly. Instead,
 * layouts produce lightweight LayoutInfo objects which describe various properties of an item,
 * such as its position and size. The Virtualizer is then responsible for creating the actual
 * views as needed, based on this layout information.
 *
 * Every layout extends from the Layout abstract base class. Layouts must implement the
 * `getVisibleLayoutInfos`, `getLayoutInfo`, and `getContentSize` methods. All other methods can be
 * optionally overridden to implement custom behavior.
 */
export abstract class Layout<
  T extends object = Node<unknown>,
  O = unknown,
> implements LayoutDelegate {
  /** The Virtualizer the layout is currently attached to. */
  virtualizer: Virtualizer<T, unknown> | null = null;
  protected get attachedVirtualizer(): Virtualizer<T, unknown> {
    if (this.virtualizer === null) {
      throw new Error("Attach the layout to a virtualizer before using it.");
    }

    return this.virtualizer;
  }
  /**
   * Returns an array of `LayoutInfo` objects which are inside the given rectangle.
   * Should be implemented by subclasses.
   *
   * @param rect The rectangle that should contain the returned LayoutInfo objects.
   */
  abstract getVisibleLayoutInfos(rect: Rect): LayoutInfo[];
  /**
   * Returns a `LayoutInfo` for the given key.
   * Should be implemented by subclasses.
   *
   * @param key The key of the LayoutInfo to retrieve.
   */
  abstract getLayoutInfo(key: Key): LayoutInfo | null;
  /**
   * Returns size of the content. By default, it returns virtualizer's size.
   */
  abstract getContentSize(): Size;
  /**
   * Returns whether the layout should invalidate in response to
   * visible rectangle changes. By default, it only invalidates
   * when the virtualizer's size changes. Return true always
   * to make the layout invalidate while scrolling (e.g. sticky headers).
   */
  shouldInvalidate(newRect: Rect, oldRect: Rect): boolean {
    // By default, invalidate when the size changes
    return newRect.width !== oldRect.width || newRect.height !== oldRect.height;
  }
  /**
   * Returns whether the layout should invalidate when the layout options change.
   * By default it invalidates when the object identity changes. Override this
   * method to optimize layout updates based on specific option changes.
   */
  shouldInvalidateLayoutOptions(newOptions: O, oldOptions: O): boolean {
    return newOptions !== oldOptions;
  }
  /**
   * This method allows the layout to perform any pre-computation
   * it needs to in order to prepare LayoutInfos for retrieval.
   * Called by the virtualizer before `getVisibleLayoutInfos`
   * or `getLayoutInfo` are called.
   */
  update(_invalidationContext: InvalidationContext<O>): void {
    /* Layout subclasses may precompute positions here. */
  }
  /**
   * Updates the size of the given item.
   */
  updateItemSize?(key: Key, size: Size): boolean;
  /**
   * Returns a `LayoutInfo` for the given drop target.
   */
  getDropTargetLayoutInfo?(target: ItemDropTarget): LayoutInfo;
  UNSTABLE_getScrollAnchorInfo?(
    options: O | undefined
  ): ScrollAnchorInfo | null;
  /** @private */
  getItemRect(key: Key): Rect | null {
    return this.getLayoutInfo(key)?.rect ?? null;
  }
  /** @private */
  getVisibleRect(): Rect {
    return this.attachedVirtualizer.visibleRect;
  }
}
