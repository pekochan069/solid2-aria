/*
 * Derived from Adobe React Spectrum: packages/react-aria/src/focus/virtualFocus.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2; dispatch virtual focus events outside reactive tracking so handlers observe event-time state.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { untrack } from "solid-js";

import { getOwnerDocument } from "../utils/dom-helpers";
import { getActiveElement } from "../utils/shadowdom/dom-functions";
import { getTruthyValue, isTruthy } from "../utils/truthy";

export function moveVirtualFocus(to: Element | null): void {
  const from = getVirtuallyFocusedElement(getOwnerDocument(to));

  if (from !== to) {
    if (from) {
      dispatchVirtualBlur(from, to);
    }

    if (to) {
      dispatchVirtualFocus(to, from);
    }
  }
}

export function dispatchVirtualBlur(from: Element, to: Element | null): void {
  untrack(() => {
    from.dispatchEvent(new FocusEvent("blur", { relatedTarget: to }));
    from.dispatchEvent(
      new FocusEvent("focusout", { bubbles: true, relatedTarget: to })
    );
  });
}

export function dispatchVirtualFocus(to: Element, from: Element | null): void {
  untrack(() => {
    to.dispatchEvent(new FocusEvent("focus", { relatedTarget: from }));
    to.dispatchEvent(
      new FocusEvent("focusin", { bubbles: true, relatedTarget: from })
    );
  });
}

export function getVirtuallyFocusedElement(document: Document): Element | null {
  const activeElement = getActiveElement(document);
  const activeDescendant = activeElement?.getAttribute("aria-activedescendant");

  if (isTruthy(activeDescendant)) {
    return (
      getTruthyValue(document.querySelector(`#${activeDescendant}`)) ??
      activeElement
    );
  }

  return activeElement;
}
