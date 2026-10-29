/*
 * Copyright 2025 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria/src/utils/isFocusable.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { getOwnerWindow } from "./dom-helpers";
import { isElementVisible } from "./is-element-visible";
import { isPresent } from "./is-present";
import { getTruthyValue, whenTruthy } from "./truthy";

const focusableElements = [
  "input:not([disabled]):not([type=hidden])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "button:not([disabled])",
  "a[href]",
  "area[href]",
  "summary",
  "iframe",
  "object",
  "embed",
  "audio[controls]",
  "video[controls]",
  '[contenteditable]:not([contenteditable^="false"])',
  "permission",
];

const FOCUSABLE_ELEMENT_SELECTOR = `${focusableElements.join(
  ":not([hidden]),"
)},[tabindex]:not([disabled]):not([hidden])`;

focusableElements.push('[tabindex]:not([tabindex="-1"]):not([disabled])');

const TABBABLE_ELEMENT_SELECTOR = focusableElements.join(
  ':not([hidden]):not([tabindex="-1"]),'
);

export function isFocusable(
  element: Element,
  options?: {
    skipVisibilityCheck?: boolean;
  }
): boolean {
  return whenTruthy(
    whenTruthy(
      element.matches(FOCUSABLE_ELEMENT_SELECTOR),
      () => !isInert(element)
    ),
    () =>
      getTruthyValue(options?.skipVisibilityCheck) ?? isElementVisible(element)
  );
}

export function isTabbable(element: Element): boolean {
  return (
    element.matches(TABBABLE_ELEMENT_SELECTOR) &&
    isElementVisible(element) &&
    !isInert(element)
  );
}

function isInert(element: Element): boolean {
  let node: Element | null = element;

  while (isPresent(node)) {
    if (node instanceof getOwnerWindow(node).HTMLElement && node.inert) {
      return true;
    }

    node = node.parentElement;
  }

  return false;
}
