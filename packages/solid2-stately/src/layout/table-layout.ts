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
 * Derived from Adobe React Spectrum: packages/react-stately/src/layout/TableLayout.ts.
 * Modified for Solid Aria: adapted imports, collection descriptors, and reactive state APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  DropTarget,
  ItemDropTarget,
  Key,
} from "@solid2-aria/types-shared";

import { getChildNodes } from "../collections/get-child-nodes";
import type { GridNode } from "../grid/grid-collection";
import { isTableCollection } from "../table/table-collection";
import type { ITableCollection as TableCollection } from "../table/table-collection";
import { TableColumnLayout } from "../table/table-column-layout";
import { getNodeProps } from "../utils/get-node-props";
import { requireValue } from "../utils/require-value";
import { LayoutInfo } from "../virtualizer/layout-info";
import type { Point } from "../virtualizer/point";
import { Rect } from "../virtualizer/rect";
import { Size } from "../virtualizer/size";
import type { InvalidationContext } from "../virtualizer/types";
import { ListLayout } from "./list-layout";
import type { LayoutNode, ListLayoutOptions } from "./list-layout";

export interface TableLayoutProps extends Omit<
  ListLayoutOptions,
  | "orientation"
  | "rowSize"
  | "estimatedRowSize"
  | "headingSize"
  | "estimatedHeadingSize"
  | "loaderSize"
> {
  /**
   * The fixed height of a row in px.
   *
   * @default 48
   */
  rowHeight?: number;
  /**
   * The estimated height of a row, when row heights are variable.
   */
  estimatedRowHeight?: number;
  /**
   * The fixed height of a section header in px.
   *
   * @default 48
   */
  headingHeight?: number;
  /**
   * The estimated height of a section header, when the height is variable.
   */
  estimatedHeadingHeight?: number;
  /**
   * The fixed height of a loader element in px. This loader is specifically for "load more"
   * elements rendered when loading more rows at the root level or inside nested row/sections.
   *
   * @default 48
   */
  loaderHeight?: number;
  columnWidths?: Map<Key, number>;
}

const DEFAULT_ROW_HEIGHT = 48;

/**
 * TableLayout is a virtualizer Layout implementation that arranges
 * items in rows and columns.
 */
export class TableLayout<
  T,
  O extends TableLayoutProps = TableLayoutProps,
> extends ListLayout<T, O> {
  protected override lastCollection: TableCollection<T> | null = null;
  private columnWidths = new Map<Key, number>();
  private stickyColumnIndices: number[];
  private lastPersistedKeys: Set<Key> | null = null;
  private readonly persistedIndices = new Map<Key, number[]>();
  constructor(options?: TableLayoutProps) {
    super(options);
    this.stickyColumnIndices = [];
  }
  // Backward compatibility for subclassing.
  protected override get collection(): TableCollection<T> {
    const { collection } = this.attachedVirtualizer;

    if (!isTableCollection(collection)) {
      throw new TypeError("TableLayout requires a table collection.");
    }

    return collection;
  }
  // Preserve the old rowHeight/other "height" properties since Table doesn't support a "horizontal" orientation
  protected override get rowHeight(): number | null {
    return this.rowSize;
  }
  protected override get estimatedRowHeight(): number | null {
    return this.estimatedRowSize;
  }
  protected override get headingHeight(): number | null {
    return this.headingSize;
  }
  protected override get estimatedHeadingHeight(): number | null {
    return this.estimatedHeadingSize;
  }
  protected override get loaderHeight(): number | null {
    return this.loaderSize;
  }
  private static columnsChanged<T>(
    newCollection: TableCollection<T>,
    oldCollection: TableCollection<T> | null
  ) {
    return (
      !oldCollection ||
      (newCollection.columns !== oldCollection.columns &&
        newCollection.columns.length !== oldCollection.columns.length) ||
      newCollection.columns.some(
        (c, i) =>
          c.key !==
            requireValue(
              oldCollection.columns[i],
              "Expected oldCollection.columns[i] to exist."
            ).key ||
          getNodeProps(c).width !==
            getNodeProps(oldCollection.columns[i]).width ||
          getNodeProps(c).minWidth !==
            getNodeProps(oldCollection.columns[i]).minWidth ||
          getNodeProps(c).maxWidth !==
            getNodeProps(oldCollection.columns[i]).maxWidth
      )
    );
  }
  override shouldInvalidateLayoutOptions(
    newOptions: O,
    oldOptions: O
  ): boolean {
    return (
      newOptions.columnWidths !== oldOptions.columnWidths ||
      super.shouldInvalidateLayoutOptions(newOptions, oldOptions)
    );
  }
  override update(invalidationContext: InvalidationContext<O>): void {
    const newCollection = this.collection;

    // If columnWidths were provided via layoutOptions, update those.
    // Otherwise, calculate column widths ourselves.
    if (invalidationContext.layoutOptions?.columnWidths) {
      for (const [key, val] of invalidationContext.layoutOptions.columnWidths) {
        if (this.columnWidths.get(key) !== val) {
          this.columnWidths = invalidationContext.layoutOptions.columnWidths;
          invalidationContext.sizeChanged = true;
          break;
        }
      }
    } else if (
      invalidationContext.sizeChanged === true ||
      TableLayout.columnsChanged(newCollection, this.lastCollection)
    ) {
      const columnLayout = new TableColumnLayout({});
      this.columnWidths = columnLayout.buildColumnWidths(
        this.attachedVirtualizer.size.width - this.padding * 2,
        newCollection,
        new Map()
      );
      invalidationContext.sizeChanged = true;
    }

    super.update(invalidationContext);
  }
  protected override buildCollection(): LayoutNode[] {
    this.stickyColumnIndices = [];
    const { collection } = this;

    for (const column of collection.columns) {
      // The selection cell and any other sticky columns always need to be visible.
      // In addition, row headers need to be in the DOM for accessibility labeling.
      if (
        this.isStickyColumn(column) ||
        collection.rowHeaderColumnKeys.has(column.key)
      ) {
        this.stickyColumnIndices.push(column.index);
      }
    }

    let layoutNodes: LayoutNode[] = [];
    let y = 0;
    let width = 0;

    if (collection.head) {
      for (const node of collection) {
        switch (node.type) {
          case "tableheader": {
            const header = this.buildTableHeader();
            y = header.layoutInfo.rect.maxY + this.gap;
            width = Math.max(width, header.layoutInfo.rect.width);
            this.layoutNodes.set(header.layoutInfo.key, header);
            layoutNodes.push(header);
            break;
          }

          case "tablebody":
          case "tablefooter": {
            const body = this.buildRowGroup(y, node);
            y = body.layoutInfo.rect.maxY + this.gap;
            width = Math.max(width, body.layoutInfo.rect.width);
            this.layoutNodes.set(body.layoutInfo.key, body);
            layoutNodes.push(body);
            break;
          }

          default: {
            break;
          }
        }
      }

      if (y > 0) {
        y -= this.gap;
      }

      for (const layoutNode of layoutNodes) {
        layoutNode.layoutInfo.rect.width = width;
      }
    } else {
      const header = this.buildTableHeader();
      this.layoutNodes.set(header.layoutInfo.key, header);
      const body = this.buildBody(header.layoutInfo.rect.maxY + this.gap);
      body.layoutInfo.rect.width = Math.max(
        header.layoutInfo.rect.width,
        body.layoutInfo.rect.width
      );
      y = body.layoutInfo.rect.maxY;
      ({ width } = body.layoutInfo.rect);
      layoutNodes = [header, body];
    }

    this.lastPersistedKeys = null;
    this.contentSize = new Size(width + this.padding * 2, y + this.padding);

    return layoutNodes;
  }
  protected buildTableHeader(): LayoutNode {
    const { collection } = this;
    const rect = new Rect(this.padding, this.padding, 0, 0);

    const layoutInfo = new LayoutInfo(
      "header",
      collection.head?.key ?? "header",
      rect
    );

    layoutInfo.isSticky = true;
    layoutInfo.zIndex = 1;
    let y = this.padding;
    let width = 0;
    const children: LayoutNode[] = [];

    for (const headerRow of collection.headerRows) {
      const layoutNode = this.buildChild(
        headerRow,
        this.padding,
        y,
        layoutInfo.key
      );

      layoutNode.layoutInfo.parentKey = layoutInfo.key;
      y = layoutNode.layoutInfo.rect.maxY;
      width = Math.max(width, layoutNode.layoutInfo.rect.width);
      layoutNode.index = children.length;
      children.push(layoutNode);
    }

    rect.width = width;
    rect.height = y - this.padding;

    return {
      children,
      layoutInfo,
      node: collection.head,
      validRect: layoutInfo.rect,
    };
  }
  protected buildHeaderRow(
    headerRow: GridNode<T>,
    initialX: number,
    y: number
  ): LayoutNode {
    let x = initialX;

    const rect = new Rect(x, y, 0, 0);
    const row = new LayoutInfo("headerrow", headerRow.key, rect);
    let height = 0;
    const columns: LayoutNode[] = [];

    for (const cell of getChildNodes(
      headerRow,
      this.attachedVirtualizer.collection
    )) {
      const layoutNode = this.buildChild(cell, x, y, row.key);
      layoutNode.layoutInfo.parentKey = row.key;
      x = layoutNode.layoutInfo.rect.maxX;
      height = Math.max(height, layoutNode.layoutInfo.rect.height);
      layoutNode.index = columns.length;
      columns.push(layoutNode);
    }

    for (const [i, layout] of columns.entries()) {
      layout.layoutInfo.zIndex = columns.length - i + 1;
    }

    TableLayout.setChildHeights(columns, height);
    rect.height = height;
    rect.width = x - rect.x;

    return {
      children: columns,
      layoutInfo: row,
      node: headerRow,
      validRect: rect,
    };
  }
  private static setChildHeights(children: LayoutNode[], height: number) {
    for (const child of children) {
      if (child.layoutInfo.rect.height !== height) {
        // Need to copy the layout info before we mutate it.
        child.layoutInfo = child.layoutInfo.copy();
        child.layoutInfo.rect.height = height;
      }
    }
  }
  // used to get the column widths when rendering to the DOM
  private getRenderedColumnWidth(node: GridNode<T>) {
    const { collection } = this;
    const colSpan = node.colSpan ?? 1;
    const colIndex = node.colIndex ?? node.index;
    let width = 0;

    for (let i = colIndex; i < colIndex + colSpan; i += 1) {
      const column = collection.columns[i];

      if (column?.key !== null && column?.key !== undefined) {
        width += this.columnWidths.get(column.key) ?? 0;
      }
    }

    return width;
  }
  private getEstimatedHeight(
    node: GridNode<T>,
    width: number,
    initialHeight: number | null,
    estimatedHeight: number | null
  ) {
    let height = initialHeight;

    let isEstimated = false;

    // If no explicit height is available, use an estimated height.
    if (height === null || height === undefined) {
      // If a previous version of this layout info exists, reuse its height.
      // Mark as estimated if the size of the overall collection view changed,
      // or the content of the item changed.
      const previousLayoutNode = this.layoutNodes.get(node.key);

      if (previousLayoutNode) {
        ({ height } = previousLayoutNode.layoutInfo.rect);
        isEstimated =
          node !== previousLayoutNode.node ||
          width !== previousLayoutNode.layoutInfo.rect.width ||
          previousLayoutNode.layoutInfo.estimatedSize;
      } else {
        height = estimatedHeight ?? DEFAULT_ROW_HEIGHT;
        isEstimated = true;
      }
    }

    return { height, isEstimated };
  }
  protected getEstimatedRowHeight(): number {
    return this.rowSize ?? this.estimatedRowSize ?? DEFAULT_ROW_HEIGHT;
  }
  protected buildColumn(node: GridNode<T>, x: number, y: number): LayoutNode {
    const width = this.getRenderedColumnWidth(node);

    const { height, isEstimated } = this.getEstimatedHeight(
      node,
      width,
      this.headingSize ?? this.rowSize,
      this.estimatedHeadingSize ?? this.estimatedRowSize
    );

    const rect = new Rect(x, y, width, height);
    const layoutInfo = new LayoutInfo(node.type, node.key, rect);
    layoutInfo.isSticky = this.isStickyColumn(node);
    layoutInfo.zIndex = layoutInfo.isSticky ? 2 : 1;
    layoutInfo.estimatedSize = isEstimated;

    return {
      children: [],
      layoutInfo,
      node,
      validRect: layoutInfo.rect,
    };
  }
  // For subclasses.
  protected isStickyColumn(_node: GridNode<T>) {
    return false;
  }
  protected buildBody(y: number): LayoutNode {
    const { collection } = this;

    return this.buildRowGroup(y, collection.body);
  }
  protected buildRowGroup(initialY: number, node: GridNode<T>): LayoutNode {
    let y = initialY;

    const { collection } = this;
    const rect = new Rect(this.padding, y, 0, 0);
    const layoutInfo = new LayoutInfo("rowgroup", node.key, rect);
    const startY = y;
    let width = 0;
    const children: LayoutNode[] = [];
    const rowHeight = this.getEstimatedRowHeight() + this.gap;
    const childNodes = getChildNodes(node, collection);

    for (const localNode of childNodes) {
      // Skip rows outside the valid rectangle unless they are already cached.
      if (
        (y + rowHeight < this.requestedRect.y && !this.isValid(localNode, y)) ||
        (y > this.requestedRect.maxY && localNode.type !== "loader")
      ) {
        y += rowHeight;
        continue;
      }

      const layoutNode = this.buildChild(
        localNode,
        this.padding,
        y,
        layoutInfo.key
      );

      layoutNode.layoutInfo.parentKey = layoutInfo.key;
      layoutNode.index = children.length;
      y = layoutNode.layoutInfo.rect.maxY + this.gap;
      width = Math.max(width, layoutNode.layoutInfo.rect.width);
      children.push(layoutNode);
    }

    // Make sure that the table body gets a height if empty or performing initial load
    const isEmptyOrLoading = collection?.size === 0;

    if (isEmptyOrLoading) {
      y = this.attachedVirtualizer.size.height;
    } else {
      y -= this.gap;
    }

    rect.width = width;
    rect.height = y - startY;

    return {
      children,
      layoutInfo,
      node,
      validRect: layoutInfo.rect.intersection(this.requestedRect),
    };
  }
  protected override buildLoader(
    node: GridNode<T>,
    x: number,
    y: number
  ): LayoutNode {
    const layoutNode = super.buildLoader(node, x, y);
    const { collection } = this;
    // use the same approach as buildRow to get the proper width of the loader, otherwise
    // we get a outdated loader width
    layoutNode.layoutInfo.rect.width = requireValue(
      this.layoutNodes.get(collection.head?.key ?? "header"),
      'Expected this.layoutNodes.get( collection.head?.key ?? "header" ) to exist.'
    ).layoutInfo.rect.width;
    layoutNode.validRect = layoutNode.layoutInfo.rect.intersection(
      this.requestedRect
    );

    return layoutNode;
  }
  protected override buildNode(
    node: GridNode<T>,
    x: number,
    y: number
  ): LayoutNode {
    switch (node.type) {
      case "headerrow": {
        return this.buildHeaderRow(node, x, y);
      }

      case "item": {
        return this.buildRow(node, x, y);
      }

      case "column":
      case "placeholder": {
        return this.buildColumn(node, x, y);
      }

      case "cell": {
        return this.buildCell(node, x, y);
      }

      case "loader": {
        return this.buildLoader(node, x, y);
      }

      default: {
        throw new Error(`Unknown node type ${node.type}`);
      }
    }
  }
  protected buildRow(
    node: GridNode<T>,
    initialX: number,
    y: number
  ): LayoutNode {
    let x = initialX;

    const { collection } = this;
    const rect = new Rect(x, y, 0, 0);
    const layoutInfo = new LayoutInfo("row", node.key, rect);
    const children: LayoutNode[] = [];
    let height = 0;

    for (const child of getChildNodes(node, collection)) {
      if (child.type === "cell") {
        if (x > this.requestedRect.maxX) {
          // Adjust existing cached layoutInfo to ensure that it is out of view.
          // This can happen due to column resizing.
          const layoutNode = this.layoutNodes.get(child.key);

          if (layoutNode) {
            layoutNode.layoutInfo.rect.x = x;
            x += layoutNode.layoutInfo.rect.width;
          } else {
            break;
          }
        } else {
          const layoutNode = this.buildChild(child, x, y, layoutInfo.key);
          x = layoutNode.layoutInfo.rect.maxX;
          height = Math.max(height, layoutNode.layoutInfo.rect.height);
          layoutNode.index = children.length;
          children.push(layoutNode);
        }
      }
    }

    TableLayout.setChildHeights(children, height);
    rect.width = requireValue(
      this.layoutNodes.get(collection.head?.key ?? "header"),
      'Expected this.layoutNodes.get( collection.head?.key ?? "header" ) to exist.'
    ).layoutInfo.rect.width;
    rect.height = height;

    return {
      children,
      layoutInfo,
      node,
      validRect: rect.intersection(this.requestedRect),
    };
  }
  protected buildCell(node: GridNode<T>, x: number, y: number): LayoutNode {
    const width = this.getRenderedColumnWidth(node);

    const { height, isEstimated } = this.getEstimatedHeight(
      node,
      width,
      this.rowSize,
      this.estimatedRowSize
    );

    const rect = new Rect(x, y, width, height);
    const layoutInfo = new LayoutInfo(node.type, node.key, rect);
    layoutInfo.isSticky = this.isStickyColumn(node);
    layoutInfo.zIndex = layoutInfo.isSticky ? 2 : 1;
    layoutInfo.estimatedSize = isEstimated;

    return {
      children: [],
      layoutInfo,
      node,
      validRect: rect,
    };
  }
  override getVisibleLayoutInfos(rect: Rect): LayoutInfo[] {
    // Adjust rect to keep number of visible rows consistent.
    // (only if height > 1 for getDropTargetFromPoint)
    if (rect.height > 1) {
      const rowHeight = this.getEstimatedRowHeight();
      rect.y = Math.floor(rect.y / rowHeight) * rowHeight;
      rect.height = Math.ceil(rect.height / rowHeight) * rowHeight;
    }

    // If layout hasn't yet been done for the requested rect, union the
    // new rect with the existing valid rect, and recompute.
    this.layoutIfNeeded(rect);
    const res: LayoutInfo[] = [];
    this.buildPersistedIndices();

    for (const node of this.rootNodes) {
      res.push(node.layoutInfo);
      this.addVisibleLayoutInfos(res, node, rect);
    }

    return res;
  }
  private addVisibleLayoutInfos(
    res: LayoutInfo[],
    node: LayoutNode,
    rect: Rect
  ) {
    if (!node.children || node.children.length === 0) {
      return;
    }

    switch (node.layoutInfo.type) {
      case "header": {
        for (const child of node.children) {
          res.push(child.layoutInfo);
          this.addVisibleLayoutInfos(res, child, rect);
        }

        break;
      }

      case "rowgroup": {
        this.addVisibleRows(res, node, rect);
        break;
      }

      case "headerrow":
      case "row": {
        const persisted =
          this.persistedIndices.get(node.layoutInfo.key) ??
          this.stickyColumnIndices;

        for (const child of TableLayout.visibleChildren(
          node,
          rect,
          "x",
          persisted
        )) {
          res.push(child.layoutInfo);
        }

        break;
      }

      default: {
        throw new Error(`Unknown node type ${node.layoutInfo.type}`);
      }
    }
  }
  private addVisibleRows(
    res: LayoutInfo[],
    node: LayoutNode,
    rect: Rect
  ): void {
    const persisted = this.persistedIndices.get(node.layoutInfo.key) ?? [];

    for (const child of TableLayout.visibleChildren(
      node,
      rect,
      "y",
      persisted
    )) {
      res.push(child.layoutInfo);
      this.addVisibleLayoutInfos(res, child, rect);
    }
  }
  private static visibleChildren(
    node: LayoutNode,
    rect: Rect,
    axis: "x" | "y",
    persisted: readonly number[]
  ): LayoutNode[] {
    const children = node.children ?? [];

    if (children.length === 0) {
      return [];
    }

    const first = TableLayout.binarySearch(children, rect.topLeft, axis);

    const last = TableLayout.binarySearch(
      children,
      axis === "x" ? rect.topRight : rect.bottomRight,
      axis
    );

    const indices = new Set(persisted);

    for (let index = first; index <= last; index += 1) {
      indices.add(index);
    }

    return [...indices]
      .toSorted((a, b) => a - b)
      .flatMap((index) => {
        const child = children[index];

        return child ? [child] : [];
      });
  }

  private static binarySearch(
    items: LayoutNode[],
    point: Point,
    axis: "x" | "y"
  ) {
    let low = 0;
    let high = items.length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);

      const item = requireValue(
        items[mid],
        "Binary search must stay within the layout nodes."
      );

      if (
        (axis === "x" && item.layoutInfo.rect.maxX <= point.x) ||
        (axis === "y" && item.layoutInfo.rect.maxY <= point.y)
      ) {
        low = mid + 1;
      } else if (
        (axis === "x" && item.layoutInfo.rect.x > point.x) ||
        (axis === "y" && item.layoutInfo.rect.y > point.y)
      ) {
        high = mid - 1;
      } else {
        return mid;
      }
    }

    return Math.max(0, Math.min(items.length - 1, low));
  }
  private buildPersistedIndices() {
    if (this.attachedVirtualizer.persistedKeys === this.lastPersistedKeys) {
      return;
    }

    this.lastPersistedKeys = this.attachedVirtualizer.persistedKeys;
    this.persistedIndices.clear();

    // Build a map of parentKey => indices of children to persist.
    for (const key of this.attachedVirtualizer.persistedKeys) {
      let layoutInfo = this.layoutNodes.get(key)?.layoutInfo;

      // Walk up ancestors so parents are also persisted if children are.
      while (
        layoutInfo &&
        layoutInfo.parentKey !== null &&
        layoutInfo.parentKey !== undefined
      ) {
        const collectionNode = this.attachedVirtualizer.collection.getItem(
          layoutInfo.key
        );

        let indices = this.persistedIndices.get(layoutInfo.parentKey);

        if (!indices) {
          // stickyColumnIndices are always persisted along with any cells from persistedKeys.
          indices =
            collectionNode?.type === "cell" || collectionNode?.type === "column"
              ? [...this.stickyColumnIndices]
              : [];
          this.persistedIndices.set(layoutInfo.parentKey, indices);
        }

        const index = this.layoutNodes.get(layoutInfo.key)?.index;

        if (index !== null && index !== undefined && !indices.includes(index)) {
          indices.push(index);
        }

        layoutInfo = this.layoutNodes.get(layoutInfo.parentKey)?.layoutInfo;
      }
    }

    for (const indices of this.persistedIndices.values()) {
      indices.sort((a, b) => a - b);
    }
  }
  override getDropTargetFromPoint(
    initialX: number,
    initialY: number,
    isValidDropTarget: (target: DropTarget) => boolean
  ): DropTarget | null {
    let x = initialX;

    let y = initialY;

    x += this.attachedVirtualizer.visibleRect.x;
    y += this.attachedVirtualizer.visibleRect.y;

    // Find the closest item within on either side of the point using the gap width.
    const searchRect = new Rect(
      x,
      Math.max(0, y - this.gap),
      1,
      Math.max(1, this.gap * 2)
    );

    const candidates = this.getVisibleLayoutInfos(searchRect);
    let key: Key | null = null;
    let minDistance = Infinity;

    for (const candidate of candidates) {
      // Ignore items outside the search rect, e.g. persisted keys.
      if (candidate.type !== "row" || !candidate.rect.intersects(searchRect)) {
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

    if (
      key === null ||
      key === undefined ||
      this.attachedVirtualizer.collection.size === 0
    ) {
      return { type: "root" };
    }

    const layoutInfo = this.getLayoutInfo(key);

    if (!layoutInfo) {
      return null;
    }

    const { rect } = layoutInfo;

    const target: DropTarget = {
      dropPosition: "on",
      key: layoutInfo.key,
      type: "item",
    };

    // If dropping on the item isn't accepted, try the target before or after depending on the y position.
    // Otherwise, if dropping on the item is accepted, still try the before/after positions if within 10px
    // of the top or bottom of the item.
    if (!isValidDropTarget(target)) {
      if (
        y <= rect.y + rect.height / 2 &&
        isValidDropTarget({ ...target, dropPosition: "before" })
      ) {
        target.dropPosition = "before";
      } else if (isValidDropTarget({ ...target, dropPosition: "after" })) {
        target.dropPosition = "after";
      }
    } else if (
      y <= rect.y + 10 &&
      isValidDropTarget({ ...target, dropPosition: "before" })
    ) {
      target.dropPosition = "before";
    } else if (
      y >= rect.maxY - 10 &&
      isValidDropTarget({ ...target, dropPosition: "after" })
    ) {
      target.dropPosition = "after";
    }

    return target;
  }
  override getDropTargetLayoutInfo(target: ItemDropTarget): LayoutInfo {
    const layoutInfo = super.getDropTargetLayoutInfo(target);
    layoutInfo.parentKey =
      this.attachedVirtualizer.collection.getItem(target.key)?.parentKey ??
      null;

    return layoutInfo;
  }
}
