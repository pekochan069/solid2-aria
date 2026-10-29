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
 * Derived from Adobe React Spectrum: packages/react-aria/src/overlays/useOverlayPosition.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import {
  createMemo,
  createEffect,
  createSignal,
  onSettled,
  untrack,
} from "solid-js";
import type { Accessor } from "solid-js";

import { createLocale } from "../i18n/i18n-provider";
import { createResizeObserver } from "../utils/create-resize-observer";
import { addEvent } from "../utils/dom-helpers";
import { isPresent } from "../utils/is-present";
import {
  getActiveElement,
  isFocusWithin,
  getPropagationTargets,
} from "../utils/shadowdom/dom-functions";
import { isTruthy } from "../utils/truthy";
import { calculatePosition, getRect } from "./calculate-position";
import type { PositionResult } from "./calculate-position";
import { createCloseOnScroll } from "./create-close-on-scroll";

export type Placement =
  | "bottom"
  | "bottom left"
  | "bottom right"
  | "bottom start"
  | "bottom end"
  | "top"
  | "top left"
  | "top right"
  | "top start"
  | "top end"
  | "left"
  | "left top"
  | "left bottom"
  | "start"
  | "start top"
  | "start bottom"
  | "right"
  | "right top"
  | "right bottom"
  | "end"
  | "end top"
  | "end bottom";

export type Axis = "top" | "bottom" | "left" | "right";

export type SizeAxis = "width" | "height";

export type PlacementAxis = Axis | "center";

export interface PositionProps {
  /**
   * The placement of the element with respect to its anchor element.
   *
   * @default 'bottom'
   */
  placement?: Placement;
  /**
   * The placement padding that should be applied between the element and its
   * surrounding container.
   *
   * @default 12
   */
  containerPadding?: number;
  /**
   * The additional offset applied along the main axis between the element and its
   * anchor element.
   *
   * @default 0
   */
  offset?: number;
  /**
   * The additional offset applied along the cross axis between the element and its
   * anchor element.
   *
   * @default 0
   */
  crossOffset?: number;
  /**
   * Whether the element should flip its orientation (e.g. top to bottom or left to right) when
   * there is insufficient room for it to render completely.
   *
   * @default true
   */
  shouldFlip?: boolean;
  // /**
  //  * The element that should be used as the bounding container when calculating container offset
  //  * or whether it should flip.
  //  */
  // boundaryElement?: Element,
  /** Whether the element is rendered. */
  isOpen?: boolean;
}

export interface AriaPositionProps extends PositionProps {
  /**
   * Cross size of the overlay arrow in pixels.
   *
   * @default 0
   */
  arrowSize?: number;
  /**
   * Element that that serves as the positioning boundary.
   *
   * @default document.body
   */
  boundaryElement?: Element;
  /**
   * The ref for the element which the overlay positions itself with respect to.
   */
  targetRef: Accessor<Element | null>;
  /**
   * The ref for the overlay element.
   */
  overlayRef: Accessor<Element | null>;
  /**
   * The ref for the arrow element.
   */
  arrowRef?: Accessor<Element | null>;
  /**
   * A ref for the scrollable region within the overlay.
   *
   * @default overlayRef
   */
  scrollRef?: Accessor<Element | null>;
  /**
   * Whether the overlay should update its position automatically.
   *
   * @default true
   */
  shouldUpdatePosition?: boolean;
  /** Handler that is called when the overlay should close. */
  onClose?: (() => void) | null;
  /**
   * The maxHeight specified for the overlay element.
   * By default, it will take all space up to the current viewport height.
   */
  maxHeight?: number;
  /**
   * The minimum distance the arrow's edge should be from the edge of the overlay element.
   *
   * @default 0
   */
  arrowBoundaryOffset?: number;
  /**
   * Overrides the target element's bounding rectangle. Useful for positioning relative to
   * a specific point such as the mouse cursor (e.g. context menus) or text selection.
   *
   * @default target.getBoundingClientRect()
   * @param target - The target element.
   */
  getTargetRect?: (target: Element) => DOMRectReadOnly | null | undefined;
}

export interface PositionAria {
  /** Props for the overlay container element. */
  overlayProps: DOMAttributes;
  /** Props for the overlay tip arrow if any. */
  arrowProps: DOMAttributes;
  /** Placement of the overlay with respect to the overlay trigger. */
  placement: PlacementAxis | null;
  /** The origin of the target in the overlay's coordinate system. Useful for animations. */
  triggerAnchorPoint: {
    x: number;
    y: number;
  } | null;
  /** Updates the position of the overlay. */
  updatePosition: () => void;
}

interface ScrollAnchor {
  type: "top" | "bottom";
  offset: number;
}

const visualViewport =
  typeof document === "undefined" ? null : window.visualViewport;

/**
 * Handles positioning overlays like popovers and menus relative to a trigger
 * element, and updating the position when the window resizes.
 */
export function createOverlayPosition(props: AriaPositionProps): PositionAria {
  const _result0 = createLocale();

  const [position, setPosition] = createSignal<PositionResult | null>(null, {
    ownedWrite: true,
  });

  const deps = createMemo(() => [
    props.shouldUpdatePosition ?? true,
    props.placement ?? "bottom",

    props.overlayRef(),

    props.targetRef(),

    props.arrowRef?.(),

    (props.scrollRef ?? props.overlayRef)(),
    props.containerPadding ?? 12,
    props.shouldFlip ?? true,
    props.boundaryElement ??
      (typeof document === "undefined" ? null : document.body),
    props.offset ?? 0,
    props.crossOffset ?? 0,
    props.isOpen ?? true,
    _result0.direction,
    props.maxHeight,
    props.arrowBoundaryOffset ?? 0,
    props.arrowSize,
  ]);

  // Note, the position freezing breaks if body sizes itself dynamicly with the visual viewport but that might
  // just be a non-realistic use case
  // Upon opening a overlay, record the current visual viewport scale so we can freeze the overlay styles
  let lastScale = visualViewport?.scale;
  createEffect(
    () => props.isOpen ?? true,
    (isOpen) => {
      if (isOpen) {
        lastScale = visualViewport?.scale;
      }
    },
    { ssrSource: "client" }
  );

  const updatePosition = () => {
    const overlayNode = props.overlayRef();
    const targetNode = props.targetRef();

    const boundaryElement =
      props.boundaryElement ??
      (typeof document === "undefined" ? null : document.body);

    const scrollNode = (props.scrollRef ?? props.overlayRef)();

    if (
      !(overlayNode instanceof HTMLElement) ||
      !targetNode ||
      !boundaryElement
    ) {
      return;
    }

    if (!shouldUpdateOverlayPosition(props)) {
      return;
    }

    if (visualViewport?.scale !== lastScale) {
      return;
    }

    // Determine a scroll anchor based on the focused element.
    // This stores the offset of the anchor element from the scroll container
    // so it can be restored after repositioning. This way if the overlay height
    // changes, the focused element appears to stay in the same position.
    const anchor = getScrollAnchor(scrollNode);

    // Always reset the overlay's previous max height if not defined by the user so that we can compensate for
    // RAC collections populating after a second render and properly set a correct max height + positioning when it populates.
    const overlay = overlayNode;

    resetOverlayMaxHeight(overlay, props);

    const positionValue = calculatePosition(
      getPositionOptions(props, _result0.direction, {
        boundaryElement,
        overlayNode,
        scrollNode,
        targetNode,
      })
    );

    if (!isTruthy(positionValue.position)) {
      return;
    }

    // Modify overlay styles directly so positioning happens immediately without the need of a second render
    // This is so we don't have to delay autoFocus scrolling or delay applying preventScroll for popovers
    overlay.style.top = "";
    overlay.style.bottom = "";
    overlay.style.left = "";
    overlay.style.right = "";

    for (const side of ["top", "bottom", "left", "right"] as const) {
      const value = positionValue.position[side];

      if (isPresent(value)) {
        overlay.style[side] = `${value}px`;
      }
    }

    overlay.style.maxHeight = isPresent(positionValue.maxHeight)
      ? `${positionValue.maxHeight}px`
      : "";
    // Restore scroll position relative to anchor element.
    const activeElement = getActiveElement();

    if (anchor && activeElement && scrollNode) {
      const anchorRect = activeElement.getBoundingClientRect();
      const scrollRect = scrollNode.getBoundingClientRect();
      const newOffset = anchorRect[anchor.type] - scrollRect[anchor.type];
      scrollNode.scrollTop += newOffset - anchor.offset;
    }

    // Trigger a set state for a second render anyway for arrow positioning
    setPosition(positionValue);
  };
  // Update position when anything changes

  createEffect(
    deps,
    () => {
      untrack(updatePosition);
    },
    { ssrSource: "client" }
  );
  // Update position on window resize
  createResize(updatePosition);
  // Update position when the overlay changes size (might need to flip).
  createResizeObserver({
    get onResize() {
      return updatePosition;
    },
    get ref() {
      return props.overlayRef;
    },
  });
  // Update position when the target changes size (might need to flip).
  createResizeObserver({
    get onResize() {
      return updatePosition;
    },
    get ref() {
      return props.targetRef;
    },
  });
  // Reposition the overlay and do not close on scroll while the visual viewport is resizing.
  // This will ensure that overlays adjust their positioning when the iOS virtual keyboard appears.
  let isResizing = false;
  onSettled(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const onResize = () => {
      isResizing = true;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        isResizing = false;
      }, 500);
      updatePosition();
    };

    // Only reposition the overlay if a scroll event happens immediately as a result of resize (aka the virtual keyboard has appears)
    // We don't want to reposition the overlay if the user has pinch zoomed in and is scrolling the viewport around.
    const onScroll = () => {
      if (isResizing) {
        onResize();
      }
    };

    visualViewport?.addEventListener("resize", onResize);
    visualViewport?.addEventListener("scroll", onScroll);

    const cleanup = addEvent(getPropagationTargets(window), "scroll", onScroll);

    return () => {
      visualViewport?.removeEventListener("resize", onResize);
      visualViewport?.removeEventListener("scroll", onScroll);
      clearTimeout(timeout);
      cleanup();
    };
  });

  const close = () => {
    if (!isResizing) {
      props.onClose?.();
    }
  };

  // When scrolling a parent scrollable region of the trigger (other than the body),
  // we hide the popover. Otherwise, its position would be incorrect.
  createCloseOnScroll({
    get isOpen() {
      return props.isOpen ?? true;
    },
    get onClose() {
      return props.onClose && close;
    },
    get triggerRef() {
      return props.targetRef;
    },
  });

  return {
    get arrowProps() {
      return {
        get "aria-hidden"() {
          return "true" as const;
        },
        get role(): "presentation" {
          return "presentation" as const;
        },
        get style() {
          return {
            get left() {
              const value = position()?.arrowOffsetLeft;

              return isPresent(value) ? `${value}px` : undefined;
            },
            get top() {
              const value = position()?.arrowOffsetTop;

              return isPresent(value) ? `${value}px` : undefined;
            },
          };
        },
      };
    },
    get overlayProps() {
      return {
        get style() {
          const value = position();
          const coordinates = value?.position;

          const fallbackPosition = value ? undefined : "0px";

          return {
            bottom: isPresent(coordinates?.bottom)
              ? `${coordinates.bottom}px`
              : undefined,
            left: isPresent(coordinates?.left)
              ? `${coordinates.left}px`
              : fallbackPosition,
            "max-height": isPresent(value?.maxHeight)
              ? `${value.maxHeight}px`
              : "100vh",
            position: value ? ("absolute" as const) : ("fixed" as const),
            right: isPresent(coordinates?.right)
              ? `${coordinates.right}px`
              : undefined,
            top: isPresent(coordinates?.top)
              ? `${coordinates.top}px`
              : fallbackPosition,
            "z-index": 100_000,
          };
        },
      };
    },
    get placement() {
      return position()?.placement ?? null;
    },
    get triggerAnchorPoint() {
      return position()?.triggerAnchorPoint ?? null;
    },
    get updatePosition() {
      return updatePosition;
    },
  };
}

function createResize(onResize: () => void) {
  onSettled(() => {
    window.addEventListener("resize", onResize, false);

    return () => {
      window.removeEventListener("resize", onResize, false);
    };
  });
}

function translateRTL(
  position: Placement,
  direction: "ltr" | "rtl"
): Placement {
  const physical =
    direction === "rtl"
      ? position.replace("start", "right").replace("end", "left")
      : position.replace("start", "left").replace("end", "right");

  if (!isPhysicalPlacement(physical)) {
    throw new Error(`Unsupported overlay placement: ${position}`);
  }

  return physical;
}

function isPhysicalPlacement(value: string): value is Placement {
  return /^(?:(?:top|bottom)(?: (?:left|right))?|(?:left|right)(?: (?:top|bottom))?)$/u.test(
    value
  );
}

function shouldUpdateOverlayPosition(props: AriaPositionProps): boolean {
  return !(
    !(untrack(() => props.shouldUpdatePosition) ?? true) ||
    !(untrack(() => props.isOpen) ?? true) ||
    !untrack(() => props.overlayRef()) ||
    !untrack(() => props.targetRef()) ||
    !(
      untrack(() => props.boundaryElement) ??
      (typeof document === "undefined" ? null : document.body)
    )
  );
}

function getScrollAnchor(scrollNode: Element | null): ScrollAnchor | null {
  let anchor: ScrollAnchor | null = null;

  if (scrollNode && isFocusWithin(scrollNode)) {
    const anchorRect = getActiveElement()?.getBoundingClientRect();
    const scrollRect = scrollNode.getBoundingClientRect();
    // Anchor from the top if the offset is in the top half of the scrollable element,
    // otherwise anchor from the bottom.
    anchor = {
      offset: (anchorRect?.top ?? 0) - scrollRect.top,
      type: "top",
    };

    if (anchor.offset > scrollRect.height / 2) {
      anchor.type = "bottom";
      anchor.offset = (anchorRect?.bottom ?? 0) - scrollRect.bottom;
    }
  }

  return anchor;
}

interface PositionElements {
  overlayNode: HTMLElement;
  targetNode: Element;
  boundaryElement: Element;
  scrollNode: Element | null;
}

function getPositionOptions(
  props: AriaPositionProps,
  direction: ReturnType<typeof createLocale>["direction"],
  elements: PositionElements
): Parameters<typeof calculatePosition>[0] {
  const arrow = props.arrowRef?.();

  return {
    arrowBoundaryOffset: props.arrowBoundaryOffset ?? 0,
    arrowSize: props.arrowSize ?? (arrow ? getRect(arrow, true).width : 0),
    boundaryElement: elements.boundaryElement,
    crossOffset: props.crossOffset ?? 0,
    maxHeight: props.maxHeight,
    offset: props.offset ?? 0,
    overlayNode: elements.overlayNode,
    padding: props.containerPadding ?? 12,
    placement: translateRTL(props.placement ?? "bottom", direction),
    scrollNode: elements.scrollNode ?? elements.overlayNode,
    shouldFlip: props.shouldFlip ?? true,
    targetNode: elements.targetNode,
    targetRect: props.getTargetRect?.(elements.targetNode),
  };
}

function resetOverlayMaxHeight(
  overlay: HTMLElement,
  props: AriaPositionProps
): void {
  if (!isTruthy(props.maxHeight) && isTruthy(props.overlayRef())) {
    overlay.style.top = "0px";
    overlay.style.bottom = "";
    overlay.style.maxHeight = `${window.visualViewport?.height ?? window.innerHeight}px`;
  }
}
