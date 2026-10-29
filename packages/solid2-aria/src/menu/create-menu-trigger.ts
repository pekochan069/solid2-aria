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
 * Derived from Adobe React Spectrum: packages/react-aria/src/menu/useMenuTrigger.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  MenuTriggerState,
  MenuTriggerType,
} from "@solid2-aria/stately/menu/create-menu-trigger-state";
import type {
  PressEvent,
  FocusStrategy,
  KeyboardEvent,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { merge, omit, createMemo, createEffect } from "solid-js";
import type { Accessor } from "solid-js";

import intlMessages from "../../intl/menu/index";
import type { AriaButtonProps } from "../button/create-button";
import { createLocalizedStringFormatter } from "../i18n/create-localized-string-formatter";
import { createContextMenu } from "../interactions/create-context-menu";
import { createKeyboard } from "../interactions/create-keyboard";
import { createLongPress } from "../interactions/create-long-press";
import { createOverlayTrigger } from "../overlays/create-overlay-trigger";
import { ariaValue } from "../utils/aria-value";
import { createId } from "../utils/create-id";
import { requireFocusableElement } from "../utils/dom-value";
import { focusWithoutScrolling } from "../utils/focus-without-scrolling";
import { getEventTarget } from "../utils/shadowdom/dom-functions";
import { getTruthyValue, isTruthy } from "../utils/truthy";
import type { AriaMenuOptions } from "./create-menu";

export interface AriaMenuTriggerProps {
  /** The type of menu that the menu trigger opens. */
  type?: "menu" | "listbox";
  /** Whether menu trigger is disabled. */
  isDisabled?: boolean;
  /** How menu is triggered. */
  trigger?: MenuTriggerType;
}

export interface MenuTriggerAria<T> {
  /** Props for the menu trigger element. */
  menuTriggerProps: AriaButtonProps;
  /** Props for the menu. */
  menuProps: AriaMenuOptions<T>;
}

/**
 * Provides the behavior and accessibility implementation for a menu trigger.
 *
 * @param props - Props for the menu trigger.
 * @param state - State for the menu trigger.
 * @param ref - Ref to the HTML element trigger for the menu.
 */
export function createMenuTrigger<T>(
  props: AriaMenuTriggerProps,
  state: MenuTriggerState,
  ref: Accessor<Element | null>
): MenuTriggerAria<T> {
  const _result0 = props;
  const menuTriggerId = createId();

  const { triggerProps, overlayProps } = createOverlayTrigger(
    {
      get type() {
        return _result0.type ?? "menu";
      },
    },
    state,
    ref
  );

  const open = (
    shouldOpen: boolean,
    e: KeyboardEvent,
    focusStrategy: FocusStrategy = "first"
  ): boolean | undefined => {
    if (!shouldOpen || e.defaultPrevented) {
      return false;
    }

    state.toggle(focusStrategy);

    return undefined;
  };

  // React puts listeners on the same root, so even if propagation was stopped, immediate propagation is still possible.
  // useTypeSelect will handle the spacebar first if it's running, so we don't want to open if it's handled it already.
  // We use isDefaultPrevented() instead of isPropagationStopped() because createEventHandler stops propagation by default.
  // And default prevented means that the event was handled by something else (typeahead), so we don't want to open the menu.
  const _result1 = createKeyboard({
    get isDisabled() {
      return _result0.isDisabled;
    },
    get shortcuts() {
      return {
        " ": (e: KeyboardEvent) =>
          open((_result0.trigger ?? "press") !== "longPress", e, "first"),
        "Alt+ ": (e: KeyboardEvent) =>
          open((_result0.trigger ?? "press") === "longPress", e, "first"),
        // Alt+Arrow* must open for both trigger modes: for `press` it matches the same `e.key` cases as
        // plain Arrow*; for `longPress`, plain arrows are ignored elsewhere and Alt+Arrow is the opener
        // (see legacy `if (trigger === 'longPress' && !e.altKey) return` before the ArrowDown/Up switch).
        "Alt+ArrowDown": (e: KeyboardEvent) => open(true, e, "first"),
        "Alt+ArrowUp": (e: KeyboardEvent) => open(true, e, "last"),
        "Alt+Enter": (e: KeyboardEvent) =>
          open((_result0.trigger ?? "press") === "longPress", e, "first"),
        ArrowDown: (e: KeyboardEvent) =>
          open((_result0.trigger ?? "press") !== "longPress", e, "first"),
        ArrowUp: (e: KeyboardEvent) =>
          open((_result0.trigger ?? "press") !== "longPress", e, "last"),
        Enter: (e: KeyboardEvent) =>
          open((_result0.trigger ?? "press") !== "longPress", e, "first"),
      };
    },
  });

  const stringFormatter = createLocalizedStringFormatter(
    intlMessages,
    "@react-aria/menu"
  );

  const _result2 = createLongPress({
    get accessibilityDescription() {
      return stringFormatter.format("longPressMessage");
    },
    get isDisabled() {
      return (
        getTruthyValue(_result0.isDisabled) ??
        (_result0.trigger ?? "press") !== "longPress"
      );
    },
    onLongPress() {
      state.open("first");
    },
    onLongPressStart() {
      state.close();
    },
  });

  const pressProps = createMemo(() => ({
    onPress(e: PressEvent) {
      if (e.pointerType === "touch" && !isTruthy(_result0.isDisabled)) {
        // Ensure trigger has focus before opening the menu so it can be restored by FocusScope on close.
        focusWithoutScrolling(requireFocusableElement(e.target));
        state.toggle();
      }
    },
    onPressStart(e: PressEvent) {
      // For consistency with native, open the menu on mouse/key down, but touch up.
      if (
        e.pointerType !== "touch" &&
        e.pointerType !== "keyboard" &&
        !isTruthy(_result0.isDisabled)
      ) {
        // Ensure trigger has focus before opening the menu so it can be restored by FocusScope on close.
        focusWithoutScrolling(requireFocusableElement(e.target));
        // If opened with a screen reader, auto focus the first item.
        // Otherwise, the menu itself will be focused.
        state.open(e.pointerType === "virtual" ? "first" : null);
      }
    },
    preventFocusOnPress: true,
  }));
  // omit onPress from triggerProps since we override it above.

  delete triggerProps.onPress;

  const _result3 = createContextMenu({
    onContextMenu(e) {
      // This is not a DOM event, so the linter is incorrect.

      const rect = e.target.getBoundingClientRect();
      state.setPoint({ x: rect.x + e.x, y: rect.y + e.y });
      state.open();
    },
  });

  createEffect(
    () => ({ isOpen: state.isOpen, trigger: _result0.trigger ?? "press" }),
    ({ trigger, isOpen }): undefined | (() => void) => {
      // Close context menus when right clicking outside. The browser's context menu will appear instead.
      if (isOpen && trigger === "contextMenu") {
        const onContextMenu = (e: MouseEvent) => {
          // Checking if the target is the body works because everything outside the menu is inert.
          if (
            (e.button === 2 || (e.button === 0 && e.ctrlKey)) &&
            getEventTarget(e) === document.body
          ) {
            state.close();
          }
        };

        document.addEventListener("mousedown", onContextMenu);

        return () => {
          document.removeEventListener("mousedown", onContextMenu);
        };
      }

      return undefined;
    },
    { ssrSource: "client" }
  );

  const interactionProps = createMemo((): undefined | DOMAttributes => {
    switch (_result0.trigger ?? "press") {
      case "press": {
        return merge(pressProps(), _result1.keyboardProps);
      }

      case "longPress": {
        return merge(_result2.longPressProps, _result1.keyboardProps);
      }

      case "contextMenu": {
        return _result3.contextMenuProps;
      }

      default: {
        break;
      }
    }

    return undefined;
  });

  return {
    get menuProps() {
      return merge(overlayProps, {
        get "aria-labelledby"() {
          return ariaValue(ariaValue(menuTriggerId()));
        },
        get autoFocus() {
          return getTruthyValue(state.focusStrategy) ?? true;
        },
        get onClose() {
          return state.close;
        },
      });
    },
    get menuTriggerProps() {
      const merged = merge(
        _result0.trigger === "contextMenu"
          ? // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
            omit(
              triggerProps,
              "aria-haspopup",
              "aria-expanded",
              "aria-controls"
            )
          : // oxlint-enable solid/reactivity
            triggerProps,
        interactionProps()
      );

      return merge(
        omit(
          merged,
          "aria-label",
          "aria-labelledby",
          "aria-describedby",
          "aria-details",
          "aria-controls",
          "onFocus",
          "onBlur"
        ),
        {
          get "aria-controls"() {
            const value = merged["aria-controls"];

            return typeof value === "string" ? value : undefined;
          },
          get "aria-describedby"() {
            const value = merged["aria-describedby"];

            return typeof value === "string" ? value : undefined;
          },
          get "aria-details"() {
            const value = merged["aria-details"];

            return typeof value === "string" ? value : undefined;
          },
          get "aria-label"() {
            const value = merged["aria-label"];

            return typeof value === "string" ? value : undefined;
          },
          get "aria-labelledby"() {
            const value = merged["aria-labelledby"];

            return typeof value === "string" ? value : undefined;
          },
          get id() {
            return menuTriggerId();
          },
        }
      );
    },
  };
}
