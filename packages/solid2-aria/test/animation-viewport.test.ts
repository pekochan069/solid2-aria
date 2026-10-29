import { test } from "bun:test";
import assert from "node:assert/strict";
import { setImmediate } from "node:timers/promises";

import { createRoot, createSignal, flush } from "solid-js";

import {
  createEnterAnimation,
  createExitAnimation,
} from "../src/utils/animation";
import { createViewportSize } from "../src/utils/create-viewport-size";
import { noop } from "../src/utils/noop";
import { PlatformEvent } from "./setup";

test("viewport dimensions update on resize and stop updating after disposal", () => {
  let width = 640;
  Object.defineProperty(document.documentElement, "clientWidth", {
    configurable: true,
    get: () => width,
  });
  let disposeRoot = noop;

  const size = createRoot((dispose) => {
    disposeRoot = dispose;

    return createViewportSize();
  });

  flush();
  assert.equal(size.width, 640);
  width = 800;

  if (window.visualViewport) {
    window.visualViewport.dispatchEvent(new PlatformEvent("resize"));
  } else {
    window.dispatchEvent(new Event("resize"));
  }

  flush();
  assert.equal(size.width, 800);
  disposeRoot();
  width = 1000;

  if (window.visualViewport) {
    window.visualViewport.dispatchEvent(new PlatformEvent("resize"));
  } else {
    window.dispatchEvent(new Event("resize"));
  }

  flush();
  assert.equal(size.width, 800);
  Reflect.deleteProperty(document.documentElement, "clientWidth");
});

test("entry animation waits for readiness and exposes completion reactively", () => {
  const element = document.createElement("div");
  Object.defineProperty(element, "getAnimations", { value: () => [] });
  let disposeRoot = noop;
  let started = 0;

  const result = createRoot((dispose) => {
    disposeRoot = dispose;
    const [ready, setReady] = createSignal(false);

    const entering = createEnterAnimation(
      () => element,
      ready,
      () => {
        started += 1;
      }
    );

    return { entering, setReady };
  });

  flush();
  assert.equal(started, 0);
  result.setReady(true);
  flush();
  assert.equal(started, 1);
  assert.equal(result.entering(), false);
  disposeRoot();
});

test("exit animation follows open changes and awaits the animation promise", async () => {
  const element = document.createElement("div");
  Object.defineProperty(element, "getAnimations", { value: () => [] });

  const { promise: animation, resolve: finish } =
    Promise.withResolvers<undefined>();

  let disposeRoot = noop;

  const result = createRoot((dispose) => {
    disposeRoot = dispose;
    const [open, setOpen] = createSignal(true);

    return {
      exiting: createExitAnimation(
        () => element,
        open,
        async () => {
          await animation;
        }
      ),
      setOpen,
    };
  });

  flush();
  assert.equal(result.exiting(), false);
  result.setOpen(false);
  flush();
  assert.equal(result.exiting(), true);
  finish();
  await animation;
  await setImmediate();
  flush();
  assert.equal(result.exiting(), false);
  disposeRoot();
});
