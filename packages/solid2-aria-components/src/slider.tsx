/*
 * Copyright 2022 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/Slider.tsx.
 * Modified for Solid Aria: composed Solid Aria and Stately primitives with Solid 2 contexts, reactive getters, and DOM refs; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createFocusRing } from "@solid2-aria/core/focus/create-focus-ring";
import { createNumberFormatter } from "@solid2-aria/core/i18n/create-number-formatter";
import { createHover } from "@solid2-aria/core/interactions/create-hover";
import { createSlider } from "@solid2-aria/core/slider/create-slider";
import type { AriaSliderProps } from "@solid2-aria/core/slider/create-slider";
import { createSliderThumb } from "@solid2-aria/core/slider/create-slider-thumb";
import type { AriaSliderThumbProps } from "@solid2-aria/core/slider/create-slider-thumb";
import type { CSSProperties } from "@solid2-aria/core/types";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { requireValue } from "@solid2-aria/core/utils/require-value";
import { VisuallyHidden } from "@solid2-aria/core/visually-hidden/visually-hidden";
import { createSliderState } from "@solid2-aria/stately/slider/create-slider-state";
import type {
  SliderStateOptions,
  SliderState,
} from "@solid2-aria/stately/slider/create-slider-state";
import type { HoverEvents, Orientation } from "@solid2-aria/types-shared";
import type { GlobalDOMAttributes } from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";
import {
  untrack,
  createSignal,
  merge,
  createContext,
  createMemo,
  omit,
  useContext,
} from "solid-js";
import type { Accessor } from "solid-js";

import { LabelContext } from "./label";
import {
  assignRef,
  dom,
  createContextProps,
  createRenderProps,
  createSlot,
  createSlottedContext,
} from "./utils";
import type { ContextValue, RenderProps, SlotProps, Ref } from "./utils";

export interface SliderRenderProps {
  orientation: Orientation;
  isDisabled: boolean;
  state: SliderState;
}

export interface SliderProps<T = number | number[]>
  extends
    Omit<AriaSliderProps<T>, "label">,
    RenderProps<SliderRenderProps>,
    SlotProps,
    GlobalDOMAttributes<HTMLDivElement> {
  formatOptions?: Intl.NumberFormatOptions;
  ref?: Ref<HTMLDivElement>;
}

export interface SliderTrackRenderProps extends SliderRenderProps {
  isHovered: boolean;
}

export interface SliderTrackProps
  extends
    HoverEvents,
    RenderProps<SliderTrackRenderProps>,
    GlobalDOMAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export interface SliderOutputProps
  extends
    RenderProps<SliderRenderProps, "output">,
    GlobalDOMAttributes<HTMLOutputElement> {
  ref?: Ref<HTMLOutputElement>;
}

export interface SliderThumbRenderProps {
  state: SliderState;
  isDragging: boolean;
  isHovered: boolean;
  isFocused: boolean;
  isFocusVisible: boolean;
  isDisabled: boolean;
}

export interface SliderThumbProps
  extends
    Omit<AriaSliderThumbProps, "label" | "validationState">,
    HoverEvents,
    RenderProps<SliderThumbRenderProps>,
    GlobalDOMAttributes<HTMLDivElement> {
  inputRef?: Ref<HTMLInputElement>;
  ref?: Ref<HTMLDivElement>;
}

export interface SliderFillRenderProps extends SliderRenderProps {
  isHovered: boolean;
}

export interface SliderFillProps
  extends
    HoverEvents,
    RenderProps<SliderFillRenderProps>,
    GlobalDOMAttributes<HTMLDivElement> {
  offset?: number;
  ref?: Ref<HTMLDivElement>;
}

type TrackContext = Omit<
  SliderTrackProps,
  keyof JSX.HTMLAttributes<HTMLDivElement>
> &
  Omit<
    JSX.HTMLAttributes<HTMLDivElement>,
    "ref" | "class" | "style" | "children"
  > &
  Pick<SliderTrackProps, "class" | "style" | "children"> & {
    trackRef: Accessor<HTMLDivElement | null>;
  };

type OutputContext = Omit<
  SliderOutputProps,
  keyof JSX.OutputHTMLAttributes<HTMLOutputElement>
> &
  Omit<
    JSX.OutputHTMLAttributes<HTMLOutputElement>,
    "ref" | "class" | "style" | "children"
  > &
  Pick<SliderOutputProps, "class" | "style" | "children">;

export const SliderContext =
  createContext<ContextValue<SliderProps, HTMLDivElement>>(null);

export const SliderStateContext = createContext<SliderState | null>(null);

export const SliderTrackContext =
  createContext<ContextValue<TrackContext, HTMLDivElement>>(null);

export const SliderFillContext =
  createContext<ContextValue<SliderFillProps, HTMLDivElement>>(null);

export const SliderOutputContext =
  createContext<ContextValue<OutputContext, HTMLOutputElement>>(null);

function sliderValues(state: SliderState): SliderRenderProps {
  return {
    get isDisabled() {
      return state.isDisabled;
    },
    get orientation() {
      return state.orientation;
    },
    state,
  };
}

export function Slider<T extends number | number[]>(
  input: SliderProps<T>
): JSX.Element {
  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    SliderContext
  );

  const [trackRef, setTrackRef] = createSignal<HTMLDivElement | null>(null, {
    ownedWrite: true,
  });

  const formatter = createNumberFormatter(
    merge(() => props.formatOptions ?? {})
  );

  // SAFETY: Slider state preserves the scalar or array form of the supplied value for every callback.
  // oxlint-disable-next-line anti-slop/no-chained-type-assertions, typescript/no-unsafe-type-assertion -- The generic public callback is widened only for the internal state factory.
  const options = mergeProps(props, {
    numberFormatter: formatter,
  }) as unknown as SliderStateOptions;

  const state = createSliderState(options);

  const [registerLabel, label] = createSlot(
    () =>
      (props["aria-label"]?.length ?? 0) === 0 &&
      (props["aria-labelledby"]?.length ?? 0) === 0
  );

  const aria = createSlider(
    mergeProps(props, {
      get label() {
        return label();
      },
    }),
    state,
    trackRef
  );

  const render = createRenderProps(
    mergeProps(props, {
      defaultClass: "solid2-aria-Slider",
      values: sliderValues(state),
    })
  );

  return (
    <SliderStateContext value={state}>
      <SliderTrackContext
        value={mergeProps(
          merge(() => aria.trackProps),
          {
            ref: (element: HTMLDivElement) => {
              setTrackRef(element);
            },
            trackRef,
          }
        )}
      >
        <SliderOutputContext
          value={
            // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
            merge(() => aria.outputProps)
            // oxlint-enable solid/reactivity
          }
        >
          <LabelContext
            value={mergeProps(
              merge(() => aria.labelProps),
              { registerSlot: registerLabel }
            )}
          >
            <dom.div
              {...mergeProps(
                omit(filterDOMProps(props, { global: true }), "id"),
                render,
                merge(() => aria.groupProps)
              )}
              ref={(element: HTMLDivElement) => {
                setRef(element);
              }}
              slot={
                typeof props.slot === "string" && props.slot.length > 0
                  ? props.slot
                  : undefined
              }
              data-orientation={state.orientation}
              data-disabled={state.isDisabled || undefined}
            >
              {render.children}
            </dom.div>
          </LabelContext>
        </SliderOutputContext>
      </SliderTrackContext>
    </SliderStateContext>
  );
}

export function SliderOutput(input: SliderOutputProps): JSX.Element {
  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    SliderOutputContext
  );

  const state = requireValue(
    useContext(SliderStateContext),
    "Expected required component value"
  );

  const render = createRenderProps(
    mergeProps(props, {
      get defaultChildren() {
        return state.getFormattedValue();
      },
      defaultClass: "solid2-aria-SliderOutput",
      values: sliderValues(state),
    })
  );

  return (
    <dom.output
      {
        // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
        ...omit(props, "ref")
        // oxlint-enable solid/reactivity
      }
      {...render}
      ref={(element: HTMLOutputElement) => {
        setRef(element);
      }}
      data-orientation={state.orientation}
      data-disabled={state.isDisabled || undefined}
    >
      {render.children}
    </dom.output>
  );
}

export function SliderTrack(input: SliderTrackProps): JSX.Element {
  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    SliderTrackContext
  );

  const state = requireValue(
    useContext(SliderStateContext),
    "Expected required component value"
  );

  const hover = createHover(props);

  const render = createRenderProps(
    mergeProps(props, {
      defaultClass: "solid2-aria-SliderTrack",
      values: mergeProps(sliderValues(state), {
        get isHovered() {
          return hover.isHovered;
        },
      }),
    })
  );

  return (
    <dom.div
      {...mergeProps(
        omit(props, "onHoverStart", "onHoverEnd", "onHoverChange", "ref"),
        merge(() => hover.hoverProps ?? {}),
        render
      )}
      ref={(element: HTMLDivElement) => {
        setRef(element);
      }}
      data-hovered={hover.isHovered || undefined}
      data-orientation={state.orientation}
      data-disabled={state.isDisabled || undefined}
    >
      {render.children}
    </dom.div>
  );
}

export function SliderThumb(props: SliderThumbProps): JSX.Element {
  const [inputRef, setInputRef] = createSignal<HTMLInputElement | null>(null, {
    ownedWrite: true,
  });

  const state = requireValue(
    useContext(SliderStateContext),
    "Expected required component value"
  );

  const track = requireValue(
    createSlottedContext(SliderTrackContext),
    "Expected required component value"
  );

  const trackRef = untrack(() => track.trackRef);

  const [registerLabel, label] = createSlot(
    () =>
      (props["aria-label"]?.length ?? 0) === 0 &&
      (props["aria-labelledby"]?.length ?? 0) === 0
  );

  const aria = createSliderThumb(
    mergeProps(props, {
      get index() {
        return props.index ?? 0;
      },
      inputRef,
      get label() {
        return label();
      },
      trackRef,
    }),
    state
  );

  const focus = createFocusRing();
  const hover = createHover(props);

  const values: SliderThumbRenderProps = {
    get isDisabled() {
      return aria.isDisabled;
    },
    get isDragging() {
      return aria.isDragging;
    },
    get isFocusVisible() {
      return focus.isFocusVisible;
    },
    get isFocused() {
      return aria.isFocused;
    },
    get isHovered() {
      return hover.isHovered;
    },
    state,
  };

  const render = createRenderProps(
    mergeProps(props, {
      defaultClass: "solid2-aria-SliderThumb",
      get defaultStyle() {
        const { style } = aria.thumbProps;

        return typeof style === "object" ? style : undefined;
      },
      values,
    })
  );

  return (
    <dom.div
      {...mergeProps(
        omit(filterDOMProps(props, { global: true }), "id"),
        merge(() => aria.thumbProps),
        merge(() => hover.hoverProps ?? {}),
        render
      )}
      ref={(element: HTMLDivElement) => {
        assignRef(
          untrack(() => props.ref),
          element
        );
      }}
      data-hovered={hover.isHovered || undefined}
      data-dragging={aria.isDragging || undefined}
      data-focused={aria.isFocused || undefined}
      data-focus-visible={focus.isFocusVisible || undefined}
      data-disabled={aria.isDisabled || undefined}
    >
      <VisuallyHidden>
        <input
          {...mergeProps(
            merge(() => aria.inputProps),
            merge(() => focus.focusProps ?? {})
          )}
          ref={[
            (element: HTMLInputElement) => {
              setInputRef(element);
            },
            (element: HTMLInputElement) => {
              assignRef(
                untrack(() => props.inputRef),
                element
              );
            },
          ]}
        />
      </VisuallyHidden>
      <LabelContext
        value={mergeProps(
          merge(() => aria.labelProps),
          { registerSlot: registerLabel }
        )}
      >
        {render.children}
      </LabelContext>
    </dom.div>
  );
}

export function SliderFill(input: SliderFillProps): JSX.Element {
  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    SliderFillContext
  );

  const state = requireValue(
    useContext(SliderStateContext),
    "Expected required component value"
  );

  const hover = createHover(props);

  const geometry = createMemo(() => {
    const offset = Math.min(
      state.getThumbMaxValue(0),
      Math.max(
        state.getThumbMinValue(0),
        props.offset ?? state.getThumbMinValue(0)
      )
    );

    const start =
      state.values.length > 1
        ? state.getThumbPercent(0)
        : state.getValuePercent(offset);

    const end = state.values.length
      ? state.getThumbPercent(state.values.length - 1)
      : 0;

    return {
      size: Math.max(0, Math.abs(end - start)) * 100,
      start: Math.min(start, end) * 100,
    };
  });

  const render = createRenderProps(
    mergeProps(props, {
      defaultClass: "solid2-aria-SliderFill",
      get defaultStyle(): CSSProperties {
        const g = geometry();

        return state.orientation === "vertical"
          ? {
              bottom: `${g.start}%`,
              height: `${g.size}%`,
              position: "absolute",
              width: "100%",
            }
          : {
              height: "100%",
              "inset-inline-start": `${g.start}%`,
              position: "absolute",
              width: `${g.size}%`,
            };
      },
      values: mergeProps(sliderValues(state), {
        get isHovered() {
          return hover.isHovered;
        },
      }),
    })
  );

  return (
    <dom.div
      {...mergeProps(
        omit(
          props,
          "offset",
          "ref",
          "onHoverStart",
          "onHoverEnd",
          "onHoverChange"
        ),
        merge(() => hover.hoverProps ?? {}),
        render
      )}
      ref={(element: HTMLDivElement) => {
        setRef(element);
      }}
      data-hovered={hover.isHovered || undefined}
      data-orientation={state.orientation}
      data-disabled={state.isDisabled || undefined}
    >
      {render.children}
    </dom.div>
  );
}
