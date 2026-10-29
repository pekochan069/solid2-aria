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

import type { Color } from "../types";

function multiplyMatrix(
  m: [number, number, number, number, number, number, number, number, number],
  x: number,
  y: number,
  z: number
): [number, number, number] {
  const a = m[0] * x + m[1] * y + m[2] * z;
  const b = m[3] * x + m[4] * y + m[5] * z;
  const c = m[6] * x + m[7] * y + m[8] * z;

  return [a, b, c];
}

function lin_sRGB_component(val: number) {
  const sign = val < 0 ? -1 : 1;
  const abs = Math.abs(val);

  if (abs <= 0.04045) {
    return val / 12.92;
  }

  return sign * ((abs + 0.055) / 1.055) ** 2.4;
}

function lin_sRGB(r: number, g: number, b: number): [number, number, number] {
  // convert an array of sRGB values
  // where in-gamut values are in the range [0 - 1]
  // to linear light (un-companded) form.
  // https://en.wikipedia.org/wiki/SRGB
  // Extended transfer function:
  // for negative values,  linear portion is extended on reflection of axis,
  // then reflected power function is used.
  return [lin_sRGB_component(r), lin_sRGB_component(g), lin_sRGB_component(b)];
}

function lin_sRGB_to_XYZ(r: number, g: number, b: number) {
  // convert an array of linear-light sRGB values to CIE XYZ
  // using sRGB's own white, D65 (no chromatic adaptation)
  const M: [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ] = [
    506_752 / 1_228_815,
    87_881 / 245_763,
    12_673 / 70_218,
    87_098 / 409_605,
    175_762 / 245_763,
    12_673 / 175_545,
    7918 / 409_605,
    87_881 / 737_289,
    1_001_167 / 1_053_270,
  ];

  return multiplyMatrix(M, r, g, b);
}

function XYZ_to_OKLab(x: number, y: number, z: number) {
  // Given XYZ relative to D65, convert to OKLab
  const XYZtoLMS: [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ] = [
    0.819022437996703, 0.3619062600528904, -0.1288737815209879,
    0.0329836539323885, 0.9292868615863434, 0.0361446663506424,
    0.0481771893596242, 0.2642395317527308, 0.6335478284694309,
  ];

  const LMStoOKLab: [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ] = [
    0.210454268309314, 0.7936177747023054, -0.0040720430116193,
    1.9779985324311684, -2.4285922420485799, 0.450593709617411,
    0.0259040424655478, 0.7827717124575296, -0.8086757549230774,
  ];

  const [a, b, c] = multiplyMatrix(XYZtoLMS, x, y, z);

  return multiplyMatrix(LMStoOKLab, Math.cbrt(a), Math.cbrt(b), Math.cbrt(c));
}

function OKLab_to_OKLCH(
  l: number,
  a: number,
  b: number
): [number, number, number] {
  const hue = (Math.atan2(b, a) * 180) / Math.PI;

  return [l, Math.hypot(a, b), hue >= 0 ? hue : hue + 360];
}

// https://www.w3.org/TR/css-color-4/#color-conversion-code
export function toOKLCH(color: Pick<Color, "toFormat">) {
  const rgb = color.toFormat("rgb");
  let red = rgb.getChannelValue("red") / 255;
  let green = rgb.getChannelValue("green") / 255;
  let blue = rgb.getChannelValue("blue") / 255;
  [red, green, blue] = lin_sRGB(red, green, blue);
  const [x, y, z] = lin_sRGB_to_XYZ(red, green, blue);
  const [l, a, b] = XYZ_to_OKLab(x, y, z);

  return OKLab_to_OKLCH(l, a, b);
}
