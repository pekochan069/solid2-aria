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
 * Derived from Adobe React Spectrum: packages/react-aria/src/grid/utils.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { GridState } from "@solid2-aria/stately/grid/create-grid-state";
import type { IGridCollection as GridCollection } from "@solid2-aria/stately/grid/grid-collection";
import type { Key, KeyboardDelegate } from "@solid2-aria/types-shared";

interface GridMapShared {
  keyboardDelegate: KeyboardDelegate;
  actions: {
    onRowAction?: (key: Key) => void;
    onCellAction?: (key: Key) => void;
  };
  shouldSelectOnPressUp?: boolean;
  keyboardNavigationBehavior?: "arrow" | "tab";
}

// Used to share:
// keyboard delegate between useGrid and useGridCell
// onRowAction/onCellAction across hooks
export const gridMap: WeakMap<
  GridState<unknown, GridCollection<unknown>>,
  GridMapShared
> = new WeakMap<GridState<unknown, GridCollection<unknown>>, GridMapShared>();
