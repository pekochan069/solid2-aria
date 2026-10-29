/*
 * Copyright 2021 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/@react-types/card/src/index.d.ts.
 * Modified for Solid Aria: adapted type declarations, imports, and formatting for Solid.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  CollectionBase,
  MultipleSelection,
  AsyncLoadable,
  Orientation,
  Node,
  LayoutDelegate,
  Collection,
  Key,
  ItemDropTarget,
  KeyboardDelegate,
  Direction,
  LoadingState,
  DOMProps,
  AriaLabelingProps,
} from "@solid2-aria/types-shared";
import type { StyleProps } from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";
import type { Element } from "solid-js";

export interface AriaCardViewProps<T>
  extends CardViewProps<T>, DOMProps, AriaLabelingProps {}

interface CardViewProps<T>
  extends
    CollectionBase<T>,
    MultipleSelection,
    Omit<AsyncLoadable, "isLoading"> {
  // Follow-up: Does LayoutConstructor and Layout give enough info for a user to know what to put in their own custom layout?
  // Replaced with CardViewLayout so that they know they need to have keyboardDelegate stuff as well as collection, disabledKeys, etc
  layout: CardViewLayoutConstructor<T> | CardViewLayout<T>;
  // Follow-up: readd size when we get updated designs from spectrum
  // cardSize?: 'S' | 'M' | 'L',
  cardOrientation?: Orientation;
  isQuiet?: boolean;
  renderEmptyState?: () => JSX.Element;
  loadingState?: LoadingState;
}

type CardViewLayoutConstructor<T> = new (
  options?: LayoutOptions
) => CardViewLayout<T>;

interface LayoutOptions {
  // cardSize?: 'S' | 'M' | 'L',
  cardOrientation?: Orientation;
  collator?: Intl.Collator;
  // Follow-up: is this valid or is scale a spectrum specific thing that should be left out of the layouts?
  // Added here so we can keep the default item padding options within the layouts instead of having to
  // do extra work in CardView to accommodate different sizing for scales
  scale?: Scale;
}

type Scale = "medium" | "large";

interface CardViewLayout<T> extends Layout<Node<T>>, KeyboardDelegate {
  collection: Collection<Node<T>>;
  disabledKeys: any;
  isLoading: boolean;
  direction: Direction;
  layoutType: string;
  margin?: number;
}

export declare abstract class Layout<
  T extends object = Node<any>,
  O = any,
> implements LayoutDelegate {
  /** The Virtualizer the layout is currently attached to. */
  virtualizer: Virtualizer<T, any> | null;
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
  shouldInvalidate(newRect: Rect, oldRect: Rect): boolean;
  /**
   * Returns whether the layout should invalidate when the layout options change.
   * By default it invalidates when the object identity changes. Override this
   * method to optimize layout updates based on specific option changes.
   */
  shouldInvalidateLayoutOptions(newOptions: O, oldOptions: O): boolean;
  /**
   * This method allows the layout to perform any pre-computation
   * it needs to in order to prepare LayoutInfos for retrieval.
   * Called by the virtualizer before `getVisibleLayoutInfos`
   * or `getLayoutInfo` are called.
   */
  update(invalidationContext: InvalidationContext<O>): void;
  /**
   * Updates the size of the given item.
   */
  updateItemSize?(key: Key, size: Size): boolean;
  /**
   * Returns a `LayoutInfo` for the given drop target.
   */
  getDropTargetLayoutInfo?(target: ItemDropTarget): LayoutInfo;
  /** @private */
  getItemRect(key: Key): Rect | null;
  /** @private */
  getVisibleRect(): Rect;
}

declare class Virtualizer<T extends object, V> {
  /**
   * The virtualizer delegate. The delegate is used by the virtualizer
   * to create and configure views.
   */
  delegate: VirtualizerDelegate<T, V>;
  /** The current content of the virtualizer. */
  readonly collection: Collection<T>;
  /** The layout object that determines the visible views. */
  readonly layout: Layout<T>;
  /** The size of the scrollable content. */
  readonly contentSize: Size;
  /** The currently visible rectangle. */
  readonly visibleRect: Rect;
  /** The size of the virtualizer scroll view. */
  readonly size: Size;
  /** The set of persisted keys that are always present in the DOM, even if not currently in view. */
  readonly persistedKeys: Set<Key>;
  private readonly _visibleViews;
  private readonly _renderedContent;
  private readonly _rootView;
  private readonly _isScrolling;
  private readonly _invalidationContext;
  private readonly _overscanManager;
  private readonly _scrollAnchor;
  constructor(options: VirtualizerOptions<T, V>);
  /** Returns whether the given key, or an ancestor, is persisted. */
  isPersistedKey(key: Key): boolean;
  private readonly getParentView;
  private readonly getReusableView;
  private readonly _renderView;
  private readonly _renderContent;
  /**
   * Returns the key for the item view currently at the given point.
   */
  keyAtPoint(point: Point): Key | null;
  private readonly relayout;
  getVisibleLayoutInfos(): Map<Key, LayoutInfo>;
  private readonly updateSubviews;
  /** Performs layout and updates visible views as needed. */
  render(opts: VirtualizerRenderOptions<T>): ReusableView<T, V>[];
  getVisibleView(key: Key): ReusableView<T, V> | undefined;
  invalidate(context: InvalidationContext): void;
  updateItemSize(key: Key, size: Size): void;
}

interface VirtualizerDelegate<T extends object, V> {
  setVisibleRect(rect: Rect): void;
  renderView(type: string, content: T | null): V;
  invalidate(ctx: InvalidationContext): void;
}

declare class Rect {
  /** The x-coordinate of the rectangle. */
  x: number;
  /** The y-coordinate of the rectangle. */
  y: number;
  /** The width of the rectangle. */
  width: number;
  /** The height of the rectangle. */
  height: number;
  constructor(x?: number, y?: number, width?: number, height?: number);
  /**
   * The maximum x-coordinate in the rectangle.
   */
  get maxX(): number;
  /**
   * The maximum y-coordinate in the rectangle.
   */
  get maxY(): number;
  /**
   * The area of the rectangle.
   */
  get area(): number;
  /**
   * The top left corner of the rectangle.
   */
  get topLeft(): Point;
  /**
   * The top right corner of the rectangle.
   */
  get topRight(): Point;
  /**
   * The bottom left corner of the rectangle.
   */
  get bottomLeft(): Point;
  /**
   * The bottom right corner of the rectangle.
   */
  get bottomRight(): Point;
  /**
   * Returns whether this rectangle intersects another rectangle.
   *
   * @param rect - The rectangle to check.
   */
  intersects(rect: Rect): boolean;
  /**
   * Returns whether this rectangle fully contains another rectangle.
   *
   * @param rect - The rectangle to check.
   */
  containsRect(rect: Rect): boolean;
  /**
   * Returns whether the rectangle contains the given point.
   *
   * @param point - The point to check.
   */
  containsPoint(point: Point): boolean;
  /**
   * Returns the first corner of this rectangle (from top to bottom, left to right)
   * that is contained in the given rectangle, or null of the rectangles do not intersect.
   *
   * @param rect - The rectangle to check.
   */
  getCornerInRect(rect: Rect): RectCorner | null;
  equals(rect: Rect): boolean;
  pointEquals(point: Point | Rect): boolean;
  sizeEquals(size: Size | Rect): boolean;
  /**
   * Returns the union of this Rect and another.
   */
  union(other: Rect): Rect;
  /**
   * Returns the intersection of this Rect with another.
   * If the rectangles do not intersect, an all zero Rect is returned.
   */
  intersection(other: Rect): Rect;
  /**
   * Returns a copy of this rectangle.
   */
  copy(): Rect;
}

declare class Point {
  /** The x-coordinate of the point. */
  x: number;
  /** The y-coordinate of the point. */
  y: number;
  constructor(x?: number, y?: number);
  /**
   * Returns a copy of this point.
   */
  copy(): Point;
  /**
   * Checks if two points are equal.
   */
  equals(point: Point): boolean;
  /**
   * Returns true if this point is the origin.
   */
  isOrigin(): boolean;
}

type RectCorner = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

declare class Size {
  width: number;
  height: number;
  constructor(width?: number, height?: number);
  /**
   * Returns a copy of this size.
   */
  copy(): Size;
  /**
   * Returns whether this size is equal to another one.
   */
  equals(other: Size): boolean;
  /**
   * The total area of the Size.
   */
  get area(): number;
}

interface InvalidationContext<O = any> {
  contentChanged?: boolean;
  offsetChanged?: boolean;
  sizeChanged?: boolean;
  widthChanged?: boolean;
  heightChanged?: boolean;
  itemSizeChanged?: boolean;
  layoutOptionsChanged?: boolean;
  layoutOptions?: O;
}

declare class ChildView<T extends object, V> extends ReusableView<T, V> {
  parent: ReusableView<T, V>;
  constructor(
    virtualizer: Virtualizer<T, V>,
    parent: ReusableView<T, V>,
    viewType: string
  );
}

declare class ReusableView<T extends object, V> {
  /** The Virtualizer this view is a part of. */
  virtualizer: Virtualizer<T, V>;
  /** The LayoutInfo this view is currently representing. */
  layoutInfo: LayoutInfo | null;
  /** The content currently being displayed by this view, set by the virtualizer. */
  content: T | null;
  rendered: V | null;
  viewType: string;
  key: Key;
  children: Set<ChildView<T, V>>;
  reusableViews: Map<string, ChildView<T, V>[]>;
  constructor(virtualizer: Virtualizer<T, V>, viewType: string);
  /**
   * Prepares the view for reuse. Called just before the view is removed from the DOM.
   */
  prepareForReuse(): void;
  getReusableView(reuseType: string): ChildView<T, V>;
  reuseChild(child: ChildView<T, V>): void;
}

declare class LayoutInfo {
  /**
   * The type of element represented by this LayoutInfo. Should match the `type` of the
   * corresponding collection node.
   */
  type: string;
  /**
   * A unique key for this LayoutInfo. Should match the `key` of the corresponding collection node.
   */
  key: Key;
  /**
   * The key for a parent LayoutInfo, if any.
   */
  parentKey: Key | null;
  /**
   * Content for this item if it was generated by the layout rather than coming from the Collection.
   */
  content: Element;
  /**
   * The rectangle describing the size and position of this element.
   */
  rect: Rect;
  /**
   * Whether the size is estimated. `false` by default.
   * Items with estimated sizes will be measured the first time they are added to the DOM.
   * The estimated size is used to calculate the size and position of the scrollbar.
   *
   * @default false
   */
  estimatedSize: boolean;
  /**
   * Whether the layout info sticks to the viewport when scrolling.
   *
   * @default false
   */
  isSticky: boolean;
  /**
   * The element's opacity.
   *
   * @default 1
   */
  opacity: number;
  /**
   * A CSS transform string to apply to the element. `null` by default.
   */
  transform: string | null;
  /**
   * The z-index of the element. 0 by default.
   */
  zIndex: number;
  /**
   * Whether the element allows its contents to overflow its container.
   *
   * @default false
   */
  allowOverflow: boolean;
  /**
   * @param type The type of element represented by this LayoutInfo. Should match the `type` of the
   *   corresponding collection node.
   * @param key A unique key for this LayoutInfo. Should match the `key` of the corresponding
   *   collection node.
   * @param rect The rectangle describing the size and position of this element.
   */
  constructor(type: string, key: Key, rect: Rect);
  /**
   * Returns a copy of the LayoutInfo.
   */
  copy(): LayoutInfo;
}

declare class RootView<T extends object, V> extends ReusableView<T, V> {
  constructor(virtualizer: Virtualizer<T, V>);
}

declare class OverscanManager {
  private readonly startTime;
  private readonly velocity;
  private readonly visibleRect;
  setVisibleRect(rect: Rect): void;
  getOverscannedRect(): Rect;
}

declare class ScrollAnchorTracker {
  private readonly hasSnappedToEdge;
  private readonly hadEstimatedVisibleItems;
  private readonly wasNearAnchorEdge;
  /** Resets all tracked state, e.g. when the virtualizer's layout instance changes. */
  reset(): void;
  /**
   * Captures the anchor from pre-layout view positions.
   */
  captureBeforeLayout(
    anchorInfo: ScrollAnchorInfo | null,
    preLayoutInfos: Iterable<[Key, LayoutInfo]>,
    visibleRect: Rect
  ): ScrollAnchor | null;
  /**
   * Runs the full post-layout decision: updates the tracked state for the next pass, and
   * returns the resolved scroll target, or null if nothing should change.
   */
  resolveAfterLayout(options: ResolveAfterLayoutOptions): Rect | null;
}

interface ScrollAnchorInfo {
  /** Which edge of the content the viewport should stay anchored to. */
  edge: "start" | "end";
  /** Which axis `edge` refers to — 'y' for vertical lists, 'x' for horizontal. */
  axis: "x" | "y";
  /** Distance (px) from `edge` within which the viewport is considered "following" it. */
  threshold: number;
  /**
   * Optional classifier excluding structural/ephemeral layout infos (e.g. loaders) from being
   * selected as the anchor. Defaults to allowing any layoutInfo.
   */
  isAnchorable?: (layoutInfo: LayoutInfo) => boolean;
}

interface ScrollAnchor {
  key: Key;
  corner: RectCorner;
  offset: number;
}

interface ResolveAfterLayoutOptions {
  anchorInfo: ScrollAnchorInfo | null;
  /** The anchor captured by `captureBeforeLayout` before this pass's `layout.update()` ran. */
  anchor: ScrollAnchor | null;
  /** The full post-layout visible layout infos, i.e. `virtualizer.getVisibleLayoutInfos()`. */
  postLayoutInfos: Map<Key, LayoutInfo>;
  previousVisibleRect: Rect;
  previousContentSize: Size;
  contentSize: Size;
  itemSizeChanged: boolean;
  isScrolling: boolean;
  getLayoutInfo: (key: Key) => LayoutInfo | null;
}

interface VirtualizerOptions<T extends object, V> {
  delegate: VirtualizerDelegate<T, V>;
  collection: Collection<T>;
  layout: Layout<T>;
}

interface VirtualizerRenderOptions<T extends object, O = any> {
  layout: Layout<T>;
  collection: Collection<T>;
  persistedKeys?: Set<Key> | null;
  visibleRect: Rect;
  size: Size;
  invalidationContext: InvalidationContext;
  isScrolling: boolean;
  layoutOptions?: O;
}

export interface SpectrumCardProps extends AriaCardProps, StyleProps, DOMProps {
  children: JSX.Element;
  isQuiet?: boolean;
  layout?: "grid" | "waterfall" | "gallery";
  // Follow-up: readd size when we get updated designs from spectrum
  // size?: 'S' | 'M' | 'L',
  orientation?: Orientation;
}

interface AriaCardProps extends AriaLabelingProps {}

export interface SpectrumCardViewProps<T>
  extends AriaCardViewProps<T>, StyleProps {}
