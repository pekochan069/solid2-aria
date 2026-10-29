/*
 * Copyright 2022 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria/src/overlays/useModalOverlay.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { OverlayTriggerState } from "@solid2-aria/stately/overlays/create-overlay-trigger-state";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { merge, createEffect } from "solid-js";
import type { Accessor } from "solid-js";

import { mergeProps } from "../utils/merge-props";
import { isTruthy } from "../utils/truthy";
import { ariaHideOutside, keepVisible } from "./aria-hide-outside";
import { createOverlay } from "./create-overlay";
import type { AriaOverlayProps } from "./create-overlay";
import { createPreventScroll } from "./create-prevent-scroll";
import { createOverlayFocusContain } from "./overlay";

export interface AriaModalOverlayProps extends Pick<
  AriaOverlayProps,
  "shouldCloseOnInteractOutside"
> {
  /**
   * Whether to close the modal when the user interacts outside it.
   *
   * @default false
   */
  isDismissable?: boolean;
  /**
   * Whether pressing the escape key to close the modal should be disabled.
   *
   * @default false
   */
  isKeyboardDismissDisabled?: boolean;
  /**
   * Whether the modal is currently performing an entry animation. Content outside the modal is
   * not hidden from assistive technology until the animation completes, so that the screen reader
   * cursor is not forced into the modal before it is ready.
   */
  isEntering?: boolean;
  /**
   * Whether to override the `focus()` method so it does not scroll the page.
   * This is temporary and will be removed after fully testing all overlays.
   *
   * @private
   */
  UNSTABLE_overrideFocus?: boolean;
}

export interface ModalOverlayAria {
  /** Props for the modal element. */
  modalProps: DOMAttributes;
  /** Props for the underlay element. */
  underlayProps: DOMAttributes;
}

/**
 * Provides the behavior and accessibility implementation for a modal component.
 * A modal is an overlay element which blocks interaction with elements outside it.
 */
export function createModalOverlay(
  props: AriaModalOverlayProps,
  state: OverlayTriggerState,
  ref: Accessor<HTMLElement | null>
): ModalOverlayAria {
  const _result0 = createOverlay(
    merge(props, {
      get isOpen() {
        return state.isOpen;
      },
      get onClose() {
        return state.close;
      },
    }),
    ref
  );

  createPreventScroll({
    get UNSTABLE_overrideFocus() {
      return props.UNSTABLE_overrideFocus;
    },
    get isDisabled() {
      return !state.isOpen;
    },
  });
  createOverlayFocusContain();
  const _result1 = props;
  createEffect(
    () => ({
      element: ref(),
      isEntering: _result1.isEntering,
      isOpen: state.isOpen,
    }),
    ({ isOpen, isEntering, element }): undefined | (() => void) => {
      if (isOpen && element) {
        if (isTruthy(isEntering)) {
          // Prevent a parent modal from hiding this one while it is entering.
          return keepVisible(element);
        }

        return ariaHideOutside([element], { shouldUseInert: true });
      }

      return undefined;
    },
    { ssrSource: "client" }
  );

  return {
    get modalProps() {
      return mergeProps(_result0.overlayProps);
    },
    get underlayProps() {
      return _result0.underlayProps;
    },
  };
}
