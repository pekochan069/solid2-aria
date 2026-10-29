/*
 * Copyright 2023 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria/src/toolbar/useToolbar.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  AriaLabelingProps,
  FocusableElement,
  Orientation,
} from "@solid2-aria/types-shared";
import { merge, createMemo, createSignal, createEffect } from "solid-js";
import type { Accessor } from "solid-js";

import { createFocusManager } from "../focus/focus-scope";
import { createLocale } from "../i18n/i18n-provider";
import type {
  FocusEventHandler,
  HTMLAttributes,
  KeyboardEventHandler,
} from "../types";
import { ariaValue } from "../utils/aria-value";
import { createEvent } from "../utils/create-event";
import { htmlElementOrNull } from "../utils/dom-value";
import { filterDOMProps } from "../utils/filter-dom-props";
import { isPresent } from "../utils/is-present";
import { scrollIntoViewport } from "../utils/scroll-into-view";
import {
  getActiveElement,
  getEventTarget,
  nodeContains,
} from "../utils/shadowdom/dom-functions";

export interface AriaToolbarProps extends AriaLabelingProps {
  /**
   * The orientation of the entire toolbar.
   *
   * @default 'horizontal'
   */
  orientation?: Orientation;
}

export interface ToolbarAria {
  /**
   * Props for the toolbar container.
   */
  toolbarProps: HTMLAttributes;
}

/**
 * Provides the behavior and accessibility implementation for a toolbar.
 * A toolbar is a container for a set of interactive controls with arrow key navigation.
 *
 * @param props - Props to be applied to the toolbar.
 * @param ref - A ref to a DOM element for the toolbar.
 */
export function createToolbar(
  props: AriaToolbarProps,
  ref: Accessor<HTMLElement | null>
): ToolbarAria {
  const _result0 = props;
  const [isInToolbar, setInToolbar] = createSignal(false, { ownedWrite: true });
  // should be safe because re-calling set state with the same value it already has is a no-op
  // this will allow us to react should a parent re-render and change its role though

  createEffect(
    () => ({ element: ref() }),
    ({ element }) => {
      const refElement = element;
      setInToolbar(
        !!(refElement && refElement.parentElement?.closest('[role="toolbar"]'))
      );
    },
    { ssrSource: "client" }
  );
  const _result1 = createLocale();

  const shouldReverse = createMemo(
    () =>
      _result1.direction === "rtl" &&
      (_result0.orientation ?? "horizontal") === "horizontal"
  );

  const focusManager = createFocusManager(ref);

  let lastFocused: HTMLElement | null = null;

  const onKeyDown: KeyboardEventHandler = (e) => {
    // don't handle portalled events
    if (!nodeContains(e.currentTarget, getEventTarget(e))) {
      return;
    }

    let nextFocused: FocusableElement | null = null;

    if (
      ((_result0.orientation ?? "horizontal") === "horizontal" &&
        e.key === "ArrowRight") ||
      ((_result0.orientation ?? "horizontal") === "vertical" &&
        e.key === "ArrowDown")
    ) {
      nextFocused = shouldReverse()
        ? focusManager.focusPrevious()
        : focusManager.focusNext();
    } else if (
      ((_result0.orientation ?? "horizontal") === "horizontal" &&
        e.key === "ArrowLeft") ||
      ((_result0.orientation ?? "horizontal") === "vertical" &&
        e.key === "ArrowUp")
    ) {
      nextFocused = shouldReverse()
        ? focusManager.focusNext()
        : focusManager.focusPrevious();
    } else if (e.key === "Tab") {
      // When the tab key is pressed, we want to move focus
      // out of the entire toolbar. To do this, move focus
      // to the first or last focusable child, and let the
      // browser handle the Tab key as usual from there.
      lastFocused = htmlElementOrNull(getActiveElement());

      if (e.shiftKey) {
        focusManager.focusFirst();
      } else {
        focusManager.focusLast();
      }

      return;
    } else {
      // if we didn't handle anything, return early so we don't preventDefault
      return;
    }

    // Focusing an item that is only partially visible doesn't scroll it fully into view,
    // so scroll it manually (e.g. the last button in an overflowing toolbar).
    if (nextFocused) {
      scrollIntoViewport(nextFocused, { containingElement: ref() });
    }

    // Prevent arrow keys from being handled by nested action groups.
    e.stopPropagation();
    e.preventDefault();
  };

  // Record the last focused child when focus moves out of the toolbar.

  const onBlur: FocusEventHandler<HTMLElement> = (e) => {
    if (
      !nodeContains(
        e.currentTarget,
        e.relatedTarget instanceof Node ? e.relatedTarget : null
      ) &&
      !lastFocused
    ) {
      lastFocused = getEventTarget(e);
    }
  };

  // Restore focus to the last focused child when focus returns into the toolbar.
  // If the element was removed, do nothing, either the first item in the first group,
  // or the last item in the last group will be focused, depending on direction.
  const onFocus: FocusEventHandler<HTMLElement> = (e) => {
    if (
      lastFocused &&
      !nodeContains(
        e.currentTarget,
        e.relatedTarget instanceof Node ? e.relatedTarget : null
      ) &&
      nodeContains(ref(), getEventTarget(e))
    ) {
      lastFocused?.focus();
      lastFocused = null;
    }
  };

  createEvent(
    ref,
    "blur",
    (event) => {
      if (!isInToolbar()) {
        onBlur(event);
      }
    },
    { capture: true }
  );
  createEvent(
    ref,
    "focus",
    (event) => {
      if (!isInToolbar()) {
        onFocus(event);
      }
    },
    { capture: true }
  );
  createEvent(
    ref,
    "keydown",
    (event) => {
      if (!isInToolbar()) {
        onKeyDown(event);
      }
    },
    { capture: true }
  );

  return {
    get toolbarProps() {
      return merge(filterDOMProps(props, { labelable: true }), {
        get "aria-label"() {
          return ariaValue(ariaValue(_result0["aria-label"]));
        },
        get "aria-labelledby"() {
          return ariaValue(
            ariaValue(
              isPresent(_result0["aria-label"])
                ? undefined
                : _result0["aria-labelledby"]
            )
          );
        },
        get "aria-orientation"() {
          return ariaValue(ariaValue(_result0.orientation ?? "horizontal"));
        },
        get role() {
          return isInToolbar() ? "group" : "toolbar";
        },
      });
    },
  };
}
