/*
 * Copyright 2024 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/ColorPicker.tsx.
 * Modified for Solid Aria: composed Solid Aria and Stately primitives with Solid 2 contexts, reactive getters, and DOM refs.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { createColorPickerState } from "@solid2-aria/stately/color/create-color-picker-state";
import type {
  ColorPickerProps as StatelyColorPickerProps,
  ColorPickerState,
} from "@solid2-aria/stately/color/create-color-picker-state";
import type { Color } from "@solid2-aria/stately/color/types";
import type { JSX } from "@solidjs/web";
import { untrack, createContext } from "solid-js";

import { ColorAreaContext } from "./color-area";
import { ColorFieldContext } from "./color-field";
import { ColorSliderContext } from "./color-slider";
import { ColorSwatchContext } from "./color-swatch";
import { ColorSwatchPickerContext } from "./color-swatch-picker";
import { ColorWheelContext } from "./color-wheel";
import { createRenderProps, createSlottedContext } from "./utils";
import type {
  ChildrenOrFunction,
  SlotProps,
  SlottedContextValue,
} from "./utils";

export interface ColorPickerRenderProps {
  color: Color;
}

export interface ColorPickerProps extends StatelyColorPickerProps, SlotProps {
  children: ChildrenOrFunction<ColorPickerRenderProps>;
}

export const ColorPickerContext =
  createContext<SlottedContextValue<ColorPickerProps>>(null);

export const ColorPickerStateContext = createContext<ColorPickerState | null>(
  null
);

export function ColorPicker(input: ColorPickerProps): JSX.Element {
  const props = mergeProps(
    createSlottedContext(
      ColorPickerContext,
      untrack(() => input.slot)
    ) ?? {},
    input
  );

  const state = createColorPickerState(props);

  const render = createRenderProps(
    mergeProps(props, {
      values: {
        get color() {
          return state.color;
        },
      },
    })
  );

  const value = {
    onChange: state.setColor,
    get value() {
      return state.color;
    },
  };

  return (
    <ColorPickerStateContext value={state}>
      <ColorSliderContext value={value}>
        <ColorAreaContext value={value}>
          <ColorWheelContext value={value}>
            <ColorFieldContext value={value}>
              <ColorSwatchContext
                value={{
                  get color() {
                    return state.color;
                  },
                }}
              >
                <ColorSwatchPickerContext value={value}>
                  {render.children}
                </ColorSwatchPickerContext>
              </ColorSwatchContext>
            </ColorFieldContext>
          </ColorWheelContext>
        </ColorAreaContext>
      </ColorSliderContext>
    </ColorPickerStateContext>
  );
}
