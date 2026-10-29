/*
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/ColorArea.tsx.
 * Modified for Solid Aria: composed Solid Aria and Stately primitives with Solid 2 contexts, reactive getters, and DOM refs; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createColorArea } from "@solid2-aria/core/color/create-color-area";
import type { AriaColorAreaProps } from "@solid2-aria/core/color/create-color-area";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { createColorAreaState } from "@solid2-aria/stately/color/create-color-area-state";
import type { ColorAreaState } from "@solid2-aria/stately/color/create-color-area-state";
import type { GlobalDOMAttributes } from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";
import { untrack, createSignal, merge, createContext, omit } from "solid-js";

import { InternalColorThumbContext } from "./color-thumb";
import { dom, createContextProps, createRenderProps } from "./utils";
import type { ContextValue, RenderProps, SlotProps, Ref } from "./utils";

export interface ColorAreaRenderProps {
  isDisabled: boolean;
  state: ColorAreaState;
}

export interface ColorAreaProps
  extends
    AriaColorAreaProps,
    RenderProps<ColorAreaRenderProps>,
    SlotProps,
    GlobalDOMAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export const ColorAreaContext =
  createContext<ContextValue<Partial<ColorAreaProps>, HTMLDivElement>>(null);

export const ColorAreaStateContext = createContext<ColorAreaState | null>(null);

export function ColorArea(input: ColorAreaProps): JSX.Element {
  const [inputXRef, setInputXRef] = createSignal<HTMLInputElement | null>(
    null,
    { ownedWrite: true }
  );

  const [inputYRef, setInputYRef] = createSignal<HTMLInputElement | null>(
    null,
    { ownedWrite: true }
  );

  const [props, ref, setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    ColorAreaContext
  );

  const state = createColorAreaState(props);

  const aria = createColorArea(
    mergeProps(props, { containerRef: ref, inputXRef, inputYRef }),
    state
  );

  const values: ColorAreaRenderProps = {
    get isDisabled() {
      return props.isDisabled ?? false;
    },
    state,
  };

  const render = createRenderProps(
    mergeProps(props, {
      defaultClass: "solid2-aria-ColorArea",
      get defaultStyle() {
        const { style } = aria.colorAreaProps;

        return typeof style === "object" ? style : undefined;
      },
      values,
    })
  );

  const thumb = {
    inputXRef,
    inputYRef,
    get isDisabled() {
      return props.isDisabled;
    },
    setInputXRef: (element: HTMLInputElement) => {
      setInputXRef(element);
    },
    setInputYRef: (element: HTMLInputElement) => {
      setInputYRef(element);
    },
    state,
    get thumbProps() {
      return aria.thumbProps;
    },
    get xInputProps() {
      return aria.xInputProps;
    },
    get yInputProps() {
      return aria.yInputProps;
    },
  };

  return (
    <dom.div
      {...mergeProps(
        omit(filterDOMProps(props, { global: true }), "id"),
        merge(() => aria.colorAreaProps),
        render
      )}
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
      <ColorAreaStateContext value={state}>
        <InternalColorThumbContext value={thumb}>
          {render.children}
        </InternalColorThumbContext>
      </ColorAreaStateContext>
    </dom.div>
  );
}
