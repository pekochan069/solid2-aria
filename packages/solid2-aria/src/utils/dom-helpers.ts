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
 * Derived from Adobe React Spectrum: packages/react-aria/src/utils/domHelpers.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { EventMapType } from "@solid2-aria/types-shared";

import { isPresent } from "./is-present";
import { noop } from "./noop";
import { isDocument, isNode, isWindow } from "./type-helpers";

export { isDocument, isShadowRoot } from "./type-helpers";

export const getOwnerDocument = (target?: EventTarget | null): Document => {
  if (isWindow(target)) {
    return target.document;
  }

  if (isDocument(target)) {
    return target;
  }

  // @ts-expect-error Ensure safe access in SSR environments.
  return (
    (isNode(target) ? target.ownerDocument : undefined) ??
    (typeof document === "undefined" ? undefined : document)
  );
};

export const getOwnerWindow = (
  target?: EventTarget | null
): Window & typeof globalThis => {
  const ownerDocument = getOwnerDocument(target);

  // @ts-expect-error Ensure safe access in SSR environments.
  return (
    ownerDocument?.defaultView ??
    (typeof window === "undefined" ? undefined : window)
  );
};

/**
 * Attaches an event listener on target(s) and returns a cleanup function.
 */
export function addEvent<
  T extends EventTarget,
  K extends keyof EventMapType<Exclude<T, null>>,
>(
  target: T | EventTarget[] | null,
  event: Extract<K, string> | (string & Record<never, never>),
  listener?: (
    this: T,
    ev: EventMapType<Exclude<T, null>>[K] & { readonly currentTarget: T }
  ) => void,
  options?: boolean | AddEventListenerOptions
): () => void {
  if (!isPresent(listener) || target === null || target === undefined) {
    return noop;
  }

  // SAFETY: The event-map overload relates the event name and callback before the native listener API erases them.
  // oxlint-disable-next-line anti-slop/no-chained-type-assertions, typescript/no-unsafe-type-assertion -- Native listeners receive the declared event type with the bound target as currentTarget.
  const nativeListener = listener as unknown as EventListener;
  const eventTargets = Array.isArray(target) ? target : [target];

  for (const eventTarget of eventTargets) {
    eventTarget.addEventListener(event, nativeListener, options);
  }

  return () => {
    for (const eventTarget of eventTargets) {
      eventTarget.removeEventListener(event, nativeListener, options);
    }
  };
}

/**
 * Sets a CSS property on an element and returns a cleanup function.
 */
export function setStyle(
  target: HTMLElement | HTMLElement[] | null,
  property: string,
  value: string,
  priority?: string
): () => void {
  if (!isPresent(target)) {
    return noop;
  }

  const restore = new Array<() => void>();
  const styleTargets = Array.isArray(target) ? target : [target];

  for (const styleTarget of styleTargets) {
    const initialValue = styleTarget.style.getPropertyValue(property);
    const initialPriority = styleTarget.style.getPropertyPriority(property);
    styleTarget.style.setProperty(property, value, priority);
    restore.unshift(() => {
      if (initialValue) {
        styleTarget.style.setProperty(property, initialValue, initialPriority);
      } else {
        styleTarget.style.removeProperty(property);
      }
    });
  }

  return () => {
    for (const cleanup of restore) {
      cleanup();
    }
  };
}
