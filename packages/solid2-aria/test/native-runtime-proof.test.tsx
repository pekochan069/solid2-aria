import { test } from "bun:test";
import assert from "node:assert/strict";
import { setTimeout as delay } from "node:timers/promises";

import { render } from "@solidjs/web";
import { createSignal, flush, Show } from "solid-js";

import { ItemNode } from "../src/collections/base-collection";
import {
  CollectionBuilder,
  Collection,
  createLeafComponent,
} from "../src/collections/collection-builder";
import { FocusRing } from "../src/focus/focus-ring";
import { FocusScope } from "../src/focus/focus-scope";
import { noop } from "../src/utils/noop";
import { requireValue } from "../src/utils/require-value";

test("focus scope autofocuses and contains keyboard focus", () => {
  const host = document.createElement("div");
  document.body.append(host);

  const dispose = render(
    () => (
      <FocusScope autoFocus contain>
        <button>first</button>
        <button>last</button>
      </FocusScope>
    ),
    host
  );

  flush();
  assert.equal(document.activeElement?.textContent, "first");
  const buttons = host.querySelectorAll("button");
  requireValue(buttons[1], "Expected buttons[1]").focus();
  requireValue(buttons[1], "Expected buttons[1]").dispatchEvent(
    new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "Tab",
    })
  );
  assert.equal(document.activeElement, buttons[0]);
  dispose();
  host.remove();
});

test("focus scope restores the trigger after a conditional scope closes", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  let updateOpen: (value: boolean) => void = noop;

  const dispose = render(() => {
    const [open, setOpen] = createSignal(false);
    updateOpen = (value) => {
      setOpen(value);
    };

    return (
      <>
        <button>trigger</button>
        <Show when={open()}>
          <FocusScope autoFocus restoreFocus>
            <button>inside</button>
          </FocusScope>
        </Show>
      </>
    );
  }, host);

  const trigger = requireValue(
    host.querySelector("button"),
    "Expected trigger"
  );

  trigger.focus();
  updateOpen(true);
  flush();
  assert.equal(document.activeElement?.textContent, "inside");
  updateOpen(false);
  flush();
  await delay(30);
  assert.equal(document.activeElement, trigger);
  dispose();
  host.remove();
});

test("an initially empty focus scope autofocuses its first mounted child", () => {
  const host = document.createElement("div");
  document.body.append(host);
  let revealChild: () => void = noop;

  const dispose = render(() => {
    const [ready, setReady] = createSignal(false);
    revealChild = () => {
      setReady(true);
    };

    return (
      <FocusScope autoFocus>
        <Show when={ready()}>
          <button>revealed</button>
        </Show>
      </FocusScope>
    );
  }, host);

  flush();
  assert.equal(host.querySelector("button"), null);
  revealChild();
  flush();
  assert.equal(document.activeElement?.textContent, "revealed");
  dispose();
  host.remove();
});

test("native collection builds and responds to changing source items", () => {
  const host = document.createElement("div");
  document.body.append(host);

  const [items, setItems] = createSignal([
    { id: "one", label: "One" },
    { id: "two", label: "Two" },
  ]);

  const Item = createLeafComponent(
    ItemNode,
    (_props: { id?: string; value?: unknown; children?: string }) => null
  );

  const dispose = render(
    () => (
      <CollectionBuilder
        content={
          <Collection items={items()}>
            {(item) => <Item>{item.label}</Item>}
          </Collection>
        }
      >
        {(collection) => <output>{[...collection.getKeys()].join(",")}</output>}
      </CollectionBuilder>
    ),
    host
  );

  flush();
  assert.equal(host.querySelector("output")?.textContent, "one,two");
  setItems([{ id: "three", label: "Three" }]);
  flush();
  assert.equal(host.querySelector("output")?.textContent, "three");
  dispose();
  host.remove();
});

test("focus ring enhances DOM child without a wrapper", () => {
  const host = document.createElement("div");
  document.body.append(host);

  const dispose = render(
    () => (
      <FocusRing focusClass="focused">
        <button>child</button>
      </FocusRing>
    ),
    host
  );

  flush();
  assert.equal(host.children.length, 1);

  const button = requireValue(
    host.querySelector("button"),
    'Expected host.querySelector("button")'
  );

  button.focus();
  flush();
  assert.equal(button.classList.contains("focused"), true);
  dispose();
  host.remove();
});
