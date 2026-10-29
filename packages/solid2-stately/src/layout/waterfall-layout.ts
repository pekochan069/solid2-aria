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
 * Derived from Adobe React Spectrum: packages/react-stately/src/layout/WaterfallLayout.ts.
 * Modified for Solid Aria: adapted imports, collection descriptors, and reactive state APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  DropTarget,
  DropTargetDelegate,
  Key,
  LayoutDelegate,
  Node,
} from "@solid2-aria/types-shared";

import { getNodeProps } from "../utils/get-node-props";
import { requireValue } from "../utils/require-value";
import { Layout } from "../virtualizer/layout";
import { LayoutInfo } from "../virtualizer/layout-info";
import { Point } from "../virtualizer/point";
import { Rect } from "../virtualizer/rect";
import { Size } from "../virtualizer/size";
import type { InvalidationContext } from "../virtualizer/types";

export interface WaterfallLayoutOptions {
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
}

class WaterfallLayoutInfo<T> extends LayoutInfo<Node<T>> {
  column = 0;
  index = 0;
  override copy(): WaterfallLayoutInfo<T> {
    const res = Object.assign(
      new WaterfallLayoutInfo<T>(this.type, this.key, this.rect.copy()),
      super.copy()
    );

    res.column = this.column;
    res.index = this.index;

    return res;
  }
}

const DEFAULT_OPTIONS = {
  dropIndicatorThickness: 2,
  loaderHeight: 48,
  maxColumns: Infinity,
  maxItemSize: new Size(Infinity, Infinity),
  maxSpace: Infinity,
  minItemSize: new Size(200, 200),
  minSpace: new Size(18, 18),
};

export class WaterfallLayout<
  T extends object,
  O extends WaterfallLayoutOptions = WaterfallLayoutOptions,
>
  extends Layout<Node<T>, O>
  implements LayoutDelegate, DropTargetDelegate
{
  private contentSize: Size = new Size();
  private layoutInfos = new Map<Key, WaterfallLayoutInfo<T>>();
  protected numColumns = 0;
  protected dropIndicatorThickness = 2;
  private margin = 0;
  override shouldInvalidateLayoutOptions(
    newOptions: O,
    oldOptions: O
  ): boolean {
    return (
      newOptions.maxColumns !== oldOptions.maxColumns ||
      newOptions.dropIndicatorThickness !== oldOptions.dropIndicatorThickness ||
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
      newOptions.loaderHeight !== oldOptions.loaderHeight
    );
  }
  override update(invalidationContext: InvalidationContext<O>): void {
    const measureGrid = () => {
      const {
        minItemSize = DEFAULT_OPTIONS.minItemSize,
        maxItemSize = DEFAULT_OPTIONS.maxItemSize,
        minSpace = DEFAULT_OPTIONS.minSpace,
        maxHorizontalSpace = DEFAULT_OPTIONS.maxSpace,
        maxColumns = DEFAULT_OPTIONS.maxColumns,
        dropIndicatorThickness = DEFAULT_OPTIONS.dropIndicatorThickness,
      } = invalidationContext.layoutOptions ?? {};

      const loaderHeight =
        invalidationContext.layoutOptions?.loaderHeight ??
        DEFAULT_OPTIONS.loaderHeight;

      this.dropIndicatorThickness = dropIndicatorThickness;
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
      loaderHeight: initialLoaderHeight,
    } = measureGrid();

    let loaderHeight = initialLoaderHeight;

    // Setup an array of column heights
    const columnHeights = Array.from(
      { length: numColumns },
      () => minSpace.height
    );

    const newLayoutInfos = new Map<Key, WaterfallLayoutInfo<T>>();
    let index = 0;

    const addNode = (key: Key, node: Node<T>) => {
      const oldLayoutInfo = this.layoutInfos.get(key);
      let height = itemHeight;
      let estimatedSize = true;

      if (oldLayoutInfo) {
        height =
          (oldLayoutInfo.rect.height / oldLayoutInfo.rect.width) * itemWidth;
        estimatedSize =
          invalidationContext.sizeChanged === true ||
          oldLayoutInfo.estimatedSize ||
          oldLayoutInfo.content !== node;
      }

      // Figure out which column to place the item in, and compute its position.
      // Preserve the previous column index so items don't jump around during resizing unless the number of columns changed.
      const prevColumn =
        numColumns === this.numColumns &&
        oldLayoutInfo &&
        oldLayoutInfo.index === index &&
        oldLayoutInfo.rect.y < this.attachedVirtualizer.visibleRect.maxY
          ? oldLayoutInfo.column
          : undefined;

      let column = prevColumn;

      if (column === undefined) {
        column = 0;
        let minimumHeight = Infinity;

        for (const [candidate, columnHeight] of columnHeights.entries()) {
          if (columnHeight < minimumHeight) {
            column = candidate;
            minimumHeight = columnHeight;
          }
        }
      }

      const x =
        horizontalSpacing +
        column * (itemWidth + horizontalSpacing) +
        this.margin;

      const y = requireValue(
        columnHeights[column],
        "The selected waterfall column must exist."
      );

      const rect = new Rect(x, y, itemWidth, height);
      const layoutInfo = new WaterfallLayoutInfo<T>(node.type, key, rect);
      layoutInfo.estimatedSize = estimatedSize;
      layoutInfo.allowOverflow = true;
      layoutInfo.content = node;
      layoutInfo.column = column;
      layoutInfo.index = index;
      index += 1;
      newLayoutInfos.set(key, layoutInfo);
      columnHeights[column] = y + layoutInfo.rect.height + minSpace.height;
    };

    const { collection } = this.attachedVirtualizer;
    let skeletonCount = 0;

    for (const node of collection) {
      if (node.type === "skeleton") {
        // Add skeleton cards until every column has at least one, and we fill the viewport.
        const startingHeights = [...columnHeights];

        while (
          !columnHeights.every((h, i) => h !== startingHeights[i]) ||
          Math.min(...columnHeights) < this.attachedVirtualizer.size.height
        ) {
          const key = `${node.key}-${skeletonCount}`;
          skeletonCount += 1;
          const content = this.layoutInfos.get(key)?.content ?? { ...node };
          addNode(key, content);
        }

        break;
      } else if (node.type !== "loader") {
        addNode(node.key, node);
      }
    }

    // Reset all columns to the maximum for the next section. If loading, set to 0 so virtualizer doesn't render its body since there aren't items to render,
    // except if we are performing skeleton loading
    const isEmptyOrLoading = collection.size === 0;

    let maxHeight = isEmptyOrLoading ? 0 : Math.max(...columnHeights);
    // Always add the loader sentinel if present in the collection so we can make sure it is never virtualized out.
    // Add it under the first column for simplicity
    const lastKey = collection.getLastKey();
    const lastNode = lastKey === null ? null : collection.getItem(lastKey);

    if (lastNode?.type === "loader") {
      if (skeletonCount > 0 || !getNodeProps(lastNode).isLoading) {
        loaderHeight = 0;
      }

      const loaderWidth = virtualizerWidth - horizontalSpacing * 2;

      // Note that if the user provides isLoading to their sentinel during a case where they only want to render the emptyState, this will reserve
      // room for the loader alongside rendering the emptyState
      const rect = new Rect(
        horizontalSpacing,
        maxHeight,
        loaderWidth,
        loaderHeight
      );

      const layoutInfo = new WaterfallLayoutInfo<T>(
        "loader",
        lastNode.key,
        rect
      );

      newLayoutInfos.set(lastNode.key, layoutInfo);
      maxHeight = layoutInfo.rect.maxY;
    }

    this.contentSize = new Size(this.attachedVirtualizer.size.width, maxHeight);
    this.layoutInfos = newLayoutInfos;
    this.numColumns = numColumns;
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
  // Override keyboard navigation to work spatially.
  getKeyRightOf(key: Key): Key | null {
    const layoutInfo = this.getLayoutInfo(key);

    if (!layoutInfo) {
      return null;
    }

    const rect = new Rect(
      layoutInfo.rect.maxX,
      layoutInfo.rect.y,
      this.attachedVirtualizer.visibleRect.maxX - layoutInfo.rect.maxX,
      layoutInfo.rect.height
    );

    const layoutInfos = this.getVisibleLayoutInfos(rect);
    let bestKey: Key | null = null;
    let bestDistance = Infinity;

    for (const candidate of layoutInfos) {
      if (candidate.key === key) {
        continue;
      }

      // Find the closest item in the x direction with the most overlap in the y direction.
      const deltaX = candidate.rect.x - rect.x;

      const overlapY =
        Math.min(candidate.rect.maxY, rect.maxY) -
        Math.max(candidate.rect.y, rect.y);

      const distance = deltaX - overlapY;

      if (distance < bestDistance) {
        bestDistance = distance;
        bestKey = candidate.key;
      }
    }

    return bestKey;
  }
  getKeyLeftOf(key: Key): Key | null {
    const layoutInfo = this.getLayoutInfo(key);

    if (!layoutInfo) {
      return null;
    }

    const rect = new Rect(
      0,
      layoutInfo.rect.y,
      layoutInfo.rect.x,
      layoutInfo.rect.height
    );

    const layoutInfos = this.getVisibleLayoutInfos(rect);
    let bestKey: Key | null = null;
    let bestDistance = Infinity;

    for (const candidate of layoutInfos) {
      if (candidate.key === key) {
        continue;
      }

      // Find the closest item in the x direction with the most overlap in the y direction.
      const deltaX = rect.maxX - candidate.rect.maxX;

      const overlapY =
        Math.min(candidate.rect.maxY, rect.maxY) -
        Math.max(candidate.rect.y, rect.y);

      const distance = deltaX - overlapY;

      if (distance < bestDistance) {
        bestDistance = distance;
        bestKey = candidate.key;
      }
    }

    return bestKey;
  }
  // This overrides the default behavior of shift selection to work spatially
  // rather than following the order of the items in the collection (which may appear unpredictable).
  getKeyRange(from: Key, to: Key): Key[] {
    const fromLayoutInfo = this.getLayoutInfo(from);
    const toLayoutInfo = this.getLayoutInfo(to);

    if (!fromLayoutInfo || !toLayoutInfo) {
      return [];
    }

    // Find items where half of the area intersects the rectangle
    // formed from the first item to the last item in the range.
    const rect = fromLayoutInfo.rect.union(toLayoutInfo.rect);
    const keys: Key[] = [];

    for (const layoutInfo of this.layoutInfos.values()) {
      if (rect.intersection(layoutInfo.rect).area > layoutInfo.rect.area / 2) {
        keys.push(layoutInfo.key);
      }
    }

    return keys;
  }
  getDropTargetFromPoint(initialX: number, initialY: number): DropTarget {
    let x = initialX;

    let y = initialY;

    if (this.layoutInfos.size === 0) {
      return { type: "root" };
    }

    x += this.attachedVirtualizer.visibleRect.x;
    y += this.attachedVirtualizer.visibleRect.y;
    const key = this.attachedVirtualizer.keyAtPoint(new Point(x, y));

    if (key === null || key === undefined) {
      return { type: "root" };
    }

    // Only support "on" drop position in waterfall layout.
    // Reordering doesn't make sense because the items don't have a deterministic order.
    return {
      dropPosition: "on",
      key,
      type: "item",
    };
  }
}
