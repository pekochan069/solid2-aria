import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import { createRoot, createSignal, flush } from "solid-js";

import { createColor } from "../src/color/create-color";
import { createColorAreaState } from "../src/color/create-color-area-state";
import { createColorChannelFieldState } from "../src/color/create-color-channel-field-state";
import { createColorFieldState } from "../src/color/create-color-field-state";
import { createColorPickerState } from "../src/color/create-color-picker-state";
import { createColorSliderState } from "../src/color/create-color-slider-state";
import { createColorWheelState } from "../src/color/create-color-wheel-state";
import type { Color } from "../src/color/types";

const disposers: (() => void)[] = [];

function setup<T>(fn: () => T): T {
  return createRoot((dispose) => {
    disposers.push(dispose);

    return fn();
  });
}

afterEach(() => {
  for (const dispose of disposers.splice(0)) {
    dispose();
  }
});

void test("createColor reparses reactive input and handles invalid and empty values", () => {
  const [input, setInput] = setup(() => createSignal<string | null>("#f00"));
  const color = setup(() => createColor(input));
  assert.equal(color()?.toString("hex"), "#FF0000");
  setInput("#00f");
  flush();
  assert.equal(color()?.toString("hex"), "#0000FF");
  setInput("invalid");
  flush();
  assert.equal(color(), undefined);
  setInput(null);
  flush();
  assert.equal(color(), null);
});

void test("area converts spaces, snaps points, and reports the latest drag before flush", () => {
  const ends: Color[] = [];

  const state = setup(() =>
    createColorAreaState({
      colorSpace: "hsb",
      defaultValue: "#f00",
      onChangeEnd: (v) => {
        ends.push(v);
      },
      xChannel: "saturation",
      yChannel: "brightness",
    })
  );

  assert.equal(state.value.getColorSpace(), "hsb");
  state.setDragging(true);
  state.setColorFromPoint(0.254, 0.206);
  state.setDragging(false);
  assert.equal(ends[0]?.getChannelValue("saturation"), 25);
  assert.equal(ends[0]?.getChannelValue("brightness"), 79);
  flush();
  assert.equal(state.xValue, 25);
  assert.equal(state.yValue, 79);
  state.incrementX();
  flush();
  assert.equal(state.xValue, 26);
  assert.equal(state.defaultValue.toString("hex"), "#FF0000");
});

void test("wheel wraps hue and reports the final value", () => {
  const ends: Color[] = [];

  const state = setup(() =>
    createColorWheelState({
      onChangeEnd: (v) => {
        ends.push(v);
      },
    })
  );

  state.decrement();
  flush();
  assert.equal(state.hue, 359);
  state.increment();
  flush();
  assert.equal(state.hue, 0);
  state.setDragging(true);
  state.setHueFromPoint(0, 50, 50);
  state.setDragging(false);
  assert.equal(ends[0]?.getChannelValue("hue"), 90);
  flush();
  assert.equal(state.hue, 90);
  assert.ok(Math.abs(state.getThumbPosition(50).y - 50) < 0.005);
});

void test("picker stays controlled until props change and observes prop changes", () => {
  const [value, setValue] = setup(() => createSignal("#f00"));
  const changes: string[] = [];

  const state = setup(() =>
    createColorPickerState({
      onChange: (v) => {
        changes.push(v.toString("hex"));
      },
      get value() {
        return value();
      },
    })
  );

  const blue = setup(() => createColor("#00f"))();

  if (!blue) {
    throw new Error("Missing color");
  }

  state.setColor(blue);
  flush();
  assert.deepEqual(changes, ["#0000FF"]);
  assert.equal(state.color.toString("hex"), "#FF0000");
  setValue("#0f0");
  flush();
  assert.equal(state.color.toString("hex"), "#00FF00");
  state.setColor(null);
  assert.equal(changes.length, 1);
});

void test("slider clamps channels and preserves drag value before flush", () => {
  const ends: Color[] = [];

  const state = setup(() =>
    createColorSliderState({
      channel: "green",
      defaultValue: "#f00",
      locale: "en-US",
      onChangeEnd: (v) => {
        ends.push(v);
      },
    })
  );

  state.setThumbDragging(0, true);
  state.setThumbValue(0, 300);
  state.setThumbDragging(0, false);
  assert.equal(ends[0]?.getChannelValue("green"), 255);
  flush();
  assert.deepEqual(state.values, [255]);
  assert.equal(state.value.toString("hex"), "#FFFF00");
  state.decrementThumb(0);
  flush();
  assert.equal(state.getThumbValue(0), 254);
  assert.equal(state.getFormattedValue(), "254");
});

void test("field commits hex, restores invalid text, steps and clears", () => {
  const state = setup(() => createColorFieldState({ defaultValue: "#000000" }));
  state.setInputValue("123abc");
  flush();
  state.commit();
  flush();
  assert.equal(state.colorValue?.toString("hex"), "#123ABC");
  assert.equal(state.inputValue, "#123ABC");
  state.setInputValue("bad-input");
  flush();
  state.commit();
  flush();
  assert.equal(state.inputValue, "#123ABC");
  state.increment();
  flush();
  assert.equal(state.inputValue, "#123ABD");
  state.setInputValue("");
  flush();
  state.commit();
  flush();
  assert.equal(state.colorValue, null);
  assert.equal(state.inputValue, "");
  assert.equal(state.validate("#12fg"), false);
});

void test("field displays native custom errors only after commit", () => {
  const state = setup(() =>
    createColorFieldState({
      defaultValue: "#f00",
      validate: (c) =>
        c?.toString("hex") === "#FF0000" ? "Choose another color" : null,
      validationBehavior: "native",
    })
  );

  assert.deepEqual(state.realtimeValidation.validationErrors, [
    "Choose another color",
  ]);
  assert.equal(state.displayValidation.isInvalid, false);
  state.commitValidation();
  flush();
  assert.equal(state.displayValidation.isInvalid, true);
  state.resetValidation();
  flush();
  assert.equal(state.displayValidation.isInvalid, false);
});

void test("channel field parses localized percent and converts back to color units", () => {
  const state = setup(() =>
    createColorChannelFieldState({
      channel: "saturation",
      colorSpace: "hsl",
      defaultValue: "hsl(0, 50%, 50%)",
      locale: "de-DE",
    })
  );

  assert.equal(state.numberValue, 0.5);
  state.setInputValue("75 %");
  flush();
  state.commit();
  flush();
  assert.equal(state.colorValue.getChannelValue("saturation"), 75);
  state.increment();
  flush();
  assert.equal(state.colorValue.getChannelValue("saturation"), 76);
  state.setInputValue("");
  flush();
  state.commit();
  flush();
  assert.equal(Number.isNaN(state.numberValue), true);
});

void test("reactive channel props update the slider", () => {
  const [channel, setChannel] = setup(() =>
    createSignal<"red" | "green">("red")
  );

  const state = setup(() =>
    createColorSliderState({
      get channel() {
        return channel();
      },
      defaultValue: "#f00",
      locale: "en-US",
    })
  );

  assert.equal(state.getThumbValue(0), 255);
  setChannel("green");
  flush();
  assert.equal(state.getThumbValue(0), 0);
  state.setThumbValue(0, 120);
  flush();
  assert.equal(state.value.getChannelValue("green"), 120);
});

void test("controlled fields emit edits and restore the controlled text until props change", () => {
  const [value, setValue] = setup(() => createSignal<string | null>("#123456"));
  const changes: (string | null)[] = [];

  const state = setup(() =>
    createColorFieldState({
      onChange(v) {
        changes.push(v?.toString("hex") ?? null);
      },
      get value() {
        return value();
      },
    })
  );

  state.setInputValue("abcdef");
  flush();
  state.commit();
  flush();
  assert.deepEqual(changes, ["#ABCDEF"]);
  assert.equal(state.inputValue, "#123456");
  setValue("#abcdef");
  flush();
  assert.equal(state.inputValue, "#ABCDEF");
  state.setInputValue("");
  flush();
  state.commit();
  flush();
  assert.deepEqual(changes, ["#ABCDEF", null]);
  assert.equal(state.inputValue, "#ABCDEF");
  setValue(null);
  flush();
  assert.equal(state.inputValue, "");
});

void test("disabled sliders ignore thumb changes and drag callbacks", () => {
  const ends: Color[] = [];

  const state = setup(() =>
    createColorSliderState({
      channel: "red",
      defaultValue: "#f00",
      isDisabled: true,
      locale: "en-US",
      onChangeEnd(v) {
        ends.push(v);
      },
    })
  );

  state.setThumbDragging(0, true);
  state.setThumbValue(0, 0);
  state.setThumbDragging(0, false);
  flush();
  assert.equal(state.value.toString("hex"), "#FF0000");
  assert.equal(state.isDragging, false);
  assert.equal(ends.length, 0);
});
