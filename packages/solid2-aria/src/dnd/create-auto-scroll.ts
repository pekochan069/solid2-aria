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
 * Derived from Adobe React Spectrum: packages/react-aria/src/dnd/useAutoScroll.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createEffect, onSettled } from "solid-js";
import type { Accessor } from "solid-js";

import { getScrollParent } from "../utils/get-scroll-parent";
import { isScrollable } from "../utils/is-scrollable";
import { isIOS, isWebKit } from "../utils/platform";
import { isTruthy } from "../utils/truthy";

const AUTOSCROLL_AREA_SIZE = 20;

interface AutoScrollAria {
  move: (x: number, y: number) => void;
  stop: () => void;
}

export function createAutoScroll(
  ref: Accessor<Element | null>
): AutoScrollAria {
  let scrollableElement: Element | null = null;
  let scrollableX = true;
  let scrollableY = true;
  createEffect(ref, (element) => {
    scrollableElement = null;

    if (element) {
      scrollableElement = isScrollable(element)
        ? element
        : getScrollParent(element);
    }

    if (scrollableElement) {
      const style = window.getComputedStyle(scrollableElement);
      scrollableX = /(?:auto|scroll)/u.test(style.overflowX);
      scrollableY = /(?:auto|scroll)/u.test(style.overflowY);
    }
  });

  interface AutoScrollState {
    timer: ReturnType<typeof requestAnimationFrame> | undefined;
    dx: number;
    dy: number;
  }

  const state: AutoScrollState = {
    dx: 0,
    dy: 0,
    timer: undefined,
  };

  onSettled(() => () => {
    if (isTruthy(state.timer)) {
      cancelAnimationFrame(state.timer);
      state.timer = undefined;
    }
  });

  const scroll = () => {
    const scrollableRefElement = scrollableElement;

    if (scrollableX && scrollableRefElement) {
      scrollableRefElement.scrollLeft += state.dx;
    }

    if (scrollableY && scrollableRefElement) {
      scrollableRefElement.scrollTop += state.dy;
    }

    if (isTruthy(state.timer)) {
      state.timer = requestAnimationFrame(scroll);
    }
  };

  return {
    move(x, y) {
      const scrollableRefElement = scrollableElement;

      // Most browsers auto scroll natively, but WebKit on macOS does not (iOS does 🤷‍♂️).
      // https://bugs.webkit.org/show_bug.cgi?id=222636
      if (!isWebKit() || isIOS() || !scrollableRefElement) {
        return;
      }

      const box = scrollableRefElement.getBoundingClientRect();
      const left = AUTOSCROLL_AREA_SIZE;
      const top = AUTOSCROLL_AREA_SIZE;
      const bottom = box.height - AUTOSCROLL_AREA_SIZE;
      const right = box.width - AUTOSCROLL_AREA_SIZE;

      if (x < left || x > right || y < top || y > bottom) {
        if (x < left) {
          state.dx = x - left;
        } else if (x > right) {
          state.dx = x - right;
        }

        if (y < top) {
          state.dy = y - top;
        } else if (y > bottom) {
          state.dy = y - bottom;
        }

        if (!isTruthy(state.timer)) {
          state.timer = requestAnimationFrame(scroll);
        }
      } else {
        this.stop();
      }
    },
    stop() {
      if (isTruthy(state.timer)) {
        cancelAnimationFrame(state.timer);
        state.timer = undefined;
      }
    },
  };
}
