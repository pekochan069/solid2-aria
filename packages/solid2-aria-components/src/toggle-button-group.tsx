/*
 * Copyright 2024 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/ToggleButtonGroup.tsx.
 * Modified for Solid Aria: adapted components, contexts, refs, and reactive properties for Solid 2; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createToggleButtonGroup } from "@solid2-aria/core/button/create-toggle-button-group";
import type { AriaToggleButtonGroupProps } from "@solid2-aria/core/button/create-toggle-button-group";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { createToggleGroupState } from "@solid2-aria/stately/toggle/create-toggle-group-state";
import type { ToggleGroupState } from "@solid2-aria/stately/toggle/create-toggle-group-state";
import type { JSX } from "@solidjs/web";
import { merge, untrack, createContext } from "solid-js";

import { SharedElementTransition } from "./shared-element-transition";
import { dom, createContextProps, createRenderProps } from "./utils";
import type { Ref, ContextValue, SlotProps, RenderProps } from "./utils";

export interface ToggleButtonGroupRenderProps {
  orientation: "horizontal" | "vertical";
  isDisabled: boolean;
  state: ToggleGroupState;
}

export interface ToggleButtonGroupProps
  extends
    AriaToggleButtonGroupProps,
    SlotProps,
    RenderProps<ToggleButtonGroupRenderProps> {
  ref?: Ref<HTMLDivElement>;
}

export const ToggleButtonGroupContext =
  createContext<ContextValue<ToggleButtonGroupProps, HTMLDivElement>>(null);

export const ToggleGroupStateContext = createContext<ToggleGroupState | null>(
  null
);

export function ToggleButtonGroup(input: ToggleButtonGroupProps): JSX.Element {
  const [props, ref, setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    ToggleButtonGroupContext
  );

  const state = createToggleGroupState(props);
  const aria = createToggleButtonGroup(props, state, ref);

  const values: ToggleButtonGroupRenderProps = {
    get isDisabled() {
      return state.isDisabled;
    },
    get orientation() {
      return props.orientation ?? "horizontal";
    },
    state,
  };

  const render = createRenderProps(
    mergeProps(props, {
      defaultClass: "solid2-aria-ToggleButtonGroup",
      values,
    })
  );

  return (
    <dom.div
      {...mergeProps(
        filterDOMProps(props, { global: true }),
        merge(() => aria.groupProps ?? {}),
        render
      )}
      ref={(element: HTMLDivElement) => {
        setRef(element);
      }}
      slot={props.slot ?? undefined}
      data-disabled={state.isDisabled || undefined}
      data-orientation={values.orientation}
    >
      <ToggleGroupStateContext value={state}>
        <SharedElementTransition>{render.children}</SharedElementTransition>
      </ToggleGroupStateContext>
    </dom.div>
  );
}
