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
 * Derived from Adobe React Spectrum: packages/react-stately/src/layout/ListLayout.ts.
 * Modified for Solid Aria: adapted imports, collection descriptors, and reactive state APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  Collection,
  DropTarget,
  DropTargetDelegate,
  ItemDropTarget,
  Key,
  Node,
  Orientation,
} from "@solid2-aria/types-shared";

import { getChildNodes } from "../collections/get-child-nodes";
import { getNodeProps } from "../utils/get-node-props";
import { hasContent } from "../utils/has-content";
import { requireValue } from "../utils/require-value";
import { Layout } from "../virtualizer/layout";
import { LayoutInfo } from "../virtualizer/layout-info";
import { Rect } from "../virtualizer/rect";
import { Size } from "../virtualizer/size";
import type { InvalidationContext } from "../virtualizer/types";

export interface ListLayoutOptions {
  /**
   * The primary orientation of the items. Usually this is the direction that the collection
   * scrolls.
   *
   * @default 'vertical'
   */
  orientation?: Orientation;
  /**
   * The fixed size of a row in px with respect to the applied orientation.
   *
   * @default 48
   */
  rowSize?: number;
  /**
   * The estimated size of a row in px with respect to the applied orientation, when row sizes are
   * variable.
   */
  estimatedRowSize?: number;
  /**
   * The fixed size of a section header in px with respect to the applied orientation.
   *
   * @default 48
   */
  headingSize?: number;
  /**
   * The estimated size of a section header in px with respect to the applied orientation, when
   * heading sizes are variable.
   */
  estimatedHeadingSize?: number;
  /**
   * The fixed size of a loader element in px with respect to the applied orientation. This loader
   * is specifically for "load more" elements rendered when loading more rows at the root level or
   * inside nested row/sections.
   *
   * @default 48
   */
  loaderSize?: number;
  /**
   * The thickness of the drop indicator.
   *
   * @default 2
   */
  dropIndicatorThickness?: number;
  /**
   * The gap between items.
   *
   * @default 0
   */
  gap?: number;
  /**
   * The padding around the list.
   *
   * @default 0
   */
  padding?: number;
  /**
   * The fixed height of a row in px.
   *
   * @deprecated Use `rowSize` instead.
   * @default 48
   */
  rowHeight?: number;
  /**
   * The estimated height of a row, when row heights are variable.
   *
   * @deprecated Use `estimatedRowSize` instead.
   */
  estimatedRowHeight?: number;
  /**
   * The fixed height of a section header in px.
   *
   * @deprecated Use `headingSize` instead.
   * @default 48
   */
  headingHeight?: number;
  /**
   * The estimated height of a section header, when the height is variable.
   *
   * @deprecated Use `estimatedHeadingSize` instead.
   */
  estimatedHeadingHeight?: number;
  /**
   * The fixed height of a loader element in px. This loader is specifically for "load more"
   * elements rendered when loading more rows at the root level or inside nested row/sections.
   *
   * @deprecated Use `loaderSize` instead.
   * @default 48
   */
  loaderHeight?: number;
}

// A wrapper around LayoutInfo that supports hierarchy
export interface LayoutNode {
  node?: Node<unknown>;
  layoutInfo: LayoutInfo;
  children?: LayoutNode[];
  validRect: Rect;
  index?: number;
}

const DEFAULT_HEIGHT = 48;

/**
 * ListLayout is a virtualizer Layout implementation
 * that arranges its items in a stack along its applied orientation.
 * It supports both fixed and variable size items.
 */
export class ListLayout<T, O extends ListLayoutOptions = ListLayoutOptions>
  extends Layout<Node<T>, O>
  implements DropTargetDelegate
{
  protected rowSize: number | null;
  protected orientation: Orientation;
  protected estimatedRowSize: number | null;
  protected headingSize: number | null;
  protected estimatedHeadingSize: number | null;
  protected loaderSize: number | null;
  protected dropIndicatorThickness: number;
  protected gap: number;
  protected padding: number;
  protected layoutNodes: Map<Key, LayoutNode>;
  protected contentSize: Size;
  protected lastCollection: Collection<Node<T>> | null;
  protected rootNodes: LayoutNode[];
  private invalidateEverything: boolean;
  /** The rectangle containing currently valid layout infos. */
  protected validRect: Rect;
  /** The rectangle of requested layout infos so far. */
  protected requestedRect: Rect;
  /**
   * Creates a new ListLayout with options. See the list of properties below for a description
   * of the options that can be provided.
   */
  constructor(initialOptions: ListLayoutOptions = {}) {
    super();
    const options = normalizeListLayoutOptions(initialOptions);
    this.rowSize = options?.rowSize ?? null;
    this.orientation = options.orientation ?? "vertical";
    this.estimatedRowSize = options?.estimatedRowSize ?? null;
    this.headingSize = options?.headingSize ?? null;
    this.estimatedHeadingSize = options?.estimatedHeadingSize ?? null;
    this.loaderSize = options?.loaderSize ?? null;
    this.dropIndicatorThickness = options.dropIndicatorThickness ?? 2;
    this.gap = options.gap ?? 0;
    this.padding = options.padding ?? 0;
    this.layoutNodes = new Map();
    this.rootNodes = [];
    this.lastCollection = null;
    this.invalidateEverything = false;
    this.validRect = new Rect();
    this.requestedRect = new Rect();
    this.contentSize = new Size();
  }
  // Backward compatibility for subclassing.
  protected get collection(): Collection<Node<T>> {
    return this.attachedVirtualizer.collection;
  }
  /** @deprecated Use `rowSize` instead. */
  protected get rowHeight(): number | null {
    return this.rowSize;
  }
  /** @deprecated Use `estimatedRowSize` instead. */
  protected get estimatedRowHeight(): number | null {
    return this.estimatedRowSize;
  }
  /** @deprecated Use `headingSize` instead. */
  protected get headingHeight(): number | null {
    return this.headingSize;
  }
  /** @deprecated Use `estimatedHeadingSize` instead. */
  protected get estimatedHeadingHeight(): number | null {
    return this.estimatedHeadingSize;
  }
  /** @deprecated Use `loaderSize` instead. */
  protected get loaderHeight(): number | null {
    return this.loaderSize;
  }
  getLayoutInfo(key: Key): LayoutInfo | null {
    this.ensureLayoutInfo(key);

    return this.layoutNodes.get(key)?.layoutInfo ?? null;
  }
  getVisibleLayoutInfos(initialRect: Rect): LayoutInfo[] {
    let rect = initialRect;

    const offsetProperty: "x" | "y" =
      this.orientation === "horizontal" ? "x" : "y";

    const heightProperty: "width" | "height" =
      this.orientation === "horizontal" ? "width" : "height";

    // Adjust rect to keep number of visible rows consistent.
    // (only if height > 1 or width > 1 for getDropTargetFromPoint)
    if (rect[heightProperty] > 1) {
      const rowHeight =
        (this.rowSize ?? this.estimatedRowSize ?? DEFAULT_HEIGHT) + this.gap;

      // Clone only before mutating
      rect = rect.copy();
      const offset = Math.floor(rect[offsetProperty] / rowHeight) * rowHeight;
      const height = rect[heightProperty] + rect[offsetProperty] - offset;
      rect[offsetProperty] = offset;
      rect[heightProperty] = Math.ceil(height / rowHeight) * rowHeight;
    }

    // If layout hasn't yet been done for the requested rect, union the
    // new rect with the existing valid rect, and recompute.
    this.layoutIfNeeded(rect);
    const res: LayoutInfo[] = [];

    const addNodes = (nodes: LayoutNode[]) => {
      for (const node of nodes) {
        if (this.isVisible(node, rect)) {
          res.push(node.layoutInfo);

          if (node.children) {
            addNodes(node.children);
          }
        }
      }
    };

    addNodes(this.rootNodes);

    return res;
  }
  protected layoutIfNeeded(rect: Rect): void {
    if (!this.lastCollection) {
      return;
    }

    if (!this.requestedRect.containsRect(rect)) {
      this.requestedRect = this.requestedRect.union(rect);
      this.rootNodes = this.buildCollection();
    }

    // Ensure all of the persisted keys are available.
    for (const key of this.attachedVirtualizer.persistedKeys) {
      if (this.ensureLayoutInfo(key)) {
        return;
      }
    }
  }
  private ensureLayoutInfo(key: Key) {
    // If the layout info wasn't found, it might be outside the bounds of the area that we've
    // computed layout for so far. This can happen when accessing a random key, e.g pressing Home/End.
    // Compute the full layout and try again.
    if (
      !this.layoutNodes.has(key) &&
      this.requestedRect.area < this.contentSize.area &&
      this.lastCollection
    ) {
      this.requestedRect = new Rect(0, 0, Infinity, Infinity);
      this.rootNodes = this.buildCollection();
      this.requestedRect = new Rect(
        0,
        0,
        this.contentSize.width,
        this.contentSize.height
      );

      return true;
    }

    return false;
  }
  protected isVisible(node: LayoutNode, rect: Rect): boolean {
    return (
      node.layoutInfo.rect.intersects(rect) ||
      node.layoutInfo.isSticky ||
      node.layoutInfo.type === "header" ||
      node.layoutInfo.type === "loader" ||
      this.attachedVirtualizer.isPersistedKey(node.layoutInfo.key)
    );
  }
  protected shouldInvalidateEverything(
    invalidationContext: InvalidationContext<O>
  ): boolean {
    const options = normalizeListLayoutOptions(
      invalidationContext.layoutOptions ?? {}
    );

    return (
      invalidationContext.sizeChanged === true ||
      this.rowSize !== (options?.rowSize ?? this.rowSize) ||
      this.orientation !== (options?.orientation ?? this.orientation) ||
      this.headingSize !== (options?.headingSize ?? this.headingSize) ||
      this.loaderSize !== (options?.loaderSize ?? this.loaderSize) ||
      this.gap !== (options?.gap ?? this.gap) ||
      this.padding !== (options?.padding ?? this.padding)
    );
  }
  override shouldInvalidateLayoutOptions(
    initialNewOptions: O,
    initialOldOptions: O
  ): boolean {
    const newOptions = normalizeListLayoutOptions(initialNewOptions);
    const oldOptions = normalizeListLayoutOptions(initialOldOptions);

    return (
      newOptions?.rowSize !== oldOptions?.rowSize ||
      newOptions.orientation !== oldOptions.orientation ||
      newOptions?.estimatedRowSize !== oldOptions?.estimatedRowSize ||
      newOptions?.headingSize !== oldOptions?.headingSize ||
      newOptions?.estimatedHeadingSize !== oldOptions?.estimatedHeadingSize ||
      newOptions?.loaderSize !== oldOptions?.loaderSize ||
      newOptions.dropIndicatorThickness !== oldOptions.dropIndicatorThickness ||
      newOptions.gap !== oldOptions.gap ||
      newOptions.padding !== oldOptions.padding
    );
  }
  override update(invalidationContext: InvalidationContext<O>): void {
    const { collection } = this.attachedVirtualizer;
    // Reset valid rect if we will have to invalidate everything.
    // Otherwise we can reuse cached layout infos outside the current visible rect.
    this.invalidateEverything =
      this.shouldInvalidateEverything(invalidationContext);

    if (this.invalidateEverything) {
      this.requestedRect = this.attachedVirtualizer.visibleRect.copy();
      this.layoutNodes.clear();
    }

    this.updateOptions(invalidationContext.layoutOptions);
    this.rootNodes = this.buildCollection();

    // Remove deleted layout nodes
    if (this.lastCollection && collection !== this.lastCollection) {
      for (const key of this.lastCollection.getKeys()) {
        if (!collection.getItem(key)) {
          const layoutNode = this.layoutNodes.get(key);

          if (layoutNode) {
            this.layoutNodes.delete(key);
          }
        }
      }
    }

    this.lastCollection = collection;
    this.invalidateEverything = false;
    this.validRect = this.requestedRect.copy();
  }
  private updateOptions(layoutOptions: O | undefined): void {
    const options = normalizeListLayoutOptions(layoutOptions ?? {});

    this.rowSize = options.rowSize ?? this.rowSize;
    this.orientation = options.orientation ?? this.orientation;
    this.estimatedRowSize = options.estimatedRowSize ?? this.estimatedRowSize;
    this.headingSize = options.headingSize ?? this.headingSize;
    this.estimatedHeadingSize =
      options.estimatedHeadingSize ?? this.estimatedHeadingSize;
    this.loaderSize = options.loaderSize ?? this.loaderSize;
    this.dropIndicatorThickness =
      options.dropIndicatorThickness ?? this.dropIndicatorThickness;
    this.gap = options.gap ?? this.gap;
    this.padding = options.padding ?? this.padding;
  }
  protected buildCollection(
    initialOffset: number = this.padding
  ): LayoutNode[] {
    let offset = initialOffset;

    const { collection } = this.attachedVirtualizer;

    const offsetProperty: "x" | "y" =
      this.orientation === "horizontal" ? "x" : "y";

    const maxOffsetProperty: "maxX" | "maxY" =
      this.orientation === "horizontal" ? "maxX" : "maxY";

    // filter out content nodes since we don't want them to affect the height
    // Tree specific for now, if we add content nodes to other collection items, we might need to reconsider this
    const collectionNodes = toArray(
      collection,
      (node) => node.type !== "content"
    );

    const loaderNodes = collectionNodes.filter(
      (node) => node.type === "loader"
    );

    const nodes: LayoutNode[] = [];
    const isEmptyOrLoading = collection.size === 0;

    if (isEmptyOrLoading) {
      offset = 0;
    }

    for (const node of collectionNodes) {
      const rowHeight =
        (this.rowSize ?? this.estimatedRowSize ?? DEFAULT_HEIGHT) + this.gap;

      // Skip rows before the valid rectangle unless they are already cached.
      if (
        node.type === "item" &&
        offset + rowHeight < this.requestedRect[offsetProperty] &&
        !this.isValid(node, offset)
      ) {
        offset += rowHeight;
        continue;
      }

      const layoutNode =
        this.orientation === "horizontal"
          ? this.buildChild(node, offset, this.padding, null)
          : this.buildChild(node, this.padding, offset, null);

      offset = layoutNode.layoutInfo.rect[maxOffsetProperty] + this.gap;
      nodes.push(layoutNode);

      if (node.type === "loader") {
        const index = loaderNodes.indexOf(node);
        loaderNodes.splice(index, 1);
      }

      // Build each loader that exists in the collection that is outside the visible rect so that they are persisted
      // at the proper estimated location. If the node.type is "section" then we don't do this shortcut since we have to
      // build the sections to see how tall they are.
      if (
        (node.type === "item" || node.type === "loader") &&
        offset > this.requestedRect[maxOffsetProperty]
      ) {
        let lastProcessedIndex = collectionNodes.indexOf(node);

        for (const loaderNode of loaderNodes) {
          const loaderNodeIndex = collectionNodes.indexOf(loaderNode);
          // Subtract by an additional 1 since we've already added the current item's height to y
          offset += (loaderNodeIndex - lastProcessedIndex - 1) * rowHeight;

          const loader =
            this.orientation === "horizontal"
              ? this.buildChild(loaderNode, offset, this.padding, null)
              : this.buildChild(loaderNode, this.padding, offset, null);

          nodes.push(loader);
          offset = loader.layoutInfo.rect[maxOffsetProperty];
          lastProcessedIndex = loaderNodeIndex;
        }

        // Account for the rest of the items after the last loader spinner, subtract by 1 since we've processed the current node's height already
        offset += (collectionNodes.length - lastProcessedIndex - 1) * rowHeight;
        break;
      }
    }

    offset = Math.max(offset - this.gap, 0);
    offset += isEmptyOrLoading ? 0 : this.padding;
    this.contentSize =
      this.orientation === "horizontal"
        ? new Size(offset, this.attachedVirtualizer.size.height)
        : new Size(this.attachedVirtualizer.size.width, offset);

    return nodes;
  }
  protected isValid(node: Node<T>, offset: number): boolean {
    const cached = this.layoutNodes.get(node.key);

    const offsetProperty: "x" | "y" =
      this.orientation === "horizontal" ? "x" : "y";

    return (
      !this.invalidateEverything &&
      !!cached &&
      cached.node === node &&
      offset === cached.layoutInfo.rect[offsetProperty] &&
      cached.layoutInfo.rect.intersects(this.validRect) &&
      cached.validRect.containsRect(
        cached.layoutInfo.rect.intersection(this.requestedRect)
      )
    );
  }
  protected buildChild(
    node: Node<T>,
    x: number,
    y: number,
    parentKey: Key | null
  ): LayoutNode {
    if (this.isValid(node, this.orientation === "horizontal" ? x : y)) {
      return requireValue(
        this.layoutNodes.get(node.key),
        "A valid layout node must be cached."
      );
    }

    const layoutNode = this.buildNode(node, x, y);
    layoutNode.layoutInfo.parentKey = parentKey ?? null;
    layoutNode.layoutInfo.allowOverflow = true;
    this.layoutNodes.set(node.key, layoutNode);

    return layoutNode;
  }
  protected buildNode(node: Node<T>, x: number, y: number): LayoutNode {
    switch (node.type) {
      case "section": {
        return this.buildSection(node, x, y);
      }

      case "item": {
        return this.buildItem(node, x, y);
      }

      case "header": {
        return this.buildSectionHeader(node, x, y);
      }

      case "loader": {
        return this.buildLoader(node, x, y);
      }

      case "separator": {
        return this.buildItem(node, x, y);
      }

      // uses buildSection instead of buildItem cuz it has a child node (the trigger)
      // that need to be processed
      case "submenutrigger": {
        return this.buildSection(node, x, y);
      }

      default: {
        throw new Error(`Unsupported node type: ${node.type}`);
      }
    }
  }
  protected buildLoader(node: Node<T>, x: number, y: number): LayoutNode {
    const rect = new Rect(x, y, this.padding, 0);
    const layoutInfo = new LayoutInfo(node.type, node.key, rect);

    // Note that if the user provides isLoading to their sentinel during a case where they only want to render the emptyState, this will reserve
    // room for the loader alongside rendering the emptyState
    if (this.orientation === "horizontal") {
      rect.height =
        this.attachedVirtualizer.contentSize.height - this.padding - y;
      rect.width = getNodeProps(node).isLoading
        ? (this.loaderSize ??
          this.rowSize ??
          this.estimatedRowSize ??
          DEFAULT_HEIGHT)
        : 0;
    } else {
      rect.width =
        this.attachedVirtualizer.contentSize.width - this.padding - x;
      rect.height = getNodeProps(node).isLoading
        ? (this.loaderSize ??
          this.rowSize ??
          this.estimatedRowSize ??
          DEFAULT_HEIGHT)
        : 0;
    }

    return {
      layoutInfo,
      validRect: rect.intersection(this.requestedRect),
    };
  }
  protected buildSection(node: Node<T>, x: number, y: number): LayoutNode {
    const { collection } = this.attachedVirtualizer;
    const width = this.attachedVirtualizer.size.width - this.padding - x;
    const height = this.attachedVirtualizer.size.height - this.padding - y;

    const rect =
      this.orientation === "horizontal"
        ? new Rect(x, y, 0, height)
        : new Rect(x, y, width, 0);

    const layoutInfo = new LayoutInfo(node.type, node.key, rect);
    let offset = this.orientation === "horizontal" ? x : y;

    const offsetProperty: "x" | "y" =
      this.orientation === "horizontal" ? "x" : "y";

    const maxOffsetProperty: "maxX" | "maxY" =
      this.orientation === "horizontal" ? "maxX" : "maxY";

    const heightProperty: "width" | "height" =
      this.orientation === "horizontal" ? "width" : "height";

    let skipped = 0;
    const children: LayoutNode[] = [];

    for (const child of getChildNodes(node, collection)) {
      // skip if it is a content node, Tree specific for now, if we add content nodes to other collection items, we might need to reconsider this
      if (child.type === "content") {
        continue;
      }

      const rowHeight =
        (this.rowSize ?? this.estimatedRowSize ?? DEFAULT_HEIGHT) + this.gap;

      // Skip rows before the valid rectangle unless they are already cached.
      if (
        offset + rowHeight < this.requestedRect[offsetProperty] &&
        !this.isValid(node, offset)
      ) {
        offset += rowHeight;
        skipped += 1;
        continue;
      }

      const layoutNode =
        this.orientation === "horizontal"
          ? this.buildChild(child, offset, y, layoutInfo.key)
          : this.buildChild(child, x, offset, layoutInfo.key);

      offset = layoutNode.layoutInfo.rect[maxOffsetProperty] + this.gap;
      children.push(layoutNode);

      if (offset > this.requestedRect[maxOffsetProperty]) {
        // Estimate the remaining height for rows that we don't need to layout right now.
        offset +=
          ([...getChildNodes(node, collection)].length -
            (children.length + skipped)) *
          rowHeight;
        break;
      }
    }

    offset -= this.gap;
    rect[heightProperty] = offset - (this.orientation === "horizontal" ? x : y);

    return {
      children,
      layoutInfo,
      node,
      validRect: layoutInfo.rect.intersection(this.requestedRect),
    };
  }
  protected buildSectionHeader(
    node: Node<T>,
    x: number,
    y: number
  ): LayoutNode {
    const widthProperty: "width" | "height" =
      this.orientation === "horizontal" ? "height" : "width";

    const heightProperty: "width" | "height" =
      this.orientation === "horizontal" ? "width" : "height";

    const width =
      this.attachedVirtualizer.size[widthProperty] -
      this.padding -
      (this.orientation === "horizontal" ? y : x);

    let rectHeight = this.headingSize;
    let isEstimated = false;

    // If no explicit height is available, use an estimated height.
    if (rectHeight === null || rectHeight === undefined) {
      // If a previous version of this layout info exists, reuse its height.
      // Mark as estimated if the size of the overall virtualizer changed,
      // or the content of the item changed.
      const previousLayoutNode = this.layoutNodes.get(node.key);
      const previousLayoutInfo = previousLayoutNode?.layoutInfo;

      if (previousLayoutInfo) {
        const curNode = this.attachedVirtualizer.collection.getItem(node.key);

        const lastNode = this.lastCollection
          ? this.lastCollection.getItem(node.key)
          : null;

        rectHeight = previousLayoutNode.layoutInfo.rect[heightProperty];
        isEstimated =
          width !== previousLayoutInfo.rect[widthProperty] ||
          curNode !== lastNode ||
          previousLayoutInfo.estimatedSize;
      } else {
        rectHeight = hasContent(node.rendered) ? this.estimatedHeadingSize : 0;
        isEstimated = true;
      }
    }

    rectHeight ??= DEFAULT_HEIGHT;

    const headerRect =
      this.orientation === "horizontal"
        ? new Rect(x, y, rectHeight, width - y)
        : new Rect(x, y, width - x, rectHeight);

    const header = new LayoutInfo("header", node.key, headerRect);
    header.estimatedSize = isEstimated;

    return {
      children: [],
      layoutInfo: header,
      node,
      validRect: header.rect.intersection(this.requestedRect),
    };
  }
  protected buildItem(node: Node<T>, x: number, y: number): LayoutNode {
    const widthProperty: "width" | "height" =
      this.orientation === "horizontal" ? "height" : "width";

    const heightProperty: "width" | "height" =
      this.orientation === "horizontal" ? "width" : "height";

    const width =
      this.attachedVirtualizer.size[widthProperty] -
      this.padding -
      (this.orientation === "horizontal" ? y : x);

    let rectHeight = this.rowSize;
    let isEstimated = false;

    // If no explicit height is available, use an estimated height.
    if (rectHeight === null || rectHeight === undefined) {
      // If a previous version of this layout info exists, reuse its height.
      // Mark as estimated if the size of the overall virtualizer changed,
      // or the content of the item changed.
      const previousLayoutNode = this.layoutNodes.get(node.key);

      if (previousLayoutNode) {
        rectHeight = previousLayoutNode.layoutInfo.rect[heightProperty];
        isEstimated =
          width !== previousLayoutNode.layoutInfo.rect[widthProperty] ||
          node !== previousLayoutNode.node ||
          previousLayoutNode.layoutInfo.estimatedSize;
      } else {
        rectHeight = this.estimatedRowSize;
        isEstimated = true;
      }
    }

    rectHeight ??= DEFAULT_HEIGHT;

    const rect =
      this.orientation === "horizontal"
        ? new Rect(x, y, rectHeight, width)
        : new Rect(x, y, width, rectHeight);

    const layoutInfo = new LayoutInfo(node.type, node.key, rect);
    layoutInfo.estimatedSize = isEstimated;

    return {
      children: [],
      layoutInfo,
      node,
      validRect: layoutInfo.rect.intersection(this.requestedRect),
    };
  }
  override updateItemSize(key: Key, size: Size): boolean {
    const layoutNode = this.layoutNodes.get(key);

    // If no layoutInfo, item has been deleted/removed.
    if (!layoutNode) {
      return false;
    }

    const { collection } = this.attachedVirtualizer;
    const { layoutInfo } = layoutNode;

    const offsetProperty: "x" | "y" =
      this.orientation === "horizontal" ? "x" : "y";

    const heightProperty: "width" | "height" =
      this.orientation === "horizontal" ? "width" : "height";

    layoutInfo.estimatedSize = false;

    if (layoutInfo.rect[heightProperty] !== size[heightProperty]) {
      // Copy layout info rather than mutating so that later caches are invalidated.
      const newLayoutInfo = layoutInfo.copy();
      newLayoutInfo.rect[heightProperty] = size[heightProperty];
      layoutNode.layoutInfo = newLayoutInfo;
      // Items after this layoutInfo will need to be repositioned to account for the new height.
      // Adjust the validRect so that only items above remain valid.
      this.validRect[heightProperty] = Math.min(
        this.validRect[heightProperty],
        layoutInfo.rect[offsetProperty] - this.validRect[offsetProperty]
      );

      // The requestedRect also needs to be adjusted to account for the height difference.
      if (layoutNode.node?.type === "item") {
        this.requestedRect[heightProperty] +=
          newLayoutInfo.rect[heightProperty] - layoutInfo.rect[heightProperty];
      }

      // Invalidate layout for this layout node and all parents
      this.updateLayoutNode(key, layoutInfo, newLayoutInfo);

      let node =
        layoutInfo.parentKey === null || layoutInfo.parentKey === undefined
          ? null
          : collection.getItem(layoutInfo.parentKey);

      while (node) {
        this.updateLayoutNode(node.key, layoutInfo, newLayoutInfo);
        node =
          node.parentKey === null || node.parentKey === undefined
            ? null
            : collection.getItem(node.parentKey);
      }

      return true;
    }

    return false;
  }
  private updateLayoutNode(
    key: Key,
    oldLayoutInfo: LayoutInfo,
    newLayoutInfo: LayoutInfo
  ) {
    const n = this.layoutNodes.get(key);

    if (n) {
      // Invalidate by intersecting the validRect of this node with the overall validRect.
      n.validRect = n.validRect.intersection(this.validRect);

      // Replace layout info in LayoutNode
      if (n.layoutInfo === oldLayoutInfo) {
        n.layoutInfo = newLayoutInfo;
      }
    }
  }
  getContentSize(): Size {
    return this.contentSize;
  }
  private getNearestDropKey(
    searchRect: Rect,
    x: number,
    y: number
  ): Key | null {
    const candidates = this.getVisibleLayoutInfos(searchRect);
    let key: Key | null = null;
    let minDistance = Infinity;

    for (const candidate of candidates) {
      // Ignore items outside the search rect, e.g. persisted keys.
      if (!candidate.rect.intersects(searchRect)) {
        continue;
      }

      const position = this.orientation === "horizontal" ? x : y;

      const start =
        this.orientation === "horizontal" ? candidate.rect.x : candidate.rect.y;

      const end =
        this.orientation === "horizontal"
          ? candidate.rect.maxX
          : candidate.rect.maxY;

      const dist = Math.min(
        Math.abs(start - position),
        Math.abs(end - position)
      );

      if (dist < minDistance) {
        minDistance = dist;
        ({ key } = candidate);
      }
    }

    return key;
  }
  getDropTargetFromPoint(
    initialX: number,
    initialY: number,
    isValidDropTarget: (target: DropTarget) => boolean
  ): DropTarget | null {
    let x = initialX;

    let y = initialY;

    x += this.attachedVirtualizer.visibleRect.x;
    y += this.attachedVirtualizer.visibleRect.y;

    // Find the closest item within on either side of the point using the gap width.
    const searchRect =
      this.orientation === "horizontal"
        ? new Rect(Math.max(0, x - this.gap), y, Math.max(1, this.gap * 2), 1)
        : new Rect(x, Math.max(0, y - this.gap), 1, Math.max(1, this.gap * 2));

    const key = this.getNearestDropKey(searchRect, x, y);

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
    const position = this.orientation === "horizontal" ? x : y;
    const start = this.orientation === "horizontal" ? rect.x : rect.y;
    const end = this.orientation === "horizontal" ? rect.maxX : rect.maxY;
    const size = this.orientation === "horizontal" ? rect.width : rect.height;

    const target: DropTarget = {
      dropPosition: "on",
      key: layoutInfo.key,
      type: "item",
    };

    // If dropping on the item isn't accepted, try the target before or after depending on the
    // position along the main axis. Otherwise, if dropping on the item is accepted, still try
    // the before/after positions if within 10px of the start or end of the item.
    if (!isValidDropTarget(target)) {
      if (
        position <= start + size / 2 &&
        isValidDropTarget({ ...target, dropPosition: "before" })
      ) {
        target.dropPosition = "before";
      } else if (isValidDropTarget({ ...target, dropPosition: "after" })) {
        target.dropPosition = "after";
      }
    } else if (
      position <= start + 10 &&
      isValidDropTarget({ ...target, dropPosition: "before" })
    ) {
      target.dropPosition = "before";
    } else if (
      position >= end - 10 &&
      isValidDropTarget({ ...target, dropPosition: "after" })
    ) {
      target.dropPosition = "after";
    }

    return target;
  }
  override getDropTargetLayoutInfo(target: ItemDropTarget): LayoutInfo {
    let layoutInfo = requireValue(
      this.getLayoutInfo(target.key),
      "Drop targets must have layout information."
    );

    let rect: Rect;

    if (target.dropPosition === "before") {
      rect =
        this.orientation === "horizontal"
          ? new Rect(
              Math.max(0, layoutInfo.rect.x - this.dropIndicatorThickness / 2),
              layoutInfo.rect.y,
              this.dropIndicatorThickness,
              layoutInfo.rect.height
            )
          : new Rect(
              layoutInfo.rect.x,
              Math.max(0, layoutInfo.rect.y - this.dropIndicatorThickness / 2),
              layoutInfo.rect.width,
              this.dropIndicatorThickness
            );
    } else if (target.dropPosition === "after") {
      // Render after last visible descendant of the drop target.
      const targetNode = this.collection.getItem(target.key);

      if (targetNode) {
        const targetLevel = targetNode.level ?? 0;
        let currentKey = this.collection.getKeyAfter(target.key);

        while (currentKey !== null && currentKey !== undefined) {
          const node = this.collection.getItem(currentKey);

          if (!node || node.level <= targetLevel) {
            break;
          }

          layoutInfo = this.getLayoutInfo(currentKey) ?? layoutInfo;
          currentKey = this.collection.getKeyAfter(currentKey);
        }
      }

      rect =
        this.orientation === "horizontal"
          ? new Rect(
              layoutInfo.rect.maxX - this.dropIndicatorThickness / 2,
              layoutInfo.rect.y,
              this.dropIndicatorThickness,
              layoutInfo.rect.height
            )
          : new Rect(
              layoutInfo.rect.x,
              layoutInfo.rect.maxY - this.dropIndicatorThickness / 2,
              layoutInfo.rect.width,
              this.dropIndicatorThickness
            );
    } else {
      ({ rect } = layoutInfo);
    }

    return new LayoutInfo(
      "dropIndicator",
      `${target.key}:${target.dropPosition}`,
      rect
    );
  }
}

function toArray<T>(
  collection: Collection<Node<T>>,
  predicate: (node: Node<T>) => boolean
): Node<T>[] {
  const result: Node<T>[] = [];

  for (const node of collection) {
    if (predicate(node)) {
      result.push(node);
    }
  }

  return result;
}

/** Normalizes legacy height options once at the layout boundary. Modern values take precedence. */
export function normalizeListLayoutOptions(
  options: ListLayoutOptions
): ListLayoutOptions {
  return {
    ...options,
    estimatedHeadingSize:
      options.estimatedHeadingSize ??
      // oxlint-disable-next-line typescript/no-deprecated -- Normalize the legacy option only at this compatibility boundary.
      options.estimatedHeadingHeight,
    estimatedRowSize:
      options.estimatedRowSize ??
      // oxlint-disable-next-line typescript/no-deprecated -- Normalize the legacy option only at this compatibility boundary.
      options.estimatedRowHeight,
    headingSize:
      options.headingSize ??
      // oxlint-disable-next-line typescript/no-deprecated -- Normalize the legacy option only at this compatibility boundary.
      options.headingHeight,
    loaderSize:
      options.loaderSize ??
      // oxlint-disable-next-line typescript/no-deprecated -- Normalize the legacy option only at this compatibility boundary.
      options.loaderHeight,
    rowSize:
      options.rowSize ??
      // oxlint-disable-next-line typescript/no-deprecated -- Normalize the legacy option only at this compatibility boundary.
      options.rowHeight,
  };
}
