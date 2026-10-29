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
 * Derived from Adobe React Spectrum: packages/react-aria/src/tooltip/useTooltipTrigger.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  TooltipTriggerProps,
  TooltipTriggerState,
} from "@solid2-aria/stately/tooltip/create-tooltip-trigger-state";
import type { FocusableElement } from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { merge, createEffect } from "solid-js";
import type { Accessor } from "solid-js";

import {
  getInteractionModality,
  isFocusVisible,
} from "../interactions/create-focus-visible";
import { createFocusable } from "../interactions/create-focusable";
import { createHover } from "../interactions/create-hover";
import { ariaValue } from "../utils/aria-value";
import { createId } from "../utils/create-id";
import { mergeProps } from "../utils/merge-props";
import { isTruthy } from "../utils/truthy";

export interface TooltipTriggerAria {
  /**
   * Props for the trigger element.
   */
  triggerProps: DOMAttributes;
  /**
   * Props for the overlay container element.
   */
  tooltipProps: DOMAttributes;
}

/**
 * Provides the behavior and accessibility implementation for a tooltip trigger, e.g. a button
 * that shows a description when focused or hovered.
 */
export function createTooltipTrigger(
  props: TooltipTriggerProps,
  state: TooltipTriggerState,
  ref: Accessor<FocusableElement | null>
): TooltipTriggerAria {
  const _result0 = props;
  const tooltipId = createId();
  let isHovered = false;
  let isFocused = false;

  const handleShow = () => {
    if (isHovered || isFocused) {
      state.open(isFocused);
    }
  };

  const handleHide = (immediate?: boolean) => {
    if (!isHovered && !isFocused) {
      state.close(immediate);
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (isTruthy(ref) && ref() && e.key === "Escape") {
      e.stopPropagation();
      state.close(true);
    }
  };

  createEffect(
    () => ({ input0: ref(), input1: state, isOpen: state.isOpen }),
    ({ isOpen }): undefined | (() => void) => {
      if (isOpen) {
        document.addEventListener("keydown", onKeyDown, true);

        return () => {
          document.removeEventListener("keydown", onKeyDown, true);
        };
      }

      return undefined;
    },
    { ssrSource: "client" }
  );

  const onHoverStart = () => {
    if (_result0.trigger === "focus") {
      return;
    }

    // In chrome, if you hover a trigger, then another element obscures it, due to keyboard
    // interactions for example, hover will end. When hover is restored after that element disappears,
    // focus moves on for example, then the tooltip will reopen. We check the modality to know if the hover
    // is the result of moving the mouse.
    isHovered = getInteractionModality() === "pointer";

    handleShow();
  };

  const onHoverEnd = () => {
    if (_result0.trigger === "focus") {
      return;
    }

    // no matter how the trigger is left, we should close the tooltip
    isFocused = false;
    isHovered = false;
    handleHide();
  };

  const onPressStart = () => {
    // if shouldCloseOnPress is false, we should not close the tooltip
    if (!(_result0.shouldCloseOnPress ?? true)) {
      return;
    }

    // no matter how the trigger is pressed, we should close the tooltip
    isFocused = false;
    isHovered = false;
    handleHide(true);
  };

  const onFocus = () => {
    const isVisible = isFocusVisible();

    if (isVisible) {
      isFocused = true;
      handleShow();
    }
  };

  const onBlur = () => {
    isFocused = false;
    isHovered = false;
    handleHide(true);
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

  const _result2 = createFocusable(
    {
      get isDisabled() {
        return _result0.isDisabled;
      },
      get onBlur() {
        return onBlur;
      },
      get onFocus() {
        return onFocus;
      },
    },
    ref
  );

  return {
    get tooltipProps() {
      return {
        get id() {
          return tooltipId();
        },
      };
    },
    get triggerProps() {
      return merge(
        {
          get "aria-describedby"() {
            return ariaValue(ariaValue(state.isOpen ? tooltipId() : undefined));
          },
        },
        mergeProps(_result2.focusableProps, _result1.hoverProps, {
          onKeyDown: onPressStart,
          onPointerDown: onPressStart,
          onPointerMove(event: PointerEvent) {
            if (
              !isHovered &&
              (event.pointerType === "mouse" || event.pointerType === "pen")
            ) {
              onHoverStart();
            }
          },
        }),
        {
          tabindex: undefined,
        }
      );
    },
  };
}
