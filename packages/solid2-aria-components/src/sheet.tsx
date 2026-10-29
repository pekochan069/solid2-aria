/*
 * Copyright 2026 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/Sheet.tsx.
 * Modified for Solid Aria: adapted components, contexts, refs, and reactive properties for Solid 2; measures rendered CSS snap lengths, tracks page offsets, preserves native scrolling, defers focus until entry, and settles handle gestures on release.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createLocale } from "@solid2-aria/core/i18n/i18n-provider";
import { PressResponder } from "@solid2-aria/core/interactions/press-responder";
import { DismissButton } from "@solid2-aria/core/overlays/dismiss-button";
import type { CSSProperties } from "@solid2-aria/core/types";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { createOverlayTriggerState } from "@solid2-aria/stately/overlays/create-overlay-trigger-state";
import type { GlobalDOMAttributes } from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";
import {
  For,
  merge,
  untrack,
  createSignal,
  createContext,
  createMemo,
  createEffect,
  createUniqueId,
  onSettled,
  useContext,
  omit,
} from "solid-js";

import { ButtonContext } from "./button";
import { Dialog, DialogTrigger, OverlayTriggerStateContext } from "./dialog";
import type { DialogProps, DialogTriggerProps } from "./dialog";
import { ModalOverlay, InternalModalContext } from "./modal";
import type { ModalRenderProps, ModalOverlayProps } from "./modal";
import {
  assignRef,
  dom,
  createRenderProps,
  createSlottedContext,
} from "./utils";
import type { Ref, RenderProps } from "./utils";

type SheetPosition = "bottom" | "top" | "left" | "right" | "center";

type SheetSwipeDirection =
  | Exclude<SheetPosition, "center">
  | "vertical"
  | "horizontal";

type Axis = "x" | "y";

export interface SheetRenderProps extends ModalRenderProps {
  position: SheetPosition;
  swipeDirection: SheetSwipeDirection;
  stackIndex: number;
  hasDescendants: boolean;
  isExpanded: boolean;
}

export interface SheetOverlayProps
  extends
    Omit<
      ModalOverlayProps,
      | "class"
      | "style"
      | "children"
      | "render"
      | "onEnter"
      | "onExit"
      | "isEntering"
      | "isExiting"
      | "isDismissable"
      | "isKeyboardDismissDisabled"
    >,
    RenderProps<SheetRenderProps> {
  position?: SheetPosition | "start" | "end";
  swipeDirection?: SheetSwipeDirection | "start" | "end";
  snapPoints?: (number | string)[];
  preventDismissal?: boolean;
}

export type SheetTriggerProps = DialogTriggerProps;

export interface SheetProps
  extends
    Omit<
      ModalOverlayProps,
      | "class"
      | "style"
      | "children"
      | "render"
      | "onEnter"
      | "onExit"
      | "isEntering"
      | "isExiting"
      | "isDismissable"
      | "isOpen"
      | "defaultOpen"
      | "onOpenChange"
      | "isKeyboardDismissDisabled"
      | "shouldCloseOnInteractOutside"
    >,
    RenderProps<SheetRenderProps> {
  swipeAnimation?: string;
  swipeAnimationRange?: { start?: number; end?: number };
  stackAnimation?: string;
  overscrollPadding?: boolean;
}

export interface SheetBackdropProps
  extends RenderProps<SheetRenderProps>, GlobalDOMAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  swipeAnimation?: string;
  swipeAnimationRange?: { start?: number; end?: number };
}

export interface SheetContentProps extends Omit<
  DialogProps,
  "class" | "isEntering"
> {
  class?: JSX.ClassValue;
}

interface StackEntry {
  id: string;
  range: "cover" | "entry" | "exit";
  direction: "normal" | "reverse" | "alternate";
  iterations: number;
  height: number;
  swipeProgress: number;
  isSwiping: boolean;
}

interface SheetRegistry {
  entries: StackEntry[];
  listeners: Set<() => void>;
  previousScope: string;
  registrations: Map<string, number>;
}

const registries = new WeakMap<Document, SheetRegistry>();

interface SheetContextValue {
  props: SheetOverlayProps;
  values: SheetRenderProps;
  descendants: StackEntry[];
  entry: StackEntry | undefined;
  setExpanded: (value: boolean) => void;
  register: (
    element: HTMLElement,
    visual: Pick<StackEntry, "height" | "swipeProgress" | "isSwiping">
  ) => () => void;
}

const SheetContext = createContext<SheetContextValue | null>(null);

function swipeConfig(direction: SheetSwipeDirection) {
  const axis: Axis = ["top", "bottom", "vertical"].includes(direction)
    ? "y"
    : "x";

  const before = ["top", "left", "vertical", "horizontal"].includes(direction);

  const after = ["bottom", "right", "vertical", "horizontal"].includes(
    direction
  );

  let viewDirection: StackEntry["direction"] = "normal";
  let viewRange: StackEntry["range"] = "entry";

  if (before && after) {
    viewDirection = "alternate";
    viewRange = "cover";
  } else if (before) {
    viewDirection = "reverse";
    viewRange = "exit";
  }

  return {
    after,
    axis,
    before,
    containerOffset: before && !after ? -100 : 0,
    enteredScroll: before && !after ? 0 : 100,
    maxScroll: (Number(before) + Number(after)) * 100,
    viewDirection,
    viewIterations: before && after ? 2 : 1,
    viewRange,
  };
}

function resolveDirection<T extends string>(
  value: T | "start" | "end",
  direction: "ltr" | "rtl"
): T | "left" | "right" {
  if (value === "start") {
    return direction === "rtl" ? "right" : "left";
  }

  if (value === "end") {
    return direction === "rtl" ? "left" : "right";
  }

  return value;
}

function registerSheet(
  doc: Document,
  entry: StackEntry,
  notify: (entries: StackEntry[]) => void
) {
  let registry = registries.get(doc);

  if (!registry) {
    registry = {
      entries: [],
      listeners: new Set(),
      previousScope:
        doc.documentElement.style.getPropertyValue("timeline-scope"),
      registrations: new Map(),
    };
    registries.set(doc, registry);
  }

  const current = registry;

  const update = () => {
    notify(current.entries);
  };

  current.listeners.add(update);
  const count = current.registrations.get(entry.id) ?? 0;
  current.registrations.set(entry.id, count + 1);

  if (!count) {
    current.entries = [...current.entries, entry];
  }

  const emit = () => {
    const names = current.entries.map((_, i) => `--sheet-timeline-${i}`);
    doc.documentElement.style.setProperty(
      "timeline-scope",
      [current.previousScope, ...names].filter(Boolean).join(", ")
    );

    for (const listener of current.listeners) {
      listener();
    }
  };

  emit();

  return () => {
    current.listeners.delete(update);
    const remaining = (current.registrations.get(entry.id) ?? 1) - 1;

    if (remaining) {
      current.registrations.set(entry.id, remaining);
    } else {
      current.registrations.delete(entry.id);
      current.entries = current.entries.filter(
        (value) => value.id !== entry.id
      );
    }

    emit();

    if (!current.entries.length) {
      if (current.previousScope) {
        doc.documentElement.style.setProperty(
          "timeline-scope",
          current.previousScope
        );
      } else {
        doc.documentElement.style.removeProperty("timeline-scope");
      }

      registries.delete(doc);
    }
  };
}

export function SheetTrigger(props: SheetTriggerProps): JSX.Element {
  return (
    <DialogTrigger {...props}>
      <SheetTriggerContent>{props.children}</SheetTriggerContent>
    </DialogTrigger>
  );
}

function SheetTriggerContent(props: { children?: JSX.Element }) {
  const button = createSlottedContext(ButtonContext);

  return (
    <ButtonContext value={mergeProps(button ?? {}, { isPressed: false })}>
      <PressResponder isPressed={false}>{props.children}</PressResponder>
    </ButtonContext>
  );
}

export function SheetOverlay(props: SheetOverlayProps): JSX.Element {
  const locale = createLocale();
  const trigger = useContext(OverlayTriggerStateContext);
  const local = createOverlayTriggerState(props);

  const selected = () =>
    props.isOpen !== undefined || props.defaultOpen !== undefined || !trigger
      ? local
      : trigger;

  const state = {
    close: () => {
      selected().close();
    },
    get isOpen() {
      return selected().isOpen;
    },
    open: () => {
      selected().open();
    },
    get point() {
      return selected().point;
    },
    setOpen: (value: boolean) => {
      selected().setOpen(value);
    },
    setPoint: (point: { x: number; y: number }) => {
      selected().setPoint(point);
    },
    toggle: () => {
      selected().toggle();
    },
  };

  const [expanded, setExpanded] = createSignal(false, { ownedWrite: true });

  const [stack, setStack] = createSignal<StackEntry[]>([], {
    ownedWrite: true,
  });

  const id = createUniqueId();

  const position = () =>
    resolveDirection(props.position ?? "bottom", locale.direction);

  const swipe = (): SheetSwipeDirection => {
    if (props.swipeDirection !== undefined) {
      return resolveDirection(props.swipeDirection, locale.direction);
    }

    const resolved = position();

    return resolved === "center" ? "vertical" : resolved;
  };

  const index = () =>
    Math.max(
      0,
      stack().findIndex((entry) => entry.id === id)
    );

  const values: SheetRenderProps = {
    get hasDescendants() {
      return stack().length > index() + 1;
    },
    isEntering: false,
    isExiting: false,
    get isExpanded() {
      return expanded();
    },
    get position() {
      return position();
    },
    get stackIndex() {
      return index();
    },
    state,
    get swipeDirection() {
      return swipe();
    },
  };

  const context: SheetContextValue = {
    get descendants() {
      return stack().slice(index() + 1);
    },
    get entry() {
      return stack()[index()];
    },
    props,
    register(element, visual) {
      const config = swipeConfig(swipe());

      return registerSheet(
        element.ownerDocument,
        {
          direction: config.viewDirection,
          get height() {
            return visual.height;
          },
          id,
          get isSwiping() {
            return visual.isSwiping;
          },
          iterations: config.viewIterations,
          range: config.viewRange,
          get swipeProgress() {
            return visual.swipeProgress;
          },
        },
        (entries: StackEntry[]) => {
          setStack(entries);
        }
      );
    },
    setExpanded(value) {
      setExpanded(value);
    },
    values,
  };

  const fullValues = (modal: ModalRenderProps) => mergeProps(values, modal);

  return (
    <ModalOverlay
      {
        // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
        ...omit(
          props,
          "children",
          "class",
          "style",
          "render",
          "position",
          "swipeDirection",
          "snapPoints",
          "preventDismissal"
        )
        // oxlint-enable solid/reactivity
      }
      isOpen={state.isOpen}
      defaultOpen={undefined}
      onOpenChange={state.setOpen}
      isDismissable={props.preventDismissal !== true}
      isKeyboardDismissDisabled={props.preventDismissal}
      UNSTABLE_overrideFocus
      class={(modal) => {
        const value = props.class;

        return (
          (typeof value === "function"
            ? value(
                mergeProps(fullValues(modal), {
                  defaultClass: "solid2-aria-SheetOverlay",
                })
              )
            : value) ?? "solid2-aria-SheetOverlay"
        );
      }}
      style={(modal) => {
        const style =
          typeof props.style === "function"
            ? props.style(mergeProps(fullValues(modal), { defaultStyle: {} }))
            : props.style;

        return {
          "--sheet-scroll-padding-x":
            "calc(100vw - var(--visual-viewport-width))",
          "--sheet-scroll-padding-y":
            "calc(100dvh - var(--visual-viewport-height))",
          height: "max(var(--page-height), 100dvh)",
          left: 0,
          overflow: "clip",
          position: "absolute",
          top: 0,
          width: "max(var(--page-width), 100vw)",
          ...objectStyle(style),
        };
      }}
      {...sheetData(values)}
      render={
        props.render
          ? (domProps, modal) =>
              props.render?.(
                mergeProps(domProps, sheetData(fullValues(modal))),
                fullValues(modal)
              )
          : undefined
      }
    >
      <SheetOverlayContent context={context} />
    </ModalOverlay>
  );
}

function SheetOverlayContent(props: { context: SheetContextValue }) {
  const modalContext = useContext(InternalModalContext);

  if (!modalContext) {
    throw new Error("SheetOverlay requires ModalOverlay");
  }

  const modal = modalContext.values;

  const values = mergeProps(
    merge(() => props.context.values),
    modal
  );

  const context = mergeProps(
    merge(() => props.context),
    { values }
  );

  return (
    <SheetContext value={context}>
      <SheetOverlayChildren values={context.values}>
        {props.context.props.children}
      </SheetOverlayChildren>
    </SheetContext>
  );
}

function SheetOverlayChildren(props: {
  values: SheetRenderProps;
  children?: RenderProps<SheetRenderProps>["children"];
}) {
  const content = createMemo(() => {
    const supplied = props.children;

    return typeof supplied === "function" && supplied.length > 0
      ? supplied(
          mergeProps(
            merge(() => props.values ?? {}),
            { defaultChildren: undefined }
          )
        )
      : supplied;
  });

  return <>{content()}</>;
}

function sheetData(values: SheetRenderProps) {
  return {
    get "data-entering"() {
      return values.isEntering || undefined;
    },
    get "data-exiting"() {
      return values.isExiting || undefined;
    },
    get "data-expanded"() {
      return values.isExpanded || undefined;
    },
    get "data-has-descendants"() {
      return values.hasDescendants || undefined;
    },
    get "data-position"() {
      return values.position;
    },
    get "data-stack-index"() {
      return values.stackIndex;
    },
    get "data-swipe-direction"() {
      return values.swipeDirection;
    },
  };
}

function viewTimelineSupported() {
  return (
    typeof CSS !== "undefined" &&
    typeof CSS.supports === "function" &&
    CSS.supports("animation-timeline: view()")
  );
}

function toLength(point: number | string) {
  return typeof point === "number" ? `${point}px` : point;
}

function swipeAnimation(
  props: Pick<SheetProps, "swipeAnimation" | "swipeAnimationRange">,
  context: SheetContextValue
): CSSProperties {
  if (props.swipeAnimation === undefined || props.swipeAnimation.length === 0) {
    return {};
  }

  const config = swipeConfig(context.values.swipeDirection);

  if (viewTimelineSupported()) {
    let start =
      props.swipeAnimationRange?.start === undefined
        ? "0%"
        : toLength(
            context.props.snapPoints?.[props.swipeAnimationRange.start] ?? "0%"
          );

    let end =
      props.swipeAnimationRange?.end === undefined
        ? "100%"
        : toLength(
            context.props.snapPoints?.[props.swipeAnimationRange.end] ?? "100%"
          );

    if (
      context.values.swipeDirection === "top" ||
      context.values.swipeDirection === "left"
    ) {
      const previous = start;
      start = `calc(100% - ${end})`;
      end = `calc(100% - ${previous})`;
    }

    return {
      "animation-composition": "replace",
      "animation-direction": config.viewDirection,
      "animation-fill-mode": "both",
      "animation-iteration-count": config.viewIterations,
      "animation-name": props.swipeAnimation,
      "animation-range": `${config.viewRange} ${start} ${config.viewRange} ${end}`,
      "animation-timeline": `--sheet-timeline-${context.values.stackIndex}`,
      "animation-timing-function": "linear",
    };
  }

  return context.values.isEntering || context.values.isExiting
    ? {
        "animation-composition": "replace",
        "animation-direction": context.values.isExiting ? "reverse" : "normal",
        "animation-duration": "300ms",
        "animation-fill-mode": "both",
        "animation-iteration-count": 1,
        "animation-name": props.swipeAnimation,
        "animation-timing-function": "linear",
      }
    : {};
}

function objectStyle(
  value: CSSProperties | string | false | undefined
): CSSProperties {
  return typeof value === "object" ? value : {};
}

function parseCSSNumber(value: string): number {
  // oxlint-disable-next-line unicorn/prefer-number-coercion -- CSS lengths include units, so numeric coercion would return NaN.
  return Number.parseFloat(value);
}

function resolveLength(
  point: number | string,
  size: number,
  element: HTMLElement
): number {
  if (typeof point === "number") {
    return point;
  }

  const numeric = parseCSSNumber(point);

  if (!Number.isFinite(numeric)) {
    return size;
  }

  if (point.endsWith("%")) {
    return (size * numeric) / 100;
  }

  if (/(?:d|s|l)?vh$/u.test(point)) {
    return (window.innerHeight * numeric) / 100;
  }

  if (/(?:d|s|l)?vw$/u.test(point)) {
    return (window.innerWidth * numeric) / 100;
  }

  if (point.endsWith("rem")) {
    return (
      numeric *
      (parseCSSNumber(getComputedStyle(document.documentElement).fontSize) ||
        16)
    );
  }

  if (point.endsWith("em")) {
    return numeric * (parseCSSNumber(getComputedStyle(element).fontSize) || 16);
  }

  return numeric;
}

function canScroll(
  target: EventTarget | null,
  sheet: HTMLElement,
  axis: Axis,
  delta: number
): boolean {
  let element = target instanceof HTMLElement ? target : null;

  while (element && element !== sheet) {
    const style = getComputedStyle(element);
    const overflow = axis === "y" ? style.overflowY : style.overflowX;

    const size =
      axis === "y"
        ? element.scrollHeight - element.clientHeight
        : element.scrollWidth - element.clientWidth;

    const position = axis === "y" ? element.scrollTop : element.scrollLeft;

    if (
      size > 0 &&
      /(?:auto|scroll)/u.test(overflow) &&
      ((delta > 0 && position > 0) || (delta < 0 && position < size))
    ) {
      return true;
    }

    element = element.parentElement;
  }

  return false;
}

export function Sheet(props: SheetProps): JSX.Element {
  const context = useContext(SheetContext);

  if (!context) {
    throw new Error("Sheet requires SheetOverlay");
  }

  const [ref, setRef] = createSignal<HTMLDivElement | null>(null, {
    ownedWrite: true,
  });

  const locale = createLocale();
  const modalContext = useContext(InternalModalContext);

  if (!modalContext) {
    throw new Error("Sheet requires ModalOverlay");
  }

  let scroller: HTMLDivElement | undefined;

  const [pageOffset, setPageOffset] = createSignal(
    {
      x: typeof window === "undefined" ? 0 : window.scrollX,
      y: typeof window === "undefined" ? 0 : window.scrollY,
    },
    { ownedWrite: true }
  );

  const [geometry, setGeometry] = createSignal<{
    points: number[];
    size: number;
    viewport: number;
  }>({ points: [], size: 0, viewport: 0 }, { ownedWrite: true });

  const [scroll, setScroll] = createSignal(0, { ownedWrite: true });
  const [isDragging, setDragging] = createSignal(false, { ownedWrite: true });
  const config = () => swipeConfig(context.values.swipeDirection);

  const points = () => {
    const { points: measured, size } = geometry();
    const element = ref();

    const configured = context.props.snapPoints;

    const configuredPoints =
      configured !== undefined && configured.length > 0 ? configured : [size];

    return element
      ? configuredPoints.map((point, index) =>
          Math.max(
            0,
            Math.min(
              size,
              measured[index] ?? resolveLength(point, size, element)
            )
          )
        )
      : [size];
  };

  const smallest = () => Math.min(...points());

  const clamped = () =>
    context.props.preventDismissal === true &&
    !context.values.isEntering &&
    !context.values.isExiting;

  const travel = () => Math.max(1, geometry().size - smallest());

  const stageStart = () => {
    if (clamped() && config().after) {
      return config().before ? 1 : travel();
    }

    return geometry().viewport;
  };

  const entered = () => (config().before && !config().after ? 0 : stageStart());

  const visible = () =>
    Math.max(0, geometry().size - Math.abs(scroll() - entered()));

  const scrollForPoint = (point: number) =>
    entered() + (config().after ? -1 : 1) * (geometry().size - point);

  const setPosition = (value: number) => {
    if (!scroller) {
      return;
    }

    const conf = config();

    let lower = 0;
    let upper = geometry().viewport * (conf.maxScroll / 100);

    if (clamped()) {
      const dual = conf.before === conf.after;
      lower = dual ? entered() - 1 : 0;
      upper = dual ? entered() + 1 : travel();
    }

    const position = Math.max(lower, Math.min(upper, value));

    if (conf.axis === "y") {
      scroller.scrollTop = position;
    } else {
      scroller.scrollLeft = position;
    }

    setScroll(position);
  };

  let initialized = false;
  let lastInitial = "";
  let previousEntered = 0;

  const measure = () => {
    const element = ref();

    if (!element || !scroller) {
      return;
    }

    const conf = config();
    const rect = element.getBoundingClientRect();

    const total =
      conf.axis === "y"
        ? element.offsetHeight || rect.height
        : element.offsetWidth || rect.width;

    let padding = 0;

    if (
      props.overscrollPadding === true &&
      context.values.position === context.values.swipeDirection
    ) {
      padding = conf.axis === "y" ? window.innerHeight : window.innerWidth;
    }

    const size = Math.max(0, total - padding);

    const edges =
      conf.axis === "y"
        ? (["top", "bottom"] as const)
        : (["left", "right"] as const);

    const edge = conf.after ? edges[0] : edges[1];

    const markers = element.querySelectorAll<HTMLElement>(
      "[data-sheet-detent]"
    );

    const configured = context.props.snapPoints ?? [];

    const measured = Array.from(markers, (marker, index) => {
      const length = getComputedStyle(marker)[edge];
      const value = length.endsWith("px") ? parseCSSNumber(length) : Number.NaN;

      return Number.isFinite(value)
        ? value
        : resolveLength(configured[index] ?? size, size, element);
    });

    setGeometry({
      points: measured,
      size,
      viewport: conf.axis === "y" ? window.innerHeight : window.innerWidth,
    });
  };

  const updatePageOffset = () => {
    setPageOffset({ x: window.scrollX, y: window.scrollY });
  };

  onSettled((): (() => void) | undefined => {
    untrack(measure);

    const element = untrack(ref);

    if (element?.isConnected !== true) {
      return undefined;
    }

    const unregister = context.register(element, {
      get height() {
        geometry();

        return element.offsetHeight;
      },
      get isSwiping() {
        return isDragging();
      },
      get swipeProgress() {
        const offsets = points()
          .map((point) => geometry().size - point)
          .toSorted((a, b) => a - b);

        const minimum = offsets[0] ?? 0;

        const range =
          offsets.length > 1 ? (offsets[1] ?? 0) - minimum : geometry().size;

        return Math.max(
          0,
          Math.min(1, (geometry().size - visible() - minimum) / (range || 1))
        );
      },
    });

    const observer = new ResizeObserver(measure);

    observer.observe(element);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", updatePageOffset, { passive: true });

    return () => {
      unregister();
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", updatePageOffset);
    };
  });
  createEffect(
    () => ({
      axis: config().axis,
      points: context.props.snapPoints?.join(" "),
    }),
    () => {
      untrack(measure);
    },
    { ssrSource: "client" }
  );
  createEffect(
    () => {
      const conf = config();
      const { size, viewport } = geometry();
      const start = entered();
      const isClamped = clamped();
      const dual = conf.before === conf.after;

      let upper = viewport * (conf.maxScroll / 100);

      if (isClamped) {
        upper = dual ? start + 1 : travel();
      }

      return {
        axis: conf.axis,
        direction: context.values.swipeDirection,
        entered: start,
        initial: scrollForPoint(points()[0] ?? size),
        lower: isClamped && dual ? start - 1 : 0,
        points: context.props.snapPoints?.join(" "),
        scroll: untrack(scroll),
        size,
        upper,
        viewport,
      };
    },
    (next) => {
      if (!next.size || !next.viewport || !scroller) {
        return;
      }

      const initialKey = `${next.direction}:${next.points ?? ""}`;

      const target =
        !initialized || initialKey !== lastInitial
          ? next.initial
          : next.scroll + next.entered - previousEntered;

      const position = Math.max(next.lower, Math.min(next.upper, target));

      if (next.axis === "y") {
        scroller.scrollTop = position;
      } else {
        scroller.scrollLeft = position;
      }

      setScroll(position);
      initialized = true;
      lastInitial = initialKey;
      previousEntered = next.entered;
    }
  );
  const setExpanded = untrack(() => context.setExpanded);
  createEffect(
    () => ({ size: geometry().size, visible: visible() }),
    (next) => {
      setExpanded(next.size > 0 && next.visible >= next.size - 1);
    }
  );

  const finish = () => {
    if (!initialized) {
      return;
    }

    const { size } = geometry();
    const amount = visible();
    const minimum = smallest();

    if (context.props.preventDismissal !== true && amount < minimum / 2) {
      context.values.state.close();

      return;
    }

    let nearest = minimum;

    for (const point of points()) {
      if (Math.abs(point - amount) < Math.abs(nearest - amount)) {
        nearest = point;
      }
    }

    let side = config().after ? -1 : 1;

    if (config().before && config().after && scroll() > entered()) {
      side = 1;
    }

    setPosition(entered() + side * (size - nearest));
  };

  let gesture:
    | {
        id: number;
        coordinate: number;
        scroll: number;
        target: EventTarget | null;
        dragged: boolean;
      }
    | undefined;

  const onDown = (event: PointerEvent) => {
    if (
      event.button !== 0 ||
      context.values.hasDescendants ||
      (event.pointerType === "touch" &&
        (!(event.target instanceof Element) ||
          !event.target.closest("[data-sheet-drag-handle]"))) ||
      !initialized
    ) {
      return;
    }

    gesture = {
      coordinate: config().axis === "y" ? event.clientY : event.clientX,
      dragged: false,
      id: event.pointerId,
      scroll: scroll(),
      target: event.target,
    };
  };

  const onUp = (event: PointerEvent) => {
    if (gesture?.id !== event.pointerId) {
      return;
    }

    const { dragged } = gesture;
    gesture = undefined;

    if (dragged) {
      finish();
    }

    setDragging(false);
  };

  const onCancel = () => {
    if (gesture) {
      gesture = undefined;
      finish();
      setDragging(false);
    }
  };

  onSettled((): (() => void) | undefined => {
    const element = untrack(ref);

    if (element?.isConnected !== true) {
      return undefined;
    }

    modalContext.setModalRef(element);

    const onMove = (event: PointerEvent) => {
      if (!gesture || event.pointerId !== gesture.id) {
        return;
      }

      const coordinate = config().axis === "y" ? event.clientY : event.clientX;
      const delta = coordinate - gesture.coordinate;

      if (!gesture.dragged && Math.abs(delta) < 6) {
        return;
      }

      if (
        !gesture.dragged &&
        canScroll(gesture.target, element, config().axis, delta)
      ) {
        gesture = undefined;

        return;
      }

      gesture.dragged = true;
      setDragging(true);
      element.setPointerCapture?.(event.pointerId);
      event.preventDefault();
      setPosition(gesture.scroll - delta);
    };

    element.addEventListener("pointerdown", onDown);
    const doc = element.ownerDocument;
    doc.addEventListener("pointermove", onMove);
    doc.addEventListener("pointerup", onUp);
    doc.addEventListener("pointercancel", onCancel);

    return () => {
      element.removeEventListener("pointerdown", onDown);
      doc.removeEventListener("pointermove", onMove);
      doc.removeEventListener("pointerup", onUp);
      doc.removeEventListener("pointercancel", onCancel);
    };
  });

  const render = createRenderProps(
    mergeProps(props, {
      defaultClass: "solid2-aria-Sheet",
      get values() {
        return context.values;
      },
    })
  );

  const sheetStyle = (): CSSProperties => {
    const frontmost = context.descendants.at(-1);

    const own: CSSProperties = {
      "--sheet-descendant-count": context.descendants.length,
      "--sheet-frontmost-height": `${frontmost?.height ?? 0}px`,
      "--sheet-swipe-progress":
        frontmost?.swipeProgress ?? context.entry?.swipeProgress ?? 0,
      direction: locale.direction,
      position: "relative",
      ...swipeAnimation(props, context),
    };

    if (
      props.overscrollPadding === true &&
      context.values.position === context.values.swipeDirection
    ) {
      const vertical = config().axis === "y";
      const amount = vertical ? "100vh" : "100vw";
      const { position } = context.values;

      if (position === "bottom") {
        own["padding-bottom"] = amount;
        own["margin-bottom"] = `-${amount}`;
      } else if (position === "top") {
        own["padding-top"] = amount;
        own["margin-top"] = `-${amount}`;
      } else if (position === "left") {
        own["padding-left"] = amount;
        own["margin-left"] = `-${amount}`;
      } else if (position === "right") {
        own["padding-right"] = amount;
        own["margin-right"] = `-${amount}`;
      }
    }

    if (
      props.stackAnimation !== undefined &&
      props.stackAnimation.length > 0 &&
      viewTimelineSupported() &&
      context.descendants.length
    ) {
      const { descendants } = context;
      own["animation-name"] = [
        own["animation-name"],
        ...descendants.map(() => props.stackAnimation),
      ]
        .filter(Boolean)
        .join(", ");
      own["animation-timeline"] = [
        own["animation-timeline"],
        ...descendants.map(
          (_, i) => `--sheet-timeline-${context.values.stackIndex + 1 + i}`
        ),
      ]
        .filter(Boolean)
        .join(", ");
      own["animation-direction"] = [
        own["animation-direction"],
        ...descendants.map((entry) => entry.direction),
      ]
        .filter(Boolean)
        .join(", ");
      own["animation-iteration-count"] = [
        own["animation-iteration-count"],
        ...descendants.map((entry) => entry.iterations),
      ]
        .filter(Boolean)
        .join(", ");
      own["animation-range"] = [
        own["animation-range"],
        ...descendants.map((entry) => entry.range),
      ]
        .filter(Boolean)
        .join(", ");
      own["animation-fill-mode"] = [
        own["animation-fill-mode"],
        ...descendants.map(() => "both"),
      ]
        .filter(Boolean)
        .join(", ");
      own["animation-composition"] = [
        own["animation-composition"],
        ...descendants.map(() => "accumulate"),
      ]
        .filter(Boolean)
        .join(", ");
      own["animation-timing-function"] = [
        own["animation-timing-function"],
        ...descendants.map(() => "linear"),
      ]
        .filter(Boolean)
        .join(", ");
    }

    return Object.assign(own, objectStyle(render.style));
  };

  const alignment: Record<SheetPosition, [string, string]> = {
    bottom: ["center", "flex-end"],
    center: ["center", "center"],
    left: ["flex-start", "center"],
    right: ["flex-end", "center"],
    top: ["center", "flex-start"],
  };

  const viewport = () => (config().axis === "y" ? "100dvh" : "100dvw");

  const endMarker = () => {
    if (clamped() && config().before) {
      return config().after
        ? `calc(${stageStart()}px + ${viewport()} + 1px)`
        : `calc(${travel()}px + ${viewport()})`;
    }

    return `calc(${stageStart()}px + ${viewport()}${config().before && config().after ? ` + ${viewport()}` : ""})`;
  };

  const scrollerStyle = (): JSX.CSSProperties => ({
    direction: "ltr",
    height: config().axis === "y" ? "200dvh" : "100dvh",
    left:
      config().axis === "x"
        ? `calc(${pageOffset().x}px + ${config().containerOffset}dvw)`
        : `${pageOffset().x}px`,
    "overflow-x": config().axis === "x" ? "auto" : "hidden",
    "overflow-y": config().axis === "y" ? "auto" : "hidden",
    "overscroll-behavior-x": config().axis === "x" ? "contain" : "none",
    "overscroll-behavior-y": config().axis === "y" ? "contain" : "none",
    position: "absolute",
    "scroll-snap-type":
      context.values.isEntering || context.values.isExiting || isDragging()
        ? "none"
        : `${config().axis} mandatory`,
    "scrollbar-width": "none",
    top:
      config().axis === "y"
        ? `calc(${pageOffset().y}px + ${config().containerOffset}dvh)`
        : `${pageOffset().y}px`,
    width: config().axis === "x" ? "200dvw" : "100dvw",
  });

  const detentStyle = (): CSSProperties => {
    const style: CSSProperties = {
      inset: 0,
      "pointer-events": "none",
      position: "absolute",
    };

    if (
      props.overscrollPadding === true &&
      context.values.position === context.values.swipeDirection
    ) {
      const { position } = context.values;
      style[position] = config().axis === "y" ? "100vh" : "100vw";
    }

    return style;
  };

  return (
    <div
      data-sheet-scroll
      ref={(element) => {
        scroller = element;
      }}
      onScroll={() => {
        if (!scroller) {
          return;
        }

        const position =
          config().axis === "y" ? scroller.scrollTop : scroller.scrollLeft;

        if (context.props.preventDismissal === true && initialized) {
          setPosition(position);
        } else {
          setScroll(position);
        }
      }}
      onScrollEnd={() => {
        if (!gesture) {
          finish();
        }
      }}
      style={scrollerStyle()}
    >
      <SnapPoint
        point={0}
        align={clamped() && config().after ? "none" : "start"}
        axis={config().axis}
      />
      {config().before && config().after && (
        <SnapPoint point={stageStart()} align="start" axis={config().axis} />
      )}
      <div
        data-sheet-stage
        style={{
          "align-items":
            config().axis === "y"
              ? alignment[context.values.position][0]
              : alignment[context.values.position][1],
          display: "flex",
          "flex-direction": config().axis === "y" ? "column" : "row",
          height: "100dvh",
          "justify-content":
            config().axis === "y"
              ? alignment[context.values.position][1]
              : alignment[context.values.position][0],
          left: config().axis === "x" ? `${stageStart()}px` : 0,
          position: "absolute",
          top: config().axis === "y" ? `${stageStart()}px` : 0,
          width: "100dvw",
        }}
      >
        <dom.div
          {...mergeProps(
            filterDOMProps(props, { global: true }),
            merge(() => modalContext.modalProps ?? {}),
            omit(render, "children"),
            sheetData(context.values)
          )}
          ref={[
            (element: HTMLDivElement) => {
              modalContext.setModalRef(element);
            },
            (element: HTMLDivElement) => {
              setRef(element);
            },
            (element: HTMLDivElement) => {
              assignRef(
                untrack(() => props.ref),
                element
              );
            },
          ]}
          style={sheetStyle()}
          data-swiping={isDragging() || undefined}
          data-descendants-swiping={
            context.descendants.some((entry) => entry.isSwiping) || undefined
          }
        >
          {modalContext.isDismissable === true && (
            <DismissButton onDismiss={context.values.state.close} />
          )}
          {context.props.snapPoints && (
            <div data-sheet-detents style={detentStyle()}>
              <For each={context.props.snapPoints}>
                {(point, index) => (
                  <DetentPoint
                    point={point}
                    axis={config().axis}
                    after={config().after}
                    isInitial={index() === 0}
                  />
                )}
              </For>
            </div>
          )}
          <SheetOverlayChildren values={context.values}>
            {props.children}
          </SheetOverlayChildren>
          <DismissButton onDismiss={context.values.state.close} />
        </dom.div>
      </div>
      <SnapPoint
        point={endMarker()}
        align={clamped() && config().before ? "none" : "end"}
        axis={config().axis}
      />
    </div>
  );
}

function SnapPoint(props: {
  point: number | string;
  align: "start" | "end" | "none";
  axis: Axis;
}) {
  return (
    <div
      data-sheet-snap
      style={{
        height: props.axis === "y" ? "100dvh" : "1px",
        left: props.axis === "x" ? toLength(props.point) : 0,
        position: "absolute",
        "scroll-snap-align": props.align,
        top: props.axis === "y" ? toLength(props.point) : 0,
        width: props.axis === "x" ? "100dvw" : "1px",
      }}
    />
  );
}

function DetentPoint(props: {
  point: number | string;
  axis: Axis;
  after: boolean;
  isInitial: boolean;
}) {
  const style = (): CSSProperties => {
    const detent: CSSProperties = {
      height: "1px",
      "pointer-events": "none",
      position: "absolute",
      "scroll-snap-align": props.after ? "start" : "end",
      width: "1px",
    };

    if (props.axis === "y") {
      detent.left = 0;

      if (props.after) {
        detent.top = toLength(props.point);
        detent["scroll-margin-top"] = "100dvh";
      } else {
        detent.bottom = toLength(props.point);
        detent["scroll-margin-bottom"] = "100dvh";
      }
    } else {
      detent.top = 0;

      if (props.after) {
        detent.left = toLength(props.point);
        detent["scroll-margin-left"] = "100dvw";
      } else {
        detent.right = toLength(props.point);
        detent["scroll-margin-right"] = "100dvw";
      }
    }

    return detent;
  };

  return (
    <div
      data-sheet-detent
      data-sheet-initial={props.isInitial || undefined}
      style={style()}
    />
  );
}

export function SheetBackdrop(props: SheetBackdropProps): JSX.Element {
  const context = useContext(SheetContext);

  if (!context) {
    throw new Error("SheetBackdrop requires SheetOverlay");
  }

  const render = createRenderProps(
    mergeProps(props, {
      defaultClass: "solid2-aria-SheetBackdrop",
      get defaultStyle(): CSSProperties {
        return {
          "--sheet-swipe-progress": context.entry?.swipeProgress ?? 0,
          inset: 0,
          position: "absolute" as const,
          ...swipeAnimation(props, context),
        };
      },
      get values() {
        return context.values;
      },
    })
  );

  return (
    <dom.div
      {...mergeProps(
        filterDOMProps(props, { global: true }),
        render,
        sheetData(context.values),
        {
          onClick() {
            if (
              context.props.preventDismissal !== true &&
              !context.values.hasDescendants
            ) {
              context.values.state.close();
            }
          },
          get ref() {
            return props.ref;
          },
        }
      )}
    />
  );
}

export function SheetContent(props: SheetContentProps): JSX.Element {
  const context = useContext(SheetContext);

  if (!context) {
    throw new Error("SheetContent requires SheetOverlay");
  }

  const config = () => swipeConfig(context.values.swipeDirection);
  const viewport = () => (config().axis === "y" ? "100dvh" : "100dvw");

  return (
    <Dialog
      {...props}
      isEntering={context.values.isEntering}
      data-sheet-content
      class={props.class ?? "solid2-aria-SheetContent"}
      style={(values) => {
        const own =
          typeof props.style === "function" ? props.style(values) : props.style;

        return {
          ...objectStyle(own),
          height: "100%",
          "view-timeline-axis": config().axis,
          "view-timeline-inset":
            config().before && !config().after
              ? `${viewport()} 0`
              : `0 ${viewport()}`,
          "view-timeline-name": `--sheet-timeline-${context.values.stackIndex}`,
          width: "100%",
        };
      }}
    />
  );
}
