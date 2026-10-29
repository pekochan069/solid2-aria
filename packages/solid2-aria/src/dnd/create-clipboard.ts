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
 * Derived from Adobe React Spectrum: packages/react-aria/src/dnd/useClipboard.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { DragItem, DropItem } from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { createEffect } from "solid-js";

import { createFocus } from "../interactions/create-focus";
import { chain } from "../utils/chain";
import { isTruthy } from "../utils/truthy";
import { readFromDataTransfer, writeToDataTransfer } from "./utils";

export interface ClipboardProps {
  /** A function that returns the items to copy. */
  getItems?: (details: { action: "cut" | "copy" }) => DragItem[];
  /** Handler that is called when the user triggers a copy interaction. */
  onCopy?: () => void;
  /** Handler that is called when the user triggers a cut interaction. */
  onCut?: () => void;
  /** Handler that is called when the user triggers a paste interaction. */
  onPaste?: (items: DropItem[]) => void;
  /** Whether the clipboard is disabled. */
  isDisabled?: boolean;
}

export interface ClipboardResult {
  /** Props for the element that will handle clipboard events. */
  clipboardProps: DOMAttributes;
}

const globalEvents = new Map<
  string,
  { listener: EventListener; handlers: Set<(event: ClipboardEvent) => void> }
>();

function addGlobalEventListener(
  event: string,
  fn: (event: ClipboardEvent) => void
) {
  let eventData = globalEvents.get(event);

  if (!eventData) {
    const handlers = new Set<(e: ClipboardEvent) => void>();

    const listener: EventListener = (e) => {
      if (!(e instanceof ClipboardEvent)) {
        return;
      }

      for (const handler of handlers) {
        handler(e);
      }
    };

    eventData = { handlers, listener };
    globalEvents.set(event, eventData);
    document.addEventListener(event, listener);
  }

  eventData.handlers.add(fn);

  return () => {
    eventData.handlers.delete(fn);

    if (eventData.handlers.size === 0) {
      document.removeEventListener(event, eventData.listener);
      globalEvents.delete(event);
    }
  };
}

/**
 * Handles clipboard interactions for a focusable element. Supports items of multiple
 * data types, and integrates with the operating system native clipboard.
 */
export function createClipboard(options: ClipboardProps): ClipboardResult {
  const _result0 = options;
  let isFocusedRef = false;

  const _result1 = createFocus({
    get onFocusChange() {
      return (isFocused: boolean) => {
        isFocusedRef = isFocused;
      };
    },
  });

  const onBeforeCopy = (e: ClipboardEvent) => {
    // Enable the "Copy" menu item in Safari if this element is focused and copying is supported.
    if (isFocusedRef && options.getItems) {
      e.preventDefault();
    }
  };

  const onCopy = (e: ClipboardEvent) => {
    if (!isFocusedRef || !options.getItems) {
      return;
    }

    e.preventDefault();

    if (e.clipboardData) {
      writeToDataTransfer(
        e.clipboardData,
        options.getItems({ action: "copy" })
      );
      options.onCopy?.();
    }
  };

  const onBeforeCut = (e: ClipboardEvent) => {
    if (isFocusedRef && options.onCut && options.getItems) {
      e.preventDefault();
    }
  };

  const onCut = (e: ClipboardEvent) => {
    if (!isFocusedRef || !options.onCut || !options.getItems) {
      return;
    }

    e.preventDefault();

    if (e.clipboardData) {
      writeToDataTransfer(e.clipboardData, options.getItems({ action: "cut" }));
      options.onCut();
    }
  };

  const onBeforePaste = (e: ClipboardEvent) => {
    // Unfortunately, e.clipboardData.types is not available in this event so we always
    // have to enable the Paste menu item even if the type of data is unsupported.
    if (isFocusedRef && options.onPaste) {
      e.preventDefault();
    }
  };

  const onPaste = (e: ClipboardEvent) => {
    if (!isFocusedRef || !options.onPaste) {
      return;
    }

    e.preventDefault();

    if (e.clipboardData) {
      const items = readFromDataTransfer(e.clipboardData);
      options.onPaste(items);
    }
  };

  createEffect(
    () => [_result0.isDisabled],
    (): undefined | (() => void) => {
      if (isTruthy(_result0.isDisabled)) {
        return undefined;
      }

      return chain(
        addGlobalEventListener("beforecopy", onBeforeCopy),
        addGlobalEventListener("copy", onCopy),
        addGlobalEventListener("beforecut", onBeforeCut),
        addGlobalEventListener("cut", onCut),
        addGlobalEventListener("beforepaste", onBeforePaste),
        addGlobalEventListener("paste", onPaste)
      );
    },
    { ssrSource: "client" }
  );

  return {
    get clipboardProps() {
      return _result1.focusProps;
    },
  };
}
