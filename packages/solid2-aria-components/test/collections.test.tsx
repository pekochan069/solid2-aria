import { expect, test } from "bun:test";

import { requireValue } from "@solid2-aria/core/utils/require-value";
import { TokenFieldValue } from "@solid2-aria/stately/tokenfield/token-field-value";
import { render } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { createSignal, flush } from "solid-js";

import { Autocomplete } from "../src/autocomplete";
import { Breadcrumbs, Breadcrumb } from "../src/breadcrumbs";
import { Button } from "../src/button";
import { ComboBox } from "../src/combo-box";
import { createDragAndDrop } from "../src/create-drag-and-drop";
import { Header } from "../src/header";
import { Input } from "../src/input";
import { Label } from "../src/label";
import { Link } from "../src/link";
import { ListBox, ListBoxItem, ListBoxSection } from "../src/list-box";
import { Menu, MenuItem, MenuTrigger, SubmenuTrigger } from "../src/menu";
import { Popover } from "../src/popover";
import { SearchField } from "../src/search-field";
import { Select, SelectValue } from "../src/select";
import { Tabs, TabList, Tab, TabPanel } from "../src/tabs";
import { TagGroup, TagList, Tag } from "../src/tag-group";
import { TokenField, TokenInput, Token } from "../src/token-field";

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

function click(element: Element | null | undefined) {
  if (!(element instanceof HTMLElement)) {
    throw new TypeError("Missing interactive element");
  }

  element.click();
  flush();
}

test("listbox options expose selection and disabled behavior", () => {
  const selected: unknown[] = [];

  const app = mount(() => (
    <ListBox
      aria-label="Choice"
      selectionMode="single"
      disabledKeys={["b"]}
      onSelectionChange={(keys) => {
        if (keys !== "all") {
          selected.push(...keys);
        }
      }}
    >
      <ListBoxItem id="a">Alpha</ListBoxItem>
      <ListBoxItem id="b">Beta</ListBoxItem>
    </ListBox>
  ));

  const options = app.host.querySelectorAll('[role="option"]');
  expect(options.length).toBe(2);
  click(options[0]);
  expect(
    requireValue(options[0], "Expected options[0]").getAttribute(
      "aria-selected"
    )
  ).toBe("true");
  expect(selected).toContain("a");
  click(options[1]);
  expect(
    requireValue(options[1], "Expected options[1]").getAttribute(
      "aria-disabled"
    )
  ).toBe("true");
  expect(selected).not.toContain("b");
  app.dispose();
});

test("dynamic listbox collections update without stale nodes", () => {
  const [items, setItems] = createSignal([{ id: "a", name: "Alpha" }]);

  const app = mount(() => (
    <ListBox aria-label="Dynamic" items={items()} selectionMode="single">
      {(item) => <ListBoxItem id={item.id}>{item.name}</ListBoxItem>}
    </ListBox>
  ));

  expect(app.host.querySelectorAll('[role="option"]').length).toBe(1);
  setItems([
    { id: "a", name: "Alpha" },
    { id: "b", name: "Beta" },
  ]);
  flush();
  expect(app.host.querySelectorAll('[role="option"]').length).toBe(2);
  setItems([{ id: "b", name: "Beta" }]);
  flush();
  expect(
    requireValue(
      app.host.querySelector('[role="option"]'),
      "Expected app.host.querySelector('[role=\"option\"]')"
    ).textContent
  ).toBe("Beta");
  app.dispose();
});

test("listbox sections retain headings and child options", () => {
  const app = mount(() => (
    <ListBox aria-label="Sections">
      <ListBoxSection>
        <Header>Letters</Header>
        <ListBoxItem id="a">Alpha</ListBoxItem>
      </ListBoxSection>
    </ListBox>
  ));

  expect(app.host.querySelector('[role="group"]')).not.toBeNull();
  expect(
    requireValue(
      app.host.querySelector('[role="option"]'),
      "Expected app.host.querySelector('[role=\"option\"]')"
    ).textContent
  ).toBe("Alpha");
  expect(app.host.textContent).toContain("Letters");
  app.dispose();
});

test("tabs switch panels", () => {
  const app = mount(() => (
    <Tabs defaultSelectedKey="a">
      <TabList aria-label="Sections">
        <Tab id="a">Alpha</Tab>
        <Tab id="b">Beta</Tab>
      </TabList>
      <TabPanel id="a">Panel A</TabPanel>
      <TabPanel id="b" shouldForceMount>
        Panel B
      </TabPanel>
    </Tabs>
  ));

  const tabs = app.host.querySelectorAll('[role="tab"]');
  expect(tabs.length).toBe(2);
  expect(
    requireValue(tabs[0], "Expected tabs[0]").getAttribute("aria-selected")
  ).toBe("true");
  click(tabs[1]);
  expect(
    requireValue(tabs[1], "Expected tabs[1]").getAttribute("aria-selected")
  ).toBe("true");
  expect(app.host.textContent).toContain("Panel B");
  expect(app.host.textContent).not.toContain("Panel A");
  app.dispose();
});

test("breadcrumbs compose current-page links", () => {
  let action: unknown;

  const app = mount(() => (
    <Breadcrumbs
      onAction={(key) => {
        action = key;
      }}
    >
      <Breadcrumb id="home">
        <Link href="/home">Home</Link>
      </Breadcrumb>
      <Breadcrumb id="current">
        <Link href="/current">Current</Link>
      </Breadcrumb>
    </Breadcrumbs>
  ));

  const links = app.host.querySelectorAll("a,[role=link]");
  expect(links.length).toBe(2);
  expect(
    requireValue(links[1], "Expected links[1]").getAttribute("aria-current")
  ).toBe("page");
  click(links[0]);
  expect(action).toBe("home");
  app.dispose();
});

test("menu actions and selection", () => {
  let action: unknown;

  const app = mount(() => (
    <Menu
      aria-label="Actions"
      selectionMode="single"
      onAction={(key) => {
        action = key;
      }}
    >
      <MenuItem id="a">Alpha</MenuItem>
      <MenuItem id="b">Beta</MenuItem>
    </Menu>
  ));

  const items = app.host.querySelectorAll('[role="menuitemradio"]');
  expect(items.length).toBe(2);
  click(items[1]);
  expect(action).toBe("b");
  expect(
    requireValue(items[1], "Expected items[1]").getAttribute("aria-checked")
  ).toBe("true");
  app.dispose();
});

test("select builds closed popup items and selected text", () => {
  const app = mount(() => (
    <Select defaultValue="a">
      <Label>Choice</Label>
      <Button>
        <SelectValue />
      </Button>
      <Popover>
        <ListBox>
          <ListBoxItem id="a">Alpha</ListBoxItem>
          <ListBoxItem id="b">Beta</ListBoxItem>
        </ListBox>
      </Popover>
    </Select>
  ));

  expect(
    requireValue(
      app.host.querySelector("button"),
      'Expected app.host.querySelector("button")'
    ).textContent
  ).toBe("Alpha");
  expect(
    requireValue(
      app.host.querySelector("select"),
      'Expected app.host.querySelector("select")'
    ).value
  ).toBe("a");
  app.dispose();
});

test("combobox label, input and selected text", () => {
  const app = mount(() => (
    <ComboBox defaultValue="a">
      <Label>Choice</Label>
      <Input />
      <Button>Open</Button>
      <Popover>
        <ListBox>
          <ListBoxItem id="a">Alpha</ListBoxItem>
          <ListBoxItem id="b">Beta</ListBoxItem>
        </ListBox>
      </Popover>
    </ComboBox>
  ));

  const input = requireValue(
    app.host.querySelector("input"),
    'Expected app.host.querySelector("input")'
  );

  expect(input.getAttribute("role")).toBe("combobox");
  expect(input.value).toBe("Alpha");
  expect(
    requireValue(
      app.host.querySelector("label"),
      'Expected app.host.querySelector("label")'
    ).htmlFor
  ).toBe(input.id);
  app.dispose();
});

test("tag removal buttons report keys", () => {
  let removed: Set<string | number> | undefined;

  const app = mount(() => (
    <TagGroup
      onRemove={(keys) => {
        removed = new Set(keys);
      }}
    >
      <Label>Tags</Label>
      <TagList>
        <Tag id="a" textValue="Alpha">
          Alpha<Button slot="remove">Remove</Button>
        </Tag>
      </TagList>
    </TagGroup>
  ));

  expect(app.host.querySelector('[role="grid"]')).not.toBeNull();
  click(app.host.querySelector("button"));
  expect(removed).toEqual(new Set(["a"]));
  app.dispose();
});

test("token fields render editable text and immutable tokens", () => {
  const value = new TokenFieldValue([
    { text: "Hello ", type: "text" },
    { text: "Ada", type: "token", value: { id: 1 } },
  ]);

  const app = mount(() => (
    <TokenField defaultValue={value}>
      <Label>Message</Label>
      <TokenInput>{(segment) => <Token>{segment.text}</Token>}</TokenInput>
    </TokenField>
  ));

  const input = app.host.querySelector('[role="textbox"]');
  expect(input?.getAttribute("contenteditable")).toBe("");
  expect(input?.textContent).toContain("Hello ");
  expect(input?.querySelector('[contenteditable="false"]')?.textContent).toBe(
    "Ada"
  );
  app.dispose();
});

test("controlled listbox selection retains the focused option", () => {
  const [selected, setSelected] = createSignal(new Set<string | number>(["a"]));

  const app = mount(() => (
    <ListBox
      aria-label="Controlled"
      selectionMode="single"
      selectedKeys={selected()}
      onSelectionChange={(keys) => {
        if (keys !== "all") {
          setSelected(new Set(keys));
        }
      }}
    >
      <ListBoxItem id="a">Alpha</ListBoxItem>
      <ListBoxItem id="b">Beta</ListBoxItem>
    </ListBox>
  ));

  const option = requireValue(
    app.host.querySelectorAll('[role="option"]')[1],
    "Expected app.host.querySelectorAll('[role=\"option\"]')[1]"
  );

  click(option);
  expect(option.isConnected).toBe(true);
  expect(option.getAttribute("aria-selected")).toBe("true");
  setSelected(new Set(["a"]));
  flush();
  expect(
    app.host.querySelector('[role="option"]')?.getAttribute("aria-selected")
  ).toBe("true");
  app.dispose();
});

test("select popup changes visible and native form values", () => {
  const app = mount(() => (
    <Select name="choice" defaultValue="a">
      <Label>Choice</Label>
      <Button>
        <SelectValue />
      </Button>
      <Popover>
        <ListBox>
          <ListBoxItem id="a">Alpha</ListBoxItem>
          <ListBoxItem id="b">Beta</ListBoxItem>
        </ListBox>
      </Popover>
    </Select>
  ));

  click(app.host.querySelector("button"));
  const options = document.querySelectorAll('[role="listbox"] [role="option"]');
  expect(options.length).toBe(2);
  click(options[1]);
  expect(app.host.querySelector("button")?.textContent).toBe("Beta");
  expect(app.host.querySelector("select")?.value).toBe("b");
  app.dispose();
});

test("menu trigger opens and closes on item action", () => {
  let acted = false;

  const app = mount(() => (
    <MenuTrigger>
      <Button>Actions</Button>
      <Popover>
        <Menu
          aria-label="Actions"
          onAction={() => {
            acted = true;
          }}
        >
          <MenuItem id="run">Run</MenuItem>
        </Menu>
      </Popover>
    </MenuTrigger>
  ));

  click(app.host.querySelector("button"));
  expect(app.host.querySelector("button")?.getAttribute("aria-expanded")).toBe(
    "true"
  );
  click(document.querySelector('[role="menuitem"]'));
  expect(acted).toBe(true);
  expect(app.host.querySelector("button")?.getAttribute("aria-expanded")).toBe(
    "false"
  );
  app.dispose();
});

test("submenu trigger supplies its nested popup with independent state", () => {
  const app = mount(() => (
    <MenuTrigger defaultOpen>
      <Button>Actions</Button>
      <Popover>
        <Menu aria-label="Root">
          <SubmenuTrigger>
            <MenuItem id="more">More</MenuItem>
            <Popover>
              <Menu aria-label="Nested">
                <MenuItem id="nested">Nested action</MenuItem>
              </Menu>
            </Popover>
          </SubmenuTrigger>
        </Menu>
      </Popover>
    </MenuTrigger>
  ));

  const trigger = document.querySelector(
    '[role="menuitem"][aria-haspopup="menu"]'
  );

  expect(trigger).not.toBeNull();
  click(trigger);
  expect(
    document.querySelector('[role="menu"][aria-label="Nested"]')
  ).not.toBeNull();
  app.dispose();
});

test("autocomplete filters a sibling listbox through a composed search input", () => {
  const app = mount(() => (
    <Autocomplete
      filter={(text, query) => text.toLowerCase().includes(query.toLowerCase())}
    >
      <SearchField aria-label="Search">
        <Input />
      </SearchField>
      <ListBox aria-label="Results">
        <ListBoxItem id="a" textValue="Alpha">
          Alpha
        </ListBoxItem>
        <ListBoxItem id="b" textValue="Beta">
          Beta
        </ListBoxItem>
      </ListBox>
    </Autocomplete>
  ));

  const input = requireValue(
    app.host.querySelector("input"),
    'Expected app.host.querySelector("input")'
  );

  input.value = "bet";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  flush();
  const options = app.host.querySelectorAll('[role="option"]');
  expect(options.length).toBe(1);
  expect(options[0]?.textContent).toBe("Beta");
  app.dispose();
});

function Draggable() {
  const dnd = createDragAndDrop({
    getItems: (keys) => [...keys].map((key) => ({ "text/plain": String(key) })),
  });

  return (
    <ListBox
      aria-label="Draggable"
      selectionMode="single"
      dragAndDropHooks={dnd.dragAndDropHooks}
    >
      <ListBoxItem id="a">Alpha</ListBoxItem>
    </ListBox>
  );
}

test("listbox connects real drag hooks to draggable options", () => {
  const app = mount(() => <Draggable />);
  const option = app.host.querySelector('[role="option"]');
  expect(option?.getAttribute("draggable")).toBe("true");
  expect(
    option instanceof HTMLElement && option.dataset.allowsDragging !== undefined
  ).toBe(true);

  const enter = new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    key: "Enter",
  });

  option?.dispatchEvent(enter);
  expect(enter.defaultPrevented).toBe(true);
  app.dispose();
});

test("listbox arrow keys move DOM focus between options", () => {
  const app = mount(() => (
    <ListBox
      aria-label="Keyboard"
      selectionMode="single"
      defaultSelectedKeys={["a"]}
    >
      <ListBoxItem id="a">Alpha</ListBoxItem>
      <ListBoxItem id="b">Beta</ListBoxItem>
    </ListBox>
  ));

  const list = app.host.querySelector('[role="listbox"]');

  if (!(list instanceof HTMLElement)) {
    throw new TypeError("Missing listbox");
  }

  list.focus();
  flush();
  const first = app.host.querySelector('[role="option"]');

  if (!(first instanceof HTMLElement)) {
    throw new TypeError("Missing option");
  }

  first.focus();
  first.dispatchEvent(
    new KeyboardEvent("keydown", { bubbles: true, key: "ArrowDown" })
  );
  flush();
  expect(document.activeElement?.textContent).toBe("Beta");
  app.dispose();
});
