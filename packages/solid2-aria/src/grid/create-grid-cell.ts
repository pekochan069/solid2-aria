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
 * Derived from Adobe React Spectrum: packages/react-aria/src/grid/useGridCell.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { GridState } from "@solid2-aria/stately/grid/create-grid-state";
import type {
  IGridCollection as GridCollection,
  GridNode,
} from "@solid2-aria/stately/grid/grid-collection";
import type { FocusableElement, Key } from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { createMemo } from "solid-js";
import type { Accessor } from "solid-js";

import { getFocusableTreeWalker } from "../focus/focus-scope";
import { createLocale } from "../i18n/i18n-provider";
import { isFocusVisible } from "../interactions/create-focus-visible";
import { focusSafely } from "../interactions/focus-safely";
import { createSelectableItem } from "../selection/create-selectable-item";
import type { KeyboardEvent as DOMKeyboardEvent } from "../types";
import { ariaValue } from "../utils/aria-value";
import { createEvent } from "../utils/create-event";
import { getOwnerDocument } from "../utils/dom-helpers";
import {
  elementOrNull,
  focusableElementOrNull,
  requireFocusableElement,
} from "../utils/dom-value";
import { getScrollParent } from "../utils/get-scroll-parent";
import { isPresent } from "../utils/is-present";
import { getLegacyOption } from "../utils/legacy-option";
import { mergeProps } from "../utils/merge-props";
import { requireValue } from "../utils/require-value";
import { scrollIntoViewport } from "../utils/scroll-into-view";
import {
  getActiveElement,
  getEventTarget,
  isFocusWithin,
  nodeContains,
} from "../utils/shadowdom/dom-functions";
import { isTruthy } from "../utils/truthy";
import { gridMap } from "./utils";

export interface GridCellProps {
  /**
   * An object representing the grid cell. Contains all the relevant information that makes up the
   * grid cell.
   */
  node: GridNode<unknown>;
  /** Whether the grid cell is contained in a virtual scroller. */
  isVirtualized?: boolean;
  /**
   * Whether the cell or its first focusable child element should be focused when the grid cell is
   * focused. Defaults to 'child' in arrow keyboard navigation mode and 'cell' in
   * tab keyboard navigation mode.
   */
  focusMode?: "child" | "cell";
  /**
   * Whether the cell should support arrow key navigation even when the containing collection uses
   * tab keyboard navigation. Allows users to navigate between rows and cells with arrow keys while
   * focus is on an interactive child element within the cell.
   */
  allowsArrowNavigation?: boolean;
  /** Whether selection should occur on press up instead of press down. */
  shouldSelectOnPressUp?: boolean;
  /** Indicates how many columns the data cell spans. */
  colSpan?: number;
  /**
   * Handler that is called when a user performs an action on the cell.
   * Please use onCellAction at the collection level instead.
   *
   * @deprecated
   */
  onAction?: () => void;
}

export interface GridCellAria {
  /** Props for the grid cell element. */
  gridCellProps: DOMAttributes;
  /** Whether the cell is currently in a pressed state. */
  isPressed: boolean;
}

/**
 * Provides the behavior and accessibility implementation for a cell in a grid.
 *
 * @param props - Props for the cell.
 * @param state - State of the parent grid, as returned by `useGridState`.
 */
export function createGridCell<T, C extends GridCollection<T>>(
  props: GridCellProps,
  state: GridState<T, C>,
  ref: Accessor<FocusableElement | null>
): GridCellAria {
  const _result0 = props;
  const _result1 = createLocale();

  const _result2 = requireValue(
    gridMap.get(state),
    "Expected gridMap.get(state)"
  );

  const focusMode = createMemo(
    () =>
      _result0.focusMode ??
      (_result2.keyboardNavigationBehavior === "tab" ? "cell" : "child")
  );

  // We need to track the key of the item at the time it was last focused so that we force
  // focus to go to the item when the DOM node is reused for a different item in a virtualizer.
  let keyWhenFocused: Key | null = null;
  // Tracks the specific focusable child that was last focused within this cell.
  let lastFocusedChild: FocusableElement | null = null;

  // Handles focusing the cell. If there is a focusable child,
  // it is focused, otherwise the cell itself is focused.
  const focus = () => {
    const refElement = ref();

    if (refElement) {
      const treeWalker = getFocusableTreeWalker(refElement);

      if (focusMode() === "child") {
        const activeElement = getActiveElement(getOwnerDocument(refElement));

        // If focus is already on a focusable child within the cell, early return so we don't shift focus
        if (isFocusWithin(refElement) && refElement !== activeElement) {
          return;
        }

        const ownerDocument = getOwnerDocument(refElement);

        const shouldRestoreToLastFocused =
          !activeElement ||
          activeElement === ownerDocument.body ||
          activeElement === refElement;

        if (shouldRestoreToLastFocused) {
          const lastChild = lastFocusedChild;

          if (
            lastChild &&
            keyWhenFocused === _result0.node.key &&
            nodeContains(refElement, lastChild)
          ) {
            focusSafely(lastChild);

            return;
          }
        }

        const focusable =
          state.selectionManager.childFocusStrategy === "last"
            ? last(treeWalker)
            : focusableElementOrNull(treeWalker.firstChild());

        if (focusable) {
          focusSafely(focusable);

          return;
        }
      }

      if (
        (isPresent(keyWhenFocused) && _result0.node.key !== keyWhenFocused) ||
        !isFocusWithin(refElement)
      ) {
        focusSafely(refElement);
      }
    }
  };

  const _result3 = createSelectableItem({
    get focus() {
      return focus;
    },
    get isDisabled() {
      return state.collection.size === 0;
    },
    get isVirtualized() {
      return _result0.isVirtualized;
    },
    get key() {
      return _result0.node.key;
    },
    get onAction() {
      return _result2.actions.onCellAction
        ? () => _result2.actions.onCellAction?.(_result0.node.key)
        : getLegacyOption(_result0, "onAction");
    },
    get ref() {
      return ref;
    },
    get selectionManager() {
      return state.selectionManager;
    },
    get shouldSelectOnPressUp() {
      return _result0.shouldSelectOnPressUp;
    },
  });

  function focusLeftInCell(
    e: DOMKeyboardEvent,
    walker: TreeWalker,
    cell: FocusableElement
  ): void {
    // Find the next focusable element within the cell.
    let focusable: FocusableElement | null =
      _result1.direction === "rtl"
        ? focusableElementOrNull(walker.nextNode())
        : focusableElementOrNull(walker.previousNode());

    // Don't focus the cell itself if focusMode is "child"
    if (focusMode() === "child" && focusable === cell) {
      focusable = null;
    }

    e.preventDefault();
    e.stopPropagation();

    if (focusable) {
      focusSafely(focusable);
      scrollIntoViewport(focusable, {
        containingElement: getScrollParent(cell),
      });
    } else {
      // If there is no next focusable child, then move to the next cell to the left of this one.
      // This will be handled by useSelectableCollection. However, if there is no cell to the left
      // of this one, only one column, and the grid doesn't focus rows, then the next key will be the
      // same as this one. In that case we need to handle focusing either the cell or the first/last
      // child, depending on the focus mode.
      const prev = _result2.keyboardDelegate.getKeyLeftOf?.(_result0.node.key);

      if (prev !== _result0.node.key) {
        // We prevent the capturing event from reaching children of the cell, e.g. pickers.
        // We want arrow keys to navigate to the next cell instead. We need to re-dispatch
        // the event from a higher parent so it still bubbles and gets handled by useSelectableCollection.
        cell.parentElement?.dispatchEvent(new KeyboardEvent(e.type, e));

        return;
      }

      if (focusMode() === "cell" && _result1.direction === "rtl") {
        focusSafely(cell);
        scrollIntoViewport(cell, {
          containingElement: getScrollParent(cell),
        });
      } else {
        walker.currentNode = cell;
        focusable =
          _result1.direction === "rtl"
            ? focusableElementOrNull(walker.firstChild())
            : last(walker);

        if (focusable) {
          focusSafely(focusable);
          scrollIntoViewport(focusable, {
            containingElement: getScrollParent(cell),
          });
        }
      }
    }
  }

  function focusRightInCell(
    e: DOMKeyboardEvent,
    walker: TreeWalker,
    cell: FocusableElement
  ): void {
    let focusable: FocusableElement | null =
      _result1.direction === "rtl"
        ? focusableElementOrNull(walker.previousNode())
        : focusableElementOrNull(walker.nextNode());

    if (focusMode() === "child" && focusable === cell) {
      focusable = null;
    }

    e.preventDefault();
    e.stopPropagation();

    if (focusable) {
      focusSafely(focusable);
      scrollIntoViewport(focusable, {
        containingElement: getScrollParent(cell),
      });
    } else {
      const next = _result2.keyboardDelegate.getKeyRightOf?.(_result0.node.key);

      if (next !== _result0.node.key) {
        // We prevent the capturing event from reaching children of the cell, e.g. pickers.
        // We want arrow keys to navigate to the next cell instead. We need to re-dispatch
        // the event from a higher parent so it still bubbles and gets handled by useSelectableCollection.
        cell.parentElement?.dispatchEvent(new KeyboardEvent(e.type, e));

        return;
      }

      if (focusMode() === "cell" && _result1.direction === "ltr") {
        focusSafely(cell);
        scrollIntoViewport(cell, {
          containingElement: getScrollParent(cell),
        });
      } else {
        walker.currentNode = cell;
        focusable =
          _result1.direction === "rtl"
            ? last(walker)
            : focusableElementOrNull(walker.firstChild());

        if (focusable) {
          focusSafely(focusable);
          scrollIntoViewport(focusable, {
            containingElement: getScrollParent(cell),
          });
        }
      }
    }
  }

  const handleCaptureKeyDown = (e: DOMKeyboardEvent) => {
    const refElement = ref();
    const activeElement = getActiveElement(getOwnerDocument(refElement));

    if (
      !nodeContains(e.currentTarget, getEventTarget(e)) ||
      state.isKeyboardNavigationDisabled ||
      !refElement ||
      !activeElement
    ) {
      return;
    }

    const walker = getFocusableTreeWalker(refElement);
    walker.currentNode = activeElement;

    switch (e.key) {
      case "ArrowLeft": {
        focusLeftInCell(e, walker, refElement);
        break;
      }

      case "ArrowRight": {
        focusRightInCell(e, walker, refElement);
        break;
      }

      case "ArrowUp":
      case "ArrowDown": {
        // Prevent this event from reaching cell children, e.g. menu buttons. We want arrow keys to navigate
        // to the cell above/below instead. We need to re-dispatch the event from a higher parent so it still
        // bubbles and gets handled by useSelectableCollection.
        if (!e.altKey && nodeContains(refElement, getEventTarget(e))) {
          e.stopPropagation();
          e.preventDefault();
          refElement.parentElement?.dispatchEvent(new KeyboardEvent(e.type, e));
        }

        break;
      }

      default: {
        break;
      }
    }
  };

  createEvent(
    ref,
    "keydown",
    (event) => {
      if (
        _result2.keyboardNavigationBehavior !== "tab" ||
        isTruthy(_result0.allowsArrowNavigation)
      ) {
        handleCaptureKeyDown(event);
      }
    },
    { capture: true }
  );

  const onKeyDown = (e: DOMKeyboardEvent) => {
    const refElement = ref();
    const activeElement = getActiveElement(getOwnerDocument(refElement));

    if (
      !nodeContains(e.currentTarget, getEventTarget(e)) ||
      state.isKeyboardNavigationDisabled ||
      !refElement ||
      !activeElement
    ) {
      return;
    }

    if (
      _result2.keyboardNavigationBehavior === "tab" &&
      getEventTarget(e) !== refElement &&
      e.key !== "Tab"
    ) {
      e.stopPropagation();

      return;
    }

    switch (e.key) {
      case "Tab": {
        if (_result2.keyboardNavigationBehavior === "tab") {
          // If there is another focusable element within this item, stop propagation so the tab key
          // is handled by the browser and not by useSelectableCollection (which would take us out of the list).
          const walker = getFocusableTreeWalker(refElement, {
            tabbable: true,
          });

          walker.currentNode = activeElement;
          const next = e.shiftKey ? walker.previousNode() : walker.nextNode();

          if (next) {
            e.stopPropagation();
          }
        }

        break;
      }

      default: {
        break;
      }
    }
  };

  // Grid cells can have focusable elements inside them. In this case, focus should
  // be marshalled to that element rather than focusing the cell itself.
  const onFocus = (e: FocusEvent) => {
    keyWhenFocused = _result0.node.key;

    if (getEventTarget(e) !== ref()) {
      // useSelectableItem only handles setting the focused key when
      // the focused element is the gridcell itself. We also want to
      // set the focused key when a child element receives focus.
      // If focus is currently visible (e.g. the user is navigating with the keyboard),
      // then skip this. We want to restore focus to the previously focused row/cell
      // in that case since the table should act like a single tab stop.
      const target = requireFocusableElement(getEventTarget(e));

      if (ref() && nodeContains(ref(), target)) {
        lastFocusedChild = target;
      }

      if (!isFocusVisible()) {
        state.selectionManager.setFocusedKey(_result0.node.key);
      }

      return;
    }

    // if focus goes back to cell from child, make sure we don't refocus the cell if we are in focusMode=child
    // since that would be a focus trap
    if (
      focusMode() === "child" &&
      e.relatedTarget &&
      nodeContains(ref(), elementOrNull(e.relatedTarget))
    ) {
      return;
    }

    // If the cell itself is focused, wait a frame so that focus finishes propagating
    // up to the tree, and move focus to a focusable child if possible.
    requestAnimationFrame(() => {
      if (
        focusMode() === "child" &&
        getActiveElement(getOwnerDocument(ref())) === ref()
      ) {
        focus();
      }
    });
  };

  const gridCellProps = createMemo(() => {
    const result = mergeProps(_result3.itemProps, {
      "aria-colindex": ariaValue(
        isPresent(_result0.node.colIndex)
          ? _result0.node.colIndex + 1
          : undefined
        // aria-colindex is 1-based
      ),
      "aria-colspan": ariaValue(_result0.node.colSpan),
      colspan: isTruthy(_result0.isVirtualized)
        ? undefined
        : _result0.node.colSpan,
      onFocus,
      onKeyDown:
        _result2.keyboardNavigationBehavior === "tab" ? onKeyDown : undefined,
      role: "gridcell",

      // make sure shift tabbing from a child of a cell doesnt move focus back to cell if focusMode="child" and in tab nav
      // consistent with arrow nav and focusMode="child" since you can't go back to the cell there either
    });

    if (
      focusMode() === "child" &&
      _result2.keyboardNavigationBehavior === "tab"
    ) {
      result.tabindex = -1;
    }

    if (isTruthy(_result0.isVirtualized)) {
      result["aria-colindex"] =
        // aria-colindex is 1-based
        (_result0.node.colIndex ?? _result0.node.index) + 1;
    }

    // When pressing with a pointer and cell selection is not enabled, usePress will be applied to the
    // row rather than the cell. However, when the row is draggable, usePress cannot preventDefault
    // on pointer down, so the browser will try to focus the cell which has a tabIndex applied.
    // To avoid this, remove the tabIndex from the cell briefly on pointer down.
    if (
      isTruthy(_result0.shouldSelectOnPressUp) &&
      result.tabindex !== null &&
      result.tabindex !== undefined &&
      !isPresent(result.onPointerDown)
    ) {
      result.onPointerDown = (e) => {
        const el = e.currentTarget;
        const tabindex = el.getAttribute("tabindex");
        el.removeAttribute("tabindex");
        requestAnimationFrame(() => {
          if (isPresent(tabindex)) {
            el.setAttribute("tabindex", tabindex);
          }
        });
      };
    }

    return result;
  });

  return {
    get gridCellProps() {
      return gridCellProps();
    },
    get isPressed() {
      return _result3.isPressed;
    },
  };
}

function last(walker: TreeWalker) {
  let next: FocusableElement | null = null;
  let lastValue: FocusableElement | null = null;

  do {
    lastValue = focusableElementOrNull(walker.lastChild());

    if (lastValue) {
      next = lastValue;
    }
  } while (lastValue);

  return next;
}
