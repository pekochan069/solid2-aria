/* oxlint-disable typescript/no-deprecated -- Exercise upstream selection compatibility APIs alongside the value API. */

import assert from "node:assert/strict";
import { test, afterEach } from "node:test";
import { setTimeout as delay } from "node:timers/promises";

import { createRoot, createSignal, flush } from "solid-js";

import { Item } from "../src/collections/item";
import { enableTableNestedRows } from "../src/flags/flags";
import { GridLayout } from "../src/layout/grid-layout";
import { ListLayout } from "../src/layout/list-layout";
import { TableLayout } from "../src/layout/table-layout";
import { WaterfallLayout } from "../src/layout/waterfall-layout";
import { createSingleSelectListState } from "../src/list/create-single-select-list-state";
import { createMenuTriggerState } from "../src/menu/create-menu-trigger-state";
import { createSubmenuTriggerState } from "../src/menu/create-submenu-trigger-state";
import { createRadioGroupState } from "../src/radio/create-radio-group-state";
import { createSearchFieldState } from "../src/searchfield/create-search-field-state";
import { createSelectState } from "../src/select/create-select-state";
import { createStepListState } from "../src/steplist/create-step-list-state";
import { Cell } from "../src/table/cell";
import { Column } from "../src/table/column";
import { createTableColumnResizeState } from "../src/table/create-table-column-resize-state";
import { createTableState } from "../src/table/create-table-state";
import { UNSTABLE_createTreeGridState } from "../src/table/create-tree-grid-state";
import { Row } from "../src/table/row";
import { TableBody } from "../src/table/table-body";
import { TableHeader } from "../src/table/table-header";
import { createTabListState } from "../src/tabs/create-tab-list-state";
import {
  ToastQueue,
  createToastQueue,
  createToastState,
} from "../src/toast/create-toast-state";
import { createToggleGroupState } from "../src/toggle/create-toggle-group-state";
import { createToggleState } from "../src/toggle/create-toggle-state";
import { createTokenFieldState } from "../src/tokenfield/create-token-field-state";
import { TokenFieldValue } from "../src/tokenfield/token-field-value";
import { createTooltipTriggerState } from "../src/tooltip/create-tooltip-trigger-state";
import { createTreeState } from "../src/tree/create-tree-state";
import { createVirtualizerState } from "../src/virtualizer/create-virtualizer-state";
import { Rect } from "../src/virtualizer/rect";

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

  flush();
});

void test("grid and waterfall layouts accept empty collections", () => {
  const list = setup(() =>
    createSingleSelectListState({ children: renderItem, items: [] })
  );

  for (const layout of [
    new GridLayout<(typeof items)[number]>(),
    new WaterfallLayout<(typeof items)[number]>(),
  ]) {
    const state = setup(() =>
      createVirtualizerState({
        collection: list.collection,
        layout,
        onVisibleRectChange: () => {},
        renderView: (_type, content) => content,
      })
    );

    state.setVisibleRect(new Rect(0, 0, 500, 300));
    flush();
    assert.equal(state.visibleViews.length, 0);
    assert.equal(layout.getContentSize().height, 0);
  }
});

void test("empty token values have a valid line boundary and slice", () => {
  const value = new TokenFieldValue([]);

  assert.deepEqual(
    value.findLineBoundary(
      { index: 0, offset: 0 },
      TokenFieldValue.Direction.Forward
    ),
    { index: 0, offset: 0 }
  );
  assert.equal(
    value.slice({ index: 0, offset: 0 }, { index: 5, offset: 10 }).toString(),
    ""
  );
});

void test("select values retain zero and empty string keys", () => {
  for (const key of [0, ""]) {
    const state = setup(() =>
      createSelectState({
        children: [Item({ children: "Selected", key })],
        value: key,
      })
    );

    assert.equal(state.value, key);
    assert.equal(state.selectedItems[0]?.key, key);
  }
});

const items = [
  { id: "a", name: "Alpha" },
  { id: "b", name: "Beta" },
  { id: "c", name: "Gamma" },
];

function renderItem(item: { id: string; name: string }) {
  return Item({ children: item.name, key: item.id });
}

function tableChildren() {
  // SAFETY: the two descriptors form the required header/body tuple.
  return [
    TableHeader({
      children: [
        Column({
          children: "Name",
          defaultWidth: 100,
          isRowHeader: true,
          key: "name",
        }),
        Column({ children: "Value", defaultWidth: 200, key: "value" }),
      ],
    }),
    TableBody({
      children: (item) =>
        Row({
          children: [
            Cell({ children: item.name }),
            Cell({ children: item.id }),
          ],
          key: item.id,
        }),
      items,
    }),
  ] as [ReturnType<typeof TableHeader>, ReturnType<typeof TableBody>];
}

void test("toggle, group, search and radio keep reactive controlled and readonly props", () => {
  const [locked, setLocked] = setup(() => createSignal(false));
  const changes: boolean[] = [];

  const toggle = setup(() =>
    createToggleState({
      get isReadOnly() {
        return locked();
      },
      onChange: (v) => {
        changes.push(v);
      },
    })
  );

  toggle.toggle();
  toggle.toggle();
  flush();
  assert.equal(toggle.isSelected, false);
  assert.deepEqual(changes, [true, false]);
  setLocked(true);
  flush();
  toggle.setSelected(true);
  flush();
  assert.equal(toggle.isSelected, false);

  const group = setup(() =>
    createToggleGroupState({
      defaultSelectedKeys: ["a"],
      disallowEmptySelection: true,
      selectionMode: "multiple",
    })
  );

  group.toggleKey("b");
  group.toggleKey("c");
  flush();
  assert.deepEqual([...group.selectedKeys], ["a", "b", "c"]);
  const [text, setText] = setup(() => createSignal("first"));

  const search = setup(() =>
    createSearchFieldState({
      get value() {
        return text();
      },
    })
  );

  search.setValue("ignored");
  flush();
  assert.equal(search.value, "first");
  setText("next");
  flush();
  assert.equal(search.value, "next");

  const radio = setup(() =>
    createRadioGroupState({
      defaultValue: "a",
      get isDisabled() {
        return locked();
      },
    })
  );

  radio.setSelectedValue("b");
  flush();
  assert.equal(radio.selectedValue, "a");
  setLocked(false);
  flush();
  radio.setSelectedValue("b");
  flush();
  assert.equal(radio.selectedValue, "b");
});

void test("single lists and select retain collection and controlled selection reactivity", () => {
  const [rows, setRows] = setup(() => createSignal(items));
  const [key, setKey] = setup(() => createSignal<string | null>("a"));
  const selected: (string | number | null)[] = [];

  const list = setup(() =>
    createSingleSelectListState({
      children: renderItem,
      get items() {
        return rows();
      },
      onSelectionChange: (k) => {
        selected.push(k);
      },
      get selectedKey() {
        return key();
      },
    })
  );

  list.selectionManager.replaceSelection("b");
  flush();
  assert.equal(list.selectedKey, "a");
  assert.deepEqual(selected, ["b"]);
  setKey("b");
  flush();
  assert.equal(list.selectedItem?.textValue, "Beta");
  setRows(items.filter((item) => item.id === "b"));
  flush();
  assert.equal(list.collection.size, 1);

  const select = setup(() =>
    createSelectState({ children: renderItem, defaultSelectedKey: "a", items })
  );

  select.open("first");
  flush();
  assert.equal(select.isOpen, true);
  select.selectionManager.replaceSelection("b");
  flush();
  assert.equal(select.value, "b");
  assert.equal(select.isOpen, false);
  assert.equal(select.selectedItem?.textValue, "Beta");

  const multi = setup(() =>
    createSelectState({
      children: renderItem,
      items,
      selectionMode: "multiple",
    })
  );

  multi.selectionManager.toggleSelection("a");
  flush();
  assert.deepEqual(multi.value, ["a"]);
});

void test("menus coordinate nested submenu expansion and close all", () => {
  const menu = setup(() => createMenuTriggerState({}));
  const sub = setup(() => createSubmenuTriggerState({ triggerKey: "a" }, menu));
  menu.open("first");
  sub.open("last");
  flush();
  assert.equal(menu.isOpen, true);
  assert.equal(sub.isOpen, true);
  assert.equal(sub.focusStrategy, "last");
  sub.closeAll();
  flush();
  assert.equal(menu.isOpen, false);
  assert.equal(sub.isOpen, false);
});

void test("tabs and steps select defaults and recover from collection removal", () => {
  const [rows, setRows] = setup(() => createSignal(items));

  const tabs = setup(() =>
    createTabListState({
      children: renderItem,
      disabledKeys: ["a"],
      get items() {
        return rows();
      },
    })
  );

  flush();
  assert.equal(tabs.selectedKey, "b");
  tabs.setSelectedKey("c");
  flush();
  assert.equal(tabs.selectedKey, "c");
  setRows(items.slice(0, 2));
  flush();
  assert.equal(tabs.selectedKey, "b");

  const steps = setup(() =>
    createStepListState({ children: renderItem, items })
  );

  flush();
  assert.equal(steps.selectedKey, "a");
  assert.equal(steps.isSelectable("b"), false);
  steps.setLastCompletedStep("a");
  flush();
  assert.equal(steps.isSelectable("b"), true);
  assert.equal(steps.lastCompletedStep, "a");
});

void test("tree expansion rebuilds visible nodes and collapsed focus is cleared", () => {
  const tree = setup(() =>
    createTreeState({
      children: [
        Item({
          children: [Item({ children: "Child", key: "child" })],
          key: "parent",
          title: "Parent",
        }),
      ],
    })
  );

  assert.equal(tree.collection.size, 1);
  tree.toggleKey("parent");
  flush();
  assert.equal(tree.collection.size, 2);
  tree.selectionManager.setFocusedKey("child");
  flush();
  tree.toggleKey("parent");
  flush();
  assert.equal(tree.collection.size, 1);
  assert.equal(tree.selectionManager.focusedKey, null);
});

void test("table descriptors build rows and column resize follows viewport and collection changes", () => {
  const table = setup(() =>
    createTableState({ children: tableChildren(), selectionMode: "single" })
  );

  assert.equal(table.collection.size, 3);
  assert.equal(table.collection.columns.length, 2);
  assert.equal([...(table.collection.getChildren?.("a") ?? [])].length, 2);
  const [width, setWidth] = setup(() => createSignal(300));

  const resize = setup(() =>
    createTableColumnResizeState(
      {
        get tableWidth() {
          return width();
        },
      },
      table
    )
  );

  assert.equal(resize.columnWidths.get("name"), 100);
  assert.equal(resize.columnWidths.get("value"), 200);
  resize.startResize("name");
  resize.updateResizedColumns("name", 140);
  flush();
  assert.equal(resize.resizingColumn, "name");
  assert.equal(resize.columnWidths.get("name"), 140);
  resize.endResize();
  setWidth(400);
  flush();
  assert.equal(resize.resizingColumn, null);
  const layout = new TableLayout();
  assert.ok(layout instanceof TableLayout);
});

void test("tree grid uses table descriptors and expanded child rows", () => {
  enableTableNestedRows();

  // SAFETY: the two descriptors form the required header/body tuple.
  const children = [
    TableHeader({
      children: Column({ children: "Name", isRowHeader: true, key: "name" }),
    }),
    TableBody({
      children: Row({
        children: [
          Cell({ children: "Parent" }),
          Row({ children: Cell({ children: "Child" }), key: "child" }),
        ],
        key: "parent",
      }),
    }),
  ] as [ReturnType<typeof TableHeader>, ReturnType<typeof TableBody>];

  const tree = setup(() => UNSTABLE_createTreeGridState({ children }));
  assert.equal(tree.collection.size, 1);
  tree.toggleKey("parent");
  flush();
  assert.equal(tree.collection.size, 2);
  assert.equal(tree.keyMap.has("child"), true);
});

void test("toast subscribers detach on disposal and timers pause and resume", async () => {
  const queue = new ToastQueue<string>({ maxVisibleToasts: 1 });
  const state = setup(() => createToastQueue(queue));
  const key = state.add("first", { timeout: 15 });
  flush();
  assert.equal(state.visibleToasts[0]?.content, "first");
  state.resumeAll();
  state.pauseAll();
  await delay(20);
  assert.equal(queue.visibleToasts.length, 1);
  state.resumeAll();
  await delay(25);
  flush();
  assert.equal(state.visibleToasts.length, 0);
  state.close(key);
  const owned = setup(() => createToastState<string>());
  owned.add("owned");
  flush();
  assert.equal(owned.visibleToasts.length, 1);
});

void test("disposing a warming tooltip prevents delayed opening", async () => {
  const changes: boolean[] = [];
  let dispose: (() => void) | undefined;

  const tooltip = createRoot((d) => {
    dispose = d;

    return createTooltipTriggerState({
      delay: 15,
      onOpenChange: (v) => {
        changes.push(v);
      },
    });
  });

  tooltip.open();
  dispose?.();
  await delay(25);
  flush();
  assert.deepEqual(changes, []);
  const instant = setup(() => createTooltipTriggerState({ delay: 0 }));
  instant.open();
  flush();
  assert.equal(instant.isOpen, true);
  instant.close(true);
  flush();
  assert.equal(instant.isOpen, false);
});

void test("token state composes immutable edits and exposes composition state", () => {
  const value = new TokenFieldValue([{ text: "hello", type: "text" }]);
  const state = setup(() => createTokenFieldState({ defaultValue: value }));
  state.setComposing(true);
  state.setValue((current) => current);
  flush();
  assert.equal(state.isComposing, true);
  assert.equal(state.value, value);
});

void test("virtualizer and layouts produce visible items and content size", () => {
  const list = setup(() =>
    createSingleSelectListState({ children: renderItem, items })
  );

  for (const layout of [
    new ListLayout<(typeof items)[number]>({ rowSize: 30 }),
    new GridLayout<(typeof items)[number]>(),
    new WaterfallLayout<(typeof items)[number]>(),
  ]) {
    const state = setup(() =>
      createVirtualizerState({
        collection: list.collection,
        layout,
        onVisibleRectChange: () => {},
        renderView: (_type, content) => content,
      })
    );

    state.setVisibleRect(new Rect(0, 0, 300, 90));
    flush();
    assert.ok(state.visibleViews.length > 0);
    assert.ok(state.contentSize.height > 0);
    state.startScrolling();
    flush();
    assert.equal(state.isScrolling, true);
    state.endScrolling();
    flush();
    assert.equal(state.isScrolling, false);
  }
});

void test("queued tree toggles and explicit group selection compose before flush", () => {
  const tree = setup(() =>
    createTreeState({
      children: Item({
        children: Item({ children: "Child", key: "child" }),
        key: "parent",
        title: "Parent",
      }),
    })
  );

  tree.toggleKey("parent");
  tree.toggleKey("parent");
  flush();
  assert.equal(tree.collection.size, 1);

  const group = setup(() =>
    createToggleGroupState({ selectionMode: "multiple" })
  );

  group.setSelected("a", true);
  group.setSelected("a", true);
  group.setSelected("b", true);
  flush();
  assert.deepEqual([...group.selectedKeys], ["a", "b"]);
});

void test("toast queue subscriptions are disposed and owned queues follow option changes", () => {
  const queue = new ToastQueue<string>();
  let dispose: (() => void) | undefined;

  const state = createRoot((d) => {
    dispose = d;

    return createToastQueue(queue);
  });

  queue.add("first");
  flush();
  assert.equal(state.visibleToasts.length, 1);
  dispose?.();
  queue.add("second");
  flush();
  assert.equal(state.visibleToasts.length, 1);
  const [limit, setLimit] = setup(() => createSignal(1));

  const owned = setup(() =>
    createToastState<string>({
      get maxVisibleToasts() {
        return limit();
      },
    })
  );

  owned.add("first");
  owned.add("second");
  flush();
  assert.equal(owned.visibleToasts.length, 1);
  setLimit(2);
  flush();
  assert.equal(owned.visibleToasts.length, 0);
  owned.add("third");
  owned.add("fourth");
  flush();
  assert.equal(owned.visibleToasts.length, 2);
});

void test("table collection replacement rebuilds descriptors and recovers focus", () => {
  const [rows, setRows] = setup(() => createSignal(items));

  const table = setup(() =>
    createTableState({
      get children(): [
        ReturnType<typeof TableHeader>,
        ReturnType<typeof TableBody>,
      ] {
        return [
          TableHeader({
            children: Column({
              children: "Name",
              isRowHeader: true,
              key: "name",
            }),
          }),
          TableBody({
            children: (item) =>
              Row({ children: Cell({ children: item.name }), key: item.id }),
            items: rows(),
          }),
        ];
      },
      selectionMode: "single",
    })
  );

  table.selectionManager.setFocusedKey("b");
  flush();
  setRows(items.filter((item) => item.id !== "b"));
  flush();
  assert.equal(table.collection.size, 2);
  assert.equal(table.collection.getItem("b"), null);
  assert.equal(table.selectionManager.focusedKey, "c");
});

void test("nested table column groups retain parent spans across uneven depths", () => {
  const table = setup(() =>
    createTableState({
      children: [
        TableHeader({
          children: [
            Column({
              children: [
                Column({ children: "A", key: "a" }),
                Column({
                  children: Column({ children: "B", key: "b" }),
                  key: "nested",
                  title: "Nested",
                }),
              ],
              key: "group",
              title: "Group",
            }),
            Column({ children: "C", key: "c" }),
          ],
        }),
        TableBody({
          children: Row({
            children: [
              Cell({ children: "a" }),
              Cell({ children: "b" }),
              Cell({ children: "c" }),
            ],
            key: "row",
          }),
        }),
      ],
    })
  );

  assert.equal(table.collection.columns.length, 3);
  assert.equal(table.collection.headerRows.length, 3);
  assert.equal(table.collection.getItem("group")?.colSpan, 2);
});

void test("waterfall item indices are zero based and table layouts retain persisted rows", () => {
  const list = setup(() =>
    createSingleSelectListState({ children: renderItem, items })
  );

  const layout = new WaterfallLayout<(typeof items)[number]>();

  const waterfall = setup(() =>
    createVirtualizerState({
      collection: list.collection,
      layout,
      onVisibleRectChange: () => {},
      renderView: (_type, content) => content,
    })
  );

  waterfall.setVisibleRect(new Rect(0, 0, 500, 300));
  flush();
  assert.ok(waterfall.visibleViews.length > 0);
  const firstInfo = layout.getLayoutInfo("a");
  assert.ok(firstInfo && "index" in firstInfo);
  assert.equal(firstInfo.index, 0);
  const table = setup(() => createTableState({ children: tableChildren() }));
  const tableLayout = new TableLayout<object>();

  const state = setup(() =>
    createVirtualizerState({
      collection: table.collection,
      layout: tableLayout,
      onVisibleRectChange: () => {},
      persistedKeys: new Set(["a", "b"]),
      renderView: (_type, content) => content,
    })
  );

  state.setVisibleRect(new Rect(0, 0, 300, 50));
  flush();
  assert.ok(state.visibleViews.length > 0);
  state.setVisibleRect(new Rect(0, 500, 300, 50));
  flush();
  const pending = [...state.visibleViews];
  const keys = new Set();

  while (pending.length > 0) {
    const view = pending.pop();

    if (view) {
      keys.add(view.content?.key);
      pending.push(...view.children);
    }
  }

  assert.ok(keys.has("a"));
  assert.ok(keys.has("b"));
  const infos = tableLayout.getVisibleLayoutInfos(new Rect(0, 500, 300, 50));

  assert.equal(new Set(infos.map((info) => info.key)).size, infos.length);
});

void test("legacy layout options normalize to modern sizes on initialization and updates", () => {
  const list = setup(() =>
    createSingleSelectListState({ children: renderItem, items })
  );

  const [options, setOptions] = setup(() =>
    createSignal({ rowHeight: 25, rowSize: 40 })
  );

  const layout = new ListLayout<(typeof items)[number]>();

  const state = setup(() =>
    createVirtualizerState({
      collection: list.collection,
      layout,
      get layoutOptions() {
        return options();
      },
      onVisibleRectChange: () => {},
      renderView: (_type, content) => content,
    })
  );

  state.setVisibleRect(new Rect(0, 0, 300, 150));
  flush();
  assert.ok(state.visibleViews.length > 0);
  assert.equal(layout.getLayoutInfo("a")?.rect.height, 40);
  setOptions({ rowHeight: 60, rowSize: 80 });
  flush();
  assert.ok(state.visibleViews.length > 0);
  assert.equal(layout.getLayoutInfo("a")?.rect.height, 80);

  const legacyLayout = new ListLayout<(typeof items)[number]>({
    rowHeight: 35,
  });

  const legacy = setup(() =>
    createVirtualizerState({
      collection: list.collection,
      layout: legacyLayout,
      onVisibleRectChange: () => {},
      renderView: (_type, content) => content,
    })
  );

  legacy.setVisibleRect(new Rect(0, 0, 300, 150));
  flush();
  assert.ok(legacy.visibleViews.length > 0);
  assert.equal(legacyLayout.getLayoutInfo("a")?.rect.height, 35);
});

void test("legacy selection and validation props stay reactive through compatibility boundaries", () => {
  const [key, setKey] = setup(() => createSignal<string | null>("a"));
  const selected: (string | number | null)[] = [];

  const select = setup(() =>
    createSelectState({
      children: renderItem,
      items,
      onSelectionChange: (next) => {
        selected.push(next);
      },
      get selectedKey() {
        return key();
      },
    })
  );

  select.setValue("b");
  flush();
  assert.deepEqual(selected, ["b"]);
  assert.equal(select.value, "a");
  setKey("c");
  flush();
  assert.equal(select.value, "c");

  const [invalid, setInvalid] = setup(() =>
    createSignal<"valid" | "invalid">("invalid")
  );

  const radio = setup(() =>
    createRadioGroupState({
      get validationState() {
        return invalid();
      },
    })
  );

  flush();
  assert.equal(radio.isInvalid, true);
  setInvalid("valid");
  flush();
  assert.equal(radio.isInvalid, false);
});

void test("grid cell spans keep the legacy output alias synchronized", () => {
  const table = setup(() =>
    createTableState({
      children: [
        TableHeader({
          children: [
            Column({ children: "A", key: "a" }),
            Column({ children: "B", key: "b" }),
          ],
        }),
        TableBody({
          children: Row({
            children: Cell({ children: "spanning", colSpan: 2 }),
            key: "row",
          }),
        }),
      ],
    })
  );

  const cells = [...(table.collection.getChildren?.("row") ?? [])];
  assert.equal(cells.length, 1);
  const [cell] = cells;
  assert.ok(cell);
  assert.equal(cell.colSpan, 2);
  assert.equal(cell.colspan, 2);
});
