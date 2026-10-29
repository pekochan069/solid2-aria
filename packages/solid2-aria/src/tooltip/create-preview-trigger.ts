/*
 * Copyright 2026 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria/src/tooltip/usePreviewTrigger.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  TooltipTriggerProps,
  TooltipTriggerState,
} from "@solid2-aria/stately/tooltip/create-tooltip-trigger-state";
import type {
  KeyboardEvent as AriaKeyboardEvent,
  FocusableElement,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { merge, createMemo, createEffect } from "solid-js";
import type { Accessor } from "solid-js";

import intlMessages from "../../intl/previewtrigger/index";
import { getFocusableTreeWalker } from "../focus/focus-scope";
import { createLocalizedStringFormatter } from "../i18n/create-localized-string-formatter";
import {
  getInteractionModality,
  createFocusVisibleListener,
  createInteractionModality,
} from "../interactions/create-focus-visible";
import { createHover } from "../interactions/create-hover";
import { createLongPress } from "../interactions/create-long-press";
import type { AriaPopoverProps } from "../overlays/create-popover";
import { ariaValue } from "../utils/aria-value";
import { createEvent } from "../utils/create-event";
import { createId } from "../utils/create-id";
import { getOwnerDocument } from "../utils/dom-helpers";
import {
  focusableElementOrNull,
  requireFocusableElement,
} from "../utils/dom-value";
import { focusWithoutScrolling } from "../utils/focus-without-scrolling";
import { isPresent } from "../utils/is-present";
import { mergeProps } from "../utils/merge-props";
import {
  getActiveElement,
  nodeContains,
} from "../utils/shadowdom/dom-functions";
import { createSafeArea } from "./create-safe-area";

export type AriaPreviewTriggerProps = Omit<
  TooltipTriggerProps,
  "trigger" | "shouldCloseOnPress"
>;

export interface AriaPreviewTriggerOptions extends AriaPreviewTriggerProps {
  /** A ref to the trigger element (e.g. a Link). */
  triggerRef: Accessor<FocusableElement | null>;
  /** A ref to the popover element. */
  popoverRef: Accessor<Element | null>;
}

export interface PreviewTriggerTriggerAria {
  /**
   * Props for the trigger element (e.g. a Link).
   */
  triggerProps: DOMAttributes;
  /**
   * Props for the popover overlay element.
   */
  popoverProps: Omit<AriaPopoverProps, "triggerRef" | "popoverRef"> &
    DOMAttributes;
}

/**
 * Provides the behavior and accessibility implementation for a preview trigger.
 * A preview trigger displays a popover on hover, focus, or long press. Unlike a
 * tooltip, the popover may contain interactive content.
 */
export function createPreviewTrigger(
  props: AriaPreviewTriggerOptions,
  state: TooltipTriggerState
): PreviewTriggerTriggerAria {
  const _result0 = props;

  const stringFormatter = createLocalizedStringFormatter(
    intlMessages,
    "@react-aria/link-preview"
  );

  const popoverId = createId();
  // Suppresses the next focus from reopening the preview (e.g. when restoring focus on Escape).
  let ignoreFocus = false;
  // When opened via long press, move focus into the popover once it opens so touch screen readers
  // (e.g. VoiceOver) move their virtual cursor into the preview.
  let shouldFocusOnOpen = false;
  // Whether the pointer is currently within the safe area (the trigger, the popover, or the region
  // between them). Tracked by useSafeArea below so the preview stays open while the pointer travels
  // from the link to the popover, even with closeDelay of 0.
  let pointerInSafeArea = false;
  let isFocusVisible = false;
  createFocusVisibleListener((visible) => {
    isFocusVisible = visible;
  });

  // Cancel a pending close and keep the preview open.
  const keepOpen = () => {
    state.open(true);
  };

  // Close the preview unless something is still keeping it open: the pointer is within the safe
  // area, or focus is within the trigger or popover. During focus transitions the active element
  // may briefly be the body; the popover's focusin handler re-opens in that case (focus moving in).
  const checkClose = () => {
    if (pointerInSafeArea) {
      return;
    }

    const active = _result0.triggerRef()
      ? getActiveElement(getOwnerDocument(_result0.triggerRef()))
      : null;

    if (
      isFocusVisible &&
      ((_result0.triggerRef() && nodeContains(_result0.triggerRef(), active)) ||
        (_result0.popoverRef() && nodeContains(_result0.popoverRef(), active)))
    ) {
      return;
    }

    state.close();
  };

  createEffect(
    () => ({ isOpen: state.isOpen, popoverElement: _result0.popoverRef() }),
    ({ isOpen, popoverElement }) => {
      const popover = popoverElement;

      if (!isOpen || !popover || !shouldFocusOnOpen) {
        return;
      }

      // When opened via long press, move focus to the popover itself so touch screen readers move
      // their virtual cursor into the preview.
      shouldFocusOnOpen = false;
      focusWithoutScrolling(requireFocusableElement(popover));
    },
    { ssrSource: "client" }
  );

  const onHoverStart = () => {
    // Match useTooltipTrigger: only treat as hovered when the modality is actually a pointer.
    if (getInteractionModality() === "pointer") {
      pointerInSafeArea = true;
      state.open();
    }
  };

  const onHoverEnd = () => {
    // Before the preview opens, cancel a pending warmup if the pointer leaves the trigger. Once
    // open, the safe-area polygon (useSafeArea) governs closing as the pointer moves to the popover.
    if (!state.isOpen) {
      pointerInSafeArea = false;
      state.close();
    }
  };

  const onTriggerFocus = (e: FocusEvent) => {
    if (ignoreFocus) {
      ignoreFocus = false;

      return;
    }

    // Prevent browser focusing the link on long press when focus is already in the popover.
    if (state.isOpen && e.relatedTarget === _result0.popoverRef()) {
      focusWithoutScrolling(requireFocusableElement(_result0.popoverRef()));

      return;
    }

    if (isFocusVisible) {
      // Open after the warmup delay on keyboard focus, not immediately like a tooltip. This way
      // tabbing quickly through the page doesn't open previews (and add their tab stops); the
      // delay ensures the user is actually interested in the link's details.
      state.open();
    }
  };

  createEvent(_result0.triggerRef, "react-aria-focus-scope-restore", (e) => {
    e.preventDefault();
    ignoreFocus = true;
    _result0.triggerRef()?.focus();
  });

  // Move focus from the link into the preview when the user presses Tab while it is open.
  // Tabbing back out of the popover is handled by the popover's own FocusScope.
  const onTriggerKeyDown = (e: AriaKeyboardEvent) => {
    const result0popoverRefElement = _result0.popoverRef();

    if (
      e.key === "Tab" &&
      !e.shiftKey &&
      state.isOpen &&
      result0popoverRefElement
    ) {
      const walker = getFocusableTreeWalker(result0popoverRefElement, {
        tabbable: true,
      });

      const first = focusableElementOrNull(walker.nextNode());

      if (first) {
        e.preventDefault();
        first.focus();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      state.close(true);
    }
  };

  const _result1 = createHover({
    get isDisabled() {
      return _result0.isDisabled;
    },
    get onHoverEnd() {
      return onHoverEnd;
    },
    get onHoverStart() {
      return onHoverStart;
    },
  });

  const focusableProps = {
    onBlur: checkClose,
    onFocus: onTriggerFocus,
    onKeyDown: onTriggerKeyDown,
  };

  // Only describe the long press interaction when the user is actually using touch, otherwise it
  // is confusing (e.g. a screen reader announcing "long press" while navigating with a keyboard).
  // null is the default before the user has interacted with anything.
  const modality = createInteractionModality();

  const shouldLongPress = createMemo(
    () =>
      (modality() === "pointer" ||
        modality() === "virtual" ||
        !isPresent(modality())) &&
      typeof window !== "undefined" &&
      "ontouchstart" in window
  );

  // Open the preview on long press on touch devices, since there is no hover. Move focus into the
  // popover once it opens so touch screen readers (e.g. VoiceOver) move their virtual cursor in.
  const _result2 = createLongPress({
    get accessibilityDescription() {
      return shouldLongPress()
        ? stringFormatter.format("longPressMessage")
        : undefined;
    },
    get isDisabled() {
      return _result0.isDisabled;
    },
    onLongPress() {
      shouldFocusOnOpen = true;
      state.open(true);
    },
    get pointerType(): "touch" {
      return "touch" as const;
    },
  });

  // Keep the preview open while the pointer is anywhere within the safe area connecting the link
  // and the popover, so moving the pointer between them (even diagonally) doesn't close it. This
  // works for any popover placement and even when closeDelay is 0.
  createSafeArea({
    get isDisabled() {
      return _result0.isDisabled;
    },
    get isOpen() {
      return state.isOpen;
    },
    onSafeAreaChange: (isInSafeArea) => {
      if (isInSafeArea === pointerInSafeArea) {
        return;
      }

      pointerInSafeArea = isInSafeArea;

      if (isInSafeArea) {
        keepOpen();
      } else {
        checkClose();
      }
    },
    get overlayRef() {
      return _result0.popoverRef;
    },
    get triggerRef() {
      return _result0.triggerRef;
    },
  });

  const triggerProps = createMemo(() =>
    mergeProps(focusableProps, _result1.hoverProps, _result2.longPressProps)
  );

  const describedBy = createMemo(() =>
    [triggerProps()["aria-describedby"], state.isOpen ? popoverId() : null]
      .filter(Boolean)
      .join(" ")
  );

  return {
    get popoverProps() {
      return {
        get id() {
          return popoverId();
        },
        get onBlurWithin() {
          return checkClose;
        },
        get onFocusWithin() {
          return keepOpen;
        },
      };
    },
    get triggerProps() {
      return merge(triggerProps(), {
        get "aria-controls"() {
          return ariaValue(ariaValue(state.isOpen ? popoverId() : undefined));
        },
        get "aria-describedby"() {
          return ariaValue(ariaValue(describedBy() || undefined));
        },
        get "aria-expanded"() {
          return ariaValue(ariaValue(state.isOpen));
        },
        get "aria-haspopup"() {
          return ariaValue(ariaValue("dialog"));
        },
        get style() {
          return {
            get WebkitTouchCallout(): "none" {
              return "none" as const;
            },
            get WebkitUserDrag(): "none" {
              return "none" as const;
            },
          };
        },
      });
    },
  };
}
