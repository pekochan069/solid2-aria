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
 * Derived from Adobe React Spectrum: packages/react-aria/src/selection/useSelectableItem.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { MultipleSelectionManager } from "@solid2-aria/stately/selection/types";
import type {
  DOMProps,
  FocusableElement,
  Key,
  LongPressEvent,
  PointerType,
  PressEvent,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { createMemo, createEffect, merge, untrack } from "solid-js";
import type { Accessor } from "solid-js";

import { moveVirtualFocus } from "../focus/virtual-focus";
import { createLongPress } from "../interactions/create-long-press";
import { createPress } from "../interactions/create-press";
import type { PressHookProps } from "../interactions/create-press";
import { focusSafely } from "../interactions/focus-safely";
import { chain } from "../utils/chain";
import { createEvent } from "../utils/create-event";
import { createId } from "../utils/create-id";
import { elementOrNull } from "../utils/dom-value";
import { getCollectionNodeProps } from "../utils/get-collection-node-props";
import { isTabbable } from "../utils/is-focusable";
import { isPresent } from "../utils/is-present";
import { isCtrlKeyPressed } from "../utils/keyboard";
import { mergeProps } from "../utils/merge-props";
import { openLink, createRouter } from "../utils/open-link";
import { requireValue } from "../utils/require-value";
import {
  getActiveElement,
  getEventTarget,
} from "../utils/shadowdom/dom-functions";
import { getTruthyValue, isTruthy } from "../utils/truthy";
import { getCollectionId, isNonContiguousSelectionModifier } from "./utils";

export interface SelectableItemOptions extends DOMProps {
  UNSTABLE_itemBehavior?: "action";
  /**
   * An interface for reading and updating multiple selection state.
   */
  selectionManager: MultipleSelectionManager;
  /**
   * A unique key for the item.
   */
  key: Key;
  /**
   * Ref to the item.
   */
  ref: Accessor<FocusableElement | null>;
  /**
   * By default, selection occurs on pointer down. This can be strange if selecting an
   * item causes the UI to disappear immediately (e.g. menus).
   */
  shouldSelectOnPressUp?: boolean;
  /**
   * Whether selection requires the pointer/mouse down and up events to occur on the same target or
   * triggers selection on the target of the pointer/mouse up event.
   */
  allowsDifferentPressOrigin?: boolean;
  /**
   * Whether the option is contained in a virtual scroller.
   */
  isVirtualized?: boolean;
  /**
   * Function to focus the item.
   */
  focus?: () => void;
  /**
   * Whether the option should use virtual focus instead of being focused directly.
   */
  shouldUseVirtualFocus?: boolean;
  /** Whether the item is disabled. */
  isDisabled?: boolean;
  /**
   * Handler that is called when a user performs an action on the item. The exact user event depends
   * on the collection's `selectionBehavior` prop and the interaction modality.
   */
  onAction?: () => void;
  /**
   * The behavior of links in the collection.
   * - 'action': link behaves like onAction.
   * - 'selection': link follows selection interactions (e.g. if URL drives selection).
   * - 'override': links override all other interactions (link items are not selectable).
   * - 'none': links are disabled for both selection and actions (e.g. handled elsewhere).
   *
   * @default 'action'
   */
  linkBehavior?: "action" | "selection" | "override" | "none";
}

export interface SelectableItemStates {
  /** Whether the item is currently in a pressed state. */
  isPressed: boolean;
  /** Whether the item is currently selected. */
  isSelected: boolean;
  /** Whether the item is currently focused. */
  isFocused: boolean;
  /**
   * Whether the item is non-interactive, i.e. both selection and actions are disabled and the item
   * may not be focused. Dependent on `disabledKeys` and `disabledBehavior`.
   */
  isDisabled: boolean;
  /**
   * Whether the item may be selected, dependent on `selectionMode`, `disabledKeys`, and
   * `disabledBehavior`.
   */
  allowsSelection: boolean;
  /**
   * Whether the item has an action, dependent on `onAction`, `disabledKeys`,
   * and `disabledBehavior`. It may also change depending on the current selection state
   * of the list (e.g. when selection is primary). This can be used to enable or disable hover
   * styles or other visual indications of interactivity.
   */
  hasAction: boolean;
}

export interface SelectableItemAria extends SelectableItemStates {
  /**
   * Props to be spread on the item root node.
   */
  itemProps: DOMAttributes & {
    "data-collection"?: string;
    "data-key"?: Key;
  };
}

/**
 * Handles interactions with an item in a selectable collection.
 */
export function createSelectableItem(
  options: SelectableItemOptions
): SelectableItemAria {
  const id = createId(() => options.id);

  const isDisabled = createMemo(
    () =>
      getTruthyValue(options.isDisabled) ??
      options.selectionManager.isDisabled(options.key)
  );

  const router = createRouter();

  function selectItem(e: PressEvent | LongPressEvent | PointerEvent): void {
    if (options.selectionManager.selectionMode === "single") {
      if (
        options.selectionManager.isSelected(options.key) &&
        !isTruthy(options.selectionManager.disallowEmptySelection)
      ) {
        options.selectionManager.toggleSelection(options.key);
      } else {
        options.selectionManager.replaceSelection(options.key);
      }
    } else if (isTruthy(e) && e.shiftKey) {
      options.selectionManager.extendSelection(options.key);
    } else if (
      options.selectionManager.selectionBehavior === "toggle" ||
      (isTruthy(e) &&
        (isCtrlKeyPressed(e) ||
          e.pointerType === "touch" ||
          e.pointerType === "virtual"))
    ) {
      // if touch or virtual (VO) then we just want to toggle, otherwise it's impossible to multi select because they don't have modifier keys
      options.selectionManager.toggleSelection(options.key);
    } else {
      options.selectionManager.replaceSelection(options.key);
    }
  }

  const onSelect = (e: PressEvent | LongPressEvent | PointerEvent) => {
    const optionsrefElement = options.ref();

    if (e.pointerType === "keyboard" && isNonContiguousSelectionModifier(e)) {
      options.selectionManager.toggleSelection(options.key);
    } else {
      if (options.selectionManager.selectionMode === "none") {
        return;
      }

      if (options.selectionManager.isLink(options.key)) {
        if (
          (options.linkBehavior ?? "action") === "selection" &&
          optionsrefElement
        ) {
          const itemProps = getCollectionNodeProps({
            props: options.selectionManager.getItemProps(options.key),
          });

          router.open(
            optionsrefElement,
            e,
            requireValue(itemProps.href, "Expected link href"),
            itemProps.routerOptions
          );
          // Always set selected keys back to what they were so that select and combobox close.
          options.selectionManager.setSelectedKeys(
            options.selectionManager.selectedKeys
          );

          return;
        } else if (
          (options.linkBehavior ?? "action") === "override" ||
          (options.linkBehavior ?? "action") === "none"
        ) {
          return;
        }
      }

      selectItem(e);
    }
  };

  // Focus the associated DOM node when this item becomes the focusedKey
  createEffect(
    () => ({
      element: options.ref(),
      focusedKey: options.selectionManager.focusedKey,
      input3: options.selectionManager.childFocusStrategy,
      key: options.key,
      observedIsFocused: options.selectionManager.isFocused,
      shouldUseVirtualFocus: options.shouldUseVirtualFocus,
    }),
    ({
      shouldUseVirtualFocus,
      observedIsFocused,
      focusedKey,
      key,
      element,
    }) => {
      const optionsrefElement = element;
      const isFocused = key === focusedKey;

      if (isFocused && observedIsFocused) {
        if (isTruthy(shouldUseVirtualFocus)) {
          moveVirtualFocus(optionsrefElement);
        } else if (options.focus) {
          untrack(options.focus);
        } else if (
          getActiveElement() !== optionsrefElement &&
          optionsrefElement
        ) {
          untrack(() => {
            focusSafely(optionsrefElement);
          });
        }
      }
    },
    { ssrSource: "client" }
  );

  // Set tabIndex to 0 if the element is focused, or -1 otherwise so that only the last focused
  // item is tabbable.  If using virtual focus, don't set a tabIndex at all so that VoiceOver
  // on iOS 14 doesn't try to move real DOM focus to the item anyway.
  const itemProps = createMemo<SelectableItemAria["itemProps"]>(() => {
    if (!isTruthy(options.shouldUseVirtualFocus) && !isDisabled()) {
      return {
        onFocus(e) {
          if (getEventTarget(e) === options.ref()) {
            options.selectionManager.setFocusedKey(options.key);
          }
        },
        tabindex: options.key === options.selectionManager.focusedKey ? 0 : -1,
      };
    }

    return isDisabled()
      ? {
          onMouseDown: (e) => {
            e.preventDefault();
          },
        }
      : {};
  });

  createEffect(
    () => ({
      focusedKey: options.selectionManager.focusedKey,
      isDisabled: isDisabled(),
      key: options.key,
      selectionManager: options.selectionManager,
    }),
    ({ selectionManager, key, focusedKey, isDisabled: currentIsDisabled }) => {
      if (currentIsDisabled && focusedKey === key) {
        selectionManager.setFocusedKey(null);
      }
    },
    { ssrSource: "client" }
  );

  // With checkbox selection, onAction (i.e. navigation) becomes primary, and occurs on a single click of the row.
  // Clicking the checkbox enters selection mode, after which clicking anywhere on any row toggles selection for that row.
  // With highlight selection, onAction is secondary, and occurs on double click. Single click selects the row.
  // With touch, onAction occurs on single tap, and long press enters selection mode.
  const isLinkOverride = createMemo(
    () =>
      options.selectionManager.isLink(options.key) &&
      (options.linkBehavior ?? "action") === "override"
  );

  const isActionOverride = createMemo(
    () => options.onAction && options.UNSTABLE_itemBehavior === "action"
  );

  const hasLinkAction = createMemo(
    () =>
      options.selectionManager.isLink(options.key) &&
      (options.linkBehavior ?? "action") !== "selection" &&
      (options.linkBehavior ?? "action") !== "none"
  );

  const allowsSelection = createMemo(
    () =>
      !isDisabled() &&
      options.selectionManager.canSelectItem(options.key) &&
      !isLinkOverride() &&
      !isTruthy(isActionOverride())
  );

  const allowsActions = createMemo(
    () => (!!options.onAction || hasLinkAction()) && !isDisabled()
  );

  const hasPrimaryAction = createMemo(
    () =>
      allowsActions() &&
      (options.selectionManager.selectionBehavior === "replace"
        ? !allowsSelection()
        : !allowsSelection() || options.selectionManager.isEmpty)
  );

  const hasSecondaryAction = createMemo(
    () =>
      allowsActions() &&
      allowsSelection() &&
      options.selectionManager.selectionBehavior === "replace"
  );

  const hasAction = createMemo(
    () => hasPrimaryAction() || hasSecondaryAction()
  );

  let modality: PointerType | null = null;

  const longPressEnabled = createMemo(() => hasAction() && allowsSelection());

  let longPressEnabledOnPressStart = false;
  let hadPrimaryActionOnPressStart = false;

  const collectionItemProps = createMemo(() =>
    getCollectionNodeProps({
      props: options.selectionManager.getItemProps(options.key),
    })
  );

  const performAction = (
    e: PressEvent | LongPressEvent | globalThis.MouseEvent
  ) => {
    const optionsrefElement = options.ref();

    if (options.onAction) {
      options.onAction();
      optionsrefElement?.dispatchEvent(
        new CustomEvent("react-aria-item-action", { bubbles: true })
      );
    }

    if (hasLinkAction() && optionsrefElement) {
      router.open(
        optionsrefElement,
        e,
        requireValue(collectionItemProps().href, "Expected link href"),
        collectionItemProps().routerOptions
      );
    }
  };

  // By default, selection occurs on pointer down. This can be strange if selecting an
  // item causes the UI to disappear immediately (e.g. menus).
  // If shouldSelectOnPressUp is true, we use onPressUp instead of onPressStart.
  // onPress requires a pointer down event on the same element as pointer up. For menus,
  // we want to be able to have the pointer down on the trigger that opens the menu and
  // the pointer up on the menu item rather than requiring a separate press.
  // For keyboard events, selection still occurs on key down.
  const collectionId = createMemo(() =>
    getCollectionId(options.selectionManager.collection)
  );

  const pressOptions = createMemo<PressHookProps>(() => {
    let itemPressProps: PressHookProps = { ref: options.ref };

    if (isTruthy(options.shouldSelectOnPressUp)) {
      itemPressProps.onPressStart = (e) => {
        untrack(() => {
          modality = e.pointerType;
          longPressEnabledOnPressStart = longPressEnabled();

          if (
            e.pointerType === "keyboard" &&
            (!hasAction() || isSelectionKey(e.key))
          ) {
            onSelect(e);
          }
        });
      };

      // If allowsDifferentPressOrigin and interacting with mouse, make selection happen on pressUp (e.g. open menu on press down, selection on menu item happens on press up.)
      // Otherwise, have selection happen onPress (prevents listview row selection when clicking on interactable elements in the row)
      if (isTruthy(options.allowsDifferentPressOrigin)) {
        itemPressProps.onPressUp = hasPrimaryAction()
          ? undefined
          : // oxlint-disable-next-line solid/reactivity -- The returned callback runs in its consumer's scope.
            (e) => {
              if (e.pointerType === "mouse" && allowsSelection()) {
                onSelect(e);
              }
            };

        itemPressProps.onPress = hasPrimaryAction()
          ? performAction
          : // oxlint-disable-next-line solid/reactivity -- The returned callback runs in its consumer's scope.
            (e) => {
              if (
                e.pointerType !== "keyboard" &&
                e.pointerType !== "mouse" &&
                allowsSelection()
              ) {
                onSelect(e);
              }
            };
      } else {
        itemPressProps.onPress = (e) => {
          untrack(() => {
            if (
              hasPrimaryAction() ||
              (hasSecondaryAction() && e.pointerType !== "mouse")
            ) {
              if (e.pointerType === "keyboard" && !isActionKey(e.key)) {
                return;
              }

              performAction(e);
            } else if (e.pointerType !== "keyboard" && allowsSelection()) {
              onSelect(e);
            }
          });
        };
      }
    } else {
      itemPressProps.onPressStart = (e) => {
        untrack(() => {
          modality = e.pointerType;
          longPressEnabledOnPressStart = longPressEnabled();
          hadPrimaryActionOnPressStart = hasPrimaryAction();

          // Select on mouse down unless there is a primary action which will occur on mouse up.
          // For keyboard, select on key down. If there is an action, the Space key selects on key down,
          // and the Enter key performs onAction on key up.
          if (
            allowsSelection() &&
            ((e.pointerType === "mouse" && !hasPrimaryAction()) ||
              (e.pointerType === "keyboard" &&
                (!allowsActions() || isSelectionKey(e.key))))
          ) {
            onSelect(e);
          }
        });
      };

      itemPressProps.onPress = (e) => {
        untrack(() => {
          // Selection occurs on touch up. Primary actions always occur on pointer up.
          // Both primary and secondary actions occur on Enter key up. The only exception
          // is secondary actions, which occur on double click with a mouse.
          if (
            e.pointerType === "touch" ||
            e.pointerType === "pen" ||
            e.pointerType === "virtual" ||
            (e.pointerType === "keyboard" &&
              hasAction() &&
              isActionKey(e.key)) ||
            (e.pointerType === "mouse" && hadPrimaryActionOnPressStart)
          ) {
            if (hasAction()) {
              performAction(e);
            } else if (allowsSelection()) {
              onSelect(e);
            }
          }
        });
      };
    }

    itemPressProps.preventFocusOnPress = options.shouldUseVirtualFocus;

    // When using virtual focus, make sure the focused key gets updated on press.
    if (isTruthy(options.shouldUseVirtualFocus)) {
      itemPressProps = mergeProps(itemPressProps, {
        onPress(e: PressEvent) {
          if (e.pointerType === "touch") {
            options.selectionManager.setFocused(true);
            options.selectionManager.setFocusedKey(options.key);
          }
        },
        onPressStart(e: PressEvent) {
          if (e.pointerType !== "touch") {
            options.selectionManager.setFocused(true);
            options.selectionManager.setFocusedKey(options.key);
          }
        },
      });
    }

    if (isTruthy(collectionItemProps())) {
      if (isTruthy(collectionItemProps().onPressStart)) {
        itemPressProps.onPressStart = chain(
          itemPressProps.onPressStart,
          collectionItemProps().onPressStart
        );
      }

      if (isTruthy(collectionItemProps().onPressEnd)) {
        itemPressProps.onPressEnd = chain(
          itemPressProps.onPressEnd,
          collectionItemProps().onPressEnd
        );
      }

      if (isTruthy(collectionItemProps().onPressChange)) {
        itemPressProps.onPressChange = chain(
          itemPressProps.onPressChange,
          collectionItemProps().onPressChange
        );
      }

      if (isTruthy(collectionItemProps().onPress)) {
        itemPressProps.onPress = chain(
          itemPressProps.onPress,
          collectionItemProps().onPress
        );
      }

      if (isTruthy(collectionItemProps().onPressUp)) {
        itemPressProps.onPressUp = chain(
          itemPressProps.onPressUp,
          collectionItemProps().onPressUp
        );
      }

      if (isTruthy(collectionItemProps().onClick)) {
        itemPressProps.onClick = chain(
          itemPressProps.onClick,
          collectionItemProps().onClick
        );
      }
    }

    return itemPressProps;
  });

  const _result0 = createPress(merge(pressOptions));

  // Double clicking with a mouse with selectionBehavior = 'replace' performs an action.
  const onDblClick = createMemo(() =>
    hasSecondaryAction()
      ? // oxlint-disable-next-line solid/reactivity -- The returned callback runs in its consumer's scope.
        (e: globalThis.MouseEvent) => {
          if (modality === "mouse") {
            e.stopPropagation();
            e.preventDefault();
            performAction(e);
          }
        }
      : undefined
  );

  // Long pressing an item with touch when selectionBehavior = 'replace' switches the selection behavior
  // to 'toggle'. This changes the single tap behavior from performing an action (i.e. navigating) to
  // selecting, and may toggle the appearance of a UI affordance like checkboxes on each item.
  const _result1 = createLongPress({
    get isDisabled() {
      return !longPressEnabled();
    },
    onLongPress(e) {
      if (e.pointerType === "touch") {
        onSelect(e);
        options.selectionManager.setSelectionBehavior("toggle");
      }
    },
  });

  // Prevent native drag and drop on long press if we also select on long press.
  // Once the user is in selection mode, they can long press again to drag.
  // Use a capturing listener to ensure this runs before useDrag, regardless of
  // the order the props get merged.
  const onDragStartCapture = (e: globalThis.DragEvent) => {
    if (modality === "touch" && longPressEnabledOnPressStart) {
      e.preventDefault();
    }
  };

  createEvent(() => options.ref(), "dragstart", onDragStartCapture, {
    capture: true,
  });

  // Prevent default on link clicks so that we control exactly
  // when they open (to match selection behavior).
  const onClick =
    (options.linkBehavior ?? "action") !== "none" &&
    options.selectionManager.isLink(options.key)
      ? (e: globalThis.MouseEvent) => {
          if (!isTruthy(openLink.isOpening)) {
            e.preventDefault();
          }
        }
      : undefined;

  const isChildInteraction = (target: Element) => {
    let el: Element | null = target;

    while (el && el !== options.ref()) {
      const elCollection = el.attributes.getNamedItem("data-collection")?.value;

      if (isPresent(elCollection)) {
        return elCollection !== collectionId();
      }

      el = el.parentElement;
    }

    return isTabbable(target);
  };

  const mergedItemProps = createMemo(() => {
    const result = mergeProps(
      itemProps(),
      allowsSelection() ||
        hasPrimaryAction() ||
        (isTruthy(options.shouldUseVirtualFocus) && !isDisabled())
        ? _result0.pressProps
        : {},
      longPressEnabled() ? _result1.longPressProps : {},

      {
        "data-collection": collectionId(),
        "data-key": options.key,
        id: id(),
        onClick,
        onDblClick: onDblClick(),
      },
      // Prevent DOM focus from moving on mouse down when using virtual focus
      isTruthy(options.shouldUseVirtualFocus)
        ? {
            onMouseDown: (e: globalThis.MouseEvent) => {
              e.preventDefault();
            },
          }
        : undefined
    );

    // Guard against presses triggering selection when they happen on interactive children or collection items from different collections
    // will need to trigger selection if the target is itself a collection item belonging to the same collection parent (aka a cell in a row) but
    // not if the target is a child of a different collections aka taggroup in table cell.
    const baseOnPointerDown = result.onPointerDown;
    result.onPointerDown = (e) => {
      untrack(() => {
        const target: Element | null = getEventTarget(e);

        if (
          isTruthy(target) &&
          target !== options.ref() &&
          isChildInteraction(target)
        ) {
          e.stopPropagation();

          return;
        }

        baseOnPointerDown?.(e);
      });
    };

    const baseOnMouseDown = result.onMouseDown;
    result.onMouseDown = (e) => {
      untrack(() => {
        const target = elementOrNull(getEventTarget(e));

        if (
          isTruthy(target) &&
          target !== options.ref() &&
          isChildInteraction(target)
        ) {
          e.stopPropagation();

          return;
        }

        baseOnMouseDown?.(e);
      });
    };

    return result;
  });

  return {
    get allowsSelection() {
      return allowsSelection();
    },
    get hasAction() {
      return hasAction();
    },
    get isDisabled() {
      return isDisabled();
    },
    get isFocused() {
      return (
        options.selectionManager.isFocused &&
        options.selectionManager.focusedKey === options.key
      );
    },
    get isPressed() {
      return _result0.isPressed;
    },
    get isSelected() {
      return options.selectionManager.isSelected(options.key);
    },
    get itemProps() {
      return mergedItemProps();
    },
  };
}

function isActionKey(key: string | undefined) {
  return key === "Enter";
}

function isSelectionKey(key: string | undefined) {
  return key === " ";
}
