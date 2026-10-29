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
 * Derived from Adobe React Spectrum: packages/react-stately/src/overlays/useOverlayTriggerState.ts.
 * Modified for Solid Aria: adapted reactive state, getters, imports, and APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createSignal, untrack } from "solid-js";

import { createControlledSignal } from "../utils/create-controlled-signal";

export interface OverlayTriggerProps {
  /** Whether the overlay is open by default (controlled). */
  isOpen?: boolean;
  /** Whether the overlay is open by default (uncontrolled). */
  defaultOpen?: boolean;
  /** Handler that is called when the overlay's open state changes. */
  onOpenChange?: (isOpen: boolean) => void;
}

interface Point {
  x: number;
  y: number;
}

export interface OverlayTriggerState {
  /** Whether the overlay is currently open. */
  readonly isOpen: boolean;
  /** Sets whether the overlay is open. */
  setOpen: (isOpen: boolean) => void;
  /** Opens the overlay. */
  open: () => void;
  /** Closes the overlay. */
  close: () => void;
  /** Toggles the overlay's visibility. */
  toggle: () => void;
  /** The cursor position when the overlay was triggered, relative to the window viewport. */
  readonly point: Point | null;
  /** Sets the cursor position relative to the window viewport. */
  setPoint: (point: Point) => void;
}

/**
 * Manages state for an overlay trigger. Tracks whether the overlay is open, and provides
 * methods to toggle this state.
 */
export function createOverlayTriggerState(
  props: OverlayTriggerProps
): OverlayTriggerState {
  const [isOpen, setOpen] = createControlledSignal(
    () => props.isOpen,
    untrack(() => props.defaultOpen ?? false),
    (value) => {
      props.onOpenChange?.(value);
    }
  );

  const [point, setPoint] = createSignal<Point | null>(null, {
    ownedWrite: true,
  });

  const open = () => {
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
  };

  const toggle = () => {
    setOpen((previous) => !previous);
  };

  return {
    close,
    get isOpen() {
      return isOpen();
    },
    open,
    get point() {
      return point();
    },
    setOpen,
    setPoint: (value) => {
      setPoint(value);
    },
    toggle,
  };
}
