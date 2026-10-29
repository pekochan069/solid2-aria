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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/OverlayArrow.tsx.
 * Modified for Solid Aria: adapted components, contexts, refs, and reactive properties for Solid 2; preserve defined context offsets and placement edges in default render styles and use Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { PlacementAxis } from "@solid2-aria/core/overlays/create-overlay-position";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import type { JSX } from "@solidjs/web";
import { untrack, createContext } from "solid-js";

import {
  dom,
  createContextProps,
  createRenderProps,
  createSlottedContext,
} from "./utils";
import type { ContextValue, Ref, RenderProps, SlotProps } from "./utils";

export interface OverlayArrowRenderProps {
  placement: PlacementAxis | null;
}

export interface OverlayArrowProps
  extends RenderProps<OverlayArrowRenderProps>, SlotProps {
  ref?: Ref<HTMLDivElement>;
}

interface OverlayArrowContextValue extends OverlayArrowProps {
  placement: PlacementAxis | null;
}

export const OverlayArrowContext = createContext<
  ContextValue<OverlayArrowContextValue, HTMLDivElement>
>({ placement: "bottom" });

function definedStyle(style: JSX.CSSProperties): JSX.CSSProperties {
  return Object.fromEntries(
    Object.entries(style).filter(([, value]) => value !== undefined)
  );
}

export function OverlayArrow(input: OverlayArrowProps): JSX.Element {
  const context = createSlottedContext(
    OverlayArrowContext,
    untrack(() => input.slot)
  );

  const [props, , setRef] = createContextProps<
    OverlayArrowProps & Partial<OverlayArrowContextValue>,
    OverlayArrowContextValue,
    HTMLDivElement
  >(
    input,
    untrack(() => input.ref),
    OverlayArrowContext
  );

  const values: OverlayArrowRenderProps = {
    get placement() {
      return props.placement ?? null;
    },
  };

  const defaultStyle = (): JSX.CSSProperties => ({
    position: "absolute",
    transform:
      values.placement === "top" || values.placement === "bottom"
        ? "translateX(-50%)"
        : "translateY(-50%)",
    ...(values.placement ? { [values.placement]: "100%" } : undefined),
    ...(typeof context?.style === "object"
      ? definedStyle(context.style)
      : undefined),
  });

  const render = createRenderProps(
    mergeProps(props, {
      defaultClass: "solid2-aria-OverlayArrow",
      get defaultStyle() {
        return defaultStyle();
      },
      get style() {
        return typeof props.style === "object"
          ? definedStyle(props.style)
          : props.style;
      },
      values,
    })
  );

  return (
    <dom.div
      {...filterDOMProps(props, { global: true })}
      {...render}
      ref={(element: HTMLDivElement) => {
        setRef(element);
      }}
      style={render.style}
      data-placement={values.placement}
    />
  );
}
