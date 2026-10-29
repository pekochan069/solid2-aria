import { test } from "bun:test";
import assert from "node:assert/strict";

import { getChildNodes } from "@solid2-aria/stately/collections/get-child-nodes";
import { Cell } from "@solid2-aria/stately/table/cell";
import { Column } from "@solid2-aria/stately/table/column";
import { createTableState } from "@solid2-aria/stately/table/create-table-state";
import { Row } from "@solid2-aria/stately/table/row";
import { TableBody } from "@solid2-aria/stately/table/table-body";
import { TableHeader } from "@solid2-aria/stately/table/table-header";
import { createRoot } from "solid-js";

import { TableKeyboardDelegate } from "../src/table/table-keyboard-delegate";
import { noop } from "../src/utils/noop";

test("table keyboard navigation connects column headers with their data cells", () => {
  let disposeRoot = noop;

  const state = createRoot((dispose) => {
    disposeRoot = dispose;

    return createTableState({
      children: [
        TableHeader({
          children: [
            Column({ children: "Name", isRowHeader: true, key: "name" }),
            Column({ children: "Value", key: "value" }),
          ],
        }),
        TableBody({
          children: [
            Row({
              children: [Cell({ children: "Alpha" }), Cell({ children: "1" })],
              key: "a",
            }),
            Row({
              children: [Cell({ children: "Beta" }), Cell({ children: "2" })],
              key: "b",
            }),
          ],
        }),
      ],
    });
  });

  const delegate = new TableKeyboardDelegate({
    collection: state.collection,
    direction: "ltr",
    disabledKeys: new Set(),
    ref: () => document.createElement("table"),
  });

  const row = state.collection.getItem("a");

  if (!row) {
    throw new Error("Missing first table row");
  }

  const [name, value] = [...getChildNodes(row, state.collection)];

  if (!name || !value) {
    throw new Error("Missing table cells");
  }

  assert.equal(delegate.getKeyRightOf("name"), "value");
  assert.equal(delegate.getKeyLeftOf("value"), "name");
  assert.equal(delegate.getKeyBelow("name"), name.key);
  assert.equal(delegate.getKeyBelow("value"), value.key);
  assert.equal(delegate.getKeyAbove(name.key), "name");
  assert.equal(delegate.getKeyAbove(value.key), "value");
  disposeRoot();
});
