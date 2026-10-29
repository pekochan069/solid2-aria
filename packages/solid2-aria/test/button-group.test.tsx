import { test } from "bun:test";
import assert from "node:assert/strict";

import { createToggleGroupState } from "@solid2-aria/stately/toggle/create-toggle-group-state";
import { render } from "@solidjs/web";
import { createSignal, flush } from "solid-js";

import { createToggleButtonGroupItem } from "../src/button/create-toggle-button-group";
import { noop } from "../src/utils/noop";

test("toggle group radios track selected numeric keys and disabled state", () => {
  const host = document.createElement("div");
  document.body.append(host);
  const [disabled, setDisabled] = createSignal(false);
  let selectSecond = noop;

  function Group() {
    const state = createToggleGroupState({
      defaultSelectedKeys: [0],
      get isDisabled() {
        return disabled();
      },
      selectionMode: "single",
    });

    selectSecond = () => {
      state.setSelected(1, true);
    };

    const [ref, setRef] = createSignal<HTMLButtonElement | null>(null, {
      ownedWrite: true,
    });

    const aria = createToggleButtonGroupItem(
      { "aria-label": "First", id: 0 },
      state,
      ref
    );

    return (
      <button
        {...aria.buttonProps}
        ref={(element) => {
          setRef(element);
        }}
      >
        First
      </button>
    );
  }

  const dispose = render(() => <Group />, host);
  flush();
  const button = host.querySelector("button");
  assert.ok(button);
  assert.equal(button.getAttribute("role"), "radio");
  assert.equal(button.getAttribute("aria-checked"), "true");
  assert.equal(button.hasAttribute("aria-pressed"), false);
  selectSecond();
  setDisabled(true);
  flush();
  assert.equal(button.getAttribute("aria-checked"), "false");
  assert.equal(button.disabled, true);
  dispose();
  host.remove();
});
