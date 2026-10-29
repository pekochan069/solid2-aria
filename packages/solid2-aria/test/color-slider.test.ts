import { test } from "bun:test";
import assert from "node:assert/strict";

import { createColorSliderState } from "@solid2-aria/stately/color/create-color-slider-state";
import { createRoot, flush } from "solid-js";

import { createColorSlider } from "../src/color/create-color-slider";

test("color slider announces the color rather than the form field name", () => {
  const result = createRoot((dispose) => {
    const state = createColorSliderState({
      channel: "red",
      defaultValue: "#ff0000",
      locale: "en-US",
    });

    const aria = createColorSlider(
      {
        channel: "red",
        inputRef: () => document.createElement("input"),
        name: "submitted-color-channel",
        trackRef: () => document.createElement("div"),
      },
      state
    );

    return { aria, colorName: state.value.getColorName("en-US"), dispose };
  });

  try {
    flush();
    const text = result.aria.inputProps["aria-valuetext"];
    assert.ok(typeof text === "string");
    assert.ok(text.endsWith(`, ${result.colorName}`));
    assert.equal(text.includes("submitted-color-channel"), false);
  } finally {
    result.dispose();
  }
});
