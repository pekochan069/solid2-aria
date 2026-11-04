import { expect, test } from "bun:test";

import { Item } from "@solid2-aria/stately/collections/item";
import { createComboBoxState } from "@solid2-aria/stately/combobox/create-combo-box-state";
import { enableShadowDOM } from "@solid2-aria/stately/flags/flags";
import { render, spread } from "@solidjs/web";
import { flush } from "solid-js";

import { createComboBox } from "../src/combobox/create-combo-box";
import { dispatchVirtualBlur } from "../src/focus/virtual-focus";
import { getScrollParent } from "../src/utils/get-scroll-parent";
import { getScrollParents } from "../src/utils/get-scroll-parents";
import { isFocusable } from "../src/utils/is-focusable";

test("shadow descendants inherit host scrolling and inertness", () => {
  enableShadowDOM();
  const host = document.createElement("div");
  host.style.overflow = "auto";
  const root = host.attachShadow({ mode: "open" });
  const button = document.createElement("button");
  root.append(button);
  document.body.append(host);

  try {
    expect(getScrollParent(button) === host).toBe(true);
    expect(getScrollParents(button).includes(host)).toBe(true);
    expect(isFocusable(button)).toBe(true);
    host.inert = true;
    expect(isFocusable(button)).toBe(false);
  } finally {
    host.remove();
  }
});

test("combobox virtual blur retains its popover related target through shadow retargeting", () => {
  enableShadowDOM();
  const host = document.createElement("div");
  const shadowHost = document.createElement("div");
  const shadowRoot = shadowHost.attachShadow({ mode: "open" });
  const popover = document.createElement("div");
  const option = document.createElement("div");
  popover.append(option);
  shadowRoot.append(popover);
  document.body.append(host, shadowHost);
  let blurCount = 0;

  const dispose = render(() => {
    const input = document.createElement("input");
    // Happy DOM does not retarget relatedTarget across shadow roots. Emulate the browser boundary.
    input.addEventListener(
      "blur",
      (event) => {
        Object.defineProperty(event, "relatedTarget", { value: shadowHost });
      },
      { capture: true, once: true }
    );

    const state = createComboBoxState({
      children: [Item({ children: "Alpha", key: "a" })],
    });

    const aria = createComboBox(
      {
        "aria-label": "Choice",
        inputRef: () => input,
        listBoxRef: () => popover,
        onBlur: () => {
          blurCount += 1;
        },
        popoverRef: () => popover,
      },
      state
    );

    spread(input, () => aria.inputProps);

    return input;
  }, host);

  try {
    flush();
    const input = host.firstElementChild;
    expect(input !== null).toBe(true);

    if (input) {
      dispatchVirtualBlur(input, option);
      expect(blurCount).toBe(0);
      input.dispatchEvent(
        new FocusEvent("blur", { relatedTarget: document.body })
      );
      expect(blurCount).toBe(1);
    }
  } finally {
    dispose();
    host.remove();
    shadowHost.remove();
  }
});
