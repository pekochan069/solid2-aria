/*
 * Copyright 2021 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria/src/utils/isElementVisible.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

/**
 * Adapted from https://github.com/testing-library/jest-dom and
 * https://github.com/vuejs/vue-test-utils-next/.
 * Licensed under the MIT License.
 *
 * @param element - Element to evaluate for display or visibility.
 */

import { getOwnerWindow } from "./dom-helpers";

const supportsCheckVisibility =
  typeof Element !== "undefined" && "checkVisibility" in Element.prototype;

function isStyleVisible(element: Element) {
  const windowObject = getOwnerWindow(element);

  if (
    !(element instanceof windowObject.HTMLElement) &&
    !(element instanceof windowObject.SVGElement)
  ) {
    return false;
  }

  const { display, visibility } = element.style;

  let isVisible =
    display !== "none" && visibility !== "hidden" && visibility !== "collapse";

  if (isVisible) {
    const { display: computedDisplay, visibility: computedVisibility } =
      windowObject.getComputedStyle(element);

    isVisible =
      computedDisplay !== "none" &&
      computedVisibility !== "hidden" &&
      computedVisibility !== "collapse";
  }

  return isVisible;
}

function isAttributeVisible(element: Element, childElement?: Element) {
  return (
    !element.hasAttribute("hidden") &&
    // Ignore HiddenSelect when tree walking.
    element.attributes.getNamedItem("data-react-aria-prevent-focus") === null &&
    (element.nodeName === "DETAILS" &&
    childElement &&
    childElement.nodeName !== "SUMMARY"
      ? element.hasAttribute("open")
      : true)
  );
}

export function isElementVisible(
  element: Element,
  childElement?: Element
): boolean {
  if (supportsCheckVisibility) {
    return (
      element.checkVisibility({ visibilityProperty: true }) &&
      !element.closest("[data-react-aria-prevent-focus]")
    );
  }

  return (
    element.nodeName !== "#comment" &&
    isStyleVisible(element) &&
    isAttributeVisible(element, childElement) &&
    (!element.parentElement || isElementVisible(element.parentElement, element))
  );
}
