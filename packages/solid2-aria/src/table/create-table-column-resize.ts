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
 * Derived from Adobe React Spectrum: packages/react-aria/src/table/useTableColumnResize.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { GridNode } from "@solid2-aria/stately/grid/grid-collection";
import type { ColumnSize } from "@solid2-aria/stately/table/column";
import type { TableColumnResizeState } from "@solid2-aria/stately/table/create-table-column-resize-state";
import type {
  FocusableElement,
  Key,
  PressEvent,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { untrack, createMemo, createEffect, createSignal } from "solid-js";
import type { Accessor } from "solid-js";

import intlMessages from "../../intl/table/index";
import { createLocalizedStringFormatter } from "../i18n/create-localized-string-formatter";
import { createLocale } from "../i18n/i18n-provider";
import { createInteractionModality } from "../interactions/create-focus-visible";
import { createKeyboard } from "../interactions/create-keyboard";
import { createMove } from "../interactions/create-move";
import { createPress } from "../interactions/create-press";
import { focusSafely } from "../interactions/focus-safely";
import type { ChangeEvent } from "../types";
import { ariaValue } from "../utils/aria-value";
import { createDescription } from "../utils/create-description";
import { createId } from "../utils/create-id";
import { isPresent } from "../utils/is-present";
import { mergeProps } from "../utils/merge-props";
import {
  getActiveElement,
  getEventTarget,
} from "../utils/shadowdom/dom-functions";
import { createVisuallyHidden } from "../visually-hidden/visually-hidden";
import { getColumnHeaderId } from "./utils";

export interface TableColumnResizeAria {
  /** Props for the visually hidden input element. */
  inputProps: DOMAttributes;
  /** Props for the resizer element. */
  resizerProps: DOMAttributes;
  /** Whether this column is currently being resized. */
  isResizing: boolean;
  /**
   * Whether this column is currently being resized via a mouse drag (e.g. to render a cursor
   * overlay).
   */
  isMouseResizing: boolean;
}

export interface AriaTableColumnResizeProps<T> {
  /**
   * An object representing the [column header](https://www.w3.org/TR/wai-aria-1.1/#columnheader).
   * Contains all the relevant information that makes up the column header.
   */
  column: GridNode<T>;
  /** Aria label for the hidden input. Gets read when resizing. */
  "aria-label": string;
  /**
   * Ref to the trigger if resizing was started from a column header menu. If it's provided, focus
   * will be returned there when resizing is done. If it isn't provided, it is assumed that the
   * resizer is visible at all time and keyboard resizing is started via pressing Enter on the
   * resizer and not on focus.
   */
  triggerRef?: Accessor<FocusableElement | null>;
  /** If resizing is disabled. */
  isDisabled?: boolean;
  /** Called when resizing starts. */
  onResizeStart?: (widths: Map<Key, ColumnSize>) => void;
  /** Called for every resize event that results in new column sizes. */
  onResize?: (widths: Map<Key, ColumnSize>) => void;
  /** Called when resizing ends. */
  onResizeEnd?: (widths: Map<Key, ColumnSize>) => void;
}

/**
 * Provides the behavior and accessibility implementation for a table column resizer element.
 *
 * @param props - Props for the resizer.
 * @param state - State for the table's resizable columns, as returned by
 *   `useTableColumnResizeState`.
 * @param ref - The ref attached to the resizer's visually hidden input element.
 */
export function createTableColumnResize<T>(
  props: AriaTableColumnResizeProps<T>,
  state: TableColumnResizeState<T>,
  ref: Accessor<HTMLInputElement | null>
): TableColumnResizeAria {
  const _result0 = props;

  const stringFormatter = createLocalizedStringFormatter(
    intlMessages,
    "@react-aria/table"
  );

  const id = createId();

  const isResizing = createMemo(
    () => state.resizingColumn === _result0.column.key
  );

  let isResizingRef = untrack(() => isResizing());
  let lastSize: Map<Key, ColumnSize> | null = null;
  let wasFocusedOnResizeStart = false;

  const editModeEnabled = createMemo(
    () => state.tableState.isKeyboardNavigationDisabled
  );

  // Whether a mouse drag-resize is active. Set on the first move (not on press) so a cursor
  // overlay only mounts during an actual drag.
  const [isMouseResizing, setMouseResizing] = createSignal(false, {
    ownedWrite: true,
  });

  const _result1 = createLocale();

  const startResize = (item: GridNode<T>) => {
    if (!isResizingRef) {
      lastSize = state.updateResizedColumns(
        item.key,
        state.getColumnWidth(item.key)
      );
      state.startResize(item.key);
      state.tableState.setKeyboardNavigationDisabled(true);
      _result0.onResizeStart?.(lastSize);
    }

    isResizingRef = true;
  };

  const resize = (item: GridNode<T>, newWidth: number) => {
    const sizes = state.updateResizedColumns(item.key, newWidth);
    _result0.onResize?.(sizes);
    lastSize = sizes;
  };

  const endResize = (item: GridNode<T>) => {
    const result0triggerRefElement = _result0.triggerRef?.();

    if (isResizingRef) {
      lastSize ??= state.updateResizedColumns(
        item.key,
        state.getColumnWidth(item.key)
      );

      state.endResize();
      state.tableState.setKeyboardNavigationDisabled(false);
      _result0.onResizeEnd?.(lastSize);
      isResizingRef = false;

      if (result0triggerRefElement && !wasFocusedOnResizeStart) {
        // switch focus back to the column header unless the resizer was already focused when resizing started.
        focusSafely(result0triggerRefElement);
      }
    }

    lastSize = null;
  };

  const endResizeEvent = (): undefined | false => {
    if (editModeEnabled()) {
      endResize(_result0.column);

      return undefined;
    }

    return false;
  };

  const _result2 = createKeyboard({
    get shortcuts() {
      return {
        get " "() {
          return () => endResizeEvent();
        },
        get Enter() {
          return () => {
            if (editModeEnabled()) {
              endResize(_result0.column);
            } else {
              startResize(_result0.column);
            }
          };
        },
        get Escape() {
          return () => endResizeEvent();
        },
        get Tab() {
          return () => endResizeEvent();
        },
      };
    },
  });

  let columnResizeWidthRef = 0;

  const _result3 = createMove({
    onMove(e) {
      const destructured0 = e;
      let { deltaX } = destructured0;
      const { deltaY, pointerType } = destructured0;

      if (_result1.direction === "rtl") {
        deltaX *= -1;
      }

      if (pointerType === "keyboard") {
        if (deltaY !== 0 && deltaX === 0) {
          deltaX = deltaY * -1;
        }

        deltaX *= 10;
      }

      // if moving up/down only, no need to resize
      if (deltaX !== 0) {
        columnResizeWidthRef += deltaX;
        resize(_result0.column, columnResizeWidthRef);
      }
    },
    onMoveEnd(e) {
      const { pointerType } = e;
      columnResizeWidthRef = 0;
      setMouseResizing(false);

      if (
        pointerType === "mouse" ||
        (pointerType === "touch" && wasFocusedOnResizeStart)
      ) {
        endResize(_result0.column);
      }
    },
    onMoveStart(e) {
      columnResizeWidthRef = state.getColumnWidth(_result0.column.key);

      if (e.pointerType === "mouse") {
        setMouseResizing(true);
      }

      startResize(_result0.column);
    },
  });

  const onKeyDown = (
    e: Parameters<NonNullable<DOMAttributes["onKeyDown"]>>[0]
  ) => {
    if (editModeEnabled()) {
      _result3.moveProps.onKeyDown?.(e);
    }
  };

  const min = createMemo(() =>
    Math.floor(state.getColumnMinWidth(_result0.column.key))
  );

  let max = Math.floor(state.getColumnMaxWidth(_result0.column.key));

  if (max === Infinity) {
    max = Number.MAX_SAFE_INTEGER;
  }

  const value = createMemo(() =>
    Math.floor(state.getColumnWidth(_result0.column.key))
  );

  const rawModality = createInteractionModality();

  const modality = createMemo(() => {
    const nextValue2 = rawModality();

    return nextValue2 === "virtual" &&
      typeof window !== "undefined" &&
      "ontouchstart" in window
      ? "touch"
      : nextValue2;
  });

  const description = createMemo(() =>
    !isPresent(_result0.triggerRef?.()) &&
    (modality() === "keyboard" || modality() === "virtual") &&
    !isResizing()
      ? stringFormatter.format("resizerDescription")
      : undefined
  );

  const descriptionProps = createDescription(() => description());

  const ariaProps = createMemo(() => ({
    "aria-label": ariaValue(_result0["aria-label"]),
    "aria-labelledby": ariaValue(
      `${id()} ${getColumnHeaderId(state.tableState, _result0.column.key)}`
    ),
    "aria-orientation": ariaValue("horizontal"),
    "aria-valuetext": ariaValue(
      stringFormatter.format("columnSize", { value: value() })
    ),
    max,
    min: min(),
    type: "range",
    value: value(),
    ...descriptionProps,
  }));

  const focusInput = () => {
    const refElement = ref();

    if (refElement) {
      focusSafely(refElement);
    }
  };

  const resizingColumn = createMemo(() => state.resizingColumn);
  let prevResizingColumn: Key | null = null;
  const startResizeEvent = startResize;
  createEffect(
    () => ({
      column: _result0.column,
      element: ref(),
      input2: focusInput,
      key: _result0.column.key,
      resizingColumn: resizingColumn(),
    }),
    ({
      resizingColumn: currentResizingColumn,
      input2,
      column,
      element,
      key,
    }): undefined | (() => void) => {
      if (
        prevResizingColumn !== currentResizingColumn &&
        isPresent(currentResizingColumn) &&
        currentResizingColumn === key
      ) {
        wasFocusedOnResizeStart = getActiveElement() === element;
        startResizeEvent(column);

        // Delay focusing input until Android Chrome's delayed click after touchend happens: https://bugs.chromium.org/p/chromium/issues/detail?id=1150073
        const timeout = setTimeout(() => {
          focusInput();
        }, 0);

        // VoiceOver on iOS has problems focusing the input from a menu.
        const VOTimeout = setTimeout(input2, 400);

        return () => {
          clearTimeout(timeout);
          clearTimeout(VOTimeout);
        };
      }

      prevResizingColumn = currentResizingColumn;

      return undefined;
    },
    { ssrSource: "client" }
  );

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const currentWidth = state.getColumnWidth(_result0.column.key);
    let nextValue = Number(getEventTarget(e).value);

    nextValue =
      nextValue > currentWidth ? currentWidth + 10 : currentWidth - 10;

    resize(_result0.column, nextValue);
  };

  const _result4 = createPress({
    get onPress() {
      return (e: PressEvent) => {
        if (
          ((e.pointerType === "touch" && wasFocusedOnResizeStart) ||
            e.pointerType === "mouse") &&
          state.resizingColumn !== null &&
          state.resizingColumn !== undefined
        ) {
          endResize(_result0.column);
        }
      };
    },
    get onPressStart() {
      return (e: PressEvent) => {
        if (
          e.ctrlKey ||
          e.altKey ||
          e.metaKey ||
          e.shiftKey ||
          e.pointerType === "keyboard"
        ) {
          return;
        }

        if (
          e.pointerType === "virtual" &&
          state.resizingColumn !== null &&
          state.resizingColumn !== undefined
        ) {
          endResize(_result0.column);

          return;
        }

        // Sometimes onPress won't trigger for quick taps on mobile so we want to focus the input so blurring away
        // can cancel resize mode for us.
        focusInput();

        // If resizer is always visible, mobile screenreader user can access the visually hidden resizer directly and thus we don't need
        // to handle a virtual click to start the resizer.
        if (e.pointerType !== "virtual") {
          startResize(_result0.column);
        }
      };
    },
    get preventFocusOnPress() {
      return true;
    },
  });

  const _result5 = createVisuallyHidden();

  return {
    get inputProps() {
      return mergeProps(
        _result5.visuallyHiddenProps,

        {
          disabled: _result0.isDisabled,
          id: id(),
          onBlur: () => {
            endResize(_result0.column);
          },
          onChange,
        },
        ariaProps()
      );
    },
    get isMouseResizing() {
      return isMouseResizing();
    },
    get isResizing() {
      return isResizing();
    },
    get resizerProps() {
      return mergeProps(
        _result2.keyboardProps,
        { ..._result3.moveProps, onKeyDown },
        _result4.pressProps,
        {
          style: { "touch-action": "none" },
        }
      );
    },
  };
}
