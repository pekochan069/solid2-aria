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
 * Derived from Adobe React Spectrum: packages/react-aria/src/slider/useSlider.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  SliderProps,
  SliderState,
} from "@solid2-aria/stately/slider/create-slider-state";
import { clamp } from "@solid2-aria/stately/utils/number";
import type { AriaLabelingProps, DOMProps } from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { merge, createMemo, omit } from "solid-js";
import type { Accessor } from "solid-js";

import { createLocale } from "../i18n/i18n-provider";
import { setInteractionModality } from "../interactions/create-focus-visible";
import { createMove } from "../interactions/create-move";
import { createLabel } from "../label/create-label";
import type {
  MouseEvent as NativeMouseEvent,
  PointerEvent as NativePointerEvent,
  TouchEvent as NativeTouchEvent,
  UIEvent as NativeUIEvent,
  LabelHTMLAttributes,
  OutputHTMLAttributes,
} from "../types";
import { ariaValue } from "../utils/aria-value";
import { createGlobalListeners } from "../utils/create-global-listeners";
import { isPresent } from "../utils/is-present";
import { mergeProps } from "../utils/merge-props";
import { getPointerId } from "../utils/pointer-id";
import { requireValue } from "../utils/require-value";
import { isTruthy } from "../utils/truthy";
import { getSliderThumbId, sliderData } from "./utils";

export interface AriaSliderProps<T = number | number[]>
  extends SliderProps<T>, DOMProps, AriaLabelingProps {}

export interface SliderAria {
  /** Props for the label element. */
  labelProps: LabelHTMLAttributes;
  /** Props for the root element of the slider component; groups slider inputs. */
  groupProps: DOMAttributes;
  /** Props for the track element. */
  trackProps: DOMAttributes;
  /** Props for the output element, displaying the value of the slider thumbs. */
  outputProps: OutputHTMLAttributes;
}

/**
 * Provides the behavior and accessibility implementation for a slider component representing one or
 * more values.
 *
 * @param props Props for the slider.
 * @param state State for the slider, as returned by `useSliderState`.
 * @param trackRef Ref for the "track" element.  The width of this element provides the "length"
 *   of the track -- the span of one dimensional space that the slider thumb can be.  It also
 *   accepts click and drag motions, so that the closest thumb will follow clicks and drags on
 *   the track.
 */

export function createSlider<T extends number | number[]>(
  props: AriaSliderProps<T>,
  state: SliderState,
  trackRef: Accessor<Element | null>
): SliderAria {
  const _result0 = createLabel(props);
  const isVertical = createMemo(() => props.orientation === "vertical");
  // Attach id of the label to the state so it can be accessed by useSliderThumb.
  sliderData.set(state, {
    "aria-describedby": ariaValue(props["aria-describedby"]),
    "aria-details": ariaValue(props["aria-details"]),
    get id() {
      const id = _result0.labelProps.id ?? _result0.fieldProps.id;

      return typeof id === "string" ? id : "";
    },
  });
  const _result1 = createLocale();
  const _result2 = createGlobalListeners();
  // When the user clicks or drags the track, we want the motion to set and drag the
  // closest thumb.  Hence we also need to install useMove() on the track element.
  // Here, we keep track of which index is the "closest" to the drag start point.
  // It is set onMouseDown/onTouchDown; see trackProps below.
  let realTimeTrackDraggingIndex: number | null = null;
  const reverseX = createMemo(() => _result1.direction === "rtl");
  let currentPosition: number | null = null;

  const _result3 = createMove({
    onMove({ deltaX, deltaY }) {
      const trackRefElement = trackRef();

      if (!trackRefElement) {
        return;
      }

      const { height, width } = trackRefElement.getBoundingClientRect();
      const size = isVertical() ? height : width;

      if (
        !isPresent(currentPosition) &&
        realTimeTrackDraggingIndex !== null &&
        realTimeTrackDraggingIndex !== undefined
      ) {
        currentPosition =
          state.getThumbPercent(realTimeTrackDraggingIndex) * size;
      }

      let delta = isVertical() ? deltaY : deltaX;

      if (isVertical() || reverseX()) {
        delta = -delta;
      }

      currentPosition =
        requireValue(currentPosition, "Expected currentPosition.current") +
        delta;

      if (isPresent(realTimeTrackDraggingIndex) && isTruthy(trackRefElement)) {
        const percent = clamp(
          requireValue(currentPosition, "Expected currentPosition.current") /
            size,
          0,
          1
        );

        state.setThumbPercent(realTimeTrackDraggingIndex, percent);
      }
    },
    onMoveEnd() {
      if (isPresent(realTimeTrackDraggingIndex)) {
        state.setThumbDragging(realTimeTrackDraggingIndex, false);
        realTimeTrackDraggingIndex = null;
      }
    },
    onMoveStart() {
      currentPosition = null;
    },
  });

  let currentPointer: number | null | undefined = undefined;

  const onDownTrack = (
    e: NativeUIEvent,
    id: number | undefined,
    clientX: number,
    clientY: number
  ) => {
    const trackRefElement = trackRef();

    // We only trigger track-dragging if the user clicks on the track itself and nothing is currently being dragged.
    if (
      trackRefElement &&
      !isTruthy(props.isDisabled) &&
      state.values.every((_, i) => !state.isThumbDragging(i))
    ) {
      const { height, width, top, left } =
        trackRefElement.getBoundingClientRect();

      const size = isVertical() ? height : width;
      // Find the closest thumb
      const trackPosition = isVertical() ? top : left;
      const clickPosition = isVertical() ? clientY : clientX;
      const offset = clickPosition - trackPosition;
      let percent = offset / size;

      if (_result1.direction === "rtl" || isVertical()) {
        percent = 1 - percent;
      }

      const value = state.getPercentValue(percent);
      // to find the closet thumb we split the array based on the first thumb position to the "right/end" of the click.
      let closestThumb;
      const split = state.values.findIndex((v) => value - v < 0);

      if (split === 0) {
        // If the index is zero then the closetThumb is the first one
        closestThumb = split;
      } else if (split === -1) {
        // If no index is found they've clicked past all the thumbs
        closestThumb = state.values.length - 1;
      } else {
        const lastLeft = requireValue(
          state.values[split - 1],
          "Expected state.values[split - 1]"
        );

        const firstRight = requireValue(
          state.values[split],
          "Expected state.values[split]"
        );

        // Pick the last left/start thumb, unless they are stacked on top of each other, then pick the right/end one
        closestThumb =
          Math.abs(lastLeft - value) < Math.abs(firstRight - value)
            ? split - 1
            : split;
      }

      // Confirm that the found closest thumb is editable, not disabled, and move it
      if (closestThumb >= 0 && state.isThumbEditable(closestThumb)) {
        // Don't unfocus anything
        e.preventDefault();
        realTimeTrackDraggingIndex = closestThumb;
        state.setFocusedThumb(closestThumb);
        currentPointer = id;
        state.setThumbDragging(realTimeTrackDraggingIndex, true);
        state.setThumbValue(closestThumb, value);
        _result2.addGlobalListener(window, "mouseup", onUpTrack, false);
        _result2.addGlobalListener(window, "touchend", onUpTrack, false);
        _result2.addGlobalListener(window, "pointerup", onUpTrack, false);
      } else {
        realTimeTrackDraggingIndex = null;
      }
    }
  };

  function onUpTrack(e: PointerEvent | TouchEvent | MouseEvent) {
    const id = getPointerId(e);

    if (id === currentPointer) {
      if (isPresent(realTimeTrackDraggingIndex)) {
        state.setThumbDragging(realTimeTrackDraggingIndex, false);
        realTimeTrackDraggingIndex = null;
      }

      _result2.removeGlobalListener(window, "mouseup", onUpTrack, false);
      _result2.removeGlobalListener(window, "touchend", onUpTrack, false);
      _result2.removeGlobalListener(window, "pointerup", onUpTrack, false);
    }
  }

  // Focus the first thumb on label clicks; `for` overrides thumb labels in VoiceOver.
  const onLabelClick = () => {
    document.getElementById(getSliderThumbId(state, 0))?.focus();
    setInteractionModality("keyboard");
  };

  // all the thumb inputs in the Slider.  The label of the Slider will
  // be used to label the group.
  return {
    // The root element of the Slider will have role="group" to group together
    get groupProps() {
      return merge(
        {
          get role(): "group" {
            return "group" as const;
          },
        },
        _result0.fieldProps
      );
    },
    get labelProps() {
      return merge(omit(_result0.labelProps, "for"), () =>
        isTruthy(_result0.labelProps.for) ? { onClick: onLabelClick } : {}
      );
    },
    get outputProps() {
      return {
        get "aria-live"() {
          return ariaValue(ariaValue("off"));
        },
        get for() {
          return state.values
            .map((_, index) => getSliderThumbId(state, index))
            .join(" ");
        },
      };
    },
    get trackProps() {
      return mergeProps(
        {
          onMouseDown(e: NativeMouseEvent) {
            if (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey) {
              return;
            }

            onDownTrack(e, undefined, e.clientX, e.clientY);
          },
          onPointerDown(e: NativePointerEvent) {
            if (
              e.pointerType === "mouse" &&
              (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey)
            ) {
              return;
            }

            onDownTrack(e, e.pointerId, e.clientX, e.clientY);
          },
          onTouchStart(e: NativeTouchEvent) {
            onDownTrack(
              e,
              requireValue(e.changedTouches[0], "Expected e.changedTouches[0]")
                .identifier,
              requireValue(e.changedTouches[0], "Expected e.changedTouches[0]")
                .clientX,
              requireValue(e.changedTouches[0], "Expected e.changedTouches[0]")
                .clientY
            );
          },
          style: {
            position: "relative",
            "touch-action": "none",
          },
        },
        _result3.moveProps
      );
    },
  };
}
