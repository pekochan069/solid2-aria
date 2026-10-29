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
 * Derived from Adobe React Spectrum: packages/@react-types/dialog/src/index.d.ts.
 * Modified for Solid Aria: adapted type declarations, imports, and formatting for Solid.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { DOMProps, AriaLabelingProps } from "@solid2-aria/types-shared";
import type { StyleProps } from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";
import type { Accessor } from "solid-js";

export interface AriaDialogProps extends DOMProps, AriaLabelingProps {
  /**
   * The accessibility role for the dialog.
   *
   * @default 'dialog'
   */
  role?: "dialog" | "alertdialog";
  /**
   * Whether the dialog is currently performing an entry animation. Focus is not moved into the
   * dialog until the animation completes, since moving the screen reader cursor may cause scrolling
   * that interrupts the animation.
   */
  isEntering?: boolean;
}

export type SpectrumDialogClose = (close: () => void) => JSX.Element;

export interface SpectrumDialogTriggerProps
  extends OverlayTriggerProps, PositionProps {
  /**
   * The Dialog and its trigger element. See the DialogTrigger [Content section](#content) for more
   * information on what to provide as children.
   */
  children: [JSX.Element, SpectrumDialogClose | JSX.Element];
  /**
   * The type of Dialog that should be rendered. See the DialogTrigger [types
   * section](#dialog-types) for an explanation on each.
   *
   * @default 'modal'
   */
  type?: "modal" | "popover" | "tray" | "fullscreen" | "fullscreenTakeover";
  /**
   * The type of Dialog that should be rendered when on a mobile device. See DialogTrigger [types
   * section](#dialog-types) for an explanation on each.
   */
  mobileType?: "modal" | "tray" | "fullscreen" | "fullscreenTakeover";
  /**
   * Whether a popover type Dialog's arrow should be hidden.
   */
  hideArrow?: boolean;
  /**
   * The ref of the element the Dialog should visually attach itself to. Defaults to the trigger
   * button if not defined.
   */
  targetRef?: Accessor<HTMLElement | null>;
  /** Whether a modal type Dialog should be dismissable. */
  isDismissable?: boolean;
  /** Whether pressing the escape key to close the dialog should be disabled. */
  isKeyboardDismissDisabled?: boolean;
}

interface OverlayTriggerProps {
  /** Whether the overlay is open by default (controlled). */
  isOpen?: boolean;
  /** Whether the overlay is open by default (uncontrolled). */
  defaultOpen?: boolean;
  /** Handler that is called when the overlay's open state changes. */
  onOpenChange?: (isOpen: boolean) => void;
}

interface PositionProps {
  /**
   * The placement of the element with respect to its anchor element.
   *
   * @default 'bottom'
   */
  placement?: Placement;
  /**
   * The placement padding that should be applied between the element and its
   * surrounding container.
   *
   * @default 12
   */
  containerPadding?: number;
  /**
   * The additional offset applied along the main axis between the element and its
   * anchor element.
   *
   * @default 0
   */
  offset?: number;
  /**
   * The additional offset applied along the cross axis between the element and its
   * anchor element.
   *
   * @default 0
   */
  crossOffset?: number;
  /**
   * Whether the element should flip its orientation (e.g. top to bottom or left to right) when
   * there is insufficient room for it to render completely.
   *
   * @default true
   */
  shouldFlip?: boolean;
  // /**
  //  * The element that should be used as the bounding container when calculating container offset
  //  * or whether it should flip.
  //  */
  // boundaryElement?: Element,
  /** Whether the element is rendered. */
  isOpen?: boolean;
}

type Placement =
  | "bottom"
  | "bottom left"
  | "bottom right"
  | "bottom start"
  | "bottom end"
  | "top"
  | "top left"
  | "top right"
  | "top start"
  | "top end"
  | "left"
  | "left top"
  | "left bottom"
  | "start"
  | "start top"
  | "start bottom"
  | "right"
  | "right top"
  | "right bottom"
  | "end"
  | "end top"
  | "end bottom";

export interface SpectrumDialogContainerProps {
  /** The Dialog to display, if any. */
  children: JSX.Element;
  /** Handler that is called when the 'x' button of a dismissable Dialog is clicked. */
  onDismiss: () => void;
  /**
   * The type of Dialog that should be rendered. See the visual options below for examples of each.
   *
   * @default 'modal'
   */
  type?: "modal" | "fullscreen" | "fullscreenTakeover";
  /**
   * Whether the Dialog is dismissable. See the [Dialog docs](Dialog.html#dismissable-dialogs) for
   * more details.
   */
  isDismissable?: boolean;
  /** Whether pressing the escape key to close the dialog should be disabled. */
  isKeyboardDismissDisabled?: boolean;
}

export interface SpectrumDialogProps extends AriaDialogProps, StyleProps {
  /** The contents of the Dialog. */
  children: JSX.Element;
  /** The size of the Dialog. Only applies to "modal" type Dialogs. */
  size?: "S" | "M" | "L";
  /** Whether the Dialog is dismissable. See the [examples](#examples) for more details. */
  isDismissable?: boolean;
  /** Handler that is called when the 'x' button of a dismissable Dialog is clicked. */
  onDismiss?: () => void;
}

export interface SpectrumAlertDialogProps
  extends AriaLabelingProps, DOMProps, StyleProps {
  /** The [visual style](https://spectrum.adobe.com/page/alert-dialog/#Options) of the AlertDialog. */
  variant?:
    | "confirmation"
    | "information"
    | "destructive"
    | "error"
    | "warning";
  /** The title of the AlertDialog. */
  title: string;
  /** The contents of the AlertDialog. */
  children: JSX.Element;
  /** The label to display within the cancel button. */
  cancelLabel?: string;
  /** The label to display within the confirm button. */
  primaryActionLabel: string;
  /** The label to display within the secondary button. */
  secondaryActionLabel?: string;
  /** Whether the primary button is disabled. */
  isPrimaryActionDisabled?: boolean;
  /** Whether the secondary button is disabled. */
  isSecondaryActionDisabled?: boolean;
  /** Handler that is called when the cancel button is pressed. */
  onCancel?: () => void;
  /** Handler that is called when the primary button is pressed. */
  onPrimaryAction?: () => void;
  /** Handler that is called when the secondary button is pressed. */
  onSecondaryAction?: () => void;
  /** Button to focus by default when the dialog opens. */
  autoFocusButton?: "cancel" | "primary" | "secondary";
  // triggers primary action
  // allowsKeyboardConfirmation?: boolean,
}
