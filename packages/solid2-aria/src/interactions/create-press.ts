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
 * Derived from Adobe React Spectrum: packages/react-aria/src/interactions/usePress.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2; register the initial press responder in an explicit untracked lifecycle scope.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  FocusableElement,
  PressEvent as IPressEvent,
  PointerType,
  PressEvents,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import {
  omit,
  untrack,
  useContext,
  createEffect,
  createSignal,
  flush,
} from "solid-js";
import type { Accessor } from "solid-js";

import type {
  MouseEvent as TargetedMouseEvent,
  TouchEvent as TargetedTouchEvent,
} from "../types";
import { chain } from "../utils/chain";
import { createGlobalListeners } from "../utils/create-global-listeners";
import { getOwnerDocument, getOwnerWindow } from "../utils/dom-helpers";
import {
  requireElement,
  requireFocusableElement,
  requireHTMLElement,
} from "../utils/dom-value";
import { focusWithoutScrolling } from "../utils/focus-without-scrolling";
import { getNonce } from "../utils/get-nonce";
import { isPresent } from "../utils/is-present";
import {
  isVirtualClick,
  isVirtualPointerEvent,
} from "../utils/is-virtual-event";
import { mergeProps } from "../utils/merge-props";
import { openLink } from "../utils/open-link";
import { isMac } from "../utils/platform";
import { requireValue } from "../utils/require-value";
import { getEventTarget, nodeContains } from "../utils/shadowdom/dom-functions";
import { getTruthyValue, isTruthy } from "../utils/truthy";
import { PressResponderContext } from "./context";
import { disableTextSelection, restoreTextSelection } from "./text-selection";
import { preventFocus, setEventTarget } from "./utils";

export interface PressProps extends PressEvents {
  /** Whether the target is in a controlled press state (e.g. an overlay it triggers is open). */
  isPressed?: boolean;
  /** Whether the press events should be disabled. */
  isDisabled?: boolean;
  /** Whether the target should not receive focus on press. */
  preventFocusOnPress?: boolean;
  /**
   * Whether press events should be canceled when the pointer leaves the target while pressed.
   * By default, this is `false`, which means if the pointer returns back over the target while
   * still pressed, onPressStart will be fired again. If set to `true`, the press is canceled
   * when the pointer leaves the target and onPressStart will not be fired if the pointer returns.
   */
  shouldCancelOnPointerExit?: boolean;
  /** Whether text selection should be enabled on the pressable element. */
  allowTextSelectionOnPress?: boolean;
}

export interface PressHookProps extends PressProps {
  /** A ref to the target element. */
  ref?: Accessor<Element | null>;
}

interface PressState {
  isPressed: boolean;
  ignoreEmulatedMouseEvents: boolean;
  didFirePressStart: boolean;
  isTriggeringEvent: boolean;
  activePointerId: number | null;
  target: FocusableElement | null;
  isOverTarget: boolean;
  pointerType: PointerType | null;
  userSelect?: string;
  metaKeyEvents?: Map<string, globalThis.KeyboardEvent>;
  disposables: (() => void)[];
}

interface EventBase {
  currentTarget: EventTarget | null;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  clientX?: number;
  clientY?: number;
  targetTouches?: {
    clientX?: number;
    clientY?: number;
  }[];
  key?: string;
}

export interface PressResult {
  /** Whether the target is currently pressed. */
  isPressed: boolean;
  /** Props to spread on the target element. */
  pressProps: DOMAttributes;
}

function createPressResponderContext(props: PressHookProps): PressHookProps {
  const context = useContext(PressResponderContext);
  const currentProps = mergeProps(omit(context, "register", "ref"), props);
  untrack(() => {
    context.register();
  });

  createEffect(
    () => ({ element: currentProps.ref?.(), setRef: context.ref }),
    ({ element, setRef }) => {
      if (element instanceof HTMLElement || element instanceof SVGElement) {
        setRef?.(element);
      }
    },
    { ssrSource: "client" }
  );

  return currentProps;
}

class PressEvent implements IPressEvent {
  type: IPressEvent["type"];
  pointerType: PointerType;
  target: Element;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  x: number;
  y: number;
  key: string | undefined;
  #shouldStopPropagation = true;
  constructor(
    type: IPressEvent["type"],
    pointerType: PointerType,
    originalEvent: EventBase,
    state?: PressState
  ) {
    const currentTarget = state?.target ?? originalEvent.currentTarget;

    const rect: DOMRect | undefined =
      requireElement(currentTarget)?.getBoundingClientRect();

    let x = 0;
    let y = 0;

    let clientX;
    let clientY: number | null = null;

    if (
      isPresent(originalEvent.clientX) &&
      originalEvent.clientY !== null &&
      originalEvent.clientY !== undefined
    ) {
      ({ clientX } = originalEvent);
      ({ clientY } = originalEvent);
    }

    if (isTruthy(rect)) {
      if (isPresent(clientX) && clientY !== null && clientY !== undefined) {
        x = clientX - rect.left;
        y = clientY - rect.top;
      } else {
        x = rect.width / 2;
        y = rect.height / 2;
      }
    }

    this.type = type;
    this.pointerType = pointerType;
    this.target = requireElement(originalEvent.currentTarget);
    this.shiftKey = originalEvent.shiftKey;
    this.metaKey = originalEvent.metaKey;
    this.ctrlKey = originalEvent.ctrlKey;
    this.altKey = originalEvent.altKey;
    this.x = x;
    this.y = y;
    this.key = originalEvent.key;
  }
  continuePropagation() {
    this.#shouldStopPropagation = false;
  }
  get shouldStopPropagation() {
    return this.#shouldStopPropagation;
  }
}

const linkedEvents = new WeakSet<Event>();

function parsePointerType(
  // oxlint-disable-next-line anti-slop/no-unknown-parameters -- Validate optional native event extensions before storing their pointer type.
  value: unknown
): PointerType {
  return value === "touch" ||
    value === "pen" ||
    value === "keyboard" ||
    value === "virtual"
    ? value
    : "mouse";
}

const STYLE_ID = "react-aria-pressable-style";
const PRESSABLE_ATTRIBUTE = "data-react-aria-pressable";

/**
 * Handles press interactions across mouse, touch, keyboard, and screen readers.
 * It normalizes behavior across browsers and platforms, and handles many nuances
 * of dealing with pointer and keyboard events.
 */
export function createPress(props: PressHookProps): PressResult {
  const _result0 = createPressResponderContext(props);
  const [isPressed, setPressed] = createSignal(false, { ownedWrite: true });

  const ref: PressState = {
    activePointerId: null,
    didFirePressStart: false,
    disposables: [],
    ignoreEmulatedMouseEvents: false,
    isOverTarget: false,
    isPressed: false,
    isTriggeringEvent: false,
    pointerType: null,
    target: null,
  };

  const _result1 = createGlobalListeners();

  const triggerPressStart = (
    originalEvent: EventBase,
    pointerType: PointerType
  ) => {
    const state = ref;

    if (isTruthy(_result0.isDisabled) || state.didFirePressStart) {
      return false;
    }

    let shouldStopPropagation = true;
    state.isTriggeringEvent = true;

    if (_result0.onPressStart) {
      const event = new PressEvent("pressstart", pointerType, originalEvent);
      _result0.onPressStart(event);
      ({ shouldStopPropagation } = event);
    }

    if (_result0.onPressChange) {
      _result0.onPressChange(true);
    }

    state.isTriggeringEvent = false;
    state.didFirePressStart = true;
    setPressed(true);

    return shouldStopPropagation;
  };

  const triggerPressEnd = (
    originalEvent: EventBase,
    pointerType: PointerType,
    wasPressed = true
  ) => {
    const state = ref;

    if (!state.didFirePressStart) {
      return false;
    }

    state.didFirePressStart = false;
    state.isTriggeringEvent = true;
    let shouldStopPropagation = true;

    if (_result0.onPressEnd) {
      const event = new PressEvent("pressend", pointerType, originalEvent);
      _result0.onPressEnd(event);
      ({ shouldStopPropagation } = event);
    }

    if (_result0.onPressChange) {
      _result0.onPressChange(false);
    }

    setPressed(false);

    if (_result0.onPress && wasPressed && !isTruthy(_result0.isDisabled)) {
      const event = new PressEvent("press", pointerType, originalEvent);
      _result0.onPress(event);
      shouldStopPropagation &&= event.shouldStopPropagation;
    }

    state.isTriggeringEvent = false;

    return shouldStopPropagation;
  };

  const triggerPressEndEvent = triggerPressEnd;

  const triggerPressUp = (
    originalEvent: EventBase,
    pointerType: PointerType
  ) => {
    const state = ref;

    if (isTruthy(_result0.isDisabled)) {
      return false;
    }

    if (_result0.onPressUp) {
      state.isTriggeringEvent = true;
      const event = new PressEvent("pressup", pointerType, originalEvent);
      _result0.onPressUp(event);
      state.isTriggeringEvent = false;

      return event.shouldStopPropagation;
    }

    return true;
  };

  const triggerPressUpEvent = triggerPressUp;

  const cancel = (e: EventBase) => {
    const state = ref;

    if (state.isPressed && state.target) {
      if (
        state.didFirePressStart &&
        state.pointerType !== null &&
        state.pointerType !== undefined
      ) {
        triggerPressEnd(createEvent(state.target, e), state.pointerType, false);
      }

      state.isPressed = false;
      state.isOverTarget = false;
      state.activePointerId = null;
      state.pointerType = null;
      _result1.removeAllGlobalListeners();

      if (!isTruthy(_result0.allowTextSelectionOnPress)) {
        restoreTextSelection(state.target);
      }

      for (const dispose of state.disposables) {
        dispose();
      }

      state.disposables = [];
    }
  };

  const cancelEvent = cancel;
  createEffect(
    () => _result0.isDisabled,
    (disabled) => {
      if (disabled === true && ref.isPressed) {
        untrack(() => {
          cancelEvent({
            altKey: false,
            ctrlKey: false,
            currentTarget: ref.target,
            metaKey: false,
            shiftKey: false,
          });
        });
      }
    },
    { ssrSource: "client" }
  );

  const cancelOnPointerExit = (e: EventBase) => {
    if (isTruthy(_result0.shouldCancelOnPointerExit)) {
      cancel(e);
    }
  };

  const triggerClick = (e: TargetedMouseEvent<FocusableElement>) => {
    if (isTruthy(_result0.isDisabled)) {
      return;
    }

    _result0.onClick?.(e);
  };

  const triggerActivationClick = (
    e: KeyboardEvent | TouchEvent,
    target: FocusableElement
  ) => {
    if (isTruthy(_result0.isDisabled)) {
      return;
    }

    // Some third-party libraries pass in onClick instead of onPress.
    // Create a fake mouse event and trigger onClick as well.
    // This matches the browser's native activation behavior for certain elements (e.g. button).
    // https://html.spec.whatwg.org/#activation
    // https://html.spec.whatwg.org/#fire-a-synthetic-pointer-event
    if (_result0.onClick) {
      const event = new MouseEvent("click", e);
      setEventTarget(event, target);
      _result0.onClick(event);
    }
  };

  function onScroll(e: Event) {
    const state = ref;

    if (
      state.isPressed &&
      nodeContains(requireElement(getEventTarget(e)), state.target)
    ) {
      cancelEvent({
        altKey: false,
        ctrlKey: false,
        currentTarget: state.target,
        metaKey: false,
        shiftKey: false,
      });
    }
  }

  function onMouseUp(e: MouseEvent) {
    const state = ref;

    // Only handle left clicks
    if (e.button !== 0) {
      return;
    }

    if (state.ignoreEmulatedMouseEvents) {
      state.ignoreEmulatedMouseEvents = false;

      return;
    }

    if (
      state.target &&
      nodeContains(state.target, requireElement(getEventTarget(e))) &&
      state.pointerType !== null &&
      state.pointerType !== undefined
    ) {
      // Wait for onClick to fire onPress. This avoids browser issues when the DOM
      // is mutated between onMouseUp and onClick, and is more compatible with third party libraries.
    } else {
      cancelEvent(e);
    }

    state.isOverTarget = false;
  }

  function onPointerCancel(e: PointerEvent) {
    cancelEvent(e);
  }

  function onPointerUp(e: PointerEvent) {
    const state = ref;

    if (
      e.pointerId === state.activePointerId &&
      state.isPressed &&
      e.button === 0 &&
      state.target
    ) {
      if (
        nodeContains(state.target, requireElement(getEventTarget(e))) &&
        state.pointerType !== null &&
        state.pointerType !== undefined
      ) {
        // Wait for onClick to fire onPress. This avoids browser issues when the DOM
        // is mutated between onPointerUp and onClick, and is more compatible with third party libraries.
        // https://github.com/adobe/react-spectrum/issues/1513
        // https://issues.chromium.org/issues/40732224
        // However, iOS and Android do not focus or fire onClick after a long press.
        // We work around this by triggering a click ourselves after a timeout.
        // This timeout is canceled during the click event in case the real one fires first.
        // The timeout must be at least 32ms, because Safari on iOS delays the click event on
        // non-form elements without certain ARIA roles (for hover emulation).
        // https://github.com/WebKit/WebKit/blob/dccfae42bb29bd4bdef052e469f604a9387241c0/Source/WebKit/WebProcess/WebPage/ios/WebPageIOS.mm#L875-L892
        let clicked = false;

        const timeout = setTimeout(() => {
          if (state.isPressed && state.target instanceof HTMLElement) {
            if (clicked) {
              cancelEvent(e);
            } else {
              focusWithoutScrolling(state.target);
              state.target.click();
            }
          }
        }, 80);

        // Use a capturing listener to track if a click occurred.
        // If stopPropagation is called it may never reach our handler.
        _result1.addGlobalListener(
          requireValue(e.currentTarget, "Expected the click listener target"),
          "click",
          () => {
            clicked = true;
          },
          true
        );
        state.disposables.push(() => {
          clearTimeout(timeout);
        });
      } else {
        cancelEvent(e);
      }

      // Ignore subsequent onPointerLeave event before onClick on touch devices.
      state.isOverTarget = false;
    }
  }

  const state = ref;

  const pressPropsValue: DOMAttributes = {
    onClick(e) {
      if (!isTruthy(e)) {
        return;
      }

      if (!nodeContains(e.currentTarget, getEventTarget(e))) {
        return;
      }

      if (
        e.button === 0 &&
        !state.isTriggeringEvent &&
        !isTruthy(openLink.isOpening)
      ) {
        let shouldStopPropagation = true;

        if (isTruthy(_result0.isDisabled)) {
          e.preventDefault();
        }

        // If triggered from a screen reader or by using element.click(),
        // trigger as if it were a keyboard click.
        if (
          !state.ignoreEmulatedMouseEvents &&
          !state.isPressed &&
          (state.pointerType === "virtual" || isVirtualClick(e))
        ) {
          const stopPressStart = triggerPressStart(e, "virtual");
          const stopPressUp = triggerPressUpEvent(e, "virtual");
          const stopPressEnd = triggerPressEndEvent(e, "virtual");
          triggerClick(e);
          shouldStopPropagation = stopPressStart && stopPressUp && stopPressEnd;
        } else if (state.isPressed && state.pointerType !== "keyboard") {
          const pointerType =
            getTruthyValue(
              state.pointerType ??
                ("pointerType" in e
                  ? parsePointerType(e.pointerType)
                  : undefined)
            ) ?? "virtual";

          const stopPressUp = triggerPressUpEvent(
            createEvent(e.currentTarget, e),
            pointerType
          );

          const stopPressEnd = triggerPressEndEvent(
            createEvent(e.currentTarget, e),
            pointerType,
            true
          );

          shouldStopPropagation = stopPressUp && stopPressEnd;
          state.isOverTarget = false;
          triggerClick(e);

          cancelEvent(e);
        }

        state.ignoreEmulatedMouseEvents = false;

        if (shouldStopPropagation) {
          e.stopPropagation();
        }
      }
    },
    onKeyDown(e) {
      if (
        isValidKeyboardEvent(e, e.currentTarget) &&
        nodeContains(e.currentTarget, getEventTarget(e))
      ) {
        if (shouldPreventDefaultKeyboard(getEventTarget(e), e.key)) {
          e.preventDefault();
        }

        // If the event is repeating, it may have started on a different element
        // after which focus moved to the current element. Ignore these events and
        // only handle the first key down event.
        let shouldStopPropagation = true;

        if (!state.isPressed && !e.repeat) {
          state.target = e.currentTarget;
          state.isPressed = true;
          state.pointerType = "keyboard";
          shouldStopPropagation = triggerPressStart(e, "keyboard");
        }

        // Focus may move before the key up event, so register the event on the document
        // instead of the same element where the key down event occurred. Make it capturing so that it will trigger
        // before stopPropagation from useKeyboard on a child element may happen and thus we can still call triggerPress for the parent element.
        const originalTarget = e.currentTarget;

        const pressUp = (eValue: globalThis.KeyboardEvent) => {
          if (
            isValidKeyboardEvent(eValue, originalTarget) &&
            !eValue.repeat &&
            nodeContains(
              originalTarget,
              requireElement(getEventTarget(eValue))
            ) &&
            state.target
          ) {
            triggerPressUpEvent(createEvent(state.target, eValue), "keyboard");
          }
        };

        _result1.addGlobalListener(
          getOwnerDocument(e.currentTarget),
          "keyup",
          chain(pressUp, onKeyUp),
          true
        );

        if (shouldStopPropagation) {
          e.stopPropagation();
        }

        // Keep track of the keydown events that occur while the Meta (e.g. Command) key is held.
        // macOS has a bug where keyup events are not fired while the Meta key is down.
        // When the Meta key itself is released we will get an event for that, and we'll act as if
        // all of these other keys were released as well.
        // https://bugs.chromium.org/p/chromium/issues/detail?id=1393524
        // https://bugs.webkit.org/show_bug.cgi?id=55291
        // https://bugzilla.mozilla.org/show_bug.cgi?id=1299553
        if (e.metaKey && isMac()) {
          state.metaKeyEvents?.set(e.key, e);
        }
      } else if (e.key === "Meta") {
        state.metaKeyEvents = new Map();
      }
    },
  };

  function onKeyUp(e: KeyboardEvent) {
    if (
      state.isPressed &&
      state.target &&
      isValidKeyboardEvent(e, state.target)
    ) {
      if (
        shouldPreventDefaultKeyboard(requireElement(getEventTarget(e)), e.key)
      ) {
        e.preventDefault();
      }

      const target = getEventTarget(e);
      const wasPressed = nodeContains(state.target, requireElement(target));
      triggerPressEndEvent(
        createEvent(state.target, e),
        "keyboard",
        wasPressed
      );

      if (wasPressed) {
        triggerActivationClick(e, state.target);
      }

      _result1.removeAllGlobalListeners();

      // If a link was triggered with a key other than Enter, open the URL ourselves.
      // This means the link has a role override, and the default browser behavior
      // only applies when using the Enter key.
      if (
        e.key !== "Enter" &&
        isHTMLAnchorLink(state.target) &&
        nodeContains(state.target, requireElement(target)) &&
        !linkedEvents.has(e)
      ) {
        // Store a hidden property on the event so we only trigger link click once,
        // even if there are multiple usePress instances attached to the element.
        linkedEvents.add(e);
        openLink(state.target, e, false);
      }

      state.isPressed = false;
      state.metaKeyEvents?.delete(e.key);
    } else if (e.key === "Meta" && isTruthy(state.metaKeyEvents?.size)) {
      // If we recorded keydown events that occurred while the Meta key was pressed,
      // and those haven't received keyup events already, fire keyup events ourselves.
      // See comment above for more info about the macOS bug causing this.
      const events = state.metaKeyEvents;
      state.metaKeyEvents = undefined;

      for (const event of events.values()) {
        state.target?.dispatchEvent(new KeyboardEvent("keyup", event));
      }
    }
  }

  if (typeof PointerEvent !== "undefined") {
    pressPropsValue.onPointerDown = (e) => {
      // Only handle left clicks, and ignore events that bubbled through portals.
      if (e.button !== 0 || !nodeContains(e.currentTarget, getEventTarget(e))) {
        return;
      }

      // iOS safari fires pointer events from VoiceOver with incorrect coordinates/target.
      // Ignore and let the onClick handler take care of it instead.
      // https://bugs.webkit.org/show_bug.cgi?id=222627
      // https://bugs.webkit.org/show_bug.cgi?id=223202
      if (isVirtualPointerEvent(e)) {
        state.pointerType = "virtual";

        return;
      }

      state.pointerType = parsePointerType(e.pointerType);
      let shouldStopPropagation = true;

      if (!state.isPressed) {
        state.isPressed = true;
        state.isOverTarget = true;
        state.activePointerId = e.pointerId;
        state.target = e.currentTarget;

        if (!isTruthy(_result0.allowTextSelectionOnPress)) {
          disableTextSelection(state.target);
        }

        shouldStopPropagation = triggerPressStart(e, state.pointerType);
        // Release pointer capture so that touch interactions can leave the original target.
        // This enables onPointerLeave and onPointerEnter to fire.
        const target = getEventTarget(e);

        if ("releasePointerCapture" in target) {
          if ("hasPointerCapture" in target) {
            if (target.hasPointerCapture(e.pointerId)) {
              target.releasePointerCapture(e.pointerId);
            }
          } else {
            requireElement(target).releasePointerCapture(e.pointerId);
          }
        }

        _result1.addGlobalListener(
          getOwnerDocument(e.currentTarget),
          "pointerup",
          onPointerUp,
          false
        );
        _result1.addGlobalListener(
          getOwnerDocument(e.currentTarget),
          "pointercancel",
          onPointerCancel,
          false
        );
      }

      if (shouldStopPropagation) {
        e.stopPropagation();
      }
    };

    pressPropsValue.onMouseDown = (e) => {
      if (!nodeContains(e.currentTarget, getEventTarget(e))) {
        return;
      }

      if (e.button === 0) {
        if (isTruthy(_result0.preventFocusOnPress)) {
          const dispose = preventFocus(requireFocusableElement(e.target));

          if (dispose) {
            state.disposables.push(dispose);
          }
        }

        e.stopPropagation();
      }
    };

    pressPropsValue.onPointerUp = (e) => {
      // iOS fires pointerup with zero width and height, so check the pointerType recorded during pointerdown.
      if (
        !nodeContains(e.currentTarget, getEventTarget(e)) ||
        state.pointerType === "virtual"
      ) {
        return;
      }

      // Only handle left clicks. If isPressed is true, delay until onClick.
      if (e.button === 0 && !state.isPressed) {
        triggerPressUpEvent(
          e,
          getTruthyValue(state.pointerType) ?? parsePointerType(e.pointerType)
        );
      }
    };

    pressPropsValue.onPointerEnter = (e) => {
      if (
        e.pointerId === state.activePointerId &&
        state.target &&
        !state.isOverTarget &&
        state.pointerType !== null &&
        state.pointerType !== undefined
      ) {
        state.isOverTarget = true;
        triggerPressStart(createEvent(state.target, e), state.pointerType);
      }
    };

    pressPropsValue.onPointerLeave = (e) => {
      if (
        e.pointerId === state.activePointerId &&
        state.target &&
        state.isOverTarget &&
        state.pointerType !== null &&
        state.pointerType !== undefined
      ) {
        state.isOverTarget = false;
        triggerPressEndEvent(
          createEvent(state.target, e),
          state.pointerType,
          false
        );
        cancelOnPointerExit(e);
      }
    };

    pressPropsValue.onDragStart = (e) => {
      if (!nodeContains(e.currentTarget, getEventTarget(e))) {
        return;
      }

      // Safari does not call onPointerCancel when a drag starts, whereas Chrome and Firefox do.
      cancelEvent(e);
    };
  } else if (process.env.NODE_ENV === "test") {
    // NOTE: this fallback branch is entirely used by unit tests.
    // All browsers now support pointer events, but JSDOM still does not.
    pressPropsValue.onMouseDown = (e) => {
      // Only handle left clicks
      if (e.button !== 0 || !nodeContains(e.currentTarget, getEventTarget(e))) {
        return;
      }

      if (state.ignoreEmulatedMouseEvents) {
        e.stopPropagation();

        return;
      }

      state.isPressed = true;
      state.isOverTarget = true;
      state.target = e.currentTarget;
      state.pointerType = isVirtualClick(e) ? "virtual" : "mouse";

      // Flush sync so that focus moved during react re-renders occurs before we yield back to the browser.
      const shouldStopPropagation = (() => {
        const result = (() =>
          triggerPressStart(
            e,
            requireValue(state.pointerType, "Expected state.pointerType")
          ))();

        flush();

        return result;
      })();

      if (shouldStopPropagation) {
        e.stopPropagation();
      }

      if (isTruthy(_result0.preventFocusOnPress)) {
        const dispose = preventFocus(requireFocusableElement(e.target));

        if (dispose) {
          state.disposables.push(dispose);
        }
      }

      _result1.addGlobalListener(
        getOwnerDocument(e.currentTarget),
        "mouseup",
        onMouseUp,
        false
      );
    };

    pressPropsValue.onMouseEnter = (e) => {
      if (!nodeContains(e.currentTarget, getEventTarget(e))) {
        return;
      }

      let shouldStopPropagation = true;

      if (
        state.isPressed &&
        !state.ignoreEmulatedMouseEvents &&
        state.pointerType !== null &&
        state.pointerType !== undefined
      ) {
        state.isOverTarget = true;
        shouldStopPropagation = triggerPressStart(e, state.pointerType);
      }

      if (shouldStopPropagation) {
        e.stopPropagation();
      }
    };

    pressPropsValue.onMouseLeave = (e) => {
      if (!nodeContains(e.currentTarget, getEventTarget(e))) {
        return;
      }

      let shouldStopPropagation = true;

      if (
        state.isPressed &&
        !state.ignoreEmulatedMouseEvents &&
        state.pointerType !== null &&
        state.pointerType !== undefined
      ) {
        state.isOverTarget = false;
        shouldStopPropagation = triggerPressEndEvent(
          e,
          state.pointerType,
          false
        );
        cancelOnPointerExit(e);
      }

      if (shouldStopPropagation) {
        e.stopPropagation();
      }
    };

    pressPropsValue.onMouseUp = (e) => {
      if (!nodeContains(e.currentTarget, getEventTarget(e))) {
        return;
      }

      if (
        !state.ignoreEmulatedMouseEvents &&
        e.button === 0 &&
        !state.isPressed
      ) {
        triggerPressUpEvent(e, getTruthyValue(state.pointerType) ?? "mouse");
      }
    };

    pressPropsValue.onTouchStart = (e) => {
      if (!nodeContains(e.currentTarget, getEventTarget(e))) {
        return;
      }

      const touch = getTouchFromEvent(e);

      if (!touch) {
        return;
      }

      state.activePointerId = touch.identifier;
      state.ignoreEmulatedMouseEvents = true;
      state.isOverTarget = true;
      state.isPressed = true;
      state.target = e.currentTarget;
      state.pointerType = "touch";

      if (!isTruthy(_result0.allowTextSelectionOnPress)) {
        disableTextSelection(state.target);
      }

      const shouldStopPropagation = triggerPressStart(
        createTouchEvent(state.target, e),
        state.pointerType
      );

      if (shouldStopPropagation) {
        e.stopPropagation();
      }

      _result1.addGlobalListener(
        getOwnerWindow(e.currentTarget),
        "scroll",
        onScroll,
        true
      );
    };

    pressPropsValue.onTouchMove = (e) => {
      if (!nodeContains(e.currentTarget, getEventTarget(e))) {
        return;
      }

      if (!state.isPressed) {
        e.stopPropagation();

        return;
      }

      const touch = getTouchById(e, state.activePointerId);
      let shouldStopPropagation = true;

      if (touch && isOverTarget(touch, e.currentTarget)) {
        if (
          !state.isOverTarget &&
          state.pointerType !== null &&
          state.pointerType !== undefined
        ) {
          state.isOverTarget = true;
          shouldStopPropagation = triggerPressStart(
            createTouchEvent(
              requireValue(state.target, "Expected state.target"),
              e
            ),
            state.pointerType
          );
        }
      } else if (
        state.isOverTarget &&
        state.pointerType !== null &&
        state.pointerType !== undefined
      ) {
        state.isOverTarget = false;
        shouldStopPropagation = triggerPressEndEvent(
          createTouchEvent(
            requireValue(state.target, "Expected state.target"),
            e
          ),
          state.pointerType,
          false
        );
        cancelOnPointerExit(
          createTouchEvent(
            requireValue(state.target, "Expected state.target"),
            e
          )
        );
      }

      if (shouldStopPropagation) {
        e.stopPropagation();
      }
    };

    pressPropsValue.onTouchEnd = (e) => {
      if (!nodeContains(e.currentTarget, getEventTarget(e))) {
        return;
      }

      if (!state.isPressed) {
        e.stopPropagation();

        return;
      }

      const touch = getTouchById(e, state.activePointerId);
      let shouldStopPropagation = true;

      if (
        touch &&
        isOverTarget(touch, e.currentTarget) &&
        state.pointerType !== null &&
        state.pointerType !== undefined
      ) {
        triggerPressUpEvent(
          createTouchEvent(
            requireValue(state.target, "Expected state.target"),
            e
          ),
          state.pointerType
        );
        shouldStopPropagation = triggerPressEndEvent(
          createTouchEvent(
            requireValue(state.target, "Expected state.target"),
            e
          ),
          state.pointerType
        );
        triggerActivationClick(
          e,
          requireValue(state.target, "Expected state.target")
        );
      } else if (
        state.isOverTarget &&
        state.pointerType !== null &&
        state.pointerType !== undefined
      ) {
        shouldStopPropagation = triggerPressEndEvent(
          createTouchEvent(
            requireValue(state.target, "Expected state.target"),
            e
          ),
          state.pointerType,
          false
        );
      }

      if (shouldStopPropagation) {
        e.stopPropagation();
      }

      state.isPressed = false;
      state.activePointerId = null;
      state.isOverTarget = false;
      state.ignoreEmulatedMouseEvents = true;

      if (state.target && !isTruthy(_result0.allowTextSelectionOnPress)) {
        restoreTextSelection(state.target);
      }

      _result1.removeAllGlobalListeners();
    };

    pressPropsValue.onTouchCancel = (e) => {
      if (!nodeContains(e.currentTarget, getEventTarget(e))) {
        return;
      }

      e.stopPropagation();

      if (state.isPressed) {
        cancelEvent(
          createTouchEvent(
            requireValue(state.target, "Expected state.target"),
            e
          )
        );
      }
    };

    pressPropsValue.onDragStart = (e) => {
      if (!nodeContains(e.currentTarget, getEventTarget(e))) {
        return;
      }

      cancelEvent(e);
    };
  }

  // Avoid onClick delay for double tap to zoom by default.
  createEffect(
    () => _result0.ref?.(),
    (element) => {
      if (!element || process.env.NODE_ENV === "test") {
        return;
      }

      const ownerDocument = getOwnerDocument(element);

      if (
        !isTruthy(ownerDocument) ||
        !isTruthy(ownerDocument.head) ||
        ownerDocument.querySelector(`#${STYLE_ID}`)
      ) {
        return;
      }

      const style = ownerDocument.createElement("style");
      style.id = STYLE_ID;
      const nonce = getNonce(ownerDocument);

      if (isTruthy(nonce)) {
        style.nonce = nonce;
      }

      // touchAction: 'manipulation' is supposed to be equivalent, but in
      // Safari it causes onPointerCancel not to fire on scroll.
      // https://bugs.webkit.org/show_bug.cgi?id=240917
      style.textContent = `
@layer {
  [${PRESSABLE_ATTRIBUTE}] {
    touch-action: pan-x pan-y pinch-zoom;
  }
}
    `.trim();
      ownerDocument.head.prepend(style);
    },
    { ssrSource: "client" }
  );
  // Remove user-select: none in case component unmounts immediately after pressStart
  createEffect(
    () => _result0.allowTextSelectionOnPress,
    (allowTextSelection) => () => {
      if (allowTextSelection !== true) {
        restoreTextSelection(state.target ?? undefined);
      }

      for (const dispose of state.disposables) {
        dispose();
      }

      state.disposables = [];
    },
    { ssrSource: "client" }
  );

  return {
    get isPressed() {
      return getTruthyValue(_result0.isPressed) ?? isPressed();
    },
    get pressProps() {
      return mergeProps(
        omit(
          _result0,
          "onPress",
          "onPressChange",
          "onPressStart",
          "onPressEnd",
          "onPressUp",
          "onClick",
          "isDisabled",
          "isPressed",
          "preventFocusOnPress",
          "shouldCancelOnPointerExit",
          "allowTextSelectionOnPress",
          "ref"
        ),
        pressPropsValue,
        { [PRESSABLE_ATTRIBUTE]: true }
      );
    },
  };
}

function isHTMLAnchorLink(target: Element): target is HTMLAnchorElement {
  return target.tagName === "A" && target.hasAttribute("href");
}

function isValidKeyboardEvent(
  event: KeyboardEvent,
  currentTarget: Element
): boolean {
  const { key, code } = event;
  const element = requireHTMLElement(currentTarget);
  const role = element.getAttribute("role");

  // Accessibility for keyboards. Space and Enter only.
  // "Spacebar" is for IE 11
  return (
    (key === "Enter" ||
      key === " " ||
      key === "Spacebar" ||
      code === "Space") &&
    (!(element instanceof getOwnerWindow(element).HTMLInputElement) ||
      isValidInputKey(element, key)) &&
    !(element instanceof getOwnerWindow(element).HTMLTextAreaElement) &&
    !element.isContentEditable &&
    // Links should only trigger with Enter key
    ((role !== "link" && (isTruthy(role) || !isHTMLAnchorLink(element))) ||
      key === "Enter")
  );
}

function getTouchFromEvent(event: TouchEvent): Touch | null {
  const { targetTouches } = event;

  if (targetTouches.length > 0) {
    return targetTouches[0] ?? null;
  }

  return null;
}

function getTouchById(
  event: TouchEvent,
  pointerId: null | number
): null | Touch {
  const { changedTouches } = event;

  for (const touch of changedTouches) {
    if (touch.identifier === pointerId) {
      return touch;
    }
  }

  return null;
}

function createTouchEvent(
  target: FocusableElement,
  e: TargetedTouchEvent<FocusableElement>
): EventBase {
  let clientX = 0;
  let clientY = 0;

  if (isTruthy(e.targetTouches) && e.targetTouches.length === 1) {
    ({ clientX } = requireValue(
      e.targetTouches[0],
      "Expected e.targetTouches[0]"
    ));
    ({ clientY } = requireValue(
      e.targetTouches[0],
      "Expected e.targetTouches[0]"
    ));
  }

  return {
    altKey: e.altKey,
    clientX,
    clientY,
    ctrlKey: e.ctrlKey,
    currentTarget: target,
    metaKey: e.metaKey,
    shiftKey: e.shiftKey,
  };
}

function createEvent(target: FocusableElement, e: EventBase): EventBase {
  const { clientX } = e;
  const { clientY } = e;

  return {
    altKey: e.altKey,
    clientX,
    clientY,
    ctrlKey: e.ctrlKey,
    currentTarget: target,
    key: e.key,
    metaKey: e.metaKey,
    shiftKey: e.shiftKey,
  };
}

interface Rect {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface EventPoint {
  clientX: number;
  clientY: number;
  width?: number;
  height?: number;
  radiusX?: number;
  radiusY?: number;
}

function getPointClientRect(point: EventPoint): Rect {
  let offsetX = 0;
  let offsetY = 0;

  if (point.width !== undefined) {
    offsetX = point.width / 2;
  } else if (point.radiusX !== undefined) {
    offsetX = point.radiusX;
  }

  if (point.height !== undefined) {
    offsetY = point.height / 2;
  } else if (point.radiusY !== undefined) {
    offsetY = point.radiusY;
  }

  return {
    bottom: point.clientY + offsetY,
    left: point.clientX - offsetX,
    right: point.clientX + offsetX,
    top: point.clientY - offsetY,
  };
}

function areRectanglesOverlapping(a: Rect, b: Rect) {
  // check if they cannot overlap on x axis
  if (a.left > b.right || b.left > a.right) {
    return false;
  }

  // check if they cannot overlap on y axis
  if (a.top > b.bottom || b.top > a.bottom) {
    return false;
  }

  return true;
}

function isOverTarget(point: EventPoint, target: Element) {
  const rect = target.getBoundingClientRect();
  const pointRect = getPointClientRect(point);

  return areRectanglesOverlapping(rect, pointRect);
}

function shouldPreventDefaultUp(target: Element) {
  if (target instanceof HTMLInputElement) {
    return false;
  }

  if (target instanceof HTMLButtonElement) {
    return target.type !== "submit" && target.type !== "reset";
  }

  if (isHTMLAnchorLink(target)) {
    return false;
  }

  return true;
}

function shouldPreventDefaultKeyboard(target: Element, key: string) {
  // Don't prevent the contextmenu shortcut on mac.
  if (isMac() && key === "Enter") {
    return false;
  }

  if (target instanceof HTMLInputElement) {
    if (
      key === "Enter" &&
      (target.type === "checkbox" || target.type === "radio")
    ) {
      // Enter on a checkbox or radio should do an implicit form submission, but not toggle the input.
      return false;
    }

    return !isValidInputKey(target, key);
  }

  return shouldPreventDefaultUp(target);
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

function isValidInputKey(target: HTMLInputElement, key: string) {
  // Only space should toggle checkboxes and radios, not enter.
  return target.type === "checkbox" || target.type === "radio"
    ? key === " "
    : nonTextInputTypes.has(target.type);
}
