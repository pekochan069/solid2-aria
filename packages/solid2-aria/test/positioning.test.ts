import { test } from "bun:test";
import assert from "node:assert/strict";

import { calculatePositionInternal } from "../src/overlays/calculate-position";
import type { Placement } from "../src/overlays/create-overlay-position";

function position(
  options: {
    placement?: Placement;
    top?: number;
    left?: number;
    flip?: boolean;
  } = {}
) {
  const boundary = {
    height: 400,
    left: 0,
    scroll: { left: 0, top: 0 },
    top: 0,
    totalHeight: 400,
    totalWidth: 500,
    width: 500,
  };

  const viewport = Object.assign(new EventTarget(), {
    height: 400,
    offsetLeft: 0,
    offsetTop: 0,
    onresize: null,
    onscroll: null,
    onscrollend: null,
    pageLeft: 0,
    pageTop: 0,
    scale: 1,
    width: 500,
  });

  return calculatePositionInternal(
    options.placement ?? "bottom",
    {
      height: 20,
      left: options.left ?? 100,
      top: options.top ?? 100,
      width: 80,
    },
    { height: 60, left: 0, top: 0, width: 120 },
    { height: 60, left: 0, top: 0, width: 120 },
    { bottom: 0, left: 0, right: 0, top: 0 },
    10,
    options.flip ?? true,
    boundary,
    boundary,
    { height: 0, left: 0, top: 0, width: 0 },
    8,
    0,
    true,
    undefined,
    0,
    0,
    true,
    viewport
  );
}

test("overlays center below their trigger with the requested gap", () => {
  const result = position();
  assert.equal(result.placement, "bottom");
  assert.equal(result.position.top, 128);
  assert.equal(result.position.left, 80);
  assert.equal(result.maxHeight, 262);
});

test("overlays flip above a trigger when the bottom boundary has insufficient room", () => {
  const result = position({ top: 360 });
  assert.equal(result.placement, "top");
  assert.equal(result.position.bottom, 48);
  assert.equal(result.position.left, 80);
});

test("overlay cross-axis correction respects the boundary padding", () => {
  const result = position({ left: 0 });
  assert.equal(result.position.left, 10);
  assert.equal(result.position.top, 128);
});

test("disabling flipping preserves the requested side", () => {
  const result = position({ flip: false, top: 360 });
  assert.equal(result.placement, "bottom");
  assert.equal(result.position.top, 388);
  assert.equal(result.maxHeight, 2);
});
