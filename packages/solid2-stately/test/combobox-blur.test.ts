import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import { createRoot, flush } from "solid-js";

import { Item } from "../src/collections/item";
import { createComboBoxState } from "../src/combobox/create-combo-box-state";

const disposers: (() => void)[] = [];

afterEach(() => {
  for (const dispose of disposers.splice(0)) {
    dispose();
  }

  flush();
});

void test("read-only combobox focus and blur preserve custom input and selection", () => {
  const changes: (string | number | null)[] = [];

  const state = createRoot((dispose) => {
    disposers.push(dispose);

    return createComboBoxState({
      allowsCustomValue: true,
      children: [Item({ children: "Apple", key: "apple" })],
      defaultValue: "apple",
      inputValue: "Custom display",
      isReadOnly: true,
      menuTrigger: "focus",
      onChange: (value) => {
        changes.push(value);
      },
    });
  });

  flush();

  state.setFocused(true);
  flush();
  assert.equal(state.isFocused, true);
  assert.equal(state.isOpen, false);

  state.setFocused(false);
  flush();
  assert.equal(state.isFocused, false);
  assert.equal(state.inputValue, "Custom display");
  assert.equal(state.value, "apple");
  assert.deepEqual(changes, []);
});

void test("editable combobox blur still commits custom input", () => {
  const changes: (string | number | null)[] = [];

  const state = createRoot((dispose) => {
    disposers.push(dispose);

    return createComboBoxState({
      allowsCustomValue: true,
      children: [Item({ children: "Apple", key: "apple" })],
      defaultValue: "apple",
      inputValue: "Custom display",
      onChange: (value) => {
        changes.push(value);
      },
    });
  });

  flush();
  state.setFocused(true);
  flush();
  state.setFocused(false);
  flush();
  assert.equal(state.value, null);
  assert.deepEqual(changes, [null]);
});
