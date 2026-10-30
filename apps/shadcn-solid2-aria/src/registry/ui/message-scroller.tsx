/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/message-scroller.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import type { ComponentProps } from "@solidjs/web";
import { cn } from "cn";
import {
  createContext,
  useContext,
  createSignal,
  onSettled,
  omit,
} from "solid-js";

import { IconPlaceholder } from "../lib/icon-placeholder";
import { Button } from "./button";

interface Scroller {
  viewport: HTMLDivElement | null;
  setViewport: (element: HTMLDivElement) => void;
  atStart: boolean;
  atEnd: boolean;
  scrollable: boolean;
  update: () => void;
  scrollTo: (direction: "start" | "end") => void;
}

const ScrollerContext = createContext<Scroller>();

function useMessageScroller() {
  return useContext(ScrollerContext);
}

function useMessageScrollerScrollable() {
  const context = useMessageScroller();

  return () => context.scrollable;
}

function useMessageScrollerVisibility(direction: "start" | "end" = "end") {
  const context = useMessageScroller();

  return () => (direction === "end" ? !context.atEnd : !context.atStart);
}

function MessageScrollerProvider(props: {
  children?: ComponentProps<"div">["children"];
}) {
  const [viewport, setViewport] = createSignal<HTMLDivElement | null>(null, {
    ownedWrite: true,
  });

  const [atStart, setAtStart] = createSignal(true);
  const [atEnd, setAtEnd] = createSignal(true);
  const [scrollable, setScrollable] = createSignal(false);

  const update = () => {
    const el = viewport();

    if (!el) {
      return;
    }

    setAtStart(el.scrollTop < 2);
    setAtEnd(el.scrollHeight - el.clientHeight - el.scrollTop < 2);
    setScrollable(el.scrollHeight > el.clientHeight + 1);
  };

  const context: Scroller = {
    get atEnd() {
      return atEnd();
    },
    get atStart() {
      return atStart();
    },
    scrollTo: (direction) => {
      const el = viewport();
      el?.scrollTo({
        behavior: "smooth",
        top: direction === "end" ? el.scrollHeight : 0,
      });
    },
    get scrollable() {
      return scrollable();
    },
    setViewport: (element) => {
      setViewport(element);
    },
    update,
    get viewport() {
      return viewport();
    },
  };

  return <ScrollerContext value={context}>{props.children}</ScrollerContext>;
}

function MessageScroller(props: ComponentProps<"div">) {
  return (
    <div
      {...props}
      data-slot="message-scroller"
      class={cn(
        "cn-message-scroller group/message-scroller relative flex size-full min-h-0 flex-col overflow-hidden",
        props.class
      )}
    />
  );
}

function MessageScrollerViewport(props: ComponentProps<"div">) {
  const context = useMessageScroller();
  const rest = omit(props, "class", "ref", "onScroll");
  onSettled(() => {
    const element = context.viewport;
    let cleanup: (() => void) | undefined;

    if (element) {
      const update = () => {
        if (context.atEnd) {
          element.scrollTop = element.scrollHeight;
        }

        context.update();
      };

      const resize = new ResizeObserver(update);
      resize.observe(element);

      if (element.firstElementChild) {
        resize.observe(element.firstElementChild);
      }

      const mutation = new MutationObserver(update);
      mutation.observe(element, {
        characterData: true,
        childList: true,
        subtree: true,
      });
      update();

      cleanup = () => {
        resize.disconnect();
        mutation.disconnect();
      };
    }

    return cleanup;
  });

  return (
    <div
      {...rest}
      ref={[
        context.setViewport,
        ...(typeof props.ref === "function" ? [props.ref] : []),
      ]}
      data-slot="message-scroller-viewport"
      class={cn(
        "cn-message-scroller-viewport size-full min-h-0 min-w-0 overflow-y-auto overscroll-contain",
        props.class
      )}
      onScroll={(event) => {
        context.update();

        if (typeof props.onScroll === "function") {
          props.onScroll(event);
        }
      }}
    />
  );
}

function MessageScrollerContent(props: ComponentProps<"div">) {
  return (
    <div
      {...props}
      data-slot="message-scroller-content"
      class={cn(
        "cn-message-scroller-content flex h-max min-h-full flex-col",
        props.class
      )}
    />
  );
}

function MessageScrollerItem(
  props: ComponentProps<"div"> & {
    scrollAnchor?: boolean;
  }
) {
  const rest = omit(props, "scrollAnchor", "class");

  return (
    <div
      {...rest}
      data-slot="message-scroller-item"
      data-scroll-anchor={props.scrollAnchor ?? undefined}
      class={cn("cn-message-scroller-item min-w-0 shrink-0", props.class)}
    />
  );
}

function MessageScrollerButton(
  props: ComponentProps<typeof Button> & {
    direction?: "start" | "end";
  }
) {
  const context = useMessageScroller();
  const rest = omit(props, "direction", "class", "children", "onPress");

  const active = () =>
    props.direction === "start" ? !context.atStart : !context.atEnd;

  return (
    <Button
      variant="secondary"
      size="icon-sm"
      {...rest}
      data-slot="message-scroller-button"
      data-direction={props.direction ?? "end"}
      data-active={active() ? "true" : "false"}
      isDisabled={!active() || props.isDisabled}
      class={cn(
        "cn-message-scroller-button absolute left-1/2 -translate-x-1/2 data-[active=false]:hidden",
        props.direction === "start" ? "top-4" : "bottom-4",
        props.class
      )}
      onPress={(event) => {
        props.onPress?.(event);
        context.scrollTo(props.direction ?? "end");
      }}
    >
      {props.children ?? (
        <>
          <IconPlaceholder lucide="ArrowDownIcon" />
          <span class="sr-only">
            {props.direction === "start" ? "Scroll to start" : "Scroll to end"}
          </span>
        </>
      )}
    </Button>
  );
}

export {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
  useMessageScroller,
  useMessageScrollerScrollable,
  useMessageScrollerVisibility,
};
