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
 * Derived from Adobe React Spectrum: packages/react-aria/src/selection/useSelectableCollection.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { MultipleSelectionManager } from "@solid2-aria/stately/selection/types";
import type {
  FocusableElement,
  FocusStrategy,
  Key,
  KeyboardDelegate,
  KeyboardEvent,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import {
  merge,
  createMemo,
  createEffect,
  flush,
  onSettled,
  untrack,
} from "solid-js";
import type { Accessor } from "solid-js";

import { getFocusableTreeWalker } from "../focus/focus-scope";
import { dispatchVirtualFocus, moveVirtualFocus } from "../focus/virtual-focus";
import { createLocale } from "../i18n/i18n-provider";
import { getInteractionModality } from "../interactions/create-focus-visible";
import { createKeyboard } from "../interactions/create-keyboard";
import type { KeyboardShortcutAction } from "../interactions/create-keyboard-shortcut-handler";
import { focusSafely } from "../interactions/focus-safely";
import type { FocusEvent } from "../types";
import { hasAnyBit } from "../utils/bit-mask";
import { CLEAR_FOCUS_EVENT, FOCUS_EVENT } from "../utils/constants";
import { createEvent } from "../utils/create-event";
import {
  elementOrNull,
  htmlElementOrNull,
  focusableElementOrNull,
} from "../utils/dom-value";
import { focusWithoutScrolling } from "../utils/focus-without-scrolling";
import { getCollectionNodeProps } from "../utils/get-collection-node-props";
import { isTabbable } from "../utils/is-focusable";
import { isPresent } from "../utils/is-present";
import { isCtrlKeyPressed } from "../utils/keyboard";
import { mergeProps } from "../utils/merge-props";
import { createRouter } from "../utils/open-link";
import { isMac } from "../utils/platform";
import { requireValue } from "../utils/require-value";
import { scrollIntoView, scrollIntoViewport } from "../utils/scroll-into-view";
import {
  getActiveElement,
  getEventTarget,
  isFocusWithin,
  nodeContains,
} from "../utils/shadowdom/dom-functions";
import { isTruthy } from "../utils/truthy";
import { createTypeSelect } from "./create-type-select";
import {
  getItemElement,
  isNonContiguousSelectionModifier,
  createCollectionId,
} from "./utils";

export interface AriaSelectableCollectionOptions {
  /**
   * An interface for reading and updating multiple selection state.
   */
  selectionManager: MultipleSelectionManager;
  /**
   * A delegate object that implements behavior for keyboard focus movement.
   */
  keyboardDelegate: KeyboardDelegate;
  /**
   * The ref attached to the element representing the collection.
   */
  ref: Accessor<HTMLElement | null>;
  /**
   * Whether the collection or one of its items should be automatically focused upon render.
   *
   * @default false
   */
  autoFocus?: boolean | FocusStrategy;
  /**
   * Whether focus should wrap around when the end/start is reached.
   *
   * @default false
   */
  shouldFocusWrap?: boolean;
  /**
   * Whether the collection allows empty selection.
   *
   * @default false
   */
  disallowEmptySelection?: boolean;
  /**
   * Whether the collection allows the user to select all items via keyboard shortcut.
   *
   * @default false
   */
  disallowSelectAll?: boolean;
  /**
   * Whether pressing the Escape should clear selection in the collection or not.
   *
   * @default 'clearSelection'
   */
  escapeKeyBehavior?: "clearSelection" | "none";
  /**
   * Whether selection should occur automatically on focus.
   *
   * @default false
   */
  selectOnFocus?: boolean;
  /**
   * Whether typeahead is disabled.
   *
   * @default false
   */
  disallowTypeAhead?: boolean;
  /**
   * Whether the collection items should use virtual focus instead of being focused directly.
   */
  shouldUseVirtualFocus?: boolean;
  /**
   * Whether navigation through tab key is enabled.
   */
  allowsTabNavigation?: boolean;
  /**
   * Whether the collection items are contained in a virtual scroller.
   */
  isVirtualized?: boolean;
  /**
   * The ref attached to the scrollable body. Used to provide automatic scrolling on item focus for
   * non-virtualized collections. If not provided, defaults to the collection ref.
   */
  scrollRef?: Accessor<HTMLElement | null>;
  /**
   * The behavior of links in the collection.
   * - 'action': link behaves like onAction.
   * - 'selection': link follows selection interactions (e.g. if URL drives selection).
   * - 'override': links override all other interactions (link items are not selectable).
   *
   * @default 'action'
   */
  linkBehavior?: "action" | "selection" | "override";
  /**
   * Which item in the collection to focus when tabbing into the collection. Overrides default
   * roving tab index like behavior.
   *
   * @private
   */
  UNSTABLE_focusOnEntry?: "first" | "last";
}

export interface SelectableCollectionAria {
  /** Props for the collection element. */
  collectionProps: DOMAttributes;
}

/**
 * Handles interactions with selectable collections.
 */
const withShiftSel = (key: string, handle1: KeyboardShortcutAction) => ({
  [isMac() ? `${key}+Shift+Alt` : `${key}+Shift+Control`]: handle1,
  [`${key}+Shift`]: handle1,
  [isMac() ? `${key}+Alt` : `${key}+Control`]: handle1,
  [key]: handle1,
});

export function createSelectableCollection(
  options: AriaSelectableCollectionOptions
): SelectableCollectionAria {
  const _result0 = options;
  const _result1 = createLocale();
  const router = createRouter();

  const navigateToKey = (
    e: KeyboardEvent,
    key: Key | undefined,
    childFocus?: FocusStrategy
  ): boolean | undefined => {
    if (isPresent(key)) {
      if (
        _result0.selectionManager.isLink(key) &&
        (_result0.linkBehavior ?? "action") === "selection" &&
        (_result0.selectOnFocus ??
          _result0.selectionManager.selectionBehavior === "replace") &&
        !isNonContiguousSelectionModifier(e)
      ) {
        // Set focused key and re-render synchronously to bring item into view if needed.
        _result0.selectionManager.setFocusedKey(key, childFocus);
        flush();

        const item = getItemElement(_result0.ref, key);

        const itemProps = getCollectionNodeProps({
          props: _result0.selectionManager.getItemProps(key),
        });

        if (item) {
          router.open(
            item,
            e,
            requireValue(itemProps.href, "Expected link href"),
            itemProps.routerOptions
          );

          return undefined;
        }

        return false;
      }

      _result0.selectionManager.setFocusedKey(key, childFocus);

      if (
        _result0.selectionManager.isLink(key) &&
        (_result0.linkBehavior ?? "action") === "override"
      ) {
        return false;
      }

      if (
        e.shiftKey &&
        _result0.selectionManager.selectionMode === "multiple"
      ) {
        _result0.selectionManager.extendSelection(key);

        return undefined;
      } else if (
        (_result0.selectOnFocus ??
          _result0.selectionManager.selectionBehavior === "replace") &&
        !isNonContiguousSelectionModifier(e)
      ) {
        _result0.selectionManager.replaceSelection(key);

        return undefined;
      }

      return undefined;
    }

    return false;
  };

  const arrowDown = (e: KeyboardEvent): undefined | false => {
    if (_result0.keyboardDelegate.getKeyBelow) {
      let nextKey = isPresent(_result0.selectionManager.focusedKey)
        ? _result0.keyboardDelegate.getKeyBelow?.(
            _result0.selectionManager.focusedKey
          )
        : _result0.keyboardDelegate.getFirstKey?.();

      if (!isPresent(nextKey) && (_result0.shouldFocusWrap ?? false)) {
        nextKey = _result0.keyboardDelegate.getFirstKey?.(
          _result0.selectionManager.focusedKey
        );
      }

      if (isPresent(nextKey)) {
        navigateToKey(e, nextKey);

        return undefined;
      }
    }

    return false;
  };

  const arrowUp = (e: KeyboardEvent): undefined | false => {
    if (_result0.keyboardDelegate.getKeyAbove) {
      let nextKey = isPresent(_result0.selectionManager.focusedKey)
        ? _result0.keyboardDelegate.getKeyAbove?.(
            _result0.selectionManager.focusedKey
          )
        : _result0.keyboardDelegate.getLastKey?.();

      if (!isPresent(nextKey) && (_result0.shouldFocusWrap ?? false)) {
        nextKey = _result0.keyboardDelegate.getLastKey?.(
          _result0.selectionManager.focusedKey
        );
      }

      if (isPresent(nextKey)) {
        navigateToKey(e, nextKey);

        return undefined;
      }
    }

    return false;
  };

  const home = (e: KeyboardEvent): undefined | false => {
    if (_result0.keyboardDelegate.getFirstKey) {
      if (_result0.selectionManager.focusedKey === null && e.shiftKey) {
        return false;
      }

      // Follow-up: should Home and End also be reversed in column reverse aka Home goes to top? Or should Home always to to the "first" (bottom)
      const firstKey: Key | null = _result0.keyboardDelegate.getFirstKey(
        _result0.selectionManager.focusedKey,
        isCtrlKeyPressed(e)
      );

      _result0.selectionManager.setFocusedKey(firstKey);

      if (isPresent(firstKey)) {
        if (
          isCtrlKeyPressed(e) &&
          e.shiftKey &&
          _result0.selectionManager.selectionMode === "multiple"
        ) {
          _result0.selectionManager.extendSelection(firstKey);

          return undefined;
        } else if (
          _result0.selectOnFocus ??
          _result0.selectionManager.selectionBehavior === "replace"
        ) {
          _result0.selectionManager.replaceSelection(firstKey);

          return undefined;
        }
      }

      return undefined;
    }

    return false;
  };

  const arrowLeft = (e: KeyboardEvent): undefined | false => {
    if (_result0.keyboardDelegate.getKeyLeftOf) {
      let nextKey: Key | undefined | null = isPresent(
        _result0.selectionManager.focusedKey
      )
        ? _result0.keyboardDelegate.getKeyLeftOf?.(
            _result0.selectionManager.focusedKey
          )
        : _result0.keyboardDelegate.getFirstKey?.();

      if (!isPresent(nextKey) && (_result0.shouldFocusWrap ?? false)) {
        nextKey =
          _result1.direction === "rtl"
            ? _result0.keyboardDelegate.getFirstKey?.(
                _result0.selectionManager.focusedKey
              )
            : _result0.keyboardDelegate.getLastKey?.(
                _result0.selectionManager.focusedKey
              );
      }

      if (isPresent(nextKey)) {
        navigateToKey(
          e,
          nextKey,
          _result1.direction === "rtl" ? "first" : "last"
        );

        return undefined;
      }
    }

    return false;
  };

  const arrowRight = (e: KeyboardEvent): undefined | false => {
    if (_result0.keyboardDelegate.getKeyRightOf) {
      let nextKey: Key | undefined | null = isPresent(
        _result0.selectionManager.focusedKey
      )
        ? _result0.keyboardDelegate.getKeyRightOf?.(
            _result0.selectionManager.focusedKey
          )
        : _result0.keyboardDelegate.getFirstKey?.();

      if (!isPresent(nextKey) && (_result0.shouldFocusWrap ?? false)) {
        nextKey =
          _result1.direction === "rtl"
            ? _result0.keyboardDelegate.getLastKey?.(
                _result0.selectionManager.focusedKey
              )
            : _result0.keyboardDelegate.getFirstKey?.(
                _result0.selectionManager.focusedKey
              );
      }

      if (isPresent(nextKey)) {
        navigateToKey(
          e,
          nextKey,
          _result1.direction === "rtl" ? "last" : "first"
        );

        return undefined;
      }
    }

    return false;
  };

  const end = (e: KeyboardEvent): undefined | false => {
    if (_result0.keyboardDelegate.getLastKey) {
      if (_result0.selectionManager.focusedKey === null && e.shiftKey) {
        return false;
      }

      const lastKey = _result0.keyboardDelegate.getLastKey(
        _result0.selectionManager.focusedKey,
        isCtrlKeyPressed(e)
      );

      _result0.selectionManager.setFocusedKey(lastKey);

      if (isPresent(lastKey)) {
        if (
          isCtrlKeyPressed(e) &&
          e.shiftKey &&
          _result0.selectionManager.selectionMode === "multiple"
        ) {
          _result0.selectionManager.extendSelection(lastKey);

          return undefined;
        } else if (
          _result0.selectOnFocus ??
          _result0.selectionManager.selectionBehavior === "replace"
        ) {
          _result0.selectionManager.replaceSelection(lastKey);

          return undefined;
        }
      }

      return undefined;
    }

    return false;
  };

  const pageDown = (e: KeyboardEvent) => {
    if (
      _result0.keyboardDelegate.getKeyPageBelow &&
      _result0.selectionManager.focusedKey !== null &&
      _result0.selectionManager.focusedKey !== undefined
    ) {
      const nextKey = _result0.keyboardDelegate.getKeyPageBelow(
        _result0.selectionManager.focusedKey
      );

      if (isPresent(nextKey)) {
        return navigateToKey(e, nextKey);
      }
    }

    return false;
  };

  const pageUp = (e: KeyboardEvent) => {
    if (
      _result0.keyboardDelegate.getKeyPageAbove &&
      _result0.selectionManager.focusedKey !== null &&
      _result0.selectionManager.focusedKey !== undefined
    ) {
      const nextKey = _result0.keyboardDelegate.getKeyPageAbove(
        _result0.selectionManager.focusedKey
      );

      if (isPresent(nextKey)) {
        return navigateToKey(e, nextKey);
      }
    }

    return false;
  };

  const aHandler = (): undefined | false => {
    if (
      _result0.selectionManager.selectionMode === "multiple" &&
      !(_result0.disallowSelectAll ?? false)
    ) {
      _result0.selectionManager.selectAll();

      return undefined;
    }

    return false;
  };

  const escape = (): undefined | false => {
    if (
      (_result0.escapeKeyBehavior ?? "clearSelection") === "clearSelection" &&
      !(_result0.disallowEmptySelection ?? false) &&
      _result0.selectionManager.selectedKeys.size !== 0
    ) {
      _result0.selectionManager.clearSelection();

      return undefined;
    }

    return false;
  };

  const tab = () => {
    const result0refElement = _result0.ref();

    if (!(_result0.allowsTabNavigation ?? false) && result0refElement) {
      // There may be elements that are "tabbable" inside a collection (e.g. in a grid cell).
      // However, collections should be treated as a single tab stop, with arrow key navigation internally.
      // We don't control the rendering of these, so we can't override the tabIndex to prevent tabbing.
      // Instead, we handle the Tab key, and move focus manually to the first/last tabbable element
      // in the collection, so that the browser default behavior will apply starting from that element
      // rather than the currently focused one.
      const walker = getFocusableTreeWalker(result0refElement, {
        tabbable: true,
      });

      let next;
      let last: FocusableElement | null;

      do {
        last = focusableElementOrNull(walker.lastChild());

        if (isTruthy(last)) {
          next = last;
        }
      } while (isTruthy(last));

      // If the active element is NOT tabbable but is contained by an element that IS tabbable (aka the cell), the browser will actually move focus to
      // the containing element. We need to special case this so that tab will move focus out of the grid instead of looping between
      // focusing the containing cell and back to the non-tabbable child element
      const activeElement = getActiveElement();

      if (
        next &&
        (!isFocusWithin(next) || (activeElement && !isTabbable(activeElement)))
      ) {
        focusWithoutScrolling(next);
      }
    }

    return { shouldContinuePropagation: true, shouldPreventDefault: false };
  };

  const shiftTab = () => {
    const result0refElement = _result0.ref();

    if (!(_result0.allowsTabNavigation ?? false) && result0refElement) {
      result0refElement.focus();
    }

    return { shouldContinuePropagation: true, shouldPreventDefault: false };
  };

  const _result2 = createKeyboard({
    get allowRepeats(): true {
      return true;
    },
    get shortcuts() {
      return merge(
        withShiftSel("ArrowDown", arrowDown),
        withShiftSel("ArrowUp", arrowUp),
        withShiftSel("ArrowLeft", arrowLeft),
        withShiftSel("ArrowRight", arrowRight),
        withShiftSel("PageDown", pageDown),
        withShiftSel("PageUp", pageUp)
      );
    },
  });

  const _result3 = createKeyboard({
    get shortcuts() {
      // Home and End check isCtrlKeyPressed, which is Meta on Mac, both to jump to the start/end of
      // the whole collection rather than the current row, and to extend the selection there.
      return merge(withShiftSel("Home", home), withShiftSel("End", end), {
        // withShiftSel only registers the non-contiguous selection modifier, which is Alt on Mac.
        get [isMac() ? "Home+Meta" : "Home+Control"]() {
          return home;
        },
        get [isMac() ? "End+Meta" : "End+Control"]() {
          return end;
        },
        get [isMac() ? "Home+Shift+Meta" : "Home+Shift+Control"]() {
          return home;
        },
        get [isMac() ? "End+Shift+Meta" : "End+Shift+Control"]() {
          return end;
        },
        get Escape() {
          return escape;
        },
        get "Mod+A"() {
          return aHandler;
        },
        get Tab() {
          return tab;
        },
        get "Tab+Shift"() {
          return shiftTab;
        },
      });
    },
  });

  // Store the scroll position so we can restore it later.
  /// Follow-up: should this happen all the time??
  let scrollPos = { left: 0, top: 0 };
  createEvent(
    () => (_result0.scrollRef ?? _result0.ref)(),
    "scroll",
    () => {
      scrollPos = {
        left: (_result0.scrollRef ?? _result0.ref)()?.scrollLeft ?? 0,
        top: (_result0.scrollRef ?? _result0.ref)()?.scrollTop ?? 0,
      };
    }
  );

  function restoreFocusedItem(
    modality: ReturnType<typeof getInteractionModality>
  ): void {
    if (
      isPresent(_result0.selectionManager.focusedKey) &&
      (_result0.scrollRef ?? _result0.ref)()
    ) {
      // Refocus and scroll the focused item into view if it exists within the scrollable region.
      const element = getItemElement(
        _result0.ref,
        _result0.selectionManager.focusedKey
      );

      if (element instanceof HTMLElement) {
        // This prevents a flash of focus on the first/last element in the collection, or the collection itself.
        if (
          !isFocusWithin(element) &&
          !isTruthy(_result0.shouldUseVirtualFocus)
        ) {
          focusWithoutScrolling(element);
        }

        if (
          modality === "keyboard" ||
          (_result0.UNSTABLE_focusOnEntry && modality === "virtual")
        ) {
          scrollIntoViewport(element, {
            containingElement: _result0.ref(),
          });
        }
      }
    }
  }

  const onFocus = (e: FocusEvent) => {
    if (_result0.selectionManager.isFocused) {
      // If a focus event bubbled through a portal, reset focus state.
      if (!nodeContains(e.currentTarget, getEventTarget(e))) {
        _result0.selectionManager.setFocused(false);
      }

      return;
    }

    // Focus events can bubble through portals. Ignore these events.
    if (!nodeContains(e.currentTarget, getEventTarget(e))) {
      return;
    }

    const modality = getInteractionModality();
    _result0.selectionManager.setFocused(true);

    const navigateToKeyValue = (key: Key | undefined | null) => {
      if (isPresent(key)) {
        _result0.selectionManager.setFocusedKey(key);

        if (
          (_result0.selectOnFocus ??
            _result0.selectionManager.selectionBehavior === "replace") &&
          !_result0.selectionManager.isSelected(key)
        ) {
          _result0.selectionManager.replaceSelection(key);
        }
      }
    };

    // we need the "virtual" modality case checks here because shift tabbing from the prompt field's attachment card back into the
    // thread is a virtual focus event (the tab handler in onKeyDown focuses the ref of the attachmentList aka TagGroup via a focus() call, hence the virtual modality)
    if (_result0.UNSTABLE_focusOnEntry && isFocusEntryModality(modality)) {
      // always go to the first item in the Thread when tabbing forwards/backwards into the collection
      // since it is probably more important to the user to see the new prompt reply rather than go to the last focused key
      navigateToKeyValue(
        _result0.UNSTABLE_focusOnEntry === "first"
          ? _result0.keyboardDelegate.getFirstKey?.()
          : _result0.keyboardDelegate.getLastKey?.()
      );
    } else if (!isPresent(_result0.selectionManager.focusedKey)) {
      // If the user hasn't yet interacted with the collection, there will be no focusedKey set.
      // Attempt to detect whether the user is tabbing forward or backward into the collection
      // and either focus the first or last item accordingly.
      const relatedTarget = elementOrNull(e.relatedTarget);

      if (
        isTruthy(relatedTarget) &&
        hasAnyBit(
          e.currentTarget.compareDocumentPosition(relatedTarget),
          Node.DOCUMENT_POSITION_FOLLOWING
        )
      ) {
        navigateToKeyValue(
          _result0.selectionManager.lastSelectedKey ??
            _result0.keyboardDelegate.getLastKey?.()
        );
      } else {
        navigateToKeyValue(
          _result0.selectionManager.firstSelectedKey ??
            _result0.keyboardDelegate.getFirstKey?.()
        );
      }
    } else if ((_result0.scrollRef ?? _result0.ref)()) {
      // Restore the scroll position to what it was before.
      requireValue(
        (_result0.scrollRef ?? _result0.ref)(),
        "Expected (_result0.scrollRef === undefined ? _result0.ref : _result0.scrollRef "
      ).scrollTop = scrollPos.top;
      requireValue(
        (_result0.scrollRef ?? _result0.ref)(),
        "Expected (_result0.scrollRef === undefined ? _result0.ref : _result0.scrollRef "
      ).scrollLeft = scrollPos.left;
    }

    restoreFocusedItem(modality);
  };

  const onBlur = (e: FocusEvent<FocusableElement>) => {
    // Don't set blurred and then focused again if moving focus within the collection.
    if (!nodeContains(e.currentTarget, htmlElementOrNull(e.relatedTarget))) {
      _result0.selectionManager.setFocused(false);
    }
  };

  // Ref to track whether the first item in the collection should be automatically focused. Specifically used for autocomplete when user types
  // to focus the first key AFTER the collection updates.
  // Follow-up: potentially expand the usage of this
  let shouldVirtualFocusFirst = false;
  // Add event listeners for custom virtual events. These handle updating the focused key in response to various keyboard events
  // at the autocomplete level
  // Follow-up: fix type later
  createEvent(
    () => _result0.ref(),
    FOCUS_EVENT,
    (e) => {
      if (!isTruthy(_result0.shouldUseVirtualFocus)) {
        return;
      }

      const { detail } = e;
      e.stopPropagation();
      _result0.selectionManager.setFocused(true);

      if (detail?.focusStrategy === "first") {
        shouldVirtualFocusFirst = true;
      }
    }
  );

  // update active descendant
  const firstKey = createMemo(
    () => _result0.keyboardDelegate.getFirstKey?.() ?? null
  );

  createEffect(
    () => ({
      element: _result0.ref(),
      firstKey: firstKey(),
      input4: _result0.selectionManager.collection,
      selectionManager: _result0.selectionManager,
      size: _result0.selectionManager.collection.size,
    }),
    ({ size, element, firstKey: currentFirstKey, selectionManager }) => {
      if (shouldVirtualFocusFirst) {
        // If no focusable items exist in the list, make sure to clear any activedescendant that may still exist and move focus back to
        // the original active element (e.g. the autocomplete input)
        if (isPresent(currentFirstKey)) {
          selectionManager.setFocusedKey(currentFirstKey);
          // Only set shouldVirtualFocusFirst to false if we've successfully set the first key as the focused key
          // If there wasn't a key to focus, we might be in a temporary loading state so we'll want to still focus the first key
          // after the collection updates after load
          shouldVirtualFocusFirst = false;
        } else {
          const previousActiveElement = getActiveElement();
          moveVirtualFocus(element);
          dispatchVirtualFocus(
            requireValue(
              previousActiveElement,
              "Expected previousActiveElement"
            ),
            null
          );

          // If there wasn't a focusable key but the collection had items, then that means we aren't in an intermediate load state and all keys are disabled.
          // Reset shouldVirtualFocusFirst so that we don't erronously autofocus an item when the collection is filtered again.
          if (size > 0) {
            shouldVirtualFocusFirst = false;
          }
        }
      }
    },
    { defer: true, ssrSource: "client" }
  );
  // reset focus first flag
  createEffect(
    () => ({
      focusedKey: _result0.selectionManager.focusedKey,
      size: _result0.selectionManager.collection.size,
    }),
    ({ size }) => {
      // If user causes the focused key to change in any other way, clear shouldVirtualFocusFirst so we don't
      // accidentally move focus from under them. Skip this if the collection was empty because we might be in a load
      // state and will still want to focus the first item after load
      if (size > 0) {
        shouldVirtualFocusFirst = false;
      }
    },
    { defer: true, ssrSource: "client" }
  );
  createEvent(
    () => _result0.ref(),
    CLEAR_FOCUS_EVENT,
    (e) => {
      if (!isTruthy(_result0.shouldUseVirtualFocus)) {
        return;
      }

      e.stopPropagation();
      _result0.selectionManager.setFocused(false);

      if (isTruthy(e.detail?.clearFocusKey)) {
        _result0.selectionManager.setFocusedKey(null);
      }
    }
  );

  let autoFocusRef = untrack(() => _result0.autoFocus ?? false);

  function getAutoFocusKey() {
    let focusedKey: Key | null = null;

    // Check focus strategy to determine which item to focus
    if ((_result0.autoFocus ?? false) === "first") {
      focusedKey = _result0.keyboardDelegate.getFirstKey?.() ?? null;
    }

    if ((_result0.autoFocus ?? false) === "last") {
      focusedKey = _result0.keyboardDelegate.getLastKey?.() ?? null;
    }

    // If there are any selected keys, make the first one the new focus target
    const { selectedKeys } = _result0.selectionManager;

    if (selectedKeys.size) {
      for (const key of selectedKeys) {
        if (_result0.selectionManager.canSelectItem(key)) {
          focusedKey = key;
          break;
        }
      }
    }

    return { focusedKey, selectedKeys };
  }

  let didAutoFocusRef = false;
  createEffect(
    () => {
      const { selectionManager } = _result0;
      const focus = isTruthy(autoFocusRef) ? getAutoFocusKey() : null;

      return {
        canSelect:
          focus && isPresent(focus.focusedKey)
            ? selectionManager.canSelectItem(focus.focusedKey)
            : false,
        element: _result0.ref(),
        focus,
        selectOnFocus:
          _result0.selectOnFocus ??
          selectionManager.selectionBehavior === "replace",
        selectionManager,
        shouldUseVirtualFocus: _result0.shouldUseVirtualFocus,
        size: selectionManager.collection.size,
      };
    },
    ({
      canSelect,
      element,
      focus,
      selectOnFocus,
      selectionManager,
      shouldUseVirtualFocus,
      size,
    }) => {
      if (!focus) {
        return;
      }

      untrack(() => {
        selectionManager.setFocused(true);
        selectionManager.setFocusedKey(focus.focusedKey);

        if (
          selectOnFocus &&
          !focus.selectedKeys.size &&
          canSelect &&
          isPresent(focus.focusedKey)
        ) {
          selectionManager.replaceSelection(focus.focusedKey);
        }

        if (
          !isPresent(focus.focusedKey) &&
          !isTruthy(shouldUseVirtualFocus) &&
          element
        ) {
          focusSafely(element);
        }
      });

      if (size > 0) {
        autoFocusRef = false;
        didAutoFocusRef = true;
      }
    },
    { ssrSource: "client" }
  );
  // Scroll the focused element into view when the focusedKey changes.
  let lastFocusedKey = untrack(() => _result0.selectionManager.focusedKey);
  let raf: number | null = null;
  createEffect(
    () => ({
      focusedKey: _result0.selectionManager.focusedKey,
      input0: _result0.selectionManager,
      input1: (_result0.scrollRef ?? _result0.ref)(),
      isFocused: _result0.selectionManager.isFocused,
      observedElement: _result0.ref(),
      shouldUseVirtualFocus: _result0.shouldUseVirtualFocus,
    }),
    ({
      focusedKey,
      isFocused,
      shouldUseVirtualFocus,
      input1,
      observedElement,
    }) => {
      const result0refElement = observedElement;

      if (
        isFocused &&
        focusedKey !== null &&
        focusedKey !== undefined &&
        (focusedKey !== lastFocusedKey || didAutoFocusRef) &&
        input1 &&
        result0refElement
      ) {
        const modality = getInteractionModality();

        const element = getItemElement(() => result0refElement, focusedKey);

        if (!(element instanceof HTMLElement)) {
          // If item element wasn't found, return early (don't update autoFocusRef and lastFocusedKey).
          // The collection may initially be empty (e.g. virtualizer), so wait until the element exists.
          return;
        }

        if (modality === "keyboard" || didAutoFocusRef) {
          if (isTruthy(raf)) {
            cancelAnimationFrame(raf);
          }

          raf = requestAnimationFrame(() => {
            if ((_result0.scrollRef ?? _result0.ref)()) {
              scrollIntoView(
                requireValue(
                  (_result0.scrollRef ?? _result0.ref)(),
                  "Expected (_result0.scrollRef === undefined ? _result0.ref : _result0.scrollRef "
                ),
                element
              );

              // Avoid scroll in iOS VO, since it may cause overlay to close (i.e. RAC submenu)
              if (modality !== "virtual") {
                scrollIntoViewport(element, {
                  containingElement: _result0.ref(),
                });
              }
            }
          });
        }
      }

      // If the focused key becomes null (e.g. the last item is deleted), focus the whole collection.
      if (
        !isTruthy(shouldUseVirtualFocus) &&
        isFocused &&
        !isPresent(focusedKey) &&
        lastFocusedKey !== null &&
        lastFocusedKey !== undefined &&
        result0refElement
      ) {
        untrack(() => {
          focusSafely(result0refElement);
        });
      }

      lastFocusedKey = focusedKey;
      didAutoFocusRef = false;
    },
    { ssrSource: "client" }
  );
  onSettled(() => () => {
    if (isTruthy(raf)) {
      cancelAnimationFrame(raf);
    }
  });
  // Intercept FocusScope restoration since virtualized collections can reuse DOM nodes.
  createEvent(
    () => _result0.ref(),
    "react-aria-focus-scope-restore",
    (e) => {
      e.preventDefault();
      _result0.selectionManager.setFocused(true);
    }
  );

  const handlers = mergeProps(
    merge(() => _result3.keyboardProps),
    merge(() => _result2.keyboardProps),
    {
      onFocusIn: onFocus,
      onFocusOut: onBlur,
      onMouseDown(e: globalThis.MouseEvent) {
        // Ignore events that bubbled through portals.
        if ((_result0.scrollRef ?? _result0.ref)() === getEventTarget(e)) {
          // Prevent focus going to the collection when clicking on the scrollbar.
          e.preventDefault();
        }
      },
    }
  );

  const _result4 = createTypeSelect(
    {
      get isDisabled() {
        return _result0.disallowTypeAhead === true;
      },
      get keyboardDelegate() {
        return _result0.keyboardDelegate;
      },
      get selectionManager() {
        return _result0.selectionManager;
      },
    },
    () => _result0.ref()
  );

  // If nothing is focused within the collection, make the collection itself tabbable.
  // This will be marshalled to either the first or last item depending on where focus came from.
  const tabIndex = createMemo((): number | undefined => {
    if (isTruthy(_result0.shouldUseVirtualFocus)) {
      return undefined;
    }

    return isPresent(_result0.selectionManager.focusedKey) ? -1 : 0;
  });

  const collectionId = untrack(() =>
    createCollectionId(_result0.selectionManager.collection)
  );

  return {
    get collectionProps() {
      return mergeProps(
        isTruthy(_result0.disallowTypeAhead) ? {} : _result4.typeSelectProps,
        handlers,
        {
          "data-collection": collectionId,
          get tabindex() {
            return tabIndex();
          },
        }
      );
    },
  };
}

function isFocusEntryModality(
  modality: ReturnType<typeof getInteractionModality>
): boolean {
  return modality === "keyboard" || modality === "virtual";
}
