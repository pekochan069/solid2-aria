/*
 * Derived from Adobe React Spectrum: packages/react-aria/src/dnd/ListDropTargetDelegate.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  Direction,
  DropTarget,
  DropTargetDelegate,
  Node,
  Orientation,
} from "@solid2-aria/types-shared";
import type { Accessor } from "solid-js";

import { requireValue } from "../utils/require-value";
import { getTruthyValue, isTruthy } from "../utils/truthy";

interface ListDropTargetDelegateOptions {
  /**
   * Whether the items are arranged in a stack or grid.
   *
   * @default 'stack'
   */
  layout?: "stack" | "grid";
  /**
   * The primary orientation of the items. Usually this is the
   * direction that the collection scrolls.
   *
   * @default 'vertical'
   */
  orientation?: Orientation;
  /**
   * The horizontal layout direction.
   *
   * @default 'ltr'
   */
  direction?: Direction;
}

// Terms used in the below code:
//   * "Primary"   – The main layout direction. For stacks, this is the direction
//                   that the stack is arranged in (e.g. horizontal or vertical).
//                   For grids, this is the main scroll direction.
//   * "Secondary" – The secondary layout direction. For stacks, there is no secondary
//                   layout direction. For grids, this is the opposite of the primary direction.
//   * "Flow"      – The flow direction of the items. For stacks, this is the the primary
//                   direction. For grids, it is the secondary direction.
export class ListDropTargetDelegate implements DropTargetDelegate {
  private readonly collection: Iterable<Node<unknown>>;
  private readonly ref: Accessor<HTMLElement | null>;
  private readonly layout: "stack" | "grid";
  private readonly orientation: Orientation;
  protected direction: Direction;
  constructor(
    collection: Iterable<Node<unknown>>,
    ref: Accessor<HTMLElement | null>,
    options?: ListDropTargetDelegateOptions
  ) {
    this.collection = collection;
    this.ref = ref;
    this.layout = getTruthyValue(options?.layout) ?? "stack";
    this.orientation = getTruthyValue(options?.orientation) ?? "vertical";
    this.direction = getTruthyValue(options?.direction) ?? "ltr";
  }
  private getPrimaryStart(rect: DOMRect) {
    return this.orientation === "horizontal" ? rect.left : rect.top;
  }
  private getPrimaryEnd(rect: DOMRect) {
    return this.orientation === "horizontal" ? rect.right : rect.bottom;
  }
  private getSecondaryStart(rect: DOMRect) {
    return this.orientation === "horizontal" ? rect.top : rect.left;
  }
  private getSecondaryEnd(rect: DOMRect) {
    return this.orientation === "horizontal" ? rect.bottom : rect.right;
  }
  private getFlowStart(rect: DOMRect) {
    return this.layout === "stack"
      ? this.getPrimaryStart(rect)
      : this.getSecondaryStart(rect);
  }
  private getFlowEnd(rect: DOMRect) {
    return this.layout === "stack"
      ? this.getPrimaryEnd(rect)
      : this.getSecondaryEnd(rect);
  }
  private getFlowSize(rect: DOMRect) {
    return this.getFlowEnd(rect) - this.getFlowStart(rect);
  }
  private getItemDropTarget(
    key: Node<unknown>["key"],
    rectValue: DOMRect,
    flow: number,
    isFlowRTL: boolean,
    isValidDropTarget: (target: DropTarget) => boolean
  ): DropTarget {
    const target: DropTarget = {
      dropPosition: "on",
      key,
      type: "item",
    };

    if (isValidDropTarget(target)) {
      // Otherwise, if dropping on the item is accepted, try the before/after positions if within 5px
      // of the start or end of the item.
      if (
        flow <= this.getFlowStart(rectValue) + 5 &&
        isValidDropTarget({ ...target, dropPosition: "before" })
      ) {
        target.dropPosition = isFlowRTL ? "after" : "before";
      } else if (
        flow >= this.getFlowEnd(rectValue) - 5 &&
        isValidDropTarget({ ...target, dropPosition: "after" })
      ) {
        target.dropPosition = isFlowRTL ? "before" : "after";
      }
    } else {
      // If dropping on the item isn't accepted, try the target before or after depending on the position.
      const midValue =
        this.getFlowStart(rectValue) + this.getFlowSize(rectValue) / 2;

      if (
        flow <= midValue &&
        isValidDropTarget({ ...target, dropPosition: "before" })
      ) {
        target.dropPosition = isFlowRTL ? "after" : "before";
      } else if (
        flow >= midValue &&
        isValidDropTarget({ ...target, dropPosition: "after" })
      ) {
        target.dropPosition = isFlowRTL ? "before" : "after";
      }
    }

    return target;
  }
  private getBoundaryDropTarget(
    key: Node<unknown>["key"],
    rect: DOMRect | undefined,
    primary: number,
    flow: number,
    isFlowRTL: boolean
  ): DropTarget {
    if (
      rect &&
      (primary < this.getPrimaryStart(rect) ||
        Math.abs(flow - this.getFlowStart(rect)) <
          Math.abs(flow - this.getFlowEnd(rect)))
    ) {
      return {
        dropPosition: isFlowRTL ? "after" : "before",
        key,
        type: "item",
      };
    }

    return {
      dropPosition: isFlowRTL ? "before" : "after",
      key,
      type: "item",
    };
  }
  getDropTargetFromPoint(
    x: number,
    y: number,
    isValidDropTarget: (target: DropTarget) => boolean
  ): DropTarget {
    const thisrefElement = this.ref();

    if (
      isTruthy(this.collection[Symbol.iterator]().next().done) ||
      !thisrefElement
    ) {
      return { type: "root" };
    }

    let rect: DOMRect | undefined = thisrefElement.getBoundingClientRect();
    let primary = this.orientation === "horizontal" ? x : y;
    let secondary = this.orientation === "horizontal" ? y : x;
    primary += this.getPrimaryStart(rect);
    secondary += this.getSecondaryStart(rect);
    const flow = this.layout === "stack" ? primary : secondary;

    const isPrimaryRTL =
      this.orientation === "horizontal" && this.direction === "rtl";

    const isSecondaryRTL =
      this.layout === "grid" &&
      this.orientation === "vertical" &&
      this.direction === "rtl";

    const isFlowRTL = this.layout === "stack" ? isPrimaryRTL : isSecondaryRTL;
    const elementMap = getItemElements(thisrefElement);

    // Follow-up: assume that only item type items are valid drop targets. This is to prevent a crash when dragging over the loader
    // row since it doesn't have a data-key set on it. Will eventually need to handle the case with drag and drop and loaders located between rows aka tree.
    // Can see https://github.com/adobe/react-spectrum/pull/4210/files#diff-21e555e0c597a28215e36137f5be076a65a1e1456c92cd0fdd60f866929aae2a for additional logic
    // that may need to happen then
    const items = [...this.collection].filter((item) => item.type === "item");

    if (items.length < 1) {
      return { type: "root" };
    }

    let low = 0;
    let high = items.length;

    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      const item = items[mid];

      if (!item) {
        return { type: "root" };
      }

      const element = elementMap.get(String(item.key));

      if (!element) {
        break;
      }

      const rectValue = element.getBoundingClientRect();

      let isGreater: boolean;

      if (primary < this.getPrimaryStart(rectValue)) {
        isGreater = isPrimaryRTL;
      } else if (primary > this.getPrimaryEnd(rectValue)) {
        isGreater = !isPrimaryRTL;
      } else if (secondary < this.getSecondaryStart(rectValue)) {
        isGreater = isSecondaryRTL;
      } else if (secondary > this.getSecondaryEnd(rectValue)) {
        isGreater = !isSecondaryRTL;
      } else {
        return this.getItemDropTarget(
          item.key,
          rectValue,
          flow,
          isFlowRTL,
          isValidDropTarget
        );
      }

      if (isGreater) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }

    const item = requireValue(
      items[Math.min(low, items.length - 1)],
      "Expected an item in the nonempty drop target list"
    );

    const element = elementMap.get(String(item.key));
    rect = element?.getBoundingClientRect();

    return this.getBoundaryDropTarget(item.key, rect, primary, flow, isFlowRTL);
  }
}

function getItemElements(root: HTMLElement): Map<string, HTMLElement> {
  const collection = root?.dataset.collection;

  const elements = root.querySelectorAll(
    isTruthy(collection)
      ? `[data-collection="${CSS.escape(collection)}"]`
      : "[data-key]"
  );

  const elementMap = new Map<string, HTMLElement>();

  for (const item of elements) {
    if (
      item instanceof HTMLElement &&
      item.dataset.key !== null &&
      item.dataset.key !== undefined
    ) {
      elementMap.set(item.dataset.key, item);
    }
  }

  return elementMap;
}
