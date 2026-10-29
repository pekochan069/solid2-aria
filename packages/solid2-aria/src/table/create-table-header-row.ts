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
 * Derived from Adobe React Spectrum: packages/react-aria/src/table/useTableHeaderRow.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { TableState } from "@solid2-aria/stately/table/create-table-state";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import type { Accessor } from "solid-js";

import type { GridRowProps } from "../grid/create-grid-row";
import { isPresent } from "../utils/is-present";
import { isTruthy } from "../utils/truthy";

export interface TableHeaderRowAria {
  /** Props for the grid row element. */
  rowProps: DOMAttributes;
}

/**
 * Provides the behavior and accessibility implementation for a header row in a table.
 *
 * @param props - Props for the row.
 * @param state - State of the table, as returned by `useTableState`.
 */
export function createTableHeaderRow<T>(
  props: GridRowProps<T>,
  state: TableState<T>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ref: Accessor<Element | null>
): TableHeaderRowAria {
  const _result0 = props;

  const rowProps: DOMAttributes = {
    get "aria-rowindex"() {
      return isTruthy(_result0.isVirtualized) && !isPresent(state.treeColumn)
        ? _result0.node.index + 1
        : undefined;
    },
    role: "row",
  };

  return {
    get rowProps() {
      return rowProps;
    },
  };
}
