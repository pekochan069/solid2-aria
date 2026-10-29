import { expect, test } from "bun:test";

import { willOpenKeyboard } from "../src/utils/keyboard";

test("global keyboard detection accepts window focus and still recognizes text inputs", () => {
  if (document.readyState === "loading") {
    document.dispatchEvent(new Event("DOMContentLoaded"));
  }

  const errors: string[] = [];

  const onError = (event: ErrorEvent) => {
    errors.push(event.message);
    event.preventDefault();
  };

  const input = document.createElement("input");
  const button = document.createElement("button");
  document.body.append(input, button);
  window.addEventListener("error", onError);

  try {
    window.dispatchEvent(new FocusEvent("focus"));
    input.focus();
    button.focus();

    expect(errors).toEqual([]);
    expect(willOpenKeyboard(window)).toBe(false);
    expect(willOpenKeyboard(document)).toBe(false);
    expect(willOpenKeyboard(input)).toBe(true);
    expect(willOpenKeyboard(button)).toBe(false);
  } finally {
    window.removeEventListener("error", onError);
    input.remove();
    button.remove();
  }
});
