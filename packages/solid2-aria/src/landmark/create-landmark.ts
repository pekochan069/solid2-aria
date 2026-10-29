/*
 * Copyright 2022 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria/src/landmark/useLandmark.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  AriaLabelingProps,
  FocusableElement,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import {
  untrack,
  onSettled,
  createMemo,
  createEffect,
  createSignal,
} from "solid-js";
import type { Accessor } from "solid-js";

import { ariaValue } from "../utils/aria-value";
import { hasAnyBit } from "../utils/bit-mask";
import {
  focusableElementOrNull,
  requireFocusableElement,
} from "../utils/dom-value";
import { requireValue } from "../utils/require-value";
import { getEventTarget, nodeContains } from "../utils/shadowdom/dom-functions";
import { getTruthyValue, isTruthy } from "../utils/truthy";

export type AriaLandmarkRole =
  | "main"
  | "region"
  | "search"
  | "navigation"
  | "form"
  | "banner"
  | "contentinfo"
  | "complementary";

export interface AriaLandmarkProps extends AriaLabelingProps {
  role: AriaLandmarkRole;
  focus?: (direction: "forward" | "backward") => void;
}

export interface LandmarkAria {
  landmarkProps: DOMAttributes;
}

// Increment this version number whenever the
// LandmarkManagerApi or Landmark interfaces change.
const LANDMARK_API_VERSION = 1;

// Minimal API for LandmarkManager that must continue to work between versions.
// Changes to this interface are considered breaking. New methods/properties are
// safe to add, but changes or removals are not allowed (same as public APIs).
interface LandmarkManagerApi {
  version: number;
  createLandmarkController: () => LandmarkController;
  registerLandmark: (landmark: Landmark) => () => void;
}

// Changes to this interface are considered breaking.
// New properties MUST be optional so that registering a landmark
// from an older version of useLandmark against a newer version of
// LandmarkManager does not crash.
interface Landmark {
  ref: Accessor<FocusableElement | null>;
  role: AriaLandmarkRole;
  label?: string;
  lastFocused?: FocusableElement;
  focus: (direction: "forward" | "backward") => void;
  blur: () => void;
}

export interface LandmarkControllerOptions {
  /**
   * The element from which to start navigating.
   *
   * @default document.activeElement
   */
  from?: FocusableElement;
}

/** A LandmarkController allows programmatic navigation of landmarks. */
export interface LandmarkController {
  /** Moves focus to the next landmark. */
  focusNext: (opts?: LandmarkControllerOptions) => boolean;
  /** Moves focus to the previous landmark. */
  focusPrevious: (opts?: LandmarkControllerOptions) => boolean;
  /** Moves focus to the main landmark. */
  focusMain: () => boolean;
  /** Moves focus either forward or backward in the landmark sequence. */
  navigate: (
    direction: "forward" | "backward",
    opts?: LandmarkControllerOptions
  ) => boolean;
  /**
   * Disposes the landmark controller. When no landmarks are registered, and no
   * controllers are active, the landmark keyboard listeners are removed from the page.
   */
  dispose: () => void;
}

// Symbol under which the singleton landmark manager instance is attached to the document.
const landmarkSymbol = Symbol.for("react-aria-landmark-manager");

declare global {
  interface Document {
    [landmarkSymbol]?: LandmarkManagerApi;
  }
}

function subscribe(fn: () => void) {
  document.addEventListener("react-aria-landmark-manager-change", fn);

  return () => {
    document.removeEventListener("react-aria-landmark-manager-change", fn);
  };
}

function getLandmarkManager(): LandmarkManagerApi | null {
  if (typeof document === "undefined") {
    return null;
  }

  // Reuse an existing instance if it has the same or greater version.
  const instance = document[landmarkSymbol];

  if (instance && instance.version >= LANDMARK_API_VERSION) {
    return instance;
  }

  // Otherwise, create a new instance and dispatch an event so anything using the existing
  // instance updates and re-registers their landmarks with the new one.
  document[landmarkSymbol] = new LandmarkManager();
  document.dispatchEvent(new CustomEvent("react-aria-landmark-manager-change"));

  return document[landmarkSymbol];
}

// Tracks the current landmark manager and releases its subscription with the owner.
function createLandmarkManager() {
  const [manager, setManager] = createSignal(untrack(getLandmarkManager));

  const update = () => {
    setManager(getLandmarkManager());
  };

  onSettled(() => {
    const unsubscribe = subscribe(update);
    update();

    return unsubscribe;
  });

  return manager;
}

class LandmarkManager implements LandmarkManagerApi {
  private landmarks: Landmark[] = [];
  private isListening = false;
  private refCount = 0;
  public version = LANDMARK_API_VERSION;

  private setupIfNeeded() {
    if (this.isListening) {
      return;
    }

    document.addEventListener("keydown", this.f6Handler, { capture: true });
    document.addEventListener("focusin", this.focusinHandler, {
      capture: true,
    });
    document.addEventListener("focusout", this.focusoutHandler, {
      capture: true,
    });
    this.isListening = true;
  }
  private teardownIfNeeded() {
    if (!this.isListening || this.landmarks.length > 0 || this.refCount > 0) {
      return;
    }

    document.removeEventListener("keydown", this.f6Handler, { capture: true });
    document.removeEventListener("focusin", this.focusinHandler, {
      capture: true,
    });
    document.removeEventListener("focusout", this.focusoutHandler, {
      capture: true,
    });
    this.isListening = false;
  }
  private focusLandmark(
    landmark: FocusableElement,
    direction: "forward" | "backward"
  ) {
    this.landmarks.find((l) => l.ref() === landmark)?.focus?.(direction);
  }
  /**
   * Return set of landmarks with a specific role.
   */
  private getLandmarksByRole(role: AriaLandmarkRole) {
    return new Set(this.landmarks.filter((l) => l.role === role));
  }
  /**
   * Return first landmark with a specific role.
   */
  private getLandmarkByRole(role: AriaLandmarkRole) {
    return this.landmarks.find((l) => l.role === role);
  }
  private addLandmark(newLandmark: Landmark) {
    const newLandmarkrefElement = newLandmark.ref();
    this.setupIfNeeded();

    if (
      this.landmarks.some((landmark) => landmark.ref === newLandmark.ref) ||
      !newLandmarkrefElement
    ) {
      return;
    }

    if (
      this.landmarks.filter((landmark) => landmark.role === "main").length >
        1 &&
      process.env.NODE_ENV !== "production"
    ) {
      console.error(
        'Page can contain no more than one landmark with the role "main".'
      );
    }

    if (this.landmarks.length === 0) {
      this.landmarks = [newLandmark];
      this.checkLabels(newLandmark.role);

      return;
    }

    // Binary search to insert new landmark based on position in document relative to existing landmarks.
    // https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition
    let start = 0;
    let end = this.landmarks.length - 1;

    while (start <= end) {
      const mid = Math.floor((start + end) / 2);
      const existing = this.landmarks[mid]?.ref();

      if (!existing) {
        break;
      }

      const comparedPosition =
        newLandmarkrefElement.compareDocumentPosition(existing);

      const isNewAfterExisting =
        hasAnyBit(comparedPosition, Node.DOCUMENT_POSITION_PRECEDING) ||
        hasAnyBit(comparedPosition, Node.DOCUMENT_POSITION_CONTAINS);

      if (isNewAfterExisting) {
        start = mid + 1;
      } else {
        end = mid - 1;
      }
    }

    this.landmarks.splice(start, 0, newLandmark);
    this.checkLabels(newLandmark.role);
  }
  private updateLandmark(landmark: Pick<Landmark, "ref"> & Partial<Landmark>) {
    const index = this.landmarks.findIndex((l) => l.ref === landmark.ref);
    const existing = this.landmarks[index];

    if (existing) {
      const updated = { ...existing, ...landmark };
      this.landmarks[index] = updated;
      this.checkLabels(updated.role);
    }
  }
  private removeLandmark(ref: Accessor<Element | null>) {
    this.landmarks = this.landmarks.filter((landmark) => landmark.ref !== ref);
    this.teardownIfNeeded();
  }
  /**
   * Warn if there are 2+ landmarks with the same role but no label.
   * Labels for landmarks with the same role must also be unique.
   *
   * See https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/.
   */
  private checkLabels(role: AriaLandmarkRole) {
    const landmarksWithRole = this.getLandmarksByRole(role);

    if (landmarksWithRole.size > 1) {
      const duplicatesWithoutLabel = [...landmarksWithRole].filter(
        (landmark) => !isTruthy(landmark.label)
      );

      if (
        duplicatesWithoutLabel.length > 0 &&
        process.env.NODE_ENV !== "production"
      ) {
        console.warn(
          `Page contains more than one landmark with the '${role}' role. If two or more landmarks on a page share the same role, all must be labeled with an aria-label or aria-labelledby attribute:`,
          duplicatesWithoutLabel.map((landmark) => landmark.ref())
        );
      } else if (process.env.NODE_ENV !== "production") {
        const labels = [...landmarksWithRole].map((landmark) => landmark.label);

        const duplicateLabels = labels.filter(
          (item, index) => labels.indexOf(item) !== index
        );

        for (const label of duplicateLabels) {
          console.warn(
            `Page contains more than one landmark with the '${role}' role and '${label}' label. If two or more landmarks on a page share the same role, they must have unique labels:`,
            [...landmarksWithRole].flatMap((landmark) =>
              landmark.label === label ? [landmark.ref()] : []
            )
          );
        }
      }
    }
  }
  /**
   * Get the landmark that is the closest parent in the DOM.
   * Returns undefined if no parent is a landmark.
   */
  private closestLandmark(element: FocusableElement) {
    const landmarkMap = new Map(this.landmarks.map((l) => [l.ref(), l]));
    let currentElement = element;

    while (
      isTruthy(currentElement) &&
      !landmarkMap.has(currentElement) &&
      currentElement !== document.body &&
      currentElement.parentElement
    ) {
      currentElement = currentElement.parentElement;
    }

    return landmarkMap.get(currentElement);
  }
  /**
   * Gets the next landmark, in DOM focus order, or previous if backwards is specified.
   * If last landmark, next should be the first landmark.
   * If not inside a landmark, will return first landmark.
   * Returns undefined if there are no landmarks.
   */
  private getNextLandmark(
    element: FocusableElement,
    {
      backward,
    }: {
      backward?: boolean;
    }
  ): undefined | Landmark {
    const currentLandmark = this.closestLandmark(element);
    let nextLandmarkIndex = isTruthy(backward) ? this.landmarks.length - 1 : 0;

    if (currentLandmark) {
      nextLandmarkIndex =
        this.landmarks.indexOf(currentLandmark) + (isTruthy(backward) ? -1 : 1);
    }

    const wrapIfNeeded = () => {
      // When we reach the end of the landmark sequence, fire a custom event that can be listened for by applications.
      // If this event is canceled, we return immediately. This can be used to implement landmark navigation across iframes.
      if (nextLandmarkIndex < 0) {
        if (
          !element.dispatchEvent(
            new CustomEvent("react-aria-landmark-navigation", {
              bubbles: true,
              cancelable: true,
              detail: { direction: "backward" },
            })
          )
        ) {
          return true;
        }

        nextLandmarkIndex = this.landmarks.length - 1;
      } else if (nextLandmarkIndex >= this.landmarks.length) {
        if (
          !element.dispatchEvent(
            new CustomEvent("react-aria-landmark-navigation", {
              bubbles: true,
              cancelable: true,
              detail: { direction: "forward" },
            })
          )
        ) {
          return true;
        }

        nextLandmarkIndex = 0;
      }

      if (nextLandmarkIndex < 0 || nextLandmarkIndex >= this.landmarks.length) {
        return true;
      }

      return false;
    };

    if (wrapIfNeeded()) {
      return undefined;
    }

    // Skip over hidden landmarks.
    const i = nextLandmarkIndex;

    while (
      this.landmarks[nextLandmarkIndex]?.ref()?.closest("[aria-hidden=true]")
    ) {
      nextLandmarkIndex += isTruthy(backward) ? -1 : 1;

      if (wrapIfNeeded()) {
        return undefined;
      }

      if (nextLandmarkIndex === i) {
        break;
      }
    }

    return this.landmarks[nextLandmarkIndex];
  }
  /**
   * Look at next landmark. If an element was previously focused inside, restore focus there.
   * If not, focus the landmark itself.
   * If no landmarks at all, or none with focusable elements, don't move focus.
   */
  private readonly f6Handler = (e: KeyboardEvent) => {
    if (e.key === "F6") {
      // If alt key pressed, focus main landmark, otherwise navigate forward or backward based on shift key.
      const handled = e.altKey
        ? this.focusMain()
        : this.navigate(requireFocusableElement(getEventTarget(e)), e.shiftKey);

      if (handled) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  };
  private focusMain() {
    const main = this.getLandmarkByRole("main");

    const mainElement = main?.ref();

    if (mainElement?.isConnected === true) {
      this.focusLandmark(mainElement, "forward");

      return true;
    }

    return false;
  }
  private navigate(from: FocusableElement, backward: boolean) {
    const nextLandmark = this.getNextLandmark(from, {
      backward,
    });

    if (!nextLandmark) {
      return false;
    }

    // If something was previously focused in the next landmark, then return focus to it
    if (nextLandmark.lastFocused) {
      const { lastFocused } = nextLandmark;

      if (nodeContains(document.body, lastFocused)) {
        lastFocused.focus();

        return true;
      }
    }

    // Otherwise, focus the landmark itself
    const nextElement = nextLandmark.ref();

    if (nextElement?.isConnected === true) {
      this.focusLandmark(nextElement, backward ? "backward" : "forward");

      return true;
    }

    return false;
  }
  /**
   * Sets lastFocused for a landmark, if focus is moved within that landmark.
   * Lets the last focused landmark know it was blurred if something else is focused.
   */
  private readonly focusinHandler = (e: FocusEvent) => {
    const currentLandmark = this.closestLandmark(
      requireFocusableElement(getEventTarget(e))
    );

    if (currentLandmark && currentLandmark.ref() !== getEventTarget(e)) {
      this.updateLandmark({
        lastFocused: requireFocusableElement(getEventTarget(e)),
        ref: currentLandmark.ref,
      });
    }

    const previousFocusedElement = focusableElementOrNull(e.relatedTarget);

    if (isTruthy(previousFocusedElement)) {
      const closestPreviousLandmark = this.closestLandmark(
        previousFocusedElement
      );

      if (
        closestPreviousLandmark &&
        closestPreviousLandmark.ref() === previousFocusedElement
      ) {
        closestPreviousLandmark.blur();
      }
    }
  };
  /**
   * Track if the focus is lost to the body. If it is, do cleanup on the landmark that last had
   * focus.
   */
  private readonly focusoutHandler = (e: FocusEvent) => {
    const previousFocusedElement = requireFocusableElement(getEventTarget(e));
    const nextFocusedElement = e.relatedTarget;

    // the === document seems to be a jest thing for focus to go there on generic blur event such as landmark.blur();
    // browsers appear to send focus instead to document.body and the relatedTarget is null when that happens
    if (!nextFocusedElement || nextFocusedElement === document) {
      const closestPreviousLandmark = this.closestLandmark(
        previousFocusedElement
      );

      if (
        closestPreviousLandmark &&
        closestPreviousLandmark.ref() === previousFocusedElement
      ) {
        closestPreviousLandmark.blur();
      }
    }
  };
  public createLandmarkController(): LandmarkController {
    // oxlint-disable-next-line typescript/no-this-alias, unicorn/no-this-assignment -- Controllers retain the manager until disposal and then release that reference.
    let instance: LandmarkManager | null = this;
    instance.refCount += 1;
    instance.setupIfNeeded();

    return {
      dispose() {
        if (instance) {
          instance.refCount -= 1;
          instance.teardownIfNeeded();
          instance = null;
        }
      },
      focusMain() {
        return requireValue(instance, "Expected instance").focusMain();
      },
      focusNext(opts) {
        const element =
          getTruthyValue(opts?.from) ??
          focusableElementOrNull(document.activeElement);

        return element === null
          ? false
          : requireValue(instance, "Expected instance").navigate(
              element,
              false
            );
      },
      focusPrevious(opts) {
        const element =
          getTruthyValue(opts?.from) ??
          focusableElementOrNull(document.activeElement);

        return element === null
          ? false
          : requireValue(instance, "Expected instance").navigate(element, true);
      },
      navigate(direction, opts) {
        const element =
          getTruthyValue(opts?.from) ??
          focusableElementOrNull(document.activeElement);

        return element === null
          ? false
          : requireValue(instance, "Expected instance").navigate(
              element,
              direction === "backward"
            );
      },
    };
  }
  public registerLandmark(landmark: Landmark): () => void {
    if (this.landmarks.some((l) => l.ref === landmark.ref)) {
      this.updateLandmark(landmark);
    } else {
      this.addLandmark(landmark);
    }

    return () => {
      this.removeLandmark(landmark.ref);
    };
  }
}

/** Creates a LandmarkController, which allows programmatic navigation of landmarks. */
export function UNSTABLE_createLandmarkController(): LandmarkController {
  // Get the current landmark manager and create a controller using it.
  let instance: LandmarkManagerApi | null = getLandmarkManager();
  let controller = instance?.createLandmarkController();

  const unsubscribe = subscribe(() => {
    // If the landmark manager changes, dispose the old
    // controller and create a new one.
    controller?.dispose();
    instance = getLandmarkManager();
    controller = instance?.createLandmarkController();
  });

  // Return a wrapper that proxies requests to the current controller instance.
  return {
    dispose() {
      controller?.dispose();
      unsubscribe();
      controller = undefined;
      instance = null;
    },
    focusMain() {
      return requireValue(controller, "Expected controller").focusMain();
    },
    focusNext(opts) {
      return requireValue(controller, "Expected controller").focusNext(opts);
    },
    focusPrevious(opts) {
      return requireValue(controller, "Expected controller").focusPrevious(
        opts
      );
    },
    navigate(direction, opts) {
      return requireValue(controller, "Expected controller").navigate(
        direction,
        opts
      );
    },
  };
}

/**
 * Provides landmark navigation in an application. Call this with a role and label to register a
 * landmark navigable with F6.
 *
 * @param props - Props for the landmark.
 * @param ref - Ref to the landmark.
 */
export function createLandmark(
  props: AriaLandmarkProps,
  ref: Accessor<FocusableElement | null>
): LandmarkAria {
  const _result0 = props;
  const manager = createLandmarkManager();

  const label = createMemo(
    () => getTruthyValue(_result0["aria-label"]) ?? _result0["aria-labelledby"]
  );

  const [isLandmarkFocused, setIsLandmarkFocused] = createSignal(false, {
    ownedWrite: true,
  });

  const defaultFocus = () => {
    setIsLandmarkFocused(true);
  };

  const blur = () => {
    setIsLandmarkFocused(false);
  };

  createEffect(
    () => ({
      input2: ref(),
      input5: defaultFocus,
      input6: blur,
      manager: manager(),
      observedFocus: _result0.focus,
      observedLabel: label(),
      observedRole: _result0.role,
    }),
    ({
      input2: element,
      observedRole,
      observedLabel,
      input5,
      observedFocus,
      input6,
      manager: currentManager,
    }): undefined | (() => void) => {
      const instance = currentManager;

      if (instance) {
        return instance.registerLandmark({
          blur: input6,
          focus: getTruthyValue(observedFocus) ?? input5,
          label: observedLabel,
          ref: () => element,
          role: observedRole,
        });
      }

      return undefined;
    },
    { ssrSource: "client" }
  );
  createEffect(
    () => ({ element: ref(), isLandmarkFocused: isLandmarkFocused() }),
    ({ element, isLandmarkFocused: currentIsLandmarkFocused }) => {
      if (currentIsLandmarkFocused) {
        element?.focus();
      }
    },
    { ssrSource: "client" }
  );

  return {
    get landmarkProps() {
      return {
        get "aria-label"() {
          return ariaValue(ariaValue(_result0["aria-label"]));
        },
        get "aria-labelledby"() {
          return ariaValue(ariaValue(_result0["aria-labelledby"]));
        },
        get role() {
          return _result0.role;
        },
        get tabindex() {
          return isLandmarkFocused() ? -1 : undefined;
        },
      };
    },
  };
}
