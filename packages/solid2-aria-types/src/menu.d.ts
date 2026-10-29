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
 * Derived from Adobe React Spectrum: packages/@react-types/menu/src/index.d.ts.
 * Modified for Solid Aria: adapted type declarations, imports, and formatting for Solid.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  CollectionBase,
  MultipleSelection,
  FocusStrategy,
  Key,
  DOMProps,
  AriaLabelingProps,
  Alignment,
} from "@solid2-aria/types-shared";
import type { StyleProps } from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";

export type MenuTriggerType = "press" | "longPress" | "contextMenu";

export interface MenuTriggerProps extends OverlayTriggerProps {
  /**
   * How the menu is triggered.
   *
   * @default 'press'
   */
  trigger?: MenuTriggerType;
}

interface OverlayTriggerProps {
  /** Whether the overlay is open by default (controlled). */
  isOpen?: boolean;
  /** Whether the overlay is open by default (uncontrolled). */
  defaultOpen?: boolean;
  /** Handler that is called when the overlay's open state changes. */
  onOpenChange?: (isOpen: boolean) => void;
}

export interface MenuProps<T> extends CollectionBase<T>, MultipleSelection {
  /** Where the focus should be set. */
  autoFocus?: boolean | FocusStrategy;
  /** Whether keyboard navigation is circular. */
  shouldFocusWrap?: boolean;
  /** Handler that is called when an item is selected. */
  onAction?: (key: Key, value: T) => void;
  /** Handler that is called when the menu should close after selecting an item. */
  onClose?: () => void;
}

export interface AriaMenuProps<T>
  extends MenuProps<T>, DOMProps, AriaLabelingProps {
  /**
   * Whether pressing the escape key should clear selection in the menu or not.
   *
   * Most experiences should not modify this option as it eliminates a keyboard user's ability to
   * easily clear selection. Only use if the escape key is being handled externally or should not
   * trigger selection clearing contextually.
   *
   * @default 'clearSelection'
   */
  escapeKeyBehavior?: "clearSelection" | "none";
}

export interface SpectrumMenuTriggerProps extends MenuTriggerProps {
  /**
   * The contents of the MenuTrigger - a trigger and a Menu.
   */
  children: JSX.Element[];
  /**
   * Alignment of the menu relative to the trigger.
   *
   * @default 'start'
   */
  align?: Alignment;
  /**
   * Where the Menu opens relative to its trigger.
   *
   * @default 'bottom'
   */
  direction?: "bottom" | "top" | "left" | "right" | "start" | "end";
  /**
   * Whether the menu should automatically flip direction when space is limited.
   *
   * @default true
   */
  shouldFlip?: boolean;
  /**
   * Whether the Menu closes when a selection is made.
   *
   * @default true
   */
  closeOnSelect?: boolean;
}

export interface SpectrumMenuProps<T> extends AriaMenuProps<T>, StyleProps {}

export interface SpectrumActionMenuProps<T>
  extends
    CollectionBase<T>,
    Omit<SpectrumMenuTriggerProps, "children">,
    StyleProps,
    DOMProps,
    AriaLabelingProps {
  /** Whether the button is disabled. */
  isDisabled?: boolean;
  /**
   * Whether the button should be displayed with a [quiet
   * style](https://spectrum.adobe.com/page/action-button/#Quiet).
   */
  isQuiet?: boolean;
  /** Whether the element should receive focus on render. */
  autoFocus?: boolean;
  /** Handler that is called when an item is selected. */
  onAction?: (key: Key) => void;
}
