import { test, expect } from "bun:test";

import { render, dynamic } from "@solidjs/web";
import { createSignal, flush } from "solid-js";

import { Button, ButtonContext } from "../src/button";
import { ListBox, ListBoxItem, ListBoxSection } from "../src/list-box";
import { Menu, MenuItem, MenuSection } from "../src/menu";
import { dom } from "../src/utils";

test("class render functions receive the default class and track state", () => {
  const [disabled, setDisabled] = createSignal(false);
  const host = document.createElement("div");

  const dispose = render(
    () => (
      <Button
        isDisabled={disabled()}
        class={({ defaultClass, isDisabled }) => [
          defaultClass,
          "custom",
          { disabled: isDisabled },
        ]}
      >
        Save
      </Button>
    ),
    host
  );

  try {
    flush();
    const button = host.querySelector("button");
    expect(button?.getAttribute("class")).toBe("solid2-aria-Button custom");
    setDisabled(true);
    flush();
    expect(button?.getAttribute("class")).toBe(
      "solid2-aria-Button custom disabled"
    );
  } finally {
    dispose();
  }
});

test("context and local class values merge and stay reactive", () => {
  const [active, setActive] = createSignal(false);
  const host = document.createElement("div");

  const dispose = render(
    () => (
      <ButtonContext value={{ class: ["context", { themed: true }] }}>
        <Button class={["local", { active: active() }]}>Save</Button>
      </ButtonContext>
    ),
    host
  );

  try {
    flush();
    const button = host.querySelector("button");
    expect(button?.getAttribute("class")).toBe("context themed local");
    setActive(true);
    flush();
    expect(button?.getAttribute("class")).toBe("context themed local active");
  } finally {
    dispose();
  }
});

test("collection sections accept array and object class values", () => {
  const host = document.createElement("div");
  document.body.append(host);

  const dispose = render(
    () => (
      <>
        <ListBox aria-label="Choices">
          <ListBoxSection
            aria-label="Group"
            class={["choices", { grouped: true }]}
          >
            <ListBoxItem id="choice">Choice</ListBoxItem>
          </ListBoxSection>
        </ListBox>
        <Menu aria-label="Actions">
          <MenuSection
            aria-label="Group"
            class={["actions", { grouped: true }]}
          >
            <MenuItem id="save">Save</MenuItem>
          </MenuSection>
        </Menu>
      </>
    ),
    host
  );

  try {
    flush();
    expect(host.querySelector(".choices")?.getAttribute("class")).toBe(
      "choices grouped"
    );
    expect(host.querySelector(".actions")?.getAttribute("class")).toBe(
      "actions grouped"
    );
  } finally {
    dispose();
    host.remove();
  }
});

test("DOM wrapper tracks controlled native properties", () => {
  const [disabled, set] = createSignal(false);
  const host = document.createElement("div");

  const NativeButton = dynamic(() => "button");

  const dispose = render(
    () => (
      <>
        <NativeButton disabled={disabled()} />
        <dom.button disabled={disabled()} />
        <Button isDisabled={disabled()} />
      </>
    ),
    host
  );

  flush();
  const original = [...host.querySelectorAll("button")];
  set(true);
  flush();
  expect(
    [...host.querySelectorAll("button")].map(
      (el, index) => el === original[index]
    )
  ).toEqual([true, true, true]);
  expect([...host.querySelectorAll("button")].map((el) => el.disabled)).toEqual(
    [true, true, true]
  );
  dispose();
});

test("native callback arrays compose contextual and local refs", () => {
  const host = document.createElement("div");
  const events: string[] = [];
  let button: HTMLButtonElement | undefined;

  const dispose = render(
    () => (
      <ButtonContext
        value={{
          ref(element) {
            expect(element.localName).toBe("button");
            events.push("context mount");
          },
        }}
      >
        <Button
          ref={[
            (element) => {
              button = element;
              events.push("local mount");
            },
          ]}
        >
          Save
        </Button>
      </ButtonContext>
    ),
    host
  );

  flush();
  expect(button).toBe(host.querySelector("button") ?? undefined);
  expect(events).toEqual(["local mount", "context mount"]);
  dispose();
  expect(events).toEqual(["local mount", "context mount"]);
});

test("render overrides can derive content from changing component state", () => {
  const [disabled, setDisabled] = createSignal(false);
  const host = document.createElement("div");

  const dispose = render(
    () => (
      <Button
        isDisabled={disabled()}
        render={(nativeProps, state) => {
          const label = state.isDisabled ? "Disabled" : "Enabled";

          return <button {...nativeProps}>{label}</button>;
        }}
      />
    ),
    host
  );

  try {
    flush();
    expect(host.textContent).toBe("Enabled");
    setDisabled(true);
    flush();
    expect(host.textContent).toBe("Disabled");
    expect(host.querySelector("button")?.disabled).toBe(true);
  } finally {
    dispose();
  }
});
