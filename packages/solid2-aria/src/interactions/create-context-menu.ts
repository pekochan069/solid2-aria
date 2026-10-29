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
 * Derived from Adobe React Spectrum: packages/react-aria/src/interactions/useContextMenu.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { DOMAttributes } from "@solid2-aria/types-shared-web";

import { mergeProps } from "../utils/merge-props";
import { isIOS, isMac } from "../utils/platform";
import { createLongPress } from "./create-long-press";

export interface ContextMenuEvent {
  /** The target element on which the event was triggered. */
  target: Element;
  /** X position relative to the target. */
  x: number;
  /** Y position relative to the target. */
  y: number;
}

export interface ContextMenuProps {
  /** Event that is called when a context menu is triggered. */
  onContextMenu?: (e: ContextMenuEvent) => void;
}

export interface ContextMenuAria {
  /** Props to spread on the target element. */
  contextMenuProps: DOMAttributes;
}

/**
 * Handles context menu events across mouse, touch, keyboard, and screen reader interactions.
 */
export function createContextMenu(props: ContextMenuProps): ContextMenuAria {
  // How to trigger context menu events on various platforms:
  // - macOS
  //   - Mouse right click
  //   - Control + click
  //   - Control + Enter (does not fire the contextmenu event in certain WebKit / Chrome versions - https://bugs.webkit.org/show_bug.cgi?id=302049, https://issues.chromium.org/issues/369897039)
  //   - Control + Option + Shift + M with VoiceOver
  // - Windows / Linux
  //   - Mouse right click
  //   - Shift + F10
  //   - Long press on a touch screen
  // - iOS
  //   - Long press (does not fire contextmenu event - https://bugs.webkit.org/show_bug.cgi?id=213953)
  // - Android
  //   - Long press

  let firedContextMenuEvent = false;

  // iOS does not fire the contextmenu event, so use long press.
  const _result1 = createLongPress({
    onLongPress(e) {
      if (firedContextMenuEvent) {
        firedContextMenuEvent = false;
      } else {
        props.onContextMenu?.({ target: e.target, x: e.x, y: e.y });
      }
    },
    onLongPressStart() {
      firedContextMenuEvent = false;
    },
  });

  return {
    get contextMenuProps() {
      return props.onContextMenu
        ? mergeProps(isIOS() ? _result1.longPressProps : {}, {
            onContextMenu(e) {
              e.stopPropagation();
              e.preventDefault();
              firedContextMenuEvent = true;
              const rect = e.currentTarget.getBoundingClientRect();
              props.onContextMenu?.({
                target: e.currentTarget,
                x: e.clientX - rect.x,
                y: e.clientY - rect.y,
              });
            },
            onKeyDown(e) {
              // macOS has a default keyboard shortcut to show the contextmenu: Ctrl + Enter.
              // However, some versions of Safari and Chrome do not trigger the contextmenu event.
              // Fixed in https://github.com/WebKit/WebKit/pull/62278 (currently in WekKit nightly) and
              // https://github.com/chromium/chromium/commit/268c876c191cd4712c2d1043aab9760fb71d9be5 (Chrome 147).
              // Remove this workaround once those are broadly available.
              // An additional bug still occurs when the target has a border-radius: https://bugs.webkit.org/show_bug.cgi?id=317496
              if (isMac() && e.ctrlKey && e.key === "Enter") {
                firedContextMenuEvent = false;
                const target = e.currentTarget;
                e.stopPropagation();
                setTimeout(() => {
                  if (firedContextMenuEvent) {
                    firedContextMenuEvent = false;
                  } else {
                    const rect = target.getBoundingClientRect();
                    props.onContextMenu?.({
                      target,
                      x: rect.width / 2,
                      y: rect.height / 2,
                    });
                  }
                }, 10);
              }
            },
          } satisfies DOMAttributes)
        : {};
    },
  };
}
