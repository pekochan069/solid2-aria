/*
 * Copyright 2023 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-stately/src/menu/useSubmenuTriggerState.ts.
 * Modified for Solid Aria: adapted imports, collection descriptors, and reactive state APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { FocusStrategy, Key } from "@solid2-aria/types-shared";
import { createSignal, untrack } from "solid-js";

import type { OverlayTriggerState } from "../overlays/create-overlay-trigger-state";
import type { RootMenuTriggerState } from "./create-menu-trigger-state";

export interface SubmenuTriggerProps {
  /** Key of the trigger item. */
  triggerKey: Key;
}

export interface SubmenuTriggerState extends OverlayTriggerState {
  /** Whether the submenu is currently open. */
  isOpen: boolean;
  /** Controls which item will be auto focused when the submenu opens. */
  focusStrategy: FocusStrategy | null;
  /** Opens the submenu. */
  open: (focusStrategy?: FocusStrategy | null) => void;
  /** Closes the submenu. */
  close: () => void;
  /** Closes all menus and submenus in the menu tree. */
  closeAll: () => void;
  /** The level of the submenu. */
  submenuLevel: number;
  /** Toggles the submenu. */
  toggle: (focusStrategy?: FocusStrategy | null) => void;
  /** @private */
  setOpen: () => void;
}

/**
 * Manages state for a submenu trigger. Tracks whether the submenu is currently open, the level of
 * the submenu, and controls which item will receive focus when it opens.
 */
export function createSubmenuTriggerState(
  props: SubmenuTriggerProps,
  state: RootMenuTriggerState
): SubmenuTriggerState {
  const submenuLevel = untrack(() => state.expandedKeysStack.length);

  const [focusStrategy, setFocusStrategy] = createSignal<FocusStrategy | null>(
    null,
    { ownedWrite: true }
  );

  const isOpen = () =>
    state.expandedKeysStack[submenuLevel] === props.triggerKey;

  function open(strategy: FocusStrategy | null = null) {
    setFocusStrategy(strategy);
    state.openSubmenu(props.triggerKey, submenuLevel);
  }

  function close() {
    setFocusStrategy(null);
    state.closeSubmenu(props.triggerKey, submenuLevel);
  }

  return {
    close,
    closeAll: () => {
      state.close();
    },
    get focusStrategy() {
      return focusStrategy();
    },
    get isOpen() {
      return isOpen();
    },
    open,
    point: null,
    setOpen: () => {
      /* Synchronization is performed in the tracked phase. */
    },
    setPoint: () => {
      /* Synchronization is performed in the tracked phase. */
    },
    submenuLevel,
    toggle(strategy) {
      if (isOpen()) {
        close();
      } else {
        open(strategy);
      }
    },
  };
}
