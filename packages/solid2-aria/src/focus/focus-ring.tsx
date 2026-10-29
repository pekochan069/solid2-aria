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
 * Derived from Adobe React Spectrum: packages/react-aria/src/focus/FocusRing.tsx.
 * Modified for Solid Aria: adapted components, imports, and reactive lifecycle for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";
import type { Element as SolidElement } from "solid-js";

import { ElementProps } from "../utils/element-props";
import type { ElementPropsChild } from "../utils/element-props";
import { createFocusRing } from "./create-focus-ring";

export interface FocusRingProps {
  children: ElementPropsChild<
    Omit<DOMAttributes, "class"> & { class?: JSX.ClassValue }
  >;
  focusClass?: string;
  focusRingClass?: string;
  within?: boolean;
  isTextInput?: boolean;
  autoFocus?: boolean;
}

export function FocusRing(props: FocusRingProps): SolidElement {
  const focus = createFocusRing(props);

  const value = {
    ...focus.focusProps,
    get class() {
      return {
        [props.focusClass ?? ""]: focus.isFocused,
        [props.focusRingClass ?? ""]: focus.isFocusVisible,
      };
    },
  };

  return <ElementProps value={value}>{props.children}</ElementProps>;
}
