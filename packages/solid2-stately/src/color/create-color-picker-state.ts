/*
 * Derived from Adobe React Spectrum: packages/react-stately/src/color/useColorPickerState.ts.
 * Modified for Solid Aria: adapted reactive state and public APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { ValueBase } from "@solid2-aria/types-shared";
import { untrack } from "solid-js";

import { createControlledSignal } from "../utils/create-controlled-signal";
import { parseColor } from "./color";
import { createColor } from "./create-color";
import type { Color } from "./types";

export type ColorPickerProps = ValueBase<string | Color, Color>;

export interface ColorPickerState {
  /** The current color value of the color picker. */
  color: Color;
  /** Sets the current color value of the color picker. */
  setColor: (color: Color | null) => void;
}

export function createColorPickerState(
  props: ColorPickerProps
): ColorPickerState {
  const value = createColor(() => props.value);
  const defaultValue = createColor(() => props.defaultValue ?? "#000000");

  const [color, setColor] = createControlledSignal(
    () => value() ?? undefined,
    untrack(defaultValue) ?? parseColor("#000000"),
    (v) => props.onChange?.(v)
  );

  return {
    get color() {
      return color();
    },
    setColor(v) {
      if (v !== null) {
        setColor(v);
      }
    },
  };
}
