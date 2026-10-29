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
 * Derived from Adobe React Spectrum: packages/react-aria/src/gridlist/useGridListSelectionCheckbox.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { ListState } from "@solid2-aria/stately/list/create-list-state";
import { merge } from "solid-js";

import { createGridSelectionCheckbox } from "../grid/create-grid-selection-checkbox";
import type {
  AriaGridSelectionCheckboxProps,
  GridSelectionCheckboxAria,
} from "../grid/create-grid-selection-checkbox";
import { ariaValue } from "../utils/aria-value";
import { getRowId } from "./utils";

/**
 * Provides the behavior and accessibility implementation for a selection checkbox in a grid list.
 *
 * @param props - Props for the selection checkbox.
 * @param state - State of the list, as returned by `useListState`.
 */
export function createGridListSelectionCheckbox<T>(
  props: AriaGridSelectionCheckboxProps,
  state: ListState<T>
): GridSelectionCheckboxAria {
  const _result0 = props;
  const _result1 = createGridSelectionCheckbox(props, state);

  return {
    get checkboxProps() {
      return merge(_result1.checkboxProps, {
        get "aria-labelledby"() {
          return ariaValue(
            ariaValue(
              `${_result1.checkboxProps.id} ${getRowId(state, _result0.key)}`
            )
          );
        },
      });
    },
  };
}
