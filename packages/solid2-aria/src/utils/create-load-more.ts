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
 * Derived from Adobe React Spectrum: packages/react-aria/src/utils/useLoadMore.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createEffect, untrack } from "solid-js";
import type { Accessor } from "solid-js";

import { createEvent } from "./create-event";
import { isTruthy } from "./truthy";

export interface LoadMoreProps {
  /** Whether data is currently being loaded. */
  isLoading?: boolean;
  /** Handler that is called when more items should be loaded, e.g. while scrolling near the bottom. */
  onLoadMore?: () => void;
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
  /** The data currently loaded. */
  items?: unknown;
}

export function createLoadMore(
  props: LoadMoreProps,
  ref: Accessor<HTMLElement | null>
): void {
  let loading = untrack(() => props.isLoading ?? false);
  let previousLoading = loading;
  let lastItems = untrack(() => props.items);

  const onScroll = () => {
    const element = ref();

    if (!element || loading || !props.onLoadMore) {
      return;
    }

    if (
      element.scrollHeight - element.scrollTop - element.clientHeight <
      element.clientHeight * (props.scrollOffset ?? 1)
    ) {
      loading = true;
      props.onLoadMore();
    }
  };

  createEffect(
    () => ({
      element: ref(),
      isLoading: props.isLoading ?? false,
      items: props.items,
      onLoadMore: props.onLoadMore,
    }),
    ({ element, isLoading, items, onLoadMore }) => {
      if (isLoading !== previousLoading || items !== lastItems) {
        loading = isLoading;
      }

      if (
        element &&
        !loading &&
        onLoadMore &&
        (!isTruthy(items) || items !== lastItems) &&
        element.clientHeight === element.scrollHeight
      ) {
        loading = true;
        onLoadMore();
      }

      previousLoading = isLoading;
      lastItems = items;
    },
    { ssrSource: "client" }
  );
  createEvent(ref, "scroll", onScroll);
}
