/*
 * Copyright 2021 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria/src/interactions/useScrollWheel.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { ScrollEvents } from "@solid2-aria/types-shared";
import type { Accessor } from "solid-js";

import { createEvent } from "../utils/create-event";
import { isTruthy } from "../utils/truthy";

export interface ScrollWheelProps extends ScrollEvents {
  /** Whether the scroll listener should be disabled. */
  isDisabled?: boolean;
}

// scroll wheel needs to be added not passively so it's cancelable, small helper hook to remember that
export function createScrollWheel(
  props: ScrollWheelProps,
  ref: Accessor<HTMLElement | null>
): void {
  const _result0 = props;

  const onScrollHandler = (e: WheelEvent) => {
    // If the ctrlKey is pressed, this is a zoom event, do nothing.
    if (e.ctrlKey || isTruthy(props.isDisabled)) {
      return;
    }

    // stop scrolling the page
    e.preventDefault();
    e.stopPropagation();

    if (_result0.onScroll) {
      _result0.onScroll({ deltaX: e.deltaX, deltaY: e.deltaY });
    }
  };

  createEvent(ref, "wheel", onScrollHandler);
}
