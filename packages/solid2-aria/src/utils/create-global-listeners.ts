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
 * Derived from Adobe React Spectrum: packages/react-aria/src/utils/useGlobalListeners.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { onSettled } from "solid-js";

import { isCallable } from "./is-callable";
import { isTruthy } from "./truthy";

interface GlobalListeners {
  addGlobalListener: {
    <K extends keyof WindowEventMap>(
      el: Window,
      type: K,
      listener: (this: Document, ev: WindowEventMap[K]) => void,
      options?: boolean | AddEventListenerOptions
    ): void;
    <K extends keyof DocumentEventMap>(
      el: EventTarget,
      type: K,
      listener: (this: Document, ev: DocumentEventMap[K]) => void,
      options?: boolean | AddEventListenerOptions
    ): void;
    (
      el: EventTarget,
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ): void;
  };
  removeGlobalListener: {
    <K extends keyof DocumentEventMap>(
      el: EventTarget,
      type: K,
      listener: (this: Document, ev: DocumentEventMap[K]) => void,
      options?: boolean | EventListenerOptions
    ): void;
    (
      el: EventTarget,
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions
    ): void;
  };
  removeAllGlobalListeners: () => void;
}

interface ListenerRecord {
  target: EventTarget;
  type: string;
  original: unknown;
  listener: EventListener;
  options?: boolean | AddEventListenerOptions;
}

export function createGlobalListeners(): GlobalListeners {
  const records = new Set<ListenerRecord>();

  function removeAllGlobalListeners() {
    for (const record of records) {
      record.target.removeEventListener(
        record.type,
        record.listener,
        record.options
      );
    }

    records.clear();
  }

  function addGlobalListener<K extends keyof WindowEventMap>(
    target: Window,
    type: K,
    listener: (this: Document, event: WindowEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions
  ): void;
  function addGlobalListener<K extends keyof DocumentEventMap>(
    target: EventTarget,
    type: K,
    listener: (this: Document, event: DocumentEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions
  ): void;
  function addGlobalListener(
    target: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  function addGlobalListener(
    target: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject | ((...args: never[]) => void),
    options?: boolean | AddEventListenerOptions
  ) {
    const capture = typeof options === "boolean" ? options : options?.capture;

    if (
      [...records].some(
        (record) =>
          record.target === target &&
          record.type === type &&
          record.original === listener &&
          isTruthy(
            typeof record.options === "boolean"
              ? record.options
              : record.options?.capture
          ) === isTruthy(capture)
      )
    ) {
      return;
    }

    const record: ListenerRecord = {
      listener(event) {
        if (typeof options === "object" && isTruthy(options.once)) {
          records.delete(record);
        }

        if (isCallable(listener)) {
          listener.call(target, event);
        } else if (
          listener !== null &&
          typeof listener === "object" &&
          "handleEvent" in listener &&
          typeof listener.handleEvent === "function"
        ) {
          listener.handleEvent(event);
        }
      },
      options,
      original: listener,
      target,
      type,
    };

    records.add(record);
    target.addEventListener(type, record.listener, options);
  }

  function removeGlobalListener<K extends keyof DocumentEventMap>(
    target: EventTarget,
    type: K,
    listener: (this: Document, event: DocumentEventMap[K]) => void,
    options?: boolean | EventListenerOptions
  ): void;
  function removeGlobalListener(
    target: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
  function removeGlobalListener(
    target: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject | ((...args: never[]) => void),
    options?: boolean | EventListenerOptions
  ) {
    const capture = typeof options === "boolean" ? options : options?.capture;

    for (const record of records) {
      if (
        record.target === target &&
        record.type === type &&
        record.original === listener &&
        isTruthy(
          typeof record.options === "boolean"
            ? record.options
            : record.options?.capture
        ) === isTruthy(capture)
      ) {
        target.removeEventListener(type, record.listener, options);
        records.delete(record);
      }
    }
  }

  onSettled(() => removeAllGlobalListeners);

  return { addGlobalListener, removeAllGlobalListeners, removeGlobalListener };
}
