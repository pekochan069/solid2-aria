import { test } from "bun:test";
import assert from "node:assert/strict";

import { render } from "@solidjs/web";
import { createSignal, flush } from "solid-js";

import { ariaHideOutside } from "../src/overlays/aria-hide-outside";
import { createOverlay } from "../src/overlays/create-overlay";

test("only the top overlay dismisses on Escape and disposed overlays leave the stack", () => {
  const calls: string[] = [];
  const first = document.createElement("div");
  const second = document.createElement("div");
  document.body.append(first, second);

  function Overlay(props: { name: string }) {
    const [ref, setRef] = createSignal<Element | null>(null, {
      ownedWrite: true,
    });

    const aria = createOverlay(
      {
        isOpen: true,
        onClose: () => {
          calls.push(props.name);
        },
      },
      ref
    );

    return (
      <div
        {...aria.overlayProps}
        ref={(element) => {
          setRef(element);
        }}
      >
        <button>{props.name}</button>
      </div>
    );
  }

  const firstDispose = render(() => <Overlay name="first" />, first);
  const secondDispose = render(() => <Overlay name="second" />, second);
  flush();
  first
    .querySelector("button")
    ?.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, key: "Escape" })
    );
  assert.deepEqual(calls, []);
  second
    .querySelector("button")
    ?.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, key: "Escape" })
    );
  assert.deepEqual(calls, ["second"]);
  secondDispose();
  first
    .querySelector("button")
    ?.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, key: "Escape" })
    );
  assert.deepEqual(calls, ["second", "first"]);
  firstDispose();
  first.remove();
  second.remove();
});

test("screen reader isolation restores outside content after nested overlays close", () => {
  const host = document.createElement("div");
  const outside = document.createElement("main");
  const dialog = document.createElement("section");
  const nested = document.createElement("section");
  host.append(outside, dialog);
  dialog.append(nested);
  document.body.append(host);
  const restoreOuter = ariaHideOutside([dialog], { root: host });
  assert.equal(outside.getAttribute("aria-hidden"), "true");
  assert.equal(dialog.getAttribute("aria-hidden"), null);
  const restoreInner = ariaHideOutside([nested], { root: host });
  restoreInner();
  assert.equal(outside.getAttribute("aria-hidden"), "true");
  restoreOuter();
  assert.equal(outside.getAttribute("aria-hidden"), null);
  host.remove();
});
