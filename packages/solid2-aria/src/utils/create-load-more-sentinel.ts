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
 * Derived from Adobe React Spectrum: packages/react-aria/src/utils/useLoadMoreSentinel.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { AsyncLoadable, Collection } from "@solid2-aria/types-shared";
import { createEffect } from "solid-js";
import type { Accessor } from "solid-js";

import { requireHTMLElement } from "./dom-value";
import { getScrollParent } from "./get-scroll-parent";

export interface LoadMoreSentinelProps extends Omit<
  AsyncLoadable,
  "isLoading"
> {
  collection: Collection<unknown>;
  /**
   * The amount of offset from the bottom of your scrollable region that should trigger load more.
   * Uses a percentage value relative to the scroll body's client height. Load more is then
   * triggered when your current scroll position's distance from the bottom of the currently loaded
   * list of items is less than or equal to the provided value. (e.g. 1 = 100% of the scroll
   * region's height).
   *
   * @default 1
   */
  scrollOffset?: number;
  /**
   * The scroll direction that triggers load more. Use 'start' for reversed layouts where older
   * content loads when scrolling toward the top.
   *
   * @default 'end'
   */
  direction?: "start" | "end";
}

export function createLoadMoreSentinel(
  props: LoadMoreSentinelProps,
  ref: Accessor<HTMLElement | null>
): void {
  createEffect(
    () => ({
      collection: props.collection,
      direction: props.direction ?? "end",
      element: ref(),
      offset: props.scrollOffset ?? 1,
    }),
    ({ direction, element, offset }): undefined | (() => void) => {
      if (!element) {
        return undefined;
      }

      const margin = 100 * offset;

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              props.onLoadMore?.();
            }
          }
        },
        {
          root: requireHTMLElement(getScrollParent(element)),
          rootMargin:
            direction === "start"
              ? `${margin}% 0px 0px 0px`
              : `0px ${margin}% ${margin}% ${margin}%`,
        }
      );

      observer.observe(element);

      return () => {
        observer.disconnect();
      };
    },
    { ssrSource: "client" }
  );
}
