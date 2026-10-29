import { test } from "bun:test";
import assert from "node:assert/strict";

import { Item } from "@solid2-aria/stately/collections/item";
import { createDraggableCollectionState } from "@solid2-aria/stately/dnd/create-draggable-collection-state";
import { createListState } from "@solid2-aria/stately/list/create-list-state";
import type { DropOperation } from "@solid2-aria/types-shared";
import { render, spread } from "@solidjs/web";
import { createSignal, flush } from "solid-js";

import { createDrag } from "../src/dnd/create-drag";
import { createDraggableItem } from "../src/dnd/create-draggable-item";

const enter = (altKey = false) =>
  new KeyboardEvent("keydown", {
    altKey,
    bubbles: true,
    cancelable: true,
    key: "Enter",
  });

test("native dragging retains every allowed operation", () => {
  const cases: [DropOperation[], DataTransfer["effectAllowed"]][] = [
    [["copy", "move"], "copyMove"],
    [["link", "copy"], "copyLink"],
    [["move", "link", "copy"], "all"],
  ];

  for (const [operations, expected] of cases) {
    const host = document.createElement("div");
    document.body.append(host);

    const dispose = render(() => {
      const element = document.createElement("div");

      const aria = createDrag({
        getAllowedDropOperations: () => operations,
        getItems: () => [{ "text/plain": "Dragged item" }],
      });

      spread(element, () => aria.dragProps);

      return element;
    }, host);

    flush();
    const transfer = new window.DataTransfer();

    const event = new window.DragEvent("dragstart", {
      bubbles: true,
      cancelable: true,
      dataTransfer: transfer,
    });

    Object.defineProperty(event, "dataTransfer", { value: transfer });
    assert.ok(host.firstElementChild);
    host.firstElementChild.dispatchEvent(event);
    assert.equal(transfer.effectAllowed, expected);
    dispose();
    host.remove();
  }
});

test("native drag capture precedes bubbling, follows Alt requirements, and detaches", () => {
  const host = document.createElement("div");
  document.body.append(host);
  const [requiresAlt, setRequiresAlt] = createSignal(false);

  const dispose = render(() => {
    const element = document.createElement("button");

    const aria = createDrag({
      getItems: () => [{ "text/plain": "Dragged item" }],
      get shouldRequireAltKey() {
        return requiresAlt();
      },
    });

    spread(element, () => aria.dragProps);

    return element;
  }, host);

  flush();
  const element = host.querySelector("button");
  assert.ok(element);
  let bubbled = 0;
  host.addEventListener("keydown", () => {
    bubbled += 1;
  });
  const first = enter();
  element.dispatchEvent(first);
  assert.equal(first.defaultPrevented, true);
  assert.equal(bubbled, 0);
  setRequiresAlt(true);
  flush();
  const ordinary = enter();
  element.dispatchEvent(ordinary);
  assert.equal(ordinary.defaultPrevented, false);
  assert.equal(bubbled, 1);
  const alternate = enter(true);
  element.dispatchEvent(alternate);
  assert.equal(alternate.defaultPrevented, true);
  assert.equal(bubbled, 1);
  dispose();
  const detached = enter(true);
  element.dispatchEvent(detached);
  assert.equal(detached.defaultPrevented, false);
  host.remove();
});

test("disabling a draggable item releases its native keyboard capture", () => {
  const host = document.createElement("div");
  document.body.append(host);
  const [disabled, setDisabled] = createSignal(false);

  const dispose = render(() => {
    const element = document.createElement("button");

    const list = createListState({
      children: [Item({ children: "Alpha", key: "a", textValue: "Alpha" })],
      selectionMode: "single",
    });

    const state = createDraggableCollectionState({
      collection: list.collection,
      getItems: () => [{ "text/plain": "Alpha" }],
      get isDisabled() {
        return disabled();
      },
      selectionManager: list.selectionManager,
    });

    const aria = createDraggableItem({ key: "a" }, state);
    spread(element, () => aria.dragProps);

    return element;
  }, host);

  flush();
  const element = host.querySelector("button");
  assert.ok(element);
  const enabledEvent = enter();
  element.dispatchEvent(enabledEvent);
  assert.equal(enabledEvent.defaultPrevented, true);
  setDisabled(true);
  flush();
  const disabledEvent = enter();
  element.dispatchEvent(disabledEvent);
  assert.equal(disabledEvent.defaultPrevented, false);
  setDisabled(false);
  flush();
  const reenabledEvent = enter();
  element.dispatchEvent(reenabledEvent);
  assert.equal(reenabledEvent.defaultPrevented, true);
  dispose();
  host.remove();
});
