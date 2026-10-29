import { expect, test, afterEach } from "bun:test";
import assert from "node:assert/strict";

import { requireValue } from "@solid2-aria/core/utils/require-value";
import { ToastQueue } from "@solid2-aria/stately/toast/create-toast-state";
import { render } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { untrack, flush, createSignal } from "solid-js";

import { Button } from "../src/button";
import { Dialog, DialogTrigger } from "../src/dialog";
import {
  Disclosure,
  DisclosurePanel,
  DisclosureGroup,
} from "../src/disclosure";
import { Heading } from "../src/heading";
import { Modal, ModalOverlay } from "../src/modal";
import { Popover } from "../src/popover";
import {
  Sheet,
  SheetTrigger,
  SheetOverlay,
  SheetBackdrop,
  SheetContent,
} from "../src/sheet";
import {
  UNSTABLE_Toast,
  UNSTABLE_ToastContent,
  UNSTABLE_ToastRegion,
} from "../src/toast";
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
  flush();
  cleanups.add(() => {
    dispose();
    host.remove();
    flush();
  });

  return {
    dispose() {
      dispose();
      host.remove();
      flush();
    },
    host,
  };
}

test("dialog trigger opens a modal, labels its dialog, and closes through a slotted button", () => {
  const app = mount(() => (
    <DialogTrigger>
      <Button>Open dialog</Button>
      <Modal>
        <Dialog>
          <Heading slot="title">Title</Heading>
          <Button slot="close">Done</Button>
        </Dialog>
      </Modal>
    </DialogTrigger>
  ));

  expect(document.querySelector('[role="dialog"]')).toBeNull();
  requireValue(
    app.host.querySelector("button"),
    'Expected app.host.querySelector("button")'
  ).click();
  flush();

  const dialog = requireValue(
    document.querySelector('[role="dialog"]'),
    "Expected document.querySelector('[role=\"dialog\"]')"
  );

  expect(dialog).not.toBeNull();
  expect(dialog.getAttribute("aria-labelledby")).toContain(
    requireValue(
      dialog.querySelector("h3"),
      'Expected dialog.querySelector("h3")'
    ).id
  );
  requireValue(
    dialog.querySelector("button"),
    'Expected dialog.querySelector("button")'
  ).click();
  flush();
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  app.dispose();
});

test("controlled popover updates and Escape requests dismissal", () => {
  const [open, setOpen] = createSignal(true);
  const trigger = document.createElement("button");
  document.body.append(trigger);

  const app = mount(() => (
    <Popover
      isOpen={open()}
      onOpenChange={(value) => {
        setOpen(value);
      }}
      triggerRef={() => trigger}
    >
      <Dialog aria-label="Details">Content</Dialog>
    </Popover>
  ));

  expect(document.querySelector('[role="dialog"]')).not.toBeNull();
  requireValue(
    document.querySelector('[role="dialog"]'),
    "Expected document .querySelector('[role=\"dialog\"]')"
  ).dispatchEvent(
    new KeyboardEvent("keydown", { bubbles: true, key: "Escape" })
  );
  flush();
  expect(untrack(() => open())).toBe(false);
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  setOpen(true);
  flush();
  expect(document.querySelector('[role="dialog"]')).not.toBeNull();
  app.dispose();
  trigger.remove();
});

test("nested modals mount once and retain the parent dialog when dismissed", () => {
  const [childOpen, setChildOpen] = createSignal(true);

  const app = mount(() => (
    <Modal defaultOpen>
      <Dialog aria-label="Parent dialog">
        <input aria-label="Parent value" />
        <ModalOverlay
          isOpen={childOpen()}
          onOpenChange={(value) => {
            setChildOpen(value);
          }}
        >
          <Modal>
            <Dialog aria-label="Child dialog">
              <Button slot="close">Close child</Button>
            </Dialog>
          </Modal>
        </ModalOverlay>
      </Dialog>
    </Modal>
  ));

  const parent = document.querySelector('[aria-label="Parent dialog"]');
  const input = parent?.querySelector("input");

  assert.ok(parent);
  assert.ok(input);
  expect(document.querySelectorAll('[aria-label="Child dialog"]').length).toBe(
    1
  );
  input.value = "Keep this value";

  const closeButton = document.querySelector<HTMLButtonElement>(
    '[aria-label="Child dialog"] button'
  );

  assert.ok(closeButton);
  closeButton.click();
  flush();
  expect(untrack(() => childOpen())).toBe(false);
  expect(document.querySelector('[aria-label="Child dialog"]')).toBeNull();
  expect(
    document.querySelector('[aria-label="Parent dialog"]') === parent
  ).toBe(true);
  expect(parent.querySelector("input") === input).toBe(true);
  expect(input.value).toBe("Keep this value");
  setChildOpen(true);
  flush();
  expect(document.querySelectorAll('[aria-label="Child dialog"]').length).toBe(
    1
  );
  app.dispose();
  expect(document.querySelector('[aria-label="Parent dialog"]')).toBeNull();
  expect(document.querySelector('[aria-label="Child dialog"]')).toBeNull();
});

test("disclosure group keeps one expanded panel and connects controls", () => {
  const app = mount(() => (
    <DisclosureGroup>
      <Disclosure id="a">
        <Button slot="trigger">First</Button>
        <DisclosurePanel>A</DisclosurePanel>
      </Disclosure>
      <Disclosure id="b">
        <Button slot="trigger">Second</Button>
        <DisclosurePanel>B</DisclosurePanel>
      </Disclosure>
    </DisclosureGroup>
  ));

  const buttons = app.host.querySelectorAll("button");
  requireValue(buttons[0], "Expected buttons[0]").click();
  flush();
  expect(
    requireValue(buttons[0], "Expected buttons[0]").getAttribute(
      "aria-expanded"
    )
  ).toBe("true");
  expect(
    requireValue(buttons[0], "Expected buttons[0]").getAttribute(
      "aria-controls"
    )
  ).toBe(
    requireValue(
      app.host.querySelector('[role="group"]'),
      "Expected app.host.querySelector('[role=\"group\"]')"
    ).id
  );
  requireValue(buttons[1], "Expected buttons[1]").click();
  flush();
  expect(
    requireValue(buttons[0], "Expected buttons[0]").getAttribute(
      "aria-expanded"
    )
  ).toBe("false");
  expect(
    requireValue(buttons[1], "Expected buttons[1]").getAttribute(
      "aria-expanded"
    )
  ).toBe("true");
  app.dispose();
});

test("tooltip trigger connects a focused trigger to its description", () => {
  const [open, setOpen] = createSignal(true);

  const app = mount(() => (
    <TooltipTrigger
      isOpen={open()}
      onOpenChange={(value) => {
        setOpen(value);
      }}
      delay={0}
    >
      <Button>Help</Button>
      <Tooltip>Helpful detail</Tooltip>
    </TooltipTrigger>
  ));

  const tooltip = requireValue(
    document.querySelector('[role="tooltip"]'),
    "Expected document.querySelector('[role=\"tooltip\"]')"
  );

  expect(tooltip?.textContent).toBe("Helpful detail");
  expect(
    requireValue(
      app.host.querySelector("button"),
      'Expected app.host.querySelector("button")'
    ).getAttribute("aria-describedby")
  ).toContain(tooltip.id);
  setOpen(false);
  flush();
  expect(document.querySelector('[role="tooltip"]')).toBeNull();
  app.dispose();
});

test("toast queue renders a toast and close slot removes it", () => {
  const queue = new ToastQueue<string>();
  queue.add("Saved");

  const app = mount(() => (
    <UNSTABLE_ToastRegion queue={queue}>
      {({ toast }) => (
        <UNSTABLE_Toast toast={toast}>
          <UNSTABLE_ToastContent>
            <Heading slot="title">{toast.content}</Heading>
            <Button slot="close">Dismiss notification</Button>
          </UNSTABLE_ToastContent>
        </UNSTABLE_Toast>
      )}
    </UNSTABLE_ToastRegion>
  ));

  const region = requireValue(
    document.querySelector('[role="region"]'),
    "Expected document.querySelector('[role=\"region\"]')"
  );

  expect(region).not.toBeNull();
  expect(region.textContent).toContain("Saved");
  requireValue(
    region.querySelector("button"),
    'Expected region.querySelector("button")'
  ).click();
  flush();
  expect(queue.visibleToasts.length).toBe(0);
  app.dispose();
});

test("sheet trigger opens and its dialog close control dismisses the sheet", () => {
  const app = mount(() => (
    <SheetTrigger>
      <Button>Open sheet</Button>
      <SheetOverlay>
        <SheetBackdrop />
        <Sheet>
          <SheetContent aria-label="Sheet">
            <Button slot="close">Close sheet</Button>
          </SheetContent>
        </Sheet>
      </SheetOverlay>
    </SheetTrigger>
  ));

  requireValue(
    app.host.querySelector("button"),
    'Expected app.host.querySelector("button")'
  ).click();
  flush();

  const dialog = requireValue(
    document.querySelector('[role="dialog"]'),
    "Expected document.querySelector('[role=\"dialog\"]')"
  );

  expect(dialog).not.toBeNull();
  expect(document.querySelector('[data-position="bottom"]')).not.toBeNull();
  requireValue(
    dialog.querySelector("button"),
    'Expected dialog.querySelector("button")'
  ).click();
  flush();
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  app.dispose();
});
