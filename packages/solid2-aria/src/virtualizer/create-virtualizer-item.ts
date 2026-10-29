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
 * Derived from Adobe React Spectrum: packages/react-aria/src/virtualizer/useVirtualizerItem.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { LayoutInfo } from "@solid2-aria/stately/virtualizer/layout-info";
import { Size } from "@solid2-aria/stately/virtualizer/size";
import type { Key } from "@solid2-aria/types-shared";
import { createMemo, createEffect } from "solid-js";
import type { Accessor } from "solid-js";

import { isElementVisible } from "../utils/is-element-visible";
import { isPresent } from "../utils/is-present";
import { isTruthy } from "../utils/truthy";

interface IVirtualizer {
  updateItemSize: (key: Key, size: Size) => void;
}

export interface VirtualizerItemOptions {
  layoutInfo: LayoutInfo | null;
  virtualizer: IVirtualizer;
  ref: Accessor<HTMLElement | null>;
  shouldObserveItemSize?: boolean;
}

export interface VirtualizerItemAria {
  updateSize: () => void;
}

export function createVirtualizerItem(
  options: VirtualizerItemOptions
): VirtualizerItemAria {
  const _result0 = options;
  const key = createMemo(() => _result0.layoutInfo?.key);

  const updateSize = () => {
    const result0refElement = _result0.ref();
    const itemKey = key();

    if (isPresent(itemKey) && result0refElement) {
      // if the virtualized item is not visible (aka display none on virtualized collection),
      // we want to avoid reporting size 0 otherwise we get into a state where the virtualizer renders 0 items
      // when it is hidden and thus won't remeasure when it is is unhidden
      if (!isElementVisible(result0refElement)) {
        return;
      }

      const size = getSize(result0refElement);
      _result0.virtualizer.updateItemSize(itemKey, size);
    }
  };

  const updateSizeEvent = updateSize;
  createEffect(
    () => ({ element: _result0.ref(), layoutInfo: _result0.layoutInfo }),
    ({ layoutInfo, element }) => {
      if (element && isTruthy(layoutInfo?.estimatedSize)) {
        updateSizeEvent();
      }
    },
    { ssrSource: "client" }
  );
  // Follow-up: Consider using a MutationObserver in addition to ResizeObserver to detect
  // when inner DOM structure changes cause an item's height to change.
  // The current ResizeObserver only observes direct children,
  // so mutations deeper in the tree won't trigger a remeasure, leading to stale cached heights and overlapping items.
  // useResizeObserver observes one element via ref, but the wrapper height is fixed by layout
  // and won't change when content grows. Observe direct children instead, then remeasure the
  // wrapper in updateSize.
  createEffect(
    () => ({
      element: _result0.ref(),
      key: key(),
      shouldObserve: _result0.shouldObserveItemSize,
    }),
    ({ shouldObserve, element: el }): undefined | (() => void) => {
      if (!isTruthy(shouldObserve)) {
        return undefined;
      }

      if (!el || typeof ResizeObserver === "undefined") {
        return undefined;
      }

      const resizeObserver = new ResizeObserver((entries) => {
        if (!entries.length) {
          return;
        }

        updateSizeEvent();
      });

      for (const child of el.children) {
        resizeObserver.observe(child);
      }

      return () => {
        resizeObserver.disconnect();
      };
    },
    { ssrSource: "client" }
  );

  return {
    get updateSize() {
      return updateSize;
    },
  };
}

function getSize(node: HTMLElement): Size {
  // Reset height before measuring so we get the intrinsic size
  const { height } = node.style;
  node.style.height = "";
  const size = new Size(node.scrollWidth, node.scrollHeight);
  node.style.height = height;

  return size;
}
