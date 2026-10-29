import { test } from "bun:test";
import assert from "node:assert/strict";
import { setTimeout as delay } from "node:timers/promises";

import { Item } from "@solid2-aria/stately/collections/item";
import { createListState } from "@solid2-aria/stately/list/create-list-state";
import type { MultipleSelectionManager } from "@solid2-aria/stately/selection/types";
import { createTreeState } from "@solid2-aria/stately/tree/create-tree-state";
import type { KeyboardEvent as AriaKeyboardEvent } from "@solid2-aria/types-shared";
import { render, spread } from "@solidjs/web";
import { createRoot, createSignal, flush } from "solid-js";

import { createHasTabbableChild } from "../src/focus/create-has-tabbable-child";
import { createKeyboard } from "../src/interactions/create-keyboard";
import { createSelectableCollection } from "../src/selection/create-selectable-collection";
import { createSelectableItem } from "../src/selection/create-selectable-item";
import { createTypeSelect } from "../src/selection/create-type-select";
import { createCollectionId } from "../src/selection/utils";
import { createTree } from "../src/tree/create-tree";
import { createTreeItem } from "../src/tree/create-tree-item";
import type { KeyboardEvent as TargetedKeyboardEvent } from "../src/types";
import { noop } from "../src/utils/noop";

function hasKeyboardTarget(
  event: KeyboardEvent
): event is TargetedKeyboardEvent<HTMLElement> {
  return event.currentTarget instanceof HTMLElement;
}

test("keyboard handlers preserve native event fields and read changed props", () => {
  const calls: string[] = [];
  const button = document.createElement("button");
  let disposeRoot = noop;

  const result = createRoot((dispose) => {
    disposeRoot = dispose;
    const [version, update] = createSignal("first");
    const [disabled, setDisabled] = createSignal(false);

    const keyboard = createKeyboard({
      get isDisabled() {
        return disabled();
      },
      get onKeyDown() {
        const initialValue = version();

        return (event: AriaKeyboardEvent) => {
          calls.push(`${initialValue}:${event.key}`);
        };
      },
    });

    return { keyboard, setDisabled, update };
  });

  button.addEventListener("keydown", (event) => {
    if (hasKeyboardTarget(event)) {
      result.keyboard.keyboardProps.onKeyDown?.(event);
    }
  });
  button.dispatchEvent(
    new KeyboardEvent("keydown", { bubbles: true, key: "a" })
  );
  result.update("second");
  flush();
  button.dispatchEvent(
    new KeyboardEvent("keydown", { bubbles: true, key: "b" })
  );
  result.setDisabled(true);
  flush();
  button.dispatchEvent(
    new KeyboardEvent("keydown", { bubbles: true, key: "c" })
  );
  assert.deepEqual(calls, ["first:a", "second:b"]);
  disposeRoot();
});

test("selectable item props track focus, selection, key, and disabled changes", () => {
  const button = document.createElement("button");
  document.body.append(button);
  let disposeRoot = noop;

  const result = createRoot((dispose) => {
    disposeRoot = dispose;
    const [key, updateKey] = createSignal("a");
    const [disabled, setDisabled] = createSignal(false);

    const state = createListState({
      children: [
        Item({ children: "Alpha", key: "a", textValue: "Alpha" }),
        Item({ children: "Beta", key: "b", textValue: "Beta" }),
      ],
      selectionMode: "single",
    });

    createCollectionId(state.collection);

    const item = createSelectableItem({
      get isDisabled() {
        return disabled();
      },
      get key() {
        return key();
      },
      ref: () => button,
      selectionManager: state.selectionManager,
    });

    return { item, setDisabled, state, updateKey };
  });

  flush();
  assert.equal(result.item.itemProps.tabindex, -1);
  result.state.selectionManager.setFocusedKey("a");
  flush();
  assert.equal(result.item.itemProps.tabindex, 0);
  result.updateKey("b");
  flush();
  assert.equal(result.item.itemProps.tabindex, -1);
  assert.equal(result.item.itemProps["data-key"], "b");
  result.state.selectionManager.replaceSelection("b");
  flush();
  assert.equal(result.item.isSelected, true);
  result.setDisabled(true);
  flush();
  assert.equal(result.item.isDisabled, true);
  assert.equal(result.item.itemProps.tabindex, undefined);
  disposeRoot();
  button.remove();
});

test("tabbable child state observes native tabindex changes", async () => {
  const container = document.createElement("div");
  const child = document.createElement("div");
  container.append(child);
  document.body.append(container);
  let disposeRoot = noop;

  const hasTabbableChild = createRoot((dispose) => {
    disposeRoot = dispose;

    return createHasTabbableChild(() => container);
  });

  flush();
  assert.equal(hasTabbableChild(), false);
  child.tabIndex = 0;
  await delay(0);
  flush();
  assert.equal(hasTabbableChild(), true);
  child.tabIndex = -1;
  await delay(0);
  flush();
  assert.equal(hasTabbableChild(), false);
  disposeRoot();
  container.remove();
});

test("tree rows and expansion labels update for a single child", () => {
  const container = document.createElement("div");
  const row = document.createElement("div");
  container.append(row);
  document.body.append(container);
  let disposeRoot = noop;

  const result = createRoot((dispose) => {
    disposeRoot = dispose;

    const state = createTreeState({
      children: Item({
        children: Item({ children: "Child", key: "child" }),
        key: "parent",
        title: "Parent",
      }),
    });

    const tree = createTree({ "aria-label": "Files" }, state, () => container);

    const node = state.collection.getItem("parent");

    if (!node) {
      throw new Error("Missing parent tree node");
    }

    const item = createTreeItem({ node }, state, () => row);

    return { item, state, tree };
  });

  flush();
  const label = result.item.expandButtonProps["aria-label"];
  assert.equal(result.item.rowProps["aria-expanded"], "false");
  result.state.toggleKey("parent");
  flush();
  assert.equal(result.tree.gridProps.role, "treegrid");
  assert.equal(result.item.rowProps["aria-expanded"], "true");
  assert.notEqual(result.item.expandButtonProps["aria-label"], label);
  disposeRoot();
  container.remove();
});

test("collection tabindex follows focus and virtual focus changes", () => {
  const element = document.createElement("div");
  document.body.append(element);
  let disposeRoot = noop;

  const result = createRoot((dispose) => {
    disposeRoot = dispose;
    const [virtual, setVirtual] = createSignal(false);

    const state = createListState({
      children: [Item({ children: "Alpha", key: "a", textValue: "Alpha" })],
      selectionMode: "single",
    });

    const collection = createSelectableCollection({
      keyboardDelegate: {
        getFirstKey() {
          return "a";
        },
        getLastKey() {
          return "a";
        },
      },
      ref: () => element,
      selectionManager: state.selectionManager,
      get shouldUseVirtualFocus() {
        return virtual();
      },
    });

    return { collection, setVirtual, state };
  });

  flush();
  assert.equal(result.collection.collectionProps.tabindex, 0);
  result.state.selectionManager.setFocusedKey("a");
  flush();
  assert.equal(result.collection.collectionProps.tabindex, -1);
  result.setVirtual(true);
  flush();
  assert.equal(result.collection.collectionProps.tabindex, undefined);
  disposeRoot();
  element.remove();
});

test("collection focus follows native descendant focus transitions", () => {
  const container = document.createElement("div");
  const first = document.createElement("button");
  const second = document.createElement("button");
  const outside = document.createElement("button");
  container.append(first, second);
  const host = document.createElement("div");
  document.body.append(host, outside);
  let manager: MultipleSelectionManager | undefined;

  const dispose = render(() => {
    const list = createListState({
      children: [Item({ children: "Alpha", key: "a", textValue: "Alpha" })],
      selectionMode: "single",
    });

    const aria = createSelectableCollection({
      keyboardDelegate: {},
      ref: () => container,
      selectionManager: list.selectionManager,
      shouldUseVirtualFocus: true,
    });

    spread(container, () => aria.collectionProps);

    manager = list.selectionManager;

    return container;
  }, host);

  flush();
  assert.ok(manager);
  first.focus();
  flush();
  assert.equal(manager.isFocused, true);
  second.focus();
  flush();
  assert.equal(manager.isFocused, true);
  outside.focus();
  flush();
  assert.equal(manager.isFocused, false);
  dispose();
  host.remove();
  outside.remove();
});

test("typeahead captures spaces before descendant selection handlers", () => {
  const container = document.createElement("div");
  const button = document.createElement("button");
  container.append(button);
  const [disabled, setDisabled] = createSignal(false);
  const searches: string[] = [];
  const descendantKeys: string[] = [];
  const host = document.createElement("div");
  document.body.append(host);

  const dispose = render(() => {
    const state = createListState({
      children: [Item({ children: "Alpha", key: "a", textValue: "Alpha" })],
      selectionMode: "single",
    });

    const aria = createTypeSelect(
      {
        get isDisabled() {
          return disabled();
        },
        keyboardDelegate: {
          getKeyForSearch(search) {
            searches.push(search);

            return "a";
          },
        },
        selectionManager: state.selectionManager,
      },
      () => container
    );

    spread(container, () => aria.typeSelectProps);

    return container;
  }, host);

  button.addEventListener("keydown", (event) => {
    descendantKeys.push(event.key);
  });
  flush();
  button.dispatchEvent(
    new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "a" })
  );
  button.dispatchEvent(
    new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: " " })
  );
  assert.deepEqual(searches, ["a", "a "]);
  assert.deepEqual(descendantKeys, ["a"]);
  setDisabled(true);
  flush();
  button.dispatchEvent(
    new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: " " })
  );
  assert.deepEqual(searches, ["a", "a "]);
  assert.deepEqual(descendantKeys, ["a", " "]);
  setDisabled(false);
  flush();
  button.dispatchEvent(
    new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "b" })
  );
  assert.deepEqual(searches, ["a", "a ", "b"]);
  dispose();
  button.dispatchEvent(
    new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: " " })
  );
  assert.deepEqual(descendantKeys, ["a", " ", "b", " "]);
  host.remove();
});

test("native double clicks invoke a selectable item's secondary action", () => {
  const host = document.createElement("div");
  document.body.append(host);
  let actions = 0;

  const dispose = render(() => {
    const element = document.createElement("button");

    const state = createListState({
      children: [Item({ children: "Alpha", key: "a", textValue: "Alpha" })],
      selectionBehavior: "replace",
      selectionMode: "single",
    });

    createCollectionId(state.collection);

    const aria = createSelectableItem({
      key: "a",
      onAction: () => {
        actions += 1;
      },
      ref: () => element,
      selectionManager: state.selectionManager,
    });

    spread(element, () => aria.itemProps);

    return element;
  }, host);

  flush();
  const element = host.querySelector("button");
  assert.ok(element);
  element.dispatchEvent(
    new PointerEvent("pointerdown", {
      bubbles: true,
      button: 0,
      pointerId: 1,
      pointerType: "mouse",
    })
  );
  element.dispatchEvent(
    new PointerEvent("pointerup", {
      bubbles: true,
      button: 0,
      pointerId: 1,
      pointerType: "mouse",
    })
  );
  element.dispatchEvent(
    new MouseEvent("dblclick", { bubbles: true, cancelable: true, detail: 2 })
  );
  assert.equal(actions, 1);
  dispose();
  host.remove();
});
