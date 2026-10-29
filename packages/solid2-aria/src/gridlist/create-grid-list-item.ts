/*
 * Copyright 2022 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria/src/gridlist/useGridListItem.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { getChildNodes } from "@solid2-aria/stately/collections/get-child-nodes";
import type { ListState } from "@solid2-aria/stately/list/create-list-state";
import type { TreeState } from "@solid2-aria/stately/tree/create-tree-state";
import type {
  FocusableElement,
  Key,
  Node as RSNode,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { untrack, omit, merge, createMemo } from "solid-js";
import type { Accessor } from "solid-js";

import { getFocusableTreeWalker } from "../focus/focus-scope";
import { createLocale } from "../i18n/i18n-provider";
import { isFocusVisible } from "../interactions/create-focus-visible";
import { focusSafely } from "../interactions/focus-safely";
import { createSelectableItem } from "../selection/create-selectable-item";
import type { SelectableItemStates } from "../selection/create-selectable-item";
import type { FocusEvent, KeyboardEvent as DOMKeyboardEvent } from "../types";
import { ariaValue } from "../utils/aria-value";
import { chain } from "../utils/chain";
import { createEvent } from "../utils/create-event";
import { createSlotId } from "../utils/create-id";
import { getOwnerDocument } from "../utils/dom-helpers";
import { elementOrNull, focusableElementOrNull } from "../utils/dom-value";
import { getCollectionNodeProps } from "../utils/get-collection-node-props";
import { getScrollParent } from "../utils/get-scroll-parent";
import { isPresent } from "../utils/is-present";
import { isPropagationStopped } from "../utils/is-propagation-stopped";
import { mergeProps } from "../utils/merge-props";
import { createSyntheticLinkProps } from "../utils/open-link";
import { requireValue } from "../utils/require-value";
import { scrollIntoViewport } from "../utils/scroll-into-view";
import {
  getActiveElement,
  getEventTarget,
  isFocusWithin,
  nodeContains,
} from "../utils/shadowdom/dom-functions";
import { getTruthyValue, isTruthy } from "../utils/truthy";
import { getRowId, listMap } from "./utils";

export interface AriaGridListItemOptions {
  /**
   * An object representing the list item. Contains all the relevant information that makes up the
   * list row.
   */
  node: RSNode<unknown>;
  /** Whether the list row is contained in a virtual scroller. */
  isVirtualized?: boolean;
  /** Whether selection should occur on press up instead of press down. */
  shouldSelectOnPressUp?: boolean;
  /** Whether this item has children, even if not loaded yet. */
  hasChildItems?: boolean;
  /**
   * Whether the row or its first focusable child element should be focused when the row is
   * focused.
   *
   * @default 'row'
   */
  focusMode?: "child" | "row";
  /**
   * Whether the row should support arrow key navigation even when the containing collection uses
   * tab keyboard navigation. Allows users to navigate between rows with arrow keys while
   * focus is on an interactive child element within the row.
   */
  allowsArrowNavigation?: boolean;
}

export interface GridListItemAria extends SelectableItemStates {
  /** Props for the list row element. */
  rowProps: DOMAttributes;
  /** Props for the grid cell element within the list row. */
  gridCellProps: DOMAttributes;
  /** Props for the list item description element, if any. */
  descriptionProps: DOMAttributes;
}

const EXPANSION_KEYS: Record<"expand" | "collapse", Record<string, string>> = {
  collapse: {
    ltr: "ArrowLeft",
    rtl: "ArrowRight",
  },
  expand: {
    ltr: "ArrowRight",
    rtl: "ArrowLeft",
  },
};

/**
 * Provides the behavior and accessibility implementation for a row in a grid list.
 *
 * @param props - Props for the row.
 * @param state - State of the parent list, as returned by `useListState`.
 * @param ref - The ref attached to the row element.
 */
export function createGridListItem<T>(
  props: AriaGridListItemOptions,
  state: ListState<T> | TreeState<T>,
  ref: Accessor<FocusableElement | null>
): GridListItemAria {
  // Copied from useGridCell + some modifications to make it not so grid specific
  const _result0 = props;
  // let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-aria/gridlist');
  const _result1 = createLocale();

  const listData = requireValue(
    listMap.get(state),
    "Expected listMap.get(state)"
  );

  const descriptionId = createSlotId();
  // We need to track the key of the item at the time it was last focused so that we force
  // focus to go to the item when the DOM node is reused for a different item in a virtualizer.
  let keyWhenFocused: Key | null = null;

  const focus = () => {
    const refElement = ref();

    if (refElement === null) {
      return;
    }

    if ((_result0.focusMode ?? "row") === "child") {
      // If focus is already on a focusable child within the row, early return so we don't shift focus
      if (
        isFocusWithin(refElement) &&
        refElement !== getActiveElement(getOwnerDocument(refElement))
      ) {
        return;
      }

      const treeWalker = getFocusableTreeWalker(refElement, {
        tabbable: true,
      });

      const focusable = focusableElementOrNull(treeWalker.firstChild());

      if (isTruthy(focusable)) {
        focusSafely(focusable);
        scrollIntoViewport(focusable, {
          containingElement: getScrollParent(focusable),
        });

        return;
      }
    }

    // Don't shift focus to the row if the active element is a element within the row already
    // (e.g. clicking on a row button)
    if (
      (isPresent(keyWhenFocused) && _result0.node.key !== keyWhenFocused) ||
      !isFocusWithin(refElement)
    ) {
      focusSafely(refElement);
    }
  };

  const hasLink = createMemo(() =>
    state.selectionManager.isLink(props.node.key)
  );

  const hasChildRows = createMemo(
    () =>
      isTruthy(props.hasChildItems) ||
      [...getChildNodes(props.node, state.collection)].some(
        (child) => child.type === "item"
      )
  );

  const onAction = createMemo((): undefined | ((key: Key) => void) => {
    if (listData.onAction) {
      return listData.onAction;
    }

    if (
      "expandedKeys" in state &&
      !hasLink() &&
      state.selectionManager.selectionMode === "none" &&
      hasChildRows()
    ) {
      return () => {
        state.toggleKey(props.node.key);
      };
    }

    return undefined;
  });

  const treeGridRowProps = createMemo<DOMAttributes>(() => {
    const { node } = props;

    if (!isTruthy(node) || !("expandedKeys" in state)) {
      return {};
    }

    const parent = isPresent(node.parentKey)
      ? state.collection.getItem(node.parentKey)
      : null;

    const siblings = (
      parent
        ? [...getChildNodes(parent, state.collection)]
        : [...state.collection]
    ).filter((row) => row.type === "item" && row.parentKey === node.parentKey);

    const position = siblings.findIndex((row) => row.key === node.key);

    return {
      "aria-expanded": ariaValue(
        hasChildRows() ? state.expandedKeys.has(node.key) : undefined
      ),
      "aria-level": node.level + 1,
      "aria-posinset": position === -1 ? undefined : position + 1,
      "aria-setsize": siblings.length,
    };
  });

  const _result2 = createSelectableItem({
    get focus() {
      return focus;
    },
    get isVirtualized() {
      return _result0.isVirtualized;
    },
    get key() {
      return _result0.node.key;
    },
    get linkBehavior() {
      return listData.linkBehavior;
    },
    get onAction() {
      return onAction() ||
        isTruthy(getCollectionNodeProps(_result0.node)?.onAction)
        ? chain(
            getCollectionNodeProps(_result0.node)?.onAction,
            onAction() ? () => onAction()?.(_result0.node.key) : undefined
          )
        : undefined;
    },
    get ref() {
      return ref;
    },
    get selectionManager() {
      return state.selectionManager;
    },
    get shouldSelectOnPressUp() {
      return (
        getTruthyValue(props.shouldSelectOnPressUp) ??
        listData.shouldSelectOnPressUp
      );
    },
  });

  const handleCaptureKeyDown = (e: DOMKeyboardEvent) => {
    const refElement = ref();

    const activeElement = getActiveElement(getOwnerDocument(refElement));

    if (
      !nodeContains(e.currentTarget, getEventTarget(e)) ||
      !refElement ||
      !activeElement
    ) {
      return;
    }

    const walker = getFocusableTreeWalker(refElement);
    walker.currentNode = activeElement;

    if (
      handleTreeExpansionKeys(
        e,
        state,
        _result0.node,
        hasChildRows(),
        _result1.direction,
        activeElement,
        refElement,
        _result0.allowsArrowNavigation
      )
    ) {
      return;
    }

    switch (e.key) {
      case "ArrowLeft": {
        if (listData.keyboardNavigationBehavior === "arrow") {
          // Find the next focusable element within the row.
          const focusable =
            _result1.direction === "rtl"
              ? focusableElementOrNull(walker.nextNode())
              : focusableElementOrNull(walker.previousNode());

          e.preventDefault();
          e.stopPropagation();

          if (isTruthy(focusable)) {
            focusSafely(focusable);
            scrollIntoViewport(focusable, {
              containingElement: getScrollParent(refElement),
            });
          } else if (_result1.direction === "rtl") {
            focusSafely(refElement);
            scrollIntoViewport(refElement, {
              containingElement: getScrollParent(refElement),
            });
          } else {
            walker.currentNode = refElement;
            const lastElement = last(walker);

            if (lastElement) {
              focusSafely(lastElement);
              scrollIntoViewport(lastElement, {
                containingElement: getScrollParent(refElement),
              });
            }
          }
        }

        break;
      }

      case "ArrowRight": {
        if (listData.keyboardNavigationBehavior === "arrow") {
          const focusable =
            _result1.direction === "rtl"
              ? focusableElementOrNull(walker.previousNode())
              : focusableElementOrNull(walker.nextNode());

          e.preventDefault();
          e.stopPropagation();

          if (isTruthy(focusable)) {
            focusSafely(focusable);
            scrollIntoViewport(focusable, {
              containingElement: getScrollParent(refElement),
            });
          } else if (_result1.direction === "ltr") {
            focusSafely(refElement);
            scrollIntoViewport(refElement, {
              containingElement: getScrollParent(refElement),
            });
          } else {
            walker.currentNode = refElement;
            const lastElement = last(walker);

            if (lastElement) {
              focusSafely(lastElement);
              scrollIntoViewport(lastElement, {
                containingElement: getScrollParent(refElement),
              });
            }
          }
        }

        break;
      }

      case "ArrowUp":
      case "ArrowDown": {
        // Prevent this event from reaching row children, e.g. menu buttons. We want arrow keys to navigate
        // to the row above/below instead. We need to re-dispatch the event from a higher parent so it still
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

  const onFocus = (e: FocusEvent<FocusableElement>) => {
    keyWhenFocused = _result0.node.key;

    if (getEventTarget(e) !== ref()) {
      // useSelectableItem only handles setting the focused key when
      // the focused element is the row itself. We also want to
      // set the focused key when a child element receives focus.
      // If focus is currently visible (e.g. the user is navigating with the keyboard),
      // then skip this. We want to restore focus to the previously focused row
      // in that case since the list should act like a single tab stop.
      if (!isFocusVisible()) {
        state.selectionManager.setFocusedKey(_result0.node.key);
      }

      return;
    }

    // if focus goes back to cell from child, make sure we don't refocus the cell if we are in focusMode=child
    // since that would be a focus trap
    if (
      (_result0.focusMode ?? "row") === "child" &&
      e.relatedTarget &&
      nodeContains(ref(), elementOrNull(e.relatedTarget))
    ) {
      return;
    }

    // If the cell itself is focused, wait a frame so that focus finishes propagating
    // up to the tree, and move focus to a focusable child if possible.
    requestAnimationFrame(() => {
      if (
        (_result0.focusMode ?? "row") === "child" &&
        getActiveElement(getOwnerDocument(ref())) === ref()
      ) {
        focus();
      }
    });
  };

  createEvent(
    ref,
    "keydown",
    (event) => {
      if (
        listData.keyboardNavigationBehavior === "arrow" ||
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
      !refElement ||
      !activeElement
    ) {
      return;
    }

    if (listData.keyboardNavigationBehavior === "tab") {
      // Stop propagation for all events that originate from the children of the gridlist item since we don't want to trigger
      // grid level interactions (row navigation/typeselect/etc)
      // exception made for Tab since that needs to propagate to useSelectableCollection to tab out of the gridlist, might be others?
      if (getEventTarget(e) !== refElement && e.key !== "Tab") {
        e.stopPropagation();

        return;
      }

      if (
        handleTreeExpansionKeys(
          e,
          state,
          _result0.node,
          hasChildRows(),
          _result1.direction,
          activeElement,
          refElement,
          _result0.allowsArrowNavigation
        )
      ) {
        return;
      }
    }

    switch (e.key) {
      case "Tab": {
        if (listData.keyboardNavigationBehavior === "tab") {
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

  const syntheticLinkProps = createSyntheticLinkProps(
    getCollectionNodeProps(_result0.node)
  );

  const linkProps = createMemo(() =>
    // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
    omit(_result2, "itemProps")
      // oxlint-enable solid/reactivity
      .hasAction
      ? syntheticLinkProps
      : {}
  );
  // Follow-up: re-add when we get translations and fix this for iOS VO
  // let rowAnnouncement;
  // if (onAction) {
  //   rowAnnouncement = stringFormatter.format('hasActionAnnouncement');
  // } else if (hasLink) {
  //   rowAnnouncement = stringFormatter.format('hasLinkAnnouncement', {
  //     link: node.props.href
  //   });
  // }

  const rowProps = createMemo(() => {
    const result = mergeProps(_result2.itemProps, linkProps(), {
      "aria-disabled": ariaValue(
        state.selectionManager.isDisabled(_result0.node.key) || undefined
      ),
      // 'aria-label': [(node.textValue || undefined), rowAnnouncement].filter(Boolean).join(', '),
      "aria-label": ariaValue(
        getTruthyValue(
          getTruthyValue(_result0.node["aria-label"]) ?? _result0.node.textValue
        ) ?? undefined
      ),
      "aria-labelledby": ariaValue(
        isTruthy(descriptionId()) &&
          (isTruthy(_result0.node["aria-label"]) || _result0.node.textValue)
          ? `${getRowId(state, _result0.node.key)} ${descriptionId()}`
          : undefined
      ),
      "aria-selected": ariaValue(
        state.selectionManager.canSelectItem(_result0.node.key)
          ? state.selectionManager.isSelected(_result0.node.key)
          : undefined
      ),
      id: getRowId(state, _result0.node.key),
      onFocus,
      role: "row",
    });

    if (
      (_result0.focusMode ?? "row") === "child" &&
      isTruthy(_result0.allowsArrowNavigation) &&
      listData.keyboardNavigationBehavior === "tab"
    ) {
      result.tabindex = -1;
    }

    // we need to guard against space/enter triggering selection/row link via usePress (from itemProps) so check if propagation
    // is stopped. this also fixes space not working in a textfield in a tree parent row
    const baseOnKeyDown = result.onKeyDown;
    result.onKeyDown = (e: DOMKeyboardEvent<FocusableElement>) => {
      untrack(() => {
        onKeyDown(e);

        if (!isPropagationStopped(e)) {
          baseOnKeyDown?.(e);
        }
      });
    };

    if (isTruthy(_result0.isVirtualized)) {
      const { collection } = state;
      const nodes = [...collection];
      // Follow-up: refactor ListCollection to store an absolute index of a node's position?
      result["aria-rowindex"] = nodes.some((node) => node.type === "section")
        ? [...collection.getKeys()]
            .filter((key) => collection.getItem(key)?.type !== "section")
            .indexOf(_result0.node.key) + 1
        : _result0.node.index + 1;
    }

    return result;
  });

  const gridCellProps: DOMAttributes = {
    "aria-colindex": ariaValue(1),
    role: "gridcell",
  };
  // Follow-up: should isExpanded and hasChildRows be a item state that gets returned by the hook?

  return merge(
    {
      get descriptionProps() {
        return {
          get id() {
            return descriptionId();
          },
        };
      },
      get gridCellProps() {
        return gridCellProps;
      },
      get rowProps() {
        return merge(mergeProps(rowProps(), treeGridRowProps()));
      },
    },
    omit(_result2, "itemProps")
  );
}

function handleTreeExpansionKeys<T>(
  e: DOMKeyboardEvent,
  state: ListState<T> | TreeState<T>,
  node: RSNode<unknown>,
  hasChildRows: boolean | undefined,
  direction: string,
  activeElement: Element | null,
  rowRef: FocusableElement | null,
  allowsArrowNavigation: boolean | undefined
): boolean {
  if (
    !("expandedKeys" in state) ||
    (!isTruthy(allowsArrowNavigation) && activeElement !== rowRef)
  ) {
    return false;
  }

  if (
    e.key === EXPANSION_KEYS.expand[direction] &&
    state.selectionManager.focusedKey === node.key &&
    isTruthy(hasChildRows) &&
    !state.expandedKeys.has(node.key)
  ) {
    state.toggleKey(node.key);
    e.stopPropagation();

    return true;
  } else if (
    e.key === EXPANSION_KEYS.collapse[direction] &&
    state.selectionManager.focusedKey === node.key
  ) {
    // If item is collapsible, collapse it; else move to parent
    if (isTruthy(hasChildRows) && state.expandedKeys.has(node.key)) {
      state.toggleKey(node.key);
      e.stopPropagation();

      return true;
    } else if (
      !state.expandedKeys.has(node.key) &&
      isTruthy(node.parentKey) &&
      state.collection.getItem(node.parentKey)?.type === "item"
    ) {
      // Item is a leaf or already collapsed, move focus to parent
      state.selectionManager.setFocusedKey(node.parentKey);
      e.stopPropagation();

      return true;
    }
  }

  return false;
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
