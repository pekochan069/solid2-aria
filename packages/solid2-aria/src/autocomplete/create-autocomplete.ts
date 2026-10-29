/*
 * Copyright 2024 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria/src/autocomplete/useAutocomplete.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  AutocompleteProps,
  AutocompleteState,
} from "@solid2-aria/stately/autocomplete/create-autocomplete-state";
import type {
  AriaLabelingProps,
  BaseEvent,
  DOMProps,
  FocusableElement,
  FocusEvents,
  KeyboardEvents,
  Node,
  ValueBase,
} from "@solid2-aria/types-shared";
import {
  createEffect,
  createMemo,
  createSignal,
  merge,
  onSettled,
} from "solid-js";
import type { Accessor } from "solid-js";

import intlMessages from "../../intl/autocomplete/index";
import {
  dispatchVirtualBlur,
  dispatchVirtualFocus,
  getVirtuallyFocusedElement,
  moveVirtualFocus,
} from "../focus/virtual-focus";
import { createLocalizedStringFormatter } from "../i18n/create-localized-string-formatter";
import {
  getInteractionModality,
  getPointerType,
} from "../interactions/create-focus-visible";
import type { AriaTextFieldProps } from "../textfield/create-text-field";
import type {
  FocusEvent as DOMFocusEvent,
  KeyboardEvent as DOMKeyboardEvent,
  PointerEvent as DOMPointerEvent,
} from "../types";
import { ariaValue } from "../utils/aria-value";
import { CLEAR_FOCUS_EVENT, FOCUS_EVENT } from "../utils/constants";
import { createEvent } from "../utils/create-event";
import { createId } from "../utils/create-id";
import { createLabels } from "../utils/create-labels";
import { getOwnerDocument } from "../utils/dom-helpers";
import { elementOrNull, requireElement } from "../utils/dom-value";
import { isPresent } from "../utils/is-present";
import { isPropagationStopped } from "../utils/is-propagation-stopped";
import { isCtrlKeyPressed } from "../utils/keyboard";
import { mergeProps } from "../utils/merge-props";
import { isAndroid, isIOS } from "../utils/platform";
import { requireValue } from "../utils/require-value";
import {
  getActiveElement,
  getEventTarget,
} from "../utils/shadowdom/dom-functions";
import { isTruthy } from "../utils/truthy";

export interface CollectionOptions extends DOMProps, AriaLabelingProps {
  /** Whether the collection items should use virtual focus instead of being focused directly. */
  shouldUseVirtualFocus: boolean;
  /** Whether typeahead is disabled. */
  disallowTypeAhead: boolean;
}

export interface InputProps<T = FocusableElement>
  extends
    DOMProps,
    FocusEvents<T>,
    KeyboardEvents,
    Pick<ValueBase<string>, "onChange" | "value">,
    Pick<
      AriaTextFieldProps,
      | "enterKeyHint"
      | "aria-controls"
      | "aria-autocomplete"
      | "aria-activedescendant"
      | "spellCheck"
      | "autoCorrect"
      | "autoComplete"
    > {}

export interface AriaAutocompleteProps<T> extends AutocompleteProps {
  /**
   * An optional filter function used to determine if a option should be included in the
   * autocomplete list. Include this if the items you are providing to your wrapped collection
   * aren't filtered by default.
   */
  filter?: (textValue: string, inputValue: string, node: Node<T>) => boolean;
  /**
   * Whether or not to focus the first item in the collection after a filter is performed. Note this
   * is only applicable if virtual focus behavior is not turned off via `disableVirtualFocus`.
   *
   * @default false
   */
  disableAutoFocusFirst?: boolean;
  /**
   * Whether the autocomplete should disable virtual focus, instead making the wrapped collection
   * directly tabbable.
   *
   * @default false
   */
  disableVirtualFocus?: boolean;
}

export interface AriaAutocompleteOptions<T> extends Omit<
  AriaAutocompleteProps<T>,
  "children"
> {
  /** The ref for the wrapped collection element. */
  inputRef: Accessor<HTMLInputElement | null>;
  /** The ref for the wrapped collection element. */
  collectionRef: Accessor<HTMLElement | null>;
}

export interface AutocompleteAria<T> {
  /**
   * Props for the autocomplete input element. These should be passed to the input's aria hooks
   * (e.g. useTextField/useSearchField/etc) respectively.
   */
  inputProps: InputProps;
  /** Props for the collection, to be passed to collection's respective aria hook (e.g. useMenu). */
  collectionProps: CollectionOptions;
  /** Ref to attach to the wrapped collection. */
  collectionRef: (element: HTMLElement) => void;
  /**
   * A filter function that returns if the provided collection node should be filtered out of the
   * collection.
   */
  filter?: (nodeTextValue: string, node: Node<T>) => boolean;
}

/**
 * Provides the behavior and accessibility implementation for an autocomplete component. An
 * autocomplete combines a text input with a collection, allowing users to filter the collection's
 * contents match a query.
 *
 * @param props - Props for the autocomplete.
 * @param state - State for the autocomplete, as returned by `useAutocompleteState`.
 */
export function createAutocomplete<T>(
  props: AriaAutocompleteOptions<T>,
  state: AutocompleteState
): AutocompleteAria<T> {
  const _result1 = props;
  const collectionId = createId();

  let timeout: ReturnType<typeof setTimeout> | undefined = undefined;

  let delayNextActiveDescendant = false;
  let queuedActiveDescendant: string | null = null;

  // For mobile screen readers, we don't want virtual focus, instead opting to disable FocusScope's restoreFocus and manually
  // moving focus back to the subtriggers
  const isMobileScreenReader =
    getInteractionModality() === "virtual" && (isIOS() || isAndroid());

  const [supportsVirtualFocus, setSupportsVirtualFocus] = createSignal(true, {
    ownedWrite: true,
  });

  const shouldUseVirtualFocus = createMemo(
    () =>
      supportsVirtualFocus() &&
      !isMobileScreenReader &&
      !isTruthy(_result1.disableVirtualFocus)
  );

  // Tracks if a collection has been connected to the autocomplete. If false, we don't want to add various attributes to the autocomplete input
  // since it isn't attached to a filterable collection (e.g. Tabs)
  const [hasCollection, setHasCollection] = createSignal(false, {
    ownedWrite: true,
  });

  const [autoFocusOnMount, setAutoFocusOnMount] = createSignal(false, {
    ownedWrite: true,
  });

  onSettled(() => () => {
    clearTimeout(timeout);
  });

  const updateActiveDescendantEvent = (e: Event) => {
    const result1inputRefElement = _result1.inputRef();
    const result1collectionRefElement = _result1.collectionRef();

    // Ensure input is focused if the user clicks on the collection directly.
    // don't trigger on touch so that mobile keyboard doesnt appear when tapping on options
    if (
      !e.isTrusted &&
      shouldUseVirtualFocus() &&
      result1inputRefElement &&
      getActiveElement(getOwnerDocument(result1inputRefElement)) !==
        result1inputRefElement &&
      getPointerType() !== "touch"
    ) {
      result1inputRefElement.focus();
    }

    const target = elementOrNull(getEventTarget(e));

    if (e.isTrusted || !target || queuedActiveDescendant === target.id) {
      return;
    }

    clearTimeout(timeout);

    if (target !== result1collectionRefElement) {
      queuedActiveDescendant = target.id;

      if (delayNextActiveDescendant) {
        timeout = setTimeout(() => {
          state.setFocusedNodeId(target.id);
        }, 500);
      } else {
        state.setFocusedNodeId(target.id);
      }
    } else if (
      isTruthy(queuedActiveDescendant) &&
      !document.getElementById(queuedActiveDescendant)
    ) {
      // If we recieve a focus event refocusing the collection, either we have newly refocused the input and are waiting for the
      // wrapped collection to refocus the previously focused node if any OR
      // we are in a state where we've filtered to such a point that there aren't any matching items in the collection to focus.
      // In this case we want to clear tracked item if any and clear active descendant
      queuedActiveDescendant = null;
      state.setFocusedNodeId(null);
    }

    delayNextActiveDescendant = false;
  };

  const [collectionNode, setCollectionNode] = createSignal<HTMLElement | null>(
    null,
    { ownedWrite: true }
  );

  const callbackRef = (node: HTMLElement | null) => {
    setCollectionNode(node);

    if (isPresent(node)) {
      // If useSelectableCollection isn't passed shouldUseVirtualFocus even when useAutocomplete provides it
      // that means the collection doesn't support it (e.g. Table). If that is the case, we need to disable it here regardless
      // of what the user's provided so that the input doesn't recieve the onKeyDown and autocomplete props.
      if (isPresent(node.getAttribute("tabindex"))) {
        setSupportsVirtualFocus(false);
      }

      setHasCollection(true);
    } else {
      setHasCollection(false);
    }
  };

  createEffect(
    () => ({ collectionNode: collectionNode() }),
    ({ collectionNode: currentCollectionNode }) => {
      const element = currentCollectionNode;
      element?.addEventListener("focusin", updateActiveDescendantEvent);

      return () =>
        element?.removeEventListener("focusin", updateActiveDescendantEvent);
    },
    { ssrSource: "client" }
  );

  const mergedCollectionRef = callbackRef;

  const focusFirstItem = () => {
    if (!_result1.collectionRef()) {
      setAutoFocusOnMount(true);

      return;
    }

    delayNextActiveDescendant = true;
    _result1.collectionRef()?.dispatchEvent(
      new CustomEvent(FOCUS_EVENT, {
        bubbles: true,
        cancelable: true,
        detail: {
          focusStrategy: "first",
        },
      })
    );
  };

  const clearVirtualFocus = (clearFocusKey?: boolean) => {
    setAutoFocusOnMount(false);
    moveVirtualFocus(getActiveElement());
    queuedActiveDescendant = null;
    state.setFocusedNodeId(null);

    const clearFocusEvent = new CustomEvent(CLEAR_FOCUS_EVENT, {
      bubbles: true,
      cancelable: true,
      detail: {
        clearFocusKey,
      },
    });

    clearTimeout(timeout);
    delayNextActiveDescendant = false;
    _result1.collectionRef()?.dispatchEvent(clearFocusEvent);
  };

  let lastInputType = "";
  createEvent(_result1.inputRef, "beforeinput", (e) => {
    const { inputType } = e;
    lastInputType = inputType;
  });

  const onChange = (value: string) => {
    // Tell wrapped collection to focus the first element in the list when typing forward and to clear focused key when modifying the text via
    // copy paste/backspacing/undo/redo for screen reader announcements
    if (
      (lastInputType === "insertText" ||
        // IME composition (e.g. CJK input) reports 'insertCompositionText'/'insertFromComposition'
        // instead of 'insertText'. Treat these as forward typing so the first item gets virtual focus.
        lastInputType === "insertCompositionText" ||
        lastInputType === "insertFromComposition") &&
      !(_result1.disableAutoFocusFirst ?? false)
    ) {
      focusFirstItem();
    } else if (
      lastInputType &&
      (lastInputType.includes("insert") ||
        lastInputType.includes("delete") ||
        lastInputType.includes("history"))
    ) {
      clearVirtualFocus(true);

      // If onChange was triggered before the timeout actually updated the activedescendant, we need to fire
      // our own dispatchVirtualFocus so focusVisible gets reapplied on the input
      if (getVirtuallyFocusedElement(document) === _result1.inputRef()) {
        dispatchVirtualFocus(
          requireValue(
            _result1.inputRef(),
            "Expected _result1.inputRef.current"
          ),
          null
        );
      }
    }

    state.setInputValue(value);
  };

  let keyDownTarget: Element | null = null;

  // For textfield specific keydown operations
  function prepareCollectionKey(
    e: BaseEvent<DOMKeyboardEvent<FocusableElement>>,
    focusedNodeId: string | null
  ): boolean {
    switch (e.key) {
      case "a": {
        if (isCtrlKeyPressed(e)) {
          return false;
        }

        break;
      }

      case "Escape": {
        // Early return for Escape here so it doesn't leak the Escape event from the simulated collection event below and
        // close the dialog prematurely. Ideally that should be up to the discretion of the input element hence the check
        // for isPropagationStopped
        if (e.defaultPrevented) {
          return false;
        }

        break;
      }

      case " ": {
        // Space shouldn't trigger onAction so early return.
        return false;
      }

      case "Tab": {
        // Don't propogate Tab down to the collection, otherwise we will try to focus the collection via useSelectableCollection's Tab handler (aka shift tab logic)
        // We want FocusScope to handle Tab if one exists (aka sub dialog), so special casepropogate
        if ("continuePropagation" in e) {
          e.continuePropagation();
        }

        return false;
      }

      case "Home":
      case "End":
      case "PageDown":
      case "PageUp":
      case "ArrowUp":
      case "ArrowDown":
      case "ArrowRight":
      case "ArrowLeft": {
        if (
          (e.key === "Home" || e.key === "End") &&
          !isPresent(focusedNodeId) &&
          e.shiftKey
        ) {
          return false;
        }

        // If there is text within the input field, we'll want continue propagating events down
        // to the wrapped collection if there is a focused node so that a user can continue moving the
        // virtual focus. However, if the user doesn't have a focus in the collection, just move the text
        // cursor instead. They can move focus down into the collection via down/up arrow if need be
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          if (!isPresent(focusedNodeId)) {
            if (!isPropagationStopped(e)) {
              e.stopPropagation();
            }

            return false;
          }

          break;
        }

        // Prevent these keys from moving the text cursor in the input
        e.preventDefault();

        // Move virtual focus into the wrapped collection
        const focusCollection = new CustomEvent(FOCUS_EVENT, {
          bubbles: true,
          cancelable: true,
        });

        _result1.collectionRef()?.dispatchEvent(focusCollection);
        break;
      }

      default: {
        break;
      }
    }

    return true;
  }

  const onKeyDown = (e: BaseEvent<DOMKeyboardEvent<FocusableElement>>) => {
    keyDownTarget = requireElement(getEventTarget(e));

    if (e.isComposing) {
      return;
    }

    let focusedNodeId = queuedActiveDescendant;

    if (
      focusedNodeId !== null &&
      !isPresent(
        getOwnerDocument(_result1.inputRef()).querySelector(`#${focusedNodeId}`)
      )
    ) {
      // if the focused id doesn't exist in document, then we need to clear the tracked focused node, otherwise
      // we will be attempting to fire key events on a non-existing node instead of trying to focus the newly swapped wrapped collection.
      // This can happen if you are swapping out the Autocomplete wrapped collection component like in the docs search.
      queuedActiveDescendant = null;
      focusedNodeId = null;
    }

    if (!prepareCollectionKey(e, focusedNodeId)) {
      return;
    }

    // Emulate the keyboard events that happen in the input field in the wrapped collection. This is for triggering things like onAction via Enter
    // or moving focus from one item to another. Stop propagation on the input event if it isn't already stopped so it doesn't leak out. For events
    // like ESC, the dispatched event below will bubble out of the collection and be stopped if handled by useSelectableCollection, otherwise will bubble
    // as expected
    if (!isPropagationStopped(e)) {
      e.stopPropagation();
    }

    let shouldPerformDefaultAction = true;

    if (_result1.collectionRef() !== null) {
      if (isPresent(focusedNodeId)) {
        const item = document.querySelector(`#${focusedNodeId}`);

        if (item) {
          shouldPerformDefaultAction = item.dispatchEvent(
            new KeyboardEvent(e.type, e)
          );
        }
      } else {
        shouldPerformDefaultAction =
          _result1
            .collectionRef()
            ?.dispatchEvent(new KeyboardEvent(e.type, e)) ?? false;
      }
    }

    if (shouldPerformDefaultAction) {
      switch (e.key) {
        case "ArrowLeft":
        case "ArrowRight": {
          // Clear the activedescendant so NVDA announcements aren't interrupted but retain the focused key in the collection so the
          // user's keyboard navigation restarts from where they left off
          clearVirtualFocus();
          break;
        }

        case "Enter": {
          // Trigger click action on item when Enter key was pressed.
          if (isPresent(focusedNodeId)) {
            const item = document.querySelector(`#${focusedNodeId}`);
            item?.dispatchEvent(new PointerEvent("click", e));
          }

          break;
        }

        default: {
          break;
        }
      }
    } else {
      // Follow-up: check if we can do this, want to stop textArea from using its default Enter behavior so items are properly triggered
      e.preventDefault();
    }
  };

  const onKeyUpCapture = (e: globalThis.KeyboardEvent) => {
    // Dispatch simulated key up events for things like triggering links in listbox
    // Make sure to stop the propagation of the input keyup event so that the simulated keyup/down pair
    // is detected by usePress instead of the original keyup originating from the input
    if (getEventTarget(e) === keyDownTarget) {
      e.stopImmediatePropagation();
      const focusedNodeId = queuedActiveDescendant;

      if (isPresent(focusedNodeId)) {
        const item = document.querySelector(`#${focusedNodeId}`);
        item?.dispatchEvent(new KeyboardEvent(e.type, e));
      } else {
        _result1.collectionRef()?.dispatchEvent(new KeyboardEvent(e.type, e));
      }
    }
  };

  onSettled(() => {
    document.addEventListener("keyup", onKeyUpCapture, true);

    return () => {
      document.removeEventListener("keyup", onKeyUpCapture, true);
    };
  });

  const stringFormatter = createLocalizedStringFormatter(
    intlMessages,
    "@react-aria/autocomplete"
  );

  const collectionProps = createLabels({
    get "aria-label"() {
      return ariaValue(ariaValue(stringFormatter.format("collectionLabel")));
    },
    get id() {
      return collectionId();
    },
  });

  const filterFn = (nodeTextValue: string, node: Node<T>) => {
    if (_result1.filter) {
      return _result1.filter(nodeTextValue, state.inputValue, node);
    }

    return true;
  };

  // Be sure to clear/restore the virtual + collection focus when blurring/refocusing the field so we only show the
  // focus ring on the virtually focused collection when are actually interacting with the Autocomplete
  const onBlur = (e: DOMFocusEvent) => {
    if (!e.isTrusted) {
      return;
    }

    const lastFocusedNode = isTruthy(queuedActiveDescendant)
      ? document.getElementById(queuedActiveDescendant)
      : null;

    if (lastFocusedNode) {
      dispatchVirtualBlur(
        lastFocusedNode,
        e.relatedTarget instanceof Element ? e.relatedTarget : null
      );
    }
  };

  const onFocus = (e: DOMFocusEvent) => {
    if (!e.isTrusted) {
      return;
    }

    const curFocusedNode = isTruthy(queuedActiveDescendant)
      ? document.getElementById(queuedActiveDescendant)
      : null;

    if (curFocusedNode) {
      const target = getEventTarget(e);
      queueMicrotask(() => {
        // instead of focusing the last focused node, just focus the collection instead and have the collection handle what item to focus via useSelectableCollection/Item
        dispatchVirtualBlur(target, _result1.collectionRef());
        dispatchVirtualFocus(
          requireValue(
            _result1.collectionRef(),
            "Expected _result1.collectionRef.current"
          ),
          target
        );
      });
    }
  };

  // Clicking back into the input can happen after focus moved elsewhere in the dialog, while
  // virtual focus is still on an option. Clear virtual focus on pointer down so mouse
  // interactions restore the input state before the click's focus handling runs.
  // Touch is excluded because touch interactions should not move focus back to the input.
  const onPointerDown = (e: DOMPointerEvent) => {
    if (
      e.button !== 0 ||
      e.pointerType === "touch" ||
      queuedActiveDescendant === null ||
      queuedActiveDescendant === undefined ||
      _result1.inputRef() === null ||
      _result1.inputRef() === undefined
    ) {
      return;
    }

    if (getEventTarget(e) === _result1.inputRef()) {
      clearVirtualFocus();
    }
  };

  // Only apply the autocomplete specific behaviors if the collection component wrapped by it is actually
  // being filtered/allows filtering by the Autocomplete.
  const virtualFocusProps = {
    get "aria-activedescendant"() {
      return ariaValue(state.focusedNodeId ?? undefined);
    },
    onBlur,
    onFocus,
    onKeyDown,
    onPointerDown,
  };

  const inputProps: InputProps = mergeProps(
    merge(() =>
      shouldUseVirtualFocus() && hasCollection() ? virtualFocusProps : {}
    ),
    {
      // Follow-up: readd proper logic for completionMode = complete (aria-autocomplete: both)
      "aria-autocomplete": ariaValue("list"),
      get "aria-controls"() {
        return ariaValue(hasCollection() ? collectionId() : undefined);
      },
      autoComplete: "off",
      // This disable's iOS's autocorrect suggestions, since the autocomplete provides its own suggestions.
      autoCorrect: "off",
      enterKeyHint: "go",
      // This disable's the macOS Safari spell check auto corrections.
      onChange,
      spellCheck: "false",
      get value() {
        return state.inputValue;
      },
    } satisfies InputProps
  );

  return {
    get collectionProps() {
      return mergeProps(collectionProps, {
        autoFocus: autoFocusOnMount() ? "first" : false,
        disallowTypeAhead: shouldUseVirtualFocus(),
        shouldUseVirtualFocus: shouldUseVirtualFocus(),
      });
    },
    get collectionRef() {
      return mergedCollectionRef;
    },
    get filter() {
      return isPresent(_result1.filter) ? filterFn : undefined;
    },
    get inputProps() {
      return inputProps;
    },
  };
}
