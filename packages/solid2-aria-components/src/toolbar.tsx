/*
 * Copyright 2023 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/Toolbar.tsx.
 * Modified for Solid Aria: adapted components, contexts, refs, and reactive properties for Solid 2; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createToolbar } from "@solid2-aria/core/toolbar/create-toolbar";
import type { AriaToolbarProps } from "@solid2-aria/core/toolbar/create-toolbar";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import type { JSX } from "@solidjs/web";
import { merge, untrack, createContext } from "solid-js";

import { dom, createContextProps, createRenderProps } from "./utils";
import type { ContextValue, Ref, RenderProps, SlotProps } from "./utils";

export interface ToolbarRenderProps {
  orientation: "horizontal" | "vertical";
}

export interface ToolbarProps
  extends AriaToolbarProps, SlotProps, RenderProps<ToolbarRenderProps> {
  ref?: Ref<HTMLDivElement>;
}

export const ToolbarContext = createContext<
  ContextValue<ToolbarProps, HTMLDivElement>
>({});

export function Toolbar(input: ToolbarProps): JSX.Element {
  const [props, ref, setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    ToolbarContext
  );

  const aria = createToolbar(props, ref);

  const values: ToolbarRenderProps = {
    get orientation() {
      return props.orientation ?? "horizontal";
    },
  };

  const render = createRenderProps(
    mergeProps(props, { defaultClass: "solid2-aria-Toolbar", values })
  );

  return (
    <dom.div
      {...mergeProps(
        filterDOMProps(props, { global: true }),
        merge(() => aria.toolbarProps ?? {}),
        render
      )}
      ref={(element: HTMLDivElement) => {
        setRef(element);
      }}
      slot={props.slot ?? undefined}
      data-orientation={values.orientation}
    />
  );
}
