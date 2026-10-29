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
 * Derived from Adobe React Spectrum: packages/react-aria/src/overlays/useOverlayTrigger.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { OverlayTriggerState } from "@solid2-aria/stately/overlays/create-overlay-trigger-state";
import type { DOMProps } from "@solid2-aria/types-shared";
import { createEffect, createMemo, createUniqueId } from "solid-js";
import type { Accessor } from "solid-js";

import type { AriaButtonProps } from "../button/create-button";
import { ariaValue } from "../utils/aria-value";
import { onCloseMap } from "./create-close-on-scroll";

export interface OverlayTriggerProps {
  /** Type of overlay that is opened by the trigger. */
  type: "dialog" | "menu" | "listbox" | "tree" | "grid";
}

export interface OverlayTriggerAria {
  /** Props for the trigger element. */
  triggerProps: AriaButtonProps;
  /** Props for the overlay container element. */
  overlayProps: DOMProps;
}

/**
 * Handles the behavior and accessibility for an overlay trigger, e.g. a button
 * that opens a popover, menu, or other overlay that is positioned relative to the trigger.
 */
export function createOverlayTrigger(
  props: OverlayTriggerProps,
  state: OverlayTriggerState,
  ref?: Accessor<Element | null>
): OverlayTriggerAria {
  const _result0 = props;
  const _result1 = state;
  // Backward compatibility. Share state close function with useOverlayPosition so it can close on scroll
  // without forcing users to pass onClose.
  createEffect(
    () => ref?.(),
    (element): undefined | (() => void) => {
      if (element) {
        onCloseMap.set(element, state.close);

        return () => {
          onCloseMap.delete(element);
        };
      }

      return undefined;
    },
    { ssrSource: "client" }
  );

  // Aria 1.1 supports multiple values for aria-haspopup other than just menus.
  // https://www.w3.org/TR/wai-aria-1.1/#aria-haspopup
  // However, we only add it for menus for now because screen readers often
  // announce it as a menu even for other values.
  const ariaHasPopup = createMemo((): true | "listbox" | undefined => {
    if (_result0.type === "menu") {
      return true;
    }

    if (_result0.type === "listbox") {
      return "listbox" as const;
    }

    return undefined;
  });

  const overlayId = createUniqueId();

  return {
    get overlayProps() {
      return {
        get id() {
          return overlayId;
        },
      };
    },
    get triggerProps() {
      return {
        get "aria-controls"() {
          return ariaValue(_result1.isOpen ? overlayId : undefined);
        },
        get "aria-expanded"() {
          return ariaValue(_result1.isOpen);
        },
        get "aria-haspopup"() {
          return ariaValue(ariaHasPopup());
        },
        get onPress() {
          return state.toggle;
        },
      };
    },
  };
}
