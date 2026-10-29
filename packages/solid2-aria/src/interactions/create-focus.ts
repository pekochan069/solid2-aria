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
 * Derived from Adobe React Spectrum: packages/react-aria/src/interactions/useFocus.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { FocusableElement, FocusEvents } from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";

import type { FocusEvent } from "../types";
import { getOwnerDocument } from "../utils/dom-helpers";
import {
  getActiveElement,
  getEventTarget,
} from "../utils/shadowdom/dom-functions";
import { isTruthy } from "../utils/truthy";
import { createBlurObserver } from "./utils";

export interface FocusProps<
  Target = FocusableElement,
> extends FocusEvents<Target> {
  /** Whether the focus events should be disabled. */
  isDisabled?: boolean;
}

export interface FocusResult<Target = FocusableElement> {
  /** Props to spread onto the target element. */
  focusProps: DOMAttributes<Target>;
}

/**
 * Handles focus events for the immediate target.
 * Focus events on child elements will be ignored.
 */
export function createFocus<Target extends FocusableElement = FocusableElement>(
  props: FocusProps<Target>
): FocusResult<Target> {
  let focused = false;

  const onBlur: FocusProps<Target>["onBlur"] = (e: FocusEvent<Target>) => {
    if (
      (focused || !isTruthy(props.isDisabled)) &&
      getEventTarget(e) === e.currentTarget
    ) {
      focused = false;

      if (props.onBlur) {
        props.onBlur(e);
      }

      if (props.onFocusChange) {
        props.onFocusChange(false);
      }
    }
  };

  const observeFocus = createBlurObserver();

  const onFocus: FocusProps<Target>["onFocus"] = (e: FocusEvent<Target>) => {
    // Double check that document.activeElement actually matches e.target in case a previously chained
    // focus handler already moved focus somewhere else.
    const eventTarget = getEventTarget(e);
    const ownerDocument = getOwnerDocument(eventTarget);

    const activeElement = isTruthy(ownerDocument)
      ? getActiveElement(ownerDocument)
      : getActiveElement();

    if (eventTarget === e.currentTarget && eventTarget === activeElement) {
      focused = true;

      if (props.onFocus) {
        props.onFocus(e);
      }

      if (props.onFocusChange) {
        props.onFocusChange(true);
      }

      observeFocus(e);
    }
  };

  return {
    get focusProps() {
      return {
        get onBlur() {
          return props.onBlur || props.onFocusChange ? onBlur : undefined;
        },
        get onFocus() {
          return !isTruthy(props.isDisabled) &&
            (props.onFocus || props.onFocusChange || props.onBlur)
            ? onFocus
            : undefined;
        },
      };
    },
  };
}
