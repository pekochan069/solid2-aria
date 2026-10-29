import { transform } from "@solidjs/compiler";
import { Window } from "happy-dom";

const browser = new Window({ url: "https://vaul.test" });

for (const key of [
  "window",
  "document",
  "navigator",
  "HTMLElement",
  "HTMLInputElement",
  "HTMLButtonElement",
  "HTMLDivElement",
  "HTMLTextAreaElement",
  "HTMLSelectElement",
  "HTMLAnchorElement",
  "HTMLFormElement",
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
] as const) {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    value: browser[key],
    writable: true,
  });
}

Bun.plugin({
  name: "solid-2-tests",
  setup(builder) {
    builder.onLoad({ filter: /\.tsx$/u }, async ({ path }) => ({
      contents: transform(await Bun.file(path).text(), {
        dev: true,
        filename: path,
        generate: "dom",
        hydratable: true,
      }).code,
      loader: "ts",
    }));
  },
});
