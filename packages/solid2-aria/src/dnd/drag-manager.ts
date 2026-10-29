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
 * Derived from Adobe React Spectrum: packages/react-aria/src/dnd/DragManager.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { LocalizedStringFormatter } from "@internationalized/string";
import type {
  DragEndEvent,
  DragItem,
  DropActivateEvent,
  DropEnterEvent,
  DropEvent,
  DropExitEvent,
  DropItem,
  DropOperation,
  DropTarget as DroppableCollectionTarget,
  FocusableElement,
} from "@solid2-aria/types-shared";
import { createSignal, onSettled } from "solid-js";
import type { Accessor } from "solid-js";

import { announce } from "../live-announcer/live-announcer";
import { ariaHideOutside } from "../overlays/aria-hide-outside";
import { requireHTMLElement } from "../utils/dom-value";
import { isPresent } from "../utils/is-present";
import {
  isVirtualClick,
  isVirtualPointerEvent,
} from "../utils/is-virtual-event";
import {
  getActiveElement,
  getEventTarget,
  nodeContains,
} from "../utils/shadowdom/dom-functions";
import { getTruthyValue, isTruthy } from "../utils/truthy";
import { getDragModality, getTypes } from "./utils";

const dropTargets = new Map<Element, DropTarget>();
const dropItems = new Map<Element, DroppableItem>();
let dragSession: DragSession | null = null;
const subscriptions = new Set<() => void>();

interface DropTarget {
  element: FocusableElement;
  preventFocusOnDrop?: boolean;
  getDropOperation?: (
    types: Set<string>,
    allowedOperations: DropOperation[]
  ) => DropOperation;
  onDropEnter?: (e: DropEnterEvent, dragTarget: DragTarget) => void;
  onDropExit?: (e: DropExitEvent) => void;
  onDropTargetEnter?: (target: DroppableCollectionTarget | null) => void;
  onDropActivate?: (
    e: DropActivateEvent,
    target: DroppableCollectionTarget | null
  ) => void;
  onDrop?: (e: DropEvent, target: DroppableCollectionTarget | null) => void;
  onKeyDown?: (e: KeyboardEvent, dragTarget: DragTarget) => void;
  activateButtonRef?: Accessor<FocusableElement | null>;
}

export function registerDropTarget(target: DropTarget) {
  dropTargets.set(target.element, target);
  dragSession?.updateValidDropTargets();

  return (): void => {
    dropTargets.delete(target.element);
    dragSession?.updateValidDropTargets();
  };
}

interface DroppableItem {
  element: FocusableElement;
  target: DroppableCollectionTarget;
  getDropOperation?: (
    types: Set<string>,
    allowedOperations: DropOperation[]
  ) => DropOperation;
  activateButtonRef?: Accessor<FocusableElement | null>;
}

export function registerDropItem(item: DroppableItem) {
  dropItems.set(item.element, item);

  return (): void => {
    dropItems.delete(item.element);
  };
}

interface DragTarget {
  element: FocusableElement;
  items: DragItem[];
  allowedDropOperations: DropOperation[];
  onDragEnd?: (e: DragEndEvent) => void;
}

export function beginDragging(
  target: DragTarget,
  stringFormatter: Pick<LocalizedStringFormatter, "format">
): void {
  if (dragSession) {
    throw new Error("Cannot begin dragging while already dragging");
  }

  dragSession = new DragSession(target, stringFormatter);
  requestAnimationFrame(() => {
    if (dragSession) {
      dragSession.setup();

      if (getDragModality() === "keyboard") {
        dragSession.next();
      }
    }
  });

  for (const handle1 of subscriptions) {
    handle1();
  }
}

export function createDragSession(): () => DragSession | null {
  const [session, setSession] = createSignal(dragSession, { ownedWrite: true });

  const handle2 = () => {
    setSession(dragSession);
  };

  onSettled(() => {
    subscriptions.add(handle2);

    return () => {
      subscriptions.delete(handle2);
    };
  });

  return session;
}

/** @private */
export function isVirtualDragging(): boolean {
  return !!dragSession;
}

function endDragging() {
  dragSession = null;

  for (const handle3 of subscriptions) {
    handle3();
  }
}

export function isValidDropTarget(element: Element): boolean {
  for (const target of dropTargets.keys()) {
    if (nodeContains(target, element)) {
      return true;
    }
  }

  return false;
}

const CANCELED_EVENTS = [
  "pointerdown",
  "pointermove",
  "pointerenter",
  "pointerleave",
  "pointerover",
  "pointerout",
  "pointerup",
  "mousedown",
  "mousemove",
  "mouseenter",
  "mouseleave",
  "mouseover",
  "mouseout",
  "mouseup",
  "touchstart",
  "touchmove",
  "touchend",
  "focusin",
  "focusout",
];

const CLICK_EVENTS = new Set(["pointerup", "mouseup", "touchend"]);

const MESSAGES = {
  keyboard: "dragStartedKeyboard",
  touch: "dragStartedTouch",
  virtual: "dragStartedVirtual",
} as const;

class DragSession {
  dragTarget: DragTarget;
  validDropTargets: DropTarget[] = [];
  currentDropTarget: DropTarget | null = null;
  currentDropItem: DroppableItem | null = null;
  dropOperation: DropOperation | null = null;
  private mutationObserver: MutationObserver | null = null;
  private restoreAriaHidden: (() => void) | null = null;
  private readonly stringFormatter: Pick<LocalizedStringFormatter, "format">;
  private isVirtualClick = false;
  private initialFocused: boolean;
  constructor(
    target: DragTarget,
    stringFormatter: Pick<LocalizedStringFormatter, "format">
  ) {
    this.dragTarget = target;
    this.stringFormatter = stringFormatter;

    this.initialFocused = false;
  }
  setup(): void {
    document.addEventListener("keydown", this.onKeyDown, true);
    document.addEventListener("keyup", this.onKeyUp, true);
    window.addEventListener("focus", this.onFocus, true);
    window.addEventListener("blur", this.onBlur, true);
    document.addEventListener("click", this.onClick, true);
    document.addEventListener("pointerdown", this.onPointerDown, true);

    for (const event of CANCELED_EVENTS) {
      document.addEventListener(event, this.cancelEvent, true);
    }

    this.mutationObserver = new MutationObserver(() => {
      this.updateValidDropTargets();
    });
    this.updateValidDropTargets();
    announce(this.stringFormatter.format(MESSAGES[getDragModality()]));
  }
  teardown(): void {
    document.removeEventListener("keydown", this.onKeyDown, true);
    document.removeEventListener("keyup", this.onKeyUp, true);
    window.removeEventListener("focus", this.onFocus, true);
    window.removeEventListener("blur", this.onBlur, true);
    document.removeEventListener("click", this.onClick, true);
    document.removeEventListener("pointerdown", this.onPointerDown, true);

    for (const event of CANCELED_EVENTS) {
      document.removeEventListener(event, this.cancelEvent, true);
    }

    this.mutationObserver?.disconnect();
    this.restoreAriaHidden?.();
  }
  onKeyDown = (e: KeyboardEvent): void => {
    this.cancelEvent(e);

    if (e.key === "Escape") {
      this.cancel();

      return;
    }

    if (e.key === "Tab" && !e.metaKey && !e.altKey && !e.ctrlKey) {
      if (e.shiftKey) {
        this.previous();
      } else {
        this.next();
      }
    }

    if (typeof this.currentDropTarget?.onKeyDown === "function") {
      this.currentDropTarget.onKeyDown(e, this.dragTarget);
    }
  };
  onKeyUp = (e: KeyboardEvent): void => {
    this.cancelEvent(e);

    if (e.key === "Enter") {
      if (
        e.altKey ||
        nodeContains(this.getCurrentActivateButton(), getEventTarget(e))
      ) {
        this.activate(this.currentDropTarget, this.currentDropItem);
      } else {
        this.drop();
      }
    }
  };
  getCurrentActivateButton(): FocusableElement | null {
    return (
      this.currentDropItem?.activateButtonRef?.() ??
      this.currentDropTarget?.activateButtonRef?.() ??
      null
    );
  }
  onFocus = (e: FocusEvent): void => {
    const activateButton = this.getCurrentActivateButton();
    const eventTarget = getEventTarget(e);

    if (eventTarget === activateButton) {
      // Follow-up: canceling this breaks the focus ring. Revisit when we support tabbing.
      this.cancelEvent(e);

      return;
    }

    // Prevent focus events, except to the original drag target.
    if (eventTarget !== this.dragTarget.element) {
      this.cancelEvent(e);
    }

    // Ignore focus events on the window/document (JSDOM). Will be handled in onBlur, below.
    if (
      !(eventTarget instanceof HTMLElement) ||
      eventTarget === this.dragTarget.element
    ) {
      return;
    }

    const dropTarget =
      getTruthyValue(
        this.validDropTargets.find((target) => target.element === eventTarget)
      ) ??
      this.validDropTargets.find((target) =>
        nodeContains(target.element, eventTarget)
      );

    if (!dropTarget) {
      // if (e.target === activateButton) {
      //   activateButton.focus();
      // }
      if (this.currentDropTarget) {
        this.currentDropTarget.element.focus();
      } else {
        this.dragTarget.element.focus();
      }

      return;
    }

    const item = dropItems.get(eventTarget);

    if (isTruthy(dropTarget)) {
      this.setCurrentDropTarget(dropTarget, item);
    }
  };
  onBlur = (e: FocusEvent): void => {
    const activateButton = this.getCurrentActivateButton();

    // Guard activateButton non-null so this doesn't trip on the case where
    // there's no activate button and the focused element loses focus to nothing
    // (browsers and jsdom 26+ both set relatedTarget to null in that case).
    if (activateButton && e.relatedTarget === activateButton) {
      this.cancelEvent(e);

      return;
    }

    if (getEventTarget(e) !== this.dragTarget.element) {
      this.cancelEvent(e);
    }

    // If nothing is gaining focus, or e.relatedTarget is the window/document (JSDOM),
    // restore focus back to the current drop target if any, or the original drag target.
    if (!e.relatedTarget || !(e.relatedTarget instanceof HTMLElement)) {
      if (this.currentDropTarget) {
        this.currentDropTarget.element.focus();
      } else {
        this.dragTarget.element.focus();
      }
    }
  };
  onClick = (e: MouseEvent): void => {
    this.cancelEvent(e);

    if (isVirtualClick(e) || this.isVirtualClick) {
      const dropElements = dropItems.values();
      const eventTarget = requireHTMLElement(getEventTarget(e));

      const item = [...dropElements].find(
        (itemValue) =>
          itemValue.element === eventTarget ||
          nodeContains(itemValue.activateButtonRef?.(), eventTarget)
      );

      const dropTarget = this.validDropTargets.find((target) =>
        nodeContains(target.element, eventTarget)
      );

      const activateButton =
        item?.activateButtonRef?.() ?? dropTarget?.activateButtonRef?.();

      if (nodeContains(activateButton, eventTarget) && dropTarget) {
        this.activate(dropTarget, item);

        return;
      }

      if (getEventTarget(e) === this.dragTarget.element) {
        this.cancel();

        return;
      }

      if (dropTarget) {
        this.setCurrentDropTarget(dropTarget, item);
        this.drop(item);
      }
    }
  };
  onPointerDown = (e: PointerEvent): void => {
    // Android Talkback double tap has e.detail = 1 for onClick. Detect the virtual click in onPointerDown before onClick fires
    // so we can properly perform cancel and drop operations.
    this.cancelEvent(e);
    this.isVirtualClick = isVirtualPointerEvent(e);
  };
  cancelEvent = (e: Event): void => {
    // Allow focusin and focusout on the drag target so focus ring works properly.
    const eventTarget = getEventTarget(e);

    if (
      (e.type === "focusin" || e.type === "focusout") &&
      (eventTarget === this.dragTarget?.element ||
        eventTarget === this.getCurrentActivateButton())
    ) {
      return;
    }

    // Allow default for events that might cancel a click event
    if (!CLICK_EVENTS.has(e.type)) {
      e.preventDefault();
    }

    e.stopPropagation();
    e.stopImmediatePropagation();
  };
  updateValidDropTargets(): void {
    if (!this.mutationObserver) {
      return;
    }

    this.mutationObserver.disconnect();

    if (this.restoreAriaHidden) {
      this.restoreAriaHidden();
    }

    this.validDropTargets = findValidDropTargets(this.dragTarget);

    // Shuffle drop target order based on starting drag target.
    if (this.validDropTargets.length > 0) {
      const nearestIndex = this.findNearestDropTarget();
      this.validDropTargets = [
        ...this.validDropTargets.slice(nearestIndex),
        ...this.validDropTargets.slice(0, nearestIndex),
      ];
    }

    if (
      this.currentDropTarget &&
      !this.validDropTargets.includes(this.currentDropTarget)
    ) {
      this.setCurrentDropTarget(this.validDropTargets[0]);
    }

    // Find valid drop items within collections
    const types = getTypes(this.dragTarget.items);

    const validDropItems = [...dropItems.values()].filter((item) => {
      if (typeof item.getDropOperation === "function") {
        return (
          item.getDropOperation(
            types,
            this.dragTarget.allowedDropOperations
          ) !== "cancel"
        );
      }

      return true;
    });

    // Filter out drop targets that contain valid items. We don't want to stop hiding elements
    // other than the drop items that exist inside the collection.
    const visibleDropTargets = this.validDropTargets.filter(
      (target) =>
        !validDropItems.some((item) =>
          nodeContains(target.element, item.element)
        )
    );

    this.restoreAriaHidden = ariaHideOutside(
      [
        this.dragTarget.element,
        ...validDropItems.flatMap((item) => {
          const button = item.activateButtonRef?.();

          return button ? [item.element, button] : [item.element];
        }),
        ...visibleDropTargets.flatMap((target) => {
          const button = target.activateButtonRef?.();

          return button ? [target.element, button] : [target.element];
        }),
      ],
      { shouldUseInert: true }
    );
    this.mutationObserver.observe(document.body, {
      attributeFilter: ["aria-hidden", "inert"],
      attributes: true,
      subtree: true,
    });
  }
  next(): void {
    // Follow-up: Allow tabbing to the activate button. Revisit once we fix the focus ring.
    // For now, the activate button is reachable by screen readers and ArrowLeft/ArrowRight
    // is usable specifically by Tree. Will need tabbing for other components.
    // let activateButton = this.getCurrentActivateButton();
    // if (activateButton && document.activeElement !== activateButton) {
    //   activateButton.focus();
    //   return;
    // }
    if (!this.currentDropTarget) {
      this.setCurrentDropTarget(this.validDropTargets[0]);

      return;
    }

    const index = this.validDropTargets.indexOf(this.currentDropTarget);

    if (index === -1) {
      this.setCurrentDropTarget(this.validDropTargets[0]);

      return;
    }

    // If we've reached the end of the valid drop targets, cycle back to the original drag target.
    // This lets the user cancel the drag in case they don't have an Escape key (e.g. iPad keyboard case).
    if (index === this.validDropTargets.length - 1) {
      if (this.dragTarget.element.closest('[aria-hidden="true"], [inert]')) {
        this.setCurrentDropTarget(this.validDropTargets[0]);
      } else {
        this.setCurrentDropTarget(null);
        this.dragTarget.element.focus();
      }
    } else {
      this.setCurrentDropTarget(this.validDropTargets[index + 1]);
    }
  }
  previous(): void {
    // let activateButton = this.getCurrentActivateButton();
    // if (activateButton && document.activeElement === activateButton) {
    //   let target = this.currentDropItem ?? this.currentDropTarget;
    //   if (target) {
    //     target.element.focus();
    //     return;
    //   }
    // }
    if (!this.currentDropTarget) {
      this.setCurrentDropTarget(this.validDropTargets.at(-1));

      return;
    }

    const index = this.validDropTargets.indexOf(this.currentDropTarget);

    if (index === -1) {
      this.setCurrentDropTarget(this.validDropTargets.at(-1));

      return;
    }

    // If we've reached the start of the valid drop targets, cycle back to the original drag target.
    // This lets the user cancel the drag in case they don't have an Escape key (e.g. iPad keyboard case).
    if (index === 0) {
      if (this.dragTarget.element.closest('[aria-hidden="true"], [inert]')) {
        this.setCurrentDropTarget(this.validDropTargets.at(-1));
      } else {
        this.setCurrentDropTarget(null);
        this.dragTarget.element.focus();
      }
    } else {
      this.setCurrentDropTarget(this.validDropTargets[index - 1]);
    }
  }
  findNearestDropTarget(): number {
    const dragTargetRect = this.dragTarget.element.getBoundingClientRect();
    let minDistance = Infinity;
    let nearest = -1;
    let ancestor = -1;

    for (let i = 0; i < this.validDropTargets.length; i += 1) {
      const dropTarget = this.validDropTargets[i];

      if (!dropTarget) {
        continue;
      }

      if (
        ancestor < 0 &&
        nodeContains(dropTarget.element, this.dragTarget.element)
      ) {
        ancestor = i;
      }

      const rect = dropTarget.element.getBoundingClientRect();
      const dx = rect.left - dragTargetRect.left;
      const dy = rect.top - dragTargetRect.top;
      const dist = dx * dx + dy * dy;

      if (dist < minDistance) {
        minDistance = dist;
        nearest = i;
      }
    }

    return ancestor >= 0 ? ancestor : nearest;
  }
  setCurrentDropTarget(
    dropTarget: DropTarget | null | undefined,
    item?: DroppableItem
  ): void {
    let currentDropTarget2 = dropTarget;

    currentDropTarget2 ??= null;

    if (currentDropTarget2 !== this.currentDropTarget) {
      if (
        this.currentDropTarget &&
        typeof this.currentDropTarget.onDropExit === "function"
      ) {
        const rect = this.currentDropTarget.element.getBoundingClientRect();
        this.currentDropTarget.onDropExit({
          type: "dropexit",
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }

      this.currentDropTarget = currentDropTarget2;

      if (currentDropTarget2) {
        if (typeof currentDropTarget2.onDropEnter === "function") {
          const rect = currentDropTarget2.element.getBoundingClientRect();
          currentDropTarget2.onDropEnter(
            {
              type: "dropenter",
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
            },
            this.dragTarget
          );
        }

        if (!item) {
          currentDropTarget2?.element.focus();
        }
      }
    }

    if (isPresent(item) && item !== this.currentDropItem) {
      if (
        this.currentDropTarget &&
        typeof this.currentDropTarget.onDropTargetEnter === "function"
      ) {
        this.currentDropTarget.onDropTargetEnter(item.target);
      }

      item.element.focus();
      this.currentDropItem = item;

      // Announce first drop target after drag start announcement finishes.
      // Otherwise, it will never get announced because drag start announcement is assertive.
      if (!this.initialFocused) {
        const label = item?.element.getAttribute("aria-label");

        if (isTruthy(label)) {
          announce(label, "polite");
        }

        this.initialFocused = true;
      }
    }
  }
  end(): void {
    this.teardown();
    endDragging();

    if (typeof this.dragTarget.onDragEnd === "function") {
      const target =
        this.currentDropTarget && this.dropOperation !== "cancel"
          ? this.currentDropTarget
          : this.dragTarget;

      const rect = target.element.getBoundingClientRect();
      this.dragTarget.onDragEnd({
        dropOperation: getTruthyValue(this.dropOperation) ?? "cancel",
        type: "dragend",
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2,
      });
    }

    if (
      this.currentDropTarget &&
      !isTruthy(this.currentDropTarget.preventFocusOnDrop)
    ) {
      // Re-trigger focus event on active element, since it will not have received it during dragging (see cancelEvent).
      // This corrects state such as whether focus ring should appear.
      // useDroppableCollection handles this itself, so this is only for standalone drop zones.
      getActiveElement()?.dispatchEvent(
        new FocusEvent("focusin", { bubbles: true })
      );
    }

    this.setCurrentDropTarget(null);
  }
  cancel(): void {
    this.setCurrentDropTarget(null);
    this.end();

    if (!this.dragTarget.element.closest('[aria-hidden="true"], [inert]')) {
      this.dragTarget.element.focus();
    }

    // Re-trigger focus event on active element, since it will not have received it during dragging (see cancelEvent).
    getActiveElement()?.dispatchEvent(
      new FocusEvent("focusin", { bubbles: true })
    );
    announce(this.stringFormatter.format("dropCanceled"));
  }
  drop(item?: DroppableItem): void {
    if (!this.currentDropTarget) {
      this.cancel();

      return;
    }

    if (typeof item?.getDropOperation === "function") {
      const types = getTypes(this.dragTarget.items);
      this.dropOperation = item.getDropOperation(
        types,
        this.dragTarget.allowedDropOperations
      );
    } else if (typeof this.currentDropTarget.getDropOperation === "function") {
      const types = getTypes(this.dragTarget.items);
      this.dropOperation = this.currentDropTarget.getDropOperation(
        types,
        this.dragTarget.allowedDropOperations
      );
    } else {
      // Follow-up: show menu ??
      this.dropOperation = this.dragTarget.allowedDropOperations[0] ?? "cancel";
    }

    if (typeof this.currentDropTarget.onDrop === "function") {
      const items: DropItem[] = this.dragTarget.items.map((itemValue2) => ({
        getText: async (type: string) =>
          await Promise.resolve(itemValue2[type] ?? ""),
        kind: "text",
        types: new Set(Object.keys(itemValue2)),
      }));

      const rect = this.currentDropTarget.element.getBoundingClientRect();
      this.currentDropTarget.onDrop(
        {
          dropOperation: this.dropOperation ?? "cancel",
          items,
          type: "drop",
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        },
        item?.target ?? null
      );
    }

    this.end();
    announce(this.stringFormatter.format("dropComplete"));
  }
  // oxlint-disable-next-line eslint/class-methods-use-this -- Preserve the session instance API returned by createDragSession.
  activate(
    dropTarget: DropTarget | null,
    dropItem: DroppableItem | null | undefined
  ): void {
    if (dropTarget && typeof dropTarget.onDropActivate === "function") {
      const target = dropItem?.target ?? null;
      const rect = dropTarget.element.getBoundingClientRect();
      dropTarget.onDropActivate(
        {
          type: "dropactivate",
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        },
        target
      );
    }
  }
}

function findValidDropTargets(options: DragTarget) {
  const types = getTypes(options.items);

  return [...dropTargets.values()].filter((target) => {
    if (target.element.closest('[aria-hidden="true"], [inert]')) {
      return false;
    }

    if (typeof target.getDropOperation === "function") {
      return (
        target.getDropOperation(types, options.allowedDropOperations) !==
        "cancel"
      );
    }

    return true;
  });
}
