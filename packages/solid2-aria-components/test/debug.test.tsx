import { test, expect } from "bun:test";

import { requireValue } from "@solid2-aria/core/utils/require-value";
import { render } from "@solidjs/web";
import { createSignal, flush } from "solid-js";

import { Input } from "../src/input";
import { TextField } from "../src/text-field";

test("controlled text input keeps its DOM identity and updates its value", () => {
  const [value, setValue] = createSignal("a");
  const host = document.createElement("div");

  const dispose = render(
    () => (
      <TextField
        aria-label="Name"
        value={value()}
        onChange={(nextValue) => {
          setValue(nextValue);
        }}
      >
        <Input />
      </TextField>
    ),
    host
  );

  flush();

  const input = requireValue(
    host.querySelector("input"),
    'Expected host.querySelector("input")'
  );

  expect(input.value).toBe("a");
  setValue("b");
  flush();
  expect(host.querySelector("input")).toBe(input);
  expect(input.value).toBe("b");
  dispose();
});
