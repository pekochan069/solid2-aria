/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/*
 * Derived from Adobe React Spectrum: packages/react-aria/src/virtualizer/ScrollView.tsx.
 * Modified for Solid Aria: adapted components, imports, and reactive lifecycle for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { Point } from "@solid2-aria/stately/virtualizer/point";
import { Rect } from "@solid2-aria/stately/virtualizer/rect";
import { Size } from "@solid2-aria/stately/virtualizer/size";
import { createEffect, createSignal, omit, onSettled, flush } from "solid-js";
import type { Accessor, Element as SolidElement } from "solid-js";

import { createLocale } from "../i18n/i18n-provider";
import type { CSSProperties, HTMLAttributes, Ref } from "../types";
import { createResizeObserver } from "../utils/create-resize-observer";
import { addEvent, getOwnerDocument } from "../utils/dom-helpers";
import { requireElement } from "../utils/dom-value";
import {
  getEventTarget,
  getPropagationTargets,
  nodeContains,
} from "../utils/shadowdom/dom-functions";
import { isTruthy } from "../utils/truthy";
import { getScrollLeft } from "./utils";

export interface ScrollViewProps extends Omit<
  HTMLAttributes,
  "onScroll" | "ref" | "style"
> {
  style?: CSSProperties;
  contentSize: Size;
  onVisibleRectChange: (rect: Rect) => void;
  onSizeChange?: (size: Size) => void;
  children?: SolidElement;
  innerStyle?: CSSProperties;
  onScrollStart?: () => void;
  onScrollEnd?: () => void;
  scrollDirection?: "horizontal" | "vertical" | "both";
  onScroll?: (event: Event) => void;
  allowsWindowScrolling?: boolean;
  ref?: Ref<HTMLDivElement>;
}

export function ScrollView(props: ScrollViewProps): SolidElement {
  const [ref, setRef] = createSignal<HTMLDivElement | null>(null, {
    ownedWrite: true,
  });

  const aria = createScrollView(props, ref);

  return (
    <div
      role="presentation"
      {...aria.scrollViewProps}
      ref={[
        props.ref,
        (node) => {
          setRef(node);
        },
      ]}
    >
      <div {...aria.contentProps}>{props.children}</div>
    </div>
  );
}

export interface ScrollViewAria {
  isScrolling: boolean;
  scrollViewProps: Omit<HTMLAttributes<HTMLDivElement>, "ref">;
  contentProps: Omit<HTMLAttributes<HTMLDivElement>, "ref">;
}

export function createScrollView(
  props: ScrollViewProps,
  ref: Accessor<HTMLElement | null>
): ScrollViewAria {
  const locale = createLocale();
  const [isScrolling, setScrolling] = createSignal(false);
  let measuredSize = new Size();
  const [size, setSize] = createSignal(measuredSize, { ownedWrite: true });

  interface ScrollViewState {
    isScrolling: boolean;
    lastVisibleRect: Rect;
    scrollEndTime: number;
    scrollPosition: Point;
    scrollTimeout: ReturnType<typeof setTimeout> | null;
    viewportOffset: Point;
    viewportSize: Size;
  }

  const state: ScrollViewState = {
    isScrolling: false,
    lastVisibleRect: new Rect(),
    scrollEndTime: 0,
    scrollPosition: new Point(),
    scrollTimeout: null,
    viewportOffset: new Point(),
    viewportSize: new Size(),
  };

  let updatingSize = false;

  const updateVisibleRect = () => {
    const dimensions = measuredSize;

    const rect = isTruthy(props.allowsWindowScrolling)
      ? new Rect(
          state.viewportOffset.x + state.scrollPosition.x,
          state.viewportOffset.y + state.scrollPosition.y,
          Math.max(
            0,
            Math.min(
              dimensions.width - state.viewportOffset.x,
              state.viewportSize.width
            )
          ),
          Math.max(
            0,
            Math.min(
              dimensions.height - state.viewportOffset.y,
              state.viewportSize.height
            )
          )
        )
      : new Rect(
          state.scrollPosition.x,
          state.scrollPosition.y,
          dimensions.width,
          dimensions.height
        );

    if (rect.area > 0 || state.lastVisibleRect.area > 0) {
      props.onVisibleRectChange(rect);
      state.lastVisibleRect = rect;
    }
  };

  const onScroll = (event: Event) => {
    const target = requireElement(getEventTarget(event));
    const element = ref();

    if (!element || !nodeContains(target, element)) {
      return;
    }

    if (target === element) {
      props.onScroll?.(event);
      state.scrollPosition = new Point(
        Math.max(
          0,
          Math.min(
            getScrollLeft(target, locale.direction),
            props.contentSize.width - measuredSize.width
          )
        ),
        Math.max(
          0,
          Math.min(
            target.scrollTop,
            props.contentSize.height - measuredSize.height
          )
        )
      );
    } else {
      const bounds = element.getBoundingClientRect();

      const x = Math.max(0, -bounds.x);
      const y = Math.max(0, -bounds.y);

      if (x === state.viewportOffset.x && y === state.viewportOffset.y) {
        return;
      }

      state.viewportOffset = new Point(x, y);
    }

    updateVisibleRect();

    if (!state.isScrolling) {
      state.isScrolling = true;
      setScrolling(true);
      window.dispatchEvent(new Event("tk.disconnect-observer"));
      props.onScrollStart?.();
    }

    const now = Date.now();

    if (state.scrollEndTime <= now + 50) {
      state.scrollEndTime = now + 300;

      if (state.scrollTimeout !== null) {
        clearTimeout(state.scrollTimeout);
      }

      state.scrollTimeout = setTimeout(() => {
        state.isScrolling = false;
        setScrolling(false);
        state.scrollTimeout = null;
        window.dispatchEvent(new Event("tk.connect-observer"));
        props.onScrollEnd?.();
      }, 300);
    }

    flush();
  };

  const updateSize = () => {
    const element = ref();

    if (!element || updatingSize) {
      return;
    }

    updatingSize = true;

    try {
      state.viewportSize = new Size(window.innerWidth, window.innerHeight);

      // Account for scrollbars appearing or disappearing in at most two passes.
      for (let pass = 0; pass < 2; pass += 1) {
        const next = new Size(element.clientWidth, element.clientHeight);
        const previous = measuredSize;

        if (pass > 0 && next.equals(previous)) {
          break;
        }

        measuredSize = next;
        setSize(next);
        props.onSizeChange?.(next);
        updateVisibleRect();
      }
    } finally {
      updatingSize = false;
    }
  };

  onSettled(() => {
    updateSize();

    const removeScroll = addEvent(
      getPropagationTargets(ref(), getOwnerDocument(ref())),
      "scroll",
      onScroll,
      true
    );

    window.addEventListener("resize", updateSize);

    return () => {
      removeScroll();
      window.removeEventListener("resize", updateSize);

      if (state.scrollTimeout !== null) {
        clearTimeout(state.scrollTimeout);
      }

      if (state.isScrolling) {
        window.dispatchEvent(new Event("tk.connect-observer"));
      }
    };
  });
  createEffect(
    () => [props.contentSize.width, props.contentSize.height],
    () => {
      queueMicrotask(updateSize);
    }
  );
  createResizeObserver({ box: "border-box", onResize: updateSize, ref });

  const scrollViewProps: ScrollViewAria["scrollViewProps"] = omit(
    props,
    "contentSize",
    "onVisibleRectChange",
    "onSizeChange",
    "children",
    "innerStyle",
    "onScrollStart",
    "onScrollEnd",
    "scrollDirection",
    "onScroll",
    "allowsWindowScrolling",
    "ref",
    "style"
  );

  Object.defineProperty(scrollViewProps, "style", {
    enumerable: true,
    get(): CSSProperties {
      const horizontal = props.scrollDirection === "horizontal";

      const vertical =
        props.scrollDirection === "vertical" ||
        props.contentSize.width === size().width;

      return {
        padding: 0,
        ...props.style,
        "overflow-x": !horizontal && vertical ? "hidden" : "auto",
        "overflow-y": horizontal ? "hidden" : "auto",
      };
    },
  });

  const contentProps: ScrollViewAria["contentProps"] = {
    role: "presentation",
    get style(): CSSProperties {
      return {
        height: Number.isFinite(props.contentSize.height)
          ? `${props.contentSize.height}px`
          : undefined,
        "pointer-events": isScrolling() ? "none" : "auto",
        position: "relative",
        width: Number.isFinite(props.contentSize.width)
          ? `${props.contentSize.width}px`
          : undefined,
        ...props.innerStyle,
      };
    },
  };

  return {
    contentProps,
    get isScrolling() {
      return isScrolling();
    },
    scrollViewProps,
  };
}
