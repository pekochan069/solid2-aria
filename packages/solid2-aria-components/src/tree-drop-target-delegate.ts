/*
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/TreeDropTargetDelegate.ts.
 * Modified for Solid Aria: adapted collection types and module imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { isPresent } from "@solid2-aria/core/utils/is-present";
import { requireValue } from "@solid2-aria/core/utils/require-value";
import type {
  Direction,
  DropTarget,
  DropTargetDelegate,
  ItemDropTarget,
  Key,
  Node,
  RootDropTarget,
} from "@solid2-aria/types-shared";

interface TreeCollection<T> extends Iterable<Node<T>> {
  getItem: (key: Key) => Node<T> | null;
  getChildren?: (key: Key) => Iterable<Node<T>>;
  getKeyAfter: (key: Key) => Key | null;
  getKeyBefore: (key: Key) => Key | null;
}

interface TreeState<T> {
  collection: TreeCollection<T>;
  expandedKeys: Set<Key>;
}

interface PointerTracking {
  lastY: number;
  lastX: number;
  yDirection: "up" | "down" | null;
  xDirection: "left" | "right" | null;
  boundaryContext: {
    parentKey: Key;
    lastSwitchY: number;
    lastSwitchX: number;
    preferredTargetIndex?: number;
  } | null;
}

const X_SWITCH_THRESHOLD = 10;
const Y_SWITCH_THRESHOLD = 5;

export class TreeDropTargetDelegate<T> {
  private delegate: DropTargetDelegate | null = null;
  private state: TreeState<T> | null = null;
  private direction: Direction = "ltr";
  private readonly pointerTracking: PointerTracking = {
    boundaryContext: null,
    lastX: 0,
    lastY: 0,
    xDirection: null,
    yDirection: null,
  };

  setup(
    delegate: DropTargetDelegate,
    state: TreeState<T>,
    direction: Direction
  ): void {
    this.delegate = delegate;
    this.state = state;
    this.direction = direction;
  }

  getDropTargetFromPoint(
    x: number,
    y: number,
    isValidDropTarget: (target: DropTarget) => boolean
  ): DropTarget | null {
    const baseTarget = requireValue(
      this.delegate,
      "Expected this.delegate"
    ).getDropTargetFromPoint(x, y, isValidDropTarget);

    if (!baseTarget || baseTarget.type === "root") {
      return baseTarget;
    }

    return this.resolveDropTarget(baseTarget, x, y, isValidDropTarget);
  }

  private resolveDropTarget(
    originalTarget: ItemDropTarget,
    x: number,
    y: number,
    isValidDropTarget: (target: DropTarget) => boolean
  ): RootDropTarget | ItemDropTarget | null {
    let target = originalTarget;
    const tracking = this.pointerTracking;

    // Calculate movement directions
    const deltaY = y - tracking.lastY;
    const deltaX = x - tracking.lastX;
    let currentYMovement: "up" | "down" | null = tracking.yDirection;
    let currentXMovement: "left" | "right" | null = tracking.xDirection;

    if (Math.abs(deltaY) > Y_SWITCH_THRESHOLD) {
      currentYMovement = deltaY > 0 ? "down" : "up";
      tracking.yDirection = currentYMovement;
      tracking.lastY = y;
    }

    if (Math.abs(deltaX) > X_SWITCH_THRESHOLD) {
      currentXMovement = deltaX > 0 ? "right" : "left";
      tracking.xDirection = currentXMovement;
      tracking.lastX = x;
    }

    // Normalize to 'after'
    if (target.dropPosition === "before") {
      let keyBefore = requireValue(
        this.state,
        "Expected this.state"
      ).collection.getKeyBefore(target.key);

      while (isPresent(keyBefore)) {
        const node = requireValue(
          this.state,
          "Expected this.state"
        ).collection.getItem(keyBefore);

        if (node?.type === "item") {
          break;
        }

        keyBefore = node?.parentKey ?? null;
      }

      if (isPresent(keyBefore)) {
        const convertedTarget = {
          dropPosition: "after",
          key: keyBefore,
          type: "item",
        } as const;

        if (isValidDropTarget(convertedTarget)) {
          target = convertedTarget;
        }
      }
    }

    const potentialTargets = this.getPotentialTargets(
      target,
      isValidDropTarget
    );

    if (potentialTargets.length === 0) {
      return { type: "root" };
    }

    let resolvedItemTarget: ItemDropTarget;

    if (potentialTargets.length > 1) {
      resolvedItemTarget = this.selectTarget(
        potentialTargets,
        target,
        x,
        y,
        currentYMovement,
        currentXMovement
      );
    } else {
      resolvedItemTarget = requireValue(
        potentialTargets[0],
        "Expected potentialTargets[0]"
      );
      // Reset boundary context since we're not in a boundary case
      tracking.boundaryContext = null;
    }

    return resolvedItemTarget;
  }

  // Returns potential targets for an ambiguous drop position (e.g. after the last child of a parent, or after the parent itself)
  // Ordered by level, from innermost to outermost.
  private getPotentialTargets(
    originalTarget: ItemDropTarget,
    isValidDropTarget: (target: DropTarget) => boolean
  ): ItemDropTarget[] {
    if (originalTarget.dropPosition === "on") {
      return [originalTarget];
    }

    const target = originalTarget;
    const { collection } = requireValue(this.state, "Expected this.state");

    let currentItem = collection.getItem(target.key);

    while (
      currentItem &&
      currentItem?.type !== "item" &&
      isPresent(currentItem.nextKey)
    ) {
      target.key = currentItem.nextKey;
      currentItem = collection.getItem(currentItem.nextKey);
    }

    const potentialTargets = [target];

    // If target has children and is expanded, use "before first child"
    if (
      currentItem &&
      currentItem.hasChildNodes &&
      requireValue(this.state, "Expected this.state").expandedKeys.has(
        currentItem.key
      ) &&
      collection.getChildren &&
      target.dropPosition === "after"
    ) {
      const firstChildItemNode = this.firstChildItem(currentItem);

      if (firstChildItemNode?.type === "item") {
        const beforeFirstChildTarget = {
          dropPosition: "before",
          key: firstChildItemNode.key,
          type: "item",
        } as const;

        if (isValidDropTarget(beforeFirstChildTarget)) {
          return [beforeFirstChildTarget];
        }

        return [];
      }
    }

    if (isPresent(currentItem?.nextKey)) {
      return [originalTarget];
    }

    potentialTargets.push(
      ...this.ancestorTargets(currentItem, isValidDropTarget)
    );

    if (potentialTargets.length === 1) {
      const beforeTarget = this.beforeDeeperSibling(target, currentItem);

      if (beforeTarget && isValidDropTarget(beforeTarget)) {
        return [beforeTarget];
      }
    }

    return potentialTargets.filter(isValidDropTarget);
  }

  private ancestorTargets(
    currentItem: Node<T> | null,
    isValidDropTarget: (target: DropTarget) => boolean
  ): ItemDropTarget[] {
    const { collection } = requireValue(
      this.state,
      "Expected initialized tree state"
    );

    let parentKey = currentItem?.parentKey;
    const targets: ItemDropTarget[] = [];

    while (isPresent(parentKey)) {
      const parent = collection.getItem(parentKey);

      const next = isPresent(parent?.nextKey)
        ? collection.getItem(parent.nextKey)
        : null;

      const lastAtLevel = !next || next.parentKey !== parentKey;

      if (lastAtLevel) {
        if (parent?.type === "item") {
          const target: ItemDropTarget = {
            dropPosition: "after",
            key: parentKey,
            type: "item",
          };

          if (isValidDropTarget(target)) {
            targets.push(target);
          }
        }

        if (next) {
          break;
        }
      }

      parentKey = parent?.parentKey;
    }

    return targets;
  }

  private beforeDeeperSibling(
    target: ItemDropTarget,
    currentItem: Node<T> | null
  ): ItemDropTarget | null {
    const { collection } = requireValue(
      this.state,
      "Expected initialized tree state"
    );

    const nextKey = collection.getKeyAfter(target.key);
    const next = isPresent(nextKey) ? collection.getItem(nextKey) : null;

    if (
      next &&
      currentItem &&
      isPresent(next.level) &&
      isPresent(currentItem.level) &&
      next.level > currentItem.level
    ) {
      return { dropPosition: "before", key: next.key, type: "item" };
    }

    return null;
  }

  private firstChildItem(parent: Node<T>): Node<T> | null {
    const { collection } = requireValue(
      this.state,
      "Expected initialized tree state"
    );

    let child = isPresent(parent.firstChildKey)
      ? collection.getItem(parent.firstChildKey)
      : null;

    while (child && child.type !== "item") {
      child = isPresent(child.nextKey)
        ? collection.getItem(child.nextKey)
        : null;
    }

    return child;
  }

  private switchVerticalTarget(
    boundary: NonNullable<PointerTracking["boundaryContext"]>,
    count: number,
    movement: "up" | "down"
  ): void {
    const index = boundary.preferredTargetIndex ?? 0;

    if (movement === "down" && index === 0) {
      boundary.preferredTargetIndex = count - 1;
    } else if (movement === "up" && index === count - 1) {
      boundary.preferredTargetIndex = 0;
    }

    this.pointerTracking.xDirection = null;
  }

  private selectTarget(
    potentialTargets: ItemDropTarget[],
    originalTarget: ItemDropTarget,
    x: number,
    y: number,
    currentYMovement: "up" | "down" | null,
    currentXMovement: "left" | "right" | null
  ): ItemDropTarget {
    if (potentialTargets.length < 2) {
      return requireValue(potentialTargets[0], "Expected potentialTargets[0]");
    }

    const tracking = this.pointerTracking;

    const currentItem = requireValue(
      this.state,
      "Expected this.state"
    ).collection.getItem(originalTarget.key);

    const parentKey = currentItem?.parentKey;

    if (!isPresent(parentKey)) {
      return requireValue(potentialTargets[0], "Expected potentialTargets[0]");
    }

    // More than 1 potential target - use Y for initial target, then X for switching levels
    // Initialize boundary context if needed
    if (
      !tracking.boundaryContext ||
      tracking.boundaryContext.parentKey !== parentKey
    ) {
      // If entering from below, start with outer-most
      const initialTargetIndex =
        tracking.yDirection === "up" ? potentialTargets.length - 1 : 0;

      tracking.boundaryContext = {
        lastSwitchX: x,
        lastSwitchY: y,
        parentKey,
        preferredTargetIndex: initialTargetIndex,
      };
    }

    const { boundaryContext } = tracking;
    const distanceFromLastXSwitch = Math.abs(x - boundaryContext.lastSwitchX);
    const distanceFromLastYSwitch = Math.abs(y - boundaryContext.lastSwitchY);

    // Switch between targets based on Y movement
    if (distanceFromLastYSwitch > Y_SWITCH_THRESHOLD && currentYMovement) {
      this.switchVerticalTarget(
        boundaryContext,
        potentialTargets.length,
        currentYMovement
      );
    }

    // X movement controls level selection
    if (distanceFromLastXSwitch > X_SWITCH_THRESHOLD && currentXMovement) {
      const currentTargetIndex = boundaryContext.preferredTargetIndex ?? 0;

      const outward =
        (currentXMovement === "left") === (this.direction === "ltr");

      const nextIndex = currentTargetIndex + (outward ? 1 : -1);

      if (nextIndex >= 0 && nextIndex < potentialTargets.length) {
        boundaryContext.preferredTargetIndex = nextIndex;
        boundaryContext.lastSwitchX = x;
      }

      // Reset y tracking so that moving diagonally doesn't cause flickering.
      tracking.yDirection = null;
    }

    const targetIndex = Math.max(
      0,
      Math.min(
        boundaryContext.preferredTargetIndex ?? 0,
        potentialTargets.length - 1
      )
    );

    return requireValue(
      potentialTargets[targetIndex],
      "Expected potentialTargets[targetIndex]"
    );
  }
}
