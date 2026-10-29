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
 * Derived from Adobe React Spectrum: packages/react-aria/src/utils/runAfterTransition.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { addEvent } from "./dom-helpers";
import { getEventTarget } from "./shadowdom/dom-functions";
import { isTruthy } from "./truthy";

// We store a global list of elements that are currently transitioning,
// mapped to a set of CSS properties that are transitioning for that element.
// This is necessary rather than a simple count of transitions because of browser
// bugs, e.g. Chrome sometimes fires both transitionend and transitioncancel rather
// than one or the other. So we need to track what's actually transitioning so that
// we can ignore these duplicate events.
const transitionsByElement = new Map<EventTarget, Set<string>>();
const transitionCallbacks = new Set<QueuedCallback>();

type QueuedCallback = (isTransition: boolean) => void;

function isTransitionEvent(event: Event): event is TransitionEvent {
  return "propertyName" in event;
}

function onTransitionStart(e: Event) {
  const eventTarget = getEventTarget(e);

  if (!isTransitionEvent(e) || !eventTarget) {
    return;
  }

  // Add the transitioning property to the list for this element.
  let transitions = transitionsByElement.get(eventTarget);

  if (!transitions) {
    transitions = new Set();
    transitionsByElement.set(eventTarget, transitions);
    // The transitioncancel event must be registered on the element itself, rather than as a global
    // event. This enables us to handle when the node is deleted from the document while it is transitioning.
    // In that case, the cancel event would have nowhere to bubble to so we need to handle it directly.
    eventTarget.addEventListener("transitioncancel", onTransitionEnd);
  }

  transitions.add(e.propertyName);
}

function onTransitionEnd(e: Event) {
  const eventTarget = getEventTarget(e);

  if (!isTransitionEvent(e) || !eventTarget) {
    return;
  }

  // Remove property from list of transitioning properties.
  const properties = transitionsByElement.get(eventTarget);

  if (!properties) {
    return;
  }

  properties.delete(e.propertyName);

  // If empty, remove transitioncancel event, and remove the element from the list of transitioning elements.
  if (properties.size === 0) {
    eventTarget.removeEventListener("transitioncancel", onTransitionEnd);
    transitionsByElement.delete(eventTarget);
  }

  // If no transitioning elements, call all of the queued callbacks.
  if (transitionsByElement.size === 0) {
    for (const handle1 of transitionCallbacks) {
      handle1(true);
      transitionCallbacks.delete(handle1);
    }
  }
}

function setupGlobalEvents() {
  addEvent(document, "transitionrun", onTransitionStart);
  addEvent(document, "transitionend", onTransitionEnd);
}

/**
 * Cleans up any elements that are no longer in the document.
 * This is necessary because we can't rely on transitionend events to fire
 * for elements that are removed from the document while transitioning.
 */
function cleanupDetachedElements() {
  for (const [eventTarget] of transitionsByElement) {
    // Similar to `eventTarget instanceof Element && !eventTarget.isConnected`, but avoids
    // the explicit instanceof check, since it may be different in different contexts.
    if ("isConnected" in eventTarget && !isTruthy(eventTarget.isConnected)) {
      transitionsByElement.delete(eventTarget);
    }
  }
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    addEvent(document, "DOMContentLoaded", setupGlobalEvents);
  } else {
    setupGlobalEvents();
  }
}

/**
 * Delays a callback execution until all elements finished their transition.
 */
export function runAfterTransition(fn: QueuedCallback): () => void {
  // Wait one frame to see if an animation starts, e.g. a transition on mount.
  const frame = window.requestAnimationFrame(() => {
    cleanupDetachedElements();

    // If no transitions are running, call the function immediately.
    // Otherwise, add it to a list of callbacks to run at the end of the animation.
    if (transitionsByElement.size === 0) {
      fn(false);

      return;
    }

    transitionCallbacks.add(fn);
  });

  return () => {
    window.cancelAnimationFrame(frame);
    transitionCallbacks.delete(fn);
  };
}
