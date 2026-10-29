/*
 * Derived from Vaul (https://github.com/emilkowalski/vaul): src/index.tsx.
 * Copyright (c) 2023 Emil Kowalski
 * Modified for Solid Aria: Solid 2 components, contexts, callback refs, portals, presence, and native DOM event composition.
 * MIT licensed. See LICENSE, VAUL-LICENSE, and NOTICE.txt in the package root.
 */

import { FocusScope } from "@solid2-aria/core/focus/focus-scope";
import { Portal as SolidPortal } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import {
  createSignal,
  merge,
  omit,
  onSettled,
  Show,
  useContext,
} from "solid-js";

import { DrawerContext, PortalContext } from "./context";
import { createBackground } from "./create-background";
import { createDrawer } from "./create-drawer";
import { createLayer } from "./create-layer";
import { createPosition } from "./create-position";
import type {
  CloseProps,
  ContentProps,
  DescriptionProps,
  DialogProps,
  HandleProps,
  OverlayProps,
  PortalProps,
  TitleProps,
  TriggerProps,
} from "./types";

export function Root(props: DialogProps): JSX.Element {
  const context = createDrawer(props);
  createBackground(context);
  createPosition(context);

  return <DrawerContext value={context}>{props.children}</DrawerContext>;
}

export function NestedRoot(props: DialogProps): JSX.Element {
  const parent = useContext(DrawerContext);
  const context = createDrawer(merge(props, { nested: true }), parent);
  createPosition(context);

  return <DrawerContext value={context}>{props.children}</DrawerContext>;
}

export function Portal(props: PortalProps): JSX.Element {
  const context = useContext(DrawerContext);
  const [mounted, setMounted] = createSignal(false);
  onSettled(() => {
    setMounted(true);
  });

  return (
    <Show when={mounted() && (context.present || props.forceMount === true)}>
      <SolidPortal
        mount={props.container ?? context.props.container ?? document.body}
      >
        <PortalContext value={props.forceMount ?? false}>
          {props.children}
        </PortalContext>
      </SolidPortal>
    </Show>
  );
}

export function Trigger(props: TriggerProps): JSX.Element {
  const context = useContext(DrawerContext);

  const attributes = merge(omit(props, "render", "ref", "onClick"), {
    "aria-controls": context.contentId,
    get "aria-expanded"(): "true" | "false" {
      return context.isOpen ? "true" : "false";
    },
    "aria-haspopup": "dialog" as const,
    get "data-state"() {
      return context.isOpen ? "open" : "closed";
    },
    onClick(
      event: Parameters<JSX.EventHandler<HTMLButtonElement, MouseEvent>>[0]
    ) {
      callHandler(props.onClick, event);

      if (!event.defaultPrevented) {
        context.setOpen(!context.isOpen);
      }
    },
    get ref() {
      return [
        props.ref,
        (element: HTMLButtonElement) => {
          context.setTrigger(element);
        },
      ];
    },
    get type() {
      return props.type ?? "button";
    },
  });

  return (
    <Show when={props.render} keyed fallback={<button {...attributes} />}>
      {(render) => render(attributes)}
    </Show>
  );
}

export function Close(props: CloseProps): JSX.Element {
  const context = useContext(DrawerContext);

  const attributes = merge(omit(props, "render", "onClick"), {
    onClick(
      event: Parameters<JSX.EventHandler<HTMLButtonElement, MouseEvent>>[0]
    ) {
      callHandler(props.onClick, event);

      if (!event.defaultPrevented) {
        context.close();
      }
    },
    get type() {
      return props.type ?? "button";
    },
  });

  return (
    <Show when={props.render} keyed fallback={<button {...attributes} />}>
      {(render) => render(attributes)}
    </Show>
  );
}

export function Overlay(props: OverlayProps): JSX.Element {
  const context = useContext(DrawerContext);
  const forceMount = useContext(PortalContext);

  return (
    <Show
      when={
        context.modal &&
        (context.present || props.forceMount === true || forceMount)
      }
    >
      <OverlayElement {...props} />
    </Show>
  );
}

function OverlayElement(props: OverlayProps): JSX.Element {
  const context = useContext(DrawerContext);
  const rest = omit(props, "forceMount", "ref");
  onSettled(() => () => {
    context.setOverlay(null);
  });

  return (
    <div
      {...rest}
      ref={[
        props.ref,
        (element) => {
          context.setOverlay(element);
        },
      ]}
      data-vaul-overlay=""
      data-state={context.isOpen ? "open" : "closed"}
      data-vaul-snap-points={
        (context.props.snapPoints?.length ?? 0) > 0 ? "true" : "false"
      }
      data-vaul-snap-points-overlay={context.shouldFade ? "true" : "false"}
      data-vaul-animate={context.shouldAnimate ? "true" : "false"}
    />
  );
}

export function Content(props: ContentProps): JSX.Element {
  const context = useContext(DrawerContext);
  const forceMount = useContext(PortalContext);

  return (
    <Show when={context.present || props.forceMount === true || forceMount}>
      <ContentElement {...props} />
    </Show>
  );
}

function ContentElement(props: ContentProps): JSX.Element {
  const context = useContext(DrawerContext);

  const rest = omit(
    props,
    "forceMount",
    "ref",
    "onOpenAutoFocus",
    "onCloseAutoFocus",
    "onEscapeKeyDown",
    "onPointerDownOutside",
    "onFocusOutside",
    "onInteractOutside",
    "onPointerDown",
    "onPointerMove",
    "onPointerUp",
    "onPointerCancel",
    "onLostPointerCapture"
  );

  createLayer(context, props);
  onSettled(() => () => {
    context.setContent(null);
  });

  return (
    <FocusScope contain={context.isOpen && context.modal && !context.childOpen}>
      <div
        id={context.contentId}
        role="dialog"
        aria-modal={context.modal ? "true" : undefined}
        aria-labelledby={context.titleId}
        aria-describedby={context.descriptionId}
        tabindex={-1}
        {...rest}
        ref={[
          props.ref,
          (element) => {
            context.setContent(element);
          },
        ]}
        data-state={context.isOpen ? "open" : "closed"}
        data-vaul-drawer=""
        data-vaul-drawer-direction={context.direction}
        data-vaul-custom-container={context.props.container ? "true" : "false"}
        data-vaul-snap-points={
          (context.props.snapPoints?.length ?? 0) > 0 ? "true" : "false"
        }
        data-vaul-delayed-snap-points={
          context.snapPointsOffset.length > 0 ? "true" : "false"
        }
        data-vaul-handle-only={
          context.props.handleOnly === true ? "true" : "false"
        }
        data-vaul-animate={context.shouldAnimate ? "true" : "false"}
        onPointerDown={(event) => {
          callHandler(props.onPointerDown, event);
          context.press(event);
        }}
        onPointerMove={(event) => {
          callHandler(props.onPointerMove, event);

          if (!event.defaultPrevented) {
            context.drag(event);
          }
        }}
        onPointerUp={(event) => {
          callHandler(props.onPointerUp, event);
          context.release(event);
        }}
        onPointerCancel={(event) => {
          callHandler(props.onPointerCancel, event);
          context.cancelDrag();
        }}
        onLostPointerCapture={(event) => {
          callHandler(props.onLostPointerCapture, event);
          context.cancelDrag();
        }}
      />
    </FocusScope>
  );
}

export function Title(props: TitleProps): JSX.Element {
  const context = useContext(DrawerContext);

  return <h2 id={context.titleId} {...props} />;
}

export function Description(props: DescriptionProps): JSX.Element {
  const context = useContext(DrawerContext);

  return <p id={context.descriptionId} {...props} />;
}

export function Handle(props: HandleProps): JSX.Element {
  const context = useContext(DrawerContext);

  const rest = omit(
    props,
    "preventCycle",
    "children",
    "onClick",
    "onPointerDown",
    "onPointerMove",
    "onPointerCancel"
  );

  let pressTime = 0;
  let pressPosition = { x: 0, y: 0 };
  let moved = false;
  let lastClick = -Infinity;

  function cycle(): void {
    if (
      props.preventCycle === true ||
      moved ||
      Date.now() - pressTime > 250 ||
      Date.now() - lastClick < 120
    ) {
      return;
    }

    lastClick = Date.now();
    const points = context.props.snapPoints;

    if (!points || points.length === 0) {
      context.close();

      return;
    }

    const next = points[context.activeSnapPointIndex + 1];

    if (next !== undefined) {
      context.setActiveSnapPoint(next);
    } else if (context.dismissible) {
      context.close();
    } else {
      context.setActiveSnapPoint(points[0] ?? null);
    }
  }

  return (
    <div
      {...rest}
      data-vaul-handle=""
      aria-hidden="true"
      data-vaul-drawer-visible={context.isOpen ? "true" : "false"}
      onClick={(event) => {
        callHandler(props.onClick, event);

        if (!event.defaultPrevented) {
          cycle();
        }
      }}
      onPointerDown={(event) => {
        callHandler(props.onPointerDown, event);

        if (event.defaultPrevented) {
          return;
        }

        pressTime = Date.now();
        pressPosition = { x: event.clientX, y: event.clientY };
        moved = false;
        context.press(event, true);
        event.stopPropagation();
      }}
      onPointerMove={(event) => {
        callHandler(props.onPointerMove, event);

        if (
          Math.abs(event.clientX - pressPosition.x) > 2 ||
          Math.abs(event.clientY - pressPosition.y) > 2
        ) {
          moved = true;
        }
      }}
      onPointerCancel={(event) => {
        callHandler(props.onPointerCancel, event);
        moved = true;
        context.cancelDrag();
      }}
    >
      <span data-vaul-handle-hitarea="" aria-hidden="true">
        {props.children}
      </span>
    </div>
  );
}

function callHandler<T, E extends Event>(
  handler: JSX.EventHandlerUnion<T, E> | undefined,
  event: Parameters<JSX.EventHandler<T, E>>[0]
): void {
  if (typeof handler === "function") {
    handler(event);
  } else if (handler) {
    handler[0](handler[1], event);
  }
}
