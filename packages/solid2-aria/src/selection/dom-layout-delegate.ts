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
 * Derived from Adobe React Spectrum: packages/react-aria/src/selection/DOMLayoutDelegate.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  Key,
  LayoutDelegate,
  Rect,
  Size,
} from "@solid2-aria/types-shared";
import type { Accessor } from "solid-js";

import { isPresent } from "../utils/is-present";
import { getItemElement } from "./utils";

export class DOMLayoutDelegate implements LayoutDelegate {
  private readonly ref: Accessor<HTMLElement | null>;
  constructor(ref: Accessor<HTMLElement | null>) {
    this.ref = ref;
  }
  getItemRect(key: Key): Rect | null {
    const container = this.ref();

    if (!container) {
      return null;
    }

    const item = isPresent(key) ? getItemElement(this.ref, key) : null;

    if (!item) {
      return null;
    }

    const containerRect = container.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();

    return {
      height: itemRect.height,
      width: itemRect.width,
      x:
        itemRect.left -
        containerRect.left -
        container.clientLeft +
        container.scrollLeft,
      y:
        itemRect.top -
        containerRect.top -
        container.clientTop +
        container.scrollTop,
    };
  }
  getContentSize(): Size {
    const container = this.ref();

    return {
      height: container?.scrollHeight ?? 0,
      width: container?.scrollWidth ?? 0,
    };
  }
  getVisibleRect(): Rect {
    const container = this.ref();

    return {
      height: container?.clientHeight ?? 0,
      width: container?.clientWidth ?? 0,
      x: container?.scrollLeft ?? 0,
      y: container?.scrollTop ?? 0,
    };
  }
}
