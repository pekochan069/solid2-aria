/*
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/ColorSlider.tsx.
 * Modified for Solid Aria: composed Solid Aria and Stately primitives with Solid 2 contexts, reactive getters, and DOM refs; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createColorSlider } from "@solid2-aria/core/color/create-color-slider";
import type { AriaColorSliderProps } from "@solid2-aria/core/color/create-color-slider";
import { createLocale } from "@solid2-aria/core/i18n/i18n-provider";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { createColorSliderState } from "@solid2-aria/stately/color/create-color-slider-state";
import type { ColorSliderState } from "@solid2-aria/stately/color/create-color-slider-state";
import type { Orientation } from "@solid2-aria/types-shared";
import type { GlobalDOMAttributes } from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";
import { untrack, createSignal, merge, createContext, omit } from "solid-js";

import { InternalColorThumbContext } from "./color-thumb";
import { LabelContext } from "./label";
import {
  SliderStateContext,
  SliderTrackContext,
  SliderOutputContext,
} from "./slider";
import {
  dom,
  createContextProps,
  createRenderProps,
  createSlot,
} from "./utils";
import type { ContextValue, RenderProps, SlotProps, Ref } from "./utils";

export interface ColorSliderRenderProps {
  orientation: Orientation;
  isDisabled: boolean;
  state: ColorSliderState;
}

export interface ColorSliderProps
  extends
    Omit<AriaColorSliderProps, "label">,
    RenderProps<ColorSliderRenderProps>,
    SlotProps,
    GlobalDOMAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export const ColorSliderContext =
  createContext<ContextValue<Partial<ColorSliderProps>, HTMLDivElement>>(null);

export const ColorSliderStateContext = createContext<ColorSliderState | null>(
  null
);

export function ColorSlider(input: ColorSliderProps): JSX.Element {
  const [trackRef, setTrackRef] = createSignal<HTMLDivElement | null>(null, {
    ownedWrite: true,
  });

  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    ColorSliderContext
  );

  const locale = createLocale();

  const state = createColorSliderState(
    mergeProps(props, {
      get locale() {
        return locale.locale;
      },
    })
  );

  const [inputRef, setInputRef] = createSignal<HTMLInputElement | null>(null, {
    ownedWrite: true,
  });

  const [registerLabel, label] = createSlot(
    () =>
      (props["aria-label"]?.length ?? 0) === 0 &&
      (props["aria-labelledby"]?.length ?? 0) === 0
  );

  const aria = createColorSlider(
    mergeProps(props, {
      inputRef,
      get label() {
        return label();
      },
      trackRef,
    }),
    state
  );

  const values: ColorSliderRenderProps = {
    get isDisabled() {
      return state.isDisabled;
    },
    get orientation() {
      return state.orientation;
    },
    state,
  };

  const render = createRenderProps(
    mergeProps(props, { defaultClass: "solid2-aria-ColorSlider", values })
  );

  const thumb = {
    inputXRef: inputRef,
    get isDisabled() {
      return props.isDisabled;
    },
    setInputXRef: setInputRef,
    state,
    get thumbProps() {
      return aria.thumbProps;
    },
    get xInputProps() {
      return aria.inputProps;
    },
  };

  return (
    <ColorSliderStateContext value={state}>
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
                {
                  get children() {
                    return state.value.getChannelName(
                      props.channel,
                      locale.locale
                    );
                  },
                  registerSlot: registerLabel,
                }
              )}
            >
              <InternalColorThumbContext value={thumb}>
                <dom.div
                  {
                    // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
                    ...omit(filterDOMProps(props, { global: true }), "id")
                    // oxlint-enable solid/reactivity
                  }
                  {...render}
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
              </InternalColorThumbContext>
            </LabelContext>
          </SliderOutputContext>
        </SliderTrackContext>
      </SliderStateContext>
    </ColorSliderStateContext>
  );
}
