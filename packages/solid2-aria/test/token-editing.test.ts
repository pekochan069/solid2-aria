import { test } from "bun:test";
import assert from "node:assert/strict";

import { createTokenFieldState } from "@solid2-aria/stately/tokenfield/create-token-field-state";
import { TokenFieldValue } from "@solid2-aria/stately/tokenfield/token-field-value";
import { createRoot, flush } from "solid-js";

import { createTokenField } from "../src/tokenfield/create-token-field";
import { noop } from "../src/utils/noop";
import { requireValue } from "../src/utils/require-value";

test("token field inserts text through native beforeinput and releases its listeners", () => {
  const element = document.createElement("div");
  element.textContent = "abc";
  document.body.append(element);
  const range = document.createRange();
  range.setStart(
    requireValue(element.firstChild, "Expected element.firstChild"),
    0
  );
  range.collapse(true);
  requireValue(
    window.getSelection(),
    "Expected window.getSelection()"
  ).removeAllRanges();
  requireValue(
    window.getSelection(),
    "Expected window.getSelection()"
  ).addRange(range);
  let disposeRoot = noop;

  const state = createRoot((dispose) => {
    disposeRoot = dispose;

    const currentState = createTokenFieldState({
      defaultValue: new TokenFieldValue([{ text: "abc", type: "text" }]),
    });

    createTokenField(
      { "aria-label": "Recipients" },
      currentState,
      () => element
    );

    return currentState;
  });

  flush();

  class BeforeInput
    extends Event
    implements Pick<InputEvent, "getTargetRanges">
  {
    inputType = "insertText";
    data = "x";
    isComposing = false;
    dataTransfer = null;
    getTargetRanges() {
      return [range];
    }
  }

  const input = new BeforeInput("beforeinput", {
    bubbles: true,
    cancelable: true,
  });

  element.dispatchEvent(input);
  flush();
  assert.equal(input.defaultPrevented, true);
  assert.equal(state.value.toString(), "xabc");
  disposeRoot();
  element.dispatchEvent(
    new BeforeInput("beforeinput", { bubbles: true, cancelable: true })
  );
  flush();
  assert.equal(state.value.toString(), "xabc");
  element.remove();
});

test("paste preserves custom token segments in the following beforeinput event", () => {
  const element = document.createElement("div");
  element.textContent = "abc";
  document.body.append(element);
  const range = document.createRange();
  range.setStart(requireValue(element.firstChild, "Expected field text"), 0);
  range.collapse(true);
  const selection = requireValue(window.getSelection(), "Expected selection");
  selection.removeAllRanges();
  selection.addRange(range);
  let disposeRoot = noop;

  const state = createRoot((dispose) => {
    disposeRoot = dispose;

    const currentState = createTokenFieldState({
      defaultValue: new TokenFieldValue([{ text: "abc", type: "text" }]),
    });

    createTokenField(
      { "aria-label": "Recipients" },
      currentState,
      () => element
    );

    return currentState;
  });

  flush();

  const mimeType = "application/vnd.react-aria.tokens+json";
  const segments = [{ text: "Ada", type: "token", value: "ada" }];

  class Paste extends Event {
    clipboardData = {
      getData: () => JSON.stringify(segments),
      types: [mimeType],
    };
  }

  class PasteInput
    extends Event
    implements Pick<InputEvent, "getTargetRanges">
  {
    data = "plain text fallback";
    dataTransfer = null;
    inputType = "insertFromPaste";
    isComposing = false;
    getTargetRanges() {
      return [range];
    }
  }

  element.dispatchEvent(new Paste("paste", { bubbles: true }));

  const input = new PasteInput("beforeinput", {
    bubbles: true,
    cancelable: true,
  });

  element.dispatchEvent(input);
  flush();
  assert.equal(input.defaultPrevented, true);
  assert.deepEqual(state.value.segments, [
    ...segments,
    { text: "abc", type: "text" },
  ]);
  disposeRoot();
  element.remove();
});
