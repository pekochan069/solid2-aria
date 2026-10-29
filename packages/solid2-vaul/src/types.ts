/*
 * Derived from Vaul (https://github.com/emilkowalski/vaul): src/types.ts and src/index.tsx.
 * Copyright (c) 2023 Emil Kowalski
 * Modified for Solid Aria: native Solid 2 props, DOM events, render callbacks, and readonly snap points.
 * MIT licensed. See LICENSE, VAUL-LICENSE, and NOTICE.txt in the package root.
 */

import type { JSX } from "@solidjs/web";

export type DrawerDirection = "top" | "bottom" | "left" | "right";

export type SnapPoint = number | string;

export interface WithFadeFromProps {
  /** Visible viewport fractions (0–1) or pixel lengths, ordered smallest first. */
  snapPoints: readonly SnapPoint[];
  fadeFromIndex: number;
}

export interface WithoutFadeFromProps {
  snapPoints?: readonly SnapPoint[];
  fadeFromIndex?: never;
}

export type DialogProps = {
  children?: JSX.Element;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  onAnimationEnd?: (open: boolean) => void;
  activeSnapPoint?: SnapPoint | null;
  setActiveSnapPoint?: (point: SnapPoint | null) => void;
  closeThreshold?: number;
  scrollLockTimeout?: number;
  dismissible?: boolean;
  modal?: boolean;
  nested?: boolean;
  direction?: DrawerDirection;
  handleOnly?: boolean;
  shouldScaleBackground?: boolean;
  setBackgroundColorOnScale?: boolean;
  noBodyStyles?: boolean;
  fixed?: boolean;
  /** Enables the additional mobile input scroll prevention. */
  disablePreventScroll?: boolean;
  repositionInputs?: boolean;
  snapToSequentialPoint?: boolean;
  container?: HTMLElement | null;
  preventScrollRestoration?: boolean;
  autoFocus?: boolean;
  onDrag?: (event: PointerEvent, percentageDragged: number) => void;
  onRelease?: (event: PointerEvent, open: boolean) => void;
} & (WithFadeFromProps | WithoutFadeFromProps);

export type DrawerProps = DialogProps;

export type PointerDownOutsideEvent = CustomEvent<{
  originalEvent: PointerEvent;
}>;

export type FocusOutsideEvent = CustomEvent<{ originalEvent: FocusEvent }>;

export type InteractOutsideEvent = PointerDownOutsideEvent | FocusOutsideEvent;

export type ContentProps = JSX.HTMLAttributes<HTMLDivElement> & {
  forceMount?: boolean;
  onOpenAutoFocus?: (event: Event) => void;
  onCloseAutoFocus?: (event: Event) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void;
  onFocusOutside?: (event: FocusOutsideEvent) => void;
  onInteractOutside?: (event: InteractOutsideEvent) => void;
};

export type OverlayProps = JSX.HTMLAttributes<HTMLDivElement> & {
  forceMount?: boolean;
};

export type HandleProps = JSX.HTMLAttributes<HTMLDivElement> & {
  preventCycle?: boolean;
};

export type TriggerProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Compose a custom button by spreading these reactive props onto it. */
  render?: (props: JSX.ButtonHTMLAttributes<HTMLButtonElement>) => JSX.Element;
};

export type CloseProps = TriggerProps;

export type TitleProps = JSX.HTMLAttributes<HTMLHeadingElement>;

export type DescriptionProps = JSX.HTMLAttributes<HTMLParagraphElement>;

export interface PortalProps {
  children?: JSX.Element;
  container?: HTMLElement | null;
  forceMount?: boolean;
}
