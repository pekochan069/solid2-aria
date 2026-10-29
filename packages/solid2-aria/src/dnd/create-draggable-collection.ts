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
 * Derived from Adobe React Spectrum: packages/react-aria/src/dnd/useDraggableCollection.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { DraggableCollectionState } from "@solid2-aria/stately/dnd/create-draggable-collection-state";
import { createEffect } from "solid-js";
import type { Accessor } from "solid-js";

import { globalDndState, setDraggingCollectionRef } from "./utils";

export type DraggableCollectionOptions = Record<string, never>;

/**
 * Handles drag interactions for a collection component, with support for traditional mouse and
 * touch based drag and drop, in addition to full parity for keyboard and screen reader users.
 */
export function createDraggableCollection(
  props: DraggableCollectionOptions,
  state: DraggableCollectionState,
  ref: Accessor<HTMLElement | null>
): void {
  createEffect(
    () => state.draggingKeys.size,
    (count) => {
      if (count > 0 && globalDndState.draggingCollectionRef !== ref) {
        setDraggingCollectionRef(ref);
      }
    }
  );
}
