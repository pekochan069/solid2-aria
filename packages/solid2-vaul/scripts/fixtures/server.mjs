import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";

import { Drawer } from "@solid2-aria/vaul";
import { generateHydrationScript, renderToString } from "@solidjs/web";

import { App } from "./shared.mjs";

const html = renderToString(App);

assert.match(html, /Open drawer/u);

assert.doesNotMatch(html, /role="dialog"/u);

await writeFile("drawer.html", html);

const hydration = /<script>(?<code>[\s\S]*?)<\/script>/u.exec(
  generateHydrationScript()
)?.groups?.code;

assert.ok(hydration !== undefined && hydration.length > 0);

await writeFile("hydration.js", hydration);

const inline = renderToString(() =>
  Drawer.Root({
    get children() {
      return Drawer.Content({
        get children() {
          return Drawer.Title({ children: "Server title" });
        },
      });
    },
    defaultOpen: true,
  })
);

assert.match(inline, /role="dialog"/u);

assert.match(inline, /Server title/u);

assert.match(inline, /data-state="open"/u);

console.info(
  "Server import, inline content SSR, and client-only portal SSR passed."
);
