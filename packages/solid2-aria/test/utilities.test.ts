import { test } from "bun:test";
import assert from "node:assert/strict";

import { createFormValidationState } from "@solid2-aria/stately/form/create-form-validation-state";
import {
  createEffect,
  createRenderEffect,
  createRoot,
  createSignal,
  flush,
} from "solid-js";

import { createFormValidation } from "../src/form/create-form-validation";
import { createDescription } from "../src/utils/create-description";
import { createEvent } from "../src/utils/create-event";
import { createFormReset } from "../src/utils/create-form-reset";
import {
  createId,
  createSlotId,
  idsUpdaterMap,
  mergeIds,
} from "../src/utils/create-id";
import { createValueEffect } from "../src/utils/create-value-effect";
import { filterDOMProps } from "../src/utils/filter-dom-props";
import { mergeProps } from "../src/utils/merge-props";
import { noop } from "../src/utils/noop";
import { isTruthy } from "../src/utils/truthy";

test("descriptions share matching text, update reactively, and remove the final reference", () => {
  let firstDispose = noop;
  let secondDispose = noop;

  const first = createRoot((dispose) => {
    firstDispose = dispose;
    const [text, update] = createSignal("Shared description");

    return { props: createDescription(text), update };
  });

  const second = createRoot((dispose) => {
    secondDispose = dispose;

    return createDescription("Shared description");
  });

  flush();
  const sharedId = second["aria-describedby"];
  assert.equal(typeof sharedId, "string");
  assert.equal(first.props["aria-describedby"], sharedId);
  assert.equal(
    document.getElementById(String(sharedId))?.textContent,
    "Shared description"
  );
  first.update("Changed description");
  flush();
  assert.notEqual(first.props["aria-describedby"], sharedId);
  assert.equal(
    document.getElementById(String(sharedId))?.textContent,
    "Shared description"
  );
  const changedId = first.props["aria-describedby"];
  assert.equal(
    document.getElementById(String(changedId))?.textContent,
    "Changed description"
  );
  firstDispose();
  assert.equal(document.getElementById(String(changedId)), null);
  secondDispose();
  assert.equal(document.getElementById(String(sharedId)), null);
});

test("merged IDs propagate to their owners and dispose their registry entries", () => {
  let disposeRoot = noop;

  const [first, second] = createRoot((dispose) => {
    disposeRoot = dispose;

    return [createId("first-test-id"), createId("second-test-id")];
  });

  if (!isTruthy(first) || !isTruthy(second)) {
    throw new Error("Missing generated ID");
  }

  flush();
  assert.equal(mergeIds(first(), second()), "second-test-id");
  flush();
  assert.equal(first(), second());
  disposeRoot();
  assert.equal(idsUpdaterMap.has("first-test-id"), false);
  assert.equal(idsUpdaterMap.has("second-test-id"), false);
});

test("slot IDs resolve only when the matching element mounts", () => {
  let disposeRoot = noop;
  const node = document.createElement("span");
  document.body.append(node);

  const slots = createRoot((dispose) => {
    disposeRoot = dispose;
    const present = createSlotId();
    const absent = createSlotId();
    createRenderEffect(present, (value) => {
      node.id = value ?? "";
    });

    return { absent, present };
  });

  flush();
  assert.equal(slots.present(), node.id);
  assert.notEqual(node.id, "");
  assert.equal(slots.absent(), undefined);
  disposeRoot();
  node.remove();
});

test("value generators commit each yielded value and close on disposal", () => {
  const observed: number[] = [];
  let closed = false;
  let disposeRoot = noop;

  const update = createRoot((dispose) => {
    disposeRoot = dispose;
    const [value, setValue] = createValueEffect(0);
    createEffect(value, (committed) => {
      observed.push(committed);
    });

    return setValue;
  });

  flush();
  update(function* yieldedValues() {
    yield 1;
    yield 2;
    yield 3;
  });
  flush();
  assert.deepEqual(observed, [0, 1, 2, 3]);
  update(function* yieldedValues() {
    try {
      yield 4;
      yield 5;
    } finally {
      closed = true;
    }
  });
  disposeRoot();
  flush();
  assert.equal(closed, true);
});

test("merged and filtered props preserve live getters and event chaining", () => {
  let disposeRoot = noop;
  const events: string[] = [];

  const value = createRoot((dispose) => {
    disposeRoot = dispose;
    const [label, update] = createSignal("First");

    const props = {
      get "aria-label"() {
        return label();
      },
      internalOnly: "omitted",
      onClick: () => {
        events.push("first");
      },
    };

    const filtered = filterDOMProps(props, { events: true, labelable: true });

    return {
      props: mergeProps(filtered, {
        onClick: () => {
          events.push("second");
        },
      }),
      update,
    };
  });

  assert.equal(value.props["aria-label"], "First");
  assert.equal("internalOnly" in value.props, false);
  value.update("Second");
  flush();
  assert.equal(value.props["aria-label"], "Second");
  const button = document.createElement("button");

  function isButtonEvent(
    event: MouseEvent
  ): event is MouseEvent & { readonly currentTarget: HTMLButtonElement } {
    return event.currentTarget === button;
  }

  button.addEventListener("click", (event) => {
    if (isButtonEvent(event)) {
      value.props.onClick?.(event);
    }
  });
  button.click();
  assert.deepEqual(events, ["first", "second"]);
  disposeRoot();
});

test("capture handlers run before bubbling handlers and dispose with the owner", () => {
  const events: string[] = [];
  const button = document.createElement("button");
  let disposeRoot = noop;

  createRoot((dispose) => {
    disposeRoot = dispose;

    createEvent(
      () => button,
      "keydown",
      () => {
        events.push("capture");
      },
      { capture: true }
    );
  });
  flush();

  const bubble = () => {
    events.push("bubble");
  };

  button.addEventListener("keydown", bubble);
  button.dispatchEvent(
    new KeyboardEvent("keydown", { bubbles: true, key: "Escape" })
  );
  assert.deepEqual(events, ["capture", "bubble"]);
  disposeRoot();
  button.dispatchEvent(
    new KeyboardEvent("keydown", { bubbles: true, key: "Escape" })
  );
  assert.deepEqual(events, ["capture", "bubble", "bubble"]);
  button.removeEventListener("keydown", bubble);
});

test("event listeners follow a native element accessor and detach on disposal", () => {
  const first = document.createElement("button");
  const second = document.createElement("button");
  let calls = 0;
  let disposeRoot = noop;

  const setElement = createRoot((dispose) => {
    disposeRoot = dispose;
    const [element, update] = createSignal<HTMLButtonElement | null>(first);
    createEvent(element, "click", () => {
      calls += 1;
    });

    return update;
  });

  flush();
  first.click();
  assert.equal(calls, 1);
  setElement(second);
  flush();
  first.click();
  assert.equal(calls, 1);
  second.click();
  assert.equal(calls, 2);
  disposeRoot();
  second.click();
  assert.equal(calls, 2);
});

test("form reset reads the current default value and releases its listener", () => {
  const form = document.createElement("form");
  const input = document.createElement("input");
  form.append(input);
  document.body.append(form);
  const values: string[] = [];
  let dispose = noop;

  const setDefault = createRoot((cleanup) => {
    dispose = cleanup;
    const [defaultValue, setDefaultValue] = createSignal("first");
    createFormReset(
      () => input,
      defaultValue,
      (value) => {
        values.push(value);
      }
    );

    return setDefaultValue;
  });

  try {
    flush();
    form.reset();
    setDefault("second");
    flush();
    form.reset();
    assert.deepEqual(values, ["first", "second"]);
    dispose();
    form.reset();
    assert.deepEqual(values, ["first", "second"]);
  } finally {
    dispose();
    form.remove();
  }
});

test("programmatic form reset clears validation without replacing the native reset method", () => {
  const form = document.createElement("form");
  const input = document.createElement("input");
  form.append(input);
  document.body.append(form);
  const nativeReset = Object.getOwnPropertyDescriptor(form, "reset");
  let dispose = noop;

  const state = createRoot((cleanup) => {
    dispose = cleanup;

    const validation = createFormValidationState({
      validate: () => "Invalid value",
      validationBehavior: "native",
      value: "invalid",
    });

    createFormValidation(
      { validationBehavior: "native" },
      validation,
      () => input
    );

    return validation;
  });

  try {
    flush();
    state.commitValidation();
    flush();
    assert.equal(state.displayValidation.isInvalid, true);
    assert.deepEqual(
      Object.getOwnPropertyDescriptor(form, "reset"),
      nativeReset
    );
    form.reset();
    flush();
    assert.equal(state.displayValidation.isInvalid, false);
  } finally {
    dispose();
    form.remove();
  }
});
