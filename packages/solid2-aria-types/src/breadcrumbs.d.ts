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
 * Derived from Adobe React Spectrum: packages/@react-types/breadcrumbs/src/index.d.ts.
 * Modified for Solid Aria: adapted type declarations, imports, and formatting for Solid.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  PressEvents,
  FocusableProps,
  LinkDOMProps,
  AriaLabelingProps,
  DOMProps,
  ItemProps,
  Key,
} from "@solid2-aria/types-shared";
import type { StyleProps } from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";

export interface BreadcrumbItemProps extends AriaLinkProps, LinkDOMProps {
  /** Whether the breadcrumb item represents the current page. */
  isCurrent?: boolean;
  /**
   * The type of current location the breadcrumb item represents, if `isCurrent` is true.
   *
   * @default 'page'
   */
  "aria-current"?:
    | "page"
    | "step"
    | "location"
    | "date"
    | "time"
    | boolean
    | "true"
    | "false";
  /** Whether the breadcrumb item is disabled. */
  isDisabled?: boolean;
  /** The contents of the breadcrumb item. */
  children: JSX.Element;
}

interface AriaLinkProps extends LinkProps, LinkDOMProps, AriaLabelingProps {
  /**
   * Indicates whether this element represents the current item within a container or set of related
   * elements.
   */
  "aria-current"?:
    | boolean
    | "true"
    | "false"
    | "page"
    | "step"
    | "location"
    | "date"
    | "time";
}

interface LinkProps extends PressEvents, FocusableProps {}

export interface AriaBreadcrumbItemProps extends BreadcrumbItemProps, DOMProps {
  /**
   * The HTML element used to render the breadcrumb link, e.g. 'a', or 'span'.
   *
   * @default 'a'
   */
  elementType?: string;
}

export interface SpectrumBreadcrumbsProps<T>
  extends AriaBreadcrumbsProps, StyleProps {
  /** The breadcrumb items. */
  children: JSX.Element | JSX.Element[];
  /** Whether the Breadcrumbs are disabled. */
  isDisabled?: boolean;
  /** Called when an item is acted upon (usually selection via press). */
  onAction?: (key: Key) => void;
  /**
   * Size of the Breadcrumbs including spacing and layout.
   *
   * @default 'L'
   */
  size?: "S" | "M" | "L";
  /** Whether to always show the root item if the items are collapsed. */
  showRoot?: boolean;
  /**
   * Whether to place the last Breadcrumb item onto a new line.
   */
  isMultiline?: boolean;
  /**
   * Whether to autoFocus the last Breadcrumb item when the Breadcrumbs render.
   */
  autoFocusCurrent?: boolean;
}

interface AriaBreadcrumbsProps extends DOMProps, AriaLabelingProps {}

export interface BreadcrumbsProps {}
