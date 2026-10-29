import assert from "node:assert/strict";
import { test, afterEach } from "node:test";
import { setTimeout as delay } from "node:timers/promises";

import {
  CalendarDate,
  CalendarDateTime,
  Time,
  createCalendar,
} from "@internationalized/date";
import { createRoot, createSignal, createMemo, flush } from "solid-js";

import { Item } from "../src/collections/item";
import { createComboBoxState } from "../src/combobox/create-combo-box-state";
import { createAsyncList } from "../src/data/create-async-list";
import { createListData } from "../src/data/create-list-data";
import { createTreeData } from "../src/data/create-tree-data";
import { createDateFieldState } from "../src/datepicker/create-date-field-state";
import { createDatePickerState } from "../src/datepicker/create-date-picker-state";
import { createDateRangePickerState } from "../src/datepicker/create-date-range-picker-state";
import { createTimeFieldState } from "../src/datepicker/create-time-field-state";
import { createDisclosureGroupState } from "../src/disclosure/create-disclosure-group-state";
import { createDisclosureState } from "../src/disclosure/create-disclosure-state";
import { createDraggableCollectionState } from "../src/dnd/create-draggable-collection-state";
import { createDroppableCollectionState } from "../src/dnd/create-droppable-collection-state";
import {
  enableTableNestedRows,
  enableShadowDOM,
  tableNestedRows,
  shadowDOM,
} from "../src/flags/flags";
import { createListState } from "../src/list/create-list-state";

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

void test("collection text values retain explicit text and string fallbacks", () => {
  const state = setup(() =>
    createListState({
      children: [
        Item({ children: "Rendered", key: "explicit", textValue: "Explicit" }),
        Item({ children: "Rendered", key: "rendered" }),
        Item({ "aria-label": "Label", children: null, key: "label" }),
        Item({ children: "Fallback", key: "empty", textValue: "" }),
      ],
    })
  );

  assert.deepEqual(
    [...state.collection].map((node) => node.textValue),
    ["Explicit", "Rendered", "Label", "Fallback"]
  );
});

void test("combobox values retain zero and empty string keys", () => {
  for (const key of [0, ""]) {
    const state = setup(() =>
      createComboBoxState({
        children: [Item({ children: "Selected", key })],
        value: key,
      })
    );

    assert.equal(state.value, key);
    assert.equal(state.inputValue, "Selected");
    assert.equal(state.selectedItems[0]?.key, key);
  }
});

void test("list mutations compose and getters track filtering and selection", () => {
  const list = setup(() =>
    createListData({
      filter: (item, text) => item.name.includes(text),
      initialItems: [
        { id: 1, name: "apple" },
        { id: 2, name: "berry" },
      ],
    })
  );

  list.append({ id: 3, name: "apricot" });
  list.setSelectedKeys(new Set([3]));
  list.setFilterText("ap");
  flush();
  assert.deepEqual(
    list.items.map((x) => x.id),
    [1, 3]
  );
  assert.deepEqual(list.selectedKeys, new Set([3]));
  assert.equal(list.filterText, "ap");
  list.moveBefore(1, [3]);
  flush();
  assert.deepEqual(
    list.items.map((x) => x.id),
    [3, 1]
  );
});

void test("tree mutations preserve parent links and clear removed selection", () => {
  const tree = setup(() =>
    createTreeData<{ id: number; children?: { id: number }[] }>({
      getChildren: (x) => x.children ?? [],
      getKey: (x) => x.id,
      initialItems: [{ children: [{ id: 2 }], id: 1 }],
    })
  );

  tree.setSelectedKeys(new Set([2]));
  flush();
  tree.remove(1);
  flush();
  assert.equal(tree.items.length, 0);
  assert.equal(tree.selectedKeys.size, 0);
});

void test("disclosures observe controlled changes and group single selection", () => {
  const [expanded, setExpanded] = setup(() => createSignal(false));

  const state = setup(() =>
    createDisclosureState({
      get isExpanded() {
        return expanded();
      },
    })
  );

  setExpanded(true);
  flush();
  assert.equal(state.isExpanded, true);

  const group = setup(() =>
    createDisclosureGroupState({ defaultExpandedKeys: ["a", "b"] })
  );

  flush();
  assert.equal(group.expandedKeys.size, 1);
  group.toggleKey("c");
  flush();
  assert.deepEqual([...group.expandedKeys], ["c"]);
});

void test("date picker value, time and formatting update", () => {
  const picker = setup(() =>
    createDatePickerState({
      defaultValue: new CalendarDateTime(2026, 10, 1, 14, 30),
    })
  );

  flush();
  assert.equal(picker.hasTime, true);
  picker.setDateValue(new CalendarDate(2026, 10, 2));
  flush();
  assert.equal(picker.value?.day, 2);
  assert.equal(picker.timeValue?.hour, 14);
  assert.ok(picker.formatValue("en-US", {}).includes("2026"));
});

void test("date field updates segments and follows controlled locale and value", () => {
  const [value, setValue] = setup(() =>
    createSignal(new CalendarDate(2026, 10, 1))
  );

  const [locale, setLocale] = setup(() => createSignal("en-US"));

  const field = setup(() =>
    createDateFieldState({
      createCalendar,
      get locale() {
        return locale();
      },
      get value() {
        return value();
      },
    })
  );

  flush();
  assert.equal(field.segments.find((s) => s.type === "day")?.value, 1);
  setValue(new CalendarDate(2026, 11, 5));
  setLocale("de-DE");
  flush();
  assert.equal(field.segments.find((s) => s.type === "day")?.value, 5);
});

void test("time field and range picker compose date fields and partial selections", () => {
  const field = setup(() =>
    createTimeFieldState({ defaultValue: new Time(14, 30), locale: "en-US" })
  );

  flush();
  assert.equal(field.timeValue.hour, 14);
  field.increment("minute");
  flush();
  assert.equal(field.timeValue.minute, 31);
  const range = setup(() => createDateRangePickerState({}));
  flush();
  range.setDateRange({
    end: new CalendarDate(2026, 10, 3),
    start: new CalendarDate(2026, 10, 1),
  });
  flush();
  assert.equal(range.value?.end?.day, 3);
});

void test("combobox filters items and updates selection text", () => {
  const state = setup(() =>
    createComboBoxState({
      children: (item) =>
        Item({ children: item.name, key: item.id, textValue: item.name }),
      defaultFilter: (text, input) =>
        text.toLowerCase().includes(input.toLowerCase()),
      defaultItems: [
        { id: "a", name: "Apple" },
        { id: "b", name: "Berry" },
      ],
    })
  );

  flush();
  assert.equal(state.collection.size, 2);
  state.setFocused(true);
  state.setInputValue("app");
  flush();
  assert.equal(state.collection.size, 1);
  state.setValue("a");
  flush();
  assert.equal(state.value, "a");
  assert.equal(state.inputValue, "Apple");
});

void test("async list loads and paginates", async () => {
  const list = setup(() =>
    createAsyncList<{ id: number }>({
      load: ({ cursor }) => ({
        cursor: cursor === undefined ? "next" : undefined,
        items: [{ id: cursor === undefined ? 1 : 2 }],
      }),
    })
  );

  flush();
  await delay(0);
  flush();
  assert.equal(list.items.length, 1);
  list.loadMore();
  flush();
  await delay(0);
  flush();
  assert.equal(list.items.length, 2);
});

void test("async list aborts superseded requests and ignores late responses", async () => {
  const requests: {
    signal: AbortSignal;
    resolve: (value: { items: { id: number }[] }) => void;
  }[] = [];

  const list = setup(() =>
    createAsyncList<{ id: number }>({
      load: async ({ signal }) => {
        const pending = Promise.withResolvers<{ items: { id: number }[] }>();
        requests.push({ resolve: pending.resolve, signal });

        return await pending.promise;
      },
    })
  );

  flush();
  assert.equal(requests.length, 1);
  list.setFilterText("new");
  flush();
  const [first, second] = requests;
  assert.ok(first);
  assert.ok(second);
  assert.equal(first.signal.aborted, true);
  second.resolve({ items: [{ id: 2 }] });
  await delay(0);
  flush();
  first.resolve({ items: [{ id: 1 }] });
  await delay(0);
  flush();
  assert.deepEqual(list.items, [{ id: 2 }]);
  assert.equal(list.filterText, "new");
});

void test("disclosure toggles compose before a flush and controlled groups stay controlled", () => {
  const state = setup(() => createDisclosureState({}));
  state.toggle();
  state.toggle();
  flush();
  assert.equal(state.isExpanded, false);
  const changes: Set<string | number>[] = [];

  const group = setup(() =>
    createDisclosureGroupState({
      allowsMultipleExpanded: true,
      expandedKeys: ["a"],
      onExpandedChange: (keys) => {
        changes.push(keys);
      },
    })
  );

  group.toggleKey("b");
  flush();
  assert.deepEqual([...group.expandedKeys], ["a"]);
  assert.deepEqual(changes[0], new Set(["a", "b"]));
});

void test("drag state is reactive and droppable state rejects self drops and equivalent gaps", () => {
  const list = setup(() =>
    createListState({
      children: (item) =>
        Item({ children: item.id, key: item.id, textValue: item.id }),
      defaultSelectedKeys: ["a", "b"],
      items: [{ id: "a" }, { id: "b" }],
      selectionMode: "multiple",
    })
  );

  const dragging = setup(() =>
    createDraggableCollectionState({
      collection: list.collection,
      getItems: (keys) => [{ "text/plain": [...keys].join(",") }],
      selectionManager: list.selectionManager,
    })
  );

  const observed = setup(() => createMemo(() => dragging.isDragging("a")));
  assert.equal(observed(), false);
  dragging.startDrag("a", { type: "dragstart", x: 0, y: 0 });
  flush();
  assert.equal(observed(), true);
  assert.deepEqual([...dragging.draggingKeys], ["a", "b"]);
  dragging.endDrag({
    dropOperation: "move",
    isInternal: true,
    keys: dragging.draggingKeys,
    type: "dragend",
    x: 0,
    y: 0,
  });
  flush();
  assert.equal(observed(), false);
  const entering: string[] = [];

  const drop = setup(() =>
    createDroppableCollectionState({
      collection: list.collection,
      onDropEnter: () => {
        entering.push("enter");
      },
      onReorder: () => {},
      selectionManager: list.selectionManager,
    })
  );

  drop.setTarget({ dropPosition: "after", key: "a", type: "item" });
  flush();
  drop.setTarget({ dropPosition: "before", key: "b", type: "item" });
  flush();
  assert.equal(entering.length, 1);
  assert.equal(
    drop.getDropOperation({
      allowedOperations: ["move"],
      draggingKeys: new Set(["a"]),
      isInternal: true,
      target: { dropPosition: "on", key: "a", type: "item" },
      types: new Set(["text/plain"]),
    }),
    "cancel"
  );
});

void test("feature flags enable the upstream capabilities", () => {
  enableTableNestedRows();
  enableShadowDOM();
  assert.equal(tableNestedRows(), true);
  assert.equal(shadowDOM(), true);
});

void test("tree appends, inserts, and removals compose within one update", () => {
  const tree = setup(() =>
    createTreeData<{ id: number; children?: { id: number }[] }>({
      initialItems: [{ children: [{ id: 1 }], id: 0 }],
    })
  );

  tree.append(null, { id: 2 });
  tree.append(null, { id: 3 });
  tree.append(0, { id: 4 });
  tree.remove(1);
  flush();
  assert.deepEqual(
    tree.items.map((n) => n.key),
    [0, 2, 3]
  );
  assert.deepEqual(
    tree.getItem(0)?.children?.map((n) => n.key),
    [4]
  );
  assert.equal(tree.getItem(4)?.parentKey, 0);
});

void test("date fields keep invalid edits incomplete and respect disabled changes", () => {
  const field = setup(() =>
    createDateFieldState({
      createCalendar,
      defaultValue: new CalendarDate(2026, 2, 10),
      locale: "en-US",
    })
  );

  flush();
  field.setSegment("day", 31);
  flush();
  assert.equal(field.value?.day, 10);
  assert.equal(field.segments.find((s) => s.type === "day")?.value, 31);

  const disabled = setup(() =>
    createDateFieldState({
      createCalendar,
      defaultValue: new CalendarDate(2026, 10, 10),
      isDisabled: true,
      locale: "en-US",
    })
  );

  flush();
  disabled.increment("day");
  flush();
  assert.equal(disabled.value?.day, 10);
});

void test("24-hour fields preserve the hour while editing minutes", () => {
  const field = setup(() =>
    createTimeFieldState({
      defaultValue: new Time(23, 30),
      hourCycle: 24,
      locale: "de-DE",
    })
  );

  flush();
  field.increment("minute");
  flush();
  assert.equal(field.timeValue.hour, 23);
  assert.equal(field.timeValue.minute, 31);
});

void test("list collections keep zero-based item indices", () => {
  const list = setup(() =>
    createListState({
      children: (item) =>
        Item({ children: item.id, key: item.id, textValue: item.id }),
      items: [{ id: "a" }, { id: "b" }],
    })
  );

  assert.equal(list.collection.getItem("a")?.index, 0);
  assert.equal(list.collection.getItem("b")?.index, 1);
});

void test("disposing an async list aborts the active request", () => {
  let requestSignal: AbortSignal | undefined;
  let dispose: (() => void) | undefined;
  createRoot((d) => {
    dispose = d;

    return createAsyncList({
      load: async ({ signal }) => {
        requestSignal = signal;

        return await Promise.withResolvers<{ items: never[] }>().promise;
      },
    });
  });
  flush();
  assert.ok(requestSignal);
  assert.ok(dispose);
  dispose();
  assert.equal(requestSignal.aborted, true);
});
