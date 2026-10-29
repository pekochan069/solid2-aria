/*
 * Derived from Vaul (https://github.com/emilkowalski/vaul): src/use-scale-background.ts and src/index.tsx.
 * Copyright (c) 2023 Emil Kowalski
 * Modified for Solid Aria: Solid 2 effects, document-local scaling, drag interpolation, and complete style cleanup.
 * MIT licensed. See LICENSE, VAUL-LICENSE, and NOTICE.txt in the package root.
 */

import { createEffect } from "solid-js";

import { BORDER_RADIUS, TRANSITIONS, WINDOW_TOP_OFFSET } from "./constants";
import type { DrawerContextValue } from "./context";
import { assignStyle, isVertical } from "./helpers";

export function createBackground(context: DrawerContextValue): void {
  let background: HTMLElement | null = null;
  let initialScale = 1;
  let vertical = true;
  createEffect(
    () => ({
      color:
        context.props.setBackgroundColorOnScale !== false &&
        context.props.noBodyStyles !== true,
      direction: context.direction,
      element: context.content,
      enabled: context.props.shouldScaleBackground === true,
      nested: context.props.nested === true,
      open: context.isOpen,
    }),
    ({
      element,
      open,
      enabled,
      color,
      direction,
      nested,
    }): undefined | (() => void) => {
      if (!element || !open || !enabled || nested) {
        return undefined;
      }

      const doc = element.ownerDocument;

      const wrapper = doc.querySelector<HTMLElement>(
        "[data-vaul-drawer-wrapper], [vaul-drawer-wrapper]"
      );

      const view = doc.defaultView;

      if (!wrapper || !view) {
        return undefined;
      }

      background = wrapper;
      initialScale = (view.innerWidth - WINDOW_TOP_OFFSET) / view.innerWidth;
      vertical = isVertical(direction);

      const restoreBody = color
        ? assignStyle(doc.body, { background: "black" })
        : undefined;

      const restoreWrapper = assignStyle(wrapper, {
        "border-radius": `${BORDER_RADIUS}px`,
        overflow: "hidden",
        transform: `scale(${initialScale}) ${vertical ? "translate3d(0, 14px, 0)" : "translate3d(14px, 0, 0)"}`,
        "transform-origin": vertical ? "top" : "left",
        "transition-duration": `${TRANSITIONS.DURATION}s`,
        "transition-property": "transform, border-radius",
        "transition-timing-function": `cubic-bezier(${TRANSITIONS.EASE.join(",")})`,
      });

      return () => {
        background = null;
        restoreWrapper();
        restoreBody?.();
      };
    },
    { ssrSource: "client" }
  );
  createEffect(
    () => ({
      dragging: context.isDragging,
      element: context.content,
      open: context.isOpen,
      progress: context.dragProgress,
    }),
    ({ progress, dragging, open }) => {
      if (!background || !open) {
        return;
      }

      const scale = initialScale + progress * (1 - initialScale);
      const displacement = 14 * (1 - progress);
      background.style.transitionDuration = dragging
        ? "0s"
        : `${TRANSITIONS.DURATION}s`;
      background.style.borderRadius = `${BORDER_RADIUS * (1 - progress)}px`;
      background.style.transform = `scale(${scale}) ${vertical ? `translate3d(0, ${displacement}px, 0)` : `translate3d(${displacement}px, 0, 0)`}`;
    },
    { ssrSource: "client" }
  );
}
