import { expect, test } from "bun:test";

import { render, spread } from "@solidjs/web";
import { flush } from "solid-js";

import { createHover } from "../src/interactions/create-hover";
import { createPress } from "../src/interactions/create-press";

test("mouse hover still ends after touch enters and leaves the same control", () => {
  const host = document.createElement("div");
  document.body.append(host);
  const changes: boolean[] = [];

  const dispose = render(() => {
    const aria = createHover({
      onHoverChange: (hovered) => {
        changes.push(hovered);
      },
    });

    const target = document.createElement("button");
    spread(target, () => aria.hoverProps);

    return target;
  }, host);

  try {
    flush();
    const target = host.firstElementChild;
    expect(target !== null).toBe(true);
    target?.dispatchEvent(
      new PointerEvent("pointerenter", { pointerType: "mouse" })
    );
    target?.dispatchEvent(
      new PointerEvent("pointerenter", { pointerType: "touch" })
    );
    target?.dispatchEvent(
      new PointerEvent("pointerleave", { pointerType: "touch" })
    );
    expect(changes).toEqual([true]);
    target?.dispatchEvent(
      new PointerEvent("pointerleave", { pointerType: "mouse" })
    );
    expect(changes).toEqual([true, false]);
  } finally {
    dispose();
    host.remove();
  }
});

test("each touch restarts the emulated mouse suppression window", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  const changes: boolean[] = [];

  const dispose = render(() => {
    const aria = createHover({
      onHoverChange: (hovered) => {
        changes.push(hovered);
      },
    });

    const target = document.createElement("button");
    spread(target, () => aria.hoverProps);

    return target;
  }, host);

  try {
    flush();
    const target = host.firstElementChild;
    target?.dispatchEvent(
      new PointerEvent("pointerup", { bubbles: true, pointerType: "touch" })
    );
    await Bun.sleep(400);
    target?.dispatchEvent(
      new PointerEvent("pointerup", { bubbles: true, pointerType: "touch" })
    );
    await Bun.sleep(200);
    target?.dispatchEvent(
      new PointerEvent("pointerenter", { pointerType: "mouse" })
    );
    expect(changes).toEqual([]);
    await Bun.sleep(400);
    target?.dispatchEvent(
      new PointerEvent("pointerenter", { pointerType: "mouse" })
    );
    expect(changes).toEqual([true]);
    target?.dispatchEvent(
      new PointerEvent("pointerleave", { pointerType: "mouse" })
    );
  } finally {
    dispose();
    host.remove();
    await Bun.sleep(500);
  }
});

test("macOS Enter prevents the native action while Control+Enter keeps its context menu shortcut", () => {
  const originalPlatform = Object.getOwnPropertyDescriptor(
    navigator,
    "platform"
  );

  Object.defineProperty(navigator, "platform", {
    configurable: true,
    value: "MacIntel",
  });
  const host = document.createElement("div");
  document.body.append(host);

  const dispose = render(() => {
    const aria = createPress({});
    const target = document.createElement("button");
    target.type = "button";
    spread(target, () => aria.pressProps);

    return target;
  }, host);

  try {
    flush();
    const target = host.firstElementChild;

    const down = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "Enter",
    });

    const up = new KeyboardEvent("keyup", {
      bubbles: true,
      cancelable: true,
      key: "Enter",
    });

    target?.dispatchEvent(down);
    target?.dispatchEvent(up);
    expect(down.defaultPrevented).toBe(true);
    expect(up.defaultPrevented).toBe(true);

    const ctrlDown = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
      key: "Enter",
    });

    const ctrlUp = new KeyboardEvent("keyup", {
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
      key: "Enter",
    });

    target?.dispatchEvent(ctrlDown);
    target?.dispatchEvent(ctrlUp);
    expect(ctrlDown.defaultPrevented).toBe(false);
    expect(ctrlUp.defaultPrevented).toBe(false);
  } finally {
    dispose();
    host.remove();

    if (originalPlatform) {
      Object.defineProperty(navigator, "platform", originalPlatform);
    } else {
      Reflect.deleteProperty(navigator, "platform");
    }
  }
});
