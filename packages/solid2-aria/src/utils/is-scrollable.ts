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
 * Derived from Adobe React Spectrum: packages/react-aria/src/utils/isScrollable.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { getTruthyValue, isTruthy } from "./truthy";

export function isScrollable(
  node: Element | null,
  checkForOverflow?: boolean
): boolean {
  if (!node) {
    return false;
  }

  const style = window.getComputedStyle(node);

  const root =
    getTruthyValue(document.scrollingElement) ?? document.documentElement;

  let isScrollableValue = /(?:auto|scroll)/u.test(
    style.overflow + style.overflowX + style.overflowY
  );

  // Root element has `visible` overflow by default, but is scrollable nonetheless.
  if (node === root && style.overflow !== "hidden") {
    isScrollableValue = true;
  }

  if (isScrollableValue && isTruthy(checkForOverflow)) {
    isScrollableValue =
      node.scrollHeight !== node.clientHeight ||
      node.scrollWidth !== node.clientWidth;
  }

  return isScrollableValue;
}
