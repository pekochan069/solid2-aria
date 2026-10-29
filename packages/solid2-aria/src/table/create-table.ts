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
 * Derived from Adobe React Spectrum: packages/react-aria/src/table/useTable.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2; register the table ID before descendant cells read it.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { TableState } from "@solid2-aria/stately/table/create-table-state";
import type { TreeGridState } from "@solid2-aria/stately/table/create-tree-grid-state";
import type {
  Key,
  LayoutDelegate,
  Rect,
  Size,
} from "@solid2-aria/types-shared";
import {
  merge,
  createMemo,
  createRenderEffect,
  createEffect,
  untrack,
} from "solid-js";
import type { Accessor } from "solid-js";

import intlMessages from "../../intl/table/index";
import { createGrid } from "../grid/create-grid";
import type { GridAria, GridProps } from "../grid/create-grid";
import { createCollator } from "../i18n/create-collator";
import { createLocalizedStringFormatter } from "../i18n/create-localized-string-formatter";
import { createLocale } from "../i18n/i18n-provider";
import { announce } from "../live-announcer/live-announcer";
import { ariaValue } from "../utils/aria-value";
import { createDescription } from "../utils/create-description";
import { createId } from "../utils/create-id";
import { isPresent } from "../utils/is-present";
import { getLegacyOption } from "../utils/legacy-option";
import { mergeProps } from "../utils/merge-props";
import { getTruthyValue, isTruthy } from "../utils/truthy";
import { TableKeyboardDelegate } from "./table-keyboard-delegate";
import { gridIds } from "./utils";

export interface AriaTableProps extends GridProps {
  /**
   * The layout object for the table. Computes what content is visible and how to position and style
   * them.
   */
  layoutDelegate?: LayoutDelegate;
  /** @deprecated - Use layoutDelegate instead. */
  layout?: DeprecatedLayout;
}

interface DeprecatedLayout {
  getLayoutInfo: (key: Key) => DeprecatedLayoutInfo;
  getContentSize: () => Size;
  virtualizer: DeprecatedVirtualizer;
}

interface DeprecatedLayoutInfo {
  rect: Rect;
}

interface DeprecatedVirtualizer {
  visibleRect: Rect;
}

/**
 * Provides the behavior and accessibility implementation for a table component. A table displays
 * data in rows and columns and enables a user to navigate its contents via directional navigation
 * keys, and optionally supports row selection and sorting.
 *
 * @param props - Props for the table.
 * @param state - State for the table, as returned by `useTableState`.
 * @param ref - The ref attached to the table element.
 */
export function createTable<T>(
  props: AriaTableProps,
  state: TableState<T> | TreeGridState<T>,
  ref: Accessor<HTMLElement | null>
): GridAria {
  const _result0 = props;
  // By default, a KeyboardDelegate is provided which uses the DOM to query layout information (e.g. for page up/page down).
  // When virtualized, the layout object will be passed in as a prop and override this.
  const collator = createCollator({ sensitivity: "base", usage: "search" });
  const _result1 = createLocale();

  const disabledBehavior = createMemo(
    () => state.selectionManager.disabledBehavior
  );

  const delegate = createMemo(
    () =>
      getTruthyValue(_result0.keyboardDelegate) ??
      new TableKeyboardDelegate({
        collator,
        collection: state.collection,
        direction: _result1.direction,
        disabledBehavior: disabledBehavior(),
        disabledKeys: state.disabledKeys,
        // oxlint-disable-next-line typescript/no-deprecated -- Forward the supported legacy layout option to the keyboard delegate compatibility adapter.
        layout: getLegacyOption(_result0, "layout"),
        layoutDelegate: _result0.layoutDelegate,
        ref,
      })
  );

  const id = createId(() => props.id);
  gridIds.set(state, untrack(id));
  createRenderEffect(id, (value) => {
    gridIds.set(state, value);
  });

  const _result2 = createGrid(
    merge(props, {
      get id() {
        return id();
      },
      get keyboardDelegate() {
        return delegate();
      },
    }),
    state,
    ref
  );

  const stringFormatter = createLocalizedStringFormatter(
    intlMessages,
    "@react-aria/table"
  );

  const sortDescription = createMemo((): undefined | string => {
    const descriptor = state.sortDescriptor;

    if (!descriptor) {
      return undefined;
    }

    const columnName =
      state.collection.columns.find((c) => c.key === descriptor.column)
        ?.textValue ?? "";

    return stringFormatter.format(
      descriptor.direction === "ascending" ? "ascendingSort" : "descendingSort",
      { columnName }
    );
  });

  const descriptionProps = createDescription(() => sortDescription());
  // Only announce after initial render, tabbing to the table will tell you the initial sort info already
  createEffect(
    () => ({ sortDescription: sortDescription() }),
    ({ sortDescription: currentSortDescription }) => {
      const description = currentSortDescription;

      if (isTruthy(description)) {
        announce(description, "assertive", 500);
      }
    },
    { defer: true, ssrSource: "client" }
  );

  return {
    get gridProps() {
      return merge(mergeProps(_result2.gridProps, descriptionProps), () => {
        const overrides: GridAria["gridProps"] = {
          // merge sort description with long press information
          "aria-describedby": ariaValue(
            [
              descriptionProps["aria-describedby"],
              _result2.gridProps["aria-describedby"],
            ]
              .filter(Boolean)
              .join(" ")
          ),
        };

        if (isTruthy(_result0.isVirtualized)) {
          overrides["aria-rowcount"] =
            state.collection.size + state.collection.headerRows.length;
        }

        if (isPresent(state.treeColumn)) {
          overrides.role = "treegrid";
        }

        return overrides;
      });
    },
  };
}
