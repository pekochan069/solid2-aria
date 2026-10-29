import { test } from "bun:test";
import assert from "node:assert/strict";

import { Item } from "@solid2-aria/stately/collections/item";
import { createComboBoxState } from "@solid2-aria/stately/combobox/create-combo-box-state";
import { createSelectState } from "@solid2-aria/stately/select/create-select-state";
import { render } from "@solidjs/web";
import { createSignal, flush } from "solid-js";

import { createComboBox } from "../src/combobox/create-combo-box";
import { HiddenSelect } from "../src/select/hidden-select";
import { requireValue } from "../src/utils/require-value";

const triggerRef = () => null;

test("combobox input follows controlled text and disabled props", () => {
  const host = document.createElement("div");
  document.body.append(host);
  const [text, setText] = createSignal("Alpha");
  const [disabled, setDisabled] = createSignal(false);

  function Combo() {
    const [inputRef, setInputRef] = createSignal<HTMLInputElement | null>(
      null,
      { ownedWrite: true }
    );

    const state = createComboBoxState({
      children: [
        Item({ children: "Alpha", key: "a" }),
        Item({ children: "Beta", key: "b" }),
      ],
      get inputValue() {
        return text();
      },
      onInputChange: (value) => {
        setText(value);
      },
    });

    const aria = createComboBox(
      {
        "aria-label": "Choice",
        inputRef,
        get isDisabled() {
          return disabled();
        },
        listBoxRef: () => null,
        popoverRef: () => null,
      },
      state
    );

    return (
      <input
        {...aria.inputProps}
        ref={(element) => {
          setInputRef(element);
        }}
      />
    );
  }

  const dispose = render(() => <Combo />, host);
  flush();

  const input = requireValue(
    host.querySelector("input"),
    'Expected host.querySelector("input")'
  );

  assert.equal(input.value, "Alpha");
  assert.equal(input.getAttribute("role"), "combobox");
  setText("Beta");
  setDisabled(true);
  flush();
  assert.equal(input.value, "Beta");
  assert.equal(input.disabled, true);
  dispose();
  host.remove();
});

test("hidden native select follows controlled values and form props", () => {
  const host = document.createElement("div");
  document.body.append(host);
  const [value, setValue] = createSignal<string | number | null>("a");
  const [disabled, setDisabled] = createSignal(false);
  const [name, setName] = createSignal("choice");

  const choices = [
    Item({ children: "Alpha", key: "a" }),
    Item({ children: "Beta", key: "b" }),
  ];

  const [items, setItems] = createSignal(choices);

  function Select() {
    const state = createSelectState({
      get children() {
        return items();
      },
      onChange: (nextValue) => {
        setValue(nextValue);
      },
      get value() {
        return value();
      },
    });

    return (
      <HiddenSelect
        state={state}
        triggerRef={triggerRef}
        name={name()}
        isDisabled={disabled()}
        label="Choice"
      />
    );
  }

  const dispose = render(() => <Select />, host);
  flush();

  const select = requireValue(
    host.querySelector("select"),
    'Expected host.querySelector("select")'
  );

  assert.equal(select.value, "a");
  assert.equal(select.name, "choice");
  assert.equal(select.disabled, false);
  setValue("b");
  setDisabled(true);
  setName("updated-choice");
  flush();
  assert.equal(select.value, "b");
  assert.equal(select.name, "updated-choice");
  assert.equal(select.disabled, true);

  setItems([
    ...choices,
    ...Array.from({ length: 299 }, (_, index) =>
      Item({ children: `Extra ${index}`, key: `extra-${index}` })
    ),
  ]);
  flush();
  assert.equal(host.querySelector("select"), null);

  const input = requireValue(
    host.querySelector("input"),
    'Expected host.querySelector("input")'
  );

  assert.equal(input.type, "hidden");
  assert.equal(input.value, "b");
  assert.equal(input.name, "updated-choice");
  assert.equal(input.disabled, true);

  setItems(choices);
  flush();
  assert.equal(host.querySelector("input"), null);
  assert.equal(host.querySelector("select")?.value, "b");
  assert.equal(host.querySelector("select")?.name, "updated-choice");
  assert.equal(host.querySelector("select")?.disabled, true);
  dispose();
  host.remove();
});
