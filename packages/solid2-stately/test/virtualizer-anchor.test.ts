import assert from "node:assert/strict";
import { test } from "node:test";

import type { Key } from "@solid2-aria/types-shared";

import { ListCollection } from "../src/list/list-collection";
import { Layout } from "../src/virtualizer/layout";
import { LayoutInfo } from "../src/virtualizer/layout-info";
import { Rect } from "../src/virtualizer/rect";
import type {
  ScrollAnchorAxis,
  ScrollAnchorEdge,
} from "../src/virtualizer/scroll-anchor";
import { Size } from "../src/virtualizer/size";
import type { InvalidationContext } from "../src/virtualizer/types";
import { Virtualizer } from "../src/virtualizer/virtualizer";

class ResizableLayout extends Layout<object> {
  readonly axis: ScrollAnchorAxis;
  readonly edge: ScrollAnchorEdge;
  readonly sizes = new Map<Key, number>([
    ["a", 100],
    ["b", 100],
    ["c", 100],
  ]);
  private infos = new Map<Key, LayoutInfo>();
  isEdgeContent: ((key: Key) => boolean) | undefined = (key) =>
    key === [...this.sizes.keys()].at(this.edge === "start" ? 0 : -1);

  constructor(axis: ScrollAnchorAxis, edge: ScrollAnchorEdge) {
    super();
    this.axis = axis;
    this.edge = edge;
  }

  rect(start: number, extent: number): Rect {
    return this.axis === "x"
      ? new Rect(start, 0, extent, 100)
      : new Rect(0, start, 100, extent);
  }

  override update(): void {
    this.infos = new Map();
    let start = 0;

    for (const [key, extent] of this.sizes) {
      this.infos.set(
        key,
        new LayoutInfo("item", key, this.rect(start, extent))
      );
      start += extent;
    }
  }

  override getContentSize(): Size {
    const extent = [...this.sizes.values()].reduce(
      (total, size) => total + size,
      0
    );

    return this.axis === "x" ? new Size(extent, 100) : new Size(100, extent);
  }

  override getVisibleLayoutInfos(rect: Rect): LayoutInfo[] {
    return [...this.infos.values()].filter((info) =>
      info.rect.intersects(rect)
    );
  }

  override getLayoutInfo(key: Key): LayoutInfo | null {
    return this.infos.get(key) ?? null;
  }

  override updateItemSize(key: Key, size: Size): boolean {
    const extent = this.axis === "x" ? size.width : size.height;

    if (this.sizes.get(key) === extent) {
      return false;
    }

    this.sizes.set(key, extent);

    return true;
  }

  override UNSTABLE_getScrollAnchorInfo() {
    return {
      axis: this.axis,
      edge: this.edge,
      isEdgeContent: this.isEdgeContent,
      threshold: 150,
    };
  }
}

function setup(axis: ScrollAnchorAxis, edge: ScrollAnchorEdge = "end") {
  const layout = new ResizableLayout(axis, edge);
  let collection = new ListCollection([]);
  let visibleRect = layout.rect(0, 100);
  let invalidationContext: InvalidationContext = {};
  const targets: number[] = [];

  const virtualizer = new Virtualizer<object, null>({
    collection,
    delegate: {
      invalidate: (context) => {
        invalidationContext = { ...invalidationContext, ...context };
      },
      renderView: () => null,
      setVisibleRect: (rect) => {
        targets.push(rect[axis]);
        visibleRect = rect;
      },
    },
    layout,
  });

  function render(isScrolling = false) {
    virtualizer.render({
      collection,
      invalidationContext,
      isScrolling,
      layout,
      size: new Size(100, 100),
      visibleRect,
    });
    invalidationContext = {};
    virtualizer.render({
      collection,
      invalidationContext,
      isScrolling,
      layout,
      size: new Size(100, 100),
      visibleRect,
    });
  }

  function scrollTo(offset: number) {
    visibleRect = layout.rect(offset, 100);
    render();
    targets.length = 0;
  }

  function resize(key: Key, extent: number) {
    virtualizer.updateItemSize(
      key,
      axis === "x" ? new Size(extent, 100) : new Size(100, extent)
    );
  }

  function append(key: Key, extent: number) {
    layout.sizes.set(key, extent);
    collection = new ListCollection([]);
  }

  render();
  assert.deepEqual(targets, edge === "end" ? [200] : []);
  targets.length = 0;

  return { append, layout, render, resize, scrollTo, targets, virtualizer };
}

for (const axis of ["x", "y"] satisfies ScrollAnchorAxis[]) {
  void test(`${axis} start anchoring follows an edge resize after preserving a middle-item resize`, () => {
    const state = setup(axis, "start");
    state.scrollTo(50);
    state.resize("b", 120);
    state.render();
    assert.deepEqual(state.targets, []);
    assert.equal(state.virtualizer.visibleRect[axis], 50);
    state.resize("a", 120);
    state.render(true);
    assert.deepEqual(state.targets, [0]);
    assert.equal(state.virtualizer.visibleRect[axis], 0);
  });

  void test(`${axis} middle-item resize preserves reading position near the edge`, () => {
    const state = setup(axis);
    state.scrollTo(100);
    state.resize("b", 120);
    state.render();
    assert.deepEqual(state.targets, []);
    assert.equal(state.virtualizer.visibleRect[axis], 100);
  });

  void test(`${axis} an edge resize in a batch follows the edge over the captured anchor`, () => {
    const state = setup(axis);
    state.scrollTo(180);
    state.resize("b", 120);
    state.resize("c", 140);
    state.render();
    assert.deepEqual(state.targets, [260]);
    assert.equal(state.virtualizer.visibleRect[axis], 260);
  });

  void test(`${axis} edge shrink follows the edge while scrolling`, () => {
    const state = setup(axis);
    state.resize("c", 80);
    state.render(true);
    assert.deepEqual(state.targets, [180]);
    assert.equal(state.virtualizer.visibleRect[axis], 180);
  });

  void test(`${axis} appending after a middle-item resize clears the previous resize classification`, () => {
    const state = setup(axis);
    state.scrollTo(100);
    state.resize("b", 120);
    state.render();
    assert.deepEqual(state.targets, []);
    state.append("d", 100);
    state.render();
    assert.deepEqual(state.targets, [320]);
    assert.equal(state.virtualizer.visibleRect[axis], 320);
  });

  void test(`${axis} unchanged edge measurements do not classify a middle-item resize as edge content`, () => {
    const state = setup(axis);
    state.scrollTo(100);
    state.resize("c", 100);
    state.resize("b", 120);
    state.render();
    assert.deepEqual(state.targets, []);
  });

  void test(`${axis} an omitted edge classifier treats all resized items as edge content`, () => {
    const state = setup(axis);
    state.layout.isEdgeContent = undefined;
    state.scrollTo(100);
    state.resize("b", 120);
    state.render();
    assert.deepEqual(state.targets, [220]);
  });

  void test(`${axis} edge resize respects a user who scrolled away`, () => {
    const state = setup(axis);
    state.scrollTo(0);
    state.resize("c", 140);
    state.render(true);
    assert.deepEqual(state.targets, []);
    assert.equal(state.virtualizer.visibleRect[axis], 0);
  });

  void test(`${axis} a later middle-only resize does not retain a previous batch's edge classification`, () => {
    const state = setup(axis);
    state.resize("c", 120);
    state.render();
    assert.deepEqual(state.targets, [220]);
    state.scrollTo(100);
    state.resize("b", 120);
    state.render();
    assert.deepEqual(state.targets, []);
  });
}
