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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/ProgressBar.tsx.
 * Modified for Solid Aria: adapted components, contexts, refs, and reactive properties for Solid 2; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createProgressBar } from "@solid2-aria/core/progress/create-progress-bar";
import type { AriaProgressBarProps } from "@solid2-aria/core/progress/create-progress-bar";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { isTruthy } from "@solid2-aria/core/utils/truthy";
import type { JSX } from "@solidjs/web";
import { untrack, merge, createContext } from "solid-js";

import { LabelContext } from "./label";
import {
  dom,
  createContextProps,
  createRenderProps,
  createSlot,
} from "./utils";
import type { Ref, ContextValue, SlotProps, RenderProps } from "./utils";

export interface ProgressBarRenderProps {
  percentage: number;
  valueText: string | undefined;
  isIndeterminate: boolean;
}

export interface ProgressBarProps
  extends
    Omit<AriaProgressBarProps, "label">,
    SlotProps,
    RenderProps<ProgressBarRenderProps> {
  ref?: Ref<HTMLDivElement>;
}

export const ProgressBarContext =
  createContext<ContextValue<ProgressBarProps, HTMLDivElement>>(null);

export function ProgressBar(input: ProgressBarProps): JSX.Element {
  const [props, , setRef] = createContextProps(
    input,
    untrack(() => input.ref),
    ProgressBarContext
  );

  const [registerLabel, label] = createSlot(
    () => !isTruthy(props["aria-label"]) && !isTruthy(props["aria-labelledby"])
  );

  const aria = createProgressBar(
    mergeProps(props, {
      get label() {
        return label();
      },
    })
  );

  const values: ProgressBarRenderProps = {
    get isIndeterminate() {
      return props.isIndeterminate === true;
    },
    get percentage() {
      const min = props.minValue ?? 0;
      const max = props.maxValue ?? 100;

      return max === min
        ? 0
        : ((Math.min(max, Math.max(min, props.value ?? 0)) - min) /
            (max - min)) *
            100;
    },
    get valueText() {
      const text = aria.progressBarProps["aria-valuetext"];

      return typeof text === "string" ? text : undefined;
    },
  };

  const labelProps = mergeProps(
    merge(() => aria.labelProps),
    { elementType: "span" as const, registerSlot: registerLabel }
  );

  const render = createRenderProps(
    mergeProps(props, { defaultClass: "solid2-aria-ProgressBar", values })
  );

  return (
    <dom.div
      {...mergeProps(
        filterDOMProps(props, { global: true }),
        merge(() => aria.progressBarProps ?? {}),
        render
      )}
      ref={(element: HTMLDivElement) => {
        setRef(element);
      }}
      slot={props.slot ?? undefined}
    >
      <LabelContext value={labelProps}>{render.children}</LabelContext>
    </dom.div>
  );
}
