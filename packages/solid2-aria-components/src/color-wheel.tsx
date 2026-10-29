/*
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/ColorWheel.tsx.
 * Modified for Solid Aria: composed Solid Aria and Stately primitives with Solid 2 contexts, reactive getters, and DOM refs; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createColorWheel } from "@solid2-aria/core/color/create-color-wheel";
import type { AriaColorWheelOptions } from "@solid2-aria/core/color/create-color-wheel";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { requireValue } from "@solid2-aria/core/utils/require-value";
import { createColorWheelState } from "@solid2-aria/stately/color/create-color-wheel-state";
import type { ColorWheelState } from "@solid2-aria/stately/color/create-color-wheel-state";
import type { GlobalDOMAttributes } from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";
import {
  untrack,
  createSignal,
  merge,
  createContext,
  omit,
  useContext,
} from "solid-js";

import { InternalColorThumbContext } from "./color-thumb";
import { dom, createContextProps, createRenderProps } from "./utils";
import type {
  ContextValue,
  RenderProps,
  SlotProps,
  Ref,
  StyleRenderProps,
} from "./utils";

export interface ColorWheelRenderProps {
  isDisabled: boolean;
  state: ColorWheelState;
}

export interface ColorWheelProps
  extends
    AriaColorWheelOptions,
    RenderProps<ColorWheelRenderProps>,
    SlotProps,
    GlobalDOMAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export type ColorWheelTrackRenderProps = ColorWheelRenderProps;

export interface ColorWheelTrackProps
  extends
    StyleRenderProps<ColorWheelTrackRenderProps>,
    GlobalDOMAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

type TrackContext = Omit<
  ColorWheelTrackProps,
  keyof JSX.HTMLAttributes<HTMLDivElement>
> &
  Omit<
    JSX.HTMLAttributes<HTMLDivElement>,
    "ref" | "class" | "style" | "children"
  > &
  Pick<ColorWheelTrackProps, "class" | "style">;

export const ColorWheelContext =
  createContext<ContextValue<Partial<ColorWheelProps>, HTMLDivElement>>(null);

export const ColorWheelStateContext = createContext<ColorWheelState | null>(
  null
);

export const ColorWheelTrackContext =
  createContext<ContextValue<TrackContext, HTMLDivElement>>(null);

export function ColorWheel(input: ColorWheelProps): JSX.Element {
  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    ColorWheelContext
  );

  const state = createColorWheelState(props);

  const [inputRef, setInputRef] = createSignal<HTMLInputElement | null>(null, {
    ownedWrite: true,
  });

  const aria = createColorWheel(props, state, inputRef);

  const values: ColorWheelRenderProps = {
    get isDisabled() {
      return props.isDisabled ?? false;
    },
    state,
  };

  const render = createRenderProps(
    mergeProps(props, {
      defaultClass: "solid2-aria-ColorWheel",
      defaultStyle: { position: "relative" as const },
      values,
    })
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
      data-disabled={props.isDisabled === true ? true : undefined}
    >
      <ColorWheelStateContext value={state}>
        <ColorWheelTrackContext
          value={
            // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
            merge(() => aria.trackProps)
            // oxlint-enable solid/reactivity
          }
        >
          <InternalColorThumbContext value={thumb}>
            {render.children}
          </InternalColorThumbContext>
        </ColorWheelTrackContext>
      </ColorWheelStateContext>
    </dom.div>
  );
}

export function ColorWheelTrack(input: ColorWheelTrackProps): JSX.Element {
  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    ColorWheelTrackContext
  );

  const state = requireValue(
    useContext(ColorWheelStateContext),
    "Expected required component value"
  );

  const render = createRenderProps(
    mergeProps(props, {
      defaultClass: "solid2-aria-ColorWheelTrack",
      values: {
        get isDisabled() {
          return state.isDisabled;
        },
        state,
      },
    })
  );

  return (
    <dom.div
      {
        // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
        ...omit(props, "ref")
        // oxlint-enable solid/reactivity
      }
      {...render}
      ref={(element: HTMLDivElement) => {
        setRef(element);
      }}
      data-disabled={state.isDisabled || undefined}
    />
  );
}
