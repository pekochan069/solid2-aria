import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import {
  CalendarDate,
  CalendarDateTime,
  createCalendar,
} from "@internationalized/date";
import type { Collection, Node } from "@solid2-aria/types-shared";
import { createRoot, createSignal, flush } from "solid-js";

import { createAutocompleteState } from "../src/autocomplete/create-autocomplete-state";
import { createCalendarState } from "../src/calendar/create-calendar-state";
import { createRangeCalendarState } from "../src/calendar/create-range-calendar-state";
import { createCheckboxGroupState } from "../src/checkbox/create-checkbox-group-state";
import { CollectionBuilder } from "../src/collections/collection-builder";
import { createCollection } from "../src/collections/create-collection";
import { Item } from "../src/collections/item";
import { Section } from "../src/collections/section";
import { DEFAULT_VALIDATION_RESULT } from "../src/form/create-form-validation-state";

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

const date = (day: number) => new CalendarDate(2026, 10, day);

function collectionFromNodes<T>(
  source: Iterable<Node<T>>
): Collection<Node<T>> {
  const nodes = [...source];

  const indexOf = (key: string | number) =>
    nodes.findIndex((node) => node.key === key);

  return {
    [Symbol.iterator]: () => nodes[Symbol.iterator](),
    at: (index) => nodes[index] ?? null,
    getFirstKey: () => nodes[0]?.key ?? null,
    getItem: (key) => nodes[indexOf(key)] ?? null,
    getKeyAfter: (key) => {
      const index = indexOf(key);

      return index < 0 ? null : (nodes[index + 1]?.key ?? null);
    },
    getKeyBefore: (key) => nodes[indexOf(key) - 1]?.key ?? null,
    getKeys: () => nodes.map((node) => node.key),
    getLastKey: () => nodes.at(-1)?.key ?? null,
    size: nodes.length,
  };
}

void test("autocomplete observes controlled props and emits input changes", () => {
  const [input, setInput] = setup(() => createSignal("a"));
  const changes: string[] = [];

  const state = setup(() =>
    createAutocompleteState({
      get inputValue() {
        return input();
      },
      onInputChange: (value) => {
        changes.push(value);
      },
    })
  );

  state.setInputValue("b");
  state.setFocusedNodeId("option-b");
  flush();
  assert.equal(state.inputValue, "a");
  assert.equal(state.focusedNodeId, "option-b");
  assert.deepEqual(changes, ["b"]);
  setInput("c");
  flush();
  assert.equal(state.inputValue, "c");
});

void test("checkbox group composes queued selection changes and respects reactive disabled props", () => {
  const [disabled, setDisabled] = setup(() => createSignal(false));

  const state = setup(() =>
    createCheckboxGroupState({
      get isDisabled() {
        return disabled();
      },
      isRequired: true,
    })
  );

  state.addValue("a");
  state.addValue("b");
  state.toggleValue("a");
  flush();
  assert.deepEqual(state.value, ["b"]);
  assert.equal(state.isRequired, false);
  assert.deepEqual(state.defaultValue, []);
  setDisabled(true);
  flush();
  state.removeValue("b");
  flush();
  assert.deepEqual(state.value, ["b"]);
  setDisabled(false);
  flush();
  state.toggleValue("b");
  flush();
  assert.equal(state.isRequired, true);
});

void test("checkbox group merges child validation and keeps validation getters live", () => {
  const state = setup(() => createCheckboxGroupState());
  state.setInvalid("a", {
    ...DEFAULT_VALIDATION_RESULT,
    isInvalid: true,
    validationDetails: {
      // oxlint-disable-next-line typescript/no-misused-spread -- The validation defaults are plain object literals, not native ValidityState instances.
      ...DEFAULT_VALIDATION_RESULT.validationDetails,
      customError: true,
      valid: false,
    },
    validationErrors: ["required"],
  });
  flush();
  assert.equal(state.isInvalid, true);
  assert.deepEqual(state.displayValidation.validationErrors, ["required"]);
  state.setInvalid("a", DEFAULT_VALIDATION_RESULT);
  flush();
  assert.equal(state.isInvalid, false);
});

void test("calendar navigates pages, constrains focus, and follows reactive visible duration", () => {
  const [duration, setDuration] = setup(() => createSignal({ months: 1 }));
  const [minimum, setMinimum] = setup(() => createSignal(date(1)));

  const state = setup(() =>
    createCalendarState({
      createCalendar,
      defaultValue: date(21),
      locale: "en-US",
      get minValue() {
        return minimum();
      },
      get visibleDuration() {
        return duration();
      },
    })
  );

  assert.equal(state.visibleRange.start.toString(), "2026-10-01");
  state.focusNextPage();
  flush();
  assert.equal(state.focusedDate.toString(), "2026-11-21");
  assert.equal(state.visibleRange.start.toString(), "2026-11-01");
  state.setFocusedDate(date(1));
  flush();
  setMinimum(date(10));
  flush();
  assert.equal(state.focusedDate.toString(), "2026-10-10");
  setDuration({ months: 2 });
  flush();
  assert.equal(state.visibleRange.end.toString(), "2026-11-30");
  assert.equal(state.getDatesInWeek(0).length, 7);
});

void test("calendar preserves time and controlled values, and toggles multiple dates", () => {
  const changes: unknown[] = [];
  const initial = new CalendarDateTime(2026, 10, 21, 13, 25);

  const state = setup(() =>
    createCalendarState({
      createCalendar,
      locale: "en-US",
      onChange: (value) => {
        changes.push(value);
      },
      value: initial,
    })
  );

  state.selectDate(date(22));
  flush();
  assert.equal(state.value?.toString(), "2026-10-21");
  assert.equal(String(changes[0]), "2026-10-22T13:25:00");

  const multiple = setup(() =>
    createCalendarState({
      createCalendar,
      defaultValue: [],
      locale: "en-US",
      selectionMode: "multiple",
    })
  );

  multiple.selectDate(date(21));
  flush();
  multiple.selectDate(date(22));
  flush();
  multiple.selectDate(date(21));
  flush();
  assert.deepEqual(
    multiple.value.map((value) => value?.toString()),
    ["2026-10-22"]
  );
});

void test("range calendar highlights and commits a reverse selection, then clears it", () => {
  const state = setup(() =>
    createRangeCalendarState({
      createCalendar,
      defaultFocusedValue: date(21),
      locale: "en-US",
    })
  );

  state.selectDate(date(21));
  flush();
  assert.equal(state.anchorDate?.toString(), "2026-10-21");
  state.highlightDate(date(15));
  flush();
  assert.equal(state.highlightedRange?.start.toString(), "2026-10-15");
  state.commitSelection();
  flush();
  assert.equal(state.value?.start.toString(), "2026-10-15");
  assert.equal(state.value?.end.toString(), "2026-10-21");
  assert.equal(state.anchorDate, null);
  state.clearSelection();
  flush();
  assert.equal(state.value, null);
});

void test("range calendar limits selection at unavailable dates and follows disabled props", () => {
  const [disabled, setDisabled] = setup(() => createSignal(false));

  const state = setup(() =>
    createRangeCalendarState({
      createCalendar,
      defaultFocusedValue: date(10),
      isDateUnavailable: (d) => d.day === 15,
      get isDisabled() {
        return disabled();
      },
      locale: "en-US",
    })
  );

  state.selectDate(date(10));
  flush();
  state.selectDate(date(20));
  flush();
  assert.equal(state.value?.end.toString(), "2026-10-14");
  setDisabled(true);
  flush();
  state.selectDate(date(22));
  flush();
  assert.equal(state.anchorDate, null);
});

void test("collections build nested sections, stable keys and reusable child iterators", () => {
  const builder = new CollectionBuilder<{
    id: string;
    label: string;
  }>();

  const values = [
    { id: "a", label: "Alpha" },
    { id: "b", label: "Beta" },
  ];

  const nodes = [
    ...builder.build({
      children: Section({
        children: (value) => Item({ children: value.label }),
        items: values,
        title: "Group",
      }),
    }),
  ];

  assert.equal(nodes[0]?.type, "section");
  // oxlint-disable-next-line typescript/no-deprecated -- Preserve and test the upstream compatibility API.
  const children = [...(nodes[0]?.childNodes ?? [])];
  assert.deepEqual(
    children.map((node) => node.key),
    ["a", "b"]
  );
  assert.deepEqual(
    children.map((node) => node.textValue),
    ["Alpha", "Beta"]
  );
  // oxlint-disable-next-line typescript/no-deprecated -- Preserve and test the upstream compatibility API.
  assert.deepEqual([...(nodes[0]?.childNodes ?? [])], children);
});

void test("collections accept nested Solid arrays, explicit zero keys and reactive replacement", () => {
  const builder = new CollectionBuilder<{
    id: string;
  }>();

  const nodes = [
    ...builder.build({
      children: [[Item({ children: "Zero", key: 0 })], null, false],
    }),
  ];

  assert.equal(nodes[0]?.key, 0);

  const makeCollection = (label: string) => {
    const collectionNodes = [
      ...builder.build({ children: Item({ children: label, key: label }) }),
    ];

    return collectionFromNodes(collectionNodes);
  };

  const first = makeCollection("first");
  const second = makeCollection("second");
  const [supplied, setSupplied] = setup(() => createSignal(first));

  const collection = setup(() =>
    createCollection(
      {
        get collection() {
          return supplied();
        },
      },
      () => {
        throw new Error("factory must not run for supplied collections");
      }
    )
  );

  assert.equal(collection(), first);
  setSupplied(second);
  flush();
  assert.equal(collection(), second);
  const [items, setItems] = setup(() => createSignal([{ id: "a" }]));

  const built = setup(() =>
    createCollection(
      {
        children: (value) => Item({ children: value.id }),
        get items() {
          return items();
        },
      },
      collectionFromNodes
    )
  );

  const previous = built();
  assert.deepEqual([...previous.getKeys()], ["a"]);
  setItems([{ id: "b" }]);
  flush();
  assert.deepEqual([...built().getKeys()], ["b"]);
  assert.deepEqual([...previous.getKeys()], ["a"]);
});

void test("calendar single-page behavior advances one unit within a multi-month view", () => {
  const state = setup(() =>
    createCalendarState({
      createCalendar,
      defaultFocusedValue: date(21),
      locale: "en-US",
      pageBehavior: "single",
      visibleDuration: { months: 2 },
    })
  );

  state.focusNextPage();
  flush();
  assert.equal(state.focusedDate.toString(), "2026-11-21");
  assert.equal(state.visibleRange.start.toString(), "2026-11-01");
  assert.equal(state.visibleRange.end.toString(), "2026-12-31");
});

void test("calendar follows locale calendar changes without changing the emitted calendar", () => {
  const [locale, setLocale] = setup(() => createSignal("en-US"));
  const selected: string[] = [];

  const state = setup(() =>
    createCalendarState({
      createCalendar,
      defaultValue: date(21),
      get locale() {
        return locale();
      },
      onChange: (value) => {
        selected.push(value.calendar.identifier);
      },
    })
  );

  setLocale("en-US-u-ca-hebrew");
  flush();
  assert.equal(state.focusedDate.calendar.identifier, "hebrew");
  assert.equal(state.visibleRange.start.calendar.identifier, "hebrew");
  state.selectFocusedDate();
  flush();
  assert.deepEqual(selected, ["gregory"]);
});

void test("checkbox native validation commits merged child errors and resets them", () => {
  const state = setup(() =>
    createCheckboxGroupState({ validationBehavior: "native" })
  );

  state.setInvalid("a", {
    ...DEFAULT_VALIDATION_RESULT,
    isInvalid: true,
    validationErrors: ["required"],
  });
  flush();
  assert.equal(state.isInvalid, false);
  state.commitValidation();
  flush();
  assert.equal(state.isInvalid, true);
  state.resetValidation();
  flush();
  assert.equal(state.isInvalid, false);
});

void test("range selection at the last supported day terminates available-date searches", () => {
  const last = new CalendarDate(9999, 12, 31);

  const state = setup(() =>
    createRangeCalendarState({
      createCalendar,
      defaultFocusedValue: last,
      isDateUnavailable: () => false,
      locale: "en-US",
    })
  );

  state.selectDate(last);
  flush();
  assert.equal(state.anchorDate?.toString(), last.toString());
  state.commitSelection();
  flush();
  assert.equal(state.value?.end.toString(), last.toString());
});
