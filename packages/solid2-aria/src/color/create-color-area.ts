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
 * Derived from Adobe React Spectrum: packages/react-aria/src/color/useColorArea.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  ColorAreaProps,
  ColorAreaState,
} from "@solid2-aria/stately/color/create-color-area-state";
import type { ColorChannel } from "@solid2-aria/stately/color/types";
import type {
  MoveMoveEvent,
  AriaLabelingProps,
  DOMProps,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { merge, createMemo, createSignal } from "solid-js";
import type { Accessor } from "solid-js";

import intlMessages from "../../intl/color/index";
import { createLocalizedStringFormatter } from "../i18n/create-localized-string-formatter";
import { createLocale } from "../i18n/i18n-provider";
import { createFocus } from "../interactions/create-focus";
import { createFocusWithin } from "../interactions/create-focus-within";
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
import { mergeProps } from "../utils/merge-props";
import { isAndroid, isIOS } from "../utils/platform";
import { getPointerId } from "../utils/pointer-id";
import { requireValue } from "../utils/require-value";
import { getTruthyValue, isTruthy } from "../utils/truthy";
import { createVisuallyHidden } from "../visually-hidden/visually-hidden";
import { createColorAreaGradient } from "./create-color-area-gradient";

export interface AriaColorAreaProps
  extends ColorAreaProps, DOMProps, AriaLabelingProps {
  /**
   * The name of the x channel input element, used when submitting an HTML form. See
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname).
   */
  xName?: string;
  /**
   * The name of the y channel input element, used when submitting an HTML form. See
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname).
   */
  yName?: string;
  /**
   * The `<form>` element to associate the ColorArea with.
   * The value of this attribute must be the id of a `<form>` in the same document.
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#form).
   */
  form?: string;
}

export interface ColorAreaAria {
  /** Props for the color area container element. */
  colorAreaProps: DOMAttributes;
  /** Props for the thumb element. */
  thumbProps: DOMAttributes;
  /** Props for the visually hidden horizontal range input element. */
  xInputProps: InputHTMLAttributes;
  /** Props for the visually hidden vertical range input element. */
  yInputProps: InputHTMLAttributes;
}

export interface AriaColorAreaOptions extends AriaColorAreaProps {
  /** A ref to the input that represents the x axis of the color area. */
  inputXRef: Accessor<HTMLInputElement | null>;
  /** A ref to the input that represents the y axis of the color area. */
  inputYRef: Accessor<HTMLInputElement | null>;
  /** A ref to the color area containing element. */
  containerRef: Accessor<Element | null>;
}

/**
 * Provides the behavior and accessibility implementation for a color area component. Color area
 * allows users to adjust two channels of an RGB, HSL or HSB color value against a two-dimensional
 * gradient background.
 */
export function createColorArea(
  props: AriaColorAreaOptions,
  state: ColorAreaState
): ColorAreaAria {
  const _result0 = props;

  const stringFormatter = createLocalizedStringFormatter(
    intlMessages,
    "@react-aria/color"
  );

  const _result1 = createGlobalListeners();
  const _result2 = createLocale();

  const [focusedInput, setFocusedInput] = createSignal<"x" | "y" | null>(null, {
    ownedWrite: true,
  });

  const focusInput = (
    inputRef: Accessor<HTMLInputElement | null> = _result0.inputXRef
  ) => {
    const inputRefElement = inputRef();

    if (inputRefElement) {
      focusWithoutScrolling(inputRefElement);
    }
  };

  createFormReset(
    () => _result0.inputXRef(),
    () => state.defaultValue,
    state.setValue
  );

  const [valueChangedViaKeyboard, setValueChangedViaKeyboard] = createSignal(
    false,
    { ownedWrite: true }
  );

  const [valueChangedViaInputChangeEvent, setValueChangedViaInputChangeEvent] =
    createSignal(false, { ownedWrite: true });

  const _result3 = createMemo(() => state.channels);
  const xChannelStep = createMemo(() => state.xChannelStep);
  const yChannelStep = createMemo(() => state.yChannelStep);

  let currentPosition: {
    x: number;
    y: number;
  } | null = null;

  const keyboardUpdate = (
    handle1: () => void,
    inputRef: Accessor<HTMLInputElement | null>,
    input: "x" | "y"
  ) => {
    state.setDragging(true);
    setValueChangedViaKeyboard(true);
    handle1();
    state.setDragging(false);
    focusInput(inputRef);
    setFocusedInput(input);
  };

  const _result4 = createKeyboard({
    get allowRepeats(): true {
      return true;
    },
    get shortcuts() {
      return {
        End: () => {
          keyboardUpdate(
            () => {
              if (_result2.direction === "rtl") {
                state.decrementX(state.xChannelPageStep);
              } else {
                state.incrementX(state.xChannelPageStep);
              }
            },
            _result0.inputXRef,
            "x"
          );
        },
        Home: () => {
          keyboardUpdate(
            () => {
              if (_result2.direction === "rtl") {
                state.incrementX(state.xChannelPageStep);
              } else {
                state.decrementX(state.xChannelPageStep);
              }
            },
            _result0.inputXRef,
            "x"
          );
        },
        PageDown: () => {
          keyboardUpdate(
            () => {
              state.decrementY(state.yChannelPageStep);
            },
            _result0.inputYRef,
            "y"
          );
        },
        PageUp: () => {
          keyboardUpdate(
            () => {
              state.incrementY(state.yChannelPageStep);
            },
            _result0.inputYRef,
            "y"
          );
        },
      };
    },
  });

  let isOnColorArea = false;

  const moveHandler = {
    onMove({ deltaX, deltaY, pointerType, shiftKey }: MoveMoveEvent) {
      const {
        incrementX,
        decrementX,
        incrementY,
        decrementY,
        xChannelPageStep,
        xChannelStep: xChannelStepValue,
        yChannelPageStep,
        yChannelStep: yChannelStepValue,
        getThumbPosition,
        setColorFromPoint,
      } = state;

      currentPosition ??= getThumbPosition();

      const { width, height } = getTruthyValue(
        _result0.containerRef()?.getBoundingClientRect()
      ) ?? {
        height: 0,
        width: 0,
      };

      const valueChanged = deltaX !== 0 || deltaY !== 0;

      if (pointerType === "keyboard") {
        const deltaXValue =
          shiftKey && xChannelPageStep > xChannelStepValue
            ? xChannelPageStep
            : xChannelStepValue;

        const deltaYValue =
          shiftKey && yChannelPageStep > yChannelStepValue
            ? yChannelPageStep
            : yChannelStepValue;

        const logicalDeltaX = _result2.direction === "rtl" ? -deltaX : deltaX;

        if (logicalDeltaX > 0) {
          incrementX(deltaXValue);
        } else if (logicalDeltaX < 0) {
          decrementX(deltaXValue);
        } else if (deltaY > 0) {
          decrementY(deltaYValue);
        } else if (deltaY < 0) {
          incrementY(deltaYValue);
        }

        setValueChangedViaKeyboard(valueChanged);
        // set the focused input based on which axis has the greater delta

        const nextFocusedInput =
          valueChanged && Math.abs(deltaY) > Math.abs(deltaX) ? "y" : "x";

        setFocusedInput(nextFocusedInput);
      } else {
        currentPosition.x +=
          ((_result2.direction === "rtl" ? -1 : 1) * deltaX) / width;
        currentPosition.y += deltaY / height;
        setColorFromPoint(currentPosition.x, currentPosition.y);
      }
    },
    onMoveEnd() {
      isOnColorArea = false;
      state.setDragging(false);

      const input =
        focusedInput() === "x" ? _result0.inputXRef : _result0.inputYRef;

      focusInput(input);
    },
    onMoveStart() {
      currentPosition = null;
      state.setDragging(true);
    },
  };

  const _result5 = createMove(moveHandler);

  const _result6 = createFocusWithin({
    onFocusWithinChange: (focusWithin: boolean) => {
      if (!focusWithin) {
        setValueChangedViaKeyboard(false);
        setValueChangedViaInputChangeEvent(false);
      }
    },
  });

  let currentPointer: number | null | undefined = undefined;

  const _result7 = createMove({
    onMove(e) {
      if (isOnColorArea) {
        moveHandler.onMove(e);
      }
    },
    onMoveEnd() {
      if (isOnColorArea) {
        moveHandler.onMoveEnd();
      }
    },
    onMoveStart() {
      if (isOnColorArea) {
        moveHandler.onMoveStart();
      }
    },
  });

  const onThumbDown = (id?: number | null) => {
    if (!state.isDragging) {
      currentPointer = id;
      setValueChangedViaKeyboard(false);
      focusInput();
      state.setDragging(true);

      if (typeof PointerEvent === "undefined") {
        _result1.addGlobalListener(window, "mouseup", onThumbUp, false);
        _result1.addGlobalListener(window, "touchend", onThumbUp, false);
      } else {
        _result1.addGlobalListener(window, "pointerup", onThumbUp, false);
      }
    }
  };

  function onThumbUp(e: PointerEvent | TouchEvent | MouseEvent) {
    const id = getPointerId(e);

    if (id === currentPointer) {
      setValueChangedViaKeyboard(false);
      focusInput();
      state.setDragging(false);
      currentPointer = undefined;
      isOnColorArea = false;

      if (typeof PointerEvent === "undefined") {
        _result1.removeGlobalListener(window, "mouseup", onThumbUp, false);
        _result1.removeGlobalListener(window, "touchend", onThumbUp, false);
      } else {
        _result1.removeGlobalListener(window, "pointerup", onThumbUp, false);
      }
    }
  }

  const onColorAreaDown = (
    colorArea: Element,
    id: number | null | undefined,
    clientX: number,
    clientY: number
  ) => {
    const rect = colorArea.getBoundingClientRect();
    const { width, height } = rect;
    let x = (clientX - rect.x) / width;
    const y = (clientY - rect.y) / height;

    if (_result2.direction === "rtl") {
      x = 1 - x;
    }

    if (
      x >= 0 &&
      x <= 1 &&
      y >= 0 &&
      y <= 1 &&
      !state.isDragging &&
      currentPointer === undefined
    ) {
      isOnColorArea = true;
      setValueChangedViaKeyboard(false);
      currentPointer = id;
      state.setColorFromPoint(x, y);
      focusInput();
      state.setDragging(true);

      if (typeof PointerEvent === "undefined") {
        _result1.addGlobalListener(window, "mouseup", onColorAreaUp, false);
        _result1.addGlobalListener(window, "touchend", onColorAreaUp, false);
      } else {
        _result1.addGlobalListener(window, "pointerup", onColorAreaUp, false);
      }
    }
  };

  function onColorAreaUp(e: PointerEvent | TouchEvent | MouseEvent) {
    const id = getPointerId(e);

    if (isOnColorArea && id === currentPointer) {
      isOnColorArea = false;
      setValueChangedViaKeyboard(false);
      currentPointer = undefined;
      state.setDragging(false);
      focusInput();

      if (typeof PointerEvent === "undefined") {
        _result1.removeGlobalListener(window, "mouseup", onColorAreaUp, false);
        _result1.removeGlobalListener(window, "touchend", onColorAreaUp, false);
      } else {
        _result1.removeGlobalListener(
          window,
          "pointerup",
          onColorAreaUp,
          false
        );
      }
    }
  }

  const colorAreaInteractions = createMemo(() =>
    isTruthy(_result0.isDisabled)
      ? {}
      : mergeProps(
          typeof PointerEvent === "undefined"
            ? {
                onMouseDown: (e: NativeMouseEvent) => {
                  if (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey) {
                    return;
                  }

                  onColorAreaDown(
                    e.currentTarget,
                    undefined,
                    e.clientX,
                    e.clientY
                  );
                },
                onTouchStart: (e: NativeTouchEvent) => {
                  onColorAreaDown(
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

                  onColorAreaDown(
                    e.currentTarget,
                    e.pointerId,
                    e.clientX,
                    e.clientY
                  );
                },
              },
          _result7.moveProps
        )
  );

  const thumbInteractions = createMemo(() =>
    isTruthy(_result0.isDisabled)
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
          _result6.focusWithinProps,
          _result4.keyboardProps,
          _result5.moveProps
        )
  );

  const _result8 = createFocus({
    onFocus: () => {
      setFocusedInput("x");
    },
  });

  const _result9 = createFocus({
    onFocus: () => {
      setFocusedInput("y");
    },
  });

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    setValueChangedViaInputChangeEvent(true);

    if (target === _result0.inputXRef()) {
      state.setXValue(Number(target.value));
    } else if (target === _result0.inputYRef()) {
      state.setYValue(Number(target.value));
    }
  };

  const isMobile = isIOS() || isAndroid();
  const value = createMemo(() => state.getDisplayColor());

  const getAriaValueTextForChannel = (channel: ColorChannel) => {
    const isAfterInput =
      valueChangedViaInputChangeEvent() || valueChangedViaKeyboard();

    return `${
      isAfterInput
        ? stringFormatter.format("colorNameAndValue", {
            name: value().getChannelName(channel, _result2.locale),
            value: value().formatChannelValue(channel, _result2.locale),
          })
        : [
            stringFormatter.format("colorNameAndValue", {
              name: value().getChannelName(channel, _result2.locale),
              value: value().formatChannelValue(channel, _result2.locale),
            }),
            stringFormatter.format("colorNameAndValue", {
              name: value().getChannelName(
                channel === _result3().yChannel
                  ? _result3().xChannel
                  : _result3().yChannel,
                _result2.locale
              ),
              value: value().formatChannelValue(
                channel === _result3().yChannel
                  ? _result3().xChannel
                  : _result3().yChannel,
                _result2.locale
              ),
            }),
            stringFormatter.format("colorNameAndValue", {
              name: value().getChannelName(
                _result3().zChannel,
                _result2.locale
              ),
              value: value().formatChannelValue(
                _result3().zChannel,
                _result2.locale
              ),
            }),
          ].join(", ")
    }, ${value().getColorName(_result2.locale)}`;
  };

  const colorPickerLabel = createMemo(() =>
    stringFormatter.format("colorPicker")
  );

  const xInputLabellingProps = createLabels(
    merge(props, {
      get "aria-label"() {
        return ariaValue(
          ariaValue(
            isTruthy(_result0["aria-label"])
              ? stringFormatter.format("colorInputLabel", {
                  channelLabel: colorPickerLabel(),
                  label: _result0["aria-label"],
                })
              : colorPickerLabel()
          )
        );
      },
    })
  );

  const yInputLabellingProps = createLabels(
    merge(props, {
      get "aria-label"() {
        return ariaValue(
          ariaValue(
            isTruthy(_result0["aria-label"])
              ? stringFormatter.format("colorInputLabel", {
                  channelLabel: colorPickerLabel(),
                  label: _result0["aria-label"],
                })
              : colorPickerLabel()
          )
        );
      },
    })
  );

  const colorAreaLabellingProps = createLabels(
    merge(props, {
      get "aria-label"() {
        return ariaValue(
          ariaValue(
            isTruthy(_result0["aria-label"])
              ? `${_result0["aria-label"]}, ${colorPickerLabel()}`
              : undefined
          )
        );
      },
    }),
    () => (isMobile ? colorPickerLabel() : undefined)
  );

  const ariaRoleDescription = createMemo(() =>
    stringFormatter.format("twoDimensionalSlider")
  );

  const _result10 = createVisuallyHidden({
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

  const _result11 = createColorAreaGradient({
    get direction() {
      return _result2.direction;
    },
    get state() {
      return state;
    },
    get xChannel() {
      return _result3().xChannel;
    },
    get yChannel() {
      return _result3().yChannel;
    },
    get zChannel() {
      return _result3().zChannel;
    },
  });

  return {
    get colorAreaProps() {
      return merge(
        colorAreaLabellingProps,
        colorAreaInteractions(),
        _result11.colorAreaStyleProps,
        {
          get role(): "group" {
            return "group" as const;
          },
        }
      );
    },
    get thumbProps() {
      return merge(thumbInteractions(), _result11.thumbStyleProps, {
        get role(): "presentation" {
          return "presentation" as const;
        },
      });
    },
    get xInputProps() {
      return merge(
        xInputLabellingProps,
        _result10.visuallyHiddenProps,
        _result8.focusProps,
        {
          get "aria-describedby"() {
            return ariaValue(ariaValue(props["aria-describedby"]));
          },
          get "aria-details"() {
            return ariaValue(ariaValue(props["aria-details"]));
          },
          get "aria-hidden"() {
            /*
                  So that only a single "2d slider" control shows up when listing form elements for screen readers,
                  add aria-hidden="true" to the unfocused control when the value has not changed via the keyboard,
                  but remove aria-hidden to reveal the input for each channel when the value has changed with the keyboard.
                */
            return ariaValue(
              ariaValue(
                isMobile ||
                  !focusedInput() ||
                  focusedInput() === "x" ||
                  valueChangedViaKeyboard()
                  ? undefined
                  : "true"
              )
            );
          },
          get "aria-orientation"() {
            return ariaValue(ariaValue("horizontal"));
          },
          get "aria-roledescription"() {
            return ariaValue(ariaValue(ariaRoleDescription()));
          },
          get "aria-valuetext"() {
            return ariaValue(
              ariaValue(getAriaValueTextForChannel(_result3().xChannel))
            );
          },
          get defaultValue() {
            return state.value.getChannelValue(_result3().xChannel);
          },
          get disabled() {
            return _result0.isDisabled;
          },
          get form() {
            return _result0.form;
          },
          get max() {
            return state.value.getChannelRange(_result3().xChannel).maxValue;
          },
          get min() {
            return state.value.getChannelRange(_result3().xChannel).minValue;
          },
          get name() {
            return _result0.xName;
          },
          get onChange() {
            return onChange;
          },
          get step() {
            return xChannelStep();
          },
          get tabindex() {
            return isMobile || !focusedInput() || focusedInput() === "x"
              ? undefined
              : -1;
          },
          get type(): "range" {
            return "range" as const;
          },
          get value() {
            return state.value.getChannelValue(_result3().xChannel);
          },
        }
      );
    },
    get yInputProps() {
      return merge(
        yInputLabellingProps,
        _result10.visuallyHiddenProps,
        _result9.focusProps,
        {
          get "aria-describedby"() {
            return ariaValue(ariaValue(props["aria-describedby"]));
          },
          get "aria-details"() {
            return ariaValue(ariaValue(props["aria-details"]));
          },
          get "aria-hidden"() {
            /*
                  So that only a single "2d slider" control shows up when listing form elements for screen readers,
                  add aria-hidden="true" to the unfocused input when the value has not changed via the keyboard,
                  but remove aria-hidden to reveal the input for each channel when the value has changed with the keyboard.
                */
            return ariaValue(
              ariaValue(
                isMobile || focusedInput() === "y" || valueChangedViaKeyboard()
                  ? undefined
                  : "true"
              )
            );
          },
          get "aria-orientation"() {
            return ariaValue(ariaValue("vertical"));
          },
          get "aria-roledescription"() {
            return ariaValue(ariaValue(ariaRoleDescription()));
          },
          get "aria-valuetext"() {
            return ariaValue(
              ariaValue(getAriaValueTextForChannel(_result3().yChannel))
            );
          },
          get defaultValue() {
            return state.value.getChannelValue(_result3().yChannel);
          },
          get disabled() {
            return _result0.isDisabled;
          },
          get form() {
            return _result0.form;
          },
          get max() {
            return state.value.getChannelRange(_result3().yChannel).maxValue;
          },
          get min() {
            return state.value.getChannelRange(_result3().yChannel).minValue;
          },
          get name() {
            return _result0.yName;
          },
          get onChange() {
            return onChange;
          },
          get step() {
            return yChannelStep();
          },
          get tabindex() {
            return isMobile || focusedInput() === "y" ? undefined : -1;
          },
          get type(): "range" {
            return "range" as const;
          },
          get value() {
            return state.value.getChannelValue(_result3().yChannel);
          },
        }
      );
    },
  };
}
