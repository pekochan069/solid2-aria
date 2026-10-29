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
 * Derived from Adobe React Spectrum: packages/react-aria/src/virtualizer/utils.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { Direction } from "@solid2-aria/types-shared";

export type RTLOffsetType =
  | "negative"
  | "positive-descending"
  | "positive-ascending";

let cachedRTLResult: RTLOffsetType | null = null;

// Original licensing for the following methods can be found in the
// NOTICE file in the root directory of this source tree.
// See https://github.com/bvaughn/react-window/blob/master/src/createGridComponent.js
// According to the spec, scrollLeft should be negative for RTL aligned elements.
// Chrome does not seem to adhere; its scrollLeft values are positive (measured relative to the left).
// Safari's elastic bounce makes detecting this even more complicated wrt potential false positives.
// The safest way to check this is to intentionally set a negative offset,
// and then verify that the subsequent "scroll" event matches the negative offset.
// If it does not match, then we can assume a non-standard RTL scroll implementation.
export function getRTLOffsetType(recalculate = false): RTLOffsetType {
  if (cachedRTLResult === null || recalculate) {
    const outerDiv = document.createElement("div");
    const outerStyle = outerDiv.style;
    outerStyle.width = "50px";
    outerStyle.height = "50px";
    outerStyle.overflow = "scroll";
    outerStyle.direction = "rtl";
    const innerDiv = document.createElement("div");
    const innerStyle = innerDiv.style;
    innerStyle.width = "100px";
    innerStyle.height = "100px";
    outerDiv.append(innerDiv);
    document.body.append(outerDiv);

    if (outerDiv.scrollLeft > 0) {
      cachedRTLResult = "positive-descending";
    } else {
      outerDiv.scrollLeft = 1;

      cachedRTLResult =
        outerDiv.scrollLeft === 0 ? "negative" : "positive-ascending";
    }

    outerDiv.remove();

    return cachedRTLResult;
  }

  return cachedRTLResult;
}

export function getScrollLeft(node: Element, direction: Direction): number {
  let { scrollLeft } = node;

  // scrollLeft in rtl locales differs across browsers, so normalize.
  // See comment by getRTLOffsetType below for details.
  if (direction === "rtl") {
    const { scrollWidth, clientWidth } = node;

    switch (getRTLOffsetType()) {
      case "negative": {
        scrollLeft = -scrollLeft;
        break;
      }

      case "positive-descending": {
        scrollLeft = scrollWidth - clientWidth - scrollLeft;
        break;
      }

      case "positive-ascending": {
        throw new Error('Not implemented yet: "positive-ascending" case');
      }

      default: {
        break;
      }
    }
  }

  return scrollLeft;
}

export function setScrollLeft(
  node: Element,
  direction: Direction,
  scrollLeft: number
): void {
  let currentScrollLeft = scrollLeft;

  if (direction === "rtl") {
    switch (getRTLOffsetType()) {
      case "negative": {
        currentScrollLeft = -currentScrollLeft;
        break;
      }

      case "positive-ascending": {
        break;
      }

      case "positive-descending": {
        throw new Error('Not implemented yet: "positive-descending" case');
      }

      default: {
        const { clientWidth, scrollWidth } = node;
        currentScrollLeft = scrollWidth - clientWidth - currentScrollLeft;
        break;
      }
    }
  }

  node.scrollLeft = currentScrollLeft;
}
