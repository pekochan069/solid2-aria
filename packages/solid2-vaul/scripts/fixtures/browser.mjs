import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";
import { runInThisContext } from "node:vm";

import { Window } from "happy-dom";

const browser = new Window({ url: "https://vaul-consumer.test" });

for (const key of [
  "window",
  "document",
  "navigator",
  "HTMLElement",
  "HTMLDivElement",
  "HTMLInputElement",
  "HTMLButtonElement",
  "HTMLTextAreaElement",
  "HTMLSelectElement",
  "HTMLAnchorElement",
  "SVGElement",
  "Element",
  "Node",
  "Text",
  "Event",
  "CustomEvent",
  "MouseEvent",
  "KeyboardEvent",
  "FocusEvent",
  "PointerEvent",
  "CSS",
  "DOMRect",
  "MutationObserver",
  "ResizeObserver",
  "NodeFilter",
  "ShadowRoot",
  "DocumentFragment",
  "getComputedStyle",
  "requestAnimationFrame",
  "cancelAnimationFrame",
]) {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    value: browser[key],
    writable: true,
  });
}

const { hydrate } = await import("@solidjs/web");
const { flush } = await import("solid-js");
const { App } = await import("./shared.mjs");

runInThisContext(await readFile("hydration.js", "utf-8"));

const host = document.createElement("main");

document.body.append(host);

host.innerHTML = await readFile("drawer.html", "utf-8");

const originalButton = host.querySelector("button");

assert.ok(originalButton);

const dispose = hydrate(App, host);

flush();

assert.equal(host.querySelector("button"), originalButton);

originalButton.click();

flush();

const dialog = document.querySelector("[role=dialog]");

assert.ok(dialog instanceof HTMLElement);

assert.match(dialog.textContent, /Package title/u);

assert.equal(
  document.querySelector(
    `#${CSS.escape(dialog.getAttribute("aria-labelledby") ?? "")}`
  )?.textContent,
  "Package title"
);

dialog.querySelector("button").click();

flush();

assert.equal(dialog.dataset.state, "closed");

await delay(510);

flush();

assert.equal(document.querySelector("[role=dialog]"), null);

originalButton.click();

flush();

assert.ok(document.querySelector("[role=dialog]"));

dispose();

flush();

assert.equal(document.querySelector("[role=dialog]"), null);

assert.equal(document.documentElement.style.overflow, "");

await browser.happyDOM.close();

console.info(
  "Published browser export, hydration identity, interaction, reopening, and disposal passed."
);
