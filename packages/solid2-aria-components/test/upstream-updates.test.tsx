import { afterEach, expect, test } from "bun:test";

import { requireValue } from "@solid2-aria/core/utils/require-value";
import { render } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { createSignal, flush } from "solid-js";

import { Button } from "../src/button";
import { ColorField } from "../src/color-field";
import { Form } from "../src/form";
import { GridList, GridListItem } from "../src/grid-list";
import { Input } from "../src/input";
import { SheetOverlay, Sheet, SheetContent } from "../src/sheet";
import { Table, TableHeader, TableBody, Column, Row, Cell } from "../src/table";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "../src/tabs";
import { Text } from "../src/text";
import { Tree, TreeItem, TreeItemContent } from "../src/tree";

const cleanups = new Set<() => void>();

afterEach(() => {
  for (const cleanup of [...cleanups].toReversed()) {
    cleanup();
  }

  cleanups.clear();
});

function mount(view: () => JSX.Element) {
  const host = document.createElement("div");
  document.body.append(host);
  const dispose = render(view, host);
  cleanups.add(() => {
    dispose();
    host.remove();
    flush();
  });
  flush();

  return host;
}

test.each([undefined, "red"] as const)(
  "color field channel %s inherits form validation behavior and permits an override",
  (channel) => {
    const host = mount(() => (
      <Form validationBehavior="aria">
        <ColorField aria-label="Inherited" channel={channel} isRequired>
          <Input />
        </ColorField>
        <ColorField
          aria-label="Override"
          channel={channel}
          isRequired
          validationBehavior="native"
        >
          <Input />
        </ColorField>
      </Form>
    ));

    const inherited = requireValue(
      host.querySelector<HTMLInputElement>('input[aria-label="Inherited"]'),
      "Expected inherited color input"
    );

    const override = requireValue(
      host.querySelector<HTMLInputElement>('input[aria-label="Override"]'),
      "Expected overridden color input"
    );

    expect(inherited.required).toBe(false);
    expect(inherited.getAttribute("aria-required")).toBe("true");
    expect(override.required).toBe(true);
    expect(override.hasAttribute("aria-required")).toBe(false);
  }
);

test("grid list reports direct row focus once and ignores descendant focus", () => {
  const changes: boolean[] = [];
  const focused: EventTarget[] = [];
  const blurred: EventTarget[] = [];
  const [label, setLabel] = createSignal("Cat");

  const host = mount(() => (
    <GridList aria-label="Animals">
      <GridListItem
        id="cat"
        textValue="Cat"
        onFocus={(event) => {
          focused.push(event.target);
        }}
        onBlur={(event) => {
          blurred.push(event.target);
        }}
        onFocusChange={(value) => {
          changes.push(value);
        }}
      >
        {label()} <Button>First action</Button>
        <Button>Second action</Button>
      </GridListItem>
    </GridList>
  ));

  const row = requireValue(
    host.querySelector<HTMLElement>('[role="row"]'),
    "Expected grid row"
  );

  const [first, second] = host.querySelectorAll("button");
  row.focus();
  flush();
  expect(changes).toEqual([true]);
  setLabel("Updated cat");
  flush();
  expect(document.activeElement).toBe(row);
  expect(changes).toEqual([true]);
  requireValue(first, "Expected first action").focus();
  flush();
  requireValue(second, "Expected second action").focus();
  flush();
  expect(focused).toEqual([row]);
  expect(blurred).toEqual([row]);
  expect(changes).toEqual([true, false]);
});

test("table reports row focus once and ignores cells and descendant controls", () => {
  const changes: boolean[] = [];
  const focused: EventTarget[] = [];
  const blurred: EventTarget[] = [];
  const [label, setLabel] = createSignal("Cat");

  const host = mount(() => (
    <Table aria-label="Animals">
      <TableHeader>
        <Column isRowHeader>Name</Column>
        <Column>Actions</Column>
      </TableHeader>
      <TableBody>
        <Row
          id="cat"
          onFocus={(event) => {
            focused.push(event.target);
          }}
          onBlur={(event) => {
            blurred.push(event.target);
          }}
          onFocusChange={(value) => {
            changes.push(value);
          }}
        >
          <Cell>{label()}</Cell>
          <Cell>
            <Button>First action</Button>
            <Button>Second action</Button>
          </Cell>
        </Row>
      </TableBody>
    </Table>
  ));

  const row = requireValue(
    host.querySelector<HTMLElement>("tbody tr"),
    "Expected table row"
  );

  row.focus();
  flush();
  expect(changes).toEqual([true]);
  setLabel("Updated cat");
  flush();
  expect(document.activeElement).toBe(row);
  expect(changes).toEqual([true]);
  requireValue(
    host.querySelector<HTMLElement>('[role="rowheader"]'),
    "Expected row header"
  ).focus();
  flush();

  for (const button of host.querySelectorAll("button")) {
    button.focus();
    flush();
  }

  expect(focused).toEqual([row]);
  expect(blurred).toEqual([row]);
  expect(changes).toEqual([true, false]);
});

test.each([undefined, "Team projects"])(
  "tree description participates in the row name with label %s",
  async (label) => {
    const host = mount(() => (
      <Tree aria-label="Files">
        <TreeItem id="projects" textValue="Projects" aria-label={label}>
          <TreeItemContent>
            <Text>Projects</Text>
            <Text slot="description">Shared files</Text>
          </TreeItemContent>
        </TreeItem>
      </Tree>
    ));

    await Bun.sleep(0);
    flush();

    const row = requireValue(
      host.querySelector('[role="row"]'),
      "Expected tree row"
    );

    const description = requireValue(
      host.querySelector('[slot="description"]'),
      "Expected tree description"
    );

    expect(description.id.length).toBeGreaterThan(0);
    expect(row.getAttribute("aria-labelledby")?.split(" ")).toEqual([
      row.id,
      description.id,
    ]);
    expect(row.getAttribute("aria-label")).toBe(label ?? "Projects");
  }
);

test("tree expands an empty parent and navigates into children added on expansion", () => {
  const [expanded, setExpanded] = createSignal(new Set<string | number>());

  const host = mount(() => (
    <Tree
      aria-label="Files"
      expandedKeys={expanded()}
      onExpandedChange={(keys) => {
        setExpanded(new Set(keys));
      }}
    >
      <TreeItem id="projects" textValue="Projects" hasChildItems>
        <TreeItemContent>
          <Button slot="chevron">Expand projects</Button>Projects
        </TreeItemContent>
        {expanded().has("projects") && (
          <TreeItem id="first" textValue="Project 1">
            <TreeItemContent>Project 1</TreeItemContent>
          </TreeItem>
        )}
      </TreeItem>
    </Tree>
  ));

  const parent = requireValue(
    host.querySelector<HTMLElement>('[role="row"]'),
    "Expected parent row"
  );

  expect(parent.getAttribute("aria-expanded")).toBe("false");
  parent.focus();
  parent.dispatchEvent(
    new KeyboardEvent("keydown", { bubbles: true, key: "ArrowRight" })
  );
  flush();
  expect(parent.getAttribute("aria-expanded")).toBe("true");
  const rows = host.querySelectorAll<HTMLElement>('[role="row"]');
  expect(rows.length).toBe(2);
  expect(document.activeElement).toBe(parent);
  parent.dispatchEvent(
    new KeyboardEvent("keydown", { bubbles: true, key: "ArrowDown" })
  );
  flush();
  const child = requireValue(rows[1], "Expected lazy child");
  expect(document.activeElement).toBe(child);
  expect(child.getAttribute("aria-level")).toBe("2");
});

test("nested tab panels reset size variables while preserving supplied styles", () => {
  const host = mount(() => (
    <Tabs>
      <TabList aria-label="Outer">
        <Tab id="outer">Outer</Tab>
      </TabList>
      <TabPanels style={{ "--tab-panel-width": "400px", color: "red" }}>
        <TabPanel id="outer">
          <Tabs>
            <TabList aria-label="Inner">
              <Tab id="inner">Inner</Tab>
            </TabList>
            <TabPanels>
              <TabPanel id="inner">Nested content</TabPanel>
            </TabPanels>
          </Tabs>
        </TabPanel>
      </TabPanels>
    </Tabs>
  ));

  const [outer, inner] = host.querySelectorAll<HTMLElement>(
    ".solid2-aria-TabPanels"
  );

  expect(
    requireValue(outer, "Expected outer panels").style.getPropertyValue(
      "--tab-panel-width"
    )
  ).toBe("400px");
  expect(
    requireValue(outer, "Expected outer panels").style.getPropertyValue(
      "--tab-panel-height"
    )
  ).toBe("auto");
  expect(
    requireValue(inner, "Expected inner panels").style.getPropertyValue(
      "--tab-panel-width"
    )
  ).toBe("auto");
  expect(
    requireValue(inner, "Expected inner panels").style.getPropertyValue(
      "--tab-panel-height"
    )
  ).toBe("auto");
});

test("tab panels measure the settled content next frame and release pixel sizes after transition", async () => {
  const request = globalThis.requestAnimationFrame;
  const cancel = globalThis.cancelAnimationFrame;
  const frames = new Map<number, FrameRequestCallback>();
  let nextFrame = 0;
  globalThis.requestAnimationFrame = (frame) => {
    nextFrame += 1;
    frames.set(nextFrame, frame);

    return nextFrame;
  };

  globalThis.cancelAnimationFrame = (id) => {
    frames.delete(id);
  };

  cleanups.add(() => {
    globalThis.requestAnimationFrame = request;
    globalThis.cancelAnimationFrame = cancel;
  });

  const { promise: finished, resolve: finish } =
    Promise.withResolvers<undefined>();

  const [selected, setSelected] = createSignal<string | number>("first");
  const [details, setDetails] = createSignal("Second");

  const host = mount(() => (
    <Tabs
      selectedKey={selected()}
      onSelectionChange={(key) => {
        setSelected(key);
      }}
    >
      <TabList aria-label="Details">
        <Tab id="first">First</Tab>
        <Tab id="second">Second</Tab>
      </TabList>
      <TabPanels
        style={{
          height: "var(--tab-panel-height)",
          transition: "height 200ms",
        }}
        ref={(element) => {
          Object.defineProperties(element, {
            getAnimations: { value: () => [{ finished }] },
            getBoundingClientRect: {
              value: () =>
                new DOMRect(
                  0,
                  0,
                  100,
                  element.textContent?.includes("Updated") ? 240 : 100
                ),
            },
          });
        }}
      >
        <TabPanel id="first">First</TabPanel>
        <TabPanel id="second">{details()}</TabPanel>
      </TabPanels>
    </Tabs>
  ));

  const panels = requireValue(
    host.querySelector<HTMLElement>(".solid2-aria-TabPanels"),
    "Expected tab panels"
  );

  setSelected("second");
  flush();
  setDetails("Updated second content");
  flush();
  expect(panels.style.getPropertyValue("--tab-panel-height")).toBe("auto");
  expect(frames.size).toBe(1);

  for (const [id, frame] of frames) {
    frames.delete(id);
    frame(0);
  }

  expect(panels.style.getPropertyValue("--tab-panel-height")).toBe("240px");
  finish();
  await finished;
  await Promise.resolve();
  await Promise.resolve();
  expect(panels.style.getPropertyValue("--tab-panel-height")).toBe("auto");
});

test.each(["bottom", "left"] as const)(
  "sheet skips offscreen travel from the %s edge and ignores the jump scrollend",
  async (position) => {
    const request = globalThis.requestAnimationFrame;
    const cancel = globalThis.cancelAnimationFrame;

    const animations = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      "getAnimations"
    );

    const frames = new Map<number, FrameRequestCallback>();
    let nextFrame = 0;
    globalThis.requestAnimationFrame = (frame) => {
      nextFrame += 1;
      frames.set(nextFrame, frame);

      return nextFrame;
    };

    globalThis.cancelAnimationFrame = (id) => {
      frames.delete(id);
    };

    Object.defineProperty(HTMLElement.prototype, "getAnimations", {
      configurable: true,
      value: () => [],
    });
    cleanups.add(() => {
      globalThis.requestAnimationFrame = request;
      globalThis.cancelAnimationFrame = cancel;

      if (animations) {
        Object.defineProperty(
          HTMLElement.prototype,
          "getAnimations",
          animations
        );
      } else {
        Reflect.deleteProperty(HTMLElement.prototype, "getAnimations");
      }
    });
    mount(() => (
      <SheetOverlay defaultOpen position={position}>
        <Sheet
          ref={(element) => {
            Object.defineProperties(element, {
              offsetHeight: { value: 400 },
              offsetWidth: { value: 320 },
            });
          }}
        >
          <SheetContent
            aria-label="Details"
            ref={(element) => {
              Object.defineProperty(element, "getBoundingClientRect", {
                value: () =>
                  position === "bottom"
                    ? new DOMRect(0, window.innerHeight + 200, 320, 400)
                    : new DOMRect(-520, 0, 320, 400),
              });
            }}
          >
            Contents
          </SheetContent>
        </Sheet>
      </SheetOverlay>
    ));

    const scroller = requireValue(
      document.querySelector<HTMLElement>("[data-sheet-scroll]"),
      "Expected sheet scroller"
    );

    const overlay = requireValue(
      document.querySelector<HTMLElement>(".solid2-aria-SheetOverlay"),
      "Expected sheet overlay"
    );

    expect(
      position === "bottom" ? scroller.scrollTop : scroller.scrollLeft
    ).toBe(position === "bottom" ? 200 : window.innerWidth - 200);
    expect(scroller.style.scrollSnapType).toBe("none");
    scroller.dispatchEvent(new Event("scrollend"));
    await Promise.resolve();
    flush();
    expect(Object.hasOwn(overlay.dataset, "entering")).toBe(true);

    for (const [id, frame] of frames) {
      frames.delete(id);
      frame(0);
    }

    expect(
      position === "bottom" ? scroller.scrollTop : scroller.scrollLeft
    ).toBe(position === "bottom" ? window.innerHeight : 0);
    scroller.dispatchEvent(new Event("scrollend"));
    await Bun.sleep(0);
    flush();
    expect(Object.hasOwn(overlay.dataset, "entering")).toBe(false);
    expect(scroller.style.scrollSnapType).toBe(
      position === "bottom" ? "y mandatory" : "x mandatory"
    );
  }
);
