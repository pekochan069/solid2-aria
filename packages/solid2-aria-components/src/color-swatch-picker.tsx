/*
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/ColorSwatchPicker.tsx.
 * Modified for Solid Aria: composed Solid Aria and Stately primitives with Solid 2 contexts, reactive getters, and DOM refs; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createLocalizedStringFormatter } from "@solid2-aria/core/i18n/create-localized-string-formatter";
import { createLocale } from "@solid2-aria/core/i18n/i18n-provider";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { requireValue } from "@solid2-aria/core/utils/require-value";
import { parseColor } from "@solid2-aria/stately/color/color";
import { createColorPickerState } from "@solid2-aria/stately/color/create-color-picker-state";
import type { Color } from "@solid2-aria/stately/color/types";
import type {
  AriaLabelingProps,
  HoverEvents,
  PressEvents,
  ValueBase,
} from "@solid2-aria/types-shared";
import type { GlobalDOMAttributes } from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";
import {
  untrack,
  createContext,
  createMemo,
  createEffect,
  useContext,
  omit,
} from "solid-js";

import intlMessages from "../intl/index";
import { ColorSwatchContext } from "./color-swatch";
import { ListBox, ListBoxItem } from "./list-box";
import type { ListBoxRenderProps, ListBoxItemRenderProps } from "./list-box";
import { createContextProps, assignRef } from "./utils";
import type { ContextValue, RenderProps, StyleRenderProps, Ref } from "./utils";

export type ColorSwatchPickerRenderProps = Omit<
  ListBoxRenderProps,
  "isDropTarget"
>;

export interface ColorSwatchPickerProps
  extends
    ValueBase<string | Color, Color>,
    AriaLabelingProps,
    StyleRenderProps<ColorSwatchPickerRenderProps>,
    GlobalDOMAttributes<HTMLDivElement> {
  children?: JSX.Element;
  layout?: "grid" | "stack";
  ref?: Ref<HTMLDivElement>;
}

export interface ColorSwatchPickerItemRenderProps extends Omit<
  ListBoxItemRenderProps,
  "selectionMode" | "selectionBehavior"
> {
  color: Color;
}

export interface ColorSwatchPickerItemProps
  extends
    RenderProps<ColorSwatchPickerItemRenderProps>,
    HoverEvents,
    PressEvents,
    Omit<GlobalDOMAttributes<HTMLDivElement>, "onClick"> {
  color: string | Color;
  isDisabled?: boolean;
  ref?: Ref<HTMLDivElement>;
}

export const ColorSwatchPickerContext =
  createContext<ContextValue<ColorSwatchPickerProps, HTMLDivElement>>(null);

const ColorMapContext = createContext<Map<string, Color> | null>(null);

export function ColorSwatchPicker(input: ColorSwatchPickerProps): JSX.Element {
  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    ColorSwatchPickerContext
  );

  const state = createColorPickerState(props);
  const map = new Map<string, Color>();

  const formatter = createLocalizedStringFormatter(
    intlMessages,
    "@solid2-aria/components"
  );

  return (
    <ListBox
      {...filterDOMProps(props, { labelable: true })}
      ref={(element: HTMLDivElement) => {
        setRef(element);
      }}
      class={props.class ?? "solid2-aria-ColorSwatchPicker"}
      style={props.style}
      render={props.render}
      aria-label={
        props["aria-label"] ??
        ((props["aria-labelledby"]?.length ?? 0) > 0
          ? undefined
          : formatter.format("colorSwatchPicker"))
      }
      layout={props.layout ?? "grid"}
      selectionMode="single"
      selectedKeys={[state.color.toString("hexa")]}
      onSelectionChange={(keys) => {
        if (keys !== "all") {
          const first = keys.values().next().value;
          const color = typeof first === "string" ? map.get(first) : undefined;

          if (color) {
            state.setColor(color);
          }
        }
      }}
      disallowEmptySelection
    >
      <ColorMapContext value={map}>{props.children}</ColorMapContext>
    </ListBox>
  );
}

export function ColorSwatchPickerItem(
  props: ColorSwatchPickerItemProps
): JSX.Element {
  const color = createMemo(() =>
    typeof props.color === "string"
      ? parseColor(props.color || "#0000")
      : props.color
  );

  const locale = createLocale();

  const map = requireValue(
    useContext(ColorMapContext),
    "Expected required component value"
  );

  createEffect(color, (value) => {
    const key = value.toString("hexa");
    map.set(key, value);

    return () => {
      if (map.get(key) === value) {
        map.delete(key);
      }
    };
  });

  const values = (
    original: ListBoxItemRenderProps
  ): ColorSwatchPickerItemRenderProps =>
    mergeProps(original, {
      get color() {
        return color();
      },
    });

  return (
    <ListBoxItem
      {
        // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
        ...omit(props, "class", "style", "children", "render", "ref", "color")
        // oxlint-enable solid/reactivity
      }
      ref={(el: HTMLDivElement) => {
        assignRef(
          untrack(() => props.ref),
          el
        );
      }}
      id={color().toString("hexa")}
      textValue={color().getColorName(locale.locale)}
      render={
        props.render
          ? (domProps, original) =>
              requireValue(props.render, "Expected required component value")(
                // SAFETY: ColorSwatchPickerItem has no link props, so ListBoxItem always renders a div.
                // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Narrow the link-capable render API at this non-link component boundary.
                domProps as JSX.IntrinsicElements["div"],
                values(original)
              )
          : undefined
      }
      class={(original) => {
        const value = props.class;

        return typeof value === "function"
          ? value(
              mergeProps(values(original), {
                get defaultClass() {
                  return original.defaultClass;
                },
              })
            )
          : (value ?? "solid2-aria-ColorSwatchPickerItem");
      }}
      style={
        typeof props.style === "function"
          ? (original) => {
              const value = props.style;

              return typeof value === "function"
                ? value(
                    mergeProps(values(original), {
                      get defaultStyle() {
                        return original.defaultStyle;
                      },
                    })
                  )
                : undefined;
            }
          : props.style
      }
    >
      {(original) => (
        <ColorSwatchContext
          value={{
            get color() {
              return color();
            },
          }}
        >
          {typeof props.children === "function"
            ? props.children(
                mergeProps(values(original), {
                  get defaultChildren() {
                    return original.defaultChildren;
                  },
                })
              )
            : props.children}
        </ColorSwatchContext>
      )}
    </ListBoxItem>
  );
}
