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
 * Derived from Adobe React Spectrum: packages/react-aria/src/menu/useSubmenuTrigger.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { SubmenuTriggerState } from "@solid2-aria/stately/menu/create-submenu-trigger-state";
import type {
  KeyboardEvent,
  FocusableElement,
  FocusStrategy,
  Node,
  PressEvent,
} from "@solid2-aria/types-shared";
import { createMemo, createEffect } from "solid-js";
import type { Accessor } from "solid-js";

import { createLocale } from "../i18n/i18n-provider";
import { createKeyboard } from "../interactions/create-keyboard";
import type { AriaPopoverProps } from "../overlays/create-popover";
import type { OverlayProps } from "../overlays/overlay";
import { ariaValue } from "../utils/aria-value";
import { createEvent } from "../utils/create-event";
import { createId } from "../utils/create-id";
import { requireElement, requireHTMLElement } from "../utils/dom-value";
import { focusWithoutScrolling } from "../utils/focus-without-scrolling";
import {
  getActiveElement,
  getEventTarget,
  isFocusWithin,
  nodeContains,
} from "../utils/shadowdom/dom-functions";
import { isTruthy } from "../utils/truthy";
import type { AriaMenuOptions } from "./create-menu";
import type { AriaMenuItemProps } from "./create-menu-item";
import { createSafelyMouseToSubmenu } from "./create-safely-mouse-to-submenu";

export interface AriaSubmenuTriggerProps {
  /**
   * An object representing the submenu trigger menu item. Contains all the relevant information
   * that makes up the menu item.
   *
   * @deprecated
   */
  node?: Node<unknown>;
  /** Whether the submenu trigger is disabled. */
  isDisabled?: boolean;
  /** The type of the contents that the submenu trigger opens. */
  type?: "dialog" | "menu";
  /** Ref of the menu that contains the submenu trigger. */
  parentMenuRef: Accessor<HTMLElement | null>;
  /** Ref of the submenu opened by the submenu trigger. */
  submenuRef: Accessor<HTMLElement | null>;
  /**
   * The delay time in milliseconds for the submenu to appear after hovering over the trigger.
   *
   * @default 200
   */
  delay?: number;
  /** Whether the submenu trigger uses virtual focus. */
  shouldUseVirtualFocus?: boolean;
}

interface SubmenuTriggerProps extends Omit<
  AriaMenuItemProps,
  "key" | "onAction"
> {
  /** Whether the submenu trigger is in an expanded state. */
  isOpen: boolean;
}

interface SubmenuProps<T> extends AriaMenuOptions<T> {
  /** The level of the submenu. */
  submenuLevel: number;
}

export interface SubmenuTriggerAria<T> {
  /** Props for the submenu trigger menu item. */
  submenuTriggerProps: SubmenuTriggerProps;
  /** Props for the submenu controlled by the submenu trigger menu item. */
  submenuProps: SubmenuProps<T>;
  /** Props for the submenu's popover container. */
  popoverProps: Pick<
    AriaPopoverProps,
    "isNonModal" | "shouldCloseOnInteractOutside"
  > &
    Pick<OverlayProps, "disableFocusManagement">;
}

/**
 * Provides the behavior and accessibility implementation for a submenu trigger and its associated
 * submenu.
 *
 * @param props - Props for the submenu trigger and refs attach to its submenu and parent menu.
 * @param state - State for the submenu trigger.
 * @param ref - Ref to the submenu trigger element.
 */
export function createSubmenuTrigger<T>(
  props: AriaSubmenuTriggerProps,
  state: SubmenuTriggerState,
  ref: Accessor<FocusableElement | null>
): SubmenuTriggerAria<T> {
  const _result0 = props;
  const submenuTriggerId = createId();
  const overlayId = createId();
  const _result1 = createLocale();

  let openTimeout: ReturnType<typeof setTimeout> | undefined;

  const cancelOpenTimeout = () => {
    if (openTimeout) {
      clearTimeout(openTimeout);
      openTimeout = undefined;
    }
  };

  const onSubmenuOpen = (focusStrategy?: FocusStrategy) => {
    cancelOpenTimeout();
    state.open(focusStrategy);
  };

  const onSubmenuClose = () => {
    cancelOpenTimeout();
    state.close();
  };

  createEffect(
    () => ({ input0: cancelOpenTimeout }),
    ({ input0 }) =>
      () => {
        input0();
      },
    { ssrSource: "client" }
  );

  const _result2 = createKeyboard({
    get shortcuts() {
      return {
        ArrowLeft: (e: KeyboardEvent): undefined | false => {
          const refElement = ref();

          // If focus is not within the menu, assume virtual focus is being used.
          // This means some other input element is also within the popover, so we shouldn't close the menu.
          if (!isFocusWithin(requireElement(e.currentTarget))) {
            return false;
          }

          if (
            _result1.direction === "ltr" &&
            nodeContains(
              requireElement(e.currentTarget),
              requireElement(getEventTarget(e))
            )
          ) {
            onSubmenuClose();

            if (!isTruthy(_result0.shouldUseVirtualFocus) && refElement) {
              focusWithoutScrolling(refElement);
            }

            return undefined;
          }

          return false;
        },
        ArrowRight: (e: KeyboardEvent): undefined | false => {
          const refElement = ref();

          if (!isFocusWithin(requireElement(e.currentTarget))) {
            return false;
          }

          if (
            _result1.direction === "rtl" &&
            nodeContains(
              requireElement(e.currentTarget),
              requireElement(getEventTarget(e))
            )
          ) {
            onSubmenuClose();

            if (!isTruthy(_result0.shouldUseVirtualFocus) && refElement) {
              focusWithoutScrolling(refElement);
            }

            return undefined;
          }

          return false;
        },
        Escape: (e: KeyboardEvent): undefined | false => {
          const result0submenuRefElement = _result0.submenuRef();
          const refElement = ref();

          if (!isFocusWithin(requireElement(e.currentTarget))) {
            return false;
          }

          if (
            nodeContains(
              result0submenuRefElement,
              requireElement(getEventTarget(e))
            )
          ) {
            onSubmenuClose();

            if (!isTruthy(_result0.shouldUseVirtualFocus) && refElement) {
              focusWithoutScrolling(refElement);
            }

            return undefined;
          }

          return false;
        },
      };
    },
  });

  const submenuProps = createMemo(() => ({
    "aria-labelledby": ariaValue(submenuTriggerId()),
    id: overlayId(),
    submenuLevel: state.submenuLevel,
    ...((_result0.type ?? "menu") === "menu" && {
      autoFocus: state.focusStrategy ?? undefined,
      onClose: state.closeAll,
      onKeyDown: _result2.keyboardProps.onKeyDown,
      onKeyUp: _result2.keyboardProps.onKeyUp,
    }),
  }));

  const _result3 = createKeyboard({
    get shortcuts() {
      return {
        ArrowLeft: (): undefined | false => {
          const result0submenuRefElement = _result0.submenuRef?.();
          const refElement = ref?.();

          if (!isTruthy(_result0.isDisabled)) {
            if (_result1.direction === "rtl") {
              if (!state.isOpen) {
                onSubmenuOpen("first");
              }

              if (
                (_result0.type ?? "menu") === "menu" &&
                !!result0submenuRefElement &&
                getActiveElement() === refElement
              ) {
                focusWithoutScrolling(result0submenuRefElement);
              }

              return undefined;
            } else if (state.isOpen) {
              onSubmenuClose();

              return undefined;
            }

            return false;
          }

          return false;
        },
        ArrowRight: (): undefined | false => {
          const result0submenuRefElement = _result0.submenuRef?.();
          const refElement = ref?.();

          if (!isTruthy(_result0.isDisabled)) {
            if (_result1.direction === "ltr") {
              if (!state.isOpen) {
                onSubmenuOpen("first");
              }

              if (
                (_result0.type ?? "menu") === "menu" &&
                !!result0submenuRefElement &&
                getActiveElement() === refElement
              ) {
                focusWithoutScrolling(result0submenuRefElement);
              }

              return undefined;
            } else if (state.isOpen) {
              onSubmenuClose();

              return undefined;
            }

            return false;
          }

          return false;
        },
      };
    },
  });

  const onPressStart = (e: PressEvent) => {
    if (
      !isTruthy(_result0.isDisabled) &&
      (e.pointerType === "virtual" || e.pointerType === "keyboard")
    ) {
      // If opened with a screen reader or keyboard, auto focus the first submenu item.
      onSubmenuOpen("first");
    }
  };

  const onPress = (e: PressEvent) => {
    if (
      !isTruthy(_result0.isDisabled) &&
      (e.pointerType === "touch" || e.pointerType === "mouse")
    ) {
      // For touch or on a desktop device with a small screen open on press up to possible problems with
      // press up happening on the newly opened tray items
      onSubmenuOpen();
    }
  };

  const onHoverChange = (isHovered: boolean) => {
    if (!isTruthy(_result0.isDisabled)) {
      if (isHovered && !state.isOpen) {
        openTimeout ??= setTimeout(() => {
          onSubmenuOpen();
        }, _result0.delay ?? 200);
      } else if (!isHovered) {
        cancelOpenTimeout();
      }
    }
  };

  createEvent(_result0.parentMenuRef, "focusin", (e: FocusEvent) => {
    // If we detect focus moved to a different item in the same menu that the currently open submenu trigger is in
    // then close the submenu. This is for a case where the user hovers a root menu item when multiple submenus are open
    if (
      state.isOpen &&
      nodeContains(
        _result0.parentMenuRef(),
        requireHTMLElement(getEventTarget(e))
      ) &&
      getEventTarget(e) !== ref()
    ) {
      onSubmenuClose();
    }
  });

  const shouldCloseOnInteractOutside = (target: Element) => {
    if (target !== ref()) {
      return true;
    }

    return false;
  };

  createSafelyMouseToSubmenu({
    get isDisabled() {
      return _result0.isDisabled;
    },
    get isOpen() {
      return state.isOpen;
    },
    get menuRef() {
      return _result0.parentMenuRef;
    },
    get submenuRef() {
      return _result0.submenuRef;
    },
  });

  return {
    get popoverProps() {
      return {
        get isNonModal(): true {
          return true;
        },
        get shouldCloseOnInteractOutside() {
          return shouldCloseOnInteractOutside;
        },
      };
    },
    get submenuProps() {
      return submenuProps();
    },
    get submenuTriggerProps() {
      return {
        get "aria-controls"() {
          return ariaValue(ariaValue(state.isOpen ? overlayId() : undefined));
        },
        get "aria-expanded"() {
          return ariaValue(ariaValue(state.isOpen ? "true" : "false"));
        },
        get "aria-haspopup"() {
          return ariaValue(
            ariaValue(
              isTruthy(_result0.isDisabled)
                ? undefined
                : (_result0.type ?? "menu")
            )
          );
        },
        get id() {
          return submenuTriggerId();
        },
        get isOpen() {
          return state.isOpen;
        },
        get onHoverChange() {
          return onHoverChange;
        },
        get onKeyDown() {
          return _result3.keyboardProps.onKeyDown;
        },
        get onKeyUp() {
          return _result3.keyboardProps.onKeyUp;
        },
        get onPress() {
          return onPress;
        },
        get onPressStart() {
          return onPressStart;
        },
      };
    },
  };
}
