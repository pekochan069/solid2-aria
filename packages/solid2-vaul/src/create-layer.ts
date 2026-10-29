import { ariaHideOutside } from "@solid2-aria/core/overlays/aria-hide-outside";
import { createPreventScroll } from "@solid2-aria/core/overlays/create-prevent-scroll";
import { createEffect, untrack } from "solid-js";

import type { DrawerContextValue } from "./context";
import type {
  ContentProps,
  FocusOutsideEvent,
  PointerDownOutsideEvent,
} from "./types";

const layers = new WeakMap<Document, HTMLDivElement[]>();

export function createLayer(
  context: DrawerContextValue,
  props: ContentProps
): void {
  createPreventScroll({
    get isDisabled() {
      return (
        !context.isOpen ||
        !context.content ||
        !context.modal ||
        context.props.noBodyStyles === true ||
        (!context.overlay && context.props.disablePreventScroll !== true)
      );
    },
  });

  createEffect(
    () => ({
      element: context.content,
      modal: context.modal,
      open: context.isOpen,
      overlay: context.overlay,
    }),
    ({ element, overlay, open, modal }): undefined | (() => void) => {
      if (!element || !open || !modal) {
        return undefined;
      }

      return ariaHideOutside(overlay ? [element, overlay] : [element], {
        shouldUseInert: true,
      });
    },
    { ssrSource: "client" }
  );

  createEffect(
    () => ({ element: context.content, open: context.isOpen }),
    ({ element, open }): undefined | (() => void) => {
      if (!element || !open) {
        return undefined;
      }

      const doc = element.ownerDocument;
      const stack = layers.get(doc) ?? [];
      layers.set(doc, stack);
      stack.push(element);
      const previous = doc.activeElement;
      let interactedOutside = false;
      const autoFocus = new Event("openAutoFocus", { cancelable: true });
      props.onOpenAutoFocus?.(autoFocus);

      if (!autoFocus.defaultPrevented && context.props.autoFocus === true) {
        const first = element.querySelector<HTMLElement>(
          "[autofocus],button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex='0']"
        );

        (first ?? element).focus({ preventScroll: true });
      }

      const isTop = () => stack.at(-1) === element;

      const isOutside = (event: Event) =>
        !event.composedPath().includes(element);

      function pointerDown(event: PointerEvent): void {
        if (!isTop() || !isOutside(event)) {
          return;
        }

        const outside: PointerDownOutsideEvent = new CustomEvent(
          "pointerDownOutside",
          {
            cancelable: true,
            detail: { originalEvent: event },
          }
        );

        props.onPointerDownOutside?.(outside);
        props.onInteractOutside?.(outside);

        if (
          outside.defaultPrevented ||
          !context.modal ||
          event.button > 0 ||
          event.ctrlKey
        ) {
          return;
        }

        interactedOutside = !context.modal;
        context.close();
      }

      function focusIn(event: FocusEvent): void {
        if (!isTop() || !isOutside(event)) {
          return;
        }

        const outside: FocusOutsideEvent = new CustomEvent("focusOutside", {
          cancelable: true,
          detail: { originalEvent: event },
        });

        props.onFocusOutside?.(outside);
        props.onInteractOutside?.(outside);

        if (!context.modal) {
          interactedOutside = true;
        }
      }

      function keyDown(event: KeyboardEvent): void {
        if (event.key !== "Escape" || !isTop() || event.defaultPrevented) {
          return;
        }

        props.onEscapeKeyDown?.(event);

        if (event.defaultPrevented) {
          return;
        }

        event.preventDefault();
        context.close();
      }

      doc.addEventListener("pointerdown", pointerDown);
      doc.addEventListener("focusin", focusIn);
      doc.addEventListener("keydown", keyDown);

      const touchMove = (event: TouchEvent) => {
        if (element.classList.contains("vaul-dragging") && event.cancelable) {
          event.preventDefault();
        }
      };

      element.addEventListener("touchmove", touchMove, { passive: false });

      return () => {
        const index = stack.indexOf(element);
        const wasTop = isTop();

        if (index !== -1) {
          stack.splice(index, 1);
        }

        if (!stack.length) {
          layers.delete(doc);
        }

        doc.removeEventListener("pointerdown", pointerDown);
        doc.removeEventListener("focusin", focusIn);
        doc.removeEventListener("keydown", keyDown);
        element.removeEventListener("touchmove", touchMove);

        const closeAutoFocus = new Event("closeAutoFocus", {
          cancelable: true,
        });

        props.onCloseAutoFocus?.(closeAutoFocus);

        if (closeAutoFocus.defaultPrevented || interactedOutside || !wasTop) {
          return;
        }

        const target = untrack(() => context.trigger) ?? previous;
        queueMicrotask(() => {
          if (target instanceof HTMLElement && target.isConnected) {
            target.focus({ preventScroll: true });
          }
        });
      };
    },
    { ssrSource: "client" }
  );
}
