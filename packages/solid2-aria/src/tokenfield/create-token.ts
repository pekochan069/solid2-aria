/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing
 */
/*
 * Derived from Adobe React Spectrum: packages/react-aria/src/tokenfield/useToken.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { TokenFieldState } from "@solid2-aria/stately/tokenfield/create-token-field-state";
import { createSignal } from "solid-js";
import type { Accessor } from "solid-js";

import type { HTMLAttributes } from "../types";
import { createEvent } from "../utils/create-event";
import { isVirtualClick } from "../utils/is-virtual-event";
import { isTruthy } from "../utils/truthy";

export type TokenProps = Record<string, never>;

export interface TokenAria {
  /** Props for the token element. */
  tokenProps: HTMLAttributes<HTMLSpanElement>;
  /** Whether the token is currently selected. */
  isSelected: boolean;
}

/**
 * Provides the behavior and accessibility implementation for a token within a token field.
 * A token field allows users to enter text with inline tokens.
 */
export function createToken(
  // Unused but matches the normal signature.
  _props: TokenProps,
  _state: TokenFieldState,
  ref: Accessor<HTMLSpanElement | null>
): TokenAria {
  const [isSelected, setSelected] = createSignal(false, { ownedWrite: true });
  createEvent(
    () => (typeof document === "undefined" ? null : document),
    "selectionchange",
    () => {
      const refElement = ref();
      const selection = window.getSelection();

      if (!selection || !refElement) {
        return;
      }

      const range = selection.rangeCount === 0 ? null : selection.getRangeAt(0);

      if (
        !isTruthy(range?.collapsed) &&
        isTruthy(range?.intersectsNode(refElement))
      ) {
        setSelected(true);
      } else {
        setSelected(false);
      }
    }
  );

  return {
    get isSelected() {
      return isSelected();
    },
    get tokenProps() {
      return {
        get contenteditable(): false {
          return false;
        },
        onClick(e: globalThis.MouseEvent) {
          // Select the token when a screen reader clicks on it.
          if (isSelected() || !isVirtualClick(e)) {
            return;
          }

          const selection = window.getSelection();
          const wrapper = ref()?.parentElement;

          if (!selection || !wrapper) {
            return;
          }

          const range = document.createRange();
          range.setStartBefore(wrapper);
          range.setEndAfter(wrapper);
          selection.removeAllRanges();
          selection.addRange(range);
        },
        get style() {
          return {
            get WebkitTapHighlightColor(): "transparent" {
              return "transparent";
            },
            get WebkitUserSelect(): "all" {
              return "all";
            },
            get userSelect(): "all" {
              return "all";
            },
          };
        },
        get suppressContentEditableWarning(): true {
          return true;
        },
      };
    },
  };
}
