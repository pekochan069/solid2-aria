import { transform } from "@solidjs/compiler";
import { Window } from "happy-dom";

export const PlatformEvent = globalThis.Event;

const window = new Window({ url: "https://solid2-aria.test" });

for (const key of [
  "window",
  "document",
  "navigator",
  "HTMLElement",
  "SVGElement",
  "Element",
  "Node",
  "Text",
  "Event",
  "CustomEvent",
  "InputEvent",
  "HTMLTextAreaElement",
  "HTMLFormElement",
  "HTMLAnchorElement",
  "HTMLLabelElement",
  "HTMLDivElement",
  "HTMLTableElement",
  "HTMLUListElement",
  "HTMLOListElement",
  "IntersectionObserver",
  "MouseEvent",
  "KeyboardEvent",
  "FocusEvent",
  "PointerEvent",
  "CSS",
  "DOMRect",
  "HTMLInputElement",
  "HTMLButtonElement",
  "HTMLSelectElement",
  "HTMLOptionElement",
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
    value: window[key],
    writable: true,
  });
}

Bun.plugin({
  name: "solid-2-test-jsx",
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
