/*
 * Copyright 2025 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/SelectionIndicator.tsx.
 * Modified for Solid Aria: adapted components, contexts, refs, and reactive properties for Solid 2; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { JSX } from "@solidjs/web";
import { untrack, createContext } from "solid-js";

import { SharedElement } from "./shared-element-transition";
import type { SharedElementPropsBase } from "./shared-element-transition";
import { createContextProps } from "./utils";
import type { ContextValue, SlotProps } from "./utils";

export interface SelectionIndicatorProps
  extends SharedElementPropsBase, SlotProps {
  isSelected?: boolean;
}

export const SelectionIndicatorContext = createContext<
  ContextValue<SelectionIndicatorProps, HTMLDivElement>
>({ isSelected: false });

export function SelectionIndicator(
  input: SelectionIndicatorProps
): JSX.Element {
  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    SelectionIndicatorContext
  );

  return (
    <SharedElement
      {...props}
      class={props.class ?? "solid2-aria-SelectionIndicator"}
      name="SelectionIndicator"
      isVisible={props.isSelected}
      ref={(element: HTMLDivElement) => {
        setRef(element);
      }}
    />
  );
}
