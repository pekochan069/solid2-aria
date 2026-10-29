/*
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/ColorThumb.tsx.
 * Modified for Solid Aria: composed Solid Aria and Stately primitives with Solid 2 contexts, reactive getters, and DOM refs; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createFocusRing } from "@solid2-aria/core/focus/create-focus-ring";
import { createHover } from "@solid2-aria/core/interactions/create-hover";
import type { InputHTMLAttributes } from "@solid2-aria/core/types";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { requireValue } from "@solid2-aria/core/utils/require-value";
import type { Color } from "@solid2-aria/stately/color/types";
import type { HoverEvents } from "@solid2-aria/types-shared";
import type {
  GlobalDOMAttributes,
  DOMAttributes,
} from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";
import { untrack, merge, createContext, omit, useContext } from "solid-js";
import type { Accessor } from "solid-js";

import { assignRef, dom, createRenderProps } from "./utils";
import type { RenderProps, Ref } from "./utils";

interface ColorState {
  getDisplayColor: () => Color;
  isDragging: boolean;
}

interface InternalColorThumbContextValue {
  state: ColorState;
  thumbProps: DOMAttributes;
  inputXRef: Accessor<HTMLInputElement | null>;
  setInputXRef: (element: HTMLInputElement) => void;
  inputYRef?: Accessor<HTMLInputElement | null>;
  setInputYRef?: (element: HTMLInputElement) => void;
  xInputProps: InputHTMLAttributes;
  yInputProps?: InputHTMLAttributes;
  isDisabled?: boolean;
}

export const InternalColorThumbContext =
  createContext<InternalColorThumbContextValue | null>(null);

export interface ColorThumbRenderProps {
  color: Color;
  isDragging: boolean;
  isHovered: boolean;
  isFocused: boolean;
  isFocusVisible: boolean;
  isDisabled: boolean;
}

export interface ColorThumbProps
  extends
    HoverEvents,
    RenderProps<ColorThumbRenderProps>,
    GlobalDOMAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export function ColorThumb(props: ColorThumbProps): JSX.Element {
  const ctx = requireValue(
    useContext(InternalColorThumbContext),
    "Expected required component value"
  );

  const focus = createFocusRing();
  const hover = createHover(props);

  const values: ColorThumbRenderProps = {
    get color() {
      return ctx.state.getDisplayColor();
    },
    get isDisabled() {
      return ctx.isDisabled ?? false;
    },
    get isDragging() {
      return ctx.state.isDragging;
    },
    get isFocusVisible() {
      return focus.isFocusVisible;
    },
    get isFocused() {
      return focus.isFocused;
    },
    get isHovered() {
      return hover.isHovered;
    },
  };

  const render = createRenderProps(
    mergeProps(props, {
      defaultClass: "solid2-aria-ColorThumb",
      get defaultStyle() {
        const { style } = ctx.thumbProps;

        const background = {
          "background-color": ctx.state.getDisplayColor().toString(),
        };

        return typeof style === "object"
          ? { ...style, ...background }
          : background;
      },
      values,
    })
  );

  return (
    <dom.div
      {...mergeProps(
        merge(() => ctx.thumbProps),
        merge(() => hover.hoverProps ?? {}),
        omit(filterDOMProps(props, { global: true }), "id"),
        render
      )}
      ref={(element: HTMLDivElement) => {
        assignRef(
          untrack(() => props.ref),
          element
        );
      }}
      data-hovered={hover.isHovered || undefined}
      data-dragging={ctx.state.isDragging || undefined}
      data-focused={focus.isFocused || undefined}
      data-focus-visible={focus.isFocusVisible || undefined}
      data-disabled={ctx.isDisabled === true ? true : undefined}
    >
      <input
        {...mergeProps(
          merge(() => ctx.xInputProps),
          merge(() => focus.focusProps ?? {})
        )}
        ref={(element: HTMLInputElement) => {
          ctx.setInputXRef(element);
        }}
      />
      {ctx.yInputProps && (
        <input
          {...mergeProps(
            merge(() => ctx.yInputProps ?? {}),
            merge(() => focus.focusProps ?? {})
          )}
          ref={(el: HTMLInputElement) => {
            if (ctx.setInputYRef) {
              ctx.setInputYRef(el);
            }
          }}
        />
      )}
      {render.children}
    </dom.div>
  );
}
