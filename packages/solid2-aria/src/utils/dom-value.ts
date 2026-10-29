import type { FocusableElement } from "@solid2-aria/types-shared";

import { getOwnerWindow, isNode } from "./dom-helpers";
import { isPresent } from "./is-present";

export function requireElement(
  // oxlint-disable-next-line anti-slop/no-unknown-parameters -- Native and framework event targets are validated against their own DOM realm here.
  value: unknown
): Element {
  if (
    !(value instanceof getOwnerWindow(isNode(value) ? value : null).Element)
  ) {
    throw new TypeError("Expected a DOM element");
  }

  return value;
}

export function requireHTMLElement(
  // oxlint-disable-next-line anti-slop/no-unknown-parameters -- Native and framework event targets are validated against their own DOM realm here.
  value: unknown
): HTMLElement {
  if (
    !(value instanceof getOwnerWindow(isNode(value) ? value : null).HTMLElement)
  ) {
    throw new TypeError("Expected an HTML element");
  }

  return value;
}

export function requireFocusableElement(
  // oxlint-disable-next-line anti-slop/no-unknown-parameters -- Native and framework event targets are validated against their own DOM realm here.
  value: unknown
): FocusableElement {
  const owner = getOwnerWindow(isNode(value) ? value : null);

  if (
    !(value instanceof owner.HTMLElement) &&
    !(value instanceof owner.SVGElement)
  ) {
    throw new TypeError("Expected an HTML or SVG element");
  }

  return value;
}

export function requireHTMLInputElement(
  // oxlint-disable-next-line anti-slop/no-unknown-parameters -- Native and framework event targets are validated against their own DOM realm here.
  value: unknown
): HTMLInputElement {
  if (
    !(
      value instanceof
      getOwnerWindow(isNode(value) ? value : null).HTMLInputElement
    )
  ) {
    throw new TypeError("Expected an input element");
  }

  return value;
}

export function elementOrNull(
  value: EventTarget | null | undefined
): Element | null {
  return isPresent(value) ? requireElement(value) : null;
}

export function htmlElementOrNull(
  value: EventTarget | null | undefined
): HTMLElement | null {
  return isPresent(value) ? requireHTMLElement(value) : null;
}

export function focusableElementOrNull(
  value: EventTarget | null | undefined
): FocusableElement | null {
  return isPresent(value) ? requireFocusableElement(value) : null;
}
