import assert from "node:assert/strict";
import { test } from "node:test";

import { LayoutInfo } from "../src/virtualizer/layout-info";
import { Rect } from "../src/virtualizer/rect";
import { captureScrollAnchor } from "../src/virtualizer/scroll-anchor";
import type {
  ScrollAnchorAxis,
  ScrollAnchorEdge,
} from "../src/virtualizer/scroll-anchor";

function axisRect(axis: ScrollAnchorAxis, start: number, extent: number) {
  return axis === "x"
    ? new Rect(start, 0, extent, 100)
    : new Rect(0, start, 100, extent);
}

for (const axis of ["x", "y"] satisfies ScrollAnchorAxis[]) {
  for (const edge of ["start", "end"] satisfies ScrollAnchorEdge[]) {
    void test(`${axis}/${edge} anchoring prefers a visible leading edge and falls back to clipped content`, () => {
      const viewport = axisRect(axis, 100, 100);
      const startCorner = axis === "x" ? "topRight" : "bottomLeft";
      const corner = edge === "end" ? "topLeft" : startCorner;

      const clipped = new LayoutInfo(
        "item",
        "clipped",
        axisRect(axis, edge === "end" ? 80 : 180, 40)
      );

      const visible = new LayoutInfo(
        "item",
        "visible",
        axisRect(axis, edge === "end" ? 130 : 150, 10)
      );

      assert.deepEqual(
        captureScrollAnchor(edge, axis, viewport, [
          [clipped.key, clipped],
          [visible.key, visible],
        ]),
        { corner, key: "visible", offset: edge === "end" ? 30 : 60 }
      );

      const tiny = new LayoutInfo(
        "item",
        "tiny",
        axisRect(axis, edge === "end" ? 102 : 196, 2)
      );

      assert.deepEqual(
        captureScrollAnchor(edge, axis, viewport, [
          [clipped.key, clipped],
          [tiny.key, tiny],
        ]),
        { corner, key: "tiny", offset: edge === "end" ? 2 : 98 }
      );

      const sliver = new LayoutInfo(
        "item",
        "sliver",
        axisRect(axis, edge === "end" ? 60 : 199, 41)
      );

      assert.deepEqual(
        captureScrollAnchor(edge, axis, viewport, [[sliver.key, sliver]]),
        { corner, key: "sliver", offset: edge === "end" ? -40 : 140 }
      );
    });
  }
}
