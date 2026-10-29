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
 * Derived from Adobe React Spectrum: packages/react-aria/src/separator/useSeparator.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  AriaLabelingProps,
  DOMProps,
  Orientation,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { merge, createMemo } from "solid-js";

import { filterDOMProps } from "../utils/filter-dom-props";

export interface SeparatorProps extends DOMProps, AriaLabelingProps {
  /**
   * The orientation of the separator.
   *
   * @default 'horizontal'
   */
  orientation?: Orientation;
  /** The HTML element type that will be used to render the separator. */
  elementType?: string;
}

export interface SeparatorAria {
  /** Props for the separator element. */
  separatorProps: DOMAttributes;
}

/**
 * Provides the accessibility implementation for a separator.
 * A separator is a visual divider between two groups of content,
 * e.g. groups of menu items or sections of a page.
 */
export function createSeparator(props: SeparatorProps): SeparatorAria {
  const domProps = createMemo(() => filterDOMProps(props, { labelable: true }));

  return {
    get separatorProps() {
      return props.elementType === "hr"
        ? domProps()
        : // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
          merge(domProps(), {
            "aria-orientation":
              props.orientation === "vertical"
                ? ("vertical" as const)
                : undefined,
            role: "separator" as const,
          });
      // oxlint-enable solid/reactivity
    },
  };
}
