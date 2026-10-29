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
 * Derived from Adobe React Spectrum: packages/react-aria/src/gridlist/useGridListSection.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { ListState } from "@solid2-aria/stately/list/create-list-state";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { merge } from "solid-js";
import type { Accessor } from "solid-js";

import { ariaValue } from "../utils/aria-value";
import { createSlotId } from "../utils/create-id";
import { createLabels } from "../utils/create-labels";

export interface AriaGridListSectionProps {
  /** An accessibility label for the section. Required if `heading` is not present. */
  "aria-label"?: string;
}

export interface GridListSectionAria {
  /** Props for the wrapper list item. */
  rowProps: DOMAttributes;
  /** Props for the heading element, if any. */
  rowHeaderProps: DOMAttributes;
  /** Props for the grid's row group element. */
  rowGroupProps: DOMAttributes;
}

/**
 * Provides the behavior and accessibility implementation for a section in a grid list.
 * See `useGridList` for more details about grid list.
 *
 * @param props - Props for the section.
 */
export function createGridListSection<T>(
  props: AriaGridListSectionProps,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  state: ListState<T>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ref: Accessor<HTMLElement | null>
): GridListSectionAria {
  const _result0 = props;
  const headingId = createSlotId();

  const labelProps = createLabels({
    get "aria-label"() {
      return ariaValue(ariaValue(_result0["aria-label"]));
    },
    get "aria-labelledby"() {
      return ariaValue(ariaValue(headingId()));
    },
  });

  return {
    get rowGroupProps() {
      return merge(
        {
          get role(): "rowgroup" {
            return "rowgroup";
          },
        },
        labelProps
      );
    },
    get rowHeaderProps() {
      return {
        get id() {
          return headingId();
        },
        get role(): "rowheader" {
          return "rowheader";
        },
      };
    },
    get rowProps() {
      return {
        get role(): "row" {
          return "row";
        },
      };
    },
  };
}
