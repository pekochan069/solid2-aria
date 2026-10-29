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
 * Derived from Adobe React Spectrum: packages/@react-types/tooltip/src/index.d.ts.
 * Modified for Solid Aria: adapted type declarations, imports, and formatting for Solid.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { DOMProps, AriaLabelingProps } from "@solid2-aria/types-shared";
import type { StyleProps } from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";

export interface TooltipTriggerProps extends OverlayTriggerProps {
  /**
   * Whether the tooltip should be disabled, independent from the trigger.
   */
  isDisabled?: boolean;

  /**
   * The delay time for the tooltip to show up. [See
   * guidelines](https://spectrum.adobe.com/web/rsp/components/tooltip#behaviors).
   *
   * @default 1500
   */
  delay?: number;

  /**
   * The delay time for the tooltip to close. [See
   * guidelines](https://spectrum.adobe.com/web/rsp/components/tooltip#behaviors).
   *
   * @default 500
   */
  closeDelay?: number;

  /**
   * By default, opens for both focus and hover. Can be made to open only for focus.
   *
   * @default 'hover'
   */
  trigger?: "hover" | "focus";

  /**
   * Whether the tooltip should close when the trigger is pressed.
   *
   * @default true
   */
  shouldCloseOnPress?: boolean;
}

interface OverlayTriggerProps {
  /** Whether the overlay is open by default (controlled). */
  isOpen?: boolean;
  /** Whether the overlay is open by default (uncontrolled). */
  defaultOpen?: boolean;
  /** Handler that is called when the overlay's open state changes. */
  onOpenChange?: (isOpen: boolean) => void;
}

export interface TooltipProps {
  isOpen?: boolean;
}

export interface AriaTooltipProps
  extends TooltipProps, DOMProps, AriaLabelingProps {}

export interface SpectrumTooltipTriggerProps
  extends Omit<TooltipTriggerProps, "closeDelay">, PositionProps {
  children: [JSX.Element, JSX.Element];

  /**
   * The additional offset applied along the main axis between the element and its
   * anchor element.
   *
   * @default 7
   */
  offset?: number;
  /**
   * The placement of the tooltip with respect to the trigger.
   *
   * @default 'top'
   */
  placement?: Placement;
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

export interface SpectrumTooltipProps extends AriaTooltipProps, StyleProps {
  /**
   * The [visual style](https://spectrum.adobe.com/page/tooltip/#Semantic-variants) of the Tooltip.
   */
  variant?: "neutral" | "positive" | "negative" | "info";

  /**
   * The placement of the element with respect to its anchor element.
   *
   * @default 'top'
   */
  placement?: "start" | "end" | "right" | "left" | "top" | "bottom";

  /**
   * Whether the element is rendered.
   */
  showIcon?: boolean;

  children: JSX.Element;
}
