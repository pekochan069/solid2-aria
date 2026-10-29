import { expect, test } from "bun:test";

import { requireValue } from "@solid2-aria/core/utils/require-value";
import { ListLayout } from "@solid2-aria/stately/layout/list-layout";
import type { DropTarget } from "@solid2-aria/types-shared";
import { render } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import {
  untrack,
  createSignal,
  flush,
  createRoot,
  onSettled,
  useContext,
} from "solid-js";

import { Button } from "../src/button";
import { Checkbox } from "../src/checkbox";
import { CollectionRendererContext } from "../src/collection";
import { createDragAndDrop } from "../src/create-drag-and-drop";
import { DropZone } from "../src/drop-zone";
import { GridList, GridListItem } from "../src/grid-list";
import { Link } from "../src/link";
import {
  NavigationTree,
  NavigationTreeItem,
  NavigationTreeItemContent,
} from "../src/navigation-tree";
import { Table, TableHeader, Column, TableBody, Row, Cell } from "../src/table";
import { Tree, TreeItem, TreeItemContent } from "../src/tree";
import { Virtualizer } from "../src/virtualizer";

function mount(view: () => JSX.Element) {
  const host = document.createElement("div");
  document.body.append(host);
  const dispose = render(view, host);
  flush();

  return {
    dispose() {
      dispose();
      host.remove();
      flush();
    },
    host,
  };
}

function key(element: Element, value: string) {
  element.dispatchEvent(
    new KeyboardEvent("keydown", { bubbles: true, key: value })
  );
  element.dispatchEvent(
    new KeyboardEvent("keyup", { bubbles: true, key: value })
  );
  flush();
}

test("grid list selection, disabled rows, and dynamic collection updates", () => {
  const [items, setItems] = createSignal([
    { id: "a", name: "Alpha" },
    { id: "b", name: "Beta" },
  ]);

  const app = mount(() => (
    <GridList
      aria-label="Files"
      items={items()}
      selectionMode="single"
      disabledKeys={["b"]}
    >
      {(item) => (
        <GridListItem id={item.id} textValue={item.name}>
          {item.name}
        </GridListItem>
      )}
    </GridList>
  ));

  expect(app.host.querySelector('[role="grid"]')).not.toBeNull();
  let rows = app.host.querySelectorAll<HTMLElement>('[role="row"]');
  expect(rows.length).toBe(2);
  requireValue(rows[0], "Expected rows[0]").focus();
  key(requireValue(rows[0], "Expected rows[0]"), " ");
  rows = app.host.querySelectorAll('[role="row"]');
  expect(
    requireValue(rows[0], "Expected rows[0]").getAttribute("aria-selected")
  ).toBe("true");
  expect(
    requireValue(rows[0], "Expected rows[0]").dataset.selected !== undefined
  ).toBe(true);
  expect(
    requireValue(rows[1], "Expected rows[1]").getAttribute("aria-disabled")
  ).toBe("true");
  setItems([
    { id: "b", name: "Beta" },
    { id: "c", name: "Gamma" },
  ]);
  flush();
  rows = app.host.querySelectorAll('[role="row"]');
  expect(rows.length).toBe(2);
  expect(app.host.textContent).toBe("BetaGamma");
  app.dispose();
});

test("tree expansion button and keyboard expose flattened child rows", () => {
  const app = mount(() => (
    <Tree aria-label="Folders" selectionMode="single">
      <TreeItem id="parent" textValue="Parent">
        <TreeItemContent>
          {(state) => (
            <>
              <Button slot="chevron">
                {state.isExpanded ? "Collapse" : "Expand"}
              </Button>
              Parent
            </>
          )}
        </TreeItemContent>
        <TreeItem id="child" textValue="Child">
          <TreeItemContent>Child</TreeItemContent>
        </TreeItem>
      </TreeItem>
    </Tree>
  ));

  expect(app.host.querySelectorAll('[role="row"]').length).toBe(1);
  requireValue(
    app.host.querySelector("button"),
    'Expected app.host.querySelector("button")'
  ).click();
  flush();
  expect(app.host.querySelectorAll('[role="row"]').length).toBe(2);
  expect(
    requireValue(
      app.host.querySelector('[role="row"]'),
      "Expected app.host.querySelector('[role=\"row\"]')"
    ).getAttribute("aria-expanded")
  ).toBe("true");
  expect(
    requireValue(
      app.host.querySelectorAll('[role="row"]')[1],
      "Expected app.host.querySelectorAll('[role=\"row\"]')[1]"
    ).getAttribute("aria-level")
  ).toBe("2");
  requireValue(
    app.host.querySelector("button"),
    'Expected app.host.querySelector("button")'
  ).click();
  flush();
  expect(app.host.querySelectorAll('[role="row"]').length).toBe(1);
  app.dispose();
});

test("native table connects headers, sorting and row selection slots", () => {
  const [sort, setSort] = createSignal<{
    column: string | number;
    direction: "ascending" | "descending";
  }>({ column: "name", direction: "ascending" });

  const app = mount(() => (
    <Table
      aria-label="People"
      selectionMode="multiple"
      sortDescriptor={sort()}
      onSortChange={setSort}
    >
      <TableHeader>
        <Column id="select">Select</Column>
        <Column id="name" isRowHeader allowsSorting>
          Name
        </Column>
      </TableHeader>
      <TableBody>
        <Row id="a" textValue="Alice">
          <Cell>
            <Checkbox slot="selection" aria-label="Select Alice" />
          </Cell>
          <Cell>Alice</Cell>
        </Row>
      </TableBody>
    </Table>
  ));

  expect(
    requireValue(
      app.host.querySelector("table"),
      'Expected app.host.querySelector("table")'
    ).getAttribute("role")
  ).toBe("grid");
  expect(app.host.querySelectorAll("thead th").length).toBe(2);

  const name = requireValue(
    app.host.querySelectorAll<HTMLElement>("th")[1],
    'Expected app.host.querySelectorAll<HTMLElement>("th")[1]'
  );

  expect(name.getAttribute("aria-sort")).toBe("ascending");
  name.focus();
  key(name, "Enter");
  expect(untrack(() => sort().direction)).toBe("descending");
  expect(
    requireValue(
      app.host.querySelectorAll("th")[1],
      'Expected app.host.querySelectorAll("th")[1]'
    ).getAttribute("aria-sort")
  ).toBe("descending");

  const checkbox = requireValue(
    app.host.querySelector<HTMLInputElement>('input[type="checkbox"]'),
    "Expected app.host.querySelector<HTMLInputElement>( 'input[type=\"checkbox\"]' )"
  );

  checkbox.click();
  flush();
  expect(
    requireValue(
      app.host.querySelector("tbody tr"),
      'Expected app.host.querySelector("tbody tr")'
    ).getAttribute("aria-selected")
  ).toBe("true");
  expect(
    requireValue(
      app.host.querySelector('tbody td[role="rowheader"]'),
      "Expected app.host.querySelector('tbody td[role=\"rowheader\"]')"
    ).textContent
  ).toBe("Alice");
  app.dispose();
});

test("drag-and-drop factories enable only configured interactions", () => {
  createRoot((dispose) => {
    const drag = createDragAndDrop({
      getItems: (keys) => [{ "text/plain": [...keys].join(",") }],
    });

    expect(drag.dragAndDropHooks.createDraggableItem).toBeFunction();
    expect(drag.dragAndDropHooks.createDroppableItem).toBeUndefined();
    const drop = createDragAndDrop({ onRootDrop: () => {} });
    expect(drop.dragAndDropHooks.createDroppableItem).toBeFunction();
    expect(drop.dragAndDropHooks.createDraggableItem).toBeUndefined();
    dispose();
  });
  const app = mount(() => <DropZone aria-label="Upload">Drop here</DropZone>);
  expect(
    requireValue(
      app.host.querySelector("button"),
      'Expected app.host.querySelector("button")'
    ).getAttribute("aria-label")
  ).toBe("Upload");
  app.dispose();
});

test("virtualized grid list uses layout positions and visible collection rows", () => {
  const app = mount(() => (
    <Virtualizer layout={ListLayout} layoutOptions={{ rowSize: 32 }}>
      <GridList
        aria-label="Virtual files"
        items={[
          { id: "a", name: "Alpha" },
          { id: "b", name: "Beta" },
        ]}
      >
        {(item) => (
          <GridListItem id={item.id} textValue={item.name}>
            {item.name}
          </GridListItem>
        )}
      </GridList>
    </Virtualizer>
  ));

  expect(
    requireValue(
      app.host.querySelector('[role="grid"]'),
      "Expected app.host.querySelector('[role=\"grid\"]')"
    ).getAttribute("aria-rowcount")
  ).toBe("2");
  app.dispose();
});

test("navigation tree passes current route to its link slot", () => {
  const app = mount(() => (
    <NavigationTree aria-label="Navigation" selectedRoute="/home">
      <NavigationTreeItem id="home" textValue="Home" href="/home">
        <NavigationTreeItemContent>
          <Link>Home</Link>
        </NavigationTreeItemContent>
      </NavigationTreeItem>
    </NavigationTree>
  ));

  const link = requireValue(
    app.host.querySelector("a"),
    'Expected app.host.querySelector("a")'
  );

  expect(link.getAttribute("href")).toBe("/home");
  expect(link.getAttribute("aria-current")).toBe("page");
  app.dispose();
});

test("virtualized drop targets retain the layout instance", () => {
  class TargetLayout extends ListLayout<unknown> {
    readonly target = { type: "root" } as const;
    override getDropTargetFromPoint() {
      return this.target;
    }
  }

  const layout = new TargetLayout();
  let resolved: DropTarget | null | undefined;

  function Probe() {
    const renderer = useContext(CollectionRendererContext);
    onSettled(() => {
      resolved = renderer.dropTargetDelegate?.getDropTargetFromPoint(
        0,
        0,
        () => true
      );
    });

    return null;
  }

  const app = mount(() => (
    <Virtualizer layout={layout}>
      <Probe />
    </Virtualizer>
  ));

  expect(resolved).toBe(layout.target);
  app.dispose();
});
