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
 * Derived from Adobe React Spectrum: packages/react-stately/src/tooltip/useTooltipTriggerState.ts.
 * Modified for Solid Aria: adapted imports, collection descriptors, and reactive state APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createSignal, onCleanup } from "solid-js";

import { createOverlayTriggerState } from "../overlays/create-overlay-trigger-state";
import type { OverlayTriggerProps } from "../overlays/create-overlay-trigger-state";

export interface TooltipTriggerProps extends OverlayTriggerProps {
  /**
   * Whether the tooltip should be disabled, independent from the trigger.
   */
  isDisabled?: boolean;
  /**
   * The delay time for the tooltip to show up. [See
   * guidelines](https://spectrum.adobe.com/web/rsp/components/tooltip#behaviors).
   *
   * @default 1500
   */
  delay?: number;
  /**
   * The delay time for the tooltip to close. [See
   * guidelines](https://spectrum.adobe.com/web/rsp/components/tooltip#behaviors).
   *
   * @default 500
   */
  closeDelay?: number;
  /**
   * By default, opens for both focus and hover. Can be made to open only for focus.
   *
   * @default 'hover'
   */
  trigger?: "hover" | "focus";
  /**
   * Whether the tooltip should close when the trigger is pressed.
   *
   * @default true
   */
  shouldCloseOnPress?: boolean;
}

// this seems to be a 1.5 second delay, check with design
const TOOLTIP_DELAY = 1500;
const TOOLTIP_COOLDOWN = 500;

export interface TooltipTriggerState {
  /** Whether the tooltip is currently showing. */
  isOpen: boolean;
  /**
   * Whether the tooltip is being shown or hidden without an animation. This is true while the
   * global warmup timer is active, i.e. when quickly moving between tooltips.
   */
  shouldSkipAnimation: boolean;
  /**
   * Shows the tooltip. By default, the tooltip becomes visible after a delay
   * depending on a global warmup timer. The `immediate` option shows the
   * tooltip immediately instead.
   */
  open: (immediate?: boolean) => void;
  /** Hides the tooltip. */
  close: (immediate?: boolean) => void;
}

const tooltips = new Map<
  string,
  (immediate?: boolean, instant?: boolean) => void
>();

let tooltipId = 0;
let globalWarmedUp = false;
let globalWarmUpTimeout: ReturnType<typeof setTimeout> | null = null;
let globalCooldownTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Manages state for a tooltip trigger. Tracks whether the tooltip is open, and provides
 * methods to toggle this state. Ensures only one tooltip is open at a time and controls
 * the delay for showing a tooltip.
 */
export function createTooltipTriggerState(
  props: TooltipTriggerProps = {}
): TooltipTriggerState {
  const overlay = createOverlayTriggerState(props);

  const open = () => {
    if (!(props.isDisabled === true)) {
      overlay.open();
    }
  };

  const close = () => {
    overlay.close();
  };

  // Whether the current open/close transition should skip its animation. Set when swapping
  // between tooltips during the global warmup period.
  const [shouldSkipAnimation, setIsInstant] = createSignal(false, {
    ownedWrite: true,
  });

  const id = `${(tooltipId += 1)}`;

  let closeTimeout: ReturnType<typeof setTimeout> | null = null;

  const ensureTooltipEntry = () => {
    tooltips.set(id, hideTooltip);
  };

  const closeOpenTooltips = () => {
    for (const [hideTooltipId, hide] of tooltips) {
      if (hideTooltipId !== id) {
        // Close other open tooltips instantly (no exit animation), since they are being
        // replaced by this one during the warmup period.
        hide(true, true);
        tooltips.delete(hideTooltipId);
      }
    }
  };

  const showTooltip = (instant?: boolean) => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
    }

    closeTimeout = null;
    closeOpenTooltips();
    ensureTooltipEntry();
    setIsInstant(instant === true);
    globalWarmedUp = true;
    open();

    if (globalWarmUpTimeout) {
      clearTimeout(globalWarmUpTimeout);
      globalWarmUpTimeout = null;
    }

    if (globalCooldownTimeout) {
      clearTimeout(globalCooldownTimeout);
      globalCooldownTimeout = null;
    }
  };

  function hideTooltip(immediate?: boolean, instant?: boolean) {
    setIsInstant(instant === true);

    if (immediate === true || (props.closeDelay ?? TOOLTIP_COOLDOWN) <= 0) {
      if (closeTimeout) {
        clearTimeout(closeTimeout);
      }

      closeTimeout = null;
      close();
    } else {
      closeTimeout ??= setTimeout(() => {
        closeTimeout = null;
        close();
      }, props.closeDelay ?? TOOLTIP_COOLDOWN);
    }

    if (globalWarmUpTimeout) {
      clearTimeout(globalWarmUpTimeout);
      globalWarmUpTimeout = null;
    }

    if (globalWarmedUp) {
      if (globalCooldownTimeout) {
        clearTimeout(globalCooldownTimeout);
      }

      globalCooldownTimeout = setTimeout(
        () => {
          tooltips.delete(id);
          globalCooldownTimeout = null;
          globalWarmedUp = false;
        },
        Math.max(TOOLTIP_COOLDOWN, props.closeDelay ?? TOOLTIP_COOLDOWN)
      );
    }
  }

  const warmupTooltip = () => {
    closeOpenTooltips();
    ensureTooltipEntry();

    if (!overlay.isOpen && !globalWarmedUp) {
      if (globalWarmUpTimeout) {
        clearTimeout(globalWarmUpTimeout);
      }

      globalWarmUpTimeout = setTimeout(() => {
        globalWarmUpTimeout = null;
        globalWarmedUp = true;
        // First tooltip in a sequence: animate in.
        showTooltip(false);
      }, props.delay ?? TOOLTIP_DELAY);
    } else if (!overlay.isOpen) {
      // Already warmed up: appear instantly without an animation.
      showTooltip(true);
    }
  };

  onCleanup(() => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
    }

    if (tooltips.has(id)) {
      tooltips.delete(id);

      if (globalWarmUpTimeout) {
        clearTimeout(globalWarmUpTimeout);
        globalWarmUpTimeout = null;
      }
    }

    if (tooltips.size === 0) {
      if (globalCooldownTimeout) {
        clearTimeout(globalCooldownTimeout);
      }

      globalCooldownTimeout = null;
      globalWarmedUp = false;
    }
  });

  return {
    close: hideTooltip,
    get isOpen() {
      return overlay.isOpen;
    },
    open: (immediate) => {
      if (props.isDisabled === true) {
        return;
      }

      if (
        !(immediate === true) &&
        (props.delay ?? TOOLTIP_DELAY) > 0 &&
        !closeTimeout
      ) {
        warmupTooltip();
      } else {
        // Immediate opens (e.g. focus, or (props.delay ?? TOOLTIP_DELAY) of 0) appear instantly without an animation
        // only if another tooltip is already warmed up.
        showTooltip(globalWarmedUp);
      }
    },
    get shouldSkipAnimation() {
      return shouldSkipAnimation();
    },
  };
}
