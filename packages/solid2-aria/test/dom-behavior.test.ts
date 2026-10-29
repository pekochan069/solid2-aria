import { test } from "bun:test";
import assert from "node:assert/strict";

import { createRoot, flush } from "solid-js";

import { createEvent } from "../src/utils/create-event";
import { createGlobalListeners } from "../src/utils/create-global-listeners";
import { noop } from "../src/utils/noop";

test("global listeners release DOM subscriptions when the owner disposes", () => {
  let calls = 0;
  let disposeRoot = noop;
  const button = document.createElement("button");

  const listeners = createRoot((dispose) => {
    disposeRoot = dispose;

    return createGlobalListeners();
  });

  flush();
  listeners.addGlobalListener(button, "click", () => {
    calls += 1;
  });
  button.click();
  assert.equal(calls, 1);
  disposeRoot();
  button.click();
  assert.equal(calls, 1);
});

test("once listeners fire once and explicit removal removes the wrapped listener", () => {
  let calls = 0;
  let disposeRoot = noop;
  const button = document.createElement("button");

  const listeners = createRoot((dispose) => {
    disposeRoot = dispose;

    return createGlobalListeners();
  });

  flush();

  const listener = () => {
    calls += 1;
  };

  listeners.addGlobalListener(button, "click", listener, { once: true });
  button.click();
  button.click();
  assert.equal(calls, 1);
  listeners.addGlobalListener(button, "click", listener, { once: true });
  listeners.removeGlobalListener(button, "click", listener);
  button.click();
  assert.equal(calls, 1);
  disposeRoot();
});

test("DOM event factories remove listeners on owner disposal", () => {
  let calls = 0;
  let disposeRoot = noop;
  const button = document.createElement("button");
  createRoot((dispose) => {
    disposeRoot = dispose;
    createEvent(
      () => button,
      "click",
      () => {
        calls += 1;
      }
    );
  });
  flush();
  button.click();
  assert.equal(calls, 1);
  disposeRoot();
  button.click();
  assert.equal(calls, 1);
});
