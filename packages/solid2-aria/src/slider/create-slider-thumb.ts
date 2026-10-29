/*
 * Derived from Adobe React Spectrum: packages/react-aria/src/slider/useSliderThumb.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { SliderState } from "@solid2-aria/stately/slider/create-slider-state";
import { clamp } from "@solid2-aria/stately/utils/number";
import type {
  MoveMoveEvent,
  AriaLabelingProps,
  AriaValidationProps,
  DOMProps,
  FocusableDOMProps,
  FocusableProps,
  InputDOMProps,
  LabelableProps,
  Orientation,
  ValidationState,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { merge, createMemo, createEffect } from "solid-js";
import type { Accessor } from "solid-js";

import { createLocale } from "../i18n/i18n-provider";
import { createFocusable } from "../interactions/create-focusable";
import { createKeyboard } from "../interactions/create-keyboard";
import { createMove } from "../interactions/create-move";
import { createLabel } from "../label/create-label";
import type {
  MouseEvent as NativeMouseEvent,
  PointerEvent as NativePointerEvent,
  TouchEvent as NativeTouchEvent,
  ChangeEvent,
  InputHTMLAttributes,
  LabelHTMLAttributes,
} from "../types";
import { ariaValue } from "../utils/aria-value";
import { createFormReset } from "../utils/create-form-reset";
import { createGlobalListeners } from "../utils/create-global-listeners";
import { focusWithoutScrolling } from "../utils/focus-without-scrolling";
import { getLegacyOption } from "../utils/legacy-option";
import { mergeProps } from "../utils/merge-props";
import { getPointerId } from "../utils/pointer-id";
import { requireValue } from "../utils/require-value";
import { getEventTarget } from "../utils/shadowdom/dom-functions";
import { getTruthyValue } from "../utils/truthy";
import { getSliderThumbId, sliderData } from "./utils";

export interface SliderThumbProps extends FocusableProps, LabelableProps {
  /**
   * The orientation of the Slider.
   *
   * @deprecated - pass to the slider instead.
   * @default 'horizontal'
   */
  orientation?: Orientation;
  /** Whether the Thumb is disabled. */
  isDisabled?: boolean;
  /**
   * Index of the thumb within the slider.
   *
   * @default 0
   */
  index?: number;
  /** @deprecated */
  isRequired?: boolean;
  /** @deprecated */
  isInvalid?: boolean;
  /** @deprecated */
  validationState?: ValidationState;
}

export interface AriaSliderThumbProps
  extends
    SliderThumbProps,
    DOMProps,
    Omit<FocusableDOMProps, "excludeFromTabOrder">,
    InputDOMProps,
    AriaLabelingProps,
    AriaValidationProps {}

export interface SliderThumbAria {
  /** Props for the root thumb element; handles the dragging motion. */
  thumbProps: DOMAttributes;
  /** Props for the visually hidden range input element. */
  inputProps: InputHTMLAttributes;
  /** Props for the label element for this thumb (optional). */
  labelProps: LabelHTMLAttributes;
  /** Whether this thumb is currently being dragged. */
  isDragging: boolean;
  /** Whether the thumb is currently focused. */
  isFocused: boolean;
  /** Whether the thumb is disabled. */
  isDisabled: boolean;
}

export interface AriaSliderThumbOptions extends AriaSliderThumbProps {
  /** A ref to the track element. */
  trackRef: Accessor<Element | null>;
  /** A ref to the thumb input element. */
  inputRef: Accessor<HTMLInputElement | null>;
}

/**
 * Provides behavior and accessibility for a thumb of a slider component.
 *
 * @param opts Options for this Slider thumb.
 * @param state Slider state, created via `useSliderState`.
 */
export function createSliderThumb(
  opts: AriaSliderThumbOptions,
  state: SliderState
): SliderThumbAria {
  const _result0 = opts;

  const isDisabled = createMemo(
    () => getTruthyValue(opts.isDisabled) ?? state.isDisabled
  );

  const isVertical = createMemo(
    () =>
      (getLegacyOption(_result0, "orientation") ?? state.orientation) ===
      "vertical"
  );

  const _result1 = createLocale();
  const _result2 = createGlobalListeners();

  const data = createMemo(() =>
    requireValue(sliderData.get(state), "Expected sliderData.get(state)")
  );

  const _result3 = createLabel(
    merge(opts, {
      get "aria-labelledby"() {
        return ariaValue(
          ariaValue(`${data().id} ${opts["aria-labelledby"] ?? ""}`.trim())
        );
      },
      get id() {
        return getSliderThumbId(state, _result0.index ?? 0);
      },
    })
  );

  const value = createMemo(() => state.values[_result0.index ?? 0]);

  const focusInput = () => {
    const result0inputRefElement = _result0.inputRef();

    if (result0inputRefElement) {
      focusWithoutScrolling(result0inputRefElement);
    }
  };

  const isFocused = createMemo(
    () => state.focusedThumb === (_result0.index ?? 0)
  );

  createEffect(
    () => ({ input1: focusInput, isFocused: isFocused() }),
    ({ input1, isFocused: currentIsFocused }) => {
      if (currentIsFocused) {
        input1();
      }
    },
    { ssrSource: "client" }
  );
  const reverseX = createMemo(() => _result1.direction === "rtl");
  let currentPosition: number | null = null;

  const keyboardUpdate = (handle1: () => void) => {
    // remember to set this so that onChangeEnd is fired
    state.setThumbDragging(_result0.index ?? 0, true);
    handle1();
    state.setThumbDragging(_result0.index ?? 0, false);
  };

  const _result4 = createKeyboard({
    get allowRepeats(): true {
      return true;
    },
    get shortcuts() {
      return {
        End: () => {
          keyboardUpdate(() => {
            state.setThumbValue(
              _result0.index ?? 0,
              state.getThumbMaxValue(_result0.index ?? 0)
            );
          });
        },
        Home: () => {
          keyboardUpdate(() => {
            state.setThumbValue(
              _result0.index ?? 0,
              state.getThumbMinValue(_result0.index ?? 0)
            );
          });
        },
        PageDown: () => {
          keyboardUpdate(() => {
            state.decrementThumb(_result0.index ?? 0, state.pageSize);
          });
        },
        PageUp: () => {
          keyboardUpdate(() => {
            state.incrementThumb(_result0.index ?? 0, state.pageSize);
          });
        },
      };
    },
  });

  const _result5 = createMove({
    onMove({ deltaX, deltaY, pointerType, shiftKey }: MoveMoveEvent) {
      const result0trackRefElement = _result0.trackRef();

      const {
        getThumbPercent,
        setThumbPercent,
        decrementThumb,
        incrementThumb,
        step,
        pageSize,
      } = state;

      if (!result0trackRefElement) {
        return;
      }

      const { width, height } = result0trackRefElement.getBoundingClientRect();

      const size = isVertical() ? height : width;

      currentPosition ??= getThumbPercent(_result0.index ?? 0) * size;

      if (pointerType === "keyboard") {
        if (
          (deltaX > 0 && reverseX()) ||
          (deltaX < 0 && !reverseX()) ||
          deltaY > 0
        ) {
          decrementThumb(_result0.index ?? 0, shiftKey ? pageSize : step);
        } else {
          incrementThumb(_result0.index ?? 0, shiftKey ? pageSize : step);
        }
      } else {
        let delta = isVertical() ? deltaY : deltaX;

        if (isVertical() || reverseX()) {
          delta = -delta;
        }

        currentPosition += delta;
        setThumbPercent(
          _result0.index ?? 0,
          clamp(currentPosition / size, 0, 1)
        );
      }
    },
    onMoveEnd() {
      state.setThumbDragging(_result0.index ?? 0, false);
    },
    onMoveStart() {
      currentPosition = null;
      state.setThumbDragging(_result0.index ?? 0, true);
    },
  });

  createEffect(
    () => ({ editable: !isDisabled(), index: _result0.index ?? 0 }),
    ({ index, editable }) => {
      state.setThumbEditable(index, editable);
    }
  );

  const _result6 = createFocusable(
    mergeProps(opts, {
      onBlur: () => {
        state.setFocusedThumb(undefined);
      },
      onFocus: () => {
        state.setFocusedThumb(_result0.index ?? 0);
      },
    }),
    _result0.inputRef
  );

  let currentPointer: number | undefined = undefined;

  const onDown = (id?: number) => {
    focusInput();
    currentPointer = id;
    state.setThumbDragging(_result0.index ?? 0, true);
    _result2.addGlobalListener(window, "mouseup", onUp, false);
    _result2.addGlobalListener(window, "touchend", onUp, false);
    _result2.addGlobalListener(window, "pointerup", onUp, false);
  };

  function onUp(e: PointerEvent | TouchEvent | MouseEvent) {
    const id = getPointerId(e);

    if (id === currentPointer) {
      focusInput();
      state.setThumbDragging(_result0.index ?? 0, false);
      _result2.removeGlobalListener(window, "mouseup", onUp, false);
      _result2.removeGlobalListener(window, "touchend", onUp, false);
      _result2.removeGlobalListener(window, "pointerup", onUp, false);
    }
  }

  const thumbPosition = createMemo(() => {
    const percent = state.getThumbPercent(_result0.index ?? 0);

    return isVertical() || _result1.direction === "rtl" ? 1 - percent : percent;
  });

  const interactions = createMemo(() =>
    isDisabled()
      ? {}
      : mergeProps(_result4.keyboardProps, _result5.moveProps, {
          onMouseDown: (e: NativeMouseEvent) => {
            if (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey) {
              return;
            }

            onDown();
          },
          onPointerDown: (e: NativePointerEvent) => {
            if (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey) {
              return;
            }

            onDown(e.pointerId);
          },
          onTouchStart: (e: NativeTouchEvent) => {
            onDown(
              requireValue(e.changedTouches[0], "Expected e.changedTouches[0]")
                .identifier
            );
          },
        })
  );

  createFormReset(
    () => _result0.inputRef(),
    () =>
      requireValue(
        state.defaultValues[_result0.index ?? 0],
        "Expected state.defaultValues[_result0.index ?? 0]"
      ),
    (v) => {
      state.setThumbValue(_result0.index ?? 0, v);
    }
  );

  // We install mouse handlers for the drag motion on the thumb div, but
  // not the key handler for moving the thumb with the slider.  Instead,
  // we focus the range input, and let the browser handle the keyboard
  // interactions; we then listen to input's onChange to update state.
  return {
    get inputProps() {
      return mergeProps(_result6.focusableProps, _result3.fieldProps, {
        "aria-describedby": ariaValue(
          [data()["aria-describedby"], opts["aria-describedby"]]
            .filter(Boolean)
            .join(" ")
        ),
        "aria-details": ariaValue(
          [data()["aria-details"], opts["aria-details"]]
            .filter(Boolean)
            .join(" ")
        ),
        "aria-errormessage": ariaValue(opts["aria-errormessage"]),
        "aria-invalid": ariaValue(
          getTruthyValue(
            getTruthyValue(getLegacyOption(_result0, "isInvalid")) ??
              getLegacyOption(_result0, "validationState") === "invalid"
          ) ?? undefined
        ),
        "aria-orientation": ariaValue(
          getLegacyOption(_result0, "orientation") ?? state.orientation
        ),
        "aria-required": ariaValue(
          getTruthyValue(getLegacyOption(_result0, "isRequired")) ?? undefined
        ),
        "aria-valuetext": ariaValue(
          state.getThumbValueLabel(_result0.index ?? 0)
        ),
        defaultValue: value(),
        disabled: isDisabled(),
        form: _result0.form,
        max: state.getThumbMaxValue(_result0.index ?? 0),
        min: state.getThumbMinValue(_result0.index ?? 0),
        name: _result0.name,
        onChange: (e: ChangeEvent<HTMLInputElement>) => {
          state.setThumbValue(
            _result0.index ?? 0,
            Number(getEventTarget(e).value)
          );
        },
        step: state.step,
        tabindex: isDisabled() ? undefined : 0,
        type: "range" as const,
        value: value(),
      });
    },
    get isDisabled() {
      return isDisabled();
    },
    get isDragging() {
      return state.isThumbDragging(_result0.index ?? 0);
    },
    get isFocused() {
      return isFocused();
    },
    get labelProps() {
      return _result3.labelProps;
    },
    get thumbProps() {
      return merge(interactions(), {
        get style() {
          return {
            get position(): "absolute" {
              return "absolute" as const;
            },
            get [isVertical() ? "top" : "left"]() {
              return `${thumbPosition() * 100}%`;
            },
            get "touch-action"(): "none" {
              return "none" as const;
            },
            get transform(): "translate(-50%, -50%)" {
              return "translate(-50%, -50%)" as const;
            },
          };
        },
      });
    },
  };
}
