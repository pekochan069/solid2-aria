/*!
 * Derived from solid-sonner (https://github.com/wobsoriano/solid-sonner), src/index.tsx.
 * Copyright (c) 2022 Robert Soriano <https://github.com/wobsoriano>
 * Derived from Sonner (https://github.com/emilkowalski/sonner), src/index.tsx.
 * Copyright (c) 2023 Emil Kowalski
 * Modified for Solid Aria: Solid 2 types, reactivity, lifecycle, and package integration.
 * MIT licensed. See LICENSE, SOLID-SONNER-LICENSE.md, SONNER-LICENSE.md, and NOTICE.txt in the package root.
 */
/*!
 * Original code by Emil Kowalski
 * MIT Licensed, Copyright 2023 Emil Kowalski, see https://github.com/emilkowalski/sonner/blob/main/LICENSE.md for details
 *
 * Credits:
 * https://github.com/emilkowalski/sonner/blob/main/src/index.tsx
 */

import type { JSX } from "@solidjs/web";
import {
  For,
  Show,
  createEffect,
  createMemo,
  createRenderEffect,
  createSignal,
  createStore,
  merge,
  onCleanup,
  onSettled,
  untrack,
} from "solid-js";
import type { Setter } from "solid-js";

import { CloseIcon, Loader, getAsset } from "./assets";
import { createIsDocumentHidden } from "./primitives";
import { ToastState } from "./state";
import { isAction } from "./types";
import type {
  Action,
  HeightT,
  Offset,
  Position,
  SwipeDirection,
  ToastClassnames,
  ToastContent,
  ToastIcons,
  ToastProps,
  ToastT,
  ToastTypes,
  ToasterProps,
} from "./types";

export { toast } from "./state";

const VISIBLE_TOASTS_AMOUNT = 3;
const VIEWPORT_OFFSET = "24px";
const MOBILE_VIEWPORT_OFFSET = "16px";
const TOAST_LIFETIME = 4000;
const TOAST_WIDTH = 356;
const GAP = 14;
const SWIPE_THRESHOLD = 45;
const TIME_BEFORE_UNMOUNT = 200;

function cn(...classes: (string | undefined)[]) {
  return classes;
}

function resolveContent(content?: ToastContent) {
  // ToastContent intentionally accepts both rendered JSX and zero-argument render functions.
  // oxlint-disable-next-line anti-slop/no-runtime-typeof -- Distinguish the public render-function form from JSX.
  return typeof content === "function" ? content() : content;
}

function isSwipeDirection(direction: string): direction is SwipeDirection {
  return (
    direction === "top" ||
    direction === "right" ||
    direction === "bottom" ||
    direction === "left"
  );
}

function getDefaultSwipeDirections(position: string): SwipeDirection[] {
  return position.split("-").filter(isSwipeDirection);
}

function getDampening(delta: number) {
  const factor = Math.abs(delta) / 20;

  return 1 / (1.5 + factor);
}

function dampenMovement(delta: number, directionAllowed: boolean) {
  return directionAllowed ? delta : delta * getDampening(delta);
}

function getSwipeAmount(
  direction: "x" | "y" | null,
  xDelta: number,
  yDelta: number,
  allowedDirections: SwipeDirection[]
) {
  if (
    direction === "y" &&
    (allowedDirections.includes("top") || allowedDirections.includes("bottom"))
  ) {
    const allowed =
      (allowedDirections.includes("top") && yDelta < 0) ||
      (allowedDirections.includes("bottom") && yDelta > 0);

    return { x: 0, y: dampenMovement(yDelta, allowed) };
  }

  if (
    direction === "x" &&
    (allowedDirections.includes("left") || allowedDirections.includes("right"))
  ) {
    const allowed =
      (allowedDirections.includes("left") && xDelta < 0) ||
      (allowedDirections.includes("right") && xDelta > 0);

    return { x: dampenMovement(xDelta, allowed), y: 0 };
  }

  return { x: 0, y: 0 };
}

function getSwipeDismissDirection(
  direction: "x" | "y" | null,
  amountX: number,
  amountY: number,
  timeTaken: number,
  allowedDirections: SwipeDirection[]
): "left" | "right" | "up" | "down" | undefined {
  if (!direction) {
    return undefined;
  }

  const amount = direction === "x" ? amountX : amountY;
  let allowedDirection: SwipeDirection;

  if (direction === "x") {
    allowedDirection = amountX > 0 ? "right" : "left";
  } else {
    allowedDirection = amountY > 0 ? "bottom" : "top";
  }

  if (!allowedDirections.includes(allowedDirection)) {
    return undefined;
  }

  if (
    Math.abs(amount) < SWIPE_THRESHOLD &&
    Math.abs(amount) / timeTaken <= 0.11
  ) {
    return undefined;
  }

  if (allowedDirection === "left" || allowedDirection === "right") {
    return allowedDirection;
  }

  return allowedDirection === "bottom" ? "down" : "up";
}

function isToastIconType(
  type?: ToastTypes
): type is Extract<keyof ToastIcons, ToastTypes> {
  return (
    type === "success" ||
    type === "info" ||
    type === "warning" ||
    type === "error" ||
    type === "loading"
  );
}

function isToastClassNameType(
  type?: ToastTypes
): type is Extract<keyof ToastClassnames, ToastTypes> {
  return (
    type === "success" ||
    type === "info" ||
    type === "warning" ||
    type === "error" ||
    type === "loading" ||
    type === "default"
  );
}

function isDirection(value: string): value is NonNullable<ToasterProps["dir"]> {
  return value === "ltr" || value === "rtl" || value === "auto";
}

function getNonActionContent(content: Action | JSX.Element): JSX.Element {
  return isAction(content) ? null : content;
}

function ToastActionButton(props: {
  content: Action | JSX.Element;
  kind: "action" | "cancel";
  class: JSX.ClassValue;
  style?: JSX.CSSProperties;
  onClick: (event: MouseEvent) => void;
}) {
  return (
    <Show
      when={isAction(props.content) ? props.content : false}
      fallback={props.content}
    >
      {(action) => (
        <button
          data-button
          data-action={props.kind === "action" ? "" : undefined}
          data-cancel={props.kind === "cancel" ? "" : undefined}
          style={props.style}
          onClick={(event) => {
            props.onClick(event);
          }}
          class={props.class}
        >
          {action().label}
        </button>
      )}
    </Show>
  );
}

function getDocumentDirection(): ToasterProps["dir"] {
  // typeof guards keep this module safe to evaluate during server rendering.
  // oxlint-disable-next-line anti-slop/no-runtime-typeof -- `window` is absent during SSR.
  if (typeof window === "undefined") {
    return "ltr";
  }

  // oxlint-disable-next-line anti-slop/no-runtime-typeof -- `document` is absent during SSR.
  if (typeof document === "undefined") {
    return "ltr";
  }

  const dirAttribute = document.documentElement.getAttribute("dir");

  if (dirAttribute !== null && isDirection(dirAttribute)) {
    return dirAttribute;
  }

  const { direction } = window.getComputedStyle(document.documentElement);

  return isDirection(direction) ? direction : "ltr";
}

function formatOffset(value: string | number) {
  // Offset maps publicly accept numeric pixel values and strings.
  // oxlint-disable-next-line anti-slop/no-runtime-typeof -- Numeric offsets require px units.
  return typeof value === "number" ? `${value}px` : value;
}

function assignOffset(
  defaultOffset?: Offset,
  mobileOffset?: Offset
): JSX.CSSProperties {
  const styles: Record<string, string> = {};

  for (const [index, offset] of [defaultOffset, mobileOffset].entries()) {
    const isMobile = index === 1;
    const prefix = isMobile ? "--mobile-offset" : "--offset";
    const defaultValue = isMobile ? MOBILE_VIEWPORT_OFFSET : VIEWPORT_OFFSET;

    const assignAll = (value: string | number) => {
      for (const key of ["top", "right", "bottom", "left"]) {
        // Offset API accepts numeric pixel values.
        // oxlint-disable-next-line anti-slop/no-runtime-typeof -- Convert numbers to CSS pixels.
        styles[`${prefix}-${key}`] =
          typeof value === "number" ? `${value}px` : value;
      }
    };

    // Offset is a public number/string/edge-map union.
    // oxlint-disable-next-line anti-slop/no-runtime-typeof -- Runtime branch handles scalar offset values.
    if (typeof offset === "number" || typeof offset === "string") {
      assignAll(offset);
      continue;
    }

    // oxlint-disable-next-line anti-slop/no-runtime-typeof -- Runtime branch handles edge-map offsets.
    if (typeof offset === "object" && offset !== null) {
      for (const key of ["top", "right", "bottom", "left"] as const) {
        const value = offset[key];
        styles[`${prefix}-${key}`] =
          value === undefined ? defaultValue : formatOffset(value);
      }

      continue;
    }

    assignAll(defaultValue);
  }

  // SAFETY: keys above are generated `--offset-*` custom properties accepted by Solid CSSProperties.
  return styles;
}

function mergeClassNames(
  classNames?: ToastClassnames,
  legacy?: ToastClassnames
) {
  return classNames ?? legacy;
}

function mergeDescriptionClassName(
  descriptionClassName?: string,
  legacy?: string
) {
  return descriptionClassName ?? legacy ?? "";
}

function mergeClassName(className?: string, legacy?: string) {
  return className ?? legacy ?? "";
}

function useSonner() {
  // Starts empty: subscribing replays whatever is already active.
  const [activeToasts, setActiveToasts] = createSignal<ToastT[]>([]);

  onSettled(() => {
    const unsubscribe = ToastState.subscribe((toastItem) => {
      if ("dismiss" in toastItem) {
        setActiveToasts((toasts) =>
          toasts.filter((t) => t.id !== toastItem.id)
        );

        return;
      }

      setActiveToasts((toasts) => {
        const indexOfExistingToast = toasts.findIndex(
          (t) => t.id === toastItem.id
        );

        if (indexOfExistingToast !== -1) {
          return [
            ...toasts.slice(0, indexOfExistingToast),
            { ...toasts[indexOfExistingToast], ...toastItem },
            ...toasts.slice(indexOfExistingToast + 1),
          ];
        }

        return [toastItem, ...toasts];
      });
    });

    return unsubscribe;
  });

  return {
    toasts: activeToasts,
  };
}

function createToastTheme(theme: ToasterProps["theme"]) {
  if (theme !== "system") {
    return theme;
  }

  // oxlint-disable-next-line anti-slop/no-runtime-typeof -- `window` is absent during SSR.
  return typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/* eslint-disable solid/reactivity */
function ToastBody(props: {
  toast: ToastT;
  closeButton: boolean;
  closeButtonAriaLabel?: string;
  disabled: boolean;
  dismissible: boolean;
  icons?: ToastIcons;
  classNames?: ToastClassnames;
  toastClassNames?: ToastClassnames;
  descriptionClassName: string;
  toastDescriptionClassName: string;
  cancelButtonStyle?: JSX.CSSProperties;
  actionButtonStyle?: JSX.CSSProperties;
  getLoadingIcon: () => JSX.Element;
  getIcon: () => JSX.Element;
  onDelete: () => void;
  onDismiss: () => void;
}) {
  const classNames = () => props.classNames;
  const toastClassNames = () => props.toastClassNames;
  const toastType = () => props.toast.type;
  const hasCustomContent = () => Boolean(props.toast.jsx);

  const hasIcon = () => {
    const type = toastType();
    const typeIcon = isToastIconType(type) ? props.icons?.[type] : undefined;

    return (
      (type !== undefined ||
        Boolean(props.toast.icon) ||
        props.toast.promise !== undefined) &&
      props.toast.icon !== null &&
      (typeIcon !== null || Boolean(props.toast.icon))
    );
  };

  const loadingIconContent = () => {
    if (toastType() === "loading") {
      return props.toast.icon ?? props.getLoadingIcon();
    }

    if (props.toast.promise) {
      return props.getLoadingIcon();
    }

    return null;
  };

  return (
    <>
      <Show
        when={
          props.closeButton && !hasCustomContent() && toastType() !== "loading"
        }
      >
        <button
          aria-label={props.closeButtonAriaLabel ?? "Close toast"}
          data-disabled={String(props.disabled)}
          data-close-button
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
          onPointerUp={(event) => {
            event.stopPropagation();
          }}
          onClick={() => {
            if (props.disabled || !props.dismissible) {
              return;
            }

            props.onDelete();
            props.onDismiss();
          }}
          class={cn(classNames()?.closeButton, toastClassNames()?.closeButton)}
        >
          {props.icons?.close ?? <CloseIcon />}
        </button>
      </Show>

      <Show when={hasIcon()}>
        <div
          data-icon=""
          class={cn(classNames()?.icon, toastClassNames()?.icon)}
        >
          {loadingIconContent()}
          {toastType() === "loading" ? null : props.getIcon()}
        </div>
      </Show>

      <div
        data-content=""
        class={cn(classNames()?.content, toastClassNames()?.content)}
      >
        <div
          data-title=""
          class={cn(classNames()?.title, toastClassNames()?.title)}
        >
          {props.toast.jsx ?? resolveContent(props.toast.title)}
        </div>
        <Show when={props.toast.description}>
          <div
            data-description=""
            class={cn(
              props.descriptionClassName,
              props.toastDescriptionClassName,
              classNames()?.description,
              toastClassNames()?.description
            )}
          >
            {resolveContent(props.toast.description)}
          </div>
        </Show>
      </div>

      <Show when={props.toast.cancel}>
        {(cancel) => (
          <Show
            when={!isAction(cancel())}
            fallback={
              <ToastActionButton
                content={cancel()}
                kind="cancel"
                style={props.toast.cancelButtonStyle ?? props.cancelButtonStyle}
                class={cn(
                  classNames()?.cancelButton,
                  toastClassNames()?.cancelButton
                )}
                onClick={(event) => {
                  if (!props.dismissible) {
                    return;
                  }

                  const currentCancel = cancel();

                  if (!isAction(currentCancel)) {
                    return;
                  }

                  currentCancel.onClick?.(event);
                  props.onDelete();
                }}
              />
            }
          >
            {getNonActionContent(cancel())}
          </Show>
        )}
      </Show>

      <Show when={props.toast.action}>
        {(action) => (
          <Show
            when={!isAction(action())}
            fallback={
              <ToastActionButton
                content={action()}
                kind="action"
                style={props.toast.actionButtonStyle ?? props.actionButtonStyle}
                class={cn(
                  classNames()?.actionButton,
                  toastClassNames()?.actionButton
                )}
                onClick={(event) => {
                  const currentAction = action();

                  if (!isAction(currentAction)) {
                    return;
                  }

                  currentAction.onClick?.(event);

                  if (event.defaultPrevented) {
                    return;
                  }

                  props.onDelete();
                }}
              />
            }
          >
            {getNonActionContent(action())}
          </Show>
        )}
      </Show>
    </>
  );
}

function setupToastEffects({
  props,
  mounted,
  getToastElement,
  isRemoving,
  isDocumentHidden,
  duration,
  removed,
  deleteToast,
  setInitialHeight,
}: {
  props: ToastProps;
  mounted: () => boolean;
  getToastElement: () => HTMLLIElement | undefined;
  isRemoving: () => boolean;
  isDocumentHidden: () => boolean;
  duration: () => number;
  removed: () => boolean;
  deleteToast: () => void;
  setInitialHeight: Setter<number>;
}) {
  let remainingTime = TOAST_LIFETIME;

  createRenderEffect(
    () => ({
      mounted: mounted(),
      position: props.toast.position,
      toastId: props.toast.id,
      toasterId: props.toast.toasterId,
    }),
    (metadata): (() => void) | undefined => {
      const toastElement = getToastElement();

      if (!metadata.mounted || !toastElement) {
        return undefined;
      }

      const measure = () => {
        const currentElement = getToastElement();

        if (!currentElement || isRemoving()) {
          return;
        }

        const originalHeight = currentElement.style.height;
        currentElement.style.height = "auto";
        const { height } = currentElement.getBoundingClientRect();
        currentElement.style.height = originalHeight;
        setInitialHeight(height);
        props.setHeights((heights) => {
          const entry = {
            height,
            position: metadata.position,
            toastId: metadata.toastId,
            toasterId: metadata.toasterId,
          };

          return heights.some((item) => item.toastId === entry.toastId)
            ? heights.map((item) =>
                item.toastId === entry.toastId ? entry : item
              )
            : [entry, ...heights];
        });
      };

      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(toastElement);

      return () => {
        observer.disconnect();
      };
    }
  );

  createEffect(
    () =>
      [
        props.expanded,
        props.interacting,
        props.toast.type,
        isDocumentHidden(),
        duration(),
        props.pauseWhenPageIsHidden ?? true,
        props.toast.title,
        removed(),
      ] as const,
    (
      [
        expanded,
        interacting,
        type,
        hidden,
        lifetime,
        pauseWhenHidden,
        title,
        isRemoved,
      ],
      previous
    ): (() => void) | undefined => {
      if (
        isRemoved ||
        type === "loading" ||
        lifetime === Number.POSITIVE_INFINITY
      ) {
        return undefined;
      }

      if (
        !previous ||
        previous[2] !== type ||
        previous[4] !== lifetime ||
        previous[6] !== title
      ) {
        remainingTime = lifetime;
      }

      if (expanded || interacting || (pauseWhenHidden && hidden)) {
        return undefined;
      }

      const startedAt = Date.now();

      const timer = setTimeout(
        () => {
          props.toast.onAutoClose?.(props.toast);
          deleteToast();
        },
        Math.max(0, remainingTime)
      );

      return () => {
        clearTimeout(timer);
        remainingTime -= Date.now() - startedAt;
      };
    }
  );

  createEffect(
    () => props.toast.delete,
    (shouldDelete) => {
      if (shouldDelete !== true) {
        return;
      }

      untrack(() => {
        deleteToast();
        props.toast.onDismiss?.(props.toast);
      });
    }
  );
}

function Toast(props: ToastProps) {
  const [mounted, setMounted] = createSignal(false);
  const [removed, setRemoved] = createSignal(false);
  const [swiping, setSwiping] = createSignal(false);
  const [swipeOut, setSwipeOut] = createSignal(false);
  const [isSwiped, setIsSwiped] = createSignal(false);
  let swipeDirection: "x" | "y" | null = null;

  const [swipeOutDirection, setSwipeOutDirection] = createSignal<
    "left" | "right" | "up" | "down" | null
  >(null);

  const [offsetBeforeRemove, setOffsetBeforeRemove] = createSignal(0);
  const [initialHeight, setInitialHeight] = createSignal(0);
  let toastRef: HTMLLIElement | undefined;
  let dragStartTime = 0;
  let pointerStart: { x: number; y: number } | null = null;
  let removalTimer: ReturnType<typeof setTimeout> | undefined;

  onCleanup(() => {
    clearTimeout(removalTimer);
  });

  const isFront = () => props.index === 0;
  const isVisible = () => props.index + 1 <= props.visibleToasts;
  const toastType = () => props.toast.type;
  const dismissible = () => props.toast.dismissible !== false;
  const classNames = () => mergeClassNames(props.classNames, props.classes);
  const className = () => mergeClassName(props.className, props.class);

  const descriptionClassName = () =>
    mergeDescriptionClassName(
      props.descriptionClassName,
      props.descriptionClass
    );

  const toastClassName = () =>
    mergeClassName(props.toast.className, props.toast.class);

  const toastDescriptionClassName = () =>
    mergeDescriptionClassName(
      props.toast.descriptionClassName,
      props.toast.descriptionClass
    );

  const toastClassNames = () =>
    mergeClassNames(props.toast.classNames, props.toast.classes);

  const closeButton = () => props.toast.closeButton ?? props.closeButton;

  const duration = () =>
    props.toast.duration ?? props.duration ?? TOAST_LIFETIME;

  const invert = () => props.toast.invert ?? props.invert;
  const disabled = () => toastType() === "loading";

  // Toasts created with `toast()` have no type, `classNames.default` is the key for those.
  const toastTypeKey = () => {
    const type = toastType();

    return isToastClassNameType(type) ? type : "default";
  };

  const swipeDirections = () =>
    props.swipeDirections ?? getDefaultSwipeDirections(props.position);

  const y = createMemo(() => props.position.split("-")[0]);
  const x = createMemo(() => props.position.split("-")[1]);

  const heightIndex = createMemo(() =>
    Math.max(
      0,
      props.heights.findIndex((height) => height.toastId === props.toast.id)
    )
  );

  const toastsHeightBefore = createMemo(() => {
    let total = 0;

    for (const [index, height] of props.heights.entries()) {
      if (index >= heightIndex()) {
        break;
      }

      total += height.height;
    }

    return total;
  });

  const offset = createMemo(
    () => heightIndex() * (props.gap ?? GAP) + toastsHeightBefore()
  );

  const isDocumentHidden = createIsDocumentHidden();

  function deleteToast() {
    if (removalTimer !== undefined) {
      return;
    }

    setRemoved(true);
    setOffsetBeforeRemove(offset());
    props.setHeights((heights) =>
      heights.filter((height) => height.toastId !== props.toast.id)
    );

    removalTimer = setTimeout(() => {
      props.removeToast(props.toast);
    }, TIME_BEFORE_UNMOUNT);
  }

  function getLoadingIcon() {
    if (
      props.icons?.loading !== undefined &&
      props.icons.loading !== null &&
      props.icons.loading !== false
    ) {
      return (
        <div
          class={cn(
            classNames()?.loader,
            toastClassNames()?.loader,
            "sonner-loader"
          )}
          data-visible={String(toastType() === "loading")}
        >
          {props.icons.loading}
        </div>
      );
    }

    return (
      <Loader
        class={cn(classNames()?.loader, toastClassNames()?.loader)}
        visible={toastType() === "loading"}
      />
    );
  }

  const icon = () => {
    const type = toastType();

    return (
      props.toast.icon ??
      (isToastIconType(type) ? props.icons?.[type] : undefined) ??
      getAsset(type)
    );
  };

  onSettled(() => {
    setMounted(true);
  });

  setupToastEffects({
    deleteToast,
    duration,
    getToastElement: () => toastRef,
    isDocumentHidden,
    isRemoving: () => removalTimer !== undefined,
    mounted,
    props,
    removed,
    setInitialHeight,
  });

  function handleDragEnd() {
    setSwiping(false);
    swipeDirection = null;
    pointerStart = null;
  }

  function handlePointerDown(
    event: PointerEvent & { currentTarget: HTMLLIElement }
  ) {
    if (event.button === 2 || disabled() || !dismissible()) {
      return;
    }

    if (event.target instanceof Element && event.target.closest("button")) {
      return;
    }

    dragStartTime = Date.now();
    setOffsetBeforeRemove(offset());
    event.currentTarget.setPointerCapture(event.pointerId);
    setSwiping(true);
    pointerStart = { x: event.clientX, y: event.clientY };
  }

  function handlePointerUp() {
    if (swipeOut() || !dismissible()) {
      return;
    }

    pointerStart = null;

    const amountX = Number(
      toastRef?.style.getPropertyValue("--swipe-amount-x").replace("px", "") ??
        0
    );

    const amountY = Number(
      toastRef?.style.getPropertyValue("--swipe-amount-y").replace("px", "") ??
        0
    );

    const timeTaken = Math.max(1, Date.now() - dragStartTime);

    const direction = getSwipeDismissDirection(
      swipeDirection,
      amountX,
      amountY,
      timeTaken,
      swipeDirections()
    );

    if (direction) {
      setOffsetBeforeRemove(offset());
      props.toast.onDismiss?.(props.toast);
      setSwipeOutDirection(direction);
      deleteToast();
      setSwipeOut(true);

      return;
    }

    toastRef?.style.setProperty("--swipe-amount-x", "0px");
    toastRef?.style.setProperty("--swipe-amount-y", "0px");
    setIsSwiped(false);
    setSwiping(false);
    swipeDirection = null;
  }

  function handlePointerMove(event: PointerEvent) {
    const start = pointerStart;

    if (
      !start ||
      !dismissible() ||
      Boolean(window.getSelection()?.toString())
    ) {
      return;
    }

    const xDelta = event.clientX - start.x;
    const yDelta = event.clientY - start.y;

    if (!swipeDirection && (Math.abs(xDelta) > 1 || Math.abs(yDelta) > 1)) {
      swipeDirection = Math.abs(xDelta) > Math.abs(yDelta) ? "x" : "y";
    }

    const amount = getSwipeAmount(
      swipeDirection,
      xDelta,
      yDelta,
      swipeDirections()
    );

    if (amount.x !== 0 || amount.y !== 0) {
      setIsSwiped(true);
    }

    toastRef?.style.setProperty("--swipe-amount-x", `${amount.x}px`);
    toastRef?.style.setProperty("--swipe-amount-y", `${amount.y}px`);
  }

  return (
    <li
      tabindex={0}
      ref={(element) => {
        toastRef = element;
      }}
      class={cn(
        className(),
        toastClassName(),
        classNames()?.toast,
        toastClassNames()?.toast,
        classNames()?.[toastTypeKey()],
        toastClassNames()?.[toastTypeKey()]
      )}
      data-sonner-toast=""
      data-rich-colors={String(
        Boolean(props.toast.richColors ?? props.defaultRichColors)
      )}
      data-styled={String(
        (props.toast.jsx === undefined ||
          props.toast.jsx === null ||
          props.toast.jsx === false ||
          props.toast.jsx === 0 ||
          props.toast.jsx === "") &&
          props.toast.unstyled !== true &&
          props.unstyled !== true
      )}
      data-mounted={String(mounted())}
      data-promise={String(Boolean(props.toast.promise))}
      data-swiped={String(isSwiped())}
      data-removed={String(removed())}
      data-visible={String(isVisible())}
      data-y-position={y()}
      data-x-position={x()}
      data-index={props.index}
      data-front={String(isFront())}
      data-swiping={String(swiping())}
      data-dismissible={String(dismissible())}
      data-type={toastType()}
      data-invert={String(invert())}
      data-swipe-out={String(swipeOut())}
      data-swipe-direction={swipeOutDirection()}
      data-expanded={String(
        props.expanded || (props.expandByDefault && mounted())
      )}
      data-testid={props.toast.testId}
      style={{
        "--index": props.index,
        "--initial-height": props.expandByDefault
          ? "auto"
          : `${initialHeight()}px`,
        "--offset": `${removed() ? offsetBeforeRemove() : offset()}px`,
        "--toasts-before": props.index,
        "--z-index": props.toasts.length - props.index,
        ...props.style,
        ...props.toast.style,
      }}
      onDragEnd={handleDragEnd}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
    >
      <ToastBody
        actionButtonStyle={props.actionButtonStyle}
        cancelButtonStyle={props.cancelButtonStyle}
        classNames={classNames()}
        closeButton={closeButton()}
        closeButtonAriaLabel={props.closeButtonAriaLabel}
        descriptionClassName={descriptionClassName()}
        disabled={disabled()}
        dismissible={dismissible()}
        getIcon={icon}
        getLoadingIcon={getLoadingIcon}
        icons={props.icons}
        onDelete={deleteToast}
        onDismiss={() => props.toast.onDismiss?.(props.toast)}
        toast={props.toast}
        toastClassNames={toastClassNames()}
        toastDescriptionClassName={toastDescriptionClassName()}
      />
    </li>
  );
}

/* eslint-enable solid/reactivity */

function Toaster(props: ToasterProps) {
  /* eslint-disable solid/reactivity */
  const propsWithDefaults = merge(
    {
      containerAriaLabel: "Notifications",
      dir: getDocumentDirection(),
      gap: GAP,
      hotkey: ["altKey", "KeyT"],
      position: "bottom-right" as const,
      theme: "light" as const,
      visibleToasts: VISIBLE_TOASTS_AMOUNT,
    },
    props
  );

  const initialTheme = untrack(() => createToastTheme(propsWithDefaults.theme));

  const [toastsStore, setToastsStore] = createStore<{ toasts: ToastT[] }>({
    toasts: [],
  });

  const filteredToasts = createMemo(() => {
    const { toasts } = toastsStore;

    if (propsWithDefaults.id !== undefined && propsWithDefaults.id !== "") {
      return toasts.filter((toast) => toast.toasterId === propsWithDefaults.id);
    }

    return toasts.filter(
      (toast) => toast.toasterId === undefined || toast.toasterId === ""
    );
  });

  const possiblePositions = createMemo<Position[]>(() => [
    ...new Set([
      propsWithDefaults.position,
      ...filteredToasts()
        .filter(
          (toast): toast is ToastT & { position: Position } =>
            toast.position !== undefined
        )
        .map((toast) => toast.position),
    ]),
  ]);

  const [heights, setHeights] = createSignal<HeightT[]>([]);
  const [expanded, setExpanded] = createSignal(false);
  const [interacting, setInteracting] = createSignal(false);
  const [actualTheme, setActualTheme] = createSignal(initialTheme);

  const [lastFocusedElementRef, setLastFocusedElementRef] =
    createSignal<HTMLElement | null>(null);

  const [isFocusWithinRef, setIsFocusWithinRef] = createSignal(false);
  let listRef: HTMLOListElement | undefined;

  const hotkeyLabel = () =>
    propsWithDefaults.hotkey
      .join("+")
      .replaceAll("Key", "")
      .replaceAll("Digit", "");

  const className = () =>
    mergeClassName(propsWithDefaults.className, propsWithDefaults.class);

  const toastOptions = () => propsWithDefaults.toastOptions;

  const toastClassNames = () =>
    mergeClassNames(toastOptions()?.classNames, toastOptions()?.classes);

  const toastDescriptionClassName = () =>
    mergeDescriptionClassName(
      toastOptions()?.descriptionClassName,
      toastOptions()?.descriptionClass
    );

  const toastClassName = () =>
    mergeClassName(toastOptions()?.className, toastOptions()?.class);

  const removeToast = (toastToRemove: ToastT) => {
    if (
      !untrack(
        () =>
          toastsStore.toasts.find((toast) => toast.id === toastToRemove.id)
            ?.delete === true
      )
    ) {
      ToastState.dismiss(toastToRemove.id);
    }

    setToastsStore((draft) => {
      draft.toasts = draft.toasts.filter(({ id }) => id !== toastToRemove.id);
    });
  };

  onSettled(() =>
    ToastState.subscribe((toastItem) => {
      setToastsStore((draft) => {
        if ("dismiss" in toastItem) {
          const existing = draft.toasts.find(
            (toast) => toast.id === toastItem.id
          );

          if (existing) {
            existing.delete = true;
          }

          return;
        }

        const index = draft.toasts.findIndex(
          (toast) => toast.id === toastItem.id
        );

        const existing = draft.toasts[index];

        if (existing === undefined) {
          draft.toasts.unshift(toastItem);
        } else if (existing.delete === true) {
          draft.toasts[index] = toastItem;
        } else {
          Object.assign(existing, toastItem);
        }
      });
    })
  );

  createEffect(
    () => propsWithDefaults.theme,
    (theme): (() => void) | undefined => {
      if (theme !== "system") {
        setActualTheme(theme);

        return undefined;
      }

      // oxlint-disable-next-line anti-slop/no-runtime-typeof -- `window` is absent during SSR.
      if (typeof window === "undefined") {
        return undefined;
      }

      const query = window.matchMedia("(prefers-color-scheme: dark)");

      const updateTheme = () => {
        setActualTheme(query.matches ? "dark" : "light");
      };

      updateTheme();
      query.addEventListener("change", updateTheme);

      return () => {
        query.removeEventListener("change", updateTheme);
      };
    }
  );

  createEffect(
    () => filteredToasts().length,
    (length) => {
      if (length <= 1) {
        setExpanded(false);
      }
    }
  );

  function handleKeyDown(event: KeyboardEvent) {
    const modifierKeys = new Map([
      ["altKey", event.altKey],
      ["ctrlKey", event.ctrlKey],
      ["metaKey", event.metaKey],
      ["shiftKey", event.shiftKey],
    ]);

    const isHotkeyPressed =
      propsWithDefaults.hotkey.length > 0 &&
      propsWithDefaults.hotkey.every(
        (key) => modifierKeys.get(key) === true || event.code === key
      );

    if (isHotkeyPressed) {
      setExpanded(true);
      listRef?.focus();
    }

    if (
      event.code === "Escape" &&
      (document.activeElement === listRef ||
        listRef?.contains(document.activeElement) === true)
    ) {
      setExpanded(false);
    }
  }

  onSettled(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  });

  onCleanup(() => {
    if (lastFocusedElementRef()) {
      lastFocusedElementRef()?.focus({ preventScroll: true });
    }
  });

  return (
    <section
      aria-label={
        propsWithDefaults.customAriaLabel ??
        `${propsWithDefaults.containerAriaLabel} ${hotkeyLabel()}`
      }
      tabindex={-1}
      aria-live="polite"
      aria-relevant="additions text"
      aria-atomic="false"
      data-react-aria-top-layer
    >
      <For each={possiblePositions()}>
        {(position, index) => {
          const [y, x] = position.split("-");

          const toastsByPosition = createMemo(() =>
            filteredToasts().filter(
              (toast) =>
                (!toast.position && index() === 0) ||
                toast.position === position
            )
          );

          const heightsByPosition = createMemo(() =>
            heights().filter(
              (height) =>
                (index() === 0 && !height.position) ||
                height.position === position
            )
          );

          return (
            <Show when={filteredToasts().length > 0}>
              <ol
                tabindex={-1}
                ref={(element) => {
                  listRef = element;
                }}
                dir={
                  propsWithDefaults.dir === "auto"
                    ? getDocumentDirection()
                    : propsWithDefaults.dir
                }
                class={className()}
                data-sonner-toaster
                data-sonner-theme={actualTheme()}
                data-y-position={y}
                data-x-position={x}
                style={{
                  "--front-toast-height": `${heightsByPosition()[0]?.height ?? 0}px`,
                  "--gap": `${propsWithDefaults.gap}px`,
                  "--width": `${TOAST_WIDTH}px`,
                  ...propsWithDefaults.style,
                  ...assignOffset(
                    propsWithDefaults.offset,
                    propsWithDefaults.mobileOffset
                  ),
                }}
                onBlur={(event) => {
                  if (
                    isFocusWithinRef() &&
                    (!(event.relatedTarget instanceof Node) ||
                      !event.currentTarget.contains(event.relatedTarget))
                  ) {
                    setIsFocusWithinRef(false);

                    if (lastFocusedElementRef()) {
                      lastFocusedElementRef()?.focus({ preventScroll: true });
                      setLastFocusedElementRef(null);
                    }
                  }
                }}
                onFocus={(event) => {
                  const isNotDismissible =
                    event.target instanceof HTMLElement &&
                    event.target.dataset.dismissible === "false";

                  if (isNotDismissible) {
                    return;
                  }

                  if (!isFocusWithinRef()) {
                    setIsFocusWithinRef(true);
                    setLastFocusedElementRef(
                      event.relatedTarget instanceof HTMLElement
                        ? event.relatedTarget
                        : null
                    );
                  }
                }}
                onMouseEnter={() => {
                  setExpanded(true);
                }}
                onMouseMove={() => {
                  setExpanded(true);
                }}
                onMouseLeave={() => {
                  if (!interacting()) {
                    setExpanded(false);
                  }
                }}
                onDragEnd={() => {
                  setExpanded(false);
                }}
                onPointerDown={(event) => {
                  const isNotDismissible =
                    event.target instanceof HTMLElement &&
                    event.target.dataset.dismissible === "false";

                  if (isNotDismissible) {
                    return;
                  }

                  setInteracting(true);
                }}
                onPointerUp={() => {
                  setInteracting(false);
                }}
              >
                <For each={toastsByPosition()}>
                  {(toastItem, toastIndex) => (
                    <Toast
                      icons={propsWithDefaults.icons}
                      index={toastIndex()}
                      toast={toastItem}
                      defaultRichColors={propsWithDefaults.richColors}
                      duration={
                        toastOptions()?.duration ?? propsWithDefaults.duration
                      }
                      class={toastClassName()}
                      descriptionClassName={toastDescriptionClassName()}
                      invert={Boolean(propsWithDefaults.invert)}
                      visibleToasts={propsWithDefaults.visibleToasts}
                      closeButton={
                        toastOptions()?.closeButton ??
                        propsWithDefaults.closeButton ??
                        false
                      }
                      interacting={interacting()}
                      position={position}
                      style={toastOptions()?.style}
                      unstyled={toastOptions()?.unstyled}
                      classNames={toastClassNames()}
                      cancelButtonStyle={toastOptions()?.cancelButtonStyle}
                      actionButtonStyle={toastOptions()?.actionButtonStyle}
                      closeButtonAriaLabel={
                        toastOptions()?.closeButtonAriaLabel
                      }
                      removeToast={removeToast}
                      toasts={toastsByPosition()}
                      heights={heightsByPosition()}
                      setHeights={setHeights}
                      expandByDefault={Boolean(propsWithDefaults.expand)}
                      gap={propsWithDefaults.gap}
                      expanded={expanded()}
                      swipeDirections={propsWithDefaults.swipeDirections}
                      pauseWhenPageIsHidden={
                        propsWithDefaults.pauseWhenPageIsHidden
                      }
                    />
                  )}
                </For>
              </ol>
            </Show>
          );
        }}
      </For>
    </section>
  );
}

export { Toaster, useSonner };

export type * from "./types";
