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
 * Derived from Adobe React Spectrum: packages/react-stately/src/layout/GridLayout.ts.
 * Modified for Solid Aria: adapted imports, collection descriptors, and reactive state APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  DropTarget,
  DropTargetDelegate,
  ItemDropTarget,
  Key,
  Node,
} from "@solid2-aria/types-shared";

import { getNodeProps } from "../utils/get-node-props";
import { requireValue } from "../utils/require-value";
import { Layout } from "../virtualizer/layout";
import { LayoutInfo } from "../virtualizer/layout-info";
import { Rect } from "../virtualizer/rect";
import { Size } from "../virtualizer/size";
import type { InvalidationContext } from "../virtualizer/types";

export interface GridLayoutOptions {
  /**
   * The minimum item size.
   *
   * @default 200 x 200
   */
  minItemSize?: Size;
  /**
   * The maximum item size.
   *
   * @default Infinity
   */
  maxItemSize?: Size;
  /**
   * Whether to preserve the aspect ratio of the `minItemSize`.
   * By default, grid rows may have variable heights. When `preserveAspectRatio`
   * is true, all rows will have equal heights.
   *
   * @default false
   */
  preserveAspectRatio?: boolean;
  /**
   * The minimum space required between items.
   *
   * @default 18 x 18
   */
  minSpace?: Size;
  /**
   * The maximum allowed horizontal space between items.
   *
   * @default Infinity
   */
  maxHorizontalSpace?: number;
  /**
   * The maximum number of columns.
   *
   * @default Infinity
   */
  maxColumns?: number;
  /**
   * The thickness of the drop indicator.
   *
   * @default 2
   */
  dropIndicatorThickness?: number;
  /**
   * The fixed height of a loader element in px. This loader is specifically for "load more"
   * elements rendered when loading more rows at the root level or inside nested row/sections.
   *
   * @default 48
   */
  loaderHeight?: number;
  /**
   * The layout direction. When `'rtl'`, drop target positions (`'before'`/`'after'`)
   * are computed correctly for right-to-left locales in multi-column grids.
   *
   * @default 'ltr'
   */
  direction?: "ltr" | "rtl";
}

const DEFAULT_OPTIONS = {
  dropIndicatorThickness: 2,
  loaderHeight: 48,
  maxColumns: Infinity,
  maxItemSize: new Size(Infinity, Infinity),
  maxSpace: Infinity,
  minItemSize: new Size(200, 200),
  minSpace: new Size(18, 18),
  preserveAspectRatio: false,
};

/**
 * GridLayout is a virtualizer Layout implementation
 * that arranges its items in a grid.
 * The items are sized between a minimum and maximum size
 * depending on the width of the container.
 */
export class GridLayout<T, O extends GridLayoutOptions = GridLayoutOptions>
  extends Layout<Node<T>, O>
  implements DropTargetDelegate
{
  protected gap: Size = DEFAULT_OPTIONS.minSpace;
  protected dropIndicatorThickness = 2;
  protected numColumns = 0;
  protected direction: "ltr" | "rtl" = "ltr";
  private contentSize: Size = new Size();
  private layoutInfos = new Map<Key, LayoutInfo<Node<T>>>();
  private margin = 0;
  override shouldInvalidateLayoutOptions(
    newOptions: O,
    oldOptions: O
  ): boolean {
    return (
      newOptions.maxColumns !== oldOptions.maxColumns ||
      newOptions.dropIndicatorThickness !== oldOptions.dropIndicatorThickness ||
      newOptions.preserveAspectRatio !== oldOptions.preserveAspectRatio ||
      !(newOptions.minItemSize ?? DEFAULT_OPTIONS.minItemSize).equals(
        oldOptions.minItemSize ?? DEFAULT_OPTIONS.minItemSize
      ) ||
      !(newOptions.maxItemSize ?? DEFAULT_OPTIONS.maxItemSize).equals(
        oldOptions.maxItemSize ?? DEFAULT_OPTIONS.maxItemSize
      ) ||
      !(newOptions.minSpace ?? DEFAULT_OPTIONS.minSpace).equals(
        oldOptions.minSpace ?? DEFAULT_OPTIONS.minSpace
      ) ||
      newOptions.maxHorizontalSpace !== oldOptions.maxHorizontalSpace ||
      newOptions.loaderHeight !== oldOptions.loaderHeight ||
      newOptions.direction !== oldOptions.direction
    );
  }
  override update(invalidationContext: InvalidationContext<O>): void {
    const measureGrid = () => {
      const {
        minItemSize = DEFAULT_OPTIONS.minItemSize,
        maxItemSize = DEFAULT_OPTIONS.maxItemSize,
        preserveAspectRatio = DEFAULT_OPTIONS.preserveAspectRatio,
        minSpace = DEFAULT_OPTIONS.minSpace,
        maxHorizontalSpace = DEFAULT_OPTIONS.maxSpace,
        maxColumns = DEFAULT_OPTIONS.maxColumns,
        dropIndicatorThickness = DEFAULT_OPTIONS.dropIndicatorThickness,
        direction = "ltr" as const,
      } = invalidationContext.layoutOptions ?? {};

      const loaderHeight =
        invalidationContext.layoutOptions?.loaderHeight ??
        DEFAULT_OPTIONS.loaderHeight;

      this.dropIndicatorThickness = dropIndicatorThickness;
      this.direction = direction;
      const virtualizerWidth = this.attachedVirtualizer.size.width;
      // The max item width is always the entire viewport.
      // If the max item height is infinity, scale in proportion to the max width.
      const maxItemWidth = Math.min(maxItemSize.width, virtualizerWidth);

      const maxItemHeight = Number.isFinite(maxItemSize.height)
        ? maxItemSize.height
        : Math.floor((minItemSize.height / minItemSize.width) * maxItemWidth);

      // Compute the number of rows and columns needed to display the content
      const columns = Math.floor(
        virtualizerWidth / (minItemSize.width + minSpace.width)
      );

      const numColumns = Math.max(1, Math.min(maxColumns, columns));
      this.numColumns = numColumns;
      // Compute the available width (minus the space between items)
      const width = virtualizerWidth - minSpace.width * Math.max(0, numColumns);
      // Compute the item width based on the space available
      let itemWidth = Math.floor(width / numColumns);
      itemWidth = Math.max(
        minItemSize.width,
        Math.min(maxItemWidth, itemWidth)
      );

      // Compute the item height, which is proportional to the item width
      const t =
        (itemWidth - minItemSize.width) /
        Math.max(1, maxItemWidth - minItemSize.width);

      let itemHeight =
        minItemSize.height +
        Math.floor((maxItemHeight - minItemSize.height) * t);

      itemHeight = Math.max(
        minItemSize.height,
        Math.min(maxItemHeight, itemHeight)
      );

      // Compute the horizontal spacing, content height and horizontal margin
      const horizontalSpacing = Math.min(
        Math.max(maxHorizontalSpace, minSpace.width),
        Math.floor(
          (virtualizerWidth - numColumns * itemWidth) / (numColumns + 1)
        )
      );

      this.gap = new Size(horizontalSpacing, minSpace.height);
      this.margin = Math.floor(
        (virtualizerWidth -
          numColumns * itemWidth -
          horizontalSpacing * (numColumns + 1)) /
          2
      );

      return {
        horizontalSpacing,
        itemHeight,
        itemWidth,
        loaderHeight,
        minSpace,
        numColumns,
        preserveAspectRatio,
        virtualizerWidth,
      };
    };

    const {
      virtualizerWidth,
      numColumns,
      itemWidth,
      itemHeight,
      horizontalSpacing,
      minSpace,
      preserveAspectRatio,
      loaderHeight: initialLoaderHeight,
    } = measureGrid();

    let loaderHeight = initialLoaderHeight;
    // If there is a skeleton loader within the last 2 items in the collection, increment the collection size
    // so that an additional row is added for the skeletons.
    const { collection } = this.attachedVirtualizer;
    let collectionSize = collection.size;
    let lastKey = collection.getLastKey();

    for (
      let i = 0;
      i < 2 && lastKey !== null && lastKey !== undefined;
      i += 1
    ) {
      const item = collection.getItem(lastKey);

      if (item?.type === "skeleton") {
        collectionSize += 1;
        break;
      }

      lastKey = collection.getKeyBefore(lastKey);
    }

    let rows = Math.ceil(collectionSize / numColumns);
    const iterator = collection[Symbol.iterator]();
    let y = rows > 0 ? minSpace.height : 0;
    const newLayoutInfos = new Map<Key, LayoutInfo<Node<T>>>();
    let skeleton: Node<T> | null = null;
    let skeletonCount = 0;

    const buildRow = () => {
      let maxHeight = 0;
      const rowLayoutInfos: LayoutInfo[] = [];

      for (let col = 0; col < numColumns; col += 1) {
        // Repeat skeleton until the end of the current row.
        const next = iterator.next();

        const node: Node<T> | undefined =
          skeleton ?? (next.done === true ? undefined : next.value);

        if (!node) {
          break;
        }

        // We will add the loader after the skeletons so skip here
        if (node.type === "loader") {
          continue;
        }

        if (node.type === "skeleton") {
          skeleton = node;
        }

        const key = skeleton ? `${skeleton.key}-${skeletonCount}` : node.key;

        if (skeleton) {
          skeletonCount += 1;
        }

        const oldLayoutInfo = this.layoutInfos.get(key);
        let content = node;

        if (skeleton) {
          content =
            oldLayoutInfo && oldLayoutInfo.content?.key === key
              ? oldLayoutInfo.content
              : { ...skeleton, key };
        }

        const x =
          horizontalSpacing +
          col * (itemWidth + horizontalSpacing) +
          this.margin;

        let height = itemHeight;
        let estimatedSize = !preserveAspectRatio;

        if (oldLayoutInfo && estimatedSize) {
          ({ height } = oldLayoutInfo.rect);
          estimatedSize =
            invalidationContext.layoutOptionsChanged === true ||
            invalidationContext.sizeChanged === true ||
            oldLayoutInfo.estimatedSize ||
            oldLayoutInfo.content !== content;
        }

        const rect = new Rect(x, y, itemWidth, height);
        const layoutInfo = new LayoutInfo<Node<T>>(node.type, key, rect);
        layoutInfo.estimatedSize = estimatedSize;
        layoutInfo.allowOverflow = true;
        layoutInfo.content = content;
        newLayoutInfos.set(key, layoutInfo);
        rowLayoutInfos.push(layoutInfo);
        maxHeight = Math.max(maxHeight, layoutInfo.rect.height);
      }

      for (const layoutInfo of rowLayoutInfos) {
        layoutInfo.rect.height = maxHeight;
      }

      return maxHeight;
    };

    for (let row = 0; row < rows; row += 1) {
      const maxHeight = buildRow();
      y += maxHeight + minSpace.height;

      // Keep adding skeleton rows until we fill the viewport
      if (
        skeleton !== null &&
        row === rows - 1 &&
        y < this.attachedVirtualizer.size.height
      ) {
        rows += 1;
      }
    }

    // Always add the loader sentinel if present in the collection so we can make sure it is never virtualized out.
    const boundaryKey = collection.getLastKey();

    const lastNode =
      boundaryKey === null ? null : collection.getItem(boundaryKey);

    if (lastNode?.type === "loader") {
      if (skeletonCount > 0 || !getNodeProps(lastNode).isLoading) {
        loaderHeight = 0;
      }

      const loaderWidth = virtualizerWidth - horizontalSpacing * 2;
      // Note that if the user provides isLoading to their sentinel during a case where they only want to render the emptyState, this will reserve
      // room for the loader alongside rendering the emptyState
      const rect = new Rect(horizontalSpacing, y, loaderWidth, loaderHeight);
      const layoutInfo = new LayoutInfo<Node<T>>("loader", lastNode.key, rect);
      newLayoutInfos.set(lastNode.key, layoutInfo);
      y = layoutInfo.rect.maxY;
    }

    this.layoutInfos = newLayoutInfos;
    this.contentSize = new Size(this.attachedVirtualizer.size.width, y);
  }
  getLayoutInfo(key: Key): LayoutInfo | null {
    return this.layoutInfos.get(key) ?? null;
  }
  getContentSize(): Size {
    return this.contentSize;
  }
  getVisibleLayoutInfos(rect: Rect): LayoutInfo[] {
    const layoutInfos: LayoutInfo[] = [];

    for (const layoutInfo of this.layoutInfos.values()) {
      if (
        layoutInfo.rect.intersects(rect) ||
        this.attachedVirtualizer.isPersistedKey(layoutInfo.key) ||
        layoutInfo.type === "loader"
      ) {
        layoutInfos.push(layoutInfo);
      }
    }

    return layoutInfos;
  }
  override updateItemSize(key: Key, size: Size): boolean {
    const layoutInfo = this.layoutInfos.get(key);

    if (!layoutInfo) {
      return false;
    }

    if (size.height !== layoutInfo.rect.height) {
      const newLayoutInfo = layoutInfo.copy();
      newLayoutInfo.rect.height = size.height;
      newLayoutInfo.estimatedSize = false;
      this.layoutInfos.set(key, newLayoutInfo);

      return true;
    }

    return false;
  }
  private getDropTargetKey(x: number, y: number): Key | null {
    let key: Key | null = null;

    if (this.numColumns === 1) {
      const searchRect = new Rect(
        x,
        Math.max(0, y - this.gap.height),
        1,
        Math.max(1, this.gap.height * 2)
      );

      const candidates = this.getVisibleLayoutInfos(searchRect);
      let minDistance = Infinity;

      for (const candidate of candidates) {
        // Ignore items outside the search rect, e.g. persisted keys.
        if (!candidate.rect.intersects(searchRect)) {
          continue;
        }

        const yDist = Math.abs(candidate.rect.y - y);
        const maxYDist = Math.abs(candidate.rect.maxY - y);
        const dist = Math.min(yDist, maxYDist);

        if (dist < minDistance) {
          minDistance = dist;
          ({ key } = candidate);
        }
      }
    } else {
      const searchRect = new Rect(
        Math.max(0, x - this.gap.width),
        y,
        this.gap.width * 2,
        1
      );

      const candidates = this.getVisibleLayoutInfos(searchRect);
      let minDistance = Infinity;

      for (const candidate of candidates) {
        // Ignore items outside the search rect, e.g. persisted keys.
        if (!candidate.rect.intersects(searchRect)) {
          continue;
        }

        const xDist = Math.abs(candidate.rect.x - x);
        const maxXDist = Math.abs(candidate.rect.maxX - x);
        const dist = Math.min(xDist, maxXDist);

        if (dist < minDistance) {
          minDistance = dist;
          ({ key } = candidate);
        }
      }
    }

    return key;
  }
  getDropTargetFromPoint(
    initialX: number,
    initialY: number,
    isValidDropTarget: (target: DropTarget) => boolean
  ): DropTarget {
    let x = initialX;

    let y = initialY;

    if (this.layoutInfos.size === 0) {
      return { type: "root" };
    }

    x += this.attachedVirtualizer.visibleRect.x;
    y += this.attachedVirtualizer.visibleRect.y;

    // In RTL mode the virtualizer positions items using CSS `right` with the
    // layout rect's x value as the right-offset, but pointer coordinates are
    // in visual (left-origin) space. Flip x so it matches the layout coords.
    if (this.direction === "rtl" && this.numColumns > 1) {
      x = this.contentSize.width - x;
    }

    // Find the closest item within on either side of the point using the gap width.
    const key = this.getDropTargetKey(x, y);

    const layoutInfo =
      key === null || key === undefined ? null : this.getLayoutInfo(key);

    if (!layoutInfo) {
      return { type: "root" };
    }

    const target: DropTarget = {
      dropPosition: "on",
      key: layoutInfo.key,
      type: "item",
    };

    const pos = this.numColumns === 1 ? y : x;

    const layoutInfoPos =
      this.numColumns === 1 ? layoutInfo.rect.y : layoutInfo.rect.x;

    const size =
      this.numColumns === 1 ? layoutInfo.rect.height : layoutInfo.rect.width;

    if (isValidDropTarget(target)) {
      // If dropping on the item is accepted, try the before/after positions
      // if within 5px of the start or end of the item.
      if (pos < layoutInfoPos + 5) {
        target.dropPosition = "before";
      } else if (pos > layoutInfoPos + size - 5) {
        target.dropPosition = "after";
      }
    } else {
      // If dropping on the item isn't accepted, try the target before or after depending on the position.
      const mid = layoutInfoPos + size / 2;

      if (
        pos <= mid &&
        isValidDropTarget({ ...target, dropPosition: "before" })
      ) {
        target.dropPosition = "before";
      } else if (
        pos >= mid &&
        isValidDropTarget({ ...target, dropPosition: "after" })
      ) {
        target.dropPosition = "after";
      }
    }

    return target;
  }
  override getDropTargetLayoutInfo(target: ItemDropTarget): LayoutInfo {
    const layoutInfo = requireValue(
      this.getLayoutInfo(target.key),
      "Drop targets must have layout information."
    );

    const rect =
      this.numColumns === 1
        ? new Rect(
            layoutInfo.rect.x,
            target.dropPosition === "before"
              ? layoutInfo.rect.y -
                  this.gap.height / 2 -
                  this.dropIndicatorThickness / 2
              : layoutInfo.rect.maxY +
                  this.gap.height / 2 -
                  this.dropIndicatorThickness / 2,
            layoutInfo.rect.width,
            this.dropIndicatorThickness
          )
        : new Rect(
            target.dropPosition === "before"
              ? layoutInfo.rect.x -
                  this.gap.width / 2 -
                  this.dropIndicatorThickness / 2
              : layoutInfo.rect.maxX +
                  this.gap.width / 2 -
                  this.dropIndicatorThickness / 2,
            layoutInfo.rect.y,
            this.dropIndicatorThickness,
            layoutInfo.rect.height
          );

    return new LayoutInfo<Node<T>>(
      "dropIndicator",
      `${target.key}:${target.dropPosition}`,
      rect
    );
  }
}
