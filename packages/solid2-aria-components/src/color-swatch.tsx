/*
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/ColorSwatch.tsx.
 * Modified for Solid Aria: composed Solid Aria and Stately primitives with Solid 2 contexts, reactive getters, and DOM refs; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createColorSwatch } from "@solid2-aria/core/color/create-color-swatch";
import type { AriaColorSwatchProps } from "@solid2-aria/core/color/create-color-swatch";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import type { Color } from "@solid2-aria/stately/color/types";
import type { GlobalDOMAttributes } from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";
import { untrack, merge, createContext } from "solid-js";

import { dom, createContextProps, createRenderProps } from "./utils";
import type { ContextValue, StyleRenderProps, SlotProps, Ref } from "./utils";

export interface ColorSwatchRenderProps {
  color: Color;
}

export interface ColorSwatchProps
  extends
    AriaColorSwatchProps,
    StyleRenderProps<ColorSwatchRenderProps>,
    SlotProps,
    GlobalDOMAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export const ColorSwatchContext =
  createContext<ContextValue<ColorSwatchProps, HTMLDivElement>>(null);

export function ColorSwatch(input: ColorSwatchProps): JSX.Element {
  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    ColorSwatchContext
  );

  const aria = createColorSwatch(props);

  const render = createRenderProps(
    mergeProps(props, {
      defaultClass: "solid2-aria-ColorSwatch",
      get defaultStyle() {
        const { style } = aria.colorSwatchProps;

        return style !== null && typeof style === "object" ? style : undefined;
      },
      values: {
        get color() {
          return aria.color;
        },
      },
    })
  );

  return (
    <dom.div
      {...mergeProps(
        filterDOMProps(props, { global: true }),
        merge(() => aria.colorSwatchProps),
        render
      )}
      slot={
        typeof props.slot === "string" && props.slot.length > 0
          ? props.slot
          : undefined
      }
      ref={(element: HTMLDivElement) => {
        setRef(element);
      }}
    />
  );
}
