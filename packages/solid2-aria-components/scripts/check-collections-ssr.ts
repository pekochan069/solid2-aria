import assert from "node:assert/strict";

import { transform } from "@solidjs/compiler";
import { isServer, renderToString } from "@solidjs/web";

assert.ok(isServer, "Run this check without browser conditions.");

Bun.plugin({
  name: "solid-collections-ssr",
  setup(builder) {
    builder.onLoad({ filter: /\.tsx$/u }, async ({ path }) => ({
      contents: transform(await Bun.file(path).text(), {
        filename: path,
        generate: "ssr",
        hydratable: true,
      }).code,
      loader: "ts",
    }));
  },
});

const { ListBox, ListBoxItem, ListBoxSection } =
  await import("../src/list-box");

const { Header } = await import("../src/header");
const { Select, SelectValue } = await import("../src/select");
const { ComboBox } = await import("../src/combo-box");
const { Button } = await import("../src/button");
const { Input } = await import("../src/input");
const { Label } = await import("../src/label");
const { Popover } = await import("../src/popover");
const { Tabs, TabList, Tab, TabPanel } = await import("../src/tabs");

const staticList = renderToString(() =>
  ListBox({
    "aria-label": "Static",
    get children() {
      return [
        ListBoxItem({ children: "Alpha", id: "a", textValue: "Alpha" }),
        ListBoxItem({ children: "Beta", id: "b", textValue: "Beta" }),
      ];
    },
    defaultSelectedKeys: ["a"],
    selectionMode: "single",
  })
);

assert.match(staticList, /role="option"[^>]*>Alpha</u);

assert.match(staticList, /aria-selected="true"/u);

assert.doesNotMatch(staticList, /data-empty/u);

const dynamicList = renderToString(() =>
  ListBox({
    "aria-label": "Dynamic",
    children: (item) =>
      ListBoxItem({ children: item.name, id: item.id, textValue: item.name }),
    items: [
      { id: "a", name: "Alpha" },
      { id: "b", name: "Beta" },
    ],
  })
);

assert.match(dynamicList, />Alpha</u);

assert.match(dynamicList, />Beta</u);

const sectioned = renderToString(() =>
  ListBox({
    "aria-label": "Sections",
    get children() {
      return ListBoxSection({
        get children() {
          return [
            Header({ children: "Letters" }),
            ListBoxItem({ children: "Alpha", id: "a", textValue: "Alpha" }),
          ];
        },
      });
    },
  })
);

assert.match(sectioned, />Letters</u);

assert.match(sectioned, />Alpha</u);

assert.match(sectioned, /role="group"/u);

const select = renderToString(() =>
  Select({
    get children() {
      return [
        Label({ children: "Choice" }),
        Button({
          get children() {
            return SelectValue({});
          },
        }),
        Popover({
          get children() {
            return ListBox({
              get children() {
                return ListBoxItem({
                  children: "Alpha",
                  id: "a",
                  textValue: "Alpha",
                });
              },
            });
          },
        }),
      ];
    },
    defaultValue: "a",
    name: "choice",
  })
);

assert.match(select, /solid2-aria-SelectValue[^>]*>Alpha</u);

assert.match(select, /<option[^>]*value="a"/u);

const combo = renderToString(() =>
  ComboBox({
    get children() {
      return [
        Label({ children: "Choice" }),
        Input({}),
        Button({ children: "Open" }),
        Popover({
          get children() {
            return ListBox({
              get children() {
                return ListBoxItem({
                  children: "Alpha",
                  id: "a",
                  textValue: "Alpha",
                });
              },
            });
          },
        }),
      ];
    },
    defaultValue: "a",
  })
);

assert.match(combo, /role="combobox"/u);

assert.match(combo, /value="Alpha"/u);

const tabs = renderToString(() =>
  Tabs({
    get children() {
      return [
        TabList({
          "aria-label": "Sections",
          get children() {
            return [
              Tab({ children: "Alpha", id: "a" }),
              Tab({ children: "Beta", id: "b" }),
            ];
          },
        }),
        TabPanel({ children: "Panel A", id: "a" }),
        TabPanel({ children: "Panel B", id: "b" }),
      ];
    },
    defaultSelectedKey: "a",
  })
);

assert.match(tabs, /role="tab"/u);

assert.match(tabs, />Panel A</u);

assert.doesNotMatch(tabs, />Panel B</u);

console.info(
  "Server collections rendered static/dynamic items, section headings, selected form values, combobox inputs, and active tab panels."
);
