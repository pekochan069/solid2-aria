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
 * Derived from Adobe React Spectrum: packages/react-aria/src/grid/useGrid.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { GridState } from "@solid2-aria/stately/grid/create-grid-state";
import type { IGridCollection as GridCollection } from "@solid2-aria/stately/grid/grid-collection";
import type {
  AriaLabelingProps,
  DOMProps,
  Key,
  KeyboardDelegate,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { createMemo, createEffect } from "solid-js";
import type { Accessor } from "solid-js";

import { createHasTabbableChild } from "../focus/create-has-tabbable-child";
import { createCollator } from "../i18n/create-collator";
import { createLocale } from "../i18n/i18n-provider";
import { createSelectableCollection } from "../selection/create-selectable-collection";
import type { FocusEventHandler } from "../types";
import { ariaValue } from "../utils/aria-value";
import { createId } from "../utils/create-id";
import { filterDOMProps } from "../utils/filter-dom-props";
import { mergeProps } from "../utils/merge-props";
import { getEventTarget, nodeContains } from "../utils/shadowdom/dom-functions";
import { getTruthyValue, isTruthy, whenTruthy } from "../utils/truthy";
import { createGridSelectionAnnouncement } from "./create-grid-selection-announcement";
import { createHighlightSelectionDescription } from "./create-highlight-selection-description";
import { GridKeyboardDelegate } from "./grid-keyboard-delegate";
import { gridMap } from "./utils";

export interface GridProps extends DOMProps, AriaLabelingProps {
  /** Whether the grid uses virtual scrolling. */
  isVirtualized?: boolean;
  /**
   * Whether typeahead navigation is disabled.
   *
   * @default false
   */
  disallowTypeAhead?: boolean;
  /**
   * An optional keyboard delegate implementation for type to select,
   * to override the default.
   */
  keyboardDelegate?: KeyboardDelegate;
  /**
   * Whether initial grid focus should be placed on the grid row or grid cell.
   *
   * @default 'row'
   */
  focusMode?: "row" | "cell";
  /**
   * A function that returns the text that should be announced by assistive technology when a row is
   * added or removed from selection.
   *
   * @default (key) => state.collection.getItem(key)?.textValue
   */
  getRowText?: (key: Key) => string;
  /**
   * The ref attached to the scrollable body. Used to provided automatic scrolling on item focus for
   * non-virtualized grids.
   */
  scrollRef?: Accessor<HTMLElement | null>;
  /** Handler that is called when a user performs an action on the row. */
  onRowAction?: (key: Key) => void;
  /** Handler that is called when a user performs an action on the cell. */
  onCellAction?: (key: Key) => void;
  /**
   * Whether pressing the escape key should clear selection in the grid or not.
   *
   * Most experiences should not modify this option as it eliminates a keyboard user's ability to
   * easily clear selection. Only use if the escape key is being handled externally or should not
   * trigger selection clearing contextually.
   *
   * @default 'clearSelection'
   */
  escapeKeyBehavior?: "clearSelection" | "none";
  /** Whether selection should occur on press up instead of press down. */
  shouldSelectOnPressUp?: boolean;
  /**
   * Whether keyboard navigation to focusable elements within grid cells is
   * via arrow keys or the tab key.
   *
   * @default 'arrow'
   */
  keyboardNavigationBehavior?: "arrow" | "tab";
}

export interface GridAria {
  /** Props for the grid element. */
  gridProps: DOMAttributes;
}

/**
 * Provides the behavior and accessibility implementation for a grid component. A grid displays data
 * in one or more rows and columns and enables a user to navigate its contents via directional
 * navigation keys.
 *
 * @param props - Props for the grid.
 * @param state - State for the grid, as returned by `useGridState`.
 * @param ref - The ref attached to the grid element.
 */
export function createGrid<T>(
  props: GridProps,
  state: GridState<T, GridCollection<T>>,
  ref: Accessor<HTMLElement | null>
): GridAria {
  const _result0 = props;
  const _result1 = state;

  createEffect(
    () => ({
      label: props["aria-label"],
      labelledBy: props["aria-labelledby"],
    }),
    ({ label, labelledBy }) => {
      if (
        !isTruthy(label) &&
        !isTruthy(labelledBy) &&
        process.env.NODE_ENV !== "production"
      ) {
        console.warn(
          "An aria-label or aria-labelledby prop is required for accessibility."
        );
      }
    }
  );

  // By default, a KeyboardDelegate is provided which uses the DOM to query layout information (e.g. for page up/page down).
  // When virtualized, the layout object will be passed in as a prop and override this.
  const collator = createCollator({
    get sensitivity(): "base" {
      return "base";
    },
    get usage(): "search" {
      return "search";
    },
  });

  const _result2 = createLocale();

  const disabledBehavior = createMemo(
    () => state.selectionManager.disabledBehavior
  );

  const delegate = createMemo(
    () =>
      getTruthyValue(_result0.keyboardDelegate) ??
      new GridKeyboardDelegate({
        collator,
        collection: state.collection,
        direction: _result2.direction,
        disabledBehavior: disabledBehavior(),
        disabledKeys: state.disabledKeys,
        focusMode: _result0.focusMode,
        ref,
      })
  );

  const _result3 = createSelectableCollection({
    get disallowTypeAhead() {
      return _result0.disallowTypeAhead;
    },
    get escapeKeyBehavior() {
      return _result0.escapeKeyBehavior ?? "clearSelection";
    },
    get isVirtualized() {
      return _result0.isVirtualized;
    },
    get keyboardDelegate() {
      return delegate();
    },
    get ref() {
      return ref;
    },
    get scrollRef() {
      return _result0.scrollRef;
    },
    get selectionManager() {
      return _result1.selectionManager;
    },
  });

  const id = createId(() => props.id);
  gridMap.set(state, {
    get actions() {
      return {
        get onCellAction() {
          return _result0.onCellAction;
        },
        get onRowAction() {
          return _result0.onRowAction;
        },
      };
    },
    get keyboardDelegate() {
      return delegate();
    },
    get keyboardNavigationBehavior() {
      return _result0.keyboardNavigationBehavior ?? "arrow";
    },
    get shouldSelectOnPressUp() {
      return _result0.shouldSelectOnPressUp;
    },
  });

  const descriptionProps = createHighlightSelectionDescription({
    get hasItemActions() {
      return !!(getTruthyValue(_result0.onRowAction) ?? _result0.onCellAction);
    },
    get selectionManager() {
      return _result1.selectionManager;
    },
  });

  const domProps = createMemo(() => filterDOMProps(props, { labelable: true }));

  const onFocus: FocusEventHandler = (e) => {
    if (_result1.selectionManager.isFocused) {
      // If a focus event bubbled through a portal, reset focus state.
      if (!nodeContains(e.currentTarget, getEventTarget(e))) {
        _result1.selectionManager.setFocused(false);
      }

      return;
    }

    // Focus events can bubble through portals. Ignore these events.
    if (!nodeContains(e.currentTarget, getEventTarget(e))) {
      return;
    }

    _result1.selectionManager.setFocused(true);
  };

  // Continue to track collection focused state even if keyboard navigation is disabled
  const navDisabledHandlers = createMemo(() => ({
    onFocusIn: onFocus,
    onFocusOut: _result3.collectionProps.onFocusOut,
  }));

  const hasTabbableChild = createHasTabbableChild(ref, {
    get isDisabled() {
      return state.collection.size !== 0;
    },
  });

  const gridProps = createMemo(() => {
    const result = mergeProps(
      domProps(),
      {
        "aria-multiselectable": ariaValue(
          _result1.selectionManager.selectionMode === "multiple"
            ? "true"
            : undefined
        ),
        id: id(),
        role: "grid",
      },
      state.isKeyboardNavigationDisabled
        ? navDisabledHandlers()
        : _result3.collectionProps,
      // If collection is empty, make sure the grid is tabbable unless there is a child tabbable element.
      getTruthyValue(
        whenTruthy(state.collection.size === 0, () => ({
          tabindex: hasTabbableChild() ? -1 : 0,
        }))
      ) ?? undefined,
      descriptionProps
    );

    if (isTruthy(_result0.isVirtualized)) {
      result["aria-rowcount"] = state.collection.size;
      result["aria-colcount"] = state.collection.columnCount;
    }

    return result;
  });

  createGridSelectionAnnouncement(
    {
      get getRowText() {
        return _result0.getRowText;
      },
    },
    state
  );

  return {
    get gridProps() {
      return gridProps();
    },
  };
}
