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
 * Derived from Adobe React Spectrum: packages/react-aria/src/menu/useMenuItem.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { getItemCount } from "@solid2-aria/stately/collections/get-item-count";
import type { SelectionManager } from "@solid2-aria/stately/selection/selection-manager";
import type { TreeState } from "@solid2-aria/stately/tree/create-tree-state";
import type {
  KeyboardEvent,
  DOMProps,
  FocusableElement,
  FocusEvents,
  HoverEvents,
  Key,
  KeyboardEvents,
  PressEvent,
  PressEvents,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { untrack, merge, createMemo } from "solid-js";
import type { Accessor } from "solid-js";

import {
  isFocusVisible,
  setInteractionModality,
} from "../interactions/create-focus-visible";
import { createFocusable } from "../interactions/create-focusable";
import { createHover } from "../interactions/create-hover";
import { createKeyboard } from "../interactions/create-keyboard";
import { createPress } from "../interactions/create-press";
import { createSelectableItem } from "../selection/create-selectable-item";
import type { MouseEvent } from "../types";
import { ariaValue } from "../utils/aria-value";
import { createSlotId } from "../utils/create-id";
import { requireHTMLElement } from "../utils/dom-value";
import { filterDOMProps } from "../utils/filter-dom-props";
import { getCollectionNodeProps } from "../utils/get-collection-node-props";
import { isPresent } from "../utils/is-present";
import { getLegacyOption } from "../utils/legacy-option";
import { mergeProps } from "../utils/merge-props";
import {
  handleLinkClick,
  createLinkProps,
  createRouter,
} from "../utils/open-link";
import { requireValue } from "../utils/require-value";
import { getEventTarget } from "../utils/shadowdom/dom-functions";
import { getTruthyValue, isTruthy } from "../utils/truthy";
import { menuData } from "./utils";

export interface MenuItemAria {
  /** Props for the menu item element. */
  menuItemProps: DOMAttributes;
  /** Props for the main text element inside the menu item. */
  labelProps: DOMAttributes;
  /** Props for the description text element inside the menu item, if any. */
  descriptionProps: DOMAttributes;
  /** Props for the keyboard shortcut text element inside the item, if any. */
  keyboardShortcutProps: DOMAttributes;
  /** Whether the item is currently focused. */
  isFocused: boolean;
  /** Whether the item is keyboard focused. */
  isFocusVisible: boolean;
  /** Whether the item is currently selected. */
  isSelected: boolean;
  /** Whether the item is currently in a pressed state. */
  isPressed: boolean;
  /** Whether the item is disabled. */
  isDisabled: boolean;
}

export interface AriaMenuItemProps
  extends DOMProps, PressEvents, HoverEvents, KeyboardEvents, FocusEvents {
  /**
   * Whether the menu item is disabled.
   *
   * @deprecated - pass disabledKeys to useTreeState instead.
   */
  isDisabled?: boolean;
  /**
   * Whether the menu item is selected.
   *
   * @deprecated - pass selectedKeys to useTreeState instead.
   */
  isSelected?: boolean;
  /** A screen reader only label for the menu item. */
  "aria-label"?: string;
  /** The unique key for the menu item. */
  key: Key;
  /**
   * Handler that is called when the menu should close after selecting an item.
   *
   * @deprecated - pass to the menu instead.
   */
  onClose?: () => void;
  /**
   * Whether the menu should close when the menu item is selected.
   *
   * @deprecated - use shouldCloseOnSelect instead.
   */
  closeOnSelect?: boolean;
  /** Whether the menu should close when the menu item is selected. */
  shouldCloseOnSelect?: boolean;
  /** Whether the menu item is contained in a virtual scrolling menu. */
  isVirtualized?: boolean;
  /**
   * Handler that is called when the user activates the item.
   *
   * @deprecated - pass to the menu instead.
   */
  onAction?: (key: Key) => void;
  /** What kind of popup the item opens. */
  "aria-haspopup"?: "menu" | "dialog";
  /** Indicates whether the menu item's popup element is expanded or collapsed. */
  "aria-expanded"?: boolean | "true" | "false";
  /**
   * Identifies the menu item's popup element whose contents or presence is controlled by the menu
   * item.
   */
  "aria-controls"?: string;
  /** Identifies the element(s) that describe the menu item. */
  "aria-describedby"?: string;
  /** Override of the selection manager. By default, `state.selectionManager` is used. */
  selectionManager?: SelectionManager;
}

/**
 * Provides the behavior and accessibility implementation for an item in a menu.
 * See `useMenu` for more details about menus.
 *
 * @param props - Props for the item.
 * @param state - State for the menu, as returned by `useTreeState`.
 */
export function createMenuItem<T>(
  props: AriaMenuItemProps,
  state: TreeState<T>,
  ref: Accessor<FocusableElement | null>
): MenuItemAria {
  const _result0 = props;
  const isTrigger = createMemo(() => !!_result0["aria-haspopup"]);

  const isTriggerExpanded = createMemo(
    () => isTrigger() && props["aria-expanded"] === "true"
  );

  const isDisabled = createMemo(
    () =>
      getLegacyOption(props, "isDisabled") ??
      (_result0.selectionManager ?? state.selectionManager).isDisabled(
        _result0.key
      )
  );

  const isSelected = createMemo(
    () =>
      getLegacyOption(props, "isSelected") ??
      (_result0.selectionManager ?? state.selectionManager).isSelected(
        _result0.key
      )
  );

  const data = createMemo(() =>
    requireValue(menuData.get(state), "Expected menuData.get(state)")
  );

  const item = createMemo(() => state.collection.getItem(_result0.key));

  const onClose = createMemo(
    () => getTruthyValue(getLegacyOption(props, "onClose")) ?? data().onClose
  );

  const router = createRouter();

  const performAction = () => {
    if (isTrigger()) {
      return;
    }

    const currentItem = item();

    if (
      currentItem !== null &&
      isTruthy(getCollectionNodeProps(currentItem)?.onAction)
    ) {
      getCollectionNodeProps(currentItem).onAction?.();
    } else if (getLegacyOption(props, "onAction")) {
      getLegacyOption(props, "onAction")?.call(props, _result0.key);
    }

    if (data().onAction) {
      // Must reassign to variable otherwise `this` binding gets messed up. Something to do with WeakMap.
      const { onAction } = data();
      onAction?.(_result0.key, item()?.value);
    }
  };

  const role = createMemo<DOMAttributes["role"]>(() => {
    const { selectionMode } =
      _result0.selectionManager ?? state.selectionManager;

    if (isTrigger()) {
      return "menuitem";
    }

    if (selectionMode === "single") {
      return "menuitemradio";
    }

    if (selectionMode === "multiple") {
      return "menuitemcheckbox";
    }

    return "menuitem";
  });

  const labelId = createSlotId();
  const descriptionId = createSlotId();
  const keyboardId = createSlotId();

  const ariaProps = createMemo<DOMAttributes>(() => ({
    "aria-checked":
      (_result0.selectionManager ?? state.selectionManager).selectionMode !==
        "none" && !isTrigger()
        ? ariaValue(isSelected())
        : undefined,
    "aria-controls": ariaValue(props["aria-controls"]),
    "aria-describedby": ariaValue(
      [props["aria-describedby"], descriptionId(), keyboardId()]
        .filter(Boolean)
        .join(" ") || undefined
    ),
    "aria-disabled": ariaValue(isDisabled() || undefined),
    "aria-expanded": ariaValue(props["aria-expanded"]),
    "aria-haspopup": ariaValue(_result0["aria-haspopup"]),
    "aria-label": ariaValue(props["aria-label"]),
    "aria-labelledby": ariaValue(labelId()),
    "aria-posinset":
      isTruthy(_result0.isVirtualized) && item()
        ? requireValue(item(), "Expected item()").index + 1
        : undefined,
    "aria-setsize": isTruthy(_result0.isVirtualized)
      ? getItemCount(state.collection)
      : undefined,
    id: _result0.id,
    role: role(),
  }));

  let isPressedRef = false;

  const onPressChange = (isPressed: boolean) => {
    _result0.onPressChange?.(isPressed);
    isPressedRef = isPressed;
  };

  let interaction: {
    pointerType: string;
    key?: string;
  } | null = null;

  const onPressUp = (e: PressEvent) => {
    if (e.pointerType !== "keyboard") {
      interaction = { pointerType: e.pointerType };
    }

    // If interacting with mouse, allow the user to mouse down on the trigger button,
    // drag, and release over an item (matching native behavior).
    if (e.pointerType === "mouse" && !isPressedRef) {
      requireHTMLElement(e.target).click();
    }

    _result0.onPressUp?.(e);
  };

  const onClick = (e: MouseEvent<FocusableElement>) => {
    _result0.onClick?.(e);
    performAction();
    handleLinkClick(
      e,
      router,
      getCollectionNodeProps(requireValue(item(), "Expected item()")).href,
      getCollectionNodeProps(item()).routerOptions
    );

    // Close except if multi-select is enabled.
    // Always close when pressing Enter key, or if item is not selectable.
    let shouldClose =
      interaction?.pointerType === "keyboard"
        ? interaction?.key === "Enter" ||
          (_result0.selectionManager ?? state.selectionManager)
            .selectionMode === "none" ||
          (_result0.selectionManager ?? state.selectionManager).isLink(
            _result0.key
          )
        : (_result0.selectionManager ?? state.selectionManager)
            .selectionMode !== "multiple" ||
          (_result0.selectionManager ?? state.selectionManager).isLink(
            _result0.key
          );

    shouldClose =
      _result0.shouldCloseOnSelect ??
      getLegacyOption(_result0, "closeOnSelect") ??
      shouldClose;

    if (onClose() && !isTrigger() && shouldClose) {
      onClose()?.();
    }

    interaction = null;
  };

  // because we handle it ourselves. The behavior of menus
  // is slightly different from other collections because
  const _result1 = createSelectableItem({
    get allowsDifferentPressOrigin(): true {
      return true;
    },
    get id() {
      return _result0.id;
    },
    get key() {
      return _result0.key;
    },
    // Disable all handling of links in useSelectable item
    // actions are performed on key down rather than key up.
    get linkBehavior(): "none" {
      return "none" as const;
    },
    get ref() {
      return ref;
    },
    get selectionManager() {
      return _result0.selectionManager ?? state.selectionManager;
    },
    get shouldSelectOnPressUp(): true {
      return true;
    },
    get shouldUseVirtualFocus() {
      return data().shouldUseVirtualFocus;
    },
  });

  const _result2 = createPress({
    get isDisabled() {
      return isDisabled();
    },
    get onPress() {
      return _result0.onPress;
    },
    get onPressChange() {
      return onPressChange;
    },
    get onPressEnd() {
      return _result0.onPressEnd;
    },
    get onPressStart() {
      return _result0.onPressStart;
    },
    get onPressUp() {
      return onPressUp;
    },
  });

  const _result3 = createHover({
    get isDisabled() {
      return isDisabled();
    },
    get onHoverChange() {
      return _result0.onHoverChange;
    },
    get onHoverEnd() {
      return _result0.onHoverEnd;
    },
    onHoverStart(e) {
      // Hovering over an already expanded sub dialog trigger should keep focus in the dialog.
      if (
        !isFocusVisible() &&
        (!isTriggerExpanded() || !_result0["aria-haspopup"])
      ) {
        (_result0.selectionManager ?? state.selectionManager).setFocused(true);
        (_result0.selectionManager ?? state.selectionManager).setFocusedKey(
          _result0.key
        );
      }

      _result0.onHoverStart?.(e);
    },
  });

  const _result4 = createKeyboard({
    get onKeyDown() {
      return _result0.onKeyDown;
    },
    get onKeyUp() {
      return _result0.onKeyUp;
    },
    get shortcuts() {
      return {
        " ": (e: KeyboardEvent) => {
          interaction = { key: " ", pointerType: "keyboard" };
          requireHTMLElement(getEventTarget(e)).click();
          // click above sets modality to "virtual", need to set interaction modality back to 'keyboard' so focusSafely calls properly move focus
          // to the newly opened submenu's first item.
          setInteractionModality("keyboard");
        },
        Enter: (
          e: KeyboardEvent
        ):
          | undefined
          | {
              shouldContinuePropagation: boolean;
              shouldPreventDefault: boolean;
            } => {
          interaction = { key: "Enter", pointerType: "keyboard" };
          const target = requireHTMLElement(getEventTarget(e));

          // Trigger click unless this is a link. Links with real DOM focus activate on Enter natively.
          // With virtual focus (e.g. Autocomplete) focus stays on the input and useAutocomplete dispatches
          // keydown here then follows with a synthetic click only if dispatchEvent was not canceled—so
          // links must not preventDefault on that keydown.
          if (target.tagName !== "A") {
            target.click();
            setInteractionModality("keyboard");

            return undefined;
          }

          setInteractionModality("keyboard");

          return {
            shouldContinuePropagation: false,
            shouldPreventDefault: false,
          };
        },
      };
    },
  });

  const _result5 = createFocusable(
    {
      get onBlur() {
        return _result0.onBlur;
      },
      get onFocus() {
        return _result0.onFocus;
      },
      get onFocusChange() {
        return _result0.onFocusChange;
      },
    },
    ref
  );

  const domProps = createMemo(() =>
    filterDOMProps(getCollectionNodeProps(item()))
  );

  delete untrack(domProps).id;
  const linkProps = createLinkProps(getCollectionNodeProps(item()));

  return {
    get descriptionProps() {
      return {
        get id() {
          return descriptionId();
        },
      };
    },
    get isDisabled() {
      return isDisabled();
    },
    get isFocusVisible() {
      return (
        _result1.isFocused &&
        (_result0.selectionManager ?? state.selectionManager).isFocused &&
        isFocusVisible() &&
        !isTriggerExpanded()
      );
    },
    get isFocused() {
      return _result1.isFocused;
    },
    get isPressed() {
      return _result2.isPressed;
    },
    get isSelected() {
      return isSelected();
    },
    get keyboardShortcutProps() {
      return {
        get id() {
          return keyboardId();
        },
      };
    },
    get labelProps() {
      return {
        get id() {
          return labelId();
        },
      };
    },
    get menuItemProps() {
      return merge(
        ariaProps(),
        mergeProps(
          domProps(),
          linkProps,
          isTrigger()
            ? {
                "data-collection":
                  "data-collection" in _result1.itemProps
                    ? _result1.itemProps["data-collection"]
                    : undefined,
                "data-key":
                  "data-key" in _result1.itemProps
                    ? _result1.itemProps["data-key"]
                    : undefined,
                onFocus: _result1.itemProps.onFocus,
              }
            : _result1.itemProps,
          _result2.pressProps,
          _result3.hoverProps,
          _result4.keyboardProps,
          _result5.focusableProps,
          // Prevent DOM focus from moving on mouse down when using virtual focus or this is a submenu/subdialog trigger.
          isTruthy(data().shouldUseVirtualFocus) || isTrigger()
            ? {
                onMouseDown: (e: globalThis.MouseEvent) => {
                  e.preventDefault();
                },
              }
            : undefined,

          isDisabled() ? undefined : { onClick }
        ),
        {
          get tabindex() {
            return isPresent(_result1.itemProps.tabindex) &&
              isTriggerExpanded() &&
              !isTruthy(data().shouldUseVirtualFocus)
              ? -1
              : _result1.itemProps.tabindex;
          },
        }
      );
    },
  };
}
