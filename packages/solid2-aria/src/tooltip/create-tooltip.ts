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
 * Derived from Adobe React Spectrum: packages/react-aria/src/tooltip/useTooltip.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { TooltipTriggerState } from "@solid2-aria/stately/tooltip/create-tooltip-trigger-state";
import type { AriaLabelingProps, DOMProps } from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { createMemo } from "solid-js";

import { createHover } from "../interactions/create-hover";
import { filterDOMProps } from "../utils/filter-dom-props";
import { mergeProps } from "../utils/merge-props";

export interface TooltipProps {
  isOpen?: boolean;
}

export interface AriaTooltipProps
  extends TooltipProps, DOMProps, AriaLabelingProps {}

export interface TooltipAria {
  /**
   * Props for the tooltip element.
   */
  tooltipProps: DOMAttributes;
}

/**
 * Provides the accessibility implementation for a Tooltip component.
 */
export function createTooltip(
  props: AriaTooltipProps,
  state?: TooltipTriggerState
): TooltipAria {
  const domProps = createMemo(() => filterDOMProps(props, { labelable: true }));

  const _result0 = createHover({
    onHoverEnd: () => state?.close(),
    onHoverStart: () => state?.open(true),
  });

  return {
    get tooltipProps() {
      return mergeProps(domProps(), _result0.hoverProps, {
        role: "tooltip",
      });
    },
  };
}
