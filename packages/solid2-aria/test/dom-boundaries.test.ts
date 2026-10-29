import { test } from "bun:test";
import assert from "node:assert/strict";

import { render, spread } from "@solidjs/web";
import { createSignal, flush } from "solid-js";

import { createFocus } from "../src/interactions/create-focus";
import { createFocusWithin } from "../src/interactions/create-focus-within";
import { getScrollParents } from "../src/utils/get-scroll-parents";

test("focus can leave a control without a related target", () => {
  const host = document.createElement("div");
  const changes: boolean[] = [];
  document.body.append(host);

  const dispose = render(() => {
    const button = document.createElement("button");

    const aria = createFocusWithin({
      onFocusWithinChange: (focused) => {
        changes.push(focused);
      },
    });

    spread(button, () => aria.focusWithinProps);

    return button;
  }, host);

  flush();
  const button = host.querySelector("button");
  assert.ok(button);
  button.focus();
  button.blur();
  assert.deepEqual(changes, [true, false]);
  dispose();
  host.remove();
});

test("scroll parent traversal stops at the end of a detached tree", () => {
  const parent = document.createElement("div");
  const child = document.createElement("div");
  parent.append(child);

  assert.deepEqual(getScrollParents(child), []);
});

test("focus within tracks descendant controls without leaving between siblings", () => {
  const host = document.createElement("div");
  const outside = document.createElement("button");
  document.body.append(host, outside);
  const changes: boolean[] = [];

  const dispose = render(() => {
    const aria = createFocusWithin({
      onFocusWithinChange: (focused) => {
        changes.push(focused);
      },
    });

    const container = document.createElement("section");

    container.append(
      document.createElement("button"),
      document.createElement("button")
    );
    spread(container, () => aria.focusWithinProps);

    return container;
  }, host);

  try {
    flush();
    const buttons = host.querySelectorAll("button");
    assert.ok(buttons[0]);
    assert.ok(buttons[1]);
    buttons[0].focus();
    assert.deepEqual(changes, [true]);
    buttons[1].focus();
    assert.deepEqual(changes, [true]);
    outside.focus();
    assert.deepEqual(changes, [true, false]);
  } finally {
    dispose();
    host.remove();
    outside.remove();
  }
});

test("disabling a focused control still ends its focus state", async () => {
  const changes: boolean[] = [];
  const [disabled, setDisabled] = createSignal(false);
  const host = document.createElement("div");
  document.body.append(host);

  const dispose = render(() => {
    const aria = createFocus({
      get isDisabled() {
        return disabled();
      },
      onFocusChange: (focused) => {
        changes.push(focused);
      },
    });

    const button = document.createElement("button");
    spread(button, () => ({ ...aria.focusProps, disabled: disabled() }));

    return button;
  }, host);

  try {
    flush();
    const button = host.querySelector("button");
    assert.ok(button);
    button.focus();
    assert.deepEqual(changes, [true]);
    setDisabled(true);
    flush();
    await Bun.sleep(0);
    assert.deepEqual(changes, [true, false]);
  } finally {
    dispose();
    host.remove();
  }
});

test("disabling a focused descendant still ends focus within", async () => {
  const changes: boolean[] = [];
  const [disabled, setDisabled] = createSignal(false);
  const host = document.createElement("div");
  document.body.append(host);

  const dispose = render(() => {
    const aria = createFocusWithin({
      get isDisabled() {
        return disabled();
      },
      onFocusWithinChange: (focused) => {
        changes.push(focused);
      },
    });

    const section = document.createElement("section");
    const button = document.createElement("button");
    section.append(button);
    spread(section, () => aria.focusWithinProps);
    spread(button, () => ({ disabled: disabled() }));

    return section;
  }, host);

  try {
    flush();
    const button = host.querySelector("button");
    assert.ok(button);
    button.focus();
    assert.deepEqual(changes, [true]);
    setDisabled(true);
    flush();
    await Bun.sleep(0);
    assert.deepEqual(changes, [true, false]);
  } finally {
    dispose();
    host.remove();
  }
});
