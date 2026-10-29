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
 * Derived from Adobe React Spectrum: packages/react-aria/src/utils/useDrag1D.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { Orientation } from "@solid2-aria/types-shared";
import type { Accessor } from "solid-js";

import type { HTMLAttributes } from "../types";
import { requireHTMLElement } from "./dom-value";
import { getOffset } from "./get-offset";
import { getEventTarget, nodeContains } from "./shadowdom/dom-functions";
import { isTruthy } from "./truthy";

interface Drag1DProps {
  containerRef: Accessor<HTMLElement>;
  reverse?: boolean;
  orientation?: Orientation;
  onHover?: (hovered: boolean) => void;
  onDrag?: (dragging: boolean) => void;
  onPositionChange?: (position: number) => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
  onIncrementToMax?: () => void;
  onDecrementToMin?: () => void;
  onCollapseToggle?: () => void;
}

// Keep track of elements that we are currently handling dragging for via createDrag1D.
// If there's an ancestor and a descendant both using createDrag1D(), and the user starts
// dragging the descendant, we don't want createDrag1D events to fire for the ancestor.
const draggingElements: HTMLElement[] = [];

// created for splitview, this should be reusable for things like sliders/dials
// It also handles keyboard events on the target allowing for increment/decrement by a given stepsize as well as minifying/maximizing and toggling between minified and previous size
// It can also take a 'reverse' param to say if we should measure from the right/bottom instead of the top/left
// It can also handle either a vertical or horizontal movement, but not both at the same time
export function createDrag1D(props: Drag1DProps): HTMLAttributes {
  console.warn(
    "createDrag1D is deprecated, please use `createMove` instead https://react-spectrum.adobe.com/react-aria/useMove.html"
  );

  const getPosition = (e: MouseEvent) =>
    props.orientation === "horizontal" ? e.clientX : e.clientY;

  const getNextOffset = (e: MouseEvent) => {
    const containerOffset = getOffset(
      props.containerRef(),
      props.reverse,
      props.orientation
    );

    const mouseOffset = getPosition(e);

    const nextOffset = isTruthy(props.reverse)
      ? containerOffset - mouseOffset
      : mouseOffset - containerOffset;

    return nextOffset;
  };

  let dragging = false;
  let prevPosition = 0;

  const onMouseDragged = (e: MouseEvent) => {
    e.preventDefault();
    const nextOffset = getNextOffset(e);

    if (!dragging) {
      dragging = true;

      props.onDrag?.(true);

      props.onPositionChange?.(nextOffset);
    }

    if (prevPosition === nextOffset) {
      return;
    }

    prevPosition = nextOffset;

    if (props.onPositionChange) {
      props.onPositionChange(nextOffset);
    }
  };

  const onMouseUp = (e: MouseEvent) => {
    const target = requireHTMLElement(getEventTarget(e));
    dragging = false;
    const nextOffset = getNextOffset(e);

    props.onDrag?.(false);

    props.onPositionChange?.(nextOffset);

    draggingElements.splice(draggingElements.indexOf(target), 1);
    window.removeEventListener("mouseup", onMouseUp, false);
    window.removeEventListener("mousemove", onMouseDragged, false);
  };

  const onMouseDown = (
    e: MouseEvent & { readonly currentTarget: HTMLElement }
  ) => {
    const target = e.currentTarget;

    // If we're already handling dragging on a descendant with createDrag1D, then
    // we don't want to handle the drag motion on this target as well.
    if (draggingElements.some((elt) => nodeContains(target, elt))) {
      return;
    }

    draggingElements.push(target);
    window.addEventListener("mousemove", onMouseDragged, false);
    window.addEventListener("mouseup", onMouseUp, false);
  };

  const onMouseEnter = () => {
    if (props.onHover) {
      props.onHover(true);
    }
  };

  const onMouseOut = () => {
    if (props.onHover) {
      props.onHover(false);
    }
  };

  const decrement = () => {
    if (props.onDecrement && !isTruthy(props.reverse)) {
      props.onDecrement();
    } else if (props.onIncrement && isTruthy(props.reverse)) {
      props.onIncrement();
    }
  };

  const increment = () => {
    if (props.onIncrement && !isTruthy(props.reverse)) {
      props.onIncrement();
    } else if (props.onDecrement && isTruthy(props.reverse)) {
      props.onDecrement();
    }
  };

  const onKeyDown = (
    e: KeyboardEvent & { readonly currentTarget: HTMLElement }
  ) => {
    switch (e.key) {
      case "Left":
      case "ArrowLeft": {
        if (props.orientation === "horizontal") {
          e.preventDefault();

          decrement();
        }

        break;
      }

      case "Up":
      case "ArrowUp": {
        if (props.orientation === "vertical") {
          e.preventDefault();

          decrement();
        }

        break;
      }

      case "Right":
      case "ArrowRight": {
        if (props.orientation === "horizontal") {
          e.preventDefault();

          increment();
        }

        break;
      }

      case "Down":
      case "ArrowDown": {
        if (props.orientation === "vertical") {
          e.preventDefault();

          increment();
        }

        break;
      }

      case "Home": {
        e.preventDefault();

        if (props.onDecrementToMin) {
          props.onDecrementToMin();
        }

        break;
      }

      case "End": {
        e.preventDefault();

        if (props.onIncrementToMax) {
          props.onIncrementToMax();
        }

        break;
      }

      case "Enter": {
        e.preventDefault();

        if (props.onCollapseToggle) {
          props.onCollapseToggle();
        }

        break;
      }

      default: {
        break;
      }
    }
  };

  return {
    get onKeyDown() {
      return onKeyDown;
    },
    get onMouseDown() {
      return onMouseDown;
    },
    get onMouseEnter() {
      return onMouseEnter;
    },
    get onMouseOut() {
      return onMouseOut;
    },
  };
}
