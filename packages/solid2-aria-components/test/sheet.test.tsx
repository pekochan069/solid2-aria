import { afterEach, expect, test } from "bun:test";

import { I18nProvider } from "@solid2-aria/core/i18n/i18n-provider";
import { render } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { untrack, createSignal, flush } from "solid-js";

import { Sheet, SheetOverlay, SheetBackdrop, SheetContent } from "../src/sheet";

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
  let mounted = true;

  const cleanup = () => {
    if (!mounted) {
      return;
    }

    mounted = false;
    dispose();
    host.remove();
    flush();
  };

  cleanups.add(cleanup);

  return { dispose: cleanup, host };
}

function size(element: HTMLDivElement | null, height = 400, width = 320) {
  if (element) {
    Object.defineProperties(element, {
      offsetHeight: { configurable: true, value: height },
      offsetWidth: { configurable: true, value: width },
    });
  }
}

function swipe(
  element: HTMLElement,
  from: number,
  to: number,
  axis: "x" | "y" = "y",
  pointerType = "mouse"
) {
  for (const [type, coordinate] of [
    ["pointerdown", from],
    ["pointermove", to],
    ["pointerup", to],
  ] as const) {
    element.dispatchEvent(
      new PointerEvent(type, {
        bubbles: true,
        button: 0,
        cancelable: true,
        clientX: axis === "x" ? coordinate : 100,
        clientY: axis === "y" ? coordinate : 100,
        pointerId: 1,
        pointerType,
      })
    );
    flush();
  }
}

function query(selector: string) {
  const element = document.querySelector<HTMLElement>(selector);

  if (!element) {
    throw new Error(`Missing element: ${selector}`);
  }

  return element;
}

function sheet() {
  return query(".solid2-aria-Sheet");
}

function scroll() {
  return query("[data-sheet-scroll]");
}

test("sheet snap points initialize in supplied order, expand and swipe to dismiss", () => {
  const [open, setOpen] = createSignal(true);

  const app = mount(() => (
    <SheetOverlay
      isOpen={open()}
      onOpenChange={(value) => {
        setOpen(value);
      }}
      snapPoints={[100, "100%"]}
    >
      <SheetBackdrop />
      <Sheet
        ref={(element) => {
          size(element);
        }}
      >
        {(state) => (
          <SheetContent aria-label="Snapping sheet">
            {state.isExpanded ? "Expanded" : "Partial"}
          </SheetContent>
        )}
      </Sheet>
    </SheetOverlay>
  ));

  expect(scroll().scrollTop).toBe(window.innerHeight - 300);
  expect(sheet().dataset.expanded !== undefined).toBe(false);
  expect(query('[role="dialog"]').textContent).toBe("Partial");
  swipe(sheet(), 400, 100);
  expect(scroll().scrollTop).toBe(window.innerHeight);
  expect(sheet().dataset.expanded !== undefined).toBe(true);
  expect(query('[role="dialog"]').textContent).toBe("Expanded");
  swipe(sheet(), 100, 650);
  expect(untrack(() => open())).toBe(false);
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  app.dispose();
});

test("touch dragging a handle dismisses while content retains native scrolling", () => {
  mount(() => (
    <SheetOverlay defaultOpen>
      <Sheet
        ref={(element) => {
          size(element);
        }}
      >
        <SheetContent aria-label="Touch sheet">
          <div data-sheet-drag-handle style={{ "touch-action": "none" }}>
            Handle
          </div>
          <div data-content>Scrollable content</div>
        </SheetContent>
      </Sheet>
    </SheetOverlay>
  ));

  swipe(query("[data-content]"), 100, 500, "y", "touch");
  expect(document.querySelector('[role="dialog"]')).not.toBeNull();
  swipe(query("[data-sheet-drag-handle]"), 100, 500, "y", "touch");
  expect(document.querySelector('[role="dialog"]')).toBeNull();
});

test("a handle continues expanding when the pointer leaves the sheet", () => {
  mount(() => (
    <SheetOverlay defaultOpen snapPoints={[100, 400]}>
      <Sheet
        ref={(element) => {
          size(element);
        }}
      >
        <SheetContent aria-label="Expandable sheet">
          <div data-sheet-drag-handle>Handle</div>
        </SheetContent>
      </Sheet>
    </SheetOverlay>
  ));

  for (const [type, target, clientY] of [
    ["pointerdown", query("[data-sheet-drag-handle]"), 400],
    ["pointermove", document, 0],
    ["pointerup", document, 0],
  ] as const) {
    target.dispatchEvent(
      new PointerEvent(type, {
        bubbles: true,
        button: 0,
        clientY,
        pointerId: 1,
        pointerType: "mouse",
      })
    );
    flush();
  }

  expect(sheet().dataset.expanded !== undefined).toBe(true);
});

test.each(["mouse", "touch"])(
  "%s handle dragging ignores scrollend until the pointer is released",
  (pointerType) => {
    mount(() => (
      <SheetOverlay defaultOpen>
        <Sheet
          ref={(element) => {
            size(element);
          }}
        >
          <SheetContent aria-label="Draggable sheet">
            <div data-sheet-drag-handle>Handle</div>
          </SheetContent>
        </Sheet>
      </SheetOverlay>
    ));

    const handle = query("[data-sheet-drag-handle]");
    const scroller = scroll();
    const initial = scroller.scrollTop;

    for (const [type, clientY] of [
      ["pointerdown", 100],
      ["pointermove", 220],
      ["pointermove", 400],
    ] as const) {
      handle.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          button: 0,
          cancelable: true,
          clientY,
          pointerId: 1,
          pointerType,
        })
      );
      flush();
      scroller.dispatchEvent(new Event("scrollend"));
      flush();

      expect(scroller.scrollTop).toBe(initial - (clientY - 100));
      expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    }

    handle.dispatchEvent(
      new PointerEvent("pointerup", {
        bubbles: true,
        button: 0,
        clientY: 400,
        pointerId: 1,
        pointerType,
      })
    );
    flush();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  }
);

test("preventDismissal clamps at the smallest snap while allowing expansion", () => {
  const [open, setOpen] = createSignal(true);

  const app = mount(() => (
    <SheetOverlay
      isOpen={open()}
      onOpenChange={(value) => {
        setOpen(value);
      }}
      preventDismissal
      snapPoints={["25%", 400]}
    >
      <SheetBackdrop data-testid="backdrop" />
      <Sheet
        ref={(element) => {
          size(element);
        }}
      >
        <SheetContent aria-label="Persistent">Keep open</SheetContent>
      </Sheet>
    </SheetOverlay>
  ));

  expect(scroll().scrollTop).toBe(0);
  swipe(sheet(), 100, 650);
  expect(untrack(() => open())).toBe(true);
  expect(scroll().scrollTop).toBe(0);
  swipe(sheet(), 400, 100);
  expect(sheet().dataset.expanded !== undefined).toBe(true);
  expect(scroll().scrollTop).toBe(300);
  query('[data-testid="backdrop"]').click();
  sheet().dispatchEvent(
    new KeyboardEvent("keydown", { bubbles: true, key: "Escape" })
  );
  flush();
  expect(untrack(() => open())).toBe(true);
  app.dispose();
});

test("sheet yields a pointer gesture to scrollable descendants", () => {
  const app = mount(() => (
    <SheetOverlay defaultOpen snapPoints={[400]}>
      <Sheet
        ref={(element) => {
          size(element);
        }}
      >
        <SheetContent aria-label="Scrollable">
          <div
            data-testid="scroll-content"
            style={{ "overflow-y": "auto" }}
            ref={(element) => {
              Object.defineProperties(element, {
                clientHeight: { value: 100 },
                scrollHeight: { value: 500 },
              });
              element.scrollTop = 100;
            }}
          >
            Scrollable content
          </div>
        </SheetContent>
      </Sheet>
    </SheetOverlay>
  ));

  const position = scroll().scrollTop;

  const child = query('[data-testid="scroll-content"]');

  swipe(child, 100, 250);
  expect(scroll().scrollTop).toBe(position);
  expect(query('[role="dialog"]')).not.toBeNull();
  app.dispose();
});

test("logical placement mirrors in RTL and content defines the physical swipe timeline", () => {
  const app = mount(() => (
    <I18nProvider locale="ar-AE">
      <SheetOverlay defaultOpen position="start" swipeDirection="end">
        <Sheet
          ref={(element) => {
            size(element);
          }}
        >
          <SheetContent aria-label="RTL">Details</SheetContent>
        </Sheet>
      </SheetOverlay>
    </I18nProvider>
  ));

  expect(sheet().dataset.position).toBe("right");
  expect(sheet().dataset.swipeDirection).toBe("left");
  expect(scroll().style.direction).toBe("ltr");
  expect(scroll().style.overflowX).toBe("auto");
  expect(
    query("[data-sheet-content]").style.getPropertyValue("view-timeline-axis")
  ).toBe("x");
  app.dispose();
});

test("sheet snap geometry follows scroll events and preserves the first configured detent", () => {
  const app = mount(() => (
    <SheetOverlay defaultOpen snapPoints={[300, 100, 400]}>
      <Sheet
        ref={(element) => {
          size(element);
        }}
      >
        <SheetContent aria-label="Native scrolling">Contents</SheetContent>
      </Sheet>
    </SheetOverlay>
  ));

  expect(scroll().scrollTop).toBe(window.innerHeight - 100);
  expect(query("[data-sheet-initial]").style.top).toBe("300px");
  scroll().scrollTop = window.innerHeight;
  scroll().dispatchEvent(new Event("scroll"));
  flush();
  expect(sheet().dataset.expanded !== undefined).toBe(true);
  app.dispose();
});

test("stacked sheets expose descendant state and compose timeline-driven animations", () => {
  const originalSupports = CSS.supports;
  Object.defineProperty(CSS, "supports", {
    configurable: true,
    value: () => true,
  });
  cleanups.add(() => {
    Object.defineProperty(CSS, "supports", {
      configurable: true,
      value: originalSupports,
    });
  });
  document.documentElement.style.setProperty("timeline-scope", "--existing");
  cleanups.add(() => {
    document.documentElement.style.removeProperty("timeline-scope");
  });
  const [childOpen, setChildOpen] = createSignal(true);

  const app = mount(() => (
    <SheetOverlay defaultOpen>
      <Sheet
        data-testid="parent"
        stackAnimation="stack"
        swipeAnimation="reveal"
        ref={(element) => {
          size(element);
        }}
      >
        <SheetContent aria-label="Parent">
          Parent
          <SheetOverlay
            isOpen={childOpen()}
            onOpenChange={(value) => {
              setChildOpen(value);
            }}
            position="top"
          >
            <SheetBackdrop
              swipeAnimation="fade"
              swipeAnimationRange={{ end: 1, start: 0 }}
              data-testid="child-backdrop"
            />
            <Sheet
              data-testid="child"
              ref={(element) => {
                size(element);
              }}
            >
              <SheetContent aria-label="Child">Child</SheetContent>
            </Sheet>
          </SheetOverlay>
        </SheetContent>
      </Sheet>
    </SheetOverlay>
  ));

  const parent = query('[data-testid="parent"]');
  const child = query('[data-testid="child"]');
  expect(document.querySelectorAll('[data-testid="child"]').length).toBe(1);
  expect(parent.dataset.stackIndex).toBe("0");
  expect(child.dataset.stackIndex).toBe("1");
  expect(parent.dataset.hasDescendants !== undefined).toBe(true);
  expect(parent.style.animationName).toBe("reveal, stack");
  expect(parent.style.getPropertyValue("animation-timeline")).toBe(
    "--sheet-timeline-0, --sheet-timeline-1"
  );
  expect(
    document.documentElement.style.getPropertyValue("timeline-scope")
  ).toContain("--existing");

  const backdrop = query('[data-testid="child-backdrop"]');

  expect(backdrop.style.animationName).toBe("fade");
  expect(backdrop.style.animationDirection).toBe("reverse");
  expect(backdrop.style.getPropertyValue("animation-range")).toBe(
    "exit calc(100% - 100%) exit calc(100% - 0%)"
  );
  setChildOpen(false);
  flush();
  expect(parent.dataset.hasDescendants !== undefined).toBe(false);
  expect(parent.style.animationName).toBe("reveal");
  app.dispose();
  expect(
    document.documentElement.style.getPropertyValue("timeline-scope")
  ).toBe("--existing");
});
