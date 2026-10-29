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
 * Derived from Adobe React Spectrum: packages/react-stately/src/menu/useMenuTriggerState.ts.
 * Modified for Solid Aria: adapted imports, collection descriptors, and reactive state APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { FocusStrategy, Key } from "@solid2-aria/types-shared";
import { createSignal, merge } from "solid-js";

import { createOverlayTriggerState } from "../overlays/create-overlay-trigger-state";
import type {
  OverlayTriggerProps,
  OverlayTriggerState,
} from "../overlays/create-overlay-trigger-state";

export type MenuTriggerType = "press" | "longPress" | "contextMenu";

export interface MenuTriggerProps extends OverlayTriggerProps {
  /**
   * How the menu is triggered.
   *
   * @default 'press'
   */
  trigger?: MenuTriggerType;
}

export interface MenuTriggerState extends OverlayTriggerState {
  /** Controls which item will be auto focused when the menu opens. */
  readonly focusStrategy: FocusStrategy | null;
  /** Opens the menu. */
  open: (focusStrategy?: FocusStrategy | null) => void;
  /** Toggles the menu. */
  toggle: (focusStrategy?: FocusStrategy | null) => void;
}

export interface RootMenuTriggerState extends MenuTriggerState {
  /** Opens a specific submenu tied to a specific menu item at a specific level. */
  openSubmenu: (triggerKey: Key, level: number) => void;
  /** Closes a specific submenu tied to a specific menu item at a specific level. */
  closeSubmenu: (triggerKey: Key, level: number) => void;
  /**
   * An array of open submenu trigger keys within the menu tree.
   * The index of key within array matches the submenu level in the tree.
   */
  expandedKeysStack: Key[];
  /** Closes the menu and all submenus in the menu tree. */
  close: () => void;
}

/**
 * Manages state for a menu trigger. Tracks whether the menu is currently open,
 * and controls which item will receive focus when it opens. Also tracks the open submenus within
 * the menu tree via their trigger keys.
 */
export function createMenuTriggerState(
  props: MenuTriggerProps
): RootMenuTriggerState {
  const overlay = createOverlayTriggerState(props);

  const [focusStrategy, setFocusStrategy] = createSignal<FocusStrategy | null>(
    null,
    { ownedWrite: true }
  );

  const [expandedKeysStack, setExpandedKeysStack] = createSignal<Key[]>([], {
    ownedWrite: true,
  });

  return merge(overlay, {
    close() {
      setExpandedKeysStack([]);
      overlay.close();
    },
    closeSubmenu(key: Key, level: number) {
      setExpandedKeysStack((stack) =>
        stack[level] === key ? stack.slice(0, level) : stack
      );
    },
    get expandedKeysStack() {
      return expandedKeysStack();
    },
    get focusStrategy() {
      return focusStrategy();
    },
    open(strategy: FocusStrategy | null = null) {
      setFocusStrategy(strategy);
      overlay.open();
    },
    openSubmenu(key: Key, level: number) {
      setExpandedKeysStack((stack) =>
        level > stack.length ? stack : [...stack.slice(0, level), key]
      );
    },
    toggle(strategy: FocusStrategy | null = null) {
      setFocusStrategy(strategy);
      overlay.toggle();
    },
  });
}
