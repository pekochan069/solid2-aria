/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/resizable.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native pointer and keyboard resizing, panel flex layout, and upstream separator hit areas.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Regenerate with bun run generate:ui; local edits are replaced.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import type { ComponentProps, JSX } from "@solidjs/web";
import { cn } from "cn";
import {
  createContext,
  useContext,
  createSignal,
  createUniqueId,
  omit,
} from "solid-js";

const ResizableContext = createContext<{
  orientation?: "horizontal" | "vertical";
  onLayoutChanged?: (sizes: number[]) => void;
}>();

function ResizablePanelGroup(
  props: ComponentProps<"div"> & {
    orientation?: "horizontal" | "vertical";
    onLayoutChanged?: (sizes: number[]) => void;
  }
) {
  const rest = omit(props, "class", "orientation", "onLayoutChanged");

  return (
    <ResizableContext value={props}>
      <div
        {...rest}
        data-slot="resizable-panel-group"
        data-orientation={props.orientation ?? "horizontal"}
        class={cn(
          "flex h-full w-full data-[orientation=vertical]:flex-col",
          props.class
        )}
      />
    </ResizableContext>
  );
}

function ResizablePanel(
  props: ComponentProps<"div"> & {
    defaultSize?: number;
    minSize?: number;
    maxSize?: number;
  }
) {
  const rest = omit(props, "defaultSize", "minSize", "maxSize", "style");
  const id = createUniqueId();

  const style = () => {
    const css: JSX.CSSProperties = {};

    if (typeof props.style === "object") {
      Object.assign(css, props.style);
    }

    Object.assign(css, {
      display: "flex",
      "flex-basis": `${props.defaultSize ?? 50}%`,
      "flex-grow": 1,
      "flex-shrink": 1,
      "min-height": 0,
      "min-width": 0,
      overflow: "hidden",
    });

    return css;
  };

  return (
    <div
      {...rest}
      id={props.id ?? id}
      data-slot="resizable-panel"
      data-min-size={props.minSize ?? 0}
      data-max-size={props.maxSize ?? 100}
      style={style()}
    />
  );
}

const pair = (element: HTMLDivElement) => {
  const before = element.previousElementSibling;
  const after = element.nextElementSibling;

  return before instanceof HTMLElement && after instanceof HTMLElement
    ? { after, before }
    : undefined;
};

function ResizableHandle(
  props: ComponentProps<"div"> & {
    withHandle?: boolean;
  }
) {
  const context = useContext(ResizableContext);
  const [value, setValue] = createSignal(50);
  const [controls, setControls] = createSignal<string>();

  let origin:
    | {
        pointer: number;
        before: number;
        after: number;
        total: number;
      }
    | undefined;

  const horizontal = () => context.orientation !== "vertical";

  const resize = (element: HTMLDivElement, next: number, total: number) => {
    const panels = pair(element);

    if (!panels) {
      return;
    }

    const low = Math.max(
      Number(panels.before.dataset.minSize ?? 0),
      total - Number(panels.after.dataset.maxSize ?? 100)
    );

    const high = Math.min(
      Number(panels.before.dataset.maxSize ?? 100),
      total - Number(panels.after.dataset.minSize ?? 0)
    );

    const size = Math.min(high, Math.max(low, next));
    panels.before.style.flex = `0 0 ${size}%`;
    panels.after.style.flex = `0 0 ${total - size}%`;
    setValue(size);
    setControls(panels.before.id);
    const parent = element.parentElement;

    if (parent) {
      context.onLayoutChanged?.(
        [...parent.children].flatMap((child) =>
          child instanceof HTMLElement &&
          child.dataset.slot === "resizable-panel"
            ? [Number(child.style.flexBasis.replace(/%$/u, ""))]
            : []
        )
      );
    }
  };

  const geometry = (
    element: HTMLDivElement
  ): { after: number; before: number; total: number } | null => {
    const panels = pair(element);

    if (!panels || !element.parentElement) {
      return null;
    }

    const parent = element.parentElement.getBoundingClientRect();
    const size = horizontal() ? parent.width : parent.height;

    if (!size) {
      return null;
    }

    const a = panels.before.getBoundingClientRect();
    const b = panels.after.getBoundingClientRect();

    return {
      after: ((horizontal() ? b.width : b.height) / size) * 100,
      before: ((horizontal() ? a.width : a.height) / size) * 100,
      total: size,
    };
  };

  const rest = omit(
    props,
    "class",
    "withHandle",
    "children",
    "onPointerDown",
    "onPointerMove",
    "onPointerUp",
    "onPointerCancel",
    "onKeyDown"
  );

  return (
    <div
      {...rest}
      data-slot="resizable-handle"
      role="separator"
      tabindex={0}
      aria-orientation={horizontal() ? "vertical" : "horizontal"}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value()}
      aria-controls={controls()}
      class={cn(
        "bg-border ring-offset-background focus-visible:ring-ring relative flex shrink-0 items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:outline-hidden aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-1 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2 [&[aria-orientation=horizontal]>div]:rotate-90",
        horizontal() ? "w-px cursor-col-resize" : "h-px cursor-row-resize",
        props.class
      )}
      onPointerDown={(event) => {
        const sizes = geometry(event.currentTarget);

        if (!sizes) {
          return;
        }

        event.preventDefault();
        origin = {
          pointer: horizontal() ? event.clientX : event.clientY,
          ...sizes,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (origin) {
          resize(
            event.currentTarget,
            origin.before +
              (((horizontal() ? event.clientX : event.clientY) -
                origin.pointer) /
                origin.total) *
                100,
            origin.before + origin.after
          );
        }
      }}
      onPointerUp={(event) => {
        origin = undefined;

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      }}
      onPointerCancel={() => {
        origin = undefined;
      }}
      onKeyDown={(event) => {
        const panels = pair(event.currentTarget);

        if (!panels) {
          return;
        }

        const before =
          Number(panels.before.style.flexBasis.replace(/%$/u, "")) || value();

        const after =
          Number(panels.after.style.flexBasis.replace(/%$/u, "")) ||
          100 - before;

        const decrease = horizontal() ? "ArrowLeft" : "ArrowUp";
        const increase = horizontal() ? "ArrowRight" : "ArrowDown";

        if (![decrease, increase, "Home", "End"].includes(event.key)) {
          return;
        }

        event.preventDefault();

        let next =
          before +
          (event.key === increase ? 1 : -1) * (event.shiftKey ? 10 : 1);

        if (event.key === "Home") {
          next = 0;
        } else if (event.key === "End") {
          next = 100;
        }

        resize(event.currentTarget, next, before + after);
      }}
    >
      {(props.withHandle ?? false) && (
        <div class="bg-border z-10 flex h-6 w-1 shrink-0 rounded-lg" />
      )}
    </div>
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
