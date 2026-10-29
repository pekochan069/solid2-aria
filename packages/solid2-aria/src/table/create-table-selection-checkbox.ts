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
 * Derived from Adobe React Spectrum: packages/react-aria/src/table/useTableSelectionCheckbox.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { TableState } from "@solid2-aria/stately/table/create-table-state";
import type { Key } from "@solid2-aria/types-shared";
import { merge } from "solid-js";

import intlMessages from "../../intl/table/index";
import type { AriaCheckboxProps } from "../checkbox/create-checkbox";
import { createGridSelectionCheckbox } from "../grid/create-grid-selection-checkbox";
import { createLocalizedStringFormatter } from "../i18n/create-localized-string-formatter";
import { ariaValue } from "../utils/aria-value";
import { getRowLabelledBy } from "./utils";

export interface AriaTableSelectionCheckboxProps {
  /** A unique key for the checkbox. */
  key: Key;
}

export interface TableSelectionCheckboxAria {
  /** Props for the row selection checkbox element. */
  checkboxProps: AriaCheckboxProps;
}

export interface TableSelectAllCheckboxAria {
  /** Props for the select all checkbox element. */
  checkboxProps: AriaCheckboxProps;
}

/**
 * Provides the behavior and accessibility implementation for a selection checkbox in a table.
 *
 * @param props - Props for the selection checkbox.
 * @param state - State of the table, as returned by `useTableState`.
 */
export function createTableSelectionCheckbox<T>(
  props: AriaTableSelectionCheckboxProps,
  state: TableState<T>
): TableSelectionCheckboxAria {
  const _result0 = props;
  const _result1 = createGridSelectionCheckbox(props, state);

  return {
    get checkboxProps() {
      return merge(_result1.checkboxProps, {
        get "aria-labelledby"() {
          return ariaValue(
            ariaValue(
              `${_result1.checkboxProps.id} ${getRowLabelledBy(state, _result0.key)}`
            )
          );
        },
      });
    },
  };
}

/**
 * Provides the behavior and accessibility implementation for the select all checkbox in a table.
 *
 * @param props - Props for the select all checkbox.
 * @param state - State of the table, as returned by `useTableState`.
 */
export function createTableSelectAllCheckbox<T>(
  state: TableState<T>
): TableSelectAllCheckboxAria {
  const stringFormatter = createLocalizedStringFormatter(
    intlMessages,
    "@react-aria/table"
  );

  return {
    get checkboxProps() {
      return {
        get "aria-label"() {
          return ariaValue(
            ariaValue(
              stringFormatter.format(
                state.selectionManager.selectionMode === "single"
                  ? "select"
                  : "selectAll"
              )
            )
          );
        },
        get isDisabled() {
          return (
            state.selectionManager.selectionMode !== "multiple" ||
            state.collection.size === 0 ||
            (state.collection.rows.length === 1 &&
              state.collection.rows[0]?.type === "loader")
          );
        },
        get isIndeterminate() {
          return (
            !state.selectionManager.isEmpty &&
            !state.selectionManager.isSelectAll
          );
        },
        get isSelected() {
          return state.selectionManager.isSelectAll;
        },
        get onChange() {
          return () => {
            state.selectionManager.toggleSelectAll();
          };
        },
      };
    },
  };
}
