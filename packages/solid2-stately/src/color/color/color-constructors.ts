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

export interface ColorConstructors {
  RGBColor: new (
    red: number,
    green: number,
    blue: number,
    alpha: number
  ) => Color;
  HSBColor: new (
    hue: number,
    saturation: number,
    brightness: number,
    alpha: number
  ) => Color;
  HSLColor: new (
    hue: number,
    saturation: number,
    lightness: number,
    alpha: number
  ) => Color;
}
