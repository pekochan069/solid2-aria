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
 * Derived from Adobe React Spectrum: packages/react-aria/src/interactions/useFocusVisible.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { PointerType } from "@solid2-aria/types-shared";
import { createEffect, createSignal, onSettled } from "solid-js";
import type { Accessor } from "solid-js";

import { getOwnerDocument, getOwnerWindow } from "../utils/dom-helpers";
import { requireElement } from "../utils/dom-value";
import { isVirtualClick } from "../utils/is-virtual-event";
import { openLink } from "../utils/open-link";
import { isMac } from "../utils/platform";
import { getPointerType as normalizePointerType } from "../utils/pointer-type";
import { requireValue } from "../utils/require-value";
import {
  getActiveElement,
  getEventTarget,
} from "../utils/shadowdom/dom-functions";
import { getTruthyValue, isTruthy } from "../utils/truthy";
import { ignoreFocusEvent } from "./utils";

export type Modality = "keyboard" | "pointer" | "virtual";

type HandlerEvent =
  | PointerEvent
  | MouseEvent
  | KeyboardEvent
  | FocusEvent
  | null;

type Handler = (modality: Modality, e: HandlerEvent) => void;

export type FocusVisibleHandler = (isFocusVisible: boolean) => void;

export interface FocusVisibleProps {
  /** Whether the element is a text input. */
  isTextInput?: boolean;
  /** Whether the element will be auto focused. */
  autoFocus?: boolean;
}

export interface FocusVisibleResult {
  /** Whether keyboard focus is visible globally. */
  isFocusVisible: boolean;
}

let currentModality: null | Modality = null;
let currentPointerType: PointerType = "keyboard";
export const changeHandlers = new Set<Handler>();

interface GlobalListenerData {
  focus: () => void;
}

export const hasSetupGlobalListeners: Map<Window, GlobalListenerData> = new Map<
  Window,
  GlobalListenerData
  // We use a map here to support setting event listeners across multiple document objects.
>();

let hasEventBeforeFocus = false;
let hasBlurredWindowRecently = false;

// Only Tab or Esc keys will make focus visible on text input elements
const FOCUS_VISIBLE_INPUT_KEYS = new Set(["Escape", "Tab"]);

function triggerChangeHandlers(modality: Modality, e: HandlerEvent) {
  for (const handler of changeHandlers) {
    handler(modality, e);
  }
}

/**
 * Helper function to determine if a KeyboardEvent is unmodified and could make keyboard focus
 * styles visible.
 */
function isValidKey(e: KeyboardEvent) {
  // Control and Shift keys trigger when navigating back to the tab with keyboard.
  return !(
    e.metaKey ||
    (!isMac() && e.altKey) ||
    e.ctrlKey ||
    e.key === "Control" ||
    e.key === "Shift" ||
    e.key === "Meta"
  );
}

function handleKeyboardEvent(e: KeyboardEvent) {
  hasEventBeforeFocus = true;

  if (!isTruthy(openLink.isOpening) && isValidKey(e)) {
    currentModality = "keyboard";
    currentPointerType = "keyboard";
    triggerChangeHandlers("keyboard", e);
  }
}

function handlePointerEvent(e: PointerEvent | MouseEvent) {
  currentModality = "pointer";
  currentPointerType =
    "pointerType" in e ? normalizePointerType(e.pointerType) : "mouse";

  if (e.type === "mousedown" || e.type === "pointerdown") {
    hasEventBeforeFocus = true;
    triggerChangeHandlers("pointer", e);
  }
}

function handleClickEvent(e: MouseEvent) {
  if (!isTruthy(openLink.isOpening) && isVirtualClick(e)) {
    hasEventBeforeFocus = true;
    currentModality = "virtual";
    currentPointerType = "virtual";
  }
}

function handleFocusEvent(e: FocusEvent) {
  if (ignoreFocusEvent) {
    return;
  }

  const target = getEventTarget(e);
  const ownerWindow = getOwnerWindow(target);
  const ownerDocument = getOwnerDocument(target);

  // When the window regains focus, the browser restores focus to the element that was focused
  // before, firing a focus event the user did not initiate. handleWindowBlur sets
  // hasBlurredWindowRecently so restored focus doesn't switch to virtual modality below, but
  // Safari fires the window/element focus pair twice when returning to a tab or app and the first
  // element focus event clears the flag, so re-arm it whenever the window itself is focused.
  // Like handleWindowBlur, this intentionally doesn't check isTrusted.
  if (target === ownerWindow) {
    hasBlurredWindowRecently = true;

    return;
  }

  // Firefox fires two extra focus events when the user first clicks into an iframe:
  // first on the window, then on the document. We ignore these events so they don't
  // cause keyboard focus rings to appear.
  if (target === ownerDocument || !e.isTrusted) {
    return;
  }

  // If a focus event occurs without a preceding keyboard or pointer event, switch to virtual modality.
  // This occurs, for example, when navigating a form with the next/previous buttons on iOS.
  if (!hasEventBeforeFocus && !hasBlurredWindowRecently) {
    currentModality = "virtual";
    currentPointerType = "virtual";
    triggerChangeHandlers("virtual", e);
  }

  hasEventBeforeFocus = false;
  hasBlurredWindowRecently = false;
}

function handleWindowBlur() {
  if (ignoreFocusEvent) {
    return;
  }

  // When the window is blurred, reset state. This is necessary when tabbing out of the window,
  // for example, since a subsequent focus event won't be fired.
  hasEventBeforeFocus = false;
  hasBlurredWindowRecently = true;
}

function handleInvalidEvent(e: Event) {
  const startingActiveElement = getActiveElement(
    getOwnerDocument(getEventTarget(e))
  );

  queueMicrotask(() => {
    // If focus was moved to a different element after the form became invalid,
    // then it was likely a forms library that moved focus to the first invalid field.
    // In this case, we want to set the modality to keyboard.
    if (
      getActiveElement(getOwnerDocument(getEventTarget(e))) !==
      startingActiveElement
    ) {
      setInteractionModality("keyboard");
    }
  });
}

/**
 * Setup global event listeners to control when keyboard focus style should be visible.
 */
function setupGlobalFocusEvents(element?: HTMLElement | null) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const windowObject = getOwnerWindow(element);
  const documentObject = getOwnerDocument(element);

  if (hasSetupGlobalListeners.get(windowObject)) {
    return;
  }

  // Programmatic focus() calls shouldn't affect the current input modality.
  // However, we need to detect other cases when a focus event occurs without
  // a preceding user event (e.g. screen reader focus). Overriding the focus
  // method on HTMLElement.prototype is a bit hacky, but works.
  // defineProperty (not assignment) so this works even if `focus` is currently
  // a getter-only accessor — e.g. when @testing-library/user-event's setup()
  // has instrumented it. Plain assignment throws in that case.
  // oxlint-disable-next-line typescript/unbound-method -- Preserve the original method identity and invoke it with an explicit receiver.
  const { focus } = windowObject.HTMLElement.prototype;
  Reflect.defineProperty(windowObject.HTMLElement.prototype, "focus", {
    configurable: true,
    value(this: HTMLElement, options?: FocusOptions) {
      hasEventBeforeFocus = true;
      focus.call(this, options);
    },
    writable: true,
  });
  documentObject.addEventListener("keydown", handleKeyboardEvent, true);
  documentObject.addEventListener("keyup", handleKeyboardEvent, true);
  documentObject.addEventListener("click", handleClickEvent, true);
  documentObject.addEventListener("invalid", handleInvalidEvent, true);
  // Register focus events on the window so they are sure to happen
  // before React's event listeners (registered on the document).
  windowObject.addEventListener("focus", handleFocusEvent, true);
  windowObject.addEventListener("blur", handleWindowBlur, false);

  if (typeof PointerEvent !== "undefined") {
    documentObject.addEventListener("pointerdown", handlePointerEvent, true);
    documentObject.addEventListener("pointermove", handlePointerEvent, true);
    documentObject.addEventListener("pointerup", handlePointerEvent, true);
  } else if (process.env.NODE_ENV === "test") {
    documentObject.addEventListener("mousedown", handlePointerEvent, true);
    documentObject.addEventListener("mousemove", handlePointerEvent, true);
    documentObject.addEventListener("mouseup", handlePointerEvent, true);
  }

  // Add unmount handler
  windowObject.addEventListener(
    "beforeunload",
    () => {
      tearDownWindowFocusTracking(element);
    },
    { once: true }
  );
  hasSetupGlobalListeners.set(windowObject, { focus });
}

function tearDownWindowFocusTracking(
  element: HTMLElement | null | undefined,
  loadListener?: () => void
) {
  const windowObject = getOwnerWindow(element);
  const documentObject = getOwnerDocument(element);

  if (loadListener) {
    documentObject.removeEventListener("DOMContentLoaded", loadListener);
  }

  if (!hasSetupGlobalListeners.has(windowObject)) {
    return;
  }

  Reflect.defineProperty(windowObject.HTMLElement.prototype, "focus", {
    configurable: true,
    value: requireValue(
      hasSetupGlobalListeners.get(windowObject),
      "Expected hasSetupGlobalListeners.get(windowObject)"
    ).focus,
    writable: true,
  });
  documentObject.removeEventListener("keydown", handleKeyboardEvent, true);
  documentObject.removeEventListener("keyup", handleKeyboardEvent, true);
  documentObject.removeEventListener("click", handleClickEvent, true);
  documentObject.removeEventListener("invalid", handleInvalidEvent, true);
  windowObject.removeEventListener("focus", handleFocusEvent, true);
  windowObject.removeEventListener("blur", handleWindowBlur, false);

  if (typeof PointerEvent !== "undefined") {
    documentObject.removeEventListener("pointerdown", handlePointerEvent, true);
    documentObject.removeEventListener("pointermove", handlePointerEvent, true);
    documentObject.removeEventListener("pointerup", handlePointerEvent, true);
  } else if (process.env.NODE_ENV === "test") {
    documentObject.removeEventListener("mousedown", handlePointerEvent, true);
    documentObject.removeEventListener("mousemove", handlePointerEvent, true);
    documentObject.removeEventListener("mouseup", handlePointerEvent, true);
  }

  hasSetupGlobalListeners.delete(windowObject);
}

/**
 * EXPERIMENTAL
 * Adds a window (i.e. iframe) to the list of windows that are being tracked for focus visible.
 *
 * Sometimes apps render portions of their tree into an iframe. In this case, we cannot accurately
 * track if the focus is visible because we cannot see interactions inside the iframe. If you have
 * this in your application's architecture, then this function will attach event listeners inside
 * the iframe. You should call `addWindowFocusTracking` with an element from inside the window you
 * wish to add. We'll retrieve the relevant elements based on that. Note, you do not need to call
 * this for the default window, as we call it for you.
 *
 * When you are ready to stop listening, but you do not wish to unmount the iframe, you may call the
 * cleanup function returned by `addWindowFocusTracking`. Otherwise, when you unmount the iframe,
 * all listeners and state will be cleaned up automatically for you.
 *
 * @param element @default document.body - The element provided will be used to get the window to
 *   add.
 * @returns A function to remove the event listeners and cleanup the state.
 */
export function addWindowFocusTracking(
  element?: HTMLElement | null
): () => void {
  const documentObject = getOwnerDocument(element);
  let loadListener: (() => void) | undefined;

  if (documentObject.readyState === "loading") {
    loadListener = () => {
      setupGlobalFocusEvents(element);
    };

    documentObject.addEventListener("DOMContentLoaded", loadListener);
  } else {
    setupGlobalFocusEvents(element);
  }

  return () => {
    tearDownWindowFocusTracking(element, loadListener);
  };
}

// Server-side rendering does not have the document object defined

if (typeof document !== "undefined") {
  addWindowFocusTracking();
}

/**
 * If true, keyboard focus is visible.
 */
export function isFocusVisible(): boolean {
  return currentModality !== "pointer";
}

export function getInteractionModality(): Modality | null {
  return currentModality;
}

export function setInteractionModality(modality: Modality): void {
  currentModality = modality;
  currentPointerType = modality === "pointer" ? "mouse" : modality;
  triggerChangeHandlers(modality, null);
}

/** @private */
export function getPointerType(): PointerType {
  return currentPointerType;
}

/**
 * Keeps state of the current modality.
 */
export function createInteractionModality(): Accessor<Modality | null> {
  setupGlobalFocusEvents();

  const [modality, setModality] = createSignal<Modality | null>(null, {
    ownedWrite: true,
  });

  const handler = () => {
    setModality(currentModality);
  };

  onSettled(() => {
    setModality(currentModality);
    changeHandlers.add(handler);

    return () => {
      changeHandlers.delete(handler);
    };
  });

  return modality;
}

const nonTextInputTypes = new Set([
  "checkbox",
  "radio",
  "range",
  "color",
  "file",
  "image",
  "button",
  "submit",
  "reset",
]);

/**
 * If this is attached to text input component, return if the event is a focus event (Tab/Escape
 * keys pressed) so that focus visible style can be properly set.
 */
function isKeyboardFocusEvent(
  isTextInput: boolean,
  modality: Modality,
  e: HandlerEvent
) {
  let currentIsTextInput = isTextInput;

  const eventTarget = e ? requireElement(getEventTarget(e)) : undefined;
  const ownerDocument = getOwnerDocument(eventTarget);
  const ownerWindow = getOwnerWindow(eventTarget);

  const IHTMLInputElement =
    ownerWindow === undefined ? HTMLInputElement : ownerWindow.HTMLInputElement;

  const IHTMLTextAreaElement =
    ownerWindow === undefined
      ? HTMLTextAreaElement
      : ownerWindow.HTMLTextAreaElement;

  const IHTMLElement =
    ownerWindow === undefined ? HTMLElement : ownerWindow.HTMLElement;

  const IKeyboardEvent =
    ownerWindow === undefined ? KeyboardEvent : ownerWindow.KeyboardEvent;

  // For keyboard events that occur on a non-input element that will move focus into input element (aka ArrowLeft going from Datepicker button to the main input group)
  // we need to rely on the user passing isTextInput into here. This way we can skip toggling focus visiblity for said input element
  const activeElement = getActiveElement(ownerDocument);
  currentIsTextInput ||=
    (activeElement instanceof IHTMLInputElement &&
      !nonTextInputTypes.has(activeElement.type)) ||
    activeElement instanceof IHTMLTextAreaElement ||
    (activeElement instanceof IHTMLElement && activeElement.isContentEditable);

  return !(
    currentIsTextInput &&
    modality === "keyboard" &&
    e instanceof IKeyboardEvent &&
    !FOCUS_VISIBLE_INPUT_KEYS.has(e.key)
  );
}

/**
 * Manages focus visible state for the page, and subscribes individual components for updates.
 */
export function createFocusVisible(
  props: FocusVisibleProps = {}
): FocusVisibleResult {
  const _result0 = props;

  const [isFocusVisibleState, setFocusVisible] = createSignal(
    getTruthyValue(_result0.autoFocus) ?? isFocusVisible(),
    { ownedWrite: true }
  );

  createFocusVisibleListener(
    (isFocusVisibleValue) => {
      setFocusVisible(isFocusVisibleValue);
    },
    {
      get isTextInput() {
        return _result0.isTextInput;
      },
    }
  );

  return {
    get isFocusVisible() {
      return isFocusVisibleState();
    },
  };
}

/**
 * Listens for trigger change and reports if focus is visible (i.e., modality is not pointer).
 */

export function createFocusVisibleListener(
  fn: FocusVisibleHandler,
  opts?: {
    enabled?: boolean;
    isTextInput?: boolean;
  }
): void {
  setupGlobalFocusEvents();

  const handler = (modality: Modality, e: HandlerEvent) => {
    // We want to early return for any keyboard events that occur inside text inputs EXCEPT for Tab and Escape
    if (!isKeyboardFocusEvent(isTruthy(opts?.isTextInput), modality, e)) {
      return;
    }

    fn(isFocusVisible());
  };

  createEffect(
    () => opts?.enabled,
    (enabled): undefined | (() => void) => {
      if (enabled === false) {
        return undefined;
      }

      changeHandlers.add(handler);

      return () => {
        changeHandlers.delete(handler);
      };
    },
    { ssrSource: "client" }
  );
}
