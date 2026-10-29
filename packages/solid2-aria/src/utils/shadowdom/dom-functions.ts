/*
 * Derived from Adobe React Spectrum: packages/react-aria/src/utils/shadowdom/DOMFunctions.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { shadowDOM } from "@solid2-aria/stately/flags/flags";
import type { EventTargetType } from "@solid2-aria/types-shared";

import { getOwnerWindow, isShadowRoot, isNode } from "../dom-helpers";
import { isPresent } from "../is-present";

// Source: https://github.com/microsoft/tabster/blob/a89fc5d7e332d48f68d03b1ca6e344489d1c3898/src/Shadowdomize/DOMFunctions.ts#L16

/**
 * ShadowDOM safe version of Node.contains.
 */
export function nodeContains(
  node: EventTarget | null | undefined,
  otherNode: EventTarget | null | undefined
): boolean {
  if (!isNode(node) || !isNode(otherNode)) {
    return false;
  }

  if (!shadowDOM()) {
    return node.contains(otherNode);
  }

  let currentNode: HTMLElement | Node | null | undefined = otherNode;

  while (isPresent(currentNode)) {
    if (currentNode === node) {
      return true;
    }

    const assignedSlot: unknown =
      "assignedSlot" in currentNode ? currentNode.assignedSlot : null;

    if (
      (!("assignedElements" in currentNode) ||
        typeof currentNode.assignedElements !== "function") &&
      assignedSlot instanceof getOwnerWindow(currentNode).HTMLSlotElement &&
      assignedSlot.parentNode
    ) {
      // Element is slotted.
      currentNode = assignedSlot.parentNode;
    } else if (isShadowRoot(currentNode)) {
      // Element is in shadow root
      currentNode = currentNode.host;
    } else {
      currentNode = currentNode.parentNode;
    }
  }

  return false;
}

/**
 * ShadowDOM safe version of document.activeElement.
 */
export const getActiveElement = (doc: Document = document): Element | null => {
  if (!shadowDOM()) {
    return doc.activeElement;
  }

  let activeElement: Element | null = doc.activeElement;

  while (
    activeElement &&
    "shadowRoot" in activeElement &&
    activeElement.shadowRoot?.activeElement
  ) {
    ({ activeElement } = activeElement.shadowRoot);
  }

  return activeElement;
};

// Possibly we can improve the types for this using https://github.com/adobe/react-spectrum/pull/8991/changes#diff-2d491c0c91701d28d08e1cf9fcadbdb21a030b67ab681460c9934140f29127b8R68 but it was more changes than I
// wanted to make to fix the function.
/**
 * ShadowDOM safe version of event.target.
 */
type ResolvedEventTarget<T> =
  unknown extends EventTargetType<T> ? EventTarget | null : EventTargetType<T>;

export function getEventTarget<T extends Event>(
  event: T
): ResolvedEventTarget<T> {
  let { target } = event;

  if (
    shadowDOM() &&
    target instanceof Element &&
    target.shadowRoot &&
    "composedPath" in event
  ) {
    target = event.composedPath()[0] ?? null;
  }

  // SAFETY: This preserves the event's target contract after resolving its composed path; erased targets retain the native nullable EventTarget type.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- TypeScript cannot derive this conditional event-target type from the runtime path.
  return target as ResolvedEventTarget<T>;
}

/**
 * Returns the set of event targets a listener must be attached to in order to
 * globally observe an event.
 *
 * @param from - The target element to start from.
 * @param to - The element to stop at when bubbling. @default getOwnerWindow(from)
 *   `to` is generally going to be either `document` or `window`, but
 *   it can be any intermediate node.
 * @returns [global, ...shadowRoots]
 */
export function getPropagationTargets(
  from: Element | Document | Window | null | undefined,
  to?: Document | Window | Element | null
): EventTarget[] {
  let currentTo = to;

  // If `to` is coming from a ref, its type technically allows `null`.
  // In practice, this function will generally be called from within an effect.
  // If the ref has not resolved by that point, then a coding error has been made.
  // Better to return an empty array than `[window]`, which may appear to work
  // in the light DOM, but fail in the shadow DOM.
  if (currentTo === null) {
    return [];
  }

  currentTo ??= getOwnerWindow(from);
  const targets: EventTarget[] = [currentTo];

  if (!shadowDOM() || !from || from === currentTo) {
    return targets;
  }

  // The root `to` itself lives in. The event already reaches `to` once
  // it is inside this root, so we must NOT collect this root or anything above
  // it — only the shadow roots strictly between `refNode` and `to`.
  // `window` has no getRootNode; its boundary is the document, which the walk
  // reaches naturally (the document is not a ShadowRoot, so the loop exits).
  const toRoot = "getRootNode" in currentTo ? currentTo.getRootNode() : null;
  let current: Node | null = "getRootNode" in from ? from.getRootNode() : null;

  while (isShadowRoot(current) && current !== toRoot) {
    // order shouldn't matter
    targets.push(current);
    current = current.host.getRootNode();
  }

  return targets;
}

/**
 * ShadowDOM safe fast version of node.contains(document.activeElement).
 *
 * @param node - The element whose subtree may contain focus.
 * @returns Whether the element contains the active element.
 */
export function isFocusWithin(node: Element | null | undefined): boolean {
  if (!node) {
    return false;
  }

  // Get the active element within the node's parent shadow root (or the document). Can return null.
  const root = node.getRootNode();
  const ownerWindow = getOwnerWindow(node);

  if (
    !(root instanceof ownerWindow.Document) &&
    !(root instanceof ownerWindow.ShadowRoot)
  ) {
    return false;
  }

  const { activeElement } = root;

  // Check if the active element is within this node. These nodes are within the same shadow root.
  return isPresent(activeElement) && node.contains(activeElement);
}
