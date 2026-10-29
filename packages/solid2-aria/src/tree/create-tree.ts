/*
 * Copyright 2024 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria/src/tree/useTree.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { TreeState } from "@solid2-aria/stately/tree/create-tree-state";
import type { KeyboardDelegate } from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import type { Accessor } from "solid-js";

import { createGridList } from "../gridlist/create-grid-list";
import type {
  AriaGridListOptions,
  AriaGridListProps,
  GridListProps,
} from "../gridlist/create-grid-list";
import { mergeProps } from "../utils/merge-props";

export type TreeProps<T> = GridListProps<T>;

export type AriaTreeProps<T> = AriaGridListProps<T>;

export interface AriaTreeOptions<T> extends Omit<
  AriaGridListOptions<T>,
  "children" | "shouldFocusWrap"
> {
  /**
   * An optional keyboard delegate implementation for type to select,
   * to override the default.
   */
  keyboardDelegate?: KeyboardDelegate;
}

export interface TreeAria {
  /** Props for the treegrid element. */
  gridProps: DOMAttributes;
}

/**
 * Provides the behavior and accessibility implementation for a single column treegrid component
 * with interactive children. A tree grid provides users with a way to navigate nested hierarchical
 * information.
 *
 * @param props - Props for the treegrid.
 * @param state - State for the treegrid, as returned by `useTreeState`.
 * @param ref - The ref attached to the treegrid element.
 */
export function createTree<T>(
  props: AriaTreeOptions<T>,
  state: TreeState<T>,
  ref: Accessor<HTMLElement | null>
): TreeAria {
  const _result0 = createGridList(props, state, ref);

  return {
    get gridProps() {
      return mergeProps(_result0.gridProps, { role: "treegrid" as const });
    },
  };
}
