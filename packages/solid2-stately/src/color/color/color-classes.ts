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

import { createHSBColorClass } from "./hsb-color";
import { createHSLColorClass } from "./hsl-color";
import { createRGBColorClass } from "./rgb-color";

interface ColorClasses {
  HSBColor: ReturnType<typeof createHSBColorClass>;
  HSLColor: ReturnType<typeof createHSLColorClass>;
  RGBColor: ReturnType<typeof createRGBColorClass>;
}

const colorClasses: ColorClasses = {
  HSBColor: createHSBColorClass(() => colorClasses),
  HSLColor: createHSLColorClass(() => colorClasses),
  RGBColor: createRGBColorClass(() => colorClasses),
};

export const { HSBColor, HSLColor, RGBColor } = colorClasses;
