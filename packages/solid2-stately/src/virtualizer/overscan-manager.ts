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
 * Derived from Adobe React Spectrum: packages/react-stately/src/virtualizer/OverscanManager.ts.
 * Modified for Solid Aria: adapted imports, collection descriptors, and reactive state APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { Point } from "./point";
import { Rect } from "./rect";

export class OverscanManager {
  private startTime = 0;
  private readonly velocity = new Point(0, 0);
  private visibleRect = new Rect();

  setVisibleRect(rect: Rect): void {
    const time = performance.now() - this.startTime;

    if (time < 500) {
      if (rect.x !== this.visibleRect.x && time > 0) {
        this.velocity.x = (rect.x - this.visibleRect.x) / time;
      }

      if (rect.y !== this.visibleRect.y && time > 0) {
        this.velocity.y = (rect.y - this.visibleRect.y) / time;
      }
    }

    this.startTime = performance.now();
    this.visibleRect = rect;
  }

  getOverscannedRect(): Rect {
    const overscanned = this.visibleRect.copy();

    const overscanY = this.visibleRect.height / 3;
    overscanned.height += overscanY;

    if (this.velocity.y < 0) {
      overscanned.y -= overscanY;
    }

    const overscanX = this.visibleRect.width / 3;
    overscanned.width += overscanX;

    if (this.velocity.x < 0) {
      overscanned.x -= overscanX;
    }

    return overscanned;
  }
}
