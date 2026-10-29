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
 * Derived from Adobe React Spectrum: packages/react-aria/src/overlays/usePopover.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { OverlayTriggerState } from "@solid2-aria/stately/overlays/create-overlay-trigger-state";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { untrack, omit, merge, createMemo, createEffect } from "solid-js";
import type { Accessor } from "solid-js";

import { createFocusWithin } from "../interactions/create-focus-within";
import type { FocusWithinProps } from "../interactions/create-focus-within";
import { mergeProps } from "../utils/merge-props";
import { requireValue } from "../utils/require-value";
import { getTruthyValue, isTruthy } from "../utils/truthy";
import { ariaHideOutside, keepVisible } from "./aria-hide-outside";
import { createOverlay } from "./create-overlay";
import { createOverlayPosition } from "./create-overlay-position";
import type {
  AriaPositionProps,
  PlacementAxis,
} from "./create-overlay-position";
import { createPreventScroll } from "./create-prevent-scroll";

export interface AriaPopoverProps
  extends
    Omit<AriaPositionProps, "isOpen" | "onClose" | "targetRef" | "overlayRef">,
    Omit<FocusWithinProps, "isDisabled"> {
  /**
   * The ref for the element which the popover positions itself with respect to.
   */
  triggerRef: Accessor<Element | null>;
  /**
   * The ref for the popover element.
   */
  popoverRef: Accessor<Element | null>;
  /** A ref for the popover arrow element. */
  arrowRef?: Accessor<Element | null>;
  /**
   * An optional ref for a group of popovers, e.g. submenus.
   * When provided, this element is used to detect outside interactions
   * and hiding elements from assistive technologies instead of the popoverRef.
   */
  groupRef?: Accessor<Element | null>;
  /**
   * Whether the popover is non-modal, i.e. elements outside the popover may be
   * interacted with by assistive technologies.
   *
   * Most popovers should not use this option as it may negatively impact the screen
   * reader experience. Only use with components such as combobox, which are designed
   * to handle this situation carefully.
   */
  isNonModal?: boolean;
  /**
   * Whether pressing the escape key to close the popover should be disabled.
   *
   * Most popovers should not use this option. When set to true, an alternative
   * way to close the popover with a keyboard must be provided.
   *
   * @default false
   */
  isKeyboardDismissDisabled?: boolean;
  /**
   * When user interacts with the argument element outside of the popover ref,
   * return true if onClose should be called. This gives you a chance to filter
   * out interaction with elements that should not dismiss the popover.
   * By default, onClose will always be called on interaction outside the popover ref.
   */
  shouldCloseOnInteractOutside?: (element: Element) => boolean;
}

export interface PopoverAria {
  /** Props for the popover element. */
  popoverProps: DOMAttributes;
  /** Props for the popover tip arrow if any. */
  arrowProps: DOMAttributes;
  /** Props to apply to the underlay element, if any. */
  underlayProps: DOMAttributes;
  /** Placement of the popover with respect to the trigger. */
  placement: PlacementAxis | null;
  /** The origin of the target in the overlay's coordinate system. Useful for animations. */
  triggerAnchorPoint: {
    x: number;
    y: number;
  } | null;
}

/**
 * Provides the behavior and accessibility implementation for a popover component.
 * A popover is an overlay element positioned relative to a trigger.
 */
export function createPopover(
  props: AriaPopoverProps,
  state: OverlayTriggerState
): PopoverAria {
  const _result0 = props;

  const isSubmenu = createMemo(
    () =>
      ("trigger" in _result0 ? _result0.trigger : undefined) ===
      "SubmenuTrigger"
  );

  const _result1 = createOverlay(
    {
      get isDismissable() {
        return !isTruthy(_result0.isNonModal) || isSubmenu();
      },
      get isKeyboardDismissDisabled() {
        return _result0.isKeyboardDismissDisabled;
      },
      get isOpen() {
        return state.isOpen;
      },
      get onClose() {
        return state.close;
      },
      get shouldCloseOnBlur(): true {
        return true;
      },
      get shouldCloseOnInteractOutside() {
        return _result0.shouldCloseOnInteractOutside;
      },
    },
    () => (_result0.groupRef ?? _result0.popoverRef)()
  );

  const _result2 = createOverlayPosition(
    merge(
      omit(
        _result0,
        "triggerRef",
        "popoverRef",
        "groupRef",
        "isNonModal",
        "isKeyboardDismissDisabled",
        "shouldCloseOnInteractOutside"
      ),
      {
        get getTargetRect() {
          return (
            untrack(
              () =>
                // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
                omit(
                  _result0,
                  "triggerRef",
                  "popoverRef",
                  "groupRef",
                  "isNonModal",
                  "isKeyboardDismissDisabled",
                  "shouldCloseOnInteractOutside"
                )
                  // oxlint-enable solid/reactivity
                  .getTargetRect
            ) ??
            (state.point
              ? () =>
                  new DOMRect(
                    requireValue(state.point, "Expected state.point").x,
                    requireValue(state.point, "Expected state.point").y,
                    0,
                    0
                  )
              : undefined)
          );
        },
        get isOpen() {
          return state.isOpen;
        },
        get onClose() {
          return isTruthy(_result0.isNonModal) && !isSubmenu()
            ? state.close
            : null;
        },
        get overlayRef() {
          return _result0.popoverRef;
        },
        get targetRef() {
          return _result0.triggerRef;
        },
      }
    )
  );

  createPreventScroll({
    get isDisabled() {
      return getTruthyValue(_result0.isNonModal) ?? !state.isOpen;
    },
  });
  createEffect(
    () => ({
      group: _result0.groupRef?.(),
      isNonModal: _result0.isNonModal,
      isOpen: state.isOpen,
      popover: _result0.popoverRef(),
    }),
    ({ isNonModal, isOpen, popover, group }): undefined | (() => void) => {
      if (isOpen && popover) {
        if (isTruthy(isNonModal)) {
          return keepVisible(group ?? popover);
        }

        return ariaHideOutside([group ?? popover], { shouldUseInert: true });
      }

      return undefined;
    },
    { ssrSource: "client" }
  );
  const _result3 = createFocusWithin(props);

  return {
    get arrowProps() {
      return _result2.arrowProps;
    },
    get placement() {
      return _result2.placement;
    },
    get popoverProps() {
      return mergeProps(
        _result1.overlayProps,
        _result2.overlayProps,
        _result3.focusWithinProps
      );
    },
    get triggerAnchorPoint() {
      return _result2.triggerAnchorPoint;
    },
    get underlayProps() {
      return _result1.underlayProps;
    },
  };
}
