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
 * Derived from Adobe React Spectrum: packages/react-aria/src/steplist/useStepListItem.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { StepListState } from "@solid2-aria/stately/steplist/create-step-list-state";
import type { Key } from "@solid2-aria/types-shared";
import { merge, createMemo } from "solid-js";
import type { Accessor } from "solid-js";

import { createSelectableItem } from "../selection/create-selectable-item";
import type { HTMLAttributes } from "../types";
import { ariaValue } from "../utils/aria-value";

export interface AriaStepListItemProps {
  key: Key;
}

export interface StepListItemAria {
  /** Props for the step link element. */
  stepProps: HTMLAttributes;
  /** Props for the visually hidden element indicating the step state. */
  stepStateProps?: HTMLAttributes;
  /** Text content for the visually hidden message indicating the status of the step state. */
  stepStateText?: string;
}

export function createStepListItem<T>(
  props: AriaStepListItemProps,
  state: StepListState<T>,
  ref: Accessor<HTMLElement | null>
): StepListItemAria {
  const _result0 = props;
  const _result1 = state;
  const isDisabled = createMemo(() => !state.isSelectable(_result0.key));

  const _result2 = createSelectableItem({
    get isDisabled() {
      return isDisabled();
    },
    get key() {
      return _result0.key;
    },
    get ref() {
      return ref;
    },
    get selectionManager() {
      return _result1.selectionManager;
    },
  });

  const isSelected = createMemo(() => _result1.selectedKey === _result0.key);

  return {
    get stepProps() {
      return merge(_result2.itemProps, {
        get "aria-current"() {
          return ariaValue(ariaValue(isSelected() ? "step" : undefined));
        },
        get "aria-disabled"() {
          return ariaValue(ariaValue(isDisabled() ? true : undefined));
        },
        get role(): "link" {
          return "link";
        },
        get tabindex() {
          return isDisabled() ? undefined : 0;
        },
      });
    },
  };
}
