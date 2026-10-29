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
 * Derived from Adobe React Spectrum: packages/react-aria/src/overlays/useCloseOnScroll.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createEffect } from "solid-js";
import type { Accessor } from "solid-js";

import { addEvent } from "../utils/dom-helpers";
import {
  getEventTarget,
  getPropagationTargets,
  nodeContains,
} from "../utils/shadowdom/dom-functions";
import { getTruthyValue, isTruthy } from "../utils/truthy";

// This behavior moved from useOverlayTrigger to useOverlayPosition.
// For backward compatibility, where useOverlayTrigger handled hiding the popover on close,
// it sets a close function here mapped from the trigger element. This way we can avoid
// forcing users to pass an onClose function to useOverlayPosition which could be considered
// a breaking change.
export const onCloseMap = new WeakMap<Element, () => void>();

interface CloseOnScrollOptions {
  triggerRef: Accessor<Element | null>;
  isOpen?: boolean;
  onClose?: (() => void) | null;
}

/** @private */
export function createCloseOnScroll(opts: CloseOnScrollOptions): void {
  createEffect(
    () => ({
      isOpen: opts.isOpen,
      onClose: opts.onClose,
      trigger: opts.triggerRef(),
    }),
    ({ isOpen, onClose, trigger }): undefined | (() => void) => {
      if (!isTruthy(isOpen) || onClose === null || !trigger) {
        return undefined;
      }

      const onScroll = (e: Event) => {
        // Ignore if scrolling an scrollable region outside the trigger's tree.
        const target = getEventTarget(e);

        // window is not a Node and doesn't have contain, but window contains everything
        if (target instanceof Node && !nodeContains(target, trigger)) {
          return;
        }

        // Ignore scroll events on any input or textarea as the cursor position can cause it to scroll
        // such as in a combobox. Clicking the dropdown button places focus on the input, and if the
        // text inside the input extends beyond the 'end', then it will scroll so the cursor is visible at the end.
        if (
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement
        ) {
          return;
        }

        const onCloseHandler =
          getTruthyValue(onClose) ?? onCloseMap.get(trigger);

        if (onCloseHandler) {
          onCloseHandler();
        }
      };

      return addEvent(getPropagationTargets(trigger), "scroll", onScroll, true);
    },
    { ssrSource: "client" }
  );
}
