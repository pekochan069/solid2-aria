/*
 * Copyright 2020 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-stately/src/color/Color.ts.
 * Modified for Solid Aria: reorganized color code, type declarations, imports, and formatting.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { RGBColor, HSBColor, HSLColor } from "./color/color-classes";
import type { ColorChannel, ColorSpace, Color as IColor } from "./types";

export { normalizeHue } from "./color/normalize-hue";

/** Parses a color from a string value. Throws an error if the string could not be parsed. */
export function parseColor(value: string): IColor {
  const res =
    RGBColor.parse(value) ?? HSBColor.parse(value) ?? HSLColor.parse(value);

  if (res) {
    return res;
  }

  throw new Error(`Invalid color value: ${value}`);
}

export function normalizeColor(v: string | IColor): IColor {
  if (typeof v === "string") {
    return parseColor(v);
  }

  return v;
}

/** Returns a list of color channels for a given color space. */
export function getColorChannels(
  colorSpace: ColorSpace
): [ColorChannel, ColorChannel, ColorChannel] {
  switch (colorSpace) {
    case "rgb": {
      return RGBColor.colorChannels;
    }

    case "hsl": {
      return HSLColor.colorChannels;
    }

    case "hsb": {
      return HSBColor.colorChannels;
    }

    default: {
      return RGBColor.colorChannels;
    }
  }
}
