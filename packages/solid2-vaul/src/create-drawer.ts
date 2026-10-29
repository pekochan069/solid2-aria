/*
 * Derived from Vaul (https://github.com/emilkowalski/vaul): src/index.tsx.
 * Copyright (c) 2023 Emil Kowalski
 * Modified for Solid Aria: native Solid 2 controlled state, presence, pointer gestures, measured snap-point entry, nested transforms, and lifecycle.
 * MIT licensed. See LICENSE, VAUL-LICENSE, and NOTICE.txt in the package root.
 */

import {
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  onSettled,
  untrack,
} from "solid-js";

import {
  CLOSE_THRESHOLD,
  DRAG_CLASS,
  NESTED_DISPLACEMENT,
  SCROLL_LOCK_TIMEOUT,
  TRANSITIONS,
  VELOCITY_THRESHOLD,
} from "./constants";
import type { DrawerContextValue } from "./context";
import {
  getOverlayOpacity,
  getSnapPointOffsets,
  selectSnapPoint,
} from "./create-snap-points";
import {
  canScroll,
  clamp,
  dampenValue,
  directionSign,
  isVertical,
  translate,
} from "./helpers";
import type { DialogProps, SnapPoint } from "./types";

const transition = `${TRANSITIONS.DURATION}s cubic-bezier(${TRANSITIONS.EASE.join(",")})`;

interface Gesture {
  x: number;
  y: number;
  startedAt: number;
  dimension: number;
  startOffset: number;
  distance: number;
  allowed: boolean;
  fromHandle: boolean;
  pointerId: number;
  target: HTMLElement;
}

export function createDrawer(
  props: DialogProps,
  parent?: DrawerContextValue
): DrawerContextValue {
  const [internalOpen, setInternalOpen] = createSignal(
    untrack(() => props.defaultOpen ?? false)
  );

  const isOpen = createMemo(() => props.open ?? internalOpen());
  const [present, setPresent] = createSignal(untrack(isOpen));

  const [animate, setAnimate] = createSignal(
    untrack(() => props.defaultOpen !== true)
  );

  const [internalSnap, setInternalSnap] = createSignal<SnapPoint | null>(
    untrack(() => props.snapPoints?.[0] ?? null)
  );

  const activeSnap = createMemo(() =>
    props.activeSnapPoint === undefined ? internalSnap() : props.activeSnapPoint
  );

  const [content, setContent] = createSignal<HTMLDivElement | null>(null, {
    ownedWrite: true,
  });

  const [overlay, setOverlay] = createSignal<HTMLDivElement | null>(null, {
    ownedWrite: true,
  });

  const [trigger, setTrigger] = createSignal<HTMLButtonElement | null>(null, {
    ownedWrite: true,
  });

  const [dimension, setDimension] = createSignal(0);
  const [dragging, setDragging] = createSignal(false);
  const [dragProgress, setDragProgress] = createSignal(0);
  const [childOpen, setChildOpen] = createSignal(false);
  const [childProgress, setChildProgress] = createSignal(0);
  const direction = () => props.direction ?? "bottom";
  const points = () => props.snapPoints ?? [];

  const offsets = createMemo(() =>
    getSnapPointOffsets(points(), dimension(), direction())
  );

  const activeIndex = createMemo(() =>
    Math.max(0, points().indexOf(activeSnap() ?? points()[0] ?? 0))
  );

  const offset = () => offsets()[activeIndex()] ?? 0;

  const fadeFromIndex = () =>
    props.fadeFromIndex ?? Math.max(0, points().length - 1);

  const id = createUniqueId();
  let gesture: Gesture | null = null;
  let lastScrollTime = -Infinity;
  let openedAt = -Infinity;

  const onScroll = () => {
    lastScrollTime = Date.now();
  };

  function setOpen(open: boolean): void {
    if (open === isOpen()) {
      return;
    }

    if (props.open === undefined) {
      setInternalOpen(open);
    }

    props.onOpenChange?.(open);
  }

  function setActiveSnapPoint(point: SnapPoint | null): void {
    if (point === activeSnap()) {
      return;
    }

    if (props.activeSnapPoint === undefined) {
      setInternalSnap(point);
    }

    props.setActiveSnapPoint?.(point);
  }

  function resetPosition(): void {
    const element = content();

    if (!element) {
      return;
    }

    element.classList.remove(DRAG_CLASS);
    element.style.transition = `transform ${transition}`;
    element.style.transform = translate(offset(), direction());
    const backdrop = overlay();

    if (backdrop) {
      backdrop.style.transition = `opacity ${transition}`;
      backdrop.style.opacity = points().length
        ? `${getOverlayOpacity(offsets(), Math.abs(offset()), fadeFromIndex(), dimension())}`
        : "1";
    }
  }

  function cancelDrag(): void {
    if (!gesture) {
      return;
    }

    if (gesture.target.hasPointerCapture?.(gesture.pointerId)) {
      gesture.target.releasePointerCapture(gesture.pointerId);
    }

    gesture = null;
    setDragging(false);
    setDragProgress(0);
    untrack(resetPosition);
    parent?.setChildProgress(0);
  }

  function close(): void {
    cancelDrag();

    if (props.dismissible !== false) {
      setOpen(false);
    }
  }

  createEffect(
    isOpen,
    (open, previous): undefined | (() => void) => {
      if (open) {
        openedAt = Date.now();
        setPresent(true);
      } else {
        cancelDrag();

        if (previous === true) {
          props.onClose?.();
        }
      }

      parent?.setChildOpen(open);

      if (previous === undefined && !open) {
        return undefined;
      }

      const view = untrack(content)?.ownerDocument.defaultView;

      const duration =
        view?.matchMedia("(prefers-reduced-motion: reduce)").matches === true
          ? 0
          : TRANSITIONS.DURATION * 1000;

      const timer = setTimeout(() => {
        if (!open) {
          setPresent(false);
          setActiveSnapPoint(points()[0] ?? null);
        }

        if (previous !== undefined) {
          props.onAnimationEnd?.(open);
        }
      }, duration);

      return () => {
        clearTimeout(timer);
      };
    },
    { ssrSource: "client" }
  );

  createEffect(
    () => ({
      container: props.container,
      direction: direction(),
      element: content(),
    }),
    ({
      element,
      container,
      direction: currentDirection,
    }): undefined | (() => void) => {
      if (!element) {
        return undefined;
      }

      const view = element.ownerDocument.defaultView;

      if (!view) {
        return undefined;
      }

      const measure = (): void => {
        const rect = container?.getBoundingClientRect();
        setDimension(
          isVertical(currentDirection)
            ? (rect?.height ?? view.innerHeight)
            : (rect?.width ?? view.innerWidth)
        );
      };

      measure();
      view.addEventListener("resize", measure);

      const observer =
        typeof ResizeObserver === "undefined"
          ? undefined
          : new ResizeObserver(measure);

      if (container) {
        observer?.observe(container);
      }

      element.addEventListener("scroll", onScroll, true);

      return () => {
        view.removeEventListener("resize", measure);
        observer?.disconnect();
        element.removeEventListener("scroll", onScroll, true);
        cancelDrag();
      };
    },
    { ssrSource: "client" }
  );

  createEffect(
    () => ({
      animate: animate(),
      backdrop: overlay(),
      child: childOpen(),
      dimension: dimension(),
      direction: direction(),
      element: content(),
      hasSnapPoints: points().length > 0,
      offset: offset(),
      opacity: points().length
        ? getOverlayOpacity(
            offsets(),
            Math.abs(offset()),
            fadeFromIndex(),
            dimension()
          )
        : 1,
      open: isOpen(),
      progress: childProgress(),
    }),
    ({
      animate: shouldAnimate,
      element,
      backdrop,
      dimension: currentDimension,
      hasSnapPoints,
      open,
      offset: currentOffset,
      child,
      progress,
      direction: currentDirection,
      opacity,
    }) => {
      if (!element || (hasSnapPoints && currentDimension === 0)) {
        return;
      }

      const sign = directionSign(currentDirection);
      const view = element.ownerDocument.defaultView;

      const size = isVertical(currentDirection)
        ? view?.innerHeight
        : view?.innerWidth;

      const scale = child
        ? 1 - (NESTED_DISPLACEMENT / Math.max(1, size ?? 1)) * (1 - progress)
        : 1;

      const displacement = child
        ? -NESTED_DISPLACEMENT * (1 - progress) * sign
        : 0;

      if (hasSnapPoints && shouldAnimate && element.style.transform === "") {
        // Commit the closed position before transitioning to the measured snap point.
        element.getBoundingClientRect();
      }

      element.style.transition = shouldAnimate
        ? `transform ${transition}`
        : "none";
      element.style.transform = `${translate(open ? currentOffset + displacement : sign * (size ?? currentDimension), currentDirection)} scale(${scale})`;

      if (backdrop) {
        backdrop.style.transition = shouldAnimate
          ? `opacity ${transition}`
          : "none";
        backdrop.style.opacity = open ? `${opacity}` : "0";
      }
    },
    { ssrSource: "client" }
  );

  onSettled(() => {
    const frame = requestAnimationFrame(() => {
      setAnimate(true);
    });

    return () => {
      cancelAnimationFrame(frame);
      parent?.setChildOpen(false);
    };
  });

  function press(event: PointerEvent, fromHandle = false): void {
    const element = content();
    const { target } = event;

    if (
      !element ||
      !isOpen() ||
      childOpen() ||
      event.defaultPrevented ||
      event.button > 0
    ) {
      return;
    }

    if (
      !(target instanceof HTMLElement) ||
      target.closest("[data-vaul-drawer]") !== element
    ) {
      return;
    }

    if (
      target.closest("[data-vaul-no-drag],select,option") ||
      (props.handleOnly === true && !fromHandle)
    ) {
      return;
    }

    if (props.dismissible === false && !points().length) {
      return;
    }

    const rect = element.getBoundingClientRect();
    gesture = {
      allowed: false,
      dimension: isVertical(direction()) ? rect.height : rect.width,
      distance: 0,
      fromHandle,
      pointerId: event.pointerId,
      startOffset: Math.abs(offset()),
      startedAt: Date.now(),
      target,
      x: event.clientX,
      y: event.clientY,
    };
  }

  function canDrag(target: HTMLElement, distance: number): boolean {
    if (!gesture || target.closest("[data-vaul-no-drag],select,option")) {
      return false;
    }

    if (gesture.fromHandle) {
      return true;
    }

    if ((target.ownerDocument.getSelection()?.toString().length ?? 0) > 0) {
      return false;
    }

    if (Date.now() - openedAt < TRANSITIONS.DURATION * 1000) {
      return false;
    }

    if (
      Date.now() - lastScrollTime <
      (props.scrollLockTimeout ?? SCROLL_LOCK_TIMEOUT)
    ) {
      return false;
    }

    const lastOffset = Math.abs(offsets().at(-1) ?? 0);

    if (distance < 0 && gesture.startOffset > lastOffset) {
      return true;
    }

    const element = content();

    return (
      element !== null && !canScroll(target, element, direction(), distance)
    );
  }

  function claimGesture(
    event: PointerEvent,
    current: Gesture,
    axis: number,
    cross: number,
    distance: number
  ): boolean {
    if (current.allowed) {
      return true;
    }

    const threshold = event.pointerType === "touch" ? 10 : 2;

    if (Math.abs(axis) < threshold && Math.abs(cross) < threshold) {
      return false;
    }

    if (Math.abs(cross) > Math.abs(axis)) {
      gesture = null;

      return false;
    }

    if (!canDrag(current.target, distance)) {
      return false;
    }

    current.allowed = true;
    current.target.setPointerCapture?.(event.pointerId);
    setDragging(true);

    return true;
  }

  function drag(event: PointerEvent): void {
    const current = gesture;
    const element = content();

    if (!current || !element || current.pointerId !== event.pointerId) {
      return;
    }

    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;
    const vertical = isVertical(direction());
    const axis = vertical ? dy : dx;
    const cross = vertical ? dx : dy;
    const distance = axis * directionSign(direction());

    if (!claimGesture(event, current, axis, cross, distance)) {
      return;
    }

    event.preventDefault();
    const minimum = Math.abs(offsets().at(-1) ?? 0);
    let position = current.startOffset + distance;

    if (position < minimum) {
      position = minimum - dampenValue(minimum - position);
    }

    if (props.dismissible === false) {
      position = Math.min(position, Math.abs(offsets()[0] ?? 0));
    }

    current.distance = position - current.startOffset;
    element.classList.add(DRAG_CLASS);
    element.style.transition = "none";
    element.style.transform = translate(
      position * directionSign(direction()),
      direction()
    );

    const percentage = clamp(
      Math.max(0, distance) /
        Math.max(1, current.dimension - current.startOffset)
    );

    const backdrop = overlay();

    if (backdrop) {
      backdrop.style.transition = "none";
      backdrop.style.opacity = points().length
        ? `${getOverlayOpacity(offsets(), position, fadeFromIndex(), dimension())}`
        : `${1 - percentage}`;
    }

    setDragProgress(percentage);
    props.onDrag?.(event, percentage);
    parent?.setChildProgress(percentage);
  }

  function release(event: PointerEvent): void {
    const current = gesture;

    if (!current || event.pointerId !== current.pointerId) {
      return;
    }

    const velocity =
      Math.abs(current.distance) / Math.max(1, Date.now() - current.startedAt);

    let next: number | "close" = activeIndex();

    if (current.allowed && points().length) {
      next = selectSnapPoint({
        activeIndex: activeIndex(),
        dimension: dimension(),
        dismissible: props.dismissible !== false,
        distance: current.distance,
        offsets: offsets(),
        sequential: props.snapToSequentialPoint ?? false,
        velocity,
      });
    } else if (
      current.allowed &&
      current.distance > 0 &&
      props.dismissible !== false &&
      (velocity > VELOCITY_THRESHOLD ||
        current.distance >=
          current.dimension * (props.closeThreshold ?? CLOSE_THRESHOLD))
    ) {
      next = "close";
    }

    cancelDrag();

    if (!current.allowed) {
      return;
    }

    if (next === "close") {
      close();
    } else if (points().length) {
      setActiveSnapPoint(points()[next] ?? null);
    }

    props.onRelease?.(event, next !== "close");
  }

  return {
    get activeSnapPoint() {
      return activeSnap();
    },
    get activeSnapPointIndex() {
      return activeIndex();
    },
    cancelDrag,
    get childOpen() {
      return childOpen();
    },
    close,
    get content() {
      return content();
    },
    contentId: `vaul-${id}`,
    descriptionId: `vaul-${id}-description`,
    get direction() {
      return direction();
    },
    get dismissible() {
      return props.dismissible ?? true;
    },
    drag,
    get dragProgress() {
      return dragProgress();
    },
    get isDragging() {
      return dragging();
    },
    get isOpen() {
      return isOpen();
    },
    get modal() {
      return props.modal ?? true;
    },
    get overlay() {
      return overlay();
    },
    get present() {
      return present();
    },
    press,
    props,
    release,
    setActiveSnapPoint,
    setChildOpen(open) {
      setChildOpen(open);
      setChildProgress(0);
    },
    setChildProgress(progress) {
      setChildProgress(progress);
    },
    setContent(element) {
      setContent(element);
    },
    setOpen,
    setOverlay(element) {
      setOverlay(element);
    },
    setTrigger(element) {
      setTrigger(element);
    },
    get shouldAnimate() {
      return animate();
    },
    get shouldFade() {
      return !points().length || activeIndex() >= fadeFromIndex();
    },
    get snapPointsOffset() {
      return offsets();
    },
    titleId: `vaul-${id}-title`,
    get trigger() {
      return trigger();
    },
  };
}
