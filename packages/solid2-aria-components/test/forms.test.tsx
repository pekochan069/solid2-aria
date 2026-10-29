import { expect, test } from "bun:test";

import { requireValue } from "@solid2-aria/core/utils/require-value";
import { render } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { untrack, createSignal, flush, Show } from "solid-js";

import { Button } from "../src/button";
import {
  Checkbox,
  CheckboxField,
  CheckboxButton,
  CheckboxGroup,
} from "../src/checkbox";
import { Input } from "../src/input";
import { Label } from "../src/label";
import { RadioGroup, Radio } from "../src/radio-group";
import { SearchField } from "../src/search-field";
import { Switch } from "../src/switch";
import { Text } from "../src/text";
import { TextField } from "../src/text-field";

function mount(view: () => JSX.Element) {
  const host = document.createElement("div");
  document.body.append(host);
  const dispose = render(view, host);
  flush();

  return {
    dispose() {
      dispose();
      host.remove();
      flush();
    },
    host,
  };
}

test("button press, render props, pending and controlled disabled updates", () => {
  let presses = 0;
  const [pending, setPending] = createSignal(false);
  const [disabled, setDisabled] = createSignal(false);

  const app = mount(() => (
    <Button
      isPending={pending()}
      isDisabled={disabled()}
      onPress={() => {
        presses += 1;
      }}
    >
      {(state) => (state.isPending ? "Saving" : "Save")}
    </Button>
  ));

  const button = requireValue(
    app.host.querySelector("button"),
    'Expected app.host.querySelector("button")'
  );

  button.click();
  flush();
  expect(presses).toBe(1);
  setPending(true);
  flush();
  expect(button.textContent).toBe("Saving");
  expect(button.getAttribute("aria-disabled")).toBe("true");
  button.click();
  flush();
  expect(presses).toBe(1);
  setPending(false);
  setDisabled(true);
  flush();
  expect(button.disabled).toBe(true);
  app.dispose();
});

test("text field slots connect label, value, help text and controlled updates", () => {
  const [value, setValue] = createSignal("start");

  const app = mount(() => (
    <TextField
      value={value()}
      onChange={(nextValue) => {
        setValue(nextValue);
      }}
    >
      <Label>Name</Label>
      <Input />
      <Text slot="description">Help</Text>
    </TextField>
  ));

  const input = requireValue(
    app.host.querySelector("input"),
    'Expected app.host.querySelector("input")'
  );

  const label = requireValue(
    app.host.querySelector("label"),
    'Expected app.host.querySelector("label")'
  );

  expect(label.htmlFor).toBe(input.id);
  expect(input.value).toBe("start");
  expect(input.getAttribute("aria-describedby")).toContain(
    requireValue(
      app.host.querySelector("span"),
      'Expected app.host.querySelector("span")'
    ).id
  );
  setValue("next");
  flush();
  expect(input.value).toBe("next");
  input.value = "edited";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  flush();
  expect(untrack(() => value())).toBe("edited");
  app.dispose();
});

test("checkbox, checkbox field and switch expose native checked state", () => {
  const app = mount(() => (
    <>
      <Checkbox>One</Checkbox>
      <CheckboxField>
        <CheckboxButton>Two</CheckboxButton>
      </CheckboxField>
      <Switch>Power</Switch>
    </>
  ));

  const inputs = app.host.querySelectorAll("input");
  expect(inputs.length).toBe(3);
  requireValue(inputs[0], "Expected inputs[0]").click();
  flush();
  expect(requireValue(inputs[0], "Expected inputs[0]").checked).toBe(true);
  expect(
    requireValue(
      app.host.querySelector("label"),
      'Expected app.host.querySelector("label")'
    ).dataset.selected
  ).toBe("");
  requireValue(inputs[1], "Expected inputs[1]").click();
  requireValue(inputs[2], "Expected inputs[2]").click();
  flush();
  expect(requireValue(inputs[1], "Expected inputs[1]").checked).toBe(true);
  expect(
    requireValue(inputs[2], "Expected inputs[2]").getAttribute("role")
  ).toBe("switch");
  expect(requireValue(inputs[2], "Expected inputs[2]").checked).toBe(true);
  app.dispose();
});

test("radio and checkbox groups maintain independent selected values", () => {
  const app = mount(() => (
    <>
      <RadioGroup defaultValue="a">
        <Label>Choice</Label>
        <Radio value="a">A</Radio>
        <Radio value="b">B</Radio>
      </RadioGroup>
      <CheckboxGroup defaultValue={["x"]}>
        <Label>Flags</Label>
        <Checkbox value="x">X</Checkbox>
        <Checkbox value="y">Y</Checkbox>
      </CheckboxGroup>
    </>
  ));

  const inputs = app.host.querySelectorAll("input");
  expect(requireValue(inputs[0], "Expected inputs[0]").checked).toBe(true);
  requireValue(inputs[1], "Expected inputs[1]").click();
  flush();
  expect(requireValue(inputs[0], "Expected inputs[0]").checked).toBe(false);
  expect(requireValue(inputs[1], "Expected inputs[1]").checked).toBe(true);
  expect(requireValue(inputs[2], "Expected inputs[2]").checked).toBe(true);
  requireValue(inputs[3], "Expected inputs[3]").click();
  flush();
  expect(requireValue(inputs[2], "Expected inputs[2]").checked).toBe(true);
  expect(requireValue(inputs[3], "Expected inputs[3]").checked).toBe(true);
  app.dispose();
});

test("search clear button resets the input", () => {
  const app = mount(() => (
    <SearchField defaultValue="query">
      <Label>Search</Label>
      <Input />
      <Button>Clear</Button>
    </SearchField>
  ));

  expect(
    requireValue(
      app.host.querySelector("input"),
      'Expected app.host.querySelector("input")'
    ).value
  ).toBe("query");
  requireValue(
    app.host.querySelector("button"),
    'Expected app.host.querySelector("button")'
  ).click();
  flush();
  expect(
    requireValue(
      app.host.querySelector("input"),
      'Expected app.host.querySelector("input")'
    ).value
  ).toBe("");
  app.dispose();
});

test("conditional labels release their accessibility reference and can mount again", () => {
  const [visible, setVisible] = createSignal(true);

  const view = mount(() => (
    <TextField aria-label="Fallback">
      <Show when={visible()}>
        <Label>Name</Label>
      </Show>
      <Input />
    </TextField>
  ));

  try {
    const input = requireValue(
      view.host.querySelector("input"),
      "Expected input"
    );

    const firstLabel = requireValue(
      view.host.querySelector("label"),
      "Expected label"
    );

    expect(input.getAttribute("aria-labelledby")?.split(" ")).toContain(
      firstLabel.id
    );

    setVisible(false);
    flush();
    expect(view.host.querySelector("label")).toBeNull();
    expect(input.getAttribute("aria-labelledby")).toBeNull();
    expect(input.getAttribute("aria-label")).toBe("Fallback");

    setVisible(true);
    flush();

    const nextLabel = requireValue(
      view.host.querySelector("label"),
      "Expected remounted label"
    );

    expect(input.getAttribute("aria-labelledby")?.split(" ")).toContain(
      nextLabel.id
    );
  } finally {
    view.dispose();
  }
});

test("native form resets preserve unchanged defaults and read changed defaults", () => {
  const [defaultValue, setDefaultValue] = createSignal("First");

  const view = mount(() => (
    <form>
      <TextField aria-label="Name" defaultValue={defaultValue()}>
        <Input />
      </TextField>
      <Checkbox defaultSelected>Enabled</Checkbox>
      <input name="unmanaged" defaultValue="Native" />
    </form>
  ));

  try {
    const form = requireValue(view.host.querySelector("form"), "Expected form");

    const input = requireValue(
      view.host.querySelector<HTMLInputElement>('input[aria-label="Name"]'),
      "Expected text input"
    );

    const checkbox = requireValue(
      view.host.querySelector<HTMLInputElement>('input[type="checkbox"]'),
      "Expected checkbox"
    );

    const native = requireValue(
      view.host.querySelector<HTMLInputElement>('input[name="unmanaged"]'),
      "Expected native input"
    );

    native.value = "Edited";
    form.reset();
    flush();
    expect(input.value).toBe("First");
    expect(checkbox.checked).toBe(true);
    expect(native.value).toBe("Native");
    setDefaultValue("Second");
    flush();
    form.reset();
    flush();
    expect(input.value).toBe("Second");
    form.reset();
    flush();
    expect(input.value).toBe("Second");
  } finally {
    view.dispose();
  }
});

test("radio tab stops follow selection and survive native reset", () => {
  const view = mount(() => (
    <form>
      <RadioGroup aria-label="Choice" defaultValue="a">
        <Radio value="a">First</Radio>
        <Radio value="b">Second</Radio>
      </RadioGroup>
    </form>
  ));

  try {
    const form = requireValue(view.host.querySelector("form"), "Expected form");

    const first = requireValue(
      view.host.querySelector<HTMLInputElement>('input[value="a"]'),
      "Expected first radio"
    );

    const second = requireValue(
      view.host.querySelector<HTMLInputElement>('input[value="b"]'),
      "Expected second radio"
    );

    expect(first.tabIndex).toBe(0);
    expect(second.tabIndex).toBe(-1);
    second.click();
    flush();
    expect(first.tabIndex).toBe(-1);
    expect(second.tabIndex).toBe(0);
    form.reset();
    flush();
    expect(first.checked).toBe(true);
    expect(second.checked).toBe(false);
    form.reset();
    flush();
    expect(first.checked).toBe(true);
  } finally {
    view.dispose();
  }
});
