import { afterEach, expect, test } from "bun:test";

import { render } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { createSignal, flush } from "solid-js";

import { Button } from "../src/button";
import { Dialog, DialogTrigger } from "../src/dialog";
import { Link } from "../src/link";
import { Modal, ModalOverlay } from "../src/modal";
import { OverlayArrow, OverlayArrowContext } from "../src/overlay-arrow";
import { Popover } from "../src/popover";
import { PreviewTrigger } from "../src/preview-trigger";
import { Tooltip, TooltipTrigger } from "../src/tooltip";

const cleanups = new Set<() => void>();

afterEach(() => {
  for (const cleanup of cleanups) {
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

function query(selector: string, root: ParentNode = document) {
  const element = root.querySelector(selector);

  if (!(element instanceof HTMLElement)) {
    throw new TypeError(`Missing HTML element: ${selector}`);
  }

  return element;
}

function keyboardFocus(element: HTMLElement) {
  document.body.dispatchEvent(
    new KeyboardEvent("keydown", { bubbles: true, key: "Tab" })
  );
  element.focus();
  flush();
}

function holdAnimation(element: HTMLElement | null) {
  if (element) {
    Object.defineProperty(element, "getAnimations", {
      configurable: true,
      value: () => [],
    });
  }
}

test("modal entry targets the mounted content on every open", () => {
  const [open, setOpen] = createSignal(false);
  const entries: { element: HTMLElement; connected: boolean }[] = [];
  mount(() => (
    <ModalOverlay
      isOpen={open()}
      onOpenChange={(value) => {
        setOpen(value);
      }}
      onEnter={(element) => {
        entries.push({ connected: element.isConnected, element });
      }}
    >
      <Modal ref={holdAnimation}>
        <Dialog aria-label="Reopen dialog">Content</Dialog>
      </Modal>
    </ModalOverlay>
  ));

  for (let index = 0; index < 3; index += 1) {
    setOpen(true);
    flush();
    expect(entries.at(-1)?.connected).toBe(true);
    expect(entries.at(-1)?.element).toBe(query(".solid2-aria-Modal"));
    setOpen(false);
    flush();
  }
});

test("arrow render styles retain the calculated cross-axis position", () => {
  mount(() => (
    <OverlayArrowContext
      value={{ placement: "bottom", style: { left: "48px" } }}
    >
      <OverlayArrow
        style={(state) => ({
          ...state.defaultStyle,
          transform: "rotate(45deg)",
        })}
      />
    </OverlayArrowContext>
  ));
  expect(query(".solid2-aria-OverlayArrow").style.left).toBe("48px");
  expect(query(".solid2-aria-OverlayArrow").style.transform).toBe(
    "rotate(45deg)"
  );
});

test.each(["top", "bottom", "left", "right"] as const)(
  "%s arrows retain their edge when the positioning offset is undefined",
  (placement) => {
    const vertical = placement === "top" || placement === "bottom";
    mount(() => (
      <OverlayArrowContext
        value={{
          placement,
          style: {
            left: vertical ? "48px" : undefined,
            top: vertical ? undefined : "24px",
          },
        }}
      >
        <OverlayArrow
          style={(state) => ({
            ...state.defaultStyle,
            transform: "rotate(45deg)",
          })}
        />
      </OverlayArrowContext>
    ));
    const arrow = query(".solid2-aria-OverlayArrow");
    expect(arrow.style.getPropertyValue(placement)).toBe("100%");
    expect(arrow.style[vertical ? "left" : "top"]).toBe(
      vertical ? "48px" : "24px"
    );
  }
);

test.each(["top", "left"] as const)(
  "%s arrows retain their edge without custom render styles",
  (placement) => {
    mount(() => (
      <OverlayArrowContext
        value={{ placement, style: { left: undefined, top: undefined } }}
      >
        <OverlayArrow />
      </OverlayArrowContext>
    ));
    expect(
      query(".solid2-aria-OverlayArrow").style.getPropertyValue(placement)
    ).toBe("100%");
  }
);

test("a popover without a nested dialog supplies its role, label, focus, and trigger connection", async () => {
  const host = mount(() => (
    <DialogTrigger>
      <Button>Details</Button>
      <Popover aria-label="Details popover" slot="details">
        Popover content
      </Popover>
    </DialogTrigger>
  ));

  const trigger = query("button", host);
  trigger.click();
  flush();
  const frame = Promise.withResolvers<null>();
  requestAnimationFrame(() => {
    frame.resolve(null);
  });
  await frame.promise;
  flush();
  const popover = query(".solid2-aria-Popover");
  expect(popover.getAttribute("role")).toBe("dialog");
  expect(popover.getAttribute("aria-label")).toBe("Details popover");
  expect(popover.id === trigger.getAttribute("aria-controls")).toBe(true);
  expect(popover.getAttribute("tabindex")).toBe("-1");
  expect(popover.getAttribute("slot")).toBe("details");
  expect(document.activeElement === popover).toBe(true);
  popover.dispatchEvent(
    new KeyboardEvent("keydown", { bubbles: true, key: "Escape" })
  );
  flush();
  expect(document.querySelector(".solid2-aria-Popover")).toBeNull();
});

test("a nested Dialog owns dialog semantics and the trigger ID", () => {
  const host = mount(() => (
    <DialogTrigger>
      <Button>Details</Button>
      <Popover>
        <Dialog aria-label="Nested details">Content</Dialog>
      </Popover>
    </DialogTrigger>
  ));

  const trigger = query("button", host);
  trigger.click();
  flush();
  const popover = query(".solid2-aria-Popover");
  const dialogs = popover.querySelectorAll('[role="dialog"]');
  expect(popover.getAttribute("role")).toBeNull();
  expect(popover.getAttribute("id")).toBeNull();
  expect(dialogs.length).toBe(1);
  expect(
    query('[role="dialog"]', popover).id ===
      trigger.getAttribute("aria-controls")
  ).toBe(true);
});

test("a preview exposes a nonmodal dialog, retains trigger focus, and tabs into its actions", () => {
  const host = mount(() => (
    <PreviewTrigger delay={0} closeDelay={0}>
      <Link href="https://example.com">Example</Link>
      <Popover aria-label="Example preview">
        <Button>Preview action</Button>
      </Popover>
    </PreviewTrigger>
  ));

  const trigger = query("a", host);
  keyboardFocus(trigger);
  const popover = query(".solid2-aria-Popover");
  expect(popover.getAttribute("role")).toBe("dialog");
  expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  expect(trigger.getAttribute("aria-controls")).toBe(popover.id);
  expect(trigger.getAttribute("aria-describedby")).toContain(popover.id);
  expect(popover.getAttribute("aria-label")).toBe("Example preview");
  expect(document.querySelector('[data-testid="underlay"]')).toBeNull();
  expect(document.activeElement === trigger).toBe(true);
  trigger.dispatchEvent(
    new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "Tab",
    })
  );
  flush();
  expect(document.activeElement?.textContent).toBe("Preview action");
  query("button", popover).dispatchEvent(
    new KeyboardEvent("keydown", { bubbles: true, key: "Escape" })
  );
  flush();
  expect(document.querySelector(".solid2-aria-Popover")).toBeNull();
});

test("switching warm previews skips automatic exit and entry animations", () => {
  const { promise: pending } = Promise.withResolvers<undefined>();

  const host = mount(() => (
    <>
      <PreviewTrigger delay={0} closeDelay={0}>
        <Link href="https://example.com/first">First</Link>
        <Popover
          aria-label="First preview"
          ref={holdAnimation}
          // oxlint-disable-next-line solid/reactivity -- This API invokes the async action imperatively.
          onEnter={async () => {
            await pending;
          }}
          // oxlint-disable-next-line solid/reactivity -- This API invokes the async action imperatively.
          onExit={async () => {
            await pending;
          }}
        >
          First content
        </Popover>
      </PreviewTrigger>
      <PreviewTrigger delay={0} closeDelay={0}>
        <Link href="https://example.com/second">Second</Link>
        <Popover
          aria-label="Second preview"
          ref={holdAnimation}
          // oxlint-disable-next-line solid/reactivity -- This API invokes the async action imperatively.
          onEnter={async () => {
            await pending;
          }}
          // oxlint-disable-next-line solid/reactivity -- This API invokes the async action imperatively.
          onExit={async () => {
            await pending;
          }}
        >
          Second content
        </Popover>
      </PreviewTrigger>
    </>
  ));

  keyboardFocus(query('a[href="https://example.com/first"]', host));
  expect(
    query('[aria-label="First preview"]').dataset.entering !== undefined
  ).toBe(true);
  keyboardFocus(query('a[href="https://example.com/second"]', host));
  expect(document.querySelector('[aria-label="First preview"]')).toBeNull();
  const second = query('[aria-label="Second preview"]');
  expect(second.dataset.entering !== undefined).toBe(false);
  expect(document.querySelectorAll(".solid2-aria-Popover").length).toBe(1);
});

test("explicit animation flags take precedence over skipped automatic animations", () => {
  const [open, setOpen] = createSignal(true);
  const [entering, setEntering] = createSignal(true);
  const [exiting, setExiting] = createSignal(false);
  mount(() => (
    <Popover
      isOpen={open()}
      shouldSkipAnimation
      isEntering={entering()}
      isExiting={exiting()}
      aria-label="Explicit animation"
    >
      Content
    </Popover>
  ));
  const popover = query(".solid2-aria-Popover");
  expect(popover.dataset.entering !== undefined).toBe(true);
  setEntering(false);
  setExiting(true);
  setOpen(false);
  flush();
  expect(document.querySelector(".solid2-aria-Popover")).toBe(popover);
  expect(popover.dataset.entering !== undefined).toBe(false);
  expect(popover.dataset.exiting !== undefined).toBe(true);
  setExiting(false);
  flush();
  expect(document.querySelector(".solid2-aria-Popover")).toBeNull();
});

test("switching warm tooltips skips pending CSS animations", () => {
  const { promise: pending } = Promise.withResolvers<undefined>();

  const animate = (element: HTMLDivElement | null) => {
    if (element) {
      Object.defineProperty(element, "getAnimations", {
        configurable: true,
        value: () => [{ finished: pending, playState: "running" }],
      });
    }
  };

  const host = mount(() => (
    <>
      <TooltipTrigger delay={0} closeDelay={0}>
        <Button>First tooltip trigger</Button>
        <Tooltip ref={animate}>First tooltip</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger delay={0} closeDelay={0}>
        <Button>Second tooltip trigger</Button>
        <Tooltip ref={animate}>Second tooltip</Tooltip>
      </TooltipTrigger>
    </>
  ));

  keyboardFocus(query("button:first-of-type", host));
  const first = query('[role="tooltip"]');
  expect(first.textContent).toBe("First tooltip");
  expect(first.dataset.entering !== undefined).toBe(true);
  keyboardFocus(query("button:last-of-type", host));
  const tooltips = document.querySelectorAll('[role="tooltip"]');
  expect(tooltips.length).toBe(1);
  expect(query('[role="tooltip"]').textContent).toBe("Second tooltip");
  expect(query('[role="tooltip"]').dataset.entering !== undefined).toBe(false);
});
