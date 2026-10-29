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
 * Derived from Adobe React Spectrum: packages/react-aria/src/overlays/ariaHideOutside.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { shadowDOM } from "@solid2-aria/stately/flags/flags";

import {
  getOwnerDocument,
  getOwnerWindow,
  isShadowRoot,
} from "../utils/dom-helpers";
import { elementOrNull } from "../utils/dom-value";
import { isPresent } from "../utils/is-present";
import { nodeContains } from "../utils/shadowdom/dom-functions";
import { createShadowTreeWalker } from "../utils/shadowdom/shadow-tree-walker";
import { isTruthy, whenTruthy } from "../utils/truthy";

const supportsInert =
  typeof HTMLElement !== "undefined" && "inert" in HTMLElement.prototype;

function isAlwaysVisibleNode(node: HTMLElement | SVGElement): boolean {
  return (
    node.dataset.liveAnnouncer === "true" ||
    node.dataset.reactAriaTopLayer !== undefined
  );
}

interface AriaHideOutsideOptions {
  root?: Element;
  shouldUseInert?: boolean;
}

// Keeps a ref count of all hidden elements. Added to when hiding an element, and
// subtracted from when showing it again. When it reaches zero, aria-hidden is removed.
const refCountMap = new WeakMap<Element, number>();

interface ObserverWrapper {
  visibleNodes: Set<Element>;
  hiddenNodes: Set<Element>;
  observe: () => void;
  disconnect: () => void;
}

const observerStack: ObserverWrapper[] = [];

/**
 * Hides all elements in the DOM outside the given targets from screen readers using aria-hidden,
 * and returns a function to revert these changes. In addition, changes to the DOM are watched
 * and new elements outside the targets are automatically hidden.
 *
 * @param targets - The elements that should remain visible.
 * @param root - Nothing will be hidden above this element.
 * @returns - A function to restore all hidden elements.
 */

export function ariaHideOutside(
  targets: Element[],
  options?: AriaHideOutsideOptions | Element
) {
  const windowObj = getOwnerWindow(targets?.[0]);

  const opts =
    options instanceof windowObj.Element ? { root: options } : options;

  const root = opts?.root ?? document.body;

  const shouldUseInert = whenTruthy(opts?.shouldUseInert, () => supportsInert);

  const visibleNodes = new Set<Element>(targets);
  const hiddenNodes = new Set<Element>();

  const getHidden = (element: Element) =>
    isTruthy(shouldUseInert) && element instanceof windowObj.HTMLElement
      ? element.inert
      : element.getAttribute("aria-hidden") === "true";

  const setHidden = (element: Element, hidden: boolean) => {
    if (isTruthy(shouldUseInert) && element instanceof windowObj.HTMLElement) {
      element.inert = hidden;
    } else if (hidden) {
      element.setAttribute("aria-hidden", "true");
    } else {
      element.removeAttribute("aria-hidden");

      if (element instanceof windowObj.HTMLElement) {
        // We only ever call setHidden with hidden = false when the nodeCount is 1 aka
        // we are trying to make the element visible to screen readers again, so remove inert as well
        element.inert = false;
      }
    }
  };

  const shadowRootsToWatch = new Set<ShadowRoot>();

  if (shadowDOM()) {
    // Find all shadow roots that enclose the targets, walking up the host chain
    // until we reach the tree that `root` lives in. Each enclosing ShadowRoot
    // needs its own MutationObserver because it does not cross shadow
    // boundaries, so the observer on `root` cannot see mutations inside them.
    const boundary = root.getRootNode();

    for (const target of targets) {
      let current = target.getRootNode();

      while (isShadowRoot(current) && current !== boundary) {
        shadowRootsToWatch.add(current);
        current = current.host.getRootNode();
      }
    }
  }

  const acceptNode = (node: Element) => {
    // Skip this node and its children if it is one of the target nodes, or a live announcer.
    // Also skip children of already hidden nodes, as aria-hidden is recursive. An exception is
    // made for elements with role="row" since VoiceOver on iOS has issues hiding elements with role="row".
    // For that case we want to hide the cells inside as well (https://bugs.webkit.org/show_bug.cgi?id=222623).
    if (
      hiddenNodes.has(node) ||
      visibleNodes.has(node) ||
      (node.parentElement &&
        hiddenNodes.has(node.parentElement) &&
        node.parentElement.getAttribute("role") !== "row")
    ) {
      return NodeFilter.FILTER_REJECT;
    }

    // Skip this node but continue to children if one of the targets is inside the node.
    for (const target of visibleNodes) {
      if (nodeContains(node, target)) {
        return NodeFilter.FILTER_SKIP;
      }
    }

    return NodeFilter.FILTER_ACCEPT;
  };

  const walk = (rootValue: Element) => {
    // Keep live announcer and top layer elements (e.g. toasts) visible.
    for (const element of rootValue.querySelectorAll(
      "[data-live-announcer], [data-react-aria-top-layer]"
    )) {
      visibleNodes.add(element);
    }

    const walker = createShadowTreeWalker(
      getOwnerDocument(rootValue),
      rootValue,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode,
      }
    );

    // TreeWalker does not include the root.
    const acceptRoot = acceptNode(rootValue);

    if (acceptRoot === NodeFilter.FILTER_ACCEPT) {
      hide(rootValue);
    }

    if (acceptRoot !== NodeFilter.FILTER_REJECT) {
      let node = elementOrNull(walker.nextNode());

      while (isPresent(node)) {
        hide(node);
        node = elementOrNull(walker.nextNode());
      }
    }
  };

  function hide(node: Element) {
    const refCount = refCountMap.get(node) ?? 0;

    // If already aria-hidden, and the ref count is zero, then this element
    // was already hidden and there's nothing for us to do.
    if (getHidden(node) && refCount === 0) {
      return;
    }

    if (refCount === 0) {
      setHidden(node, true);
    }

    hiddenNodes.add(node);
    refCountMap.set(node, refCount + 1);
  }

  // If there is already a MutationObserver listening from a previous call,
  // disconnect it so the new on takes over.
  if (observerStack.length) {
    observerStack.at(-1)?.disconnect();
  }

  walk(root);

  const observer = new MutationObserver((changes) => {
    for (const change of changes) {
      if (change.type !== "childList") {
        continue;
      }

      // If the parent element of the added nodes is not within one of the targets,
      // and not already inside a hidden node, hide all of the new children.
      if (
        change.target.isConnected &&
        ![...visibleNodes, ...hiddenNodes].some((node) =>
          nodeContains(node, change.target)
        )
      ) {
        for (const node of change.addedNodes) {
          if (
            (node instanceof HTMLElement || node instanceof SVGElement) &&
            isAlwaysVisibleNode(node)
          ) {
            visibleNodes.add(node);
          } else if (node instanceof Element) {
            walk(node);
          }
        }
      }

      if (shadowDOM()) {
        // if any of the observed shadow roots were removed, stop observing them
        for (const shadowRoot of shadowRootsToWatch) {
          if (!shadowRoot.isConnected) {
            observer.disconnect();
            break;
          }
        }
      }
    }
  });

  observer.observe(root, { childList: true, subtree: true });
  const shadowObservers = new Set<MutationObserver>();

  if (shadowDOM()) {
    for (const shadowRoot of shadowRootsToWatch) {
      // Disconnect single target instead of all https://github.com/whatwg/dom/issues/126
      const shadowObserver = new MutationObserver((changes) => {
        for (const change of changes) {
          if (change.type !== "childList") {
            continue;
          }

          // If the parent element of the added nodes is not within one of the targets,
          // and not already inside a hidden node, hide all of the new children.
          if (
            change.target.isConnected &&
            ![...visibleNodes, ...hiddenNodes].some((node) =>
              nodeContains(node, change.target)
            )
          ) {
            for (const node of change.addedNodes) {
              if (
                (node instanceof HTMLElement || node instanceof SVGElement) &&
                isAlwaysVisibleNode(node)
              ) {
                visibleNodes.add(node);
              } else if (node instanceof Element) {
                walk(node);
              }
            }
          }

          if (shadowDOM()) {
            // if any of the observed shadow roots were removed, stop observing them
            for (const shadowRootValue of shadowRootsToWatch) {
              if (!shadowRootValue.isConnected) {
                observer.disconnect();
                break;
              }
            }
          }
        }
      });

      shadowObserver.observe(shadowRoot, { childList: true, subtree: true });
      shadowObservers.add(shadowObserver);
    }
  }

  const observerWrapper: ObserverWrapper = {
    disconnect() {
      observer.disconnect();
    },
    hiddenNodes,
    observe() {
      observer.observe(root, { childList: true, subtree: true });
    },
    visibleNodes,
  };

  observerStack.push(observerWrapper);

  return (): void => {
    observer.disconnect();

    if (shadowDOM()) {
      for (const shadowObserver of shadowObservers) {
        shadowObserver.disconnect();
      }
    }

    for (const node of hiddenNodes) {
      const count = refCountMap.get(node);

      if (!isPresent(count)) {
        continue;
      }

      if (count === 1) {
        setHidden(node, false);
        refCountMap.delete(node);
      } else {
        refCountMap.set(node, count - 1);
      }
    }

    // Remove this observer from the stack, and start the previous one.
    if (observerWrapper === observerStack.at(-1)) {
      observerStack.pop();

      if (observerStack.length) {
        observerStack.at(-1)?.observe();
      }
    } else {
      observerStack.splice(observerStack.indexOf(observerWrapper), 1);
    }
  };
}

export function keepVisible(element: Element): (() => void) | undefined {
  const observer = observerStack.at(-1);

  if (observer && !observer.visibleNodes.has(element)) {
    observer.visibleNodes.add(element);

    return () => {
      observer.visibleNodes.delete(element);
    };
  }

  return undefined;
}
