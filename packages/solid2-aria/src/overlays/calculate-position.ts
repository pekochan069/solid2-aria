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
 * Derived from Adobe React Spectrum: packages/react-aria/src/overlays/calculatePosition.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { clamp } from "@solid2-aria/stately/utils/number";

import { isPresent } from "../utils/is-present";
import { isWebKit } from "../utils/platform";
import { requireValue } from "../utils/require-value";
import { nodeContains } from "../utils/shadowdom/dom-functions";
import { getTruthyValue, isTruthy } from "../utils/truthy";
import type {
  Placement,
  PlacementAxis,
  SizeAxis,
} from "./create-overlay-position";

interface Position {
  top?: number;
  left?: number;
  bottom?: number;
  right?: number;
}

interface Dimensions {
  width: number;
  height: number;
  totalWidth: number;
  totalHeight: number;
  top: number;
  left: number;
  scroll: Pick<Offset, "top" | "left">;
}

type CoordinateAxis = "top" | "left";

type Side = Exclude<PlacementAxis, "center">;

interface ParsedPlacement {
  placement: Side;
  crossPlacement: PlacementAxis;
  axis: CoordinateAxis;
  crossAxis: CoordinateAxis;
  size: SizeAxis;
  crossSize: SizeAxis;
}

interface Offset {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface PositionOpts {
  arrowSize: number;
  placement: Placement;
  targetNode: Element;
  overlayNode: Element;
  scrollNode: Element;
  padding: number;
  shouldFlip: boolean;
  boundaryElement: Element;
  offset: number;
  crossOffset: number;
  maxHeight?: number;
  arrowBoundaryOffset?: number;
  targetRect?: Readonly<Offset> | null | undefined;
}

type HeightGrowthDirection = "top" | "bottom";

export interface PositionResult {
  position: Position;
  arrowOffsetLeft?: number;
  arrowOffsetTop?: number;
  triggerAnchorPoint: {
    x: number;
    y: number;
  };
  maxHeight: number;
  placement: PlacementAxis;
}

const AXIS = {
  bottom: "top",
  left: "left",
  right: "left",
  top: "top",
} as const satisfies Record<Side, CoordinateAxis>;

const FLIPPED_DIRECTION = {
  bottom: "top",
  left: "right",
  right: "left",
  top: "bottom",
} as const satisfies Record<Side, Side>;

const CROSS_AXIS = {
  left: "top",
  top: "left",
} as const satisfies Record<CoordinateAxis, CoordinateAxis>;

const AXIS_SIZE = {
  left: "width",
  top: "height",
} as const satisfies Record<CoordinateAxis, SizeAxis>;

const TOTAL_SIZE = {
  height: "totalHeight",
  width: "totalWidth",
} as const satisfies Record<SizeAxis, keyof Dimensions>;

const PARSED_PLACEMENT_CACHE = new Map<Placement, ParsedPlacement>();

const getVisualViewport = () =>
  typeof document === "undefined" ? null : window.visualViewport;

function getContainerDimensions(
  containerNode: Element,
  visualViewport: VisualViewport | null
): Dimensions {
  let height = 0;
  let left = 0;
  let top = 0;
  let totalHeight = 0;
  let totalWidth = 0;
  let width = 0;

  const scroll = { left: 0, top: 0 };
  const isPinchZoomedIn = (visualViewport?.scale ?? 1) > 1;

  // In the case where the container is `html` or `body` and the container doesn't have something like `position: relative`,
  // then position absolute will be positioned relative to the viewport, also known as the `initial containing block`.
  // That's why we use the visual viewport instead.
  if (containerNode.tagName === "BODY" || containerNode.tagName === "HTML") {
    const { documentElement } = document;
    totalWidth = documentElement.clientWidth;
    totalHeight = documentElement.clientHeight;
    width = visualViewport?.width ?? totalWidth;
    height = visualViewport?.height ?? totalHeight;
    scroll.top = documentElement.scrollTop || containerNode.scrollTop;
    scroll.left = documentElement.scrollLeft || containerNode.scrollLeft;

    // The goal of the below is to get a top/left value that represents the top/left of the visual viewport with
    // respect to the layout viewport origin. This combined with the scrollTop/scrollLeft will allow us to calculate
    // coordinates/values with respect to the visual viewport or with respect to the layout viewport.
    // Uses pageTop/pageLeft instead of offsetTop/offsetLeft because WebKit misreports those during pans.
    if (visualViewport) {
      top = Math.max(0, visualViewport.pageTop - scroll.top);
      left = Math.max(0, visualViewport.pageLeft - scroll.left);
    }
  } else {
    ({ width, height, top, left } = getOffset(containerNode, false));
    scroll.top = containerNode.scrollTop;
    scroll.left = containerNode.scrollLeft;
    totalWidth = width;
    totalHeight = height;
  }

  if (
    isWebKit() &&
    (containerNode.tagName === "BODY" || containerNode.tagName === "HTML") &&
    isPinchZoomedIn
  ) {
    // Safari will report a non-zero scrollTop/Left for the non-scrolling body/HTML element when pinch zoomed in unlike other browsers.
    // Set to zero for parity calculations so we get consistent positioning of overlays across all browsers.
    // Also switch to visualViewport.pageTop/pageLeft so that we still accomodate for scroll positioning for body/HTML elements that are actually scrollable
    // before pinch zoom happens
    scroll.top = 0;
    scroll.left = 0;
    top = visualViewport?.pageTop ?? 0;
    left = visualViewport?.pageLeft ?? 0;
  }

  return { height, left, scroll, top, totalHeight, totalWidth, width };
}

function getScroll(node: Element): Offset {
  return {
    height: node.scrollHeight,
    left: node.scrollLeft,
    top: node.scrollTop,
    width: node.scrollWidth,
  };
}

// Determines the amount of space required when moving the overlay to ensure it remains in the boundary
function getDelta(
  axis: CoordinateAxis,
  offset: number,
  size: number,
  // The dimensions of the boundary element that the popover is
  // positioned within (most of the time this is the <body>).
  boundaryDimensions: Dimensions,
  // The dimensions of the containing block element that the popover is
  // positioned relative to (e.g. parent with position: relative).
  // Usually this is the same as the boundary element, but if the popover
  // is portaled somewhere other than the body and has an ancestor with
  // position: relative/absolute, it will be different.
  containerDimensions: Dimensions,
  padding: number,
  containerOffsetWithBoundary: Offset
) {
  const containerScroll = containerDimensions.scroll[axis] ?? 0;
  // The height/width of the boundary. Matches the axis along which we are adjusting the overlay position
  const boundarySize = boundaryDimensions[AXIS_SIZE[axis]];

  // Calculate the edges of the boundary (accomodating for the boundary padding) and the edges of the overlay.
  // Note that these values are with respect to the visual viewport (aka 0,0 is the top left of the viewport)
  const boundaryStartEdge =
    containerOffsetWithBoundary[axis] +
    boundaryDimensions.scroll[AXIS[axis]] +
    padding;

  const boundaryEndEdge =
    containerOffsetWithBoundary[axis] +
    boundaryDimensions.scroll[AXIS[axis]] +
    boundarySize -
    padding;

  // transformed value of the left edge of the overlay
  const startEdgeOffset =
    offset -
    containerScroll +
    boundaryDimensions.scroll[AXIS[axis]] +
    containerOffsetWithBoundary[axis] -
    boundaryDimensions[AXIS[axis]];

  // transformed value of the right edge of the overlay
  const endEdgeOffset =
    offset -
    containerScroll +
    size +
    boundaryDimensions.scroll[AXIS[axis]] +
    containerOffsetWithBoundary[axis] -
    boundaryDimensions[AXIS[axis]];

  // If any of the overlay edges falls outside of the boundary, shift the overlay the required amount to align one of the overlay's
  // edges with the closest boundary edge.
  if (startEdgeOffset < boundaryStartEdge) {
    return boundaryStartEdge - startEdgeOffset;
  } else if (endEdgeOffset > boundaryEndEdge) {
    return Math.max(
      boundaryEndEdge - endEdgeOffset,
      boundaryStartEdge - startEdgeOffset
    );
  }

  return 0;
}

function getMargins(node: Element): Position {
  const style = window.getComputedStyle(node);

  return {
    bottom: Math.trunc(Number(style.marginBottom)) || 0,
    left: Math.trunc(Number(style.marginLeft)) || 0,
    right: Math.trunc(Number(style.marginRight)) || 0,
    top: Math.trunc(Number(style.marginTop)) || 0,
  };
}

function isSide(value: string | undefined): value is Side {
  return (
    value === "top" ||
    value === "bottom" ||
    value === "left" ||
    value === "right"
  );
}

function parsedPlacement(
  placement: Side,
  crossPlacement: PlacementAxis
): ParsedPlacement {
  const axis = AXIS[placement];
  const crossAxis = CROSS_AXIS[axis];

  return {
    axis,
    crossAxis,
    crossPlacement,
    crossSize: AXIS_SIZE[crossAxis],
    placement,
    size: AXIS_SIZE[axis],
  };
}

function parsePlacement(input: Placement): ParsedPlacement {
  const cached = PARSED_PLACEMENT_CACHE.get(input);

  if (cached) {
    return cached;
  }

  const [placement, crossPlacement] = input.split(" ");

  if (!isSide(placement)) {
    throw new Error(
      `Overlay positioning requires a physical placement: ${input}`
    );
  }

  const parsed = parsedPlacement(
    placement,
    isSide(crossPlacement) ? crossPlacement : "center"
  );

  PARSED_PLACEMENT_CACHE.set(input, parsed);

  return parsed;
}

/* else {
      the overlay top should match the button top
    } */
function computePosition(
  childOffset: Offset,
  boundaryDimensions: Dimensions,
  overlaySize: Offset,
  placementInfo: ParsedPlacement,
  offset: number,
  crossOffset: number,
  containerOffsetWithBoundary: Offset,
  isContainerPositioned: boolean,
  arrowSize: number,
  arrowBoundaryOffset: number,
  containerDimensions: Dimensions
) {
  const { placement, crossPlacement, axis, crossAxis, size, crossSize } =
    placementInfo;

  const position: Position = {};
  // button position
  position[crossAxis] = childOffset[crossAxis] ?? 0;

  if (crossPlacement === "center") {
    //  + (button size / 2) - (overlay size / 2)
    // at this point the overlay center should match the button center
    position[crossAxis] +=
      ((childOffset[crossSize] ?? 0) - (overlaySize[crossSize] ?? 0)) / 2;
  } else if (crossPlacement !== crossAxis) {
    //  + (button size) - (overlay size)
    // at this point the overlay bottom should match the button bottom
    position[crossAxis] +=
      (childOffset[crossSize] ?? 0) - (overlaySize[crossSize] ?? 0);
  }

  position[crossAxis] += crossOffset;

  // overlay top or left overlapping arrow with button bottom or right
  const minPosition =
    childOffset[crossAxis] -
    overlaySize[crossSize] +
    arrowSize +
    arrowBoundaryOffset;

  // overlay bottom or right overlapping arrow with button top or left
  const maxPosition =
    childOffset[crossAxis] +
    childOffset[crossSize] -
    arrowSize -
    arrowBoundaryOffset;

  position[crossAxis] = clamp(position[crossAxis], minPosition, maxPosition);

  // Floor these so the position isn't placed on a partial pixel, only whole pixels. Shouldn't matter if it was floored or ceiled, so chose one.
  if (placement === axis) {
    // If the container is positioned (non-static), then we use the container's actual
    // height, as `bottom` will be relative to this height.  But if the container is static,
    // then it can only be the `document.body`, and `bottom` will be relative to _its_
    // container.
    const containerHeight = isContainerPositioned
      ? containerDimensions[size]
      : containerDimensions[TOTAL_SIZE[size]];

    position[FLIPPED_DIRECTION[axis]] = Math.floor(
      containerHeight - childOffset[axis] + offset
    );
  } else {
    position[axis] = Math.floor(childOffset[axis] + childOffset[size] + offset);
  }

  return position;
}

function getMaxHeight(
  position: Position,
  boundaryDimensions: Dimensions,
  containerOffsetWithBoundary: Offset,
  isContainerPositioned: boolean,
  margins: Position,
  padding: number,
  overlayHeight: number,
  heightGrowthDirection: HeightGrowthDirection,
  containerDimensions: Dimensions,
  isContainerDescendentOfBoundary: boolean,
  visualViewport: VisualViewport | null
) {
  // For cases where position is set via "bottom" instead of "top", we need to calculate the true overlay top
  // with respect to the container.
  const overlayTop =
    (position.top ??
      containerDimensions[TOTAL_SIZE.height] -
        (position.bottom ?? 0) -
        overlayHeight) - (containerDimensions.scroll.top ?? 0);

  // calculate the dimentions of the "boundingRect" which is most restrictive top/bottom of the boundaryRect and the visual view port
  const boundaryToContainerTransformOffset = isContainerDescendentOfBoundary
    ? containerOffsetWithBoundary.top
    : 0;

  const boundingRect = {
    bottom: Math.min(
      boundaryDimensions.top +
        boundaryDimensions.height +
        boundaryToContainerTransformOffset,
      (visualViewport?.offsetTop ?? 0) + (visualViewport?.height ?? 0)
    ),
    // This should be boundary top in container coord system vs viewport top in container coord system
    // For the viewport top, there are several cases
    // 1. pinchzoom case where we want the viewports offset top as top here
    // 2. case where container is offset from the boundary and is contained by the boundary. In this case the top we want here is NOT 0, we want to take boundary's top even though is is a negative number OR the visual viewport, whichever is more restrictive
    top: Math.max(
      boundaryDimensions.top + boundaryToContainerTransformOffset,
      (visualViewport?.offsetTop ?? boundaryDimensions.top) +
        boundaryToContainerTransformOffset
    ),
  };

  // We want the distance between the bottom of the overlay to the top of the boundary
  // We want the distance between the top of the overlay to the bottom of the boundary
  const maxHeight =
    heightGrowthDirection === "top"
      ? Math.max(
          0,
          overlayTop +
            // this is the bottom of the overlay
            overlayHeight -
            // this is the top of the boundary
            boundingRect.top -
            // save additional space for margin and padding
            ((margins.top ?? 0) + (margins.bottom ?? 0) + padding)
        )
      : Math.max(
          0,
          // this is the bottom of the boundary
          boundingRect.bottom -
            // this is the top of the overlay
            overlayTop -
            // save additional space for margin and padding
            ((margins.top ?? 0) + (margins.bottom ?? 0) + padding)
        );

  return maxHeight;
}

// overlay <-> boundary
// overlay
// trigger, position based of container's non-viewport 0,0
// boundary
function getAvailableSpace(
  boundaryDimensions: Dimensions,
  containerOffsetWithBoundary: Offset,
  childOffset: Offset,
  margins: Position,
  padding: number,
  placementInfo: ParsedPlacement,
  containerDimensions: Dimensions,
  isContainerDescendentOfBoundary: boolean
) {
  const { placement, axis, size } = placementInfo;

  if (placement === axis) {
    // boundary start
    return Math.max(
      0,
      // trigger start
      childOffset[axis] -
        // transform trigger position to be with respect to viewport 0,0
        (containerDimensions.scroll[axis] ?? 0) -
        (boundaryDimensions[axis] +
          (isContainerDescendentOfBoundary
            ? containerOffsetWithBoundary[axis]
            : 0)) -
        // margins usually for arrows or other decorations
        (margins[axis] ?? 0) -
        (margins[FLIPPED_DIRECTION[axis]] ?? 0) -
        padding
      // padding between overlay and boundary
    );
  }

  return Math.max(
    0,
    boundaryDimensions[size] +
      boundaryDimensions[axis] +
      (isContainerDescendentOfBoundary
        ? containerOffsetWithBoundary[axis]
        : 0) -
      childOffset[axis] -
      childOffset[size] +
      (containerDimensions.scroll[axis] ?? 0) -
      (margins[axis] ?? 0) -
      (margins[FLIPPED_DIRECTION[axis]] ?? 0) -
      padding
  );
}

export function calculatePositionInternal(
  placementInput: Placement,
  childOffset: Offset,
  overlaySize: Offset,
  scrollSize: Offset,
  margins: Position,
  padding: number,
  flip: boolean,
  boundaryDimensions: Dimensions,
  containerDimensions: Dimensions,
  containerOffsetWithBoundary: Offset,
  offset: number,
  crossOffset: number,
  isContainerPositioned: boolean,
  userSetMaxHeight: number | undefined,
  arrowSize: number,
  arrowBoundaryOffset: number,
  isContainerDescendentOfBoundary: boolean,
  visualViewport: VisualViewport | null
): PositionResult {
  let placementInfo = parsePlacement(placementInput);
  const destructured0 = placementInfo;
  const { size, crossAxis, crossSize } = destructured0;
  const { placement, crossPlacement } = destructured0;

  let position = computePosition(
    childOffset,
    boundaryDimensions,
    overlaySize,
    placementInfo,
    offset,
    crossOffset,
    containerOffsetWithBoundary,
    isContainerPositioned,
    arrowSize,
    arrowBoundaryOffset,
    containerDimensions
  );

  let normalizedOffset = offset;

  const space = getAvailableSpace(
    boundaryDimensions,
    containerOffsetWithBoundary,
    childOffset,
    margins,
    padding + offset,
    placementInfo,
    containerDimensions,
    isContainerDescendentOfBoundary
  );

  // Check if the scroll size of the overlay is greater than the available space to determine if we need to flip
  if (flip && overlaySize[size] > space) {
    const flippedPlacementInfo = parsedPlacement(
      FLIPPED_DIRECTION[placement],
      crossPlacement
    );

    const flippedPosition = computePosition(
      childOffset,
      boundaryDimensions,
      overlaySize,
      flippedPlacementInfo,
      offset,
      crossOffset,
      containerOffsetWithBoundary,
      isContainerPositioned,
      arrowSize,
      arrowBoundaryOffset,
      containerDimensions
    );

    const flippedSpace = getAvailableSpace(
      boundaryDimensions,
      containerOffsetWithBoundary,
      childOffset,
      margins,
      padding + offset,
      flippedPlacementInfo,
      containerDimensions,
      isContainerDescendentOfBoundary
    );

    // If the available space for the flipped position is greater than the original available space, flip.
    if (flippedSpace > space) {
      placementInfo = flippedPlacementInfo;
      position = flippedPosition;
      normalizedOffset = offset;
    }
  }

  // Determine the direction the height of the overlay can grow so that we can choose how to calculate the max height
  const heightGrowthDirection = getHeightGrowthDirection(placementInfo);

  let delta = getDelta(
    crossAxis,
    requireValue(position[crossAxis], "Expected position[crossAxis]"),
    overlaySize[crossSize],
    boundaryDimensions,
    containerDimensions,
    padding,
    containerOffsetWithBoundary
  );

  position[crossAxis] =
    requireValue(position[crossAxis], "Expected position[crossAxis]") + delta;

  let maxHeight = getMaxHeight(
    position,
    boundaryDimensions,
    containerOffsetWithBoundary,
    isContainerPositioned,
    margins,
    padding,
    overlaySize.height,
    heightGrowthDirection,
    containerDimensions,
    isContainerDescendentOfBoundary,
    visualViewport
  );

  if (isTruthy(userSetMaxHeight) && userSetMaxHeight < maxHeight) {
    maxHeight = userSetMaxHeight;
  }

  overlaySize.height = Math.min(overlaySize.height, maxHeight);
  position = computePosition(
    childOffset,
    boundaryDimensions,
    overlaySize,
    placementInfo,
    normalizedOffset,
    crossOffset,
    containerOffsetWithBoundary,
    isContainerPositioned,
    arrowSize,
    arrowBoundaryOffset,
    containerDimensions
  );
  delta = getDelta(
    crossAxis,
    requireValue(position[crossAxis], "Expected position[crossAxis]"),
    overlaySize[crossSize],
    boundaryDimensions,
    containerDimensions,
    padding,
    containerOffsetWithBoundary
  );
  position[crossAxis] =
    requireValue(position[crossAxis], "Expected position[crossAxis]") + delta;

  const arrow = getArrowGeometry({
    arrowBoundaryOffset,
    arrowSize,
    childOffset,
    margins,
    overlaySize,
    placementInfo,
    position,
  });

  return {
    arrowOffsetLeft: arrow.arrowOffsetLeft,
    arrowOffsetTop: arrow.arrowOffsetTop,
    maxHeight,
    placement: placementInfo.placement,
    position,
    triggerAnchorPoint: arrow.triggerAnchorPoint,
  };
}

/**
 * Determines where to place the overlay with regards to the target and the position of an optional
 * indicator.
 */
export function calculatePosition(opts: PositionOpts): PositionResult {
  const {
    placement,
    targetNode,
    overlayNode,
    scrollNode,
    padding,
    shouldFlip,
    boundaryElement,
    offset,
    crossOffset,
    maxHeight,
    arrowSize,
    arrowBoundaryOffset = 0,
    targetRect,
  } = opts;

  const visualViewport = getVisualViewport();

  const container =
    overlayNode instanceof HTMLElement
      ? getContainingBlock(overlayNode)
      : document.documentElement;

  const isViewportContainer = container === document.documentElement;
  const containerPositionStyle = window.getComputedStyle(container).position;

  const isContainerPositioned =
    !!containerPositionStyle && containerPositionStyle !== "static";

  const childOffset: Offset = isViewportContainer
    ? getOffset(targetNode, false, targetRect)
    : getPosition(targetNode, container, false, targetRect);

  if (!isViewportContainer) {
    const { marginTop, marginLeft } = window.getComputedStyle(targetNode);
    childOffset.top += Math.trunc(Number(marginTop)) || 0;
    childOffset.left += Math.trunc(Number(marginLeft)) || 0;
  }

  const overlaySize: Offset = getOffset(overlayNode, true);
  const margins = getMargins(overlayNode);
  overlaySize.width += (margins.left ?? 0) + (margins.right ?? 0);
  overlaySize.height += (margins.top ?? 0) + (margins.bottom ?? 0);
  const scrollSize = getScroll(scrollNode);

  // Note that due to logic inside getContainerDimensions, for cases where the boundary element is the body, we will return
  // a height/width that matches the visual viewport size rather than the body's height/width (aka for zoom it will be zoom adjusted size)
  // and a top/left that is adjusted as well (will return the top/left of the zoomed in viewport, or 0,0 for a non-zoomed body)
  // Otherwise this returns the height/width of a arbitrary boundary element, and its top/left with respect to the viewport (NOTE THIS MEANS IT DOESNT INCLUDE SCROLL)
  const boundaryDimensions = getContainerDimensions(
    boundaryElement,
    visualViewport
  );

  const containerDimensions = getContainerDimensions(container, visualViewport);
  // There are several difference cases of how to calculate the containerOffsetWithBoundary:
  // - boundaryElement is body or HTML and the container is an arbitrary element in the boundary (aka submenu with parent menu as container in v3)
  // - boundaryElement and container are both body or HTML element (aka standard popover case)
  // - boundaryElement is customized by the user. Container can also be arbitrary (either body/HTML or some other element)
  // containerOffsetWithBoundary should always return a value that is the boundary's coordinate offset with respect to the container coord system (container is 0, 0)
  let containerOffsetWithBoundary: Offset;

  if (
    (boundaryElement.tagName === "BODY" ||
      boundaryElement.tagName === "HTML") &&
    !isViewportContainer
  ) {
    // Use getRect instead of getOffset because boundaryDimensions for BODY/HTML is in viewport coordinate space,
    // not document coordinate space
    const containerRect = getRect(container, false);
    // the offset should be negative because if container is at viewport position x,y, then viewport top (aka 0)
    // is at position -x,y in container-relative coordinates
    containerOffsetWithBoundary = {
      height: 0,
      left: -(containerRect.left - boundaryDimensions.left),
      top: -(containerRect.top - boundaryDimensions.top),
      width: 0,
    };
  } else if (
    (boundaryElement.tagName === "BODY" ||
      boundaryElement.tagName === "HTML") &&
    isViewportContainer
  ) {
    // both are the same viewport container, no offset needed
    containerOffsetWithBoundary = { height: 0, left: 0, top: 0, width: 0 };
  } else {
    // This returns the boundary's coordinate with respect to the container. This case captures cases such as when you provide a custom boundary
    // like in ScrollingBoundaryContainerExample in Popover.stories.
    containerOffsetWithBoundary = getPosition(
      boundaryElement,
      container,
      false
    );
  }

  const isContainerDescendentOfBoundary = nodeContains(
    boundaryElement,
    container
  );

  return calculatePositionInternal(
    placement,
    childOffset,
    overlaySize,
    scrollSize,
    margins,
    padding,
    shouldFlip,
    boundaryDimensions,
    containerDimensions,
    containerOffsetWithBoundary,
    offset,
    crossOffset,
    isContainerPositioned,
    maxHeight,
    arrowSize,
    arrowBoundaryOffset,
    isContainerDescendentOfBoundary,
    visualViewport
  );
}

export function getRect(node: Element, ignoreScale: boolean) {
  const destructured1 = node.getBoundingClientRect();
  const { top, left } = destructured1;
  let { width, height } = destructured1;

  // Use offsetWidth and offsetHeight if this is an HTML element, so that
  // the size is not affected by scale transforms.
  if (
    ignoreScale &&
    node instanceof
      requireValue(
        node.ownerDocument.defaultView,
        "Expected node.ownerDocument.defaultView"
      ).HTMLElement
  ) {
    width = node.offsetWidth;
    height = node.offsetHeight;
  }

  return { height, left, top, width };
}

function getOffset(
  node: Element,
  ignoreScale: boolean,
  overrideRect?: Readonly<Offset> | null
): Offset {
  const { top, left, width, height } =
    getTruthyValue(overrideRect) ?? getRect(node, ignoreScale);

  const { scrollTop, scrollLeft, clientTop, clientLeft } =
    document.documentElement;

  return {
    height,
    left: left + scrollLeft - clientLeft,
    top: top + scrollTop - clientTop,
    width,
  };
}

function getPosition(
  node: Element,
  parent: Element,
  ignoreScale: boolean,
  overrideRect?: Readonly<Offset> | null
): Offset {
  const style = window.getComputedStyle(node);
  let offset: Offset;

  if (style.position === "fixed") {
    const { top, left, width, height } =
      getTruthyValue(overrideRect) ?? getRect(node, ignoreScale);

    offset = { height, left, top, width };
  } else {
    offset = getOffset(node, ignoreScale, overrideRect);
    const parentOffset = getOffset(parent, ignoreScale);
    const parentStyle = window.getComputedStyle(parent);
    parentOffset.top +=
      (Math.trunc(Number(parentStyle.borderTopWidth)) || 0) - parent.scrollTop;
    parentOffset.left +=
      (Math.trunc(Number(parentStyle.borderLeftWidth)) || 0) -
      parent.scrollLeft;
    offset.top -= parentOffset.top;
    offset.left -= parentOffset.left;
  }

  offset.top -= Math.trunc(Number(style.marginTop)) || 0;
  offset.left -= Math.trunc(Number(style.marginLeft)) || 0;

  return offset;
}

// Returns the containing block of an element, which is the element that
// this element will be positioned relative to.
// https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block
function getContainingBlock(node: HTMLElement): Element {
  // The offsetParent of an element in most cases equals the containing block.
  // https://w3c.github.io/csswg-drafts/cssom-view/#dom-htmlelement-offsetparent
  let { offsetParent } = node;

  // The offsetParent algorithm terminates at the document body,
  // even if the body is not a containing block. Double check that
  // and use the documentElement if so.
  if (
    offsetParent &&
    offsetParent === document.body &&
    window.getComputedStyle(offsetParent).position === "static" &&
    !isContainingBlock(offsetParent)
  ) {
    offsetParent = document.documentElement;
  }

  // Follow-up(later): handle table elements?
  // The offsetParent can be null if the element has position: fixed, or a few other cases.
  // We have to walk up the tree manually in this case because fixed positioned elements
  // are still positioned relative to their containing block, which is not always the viewport.
  if (!isPresent(offsetParent)) {
    offsetParent = node.parentElement;

    while (offsetParent && !isContainingBlock(offsetParent)) {
      offsetParent = offsetParent.parentElement;
    }
  }

  // Fall back to the viewport.
  return getTruthyValue(offsetParent) ?? document.documentElement;
}

// https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block
function isContainingBlock(node: Element): boolean {
  const style = window.getComputedStyle(node);

  return (
    style.transform !== "none" ||
    /transform|perspective/u.test(style.willChange) ||
    style.filter !== "none" ||
    style.contain === "paint" ||
    ("backdropFilter" in style && style.backdropFilter !== "none") ||
    ("WebkitBackdropFilter" in style && style.WebkitBackdropFilter !== "none")
  );
}

function getHeightGrowthDirection(
  placementInfo: ParsedPlacement
): HeightGrowthDirection {
  let heightGrowthDirection: HeightGrowthDirection = "bottom";

  if (placementInfo.axis === "top") {
    if (placementInfo.placement === "top") {
      heightGrowthDirection = "top";
    } else if (placementInfo.placement === "bottom") {
      heightGrowthDirection = "bottom";
    }
  } else if (placementInfo.crossAxis === "top") {
    if (placementInfo.crossPlacement === "top") {
      heightGrowthDirection = "bottom";
    } else if (placementInfo.crossPlacement === "bottom") {
      heightGrowthDirection = "top";
    }
  }

  return heightGrowthDirection;
}

interface ArrowGeometryOptions {
  placementInfo: ParsedPlacement;
  childOffset: Offset;
  overlaySize: Offset;
  position: Position;
  margins: Position;
  arrowSize: number;
  arrowBoundaryOffset: number;
}

function getArrowGeometry(
  options: ArrowGeometryOptions
): Pick<
  PositionResult,
  "arrowOffsetLeft" | "arrowOffsetTop" | "triggerAnchorPoint"
> {
  const {
    placementInfo,
    childOffset,
    overlaySize,
    position,
    margins,
    arrowSize,
    arrowBoundaryOffset,
  } = options;

  const { placement, crossPlacement, size, crossAxis, crossSize } =
    placementInfo;

  const arrowPosition: Position = {};

  // All values are transformed so that 0 is at the top/left of the overlay depending on the orientation
  // Prefer the arrow being in the center of the trigger/overlay anchor element
  // childOffset[crossAxis] + .5 * childOffset[crossSize] = absolute position with respect to the trigger's coordinate system that would place the arrow in the center of the trigger
  // position[crossAxis] - (margins[AXIS[crossAxis]] ?? 0) = value use to transform the position to a value with respect to the overlay's coordinate system. A child element's (aka arrow) position absolute's "0"
  // is positioned after the margin of its parent (aka overlay) so we need to subtract it to get the proper coordinate transform
  let origin =
    childOffset[crossAxis] -
    requireValue(position[crossAxis], "Expected position[crossAxis]") -
    (margins[AXIS[crossAxis]] ?? 0);

  const preferredArrowPosition = origin + 0.5 * childOffset[crossSize];
  // Min/Max position limits for the arrow with respect to the overlay
  const arrowMinPosition = arrowSize / 2 + arrowBoundaryOffset;

  // overlaySize[crossSize] - margins = true size of the overlay
  const overlayMargin =
    AXIS[crossAxis] === "left"
      ? (margins.left ?? 0) + (margins.right ?? 0)
      : (margins.top ?? 0) + (margins.bottom ?? 0);

  const arrowMaxPosition =
    overlaySize[crossSize] -
    overlayMargin -
    arrowSize / 2 -
    arrowBoundaryOffset;

  // Min/Max position limits for the arrow with respect to the trigger/overlay anchor element
  // Same margin accomodation done here as well as for the preferredArrowPosition
  const arrowOverlappingChildMinEdge =
    childOffset[crossAxis] +
    arrowSize / 2 -
    (requireValue(position[crossAxis], "Expected position[crossAxis]") +
      (margins[AXIS[crossAxis]] ?? 0));

  const arrowOverlappingChildMaxEdge =
    childOffset[crossAxis] +
    childOffset[crossSize] -
    arrowSize / 2 -
    (requireValue(position[crossAxis], "Expected position[crossAxis]") +
      (margins[AXIS[crossAxis]] ?? 0));

  // Clamp the arrow positioning so that it always is within the bounds of the anchor and the overlay
  const arrowPositionOverlappingChild = clamp(
    preferredArrowPosition,
    arrowOverlappingChildMinEdge,
    arrowOverlappingChildMaxEdge
  );

  arrowPosition[crossAxis] = clamp(
    arrowPositionOverlappingChild,
    arrowMinPosition,
    arrowMaxPosition
  );
  // If there is an arrow, use that as the origin so that animations are smooth.
  // Otherwise use the target edge.

  if (arrowSize) {
    origin = requireValue(
      arrowPosition[crossAxis],
      "Expected arrowPosition[crossAxis]"
    );
  } else if (crossPlacement === "right") {
    origin += childOffset[crossSize];
  } else if (crossPlacement === "center") {
    origin += childOffset[crossSize] / 2;
  }

  const crossOrigin =
    placement === "left" || placement === "top" ? overlaySize[size] : 0;

  const triggerAnchorPoint = {
    x: placement === "top" || placement === "bottom" ? origin : crossOrigin,
    y: placement === "left" || placement === "right" ? origin : crossOrigin,
  };

  return {
    arrowOffsetLeft: arrowPosition.left,
    arrowOffsetTop: arrowPosition.top,
    triggerAnchorPoint,
  };
}
