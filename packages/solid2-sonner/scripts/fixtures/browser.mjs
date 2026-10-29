import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";
import { runInThisContext } from "node:vm";

import { Window } from "happy-dom";

const window = new Window({ url: "https://sonner.test" });

for (const key of [
  "window",
  "document",
  "navigator",
  "HTMLElement",
  "HTMLLIElement",
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
    value: window[key],
    writable: true,
  });
}

const { hydrate, render } = await import("@solidjs/web");
const { createRoot, createSignal, flush } = await import("solid-js");
const { Toaster, toast, useSonner } = await import("@solid2-aria/sonner");

runInThisContext(await readFile("hydration.js", "utf-8"));

const host = document.createElement("div");

document.body.append(host);

host.innerHTML = await readFile("toaster.html", "utf-8");

const serverSection = host.querySelector("section");
const [theme, setTheme] = createSignal("light");

const dispose = hydrate(
  () =>
    Toaster({
      closeButton: true,
      duration: Infinity,
      richColors: true,
      get theme() {
        return theme();
      },
    }),
  host
);

flush();

assert.equal(host.querySelector("section"), serverSection);

const { sonner, stopSonner } = createRoot((stop) => ({
  sonner: useSonner(),
  stopSonner: stop,
}));

flush();

const id = toast.loading("Saving", { id: "save" });

flush();

const item = host.querySelector("[data-sonner-toast]");

assert.ok(item instanceof HTMLElement);

assert.match(item.textContent, /Saving/u);

assert.equal(item.dataset.type, "loading");

toast.success("Saved", { description: "Changes stored", id });

flush();

assert.equal(host.querySelector("[data-sonner-toast]"), item);

assert.equal(item.dataset.type, "success");

assert.match(item.textContent, /Changes stored/u);

assert.equal(sonner.toasts().length, 1);

setTheme("dark");

flush();

const toaster = host.querySelector("[data-sonner-toaster]");

assert.ok(toaster instanceof HTMLElement);

assert.equal(toaster.dataset.sonnerTheme, "dark");

item
  .querySelector("[data-close-button]")
  ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

flush();

await delay(250);

flush();

assert.equal(host.querySelector("[data-sonner-toast]"), null);

assert.equal(sonner.toasts().length, 0);

let actionCalls = 0;

toast("Action", {
  action: {
    label: "Undo",
    onClick(event) {
      actionCalls += 1;
      event.preventDefault();
    },
  },
});

flush();

host
  .querySelector("[data-action]")
  ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

flush();

assert.equal(actionCalls, 1);

assert.equal(host.querySelectorAll("[data-sonner-toast]").length, 1);

const namedHost = document.createElement("div");

document.body.append(namedHost);

const disposeNamed = render(
  () => Toaster({ duration: Infinity, id: "editor" }),
  namedHost
);

flush();

toast("Editor only", { toasterId: "editor" });

flush();

assert.match(namedHost.textContent, /Editor only/u);

assert.doesNotMatch(host.textContent, /Editor only/u);

assert.equal(namedHost.querySelectorAll("[data-sonner-toast]").length, 1);

const promise = toast.promise(Promise.resolve(42), {
  loading: "Pending",
  success: (value) => `Resolved ${value}`,
});

assert.equal(await promise.unwrap(), 42);

flush();

assert.match(host.textContent, /Resolved 42/u);

const custom = toast.custom((customId) => {
  const button = document.createElement("button");
  button.textContent = "Custom close";
  button.addEventListener("click", () => {
    toast.dismiss(customId);
  });

  return button;
});

flush();

assert.match(host.textContent, /Custom close/u);

toast.dismiss(custom);

toast.dismiss();

flush();

await delay(250);

flush();

assert.equal(document.querySelectorAll("[data-sonner-toast]").length, 0);

let autoClosed = 0;

toast("Short lived", {
  duration: 20,
  onAutoClose() {
    autoClosed += 1;
  },
});

flush();

await delay(280);

flush();

assert.equal(autoClosed, 1);

assert.equal(host.querySelector("[data-sonner-toast]"), null);

stopSonner();

disposeNamed();

dispose();

flush();

assert.equal(host.textContent, "");

await window.happyDOM.close();

console.info(
  "DOM hydration, updates, dismissal, actions, named toasters, promises, custom content, timers, and cleanup passed."
);
