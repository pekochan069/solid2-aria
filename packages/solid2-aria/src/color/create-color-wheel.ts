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
 * Derived from Adobe React Spectrum: packages/react-aria/src/color/useColorWheel.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  ColorWheelProps,
  ColorWheelState,
} from "@solid2-aria/stately/color/create-color-wheel-state";
import type {
  MoveMoveEvent,
  AriaLabelingProps,
  DOMProps,
  InputDOMProps,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { merge, createMemo } from "solid-js";
import type { Accessor } from "solid-js";

import { createLocale } from "../i18n/i18n-provider";
import { createKeyboard } from "../interactions/create-keyboard";
import { createMove } from "../interactions/create-move";
import type {
  MouseEvent as NativeMouseEvent,
  PointerEvent as NativePointerEvent,
  TouchEvent as NativeTouchEvent,
  ChangeEvent,
  InputHTMLAttributes,
} from "../types";
import { ariaValue } from "../utils/aria-value";
import { createFormReset } from "../utils/create-form-reset";
import { createGlobalListeners } from "../utils/create-global-listeners";
import { createLabels } from "../utils/create-labels";
import { focusWithoutScrolling } from "../utils/focus-without-scrolling";
import { isPresent } from "../utils/is-present";
import { mergeProps } from "../utils/merge-props";
import { getPointerId } from "../utils/pointer-id";
import { requireValue } from "../utils/require-value";
import { getEventTarget } from "../utils/shadowdom/dom-functions";
import { isTruthy } from "../utils/truthy";
import { createVisuallyHidden } from "../visually-hidden/visually-hidden";

export interface AriaColorWheelProps
  extends ColorWheelProps, InputDOMProps, DOMProps, AriaLabelingProps {}

export interface AriaColorWheelOptions extends AriaColorWheelProps {
  "aria-errormessage"?: string;
  /** The outer radius of the color wheel. */
  outerRadius: number;
  /** The inner radius of the color wheel. */
  innerRadius: number;
}

export interface ColorWheelAria {
  /** Props for the track element. */
  trackProps: DOMAttributes;
  /** Props for the thumb element. */
  thumbProps: DOMAttributes;
  /** Props for the visually hidden range input element. */
  inputProps: InputHTMLAttributes;
}

/**
 * Provides the behavior and accessibility implementation for a color wheel component.
 * Color wheels allow users to adjust the hue of an HSL or HSB color value on a circular track.
 */
export function createColorWheel(
  props: AriaColorWheelOptions,
  state: ColorWheelState,
  inputRef: Accessor<HTMLInputElement | null>
): ColorWheelAria {
  const _result0 = createGlobalListeners();

  const thumbRadius = createMemo(
    () => (props.innerRadius + props.outerRadius) / 2
  );

  const focusInput = () => {
    const inputRefElement = inputRef();

    if (inputRefElement) {
      focusWithoutScrolling(inputRefElement);
    }
  };

  createFormReset(inputRef, () => state.defaultValue, state.setValue);

  let currentPosition: {
    x: number;
    y: number;
  } | null = null;

  const _result1 = createKeyboard({
    get allowRepeats(): true {
      return true;
    },
    get shortcuts() {
      return {
        PageDown: () => {
          state.setDragging(true);
          state.decrement(state.pageStep);
          state.setDragging(false);
        },
        PageUp: () => {
          state.setDragging(true);
          state.increment(state.pageStep);
          state.setDragging(false);
        },
      };
    },
  });

  let isOnTrack = false;

  const moveHandler = {
    onMove({ deltaX, deltaY, pointerType, shiftKey }: MoveMoveEvent) {
      currentPosition ??= state.getThumbPosition(thumbRadius());

      currentPosition.x += deltaX;
      currentPosition.y += deltaY;

      if (pointerType === "keyboard") {
        if (deltaX > 0 || deltaY < 0) {
          state.increment(shiftKey ? state.pageStep : state.step);
        } else if (deltaX < 0 || deltaY > 0) {
          state.decrement(shiftKey ? state.pageStep : state.step);
        }
      } else {
        state.setHueFromPoint(
          currentPosition.x,
          currentPosition.y,
          thumbRadius()
        );
      }
    },
    onMoveEnd() {
      isOnTrack = false;
      state.setDragging(false);
      focusInput();
    },
    onMoveStart() {
      currentPosition = null;
      state.setDragging(true);
    },
  };

  const _result2 = createMove(moveHandler);
  let currentPointer: number | null | undefined = undefined;

  const _result3 = createMove({
    onMove(e) {
      if (isOnTrack) {
        moveHandler.onMove(e);
      }
    },
    onMoveEnd() {
      if (isOnTrack) {
        moveHandler.onMoveEnd();
      }
    },
    onMoveStart() {
      if (isOnTrack) {
        moveHandler.onMoveStart();
      }
    },
  });

  const onThumbDown = (id?: number | null) => {
    if (!state.isDragging) {
      currentPointer = id;
      focusInput();
      state.setDragging(true);

      if (typeof PointerEvent === "undefined") {
        _result0.addGlobalListener(window, "mouseup", onThumbUp, false);
        _result0.addGlobalListener(window, "touchend", onThumbUp, false);
      } else {
        _result0.addGlobalListener(window, "pointerup", onThumbUp, false);
      }
    }
  };

  function onThumbUp(e: PointerEvent | TouchEvent | MouseEvent) {
    const id = getPointerId(e);

    if (id === currentPointer) {
      focusInput();
      state.setDragging(false);
      currentPointer = undefined;
      isOnTrack = false;

      if (typeof PointerEvent === "undefined") {
        _result0.removeGlobalListener(window, "mouseup", onThumbUp, false);
        _result0.removeGlobalListener(window, "touchend", onThumbUp, false);
      } else {
        _result0.removeGlobalListener(window, "pointerup", onThumbUp, false);
      }
    }
  }

  const onTrackDown = (
    track: Element,
    id: number | null | undefined,
    pageX: number,
    pageY: number
  ) => {
    const rect = track.getBoundingClientRect();
    const x = pageX - rect.x - rect.width / 2;
    const y = pageY - rect.y - rect.height / 2;
    const radius = Math.hypot(x, y);

    if (
      props.innerRadius < radius &&
      radius < props.outerRadius &&
      !state.isDragging &&
      currentPointer === undefined
    ) {
      isOnTrack = true;
      currentPointer = id;
      state.setHueFromPoint(x, y, radius);
      focusInput();
      state.setDragging(true);

      if (typeof PointerEvent === "undefined") {
        _result0.addGlobalListener(window, "mouseup", onTrackUp, false);
        _result0.addGlobalListener(window, "touchend", onTrackUp, false);
      } else {
        _result0.addGlobalListener(window, "pointerup", onTrackUp, false);
      }
    }
  };

  function onTrackUp(e: PointerEvent | TouchEvent | MouseEvent) {
    const id = getPointerId(e);

    if (isOnTrack && id === currentPointer) {
      isOnTrack = false;
      currentPointer = undefined;
      state.setDragging(false);
      focusInput();

      if (typeof PointerEvent === "undefined") {
        _result0.removeGlobalListener(window, "mouseup", onTrackUp, false);
        _result0.removeGlobalListener(window, "touchend", onTrackUp, false);
      } else {
        _result0.removeGlobalListener(window, "pointerup", onTrackUp, false);
      }
    }
  }

  const trackInteractions = createMemo(() =>
    isTruthy(props.isDisabled)
      ? {}
      : mergeProps(
          typeof PointerEvent === "undefined"
            ? {
                onMouseDown: (e: NativeMouseEvent) => {
                  if (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey) {
                    return;
                  }

                  onTrackDown(e.currentTarget, undefined, e.clientX, e.clientY);
                },
                onTouchStart: (e: NativeTouchEvent) => {
                  onTrackDown(
                    e.currentTarget,
                    requireValue(
                      e.changedTouches[0],
                      "Expected e.changedTouches[0]"
                    ).identifier,
                    requireValue(
                      e.changedTouches[0],
                      "Expected e.changedTouches[0]"
                    ).clientX,
                    requireValue(
                      e.changedTouches[0],
                      "Expected e.changedTouches[0]"
                    ).clientY
                  );
                },
              }
            : {
                onPointerDown: (e: NativePointerEvent) => {
                  if (
                    e.pointerType === "mouse" &&
                    (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey)
                  ) {
                    return;
                  }

                  onTrackDown(
                    e.currentTarget,
                    e.pointerId,
                    e.clientX,
                    e.clientY
                  );
                },
              },
          _result3.moveProps
        )
  );

  const thumbInteractions = createMemo(() =>
    isTruthy(props.isDisabled)
      ? {}
      : mergeProps(
          typeof PointerEvent === "undefined"
            ? {
                onMouseDown: (e: NativeMouseEvent): undefined => {
                  if (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey) {
                    return;
                  }

                  onThumbDown();
                },
                onTouchStart: (e: NativeTouchEvent) => {
                  onThumbDown(
                    requireValue(
                      e.changedTouches[0],
                      "Expected e.changedTouches[0]"
                    ).identifier
                  );
                },
              }
            : {
                onPointerDown: (e: NativePointerEvent) => {
                  if (
                    e.pointerType === "mouse" &&
                    (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey)
                  ) {
                    return;
                  }

                  onThumbDown(e.pointerId);
                },
              },
          _result1.keyboardProps,
          _result2.moveProps
        )
  );

  const _result4 = createMemo(() => state.getThumbPosition(thumbRadius()));
  // Provide a default aria-label if none is given
  const _result5 = createLocale();

  const ariaLabel = createMemo(
    () =>
      props["aria-label"] ??
      (isPresent(props["aria-labelledby"])
        ? undefined
        : state.value.getChannelName("hue", _result5.locale))
  );

  const inputLabellingProps = createLabels(
    merge(props, {
      get "aria-label"() {
        return ariaValue(ariaValue(ariaLabel()));
      },
    })
  );

  const _result6 = createMemo(() => state.value.getChannelRange("hue"));

  const forcedColorAdjustNoneStyle = {
    "forced-color-adjust": "none",
  } as const;

  const _result7 = createVisuallyHidden({
    get style() {
      return {
        get height(): "100%" {
          return "100%" as const;
        },
        get opacity(): "0.0001" {
          return "0.0001" as const;
        },
        get "pointer-events"(): "none" {
          return "none" as const;
        },
        get width(): "100%" {
          return "100%" as const;
        },
      };
    },
  });

  return {
    get inputProps() {
      return mergeProps(inputLabellingProps, {
        "aria-describedby": ariaValue(props["aria-describedby"]),
        "aria-details": ariaValue(props["aria-details"]),
        "aria-errormessage": ariaValue(props["aria-errormessage"]),
        "aria-valuetext": ariaValue(
          `${state.value.formatChannelValue("hue", _result5.locale)}, ${state.value.getHueName(_result5.locale)}`
        ),
        disabled: props.isDisabled,
        form: props.form,
        max: String(_result6().maxValue),
        min: String(_result6().minValue),
        name: props.name,
        onChange: (e: ChangeEvent<HTMLInputElement>) => {
          state.setHue(Number(getEventTarget(e).value));
        },
        step: String(_result6().step),
        style: _result7.visuallyHiddenProps.style,
        type: "range" as const,
        value: `${state.value.getChannelValue("hue")}`,
      });
    },
    get thumbProps() {
      return merge(thumbInteractions(), {
        get style() {
          return merge(
            {
              get left() {
                return `${(props.outerRadius + _result4().x).toFixed(3)}px`;
              },
              get position(): "absolute" {
                return "absolute" as const;
              },
              get top() {
                return `${(props.outerRadius + _result4().y).toFixed(3)}px`;
              },
              get "touch-action"(): "none" {
                return "none" as const;
              },
              get transform(): "translate(-50%, -50%)" {
                return "translate(-50%, -50%)" as const;
              },
            },
            forcedColorAdjustNoneStyle
          );
        },
      });
    },
    get trackProps() {
      return merge(trackInteractions(), {
        get style() {
          return merge(
            {
              get background() {
                return `
          conic-gradient(
            from 90deg,
            hsl(0, 100%, 50%),
            hsl(30, 100%, 50%),
            hsl(60, 100%, 50%),
            hsl(90, 100%, 50%),
            hsl(120, 100%, 50%),
            hsl(150, 100%, 50%),
            hsl(180, 100%, 50%),
            hsl(210, 100%, 50%),
            hsl(240, 100%, 50%),
            hsl(270, 100%, 50%),
            hsl(300, 100%, 50%),
            hsl(330, 100%, 50%),
            hsl(360, 100%, 50%)
          )
        `;
              },
              get "clip-path"() {
                return `path(evenodd, "${circlePath(props.outerRadius, props.outerRadius, props.outerRadius)} ${circlePath(props.outerRadius, props.outerRadius, props.innerRadius)}")`;
              },
              get height() {
                return `${props.outerRadius * 2}px`;
              },
              get position(): "relative" {
                return "relative" as const;
              },
              get "touch-action"(): "none" {
                return "none" as const;
              },
              get width() {
                return `${props.outerRadius * 2}px`;
              },
            },
            forcedColorAdjustNoneStyle
          );
        },
      });
    },
  };
}

// Creates an SVG path string for a circle.
function circlePath(cx: number, cy: number, r: number) {
  return `M ${cx}, ${cy} m ${-r}, 0 a ${r}, ${r}, 0, 1, 0, ${r * 2}, 0 a ${r}, ${r}, 0, 1, 0 ${-r * 2}, 0`;
}
