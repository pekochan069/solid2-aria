import { expect, test } from "bun:test";

import {
  getOverlayOpacity,
  getSnapPointOffsets,
  selectSnapPoint,
} from "../src/create-snap-points";

test("fractions and pixel snap points follow direction and container dimensions", () => {
  expect(getSnapPointOffsets([0.25, "400px", 1], 800, "bottom")).toEqual([
    600, 400, 0,
  ]);
  expect(getSnapPointOffsets([0.25, "400px", 1], 800, "top")).toEqual([
    -600, -400, -0,
  ]);
  expect(getSnapPointOffsets([0.25, "100px", 1], 400, "left")).toEqual([
    -300, -300, -0,
  ]);
});

test("the overlay fades continuously across its configured boundary", () => {
  expect(getOverlayOpacity([600, 400, 0], 600, 2, 800)).toBe(0);
  expect(getOverlayOpacity([600, 400, 0], 200, 2, 800)).toBe(0.5);
  expect(getOverlayOpacity([600, 400, 0], 0, 2, 800)).toBe(1);
});

test("sequential gestures cannot skip points and non-dismissible gestures stay bounded", () => {
  const options = {
    activeIndex: 0,
    dimension: 800,
    dismissible: true,
    distance: -590,
    offsets: [600, 400, 0],
    sequential: true,
    velocity: 4,
  };

  expect(selectSnapPoint(options)).toBe(1);
  expect(selectSnapPoint({ ...options, sequential: false })).toBe(2);
  expect(
    selectSnapPoint({ ...options, dismissible: false, distance: 100 })
  ).toBe(0);
  expect(selectSnapPoint({ ...options, distance: 100 })).toBe("close");
  expect(selectSnapPoint({ ...options, activeIndex: 2, distance: -10 })).toBe(
    2
  );
});

test("a single snap point fades across the visible drawer when closing", () => {
  expect(getOverlayOpacity([600], 600, 0, 800)).toBe(1);
  expect(getOverlayOpacity([600], 700, 0, 800)).toBe(0.5);
  expect(getOverlayOpacity([600], 800, 0, 800)).toBe(0);
});
