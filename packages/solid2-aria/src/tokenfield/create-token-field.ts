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
 * Derived from Adobe React Spectrum: packages/react-aria/src/tokenfield/useTokenField.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  TokenFieldProps,
  TokenFieldState,
} from "@solid2-aria/stately/tokenfield/create-token-field-state";
import { TokenFieldValue } from "@solid2-aria/stately/tokenfield/token-field-value";
import type {
  Position,
  SelectedRange,
  TokenFieldSegment,
} from "@solid2-aria/stately/tokenfield/token-field-value";
import type {
  AriaLabelingProps,
  FocusableProps,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { merge, createMemo, createEffect, onSettled } from "solid-js";
import type { Accessor } from "solid-js";

import { createLocale } from "../i18n/i18n-provider";
import {
  getInteractionModality,
  setInteractionModality,
} from "../interactions/create-focus-visible";
import { createFocusable } from "../interactions/create-focusable";
import { createKeyboard } from "../interactions/create-keyboard";
import type { KeyboardShortcutBindings } from "../interactions/create-keyboard-shortcut-handler";
import { createField } from "../label/create-field";
import { announce } from "../live-announcer/live-announcer";
import type {
  ClipboardEventHandler,
  HTMLAttributes,
  KeyboardEvent,
} from "../types";
import { ariaValue } from "../utils/aria-value";
import { createEvent } from "../utils/create-event";
import { getOwnerDocument } from "../utils/dom-helpers";
import { requireHTMLElement } from "../utils/dom-value";
import { getScrollParents } from "../utils/get-scroll-parents";
import { isPresent } from "../utils/is-present";
import { mergeProps } from "../utils/merge-props";
import { isMac } from "../utils/platform";
import { requireValue } from "../utils/require-value";
import { scrollRectIntoView } from "../utils/scroll-into-view";
import {
  getActiveElement,
  nodeContains,
} from "../utils/shadowdom/dom-functions";
import { isTruthy } from "../utils/truthy";

export type AriaTokenFieldProps<T extends TokenFieldValue = TokenFieldValue> =
  TokenFieldProps<T> &
    Omit<FocusableProps, "onKeyDown" | "onKeyUp"> &
    AriaLabelingProps & {
      /**
       * The accessibility role of the token field.
       *
       * @default 'textbox'
       */
      role?: "textbox" | "searchbox" | "combobox";
      /** Whether the token field allows newlines. */
      allowsNewlines?: boolean;
      /** Whether the token field is read only. */
      isReadOnly?: boolean;
      /** Whether the token field is disabled. */
      isDisabled?: boolean;
      /** A function that is called when the user presses the Enter key. */
      onSubmit?: () => void;
      /** Handler that is called when a key is pressed. */
      onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void;
      /** Handler that is called when a key is released. */
      onKeyUp?: (e: KeyboardEvent<HTMLDivElement>) => void;
      /**
       * Handler that is called when the user copies text. See
       * [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/oncopy).
       */
      onCopy?: ClipboardEventHandler<HTMLDivElement>;
      /**
       * Handler that is called when the user cuts text. See
       * [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/oncut).
       */
      onCut?: ClipboardEventHandler<HTMLDivElement>;
      /**
       * Handler that is called when the user pastes text. See
       * [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/onpaste).
       */
      onPaste?: ClipboardEventHandler<HTMLDivElement>;
    };

export interface TokenFieldAria {
  /** Props for the token field's input element. */
  tokenFieldProps: HTMLAttributes<HTMLDivElement>;
  /** Props for the text field's visible label element, if any. */
  labelProps: DOMAttributes;
  /** Props for the text field's description element, if any. */
  descriptionProps: DOMAttributes;
}

const CLIPBOARD_MIME_TYPE = "application/vnd.react-aria.tokens+json";

/**
 * Provides the behavior and accessibility implementation for a token field.
 * A token field allows users to enter text with inline tokens.
 *
 * @param props - Props for the token field.
 * @param state - State for the token field, as returned by `useTokenFieldState`.
 */
export function createTokenField<T extends TokenFieldValue = TokenFieldValue>(
  props: AriaTokenFieldProps<T>,
  state: TokenFieldState,
  ref: Accessor<HTMLDivElement | null>
): TokenFieldAria {
  const _result1 = props;
  const _result2 = state;
  const _result3 = createLocale();

  const graphemeSegmenter = createMemo(
    () => new Intl.Segmenter(_result3.locale, { granularity: "grapheme" })
  );

  const wordSegmenter = createMemo(
    () => new Intl.Segmenter(_result3.locale, { granularity: "word" })
  );

  let dropPosition: Position | null = null;
  let transferredData: TokenFieldSegment[] | null = null;
  let nextValue: TokenFieldValue | null = null;

  const apply = (fn: (value: TokenFieldValue) => TokenFieldValue) => {
    state.setValue((value) => {
      const newValue = fn(value);
      nextValue = newValue;

      return newValue;
    });
  };

  // Composition events are not cancelable. Pause controlled DOM updates while the IME owns it,
  // track the browser's mutations, then restore the controlled value when composition ends.
  // Mutating the DOM in any way during composition breaks the IME, causing composition to end unexpectedly.
  // During composition, we still emit updates via onChange to ensure that things like autocomplete work,
  // but we don't actually re-render to the DOM unless the value changes from what we expect (e.g. inserting a completion).
  const mutationTracker = createMutationTracker(ref);

  const startComposition = () => {
    mutationTracker.start();
    state.setComposing(true);
  };

  const stopComposition = () => {
    mutationTracker.stop();
    state.setComposing(false);
  };

  createEvent(ref, "compositionstart", () => {
    startComposition();
    const range = window.getSelection()?.getRangeAt(0);

    if (range) {
      const [start, end] = rangeToPositions(
        requireValue(ref(), "Expected ref.current"),
        range
      );

      // Normalize the range to ensure it is not inside a token, otherwise the browser
      // will attempt to insert the composed text into the token instead of replacing it.
      const r = createDOMRange(
        requireValue(ref(), "Expected ref.current"),
        start,
        end
      );

      if (
        r.startContainer !== range.startContainer ||
        r.startOffset !== range.startOffset
      ) {
        range.setStart(r.startContainer, r.startOffset);
      }

      if (
        r.endContainer !== range.endContainer ||
        r.endOffset !== range.endOffset
      ) {
        range.setEnd(r.endContainer, r.endOffset);
      }
    }
  });
  createEvent(ref, "compositionend", stopComposition);
  // If a prop update occurs during composition that doesn't match the expected value,
  // end composition and re-render the controlled value.
  createEffect(
    () => ({ isComposing: state.isComposing, value: _result2.value }),
    ({ value, isComposing }) => {
      if (isComposing && value !== nextValue) {
        stopComposition();
      }

      nextValue = value;
    },
    { ssrSource: "client" }
  );
  let selectedRange: SelectedRange | null = null;
  createEffect(
    () => ({
      element: ref(),
      isComposing: state.isComposing,
      observedSelectedRange: _result2.value.selectedRange,
      value: _result2.value,
    }),
    ({ observedSelectedRange, value, isComposing, element }) => {
      const refElement = element;

      if (
        refElement &&
        !isComposing &&
        observedSelectedRange !== selectedRange
      ) {
        // Only move the caret when the field is already focused.
        if (refElement === getActiveElement(getOwnerDocument(refElement))) {
          setTokenFieldSelection(refElement, observedSelectedRange);
          announceToken(value);
          // We call preventDefault in the beforeinput handler below, which also prevents the
          // browser's default behavior of scrolling the caret into view. Do it ourselves instead.
          scrollCaretIntoView(refElement);
        }

        selectedRange = observedSelectedRange;
      }
    },
    { ssrSource: "client" }
  );
  // Handle text editing commands and prevent browser default behavior.
  createEvent(ref, "beforeinput", (e) => {
    // Android sometimes doesn't fire a compositionend event before a regular input event.
    if (state.isComposing && !e.isComposing) {
      stopComposition();
    }

    let [range] = e.getTargetRanges();

    if (!range) {
      const selection = window.getSelection();

      if (!selection || selection.rangeCount === 0) {
        return;
      }

      range = selection.getRangeAt(0);
    }

    let [start, end] = rangeToPositions(
      requireValue(ref(), "Expected ref.current"),
      range
    );

    // insertFromComposition is no longer in the spec but is still fired by Safari.
    // https://www.w3.org/TR/input-events-2/#interface-InputEvent-Attributes
    switch (e.inputType) {
      case "insertText":
      case "insertReplacementText":
      case "insertCompositionText":
      case "insertFromComposition":
      case "insertFromPaste":
      case "insertFromYank":
      case "insertFromDrop": {
        const data = getInsertionData(e, transferredData);
        transferredData = null;

        if (e.inputType === "insertFromDrop" && dropPosition) {
          end = dropPosition;
          start = end;
          dropPosition = null;
        }

        if (!(_result1.allowsNewlines ?? false)) {
          for (const segment of data) {
            segment.text = segment.text.replaceAll(/[\r\n]+/gu, " ");
          }
        }

        apply((tokens) =>
          tokens.replaceRangeWithSegments(
            start,
            end,
            data,
            // Don't coalesce paste/drop events with other edits.
            e.inputType === "insertText" ||
              e.inputType === "insertCompositionText" ||
              e.inputType === "insertFromComposition"
          )
        );
        break;
      }

      case "insertParagraph": {
        if (props.onSubmit) {
          props.onSubmit();
          break;
        }

        if (_result1.allowsNewlines ?? false) {
          apply((tokens) => tokens.replaceRange(start, end, "\n"));
        }

        break;
      }

      case "insertLineBreak": {
        if (_result1.allowsNewlines ?? false) {
          apply((tokens) => tokens.replaceRange(start, end, "\n"));
        }

        break;
      }

      case "deleteContentBackward":
      case "deleteContentForward":
      case "deleteWordBackward":
      case "deleteWordForward":
      case "deleteHardLineForward":
      case "deleteHardLineBackward":
      case "deleteSoftLineForward":
      case "deleteSoftLineBackward":
      case "deleteContent":
      case "deleteByCut":
      case "deleteCompositionText": {
        if (!range.collapsed && !isSamePosition(start, end)) {
          apply((tokens) => tokens.replaceRange(start, end, ""));
          break;
        }

        switch (e.inputType) {
          case "deleteContentBackward": {
            apply((tokens) =>
              tokens.delete(
                start,
                graphemeSegmenter(),
                TokenFieldValue.Direction.Backward
              )
            );
            break;
          }

          case "deleteContentForward": {
            apply((tokens) =>
              tokens.delete(
                start,
                graphemeSegmenter(),
                TokenFieldValue.Direction.Forward
              )
            );
            break;
          }

          case "deleteWordBackward": {
            apply((tokens) =>
              tokens.delete(
                start,
                wordSegmenter(),
                TokenFieldValue.Direction.Backward
              )
            );
            break;
          }

          case "deleteWordForward": {
            apply((tokens) =>
              tokens.delete(
                start,
                wordSegmenter(),
                TokenFieldValue.Direction.Forward
              )
            );
            break;
          }

          case "deleteHardLineForward":
          case "deleteSoftLineForward": {
            // Follow-up: this usually deletes to the nearest *visual* line break rather than a hard break
            apply((tokens) =>
              tokens.deleteLine(start, TokenFieldValue.Direction.Forward)
            );
            break;
          }

          case "deleteHardLineBackward":
          case "deleteSoftLineBackward": {
            apply((tokens) =>
              tokens.deleteLine(start, TokenFieldValue.Direction.Backward)
            );
            break;
          }

          case "deleteByCut": {
            throw new Error('Not implemented yet: "deleteByCut" case');
          }

          case "deleteCompositionText": {
            throw new Error(
              'Not implemented yet: "deleteCompositionText" case'
            );
          }

          case "deleteContent": {
            throw new Error('Not implemented yet: "deleteContent" case');
          }

          default: {
            break;
          }
        }

        break;
      }

      case "deleteByDrag": {
        apply((tokens) => {
          const endOffset =
            start.index === end.index
              ? end.offset
              : (tokens.segments[start.index]?.text.length ?? 0);

          const change = tokens.replaceRange(start, end, "");

          if (
            dropPosition &&
            dropPosition.index === start.index &&
            dropPosition.offset >= start.offset
          ) {
            dropPosition.offset -= endOffset - start.offset;
          }

          return change;
        });
        break;
      }

      default: {
        break;
      }
    }

    e.preventDefault();
  });

  const writeClipboardData = (e: ClipboardEvent | DragEvent) => {
    if ("clipboardData" in e) {
      e.preventDefault();
    }

    const selection = getSelection(requireValue(ref(), "Expected ref.current"));

    if (!selection) {
      return;
    }

    const [start, end] = selection;
    const slice = _result2.value.slice(start, end);

    const dataTransfer =
      "clipboardData" in e ? e.clipboardData : e.dataTransfer;

    dataTransfer?.setData(CLIPBOARD_MIME_TYPE, JSON.stringify(slice.segments));
    dataTransfer?.setData("text/plain", slice.toString());

    if (e.type === "cut") {
      apply((tokens) => tokens.replaceRange(start, end, "", false));
    }
  };

  createEvent(ref, "copy", writeClipboardData);
  createEvent(ref, "cut", writeClipboardData);
  createEvent(ref, "dragstart", writeClipboardData);
  createEvent(ref, "paste", (e) => {
    // Safari doesn't pass the custom clipboard data type to beforeinput dataTransfer so we handle it here.
    if (
      e.clipboardData &&
      e.clipboardData.types.includes(CLIPBOARD_MIME_TYPE)
    ) {
      transferredData = parseSegments(
        e.clipboardData.getData(CLIPBOARD_MIME_TYPE)
      );
    }
  });
  // Store the cursor position on drop so we know where to insert when the insertFromDrop event occurs.
  createEvent(ref, "drop", (e) => {
    if (typeof document.caretPositionFromPoint === "function") {
      const pos = document.caretPositionFromPoint(e.clientX, e.clientY);

      if (pos) {
        dropPosition = getPosition(
          requireValue(ref(), "Expected ref.current"),
          pos.offsetNode,
          pos.offset
        );
      }
    } else {
      // oxlint-disable-next-line typescript/no-deprecated, typescript/unbound-method -- Retain the Safari caret fallback and call it with its document receiver.
      const legacyCaretRange = document.caretRangeFromPoint;

      const range =
        typeof legacyCaretRange === "function"
          ? legacyCaretRange.call(document, e.clientX, e.clientY)
          : null;

      if (range) {
        dropPosition = getPosition(
          requireValue(ref(), "Expected ref.current"),
          range.startContainer,
          range.startOffset
        );
      }
    }

    if (e.dataTransfer && e.dataTransfer.types.includes(CLIPBOARD_MIME_TYPE)) {
      transferredData = parseSegments(
        e.dataTransfer.getData(CLIPBOARD_MIME_TYPE)
      );
    }
  });
  createSelectionChange(ref, () => {
    if (state.isComposing) {
      return;
    }

    _result2.value.endCoalescing();

    // When the cursor moves next to a token, announce it.
    // Otherwise the screen reader will only announce the first/last character.
    const range = getSelectedRange(requireValue(ref(), "Expected ref.current"));

    if (!range) {
      return;
    }

    announceToken(_result2.value, range);
    // Update the selected range in the value.
    state.setValue((value) => value.withSelectedRange(range));
  });
  // Clear selection on blur.
  createEvent(ref, "blur", (e) => {
    const refElement = ref();

    if (!e.isTrusted) {
      return;
    }

    const selection = window.getSelection();

    if (
      refElement &&
      selection &&
      selection.containsNode(refElement, true) &&
      !selection.isCollapsed
    ) {
      selection.removeAllRanges();
      state.setValue((value) =>
        value.withSelectedRange(
          new TokenFieldValue.SelectedRange(value.caretPosition)
        )
      );
    }
  });
  // Override the default triple click behavior to ensure that tokens get selected.
  // Some browsers only select the text between tokens instead of the entire line.
  createEvent(ref, "mousedown", (e) => {
    if (e.detail === 3) {
      const selection = getSelection(
        requireValue(ref(), "Expected ref.current")
      );

      if (!selection) {
        return;
      }

      const start = _result2.value.findLineBoundary(
        selection[0],
        TokenFieldValue.Direction.Backward
      );

      const end = _result2.value.findLineBoundary(
        selection[1],
        TokenFieldValue.Direction.Forward
      );

      if (start && end) {
        e.preventDefault();
        setTokenFieldSelection(
          requireValue(ref(), "Expected ref.current"),
          new TokenFieldValue.SelectedRange(start, end),
          true
        );
      }
    }
  });

  const moveSelection = (
    direction: "left" | "right",
    granularity: "character" | "word",
    extend = false
  ) => {
    const selection = window.getSelection();

    if (
      !selection ||
      selection.rangeCount === 0 ||
      !selection.focusNode ||
      !selection.anchorNode
    ) {
      return false;
    }

    // Pressing an arrow with a non-empty selection collapses it to the corresponding edge.
    // The browser handles this natively.
    if (!extend && !selection.isCollapsed) {
      return false;
    }

    // Move the caret using the browser's native caret movement (Selection.modify) so that
    // bidirectional text is handled correctly. Repeat until the position actually changes
    // to account for the zero width spaces around tokens.
    const pos = getPosition(
      requireValue(ref(), "Expected ref.current"),
      selection.focusNode,
      selection.focusOffset
    );

    while (true) {
      const focusNode: globalThis.Node | null = selection.focusNode;
      const focusOffset: number = selection.focusOffset;
      selection.modify(extend ? "extend" : "move", direction, granularity);

      if (
        selection.focusNode === focusNode &&
        selection.focusOffset === focusOffset
      ) {
        return false;
      }

      if (!isTruthy(selection.focusNode)) {
        return false;
      }

      const newPos = getPosition(
        requireValue(ref(), "Expected ref.current"),
        selection.focusNode,
        selection.focusOffset
      );

      if (!isSamePosition(pos, newPos)) {
        return true;
      }
    }
  };

  // macOS supports additional keyboard shortcuts for text editing.
  // We need to handle these manually so they behave consistently with tokens.
  // https://support.apple.com/en-us/102650#text

  const mod = isMac() ? "Meta" : "Control";
  const wordModKey = isMac() ? "Alt" : "Control";

  const shortcuts: KeyboardShortcutBindings = {
    [`${mod}+z`]: (): undefined | false => {
      // If composing, the browser handles undo natively.
      if (state.isComposing) {
        return false;
      }

      apply((currentState) => currentState.undo());

      return undefined;
    },
    [isMac() ? "Shift+Meta+z" : "Control+y"]: (): undefined | false => {
      if (state.isComposing) {
        return false;
      }

      apply((currentState2) => currentState2.redo());

      return undefined;
    },
    ArrowLeft: () => moveSelection("left", "character"),
    [`${wordModKey}+ArrowLeft`]: () => moveSelection("left", "word"),
    ArrowRight: () => moveSelection("right", "character"),
    [`Shift+${wordModKey}+ArrowLeft`]: () =>
      moveSelection("left", "word", true),
    End: () => {
      const selection = getSelection(
        requireValue(ref(), "Expected ref.current")
      );

      if (!selection) {
        return false;
      }

      const boundary = _result2.value.findLineBoundary(
        selection[1],
        TokenFieldValue.Direction.Forward
      );

      if (boundary) {
        setCursor(requireValue(ref(), "Expected ref.current"), boundary, true);

        return true;
      }

      return false;
    },
    [`${wordModKey}+ArrowRight`]: () => moveSelection("right", "word"),
    Home: () => {
      // Browsers do not behave consistently when there are tokens.
      const selection = getSelection(
        requireValue(ref(), "Expected ref.current")
      );

      if (!selection) {
        return false;
      }

      const boundary = _result2.value.findLineBoundary(
        selection[0],
        TokenFieldValue.Direction.Backward
      );

      if (boundary) {
        setCursor(requireValue(ref(), "Expected ref.current"), boundary, true);

        return true;
      }

      return false;
    },
    [`Shift+${wordModKey}+ArrowRight`]: () =>
      moveSelection("right", "word", true),
    "Shift+ArrowLeft": () => moveSelection("left", "character", true),
    "Shift+ArrowRight": () => moveSelection("right", "character", true),
  };

  const macShortcuts: KeyboardShortcutBindings = isMac()
    ? {
        "Control+a": (event) => shortcuts.Home?.(event),
        "Control+b": (event) => shortcuts.ArrowLeft?.(event),
        "Control+e": (event) => shortcuts.End?.(event),
        "Control+f": (event) => shortcuts.ArrowRight?.(event),
      }
    : {};

  Object.assign(shortcuts, macShortcuts);

  // Follow-up: user provided onKeyDown currently relies on user provided preventDefault to stop submit
  // maybe can have them specify a format like shortcuts and merge into above?
  const _result4 = createKeyboard({
    get allowRepeats(): true {
      return true;
    },
    get isDisabled() {
      return (_result1.isDisabled ?? false) || (_result1.isReadOnly ?? false);
    },
    get onKeyDown() {
      return props.onKeyDown;
    },
    get onKeyUp() {
      return props.onKeyUp;
    },
    get shortcuts() {
      return shortcuts;
    },
  });

  const _result5 = createFocusable(props, ref);

  const _result6 = createField(
    merge(props, {
      get labelElementType(): "span" {
        return "span";
      },
    })
  );

  return {
    get descriptionProps() {
      return _result6.descriptionProps;
    },
    get labelProps() {
      return merge(_result6.labelProps, {
        onClick: () => {
          if (!isTruthy(props.isDisabled)) {
            ref()?.focus();
            // Show the focus ring so the user knows where focus went
            setInteractionModality("keyboard");
          }
        },
      });
    },
    get tokenFieldProps() {
      return mergeProps(
        _result5.focusableProps,
        _result4.keyboardProps,
        _result6.fieldProps,
        {
          "aria-details": ariaValue(_result1["aria-details"]),
          "aria-disabled": ariaValue(_result1.isDisabled ?? false),
          "aria-multiline": ariaValue(_result1.allowsNewlines ?? false),
          "aria-readonly": ariaValue(_result1.isReadOnly ?? false),
          contenteditable:
            !(_result1.isDisabled ?? false) && !(_result1.isReadOnly ?? false),
          onCopy: props.onCopy,
          onCut: props.onCut,
          onPaste: props.onPaste,
          role: _result1.role ?? "textbox",
          style: { whiteSpace: "pre-wrap" },
          suppressContentEditableWarning: true,
        }
      );
    },
  };
}

function indexOfNode(node: Node) {
  let index = 0;
  let n: Node | null = node;

  while ((n = n.previousSibling)) {
    index += 1;
  }

  return index;
}

export function getSelection(container: Element): [Position, Position] | null {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);

  return rangeToPositions(container, range);
}

export function getSelectedRange(container: Element) {
  const selection = window.getSelection();

  if (
    !selection ||
    !selection.anchorNode ||
    !selection.focusNode ||
    !nodeContains(container, selection.anchorNode) ||
    !nodeContains(container, selection.focusNode)
  ) {
    return null;
  }

  const anchor = getPosition(
    container,
    selection.anchorNode,
    selection.anchorOffset,
    false
  );

  const current = getPosition(
    container,
    selection.focusNode,
    selection.focusOffset,
    !selection.isCollapsed
  );

  return new TokenFieldValue.SelectedRange(anchor, current);
}

function rangeToPositions(
  container: Element,
  range: Range | StaticRange
): [Position, Position] {
  const start = getPosition(
    container,
    range.startContainer,
    range.startOffset,
    false
  );

  const end = getPosition(
    container,
    range.endContainer,
    range.endOffset,
    !range.collapsed
  );

  return [start, end];
}

function getPosition(
  container: Element,
  node: Node,
  offset: number,
  isRangeEnd = false
): Position {
  let currentNode = node;
  const currentOffset = offset;

  if (currentNode === container) {
    return { index: currentOffset, offset: 0 };
  }

  const originalNode = currentNode;

  while (currentNode.parentNode !== container) {
    currentNode = requireValue(
      currentNode.parentNode,
      "Expected node.parentNode"
    );
  }

  const index = indexOfNode(currentNode);

  if (currentNode.nodeType === Node.ELEMENT_NODE) {
    return getTokenPosition(
      currentNode,
      originalNode,
      currentOffset,
      isRangeEnd,
      index
    );
  }

  return { index, offset: currentOffset };
}

const programmaticSelectionChanges = new WeakSet<Element>();

function setCursor(root: Element, pos: Position, fireEvent = false) {
  setTokenFieldSelection(
    root,
    new TokenFieldValue.SelectedRange(pos),
    fireEvent
  );
}

export function setTokenFieldSelection(
  root: Element,
  selectedRange: SelectedRange,
  fireEvent = false
) {
  const selection = window.getSelection();

  if (selection) {
    // Use setBaseAndExtent to preserve the selection direction. A plain Range +
    // addRange always produces a forward selection and collapses when the
    // anchor comes after the current position (backward selections).
    const [anchorNode, anchorOffset] = getDOMPosition(
      root,
      selectedRange.anchor
    );

    const [focusNode, focusOffset] = getDOMPosition(
      root,
      selectedRange.current
    );

    // Only set selection if it has changed, because this can clobber the browser's selection direction.
    if (
      selection.anchorNode !== anchorNode ||
      selection.anchorOffset !== anchorOffset ||
      selection.focusNode !== focusNode ||
      selection.focusOffset !== focusOffset
    ) {
      // Only flag the change when the selection actually moves. Otherwise no selectionchange
      // event fires to consume the flag, and the next user selection change would be ignored.
      if (fireEvent) {
        programmaticSelectionChanges.delete(root);
      } else {
        programmaticSelectionChanges.add(root);
      }

      selection.setBaseAndExtent(
        anchorNode,
        anchorOffset,
        focusNode,
        focusOffset
      );
    }
  }
}

// Calling preventDefault in the beforeinput handler stops the browser from performing its
// default edit action, which also suppresses its normal behavior of scrolling the caret into
// view. Recreate that behavior by measuring the caret's position with a Range and
// scrolling each scrollable ancestor of the field so it is visible.
function scrollCaretIntoView(root: HTMLElement): void {
  const selection = window.getSelection();

  if (
    getInteractionModality() !== "keyboard" ||
    !selection ||
    selection.rangeCount === 0 ||
    !nodeContains(root, selection.focusNode)
  ) {
    return;
  }

  let range = selection.getRangeAt(0);

  if (range.collapsed && range.endContainer === root) {
    // Root-level positions around tokens have no rect. Measure the adjacent
    // zero width space without moving the actual selection into the token.
    range = tokenFieldPositionToDOMRange(root, {
      index: range.endOffset,
      offset: 0,
    });
  }

  let rect = getCaretRect(root, range);

  for (const element of getScrollParents(root, true)) {
    // scrollRectIntoView only scrolls a single scroll parent based on `rect`, which is a
    // snapshot of the caret's position before any scrolling occurs. Scrolling an inner ancestor
    // moves the caret within the viewport, so translate `rect` by however much we just scrolled
    // before moving on to the next (outer) ancestor.
    const scrollParent = requireHTMLElement(element);
    const beforeTop = scrollParent.scrollTop;
    const beforeLeft = scrollParent.scrollLeft;
    scrollRectIntoView(scrollParent, root, rect, {
      block: "nearest",
      inline: "nearest",
    });
    const dy = scrollParent.scrollTop - beforeTop;
    const dx = scrollParent.scrollLeft - beforeLeft;

    if (dy !== 0 || dx !== 0) {
      rect = new DOMRect(rect.x - dx, rect.y - dy, rect.width, rect.height);
    }
  }
}

export function tokenFieldPositionToDOMRange(
  root: Element,
  pos: Position
): Range {
  // Unlike createDOMRange (used for caret/selection placement), this range is only
  // measured via getBoundingClientRect to position things like an autocomplete popover.
  // Place the endpoints inside the token's zero width space wrappers so the range has a
  // valid rect at the token, rather than a collapsed root-level position.
  const range = document.createRange();
  const [startContainer, startOffset] = getDOMRectPosition(root, pos);
  range.setStart(startContainer, startOffset);
  range.setEnd(startContainer, startOffset);

  return range;
}

function getDOMRectPosition(root: Element, pos: Position): [Node, number] {
  const child = root.childNodes[pos.index];

  if (
    pos.index >= root.childNodes.length &&
    root.lastChild?.lastChild?.nodeType === Node.TEXT_NODE
  ) {
    // A position after the last token belongs to its trailing zero width space.
    const text = root.lastChild.lastChild;

    return [
      text,
      requireValue(text.textContent, "Expected text.textContent").length,
    ];
  }

  if (child && child.nodeType === Node.ELEMENT_NODE) {
    // Place the position inside the zero width space wrappers around the token.
    if (pos.offset > 0) {
      return [requireValue(child.lastChild, "Expected child.lastChild"), 1];
    }

    return [requireValue(child.firstChild, "Expected child.firstChild"), 0];
  }

  return getDOMPosition(root, pos);
}

function createDOMRange(root: Element, start: Position, end: Position): Range {
  const range = document.createRange();
  const [startContainer, startOffset] = getDOMPosition(root, start);
  const [endContainer, endOffset] = getDOMPosition(root, end);
  range.setStart(startContainer, startOffset);
  range.setEnd(endContainer, endOffset);

  return range;
}

function getDOMPosition(root: Element, pos: Position): [Node, number] {
  const index = Math.max(0, Math.min(root.childNodes.length, pos.index));
  const child = root.childNodes[index];

  if (!child) {
    return [root, index];
  } else if (child.nodeType === Node.ELEMENT_NODE) {
    // Place the cursor outside the token wrapper element.
    // This is necessary for composition events.
    if (pos.offset > 0) {
      return [root, index + 1];
    }

    return [root, index];
  }

  const offset = Math.max(
    0,
    Math.min(child.textContent?.length ?? 0, pos.offset)
  );

  return [child, offset];
}

function isSamePosition(a: Position, b: Position): boolean {
  return a.index === b.index && a.offset === b.offset;
}

// Parse and validate segments from clipboard/drag data. Returns null if the data is not valid
// JSON or does not match the expected shape, so malformed or untrusted data is ignored rather
// than throwing or being inserted into the field.
function parseSegments(json: string): TokenFieldSegment[] | null {
  try {
    const data: unknown = JSON.parse(json);

    if (Array.isArray(data) && data.length > 0 && data.every(isValidSegment)) {
      return data;
    }
  } catch {
    // Ignore invalid clipboard data.
  }

  return null;
}

function isValidSegment(segment: unknown): segment is TokenFieldSegment {
  return (
    typeof segment === "object" &&
    segment !== null &&
    segment !== undefined &&
    "type" in segment &&
    (segment.type === "text" || segment.type === "token") &&
    "text" in segment &&
    typeof segment.text === "string"
  );
}

function createSelectionChange(
  ref: Accessor<Element | null>,
  handler: () => void
) {
  createEvent(
    () => (typeof document === "undefined" ? null : document),
    "selectionchange",
    () => {
      const refElement = ref();

      if (refElement && programmaticSelectionChanges.has(refElement)) {
        programmaticSelectionChanges.delete(refElement);

        return;
      }

      const selection = window.getSelection();

      if (!selection || selection.rangeCount === 0 || !refElement) {
        return;
      }

      const range = selection.getRangeAt(0);

      if (range.intersectsNode(refElement)) {
        handler();
      }
    }
  );
}

function createMutationTracker(ref: Accessor<Element | null>) {
  let mutationTracker: (() => void) | null = null;
  // Disconnect the mutation observer if the field unmounts mid-composition.
  onSettled(() => () => {
    mutationTracker?.();
    mutationTracker = null;
  });

  const _memo0 = {
    start() {
      // Android sometimes fires two compositionstart events in a row, without a compositionend.
      // In that case, reuse the existing tracker.
      mutationTracker ??= trackMutations(
        requireValue(ref(), "Expected ref.current")
      );
    },
    stop() {
      mutationTracker?.();
      mutationTracker = null;
    },
  };

  return _memo0;
}

// Tracks mutations to the DOM until the returned function is called,
// at which point the mutations are reverted.
function trackMutations(element: Element) {
  const mutations: MutationRecord[] = [];

  const observer = new MutationObserver((records) => {
    mutations.push(...records);
  });

  observer.observe(element, {
    characterData: true,
    characterDataOldValue: true,
    childList: true,
    subtree: true,
  });

  return () => {
    mutations.push(...observer.takeRecords());
    observer.disconnect();

    for (const record of mutations.toReversed()) {
      switch (record.type) {
        case "childList": {
          for (const node of record.removedNodes) {
            record.target.insertBefore(node, record.nextSibling);
          }

          for (const node of record.addedNodes) {
            // oxlint-disable-next-line unicorn/prefer-dom-node-remove -- MutationRecord exposes Node, which does not declare ChildNode.remove.
            record.target.removeChild(node);
          }

          break;
        }

        case "characterData": {
          record.target.nodeValue = record.oldValue;
          break;
        }

        case "attributes": {
          throw new Error('Not implemented yet: "attributes" case');
        }

        default: {
          break;
        }
      }
    }
  };
}

function announceToken(value: TokenFieldValue, range = value.selectedRange) {
  if (range.isCollapsed) {
    // Announce adjacent tokens.
    let segment = value.segments[range.current.index];

    if (segment && segment.type !== "token") {
      if (range.current.offset === 0) {
        segment = value.segments[range.current.index - 1];
      } else if (range.current.offset === segment.text.length) {
        segment = value.segments[range.current.index + 1];
      }
    }

    if (segment?.type === "token") {
      announce(segment.text, "assertive");
    }
  } else {
    // Announce token if it is the only thing selected.
    const selected = value.slice(range.start, range.end).segments;
    const [only] = selected;

    if (selected.length === 1 && only?.type === "token") {
      announce(only.text, "assertive");
    }
  }
}

function getTokenPosition(
  wrapper: Node,
  originalNode: Node,
  offset: number,
  isRangeEnd: boolean,
  wrapperIndex: number
): Position {
  let index = wrapperIndex;
  let currentOffset = offset;

  const [, tokenNode] = wrapper.childNodes;

  if (!tokenNode) {
    return { index, offset: 0 };
  }

  let atEnd: boolean;
  let endOffset = 0;

  if (originalNode === tokenNode) {
    // Cursor is inside the token.
    atEnd = isRangeEnd || currentOffset > 0;
  } else if (originalNode === wrapper) {
    // Cursor is inside the wrapper element.
    atEnd = currentOffset > 1;
  } else {
    // Cursor is on one of the zero width spaces.
    atEnd = originalNode !== tokenNode.previousSibling;
    // If the offset is greater than 1, the browser is trying to insert text into
    // the zero width space node. This will actually end up in the next text node.
    endOffset = atEnd && currentOffset > 1 ? currentOffset - 1 : 0;
  }

  currentOffset = atEnd ? (tokenNode?.textContent?.length ?? 0) : 0;

  // Several positions are equivalent due to the zero width spaces around tokens.
  // Normalize offset to the end of the preceding text node, or the beginning of the following node.
  if (
    currentOffset === 0 &&
    wrapper.previousSibling?.nodeType === Node.TEXT_NODE
  ) {
    index -= 1;
    currentOffset = wrapper.previousSibling?.textContent?.length ?? 0;
  } else if (atEnd) {
    index += 1;
    currentOffset = endOffset;
  }

  return { index, offset: currentOffset };
}

function getCaretRect(root: HTMLElement, range: Range): DOMRect {
  let measurement = range;
  let rect = measurement.getBoundingClientRect();

  // A collapsed measurement doesn't always produce a client rect. This happens for empty lines.
  if (
    rect.top === 0 &&
    rect.bottom === 0 &&
    rect.left === 0 &&
    rect.right === 0
  ) {
    let node: Node | null = measurement.endContainer;

    if (
      node.nodeType === Node.TEXT_NODE &&
      measurement.endOffset <
        requireValue(node.nodeValue, "Expected node.nodeValue").length
    ) {
      // If we are not at the end of the text node, extend the measurement to include the next character.
      measurement = measurement.cloneRange();
      measurement.setEnd(node, measurement.endOffset + 1);
      rect = measurement.getBoundingClientRect();
    } else if (isPresent(root.firstChild)) {
      // Otherwise find the next sibling element (e.g. trailing <br>) and use its rect in this case.
      let nextSibling = node === root ? null : node.nextSibling;

      while (node && node !== root && !nextSibling) {
        node = node.parentNode;
        nextSibling = node && node !== root ? node.nextSibling : null;
      }

      if (nextSibling?.nodeType === Node.ELEMENT_NODE) {
        rect = requireHTMLElement(nextSibling).getBoundingClientRect();
      }
    } else {
      // If the root has no children, use its rect.
      rect = root.getBoundingClientRect();
    }
  }

  return rect;
}

function getInsertionData(
  e: InputEvent,
  transferred: TokenFieldSegment[] | null
): TokenFieldSegment[] {
  let data: TokenFieldSegment[] = [{ text: e.data ?? "", type: "text" }];

  if (transferred) {
    data = transferred;
  } else if (e.dataTransfer) {
    const parsed = e.dataTransfer.types.includes(CLIPBOARD_MIME_TYPE)
      ? parseSegments(e.dataTransfer.getData(CLIPBOARD_MIME_TYPE))
      : null;

    if (parsed) {
      data = parsed;
    } else if (e.dataTransfer.types.includes("text/plain")) {
      data = [{ text: e.dataTransfer.getData("text/plain"), type: "text" }];
    }
  }

  return data;
}
