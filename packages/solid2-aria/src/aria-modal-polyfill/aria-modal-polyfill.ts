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
 * Derived from Adobe React Spectrum: packages/react-aria/src/aria-modal-polyfill/ariaModalPolyfill.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { hideOthers } from "aria-hidden";

import { requireHTMLElement } from "../utils/dom-value";
import { noop } from "../utils/noop";
import { requireValue } from "../utils/require-value";
import { isTruthy } from "../utils/truthy";

type Revert = () => void;

const currentDocument = typeof document === "undefined" ? undefined : document;

/**
 * Acts as a polyfill for `aria-modal` by watching for added modals and hiding any surrounding DOM
 * elements with `aria-hidden`.
 */
export function watchModals(
  selector = "body",
  {
    document = currentDocument,
  }: {
    document?: Document;
  } = {}
): Revert {
  /**
   * Listen for additions to the child list of the selected element (defaults to body). This is
   * where providers render modal portals. When one is added, see if there is a modal inside it, if
   * there is, then hide everything else from screen readers. If there was already a modal open and
   * a new one was added, undo everything that the previous modal had hidden and hide based on the
   * new one.
   *
   * If a modal container is removed, then undo the hiding based on the last hide others. Check if
   * there are any other modals still around, and hide based on the last one added.
   */
  if (!document) {
    return noop;
  }

  const target = document.querySelector(selector);

  if (!target) {
    return noop;
  }

  const config = { childList: true };
  let modalContainers: Element[] = [];
  let undo: Revert | undefined;

  const observer = new MutationObserver((mutationRecord) => {
    const liveAnnouncer = document.querySelector(
      '[data-live-announcer="true"]'
    );

    for (const mutation of mutationRecord) {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        const addNode: Element = requireHTMLElement(
          [...mutation.addedNodes].find(
            (node) =>
              node instanceof Element &&
              node.querySelector(
                '[aria-modal="true"], [data-ismodal="true"]'
              ) !== null
          )
        );

        if (isTruthy(addNode)) {
          modalContainers.push(addNode);

          const modal = requireHTMLElement(
            addNode.querySelector('[aria-modal="true"], [data-ismodal="true"]')
          );

          undo?.();

          const others = [
            modal,
            ...(liveAnnouncer ? [requireHTMLElement(liveAnnouncer)] : []),
          ];

          undo = hideOthers(others);
        }
      } else if (
        mutation.type === "childList" &&
        mutation.removedNodes.length > 0
      ) {
        const removedNodes = new Set(mutation.removedNodes);

        const nodeIndexRemove = modalContainers.findIndex((container) =>
          removedNodes.has(container)
        );

        if (nodeIndexRemove !== -1) {
          undo?.();
          modalContainers = modalContainers.filter(
            (val, i) => i !== nodeIndexRemove
          );

          if (modalContainers.length > 0) {
            const modal = requireHTMLElement(
              requireValue(
                modalContainers.at(-1),
                "Expected modalContainers[ modalContainers.length - 1 ]"
              ).querySelector('[aria-modal="true"], [data-ismodal="true"]')
            );

            const others = [
              modal,
              ...(liveAnnouncer ? [requireHTMLElement(liveAnnouncer)] : []),
            ];

            undo = hideOthers(others);
          } else {
            undo = undefined;
          }
        }
      }
    }
  });

  observer.observe(target, config);

  return () => {
    undo?.();
    observer.disconnect();
  };
}
