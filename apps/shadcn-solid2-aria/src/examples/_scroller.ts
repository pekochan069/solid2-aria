import { createMemo, createSignal, onSettled } from "solid-js";

import { useMessageScroller as nativeScroller } from "../registry/ui/message-scroller";

export function useMessageScroller() {
  const context = nativeScroller();

  return {
    scrollToEnd: (options?: ScrollOptions) =>
      context.viewport?.scrollTo({
        top: context.viewport.scrollHeight,
        ...options,
      }),
    scrollToMessage: (
      id: string,
      options?: ScrollOptions & {
        align?: "start" | "end";
        scrollMargin?: number;
      }
    ) => {
      const target = context.viewport?.querySelector<HTMLElement>(
        `[id="${CSS.escape(id)}"]`
      );

      if (target && context.viewport) {
        context.viewport.scrollTo({
          behavior: options?.behavior ?? "smooth",
          top: target.offsetTop - (options?.scrollMargin ?? 0),
        });
      }
    },
    scrollToStart: (options?: ScrollOptions) =>
      context.viewport?.scrollTo({ top: 0, ...options }),
  };
}

export function useMessageScrollerScrollable() {
  const context = nativeScroller();

  const end = createMemo(() => !context.atEnd);
  const start = createMemo(() => !context.atStart);

  return { end, start };
}

export function useMessageScrollerVisibility() {
  const context = nativeScroller();
  const [currentAnchorId, setCurrent] = createSignal<string>();
  onSettled(() => {
    const { viewport } = context;

    if (!viewport) {
      return;
    }

    const update = () => {
      const { top } = viewport.getBoundingClientRect();

      const anchors = [
        ...viewport.querySelectorAll<HTMLElement>(
          '[data-scroll-anchor="true"]'
        ),
      ];

      const anchor =
        anchors.find(
          (element) => element.getBoundingClientRect().bottom >= top
        ) ?? anchors.at(-1);

      setCurrent(anchor?.id);
    };

    update();
    viewport.addEventListener("scroll", update);

    // oxlint-disable-next-line typescript/consistent-return -- Setup returns cleanup only when the observed element exists.
    return () => {
      viewport.removeEventListener("scroll", update);
    };
  });

  return { currentAnchorId };
}
