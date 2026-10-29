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
 * Derived from Adobe React Spectrum: packages/react-stately/src/color/useColor.ts.
 * Modified for Solid Aria: adapted reactive state and public APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createMemo } from "solid-js";
import type { Accessor } from "solid-js";

import { parseColor } from "./color";
import type { Color } from "./types";

export function createColor(
  value:
    | string
    | Color
    | undefined
    | null
    | Accessor<string | Color | undefined | null>
): Accessor<Color | undefined | null> {
  return createMemo(() => {
    const current = typeof value === "function" ? value() : value;

    if (typeof current === "string") {
      try {
        return parseColor(current);
      } catch {
        // oxlint-disable-next-line typescript/consistent-return
        return;
      }
    }

    return current;
  });
}
