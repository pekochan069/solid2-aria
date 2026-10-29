/*
 * Derived from Vaul (https://github.com/emilkowalski/vaul): src/use-position-fixed.ts and src/index.tsx.
 * Copyright (c) 2023 Emil Kowalski
 * Modified for Solid Aria: Solid 2 lifecycle, per-drawer style ownership, viewport resizing, and route-aware restoration.
 * MIT licensed. See LICENSE, VAUL-LICENSE, and NOTICE.txt in the package root.
 */

import { createEffect } from "solid-js";

import { WINDOW_TOP_OFFSET } from "./constants";
import type { DrawerContextValue } from "./context";
import { assignStyle, isSafari } from "./helpers";

export function createPosition(context: DrawerContextValue): void {
  createEffect(
    () => ({
      element: context.content,
      modal: context.modal,
      nested: context.props.nested === true,
      noBodyStyles: context.props.noBodyStyles === true,
      open: context.isOpen,
      preventScrollRestoration: context.props.preventScrollRestoration === true,
    }),
    ({
      element,
      open,
      modal,
      noBodyStyles,
      nested,
      preventScrollRestoration,
    }): undefined | (() => void) => {
      if (!element || !open || !modal || noBodyStyles || nested) {
        return undefined;
      }

      const doc = element.ownerDocument;
      const view = doc.defaultView;

      if (
        !view ||
        !isSafari(view) ||
        view.matchMedia("(display-mode: standalone)").matches
      ) {
        return undefined;
      }

      const { scrollX, scrollY } = view;
      const url = view.location.href;

      const restore = assignStyle(doc.body, {
        height: "auto",
        left: `${-scrollX}px`,
        position: "fixed",
        right: "0",
        top: `${-scrollY}px`,
      });

      return () => {
        restore();

        if (!preventScrollRestoration || url === view.location.href) {
          view.scrollTo(scrollX, scrollY);
        }
      };
    },
    { ssrSource: "client" }
  );

  createEffect(
    () => ({
      direction: context.direction,
      element: context.content,
      fixed: context.props.fixed === true,
      open: context.isOpen,
      reposition: context.props.repositionInputs !== false,
    }),
    ({
      element,
      open,
      reposition,
      fixed,
      direction,
    }): undefined | (() => void) => {
      if (!element || !open || !reposition || direction !== "bottom") {
        return undefined;
      }

      const doc = element.ownerDocument;
      const view = doc.defaultView;
      const viewport = view?.visualViewport;

      if (!view || !viewport) {
        return undefined;
      }

      const { height } = element.style;
      const { bottom } = element.style;
      let keyboardOpen = false;
      const initialHeight = element.getBoundingClientRect().height;

      const resize = (): void => {
        const focused = doc.activeElement;

        if (
          !keyboardOpen &&
          (!(focused instanceof HTMLElement) ||
            !element.contains(focused) ||
            !focused.matches("input,textarea,[contenteditable]"))
        ) {
          return;
        }

        const diff = Math.max(
          0,
          view.innerHeight - viewport.height - viewport.offsetTop
        );

        keyboardOpen = diff > 60;

        if (!keyboardOpen) {
          element.style.height = height;
          element.style.bottom = bottom;

          return;
        }

        const rect = element.getBoundingClientRect();

        const available = Math.max(
          0,
          viewport.height - Math.max(WINDOW_TOP_OFFSET, rect.top)
        );

        element.style.height = `${fixed ? Math.max(0, initialHeight - diff) : available}px`;
        element.style.bottom = `${diff}px`;

        if (focused instanceof HTMLElement) {
          focused.scrollIntoView({ block: "nearest" });
        }
      };

      viewport.addEventListener("resize", resize);
      viewport.addEventListener("scroll", resize);

      return () => {
        viewport.removeEventListener("resize", resize);
        viewport.removeEventListener("scroll", resize);
        element.style.height = height;
        element.style.bottom = bottom;
      };
    },
    { ssrSource: "client" }
  );
}
