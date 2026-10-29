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
 * Derived from Adobe React Spectrum: packages/@react-types/link/src/index.d.ts.
 * Modified for Solid Aria: adapted type declarations, imports, and formatting for Solid.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  PressEvents,
  FocusableProps,
  LinkDOMProps,
  AriaLabelingProps,
} from "@solid2-aria/types-shared";
import type { StyleProps } from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";

export interface LinkProps extends PressEvents, FocusableProps {}

export interface AriaLinkProps
  extends LinkProps, LinkDOMProps, AriaLabelingProps {
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

export interface SpectrumLinkProps
  extends Omit<AriaLinkProps, "onClick">, StyleProps {
  /** The content to display in the link. */
  children: JSX.Element;
  /**
   * The [visual style](https://spectrum.adobe.com/page/link/#Options) of the link.
   *
   * @default 'primary'
   */
  variant?: "primary" | "secondary" | "overBackground";
  /** Whether the link should be displayed with a quiet style. */
  isQuiet?: boolean;
}
