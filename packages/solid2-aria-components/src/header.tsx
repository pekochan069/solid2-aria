/*
 * Copyright 2022 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/Header.tsx.
 * Modified for Solid Aria: adapted components, contexts, refs, and reactive properties for Solid 2; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { HeaderNode } from "@solid2-aria/core/collections/base-collection";
import { createLeafComponent } from "@solid2-aria/core/collections/collection-builder";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { dynamic } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { untrack, createContext } from "solid-js";

import {
  assignRef,
  domElement,
  createContextProps,
  createRenderProps,
} from "./utils";
import type { Ref, ContextValue, SlotProps, RenderProps } from "./utils";

export interface HeaderProps
  extends
    SlotProps,
    Omit<
      JSX.HTMLAttributes<HTMLElement>,
      "ref" | "class" | "style" | "children" | "slot"
    >,
    RenderProps<object> {
  elementType?: keyof JSX.IntrinsicElements;
  ref?: Ref<HTMLElement>;
}

export const HeaderContext =
  createContext<ContextValue<HeaderProps, HTMLElement>>(null);

const HeaderComponent = createLeafComponent<HeaderProps, HTMLElement>(
  HeaderNode,
  (input: HeaderProps): JSX.Element => {
    const [props, , setRef] = createContextProps(
      input,
      untrack(() => input.ref),
      HeaderContext
    );

    const render = createRenderProps(
      mergeProps(props, { defaultClass: "solid2-aria-Header", values: {} })
    );

    const Element = dynamic(() => domElement(props.elementType ?? "header"));

    return (
      <Element
        {...filterDOMProps(props, { global: true, labelable: true })}
        {...render}
        class={render.class}
        ref={(element: HTMLElement) => {
          setRef(element);
        }}
        slot={props.slot ?? undefined}
      />
    );
  }
);

export function Header(props: HeaderProps): JSX.Element {
  return (
    <HeaderComponent
      {...props}
      ref={(element: HTMLElement) => {
        assignRef(
          untrack(() => props.ref),
          element
        );
      }}
    />
  );
}
