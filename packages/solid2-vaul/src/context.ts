/*
 * Derived from Vaul (https://github.com/emilkowalski/vaul): src/context.ts.
 * Copyright (c) 2023 Emil Kowalski
 * Modified for Solid Aria: native Solid 2 contexts, reactive getters, and callback refs.
 * MIT licensed. See LICENSE, VAUL-LICENSE, and NOTICE.txt in the package root.
 */

import { createContext } from "solid-js";

import type { DialogProps, DrawerDirection, SnapPoint } from "./types";

export interface DrawerContextValue {
  readonly props: DialogProps;
  readonly isOpen: boolean;
  readonly present: boolean;
  readonly shouldAnimate: boolean;
  readonly direction: DrawerDirection;
  readonly modal: boolean;
  readonly dismissible: boolean;
  readonly contentId: string;
  readonly titleId: string;
  readonly descriptionId: string;
  readonly content: HTMLDivElement | null;
  readonly overlay: HTMLDivElement | null;
  readonly trigger: HTMLButtonElement | null;
  readonly activeSnapPoint: SnapPoint | null;
  readonly activeSnapPointIndex: number;
  readonly snapPointsOffset: readonly number[];
  readonly shouldFade: boolean;
  readonly isDragging: boolean;
  readonly dragProgress: number;
  readonly childOpen: boolean;
  setContent: (element: HTMLDivElement | null) => void;
  setOverlay: (element: HTMLDivElement | null) => void;
  setTrigger: (element: HTMLButtonElement | null) => void;
  setActiveSnapPoint: (point: SnapPoint | null) => void;
  setOpen: (open: boolean) => void;
  close: () => void;
  press: (event: PointerEvent, fromHandle?: boolean) => void;
  drag: (event: PointerEvent) => void;
  release: (event: PointerEvent) => void;
  cancelDrag: () => void;
  setChildOpen: (open: boolean) => void;
  setChildProgress: (progress: number) => void;
}

export const DrawerContext = createContext<DrawerContextValue>();
export const PortalContext = createContext(false);
