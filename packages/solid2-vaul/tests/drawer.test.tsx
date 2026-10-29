import { afterEach, expect, test } from "bun:test";
import { setTimeout as delay } from "node:timers/promises";

import { render } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { createSignal, flush, untrack } from "solid-js";

import { Drawer } from "../src";
import type { DrawerDirection } from "../src";

const cleanups: (() => void)[] = [];

afterEach(async () => {
  for (const cleanup of cleanups.splice(0).toReversed()) {
    cleanup();
  }

  flush();
  await Promise.resolve();
  document.body.replaceChildren();
});

function mount(view: () => JSX.Element) {
  const host = document.createElement("main");
  document.body.append(host);
  const dispose = render(view, host);
  cleanups.push(dispose);
  flush();

  return host;
}

function element<T extends Element>(
  selector: string,
  type: new (...args: never[]) => T
): T {
  const result = document.querySelector(selector);

  if (!(result instanceof type)) {
    throw new TypeError(`Missing ${selector}`);
  }

  return result;
}

function pointer(target: Element, type: string, x = 0, y = 0) {
  target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      button: 0,
      cancelable: true,
      clientX: x,
      clientY: y,
      pointerId: 1,
      pointerType: "mouse",
    })
  );
  flush();
}

function dimensions(target: Element, width = 400, height = 400) {
  target.getBoundingClientRect = () => new DOMRect(0, 0, width, height);
}

function Panel() {
  return (
    <Drawer.Portal>
      <Drawer.Overlay />
      <Drawer.Content>
        <Drawer.Title>Settings</Drawer.Title>
        <Drawer.Description>Change preferences</Drawer.Description>
        <Drawer.Close>Done</Drawer.Close>
      </Drawer.Content>
    </Drawer.Portal>
  );
}

test("opens through its trigger, connects labels, closes with exit presence, and restores focus", async () => {
  let closed = 0;
  mount(() => (
    <Drawer.Root
      onClose={() => {
        closed += 1;
      }}
    >
      <Drawer.Trigger>Open</Drawer.Trigger>
      <Panel />
    </Drawer.Root>
  ));
  const trigger = element("button", HTMLButtonElement);
  trigger.focus();
  expect(document.querySelector("[role=dialog]")).toBeNull();
  trigger.click();
  flush();
  const dialog = element("[role=dialog]", HTMLDivElement);
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  expect(trigger.getAttribute("aria-controls")).toBe(dialog.id);
  expect(
    document.querySelector(
      `#${CSS.escape(dialog.getAttribute("aria-labelledby") ?? "")}`
    )?.textContent
  ).toBe("Settings");
  expect(
    document.querySelector(
      `#${CSS.escape(dialog.getAttribute("aria-describedby") ?? "")}`
    )?.textContent
  ).toBe("Change preferences");
  element("[role=dialog] button", HTMLButtonElement).click();
  flush();
  expect(dialog.dataset.state).toBe("closed");
  expect(closed).toBe(1);
  await Promise.resolve();
  flush();
  expect(document.activeElement).toBe(trigger);
  await delay(510);
  flush();
  expect(document.querySelector("[role=dialog]")).toBeNull();
  trigger.click();
  flush();
  expect(element("[role=dialog]", HTMLDivElement)).not.toBe(dialog);
});

test("controlled requests wait for the parent and follow external changes", () => {
  const [open, setOpen] = createSignal(false);
  const changes: boolean[] = [];
  mount(() => (
    <Drawer.Root
      open={open()}
      onOpenChange={(value) => {
        changes.push(value);
      }}
    >
      <Drawer.Trigger>Open</Drawer.Trigger>
      <Panel />
    </Drawer.Root>
  ));
  element("button", HTMLButtonElement).click();
  flush();
  expect(changes).toEqual([true]);
  expect(document.querySelector("[role=dialog]")).toBeNull();
  setOpen(true);
  flush();
  expect(element("[role=dialog]", HTMLDivElement).dataset.state).toBe("open");
  setOpen(false);
  flush();
  expect(element("[role=dialog]", HTMLDivElement).dataset.state).toBe("closed");
  expect(changes).toEqual([true]);
});

test("escape and outside dismissal are cancellable and non-dismissible drawers stay open", () => {
  const [dismissible, setDismissible] = createSignal(false);
  const [preventEscape, setPreventEscape] = createSignal(false);
  mount(() => (
    <Drawer.Root defaultOpen dismissible={dismissible()}>
      <Drawer.Trigger>Open</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay />
        <Drawer.Content
          onEscapeKeyDown={(event) => {
            if (preventEscape()) {
              event.preventDefault();
            }
          }}
          onPointerDownOutside={(event) => {
            event.preventDefault();
          }}
        >
          <Drawer.Title>Title</Drawer.Title>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  ));
  document.dispatchEvent(
    new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "Escape",
    })
  );
  flush();
  expect(element("[role=dialog]", HTMLDivElement).dataset.state).toBe("open");
  setDismissible(true);
  setPreventEscape(true);
  flush();
  document.dispatchEvent(
    new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "Escape",
    })
  );
  flush();
  pointer(element("[data-vaul-overlay]", HTMLDivElement), "pointerdown");
  expect(element("[role=dialog]", HTMLDivElement).dataset.state).toBe("open");
  setPreventEscape(false);
  flush();
  document.dispatchEvent(
    new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "Escape",
    })
  );
  flush();
  expect(element("[role=dialog]", HTMLDivElement).dataset.state).toBe("closed");
});

test("outside pointer closes only modal drawers", () => {
  const [modal, setModal] = createSignal(false);
  mount(() => (
    <Drawer.Root defaultOpen modal={modal()}>
      <Drawer.Portal>
        <Drawer.Overlay />
        <Drawer.Content>
          <Drawer.Title>Title</Drawer.Title>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  ));
  expect(document.querySelector("[data-vaul-overlay]")).toBeNull();
  pointer(document.body, "pointerdown");
  expect(element("[role=dialog]", HTMLDivElement).dataset.state).toBe("open");
  setModal(true);
  flush();
  pointer(element("[data-vaul-overlay]", HTMLDivElement), "pointerdown");
  expect(element("[role=dialog]", HTMLDivElement).dataset.state).toBe("closed");
});

test.each(["bottom", "top", "left", "right"] satisfies DrawerDirection[])(
  "handle drag dismisses toward %s and ignores content with handleOnly",
  (direction) => {
    let released: boolean | undefined;
    mount(() => (
      <Drawer.Root
        defaultOpen
        direction={direction}
        handleOnly
        onRelease={(_, open) => {
          released = open;
        }}
      >
        <Drawer.Portal>
          <Drawer.Content>
            <Drawer.Handle />
            <Drawer.Title>Title</Drawer.Title>
            <div data-vaul-no-drag>Scroll</div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    ));
    const dialog = element("[role=dialog]", HTMLDivElement);
    dimensions(dialog);
    const handle = element("[data-vaul-handle]", HTMLDivElement);
    const x = { bottom: 0, left: -150, right: 150, top: 0 }[direction];
    const y = { bottom: 150, left: 0, right: 0, top: -150 }[direction];
    pointer(dialog, "pointerdown");
    pointer(dialog, "pointermove", x, y);
    pointer(dialog, "pointerup", x, y);
    expect(dialog.dataset.state).toBe("open");
    pointer(handle, "pointerdown");
    pointer(handle, "pointermove", x, y);
    pointer(handle, "pointerup", x, y);
    expect(dialog.dataset.state).toBe("closed");
    expect(released).toBe(false);
  }
);

test("pointer cancellation resets position without dismissal", () => {
  mount(() => (
    <Drawer.Root defaultOpen handleOnly>
      <Drawer.Content>
        <Drawer.Handle />
        <Drawer.Title>Title</Drawer.Title>
      </Drawer.Content>
    </Drawer.Root>
  ));
  const dialog = element("[role=dialog]", HTMLDivElement);
  dimensions(dialog);
  const handle = element("[data-vaul-handle]", HTMLDivElement);
  pointer(handle, "pointerdown");
  pointer(handle, "pointermove", 0, 80);
  expect(dialog.classList.contains("vaul-dragging")).toBe(true);
  pointer(handle, "pointercancel", 0, 80);
  expect(dialog.dataset.state).toBe("open");
  expect(dialog.classList.contains("vaul-dragging")).toBe(false);
  expect(dialog.style.transform).toContain("0px");
});

test("controlled snap points update geometry and the handle cycles points", () => {
  const [snap, setSnap] = createSignal<number | string | null>(0.25);
  mount(() => (
    <Drawer.Root
      defaultOpen
      snapPoints={[0.25, 0.5, 1]}
      activeSnapPoint={snap()}
      setActiveSnapPoint={(value) => {
        setSnap(value);
      }}
    >
      <Drawer.Content>
        <Drawer.Handle />
        <Drawer.Title>Title</Drawer.Title>
      </Drawer.Content>
    </Drawer.Root>
  ));
  const dialog = element("[role=dialog]", HTMLDivElement);
  expect(dialog.style.transform).toContain(`${window.innerHeight * 0.75}px`);
  const handle = element("[data-vaul-handle]", HTMLDivElement);
  pointer(handle, "pointerdown");
  pointer(handle, "pointerup");
  handle.click();
  flush();
  expect(untrack(snap)).toBe(0.5);
  expect(dialog.style.transform).toContain(`${window.innerHeight * 0.5}px`);
  setSnap(1);
  flush();
  expect(dialog.style.transform).toContain("0px");
});

test("nested escape closes the child and restores the parent transform", () => {
  mount(() => (
    <Drawer.Root defaultOpen>
      <Drawer.Portal>
        <Drawer.Overlay />
        <Drawer.Content data-parent>
          <Drawer.Title>Parent</Drawer.Title>
          <Drawer.NestedRoot>
            <Drawer.Trigger>Nested</Drawer.Trigger>
            <Drawer.Portal>
              <Drawer.Overlay />
              <Drawer.Content data-child>
                <Drawer.Title>Child</Drawer.Title>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.NestedRoot>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  ));
  const parent = element("[data-parent]", HTMLDivElement);
  element("button", HTMLButtonElement).click();
  flush();
  const child = element("[data-child]", HTMLDivElement);
  expect(parent.style.transform).not.toContain("scale(1)");
  document.dispatchEvent(
    new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "Escape",
    })
  );
  flush();
  expect(child.dataset.state).toBe("closed");
  expect(parent.dataset.state).toBe("open");
  expect(parent.style.transform).toContain("scale(1)");
});

test("background and scroll styles restore on disposal, and noBodyStyles preserves body styles", () => {
  const wrapper = document.createElement("div");
  wrapper.dataset.vaulDrawerWrapper = "";
  wrapper.style.transform = "rotate(1deg)";
  document.body.append(wrapper);
  document.body.style.background = "red";
  const [open, setOpen] = createSignal(true);
  mount(() => (
    <Drawer.Root open={open()} shouldScaleBackground>
      <Panel />
    </Drawer.Root>
  ));
  expect(wrapper.style.transform).toContain("scale");
  expect(document.body.style.background).toBe("black");
  expect(document.documentElement.style.overflow).toBe("hidden");
  setOpen(false);
  flush();
  expect(wrapper.style.transform).toBe("rotate(1deg)");
  expect(document.body.style.background).toBe("red");
  expect(document.documentElement.style.overflow).toBe("");
});

test("custom trigger rendering composes a single native button and respects preventDefault", () => {
  mount(() => (
    <Drawer.Root>
      <Drawer.Trigger
        render={(attributes) => <button {...attributes} data-custom />}
        onClick={(event) => {
          event.preventDefault();
        }}
      >
        Open
      </Drawer.Trigger>
      <Panel />
    </Drawer.Root>
  ));
  expect(document.querySelectorAll("button").length).toBe(1);
  element("[data-custom]", HTMLButtonElement).click();
  flush();
  expect(document.querySelector("[role=dialog]")).toBeNull();
});

test("forceMount keeps closed content present without modal effects", () => {
  mount(() => (
    <Drawer.Root>
      <Drawer.Portal forceMount>
        <Drawer.Overlay />
        <Drawer.Content>
          <Drawer.Title>Title</Drawer.Title>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  ));
  expect(element("[role=dialog]", HTMLDivElement).dataset.state).toBe("closed");
  expect(document.documentElement.style.overflow).toBe("");
});

test("noBodyStyles preserves document styles and disabled autofocus leaves the trigger focused", () => {
  document.body.style.background = "navy";
  document.body.style.position = "relative";
  const original = document.body.style.cssText;
  mount(() => (
    <Drawer.Root noBodyStyles>
      <Drawer.Trigger>Open</Drawer.Trigger>
      <Panel />
    </Drawer.Root>
  ));
  const trigger = element("button", HTMLButtonElement);
  trigger.focus();
  trigger.click();
  flush();
  expect(document.body.style.cssText).toBe(original);
  expect(document.documentElement.style.overflow).toBe("");
  expect(document.activeElement).toBe(trigger);
});

test("custom containers own portal placement and reactive snap dimensions", () => {
  const container = document.createElement("section");
  document.body.append(container);
  dimensions(container, 300, 600);
  mount(() => (
    <Drawer.Root defaultOpen container={container} snapPoints={[0.5, 1]}>
      <Panel />
    </Drawer.Root>
  ));
  const dialog = element("[role=dialog]", HTMLDivElement);
  expect(container.contains(dialog)).toBe(true);
  expect(dialog.style.transform).toContain("300px");
  dimensions(container, 300, 800);
  window.dispatchEvent(new Event("resize"));
  flush();
  expect(dialog.style.transform).toContain("400px");
});

test("non-dismissible snap gestures stay at the first point and no-drag descendants do not start gestures", () => {
  const changes: (number | string | null)[] = [];
  mount(() => (
    <Drawer.Root
      defaultOpen
      handleOnly
      dismissible={false}
      snapPoints={[0.25, 1]}
      setActiveSnapPoint={(point) => {
        changes.push(point);
      }}
    >
      <Drawer.Content>
        <Drawer.Handle />
        <div data-vaul-no-drag>
          <span data-inner>Text</span>
        </div>
        <Drawer.Title>Title</Drawer.Title>
      </Drawer.Content>
    </Drawer.Root>
  ));
  const dialog = element("[role=dialog]", HTMLDivElement);
  dimensions(dialog, 400, 800);
  const handle = element("[data-vaul-handle]", HTMLDivElement);
  pointer(handle, "pointerdown");
  pointer(handle, "pointermove", 0, 200);
  pointer(handle, "pointerup", 0, 200);
  expect(dialog.dataset.state).toBe("open");
  expect(dialog.style.transform).toContain(`${window.innerHeight * 0.75}px`);
  const excluded = element("[data-inner]", HTMLElement);
  pointer(excluded, "pointerdown");
  pointer(excluded, "pointermove", 0, 200);
  pointer(excluded, "pointerup", 0, 200);
  expect(changes).toEqual([]);
  expect(dialog.classList.contains("vaul-dragging")).toBe(false);
});

test("interrupted exit callbacks are cancelled and reopening keeps the same content during exit", async () => {
  const [open, setOpen] = createSignal(false);
  const ended: boolean[] = [];
  mount(() => (
    <Drawer.Root
      open={open()}
      onAnimationEnd={(value) => {
        ended.push(value);
      }}
    >
      <Panel />
    </Drawer.Root>
  ));
  setOpen(true);
  flush();
  const dialog = element("[role=dialog]", HTMLDivElement);
  setOpen(false);
  flush();
  setOpen(true);
  flush();
  expect(element("[role=dialog]", HTMLDivElement)).toBe(dialog);
  await delay(510);
  flush();
  expect(ended).toEqual([true]);
  expect(dialog.dataset.state).toBe("open");
});

test("a one-move handle drag does not also cycle the snap point on click", () => {
  const changes: (number | string | null)[] = [];
  mount(() => (
    <Drawer.Root
      defaultOpen
      dismissible={false}
      handleOnly
      snapToSequentialPoint
      snapPoints={[0.25, 0.5, 1]}
      setActiveSnapPoint={(point) => {
        changes.push(point);
      }}
    >
      <Drawer.Content>
        <Drawer.Handle />
        <Drawer.Title>Title</Drawer.Title>
      </Drawer.Content>
    </Drawer.Root>
  ));
  const dialog = element("[role=dialog]", HTMLDivElement);
  dimensions(dialog, 400, 800);
  const handle = element("[data-vaul-handle]", HTMLDivElement);
  pointer(handle, "pointerdown");
  pointer(handle, "pointermove", 0, -120);
  pointer(handle, "pointerup", 0, -120);
  handle.click();
  flush();
  expect(changes).toEqual([0.5]);
});
